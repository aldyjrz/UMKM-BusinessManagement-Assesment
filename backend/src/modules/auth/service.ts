import User, { UserRole } from "../../models/User.js";
import OAuthAccount from "../../models/OAuthAccount.js";
import Customer from "../../models/Customer.js";
import googleService from "../../integrations/google/googleService.js";
import { generateToken, hashPassword, comparePassword } from "../../config/auth.js";
import logger from "../../utils/logger.js";

export async function handleGoogleLogin(): Promise<string> {
  const url = googleService.getAuthUrl();
  logger.info("Google OAuth redirect initiated");
  return url;
}
export async function handleGoogleCallback(
  code: string
): Promise<{ user: Partial<User>; token: string }> {
  try {
    // 1. Tukarkan authorization code dengan Google tokens
    const tokens = await googleService.getTokens(code);
    const accessToken = tokens.access_token;

    if (!accessToken) {
      throw new Error("Google did not return access token");
    }

    // 2. Ambil profile Google
    const userInfo = await googleService.getUserInfo(accessToken);

    if (!userInfo || !userInfo.email) {
      throw new Error("Failed to get user info from Google");
    }

    const googleId = userInfo.id;
    const email = userInfo.email;
    const name = userInfo.name || email.split("@")[0];
    const avatar = userInfo.picture || null;

    // 3. Cari user berdasarkan Google ID
    let user = await User.findOne({
      where: { google_id: googleId }
    });

    if (user) {
      // User Google sudah ada
      await user.update({
        name,
        avatar,
        email
      });

      logger.info("Existing user logged in via Google OAuth", {
        userId: user.id,
        email
      });
    } else {
      // 4. Kalau belum ada berdasarkan Google ID,
      // cek apakah email sudah digunakan oleh akun lokal
      user = await User.findOne({
        where: { email }
      });

      if (user) {
        // Hubungkan akun existing dengan Google
        await user.update({
          google_id: googleId,
          name,
          avatar
        });

        logger.info("Existing account linked to Google OAuth", {
          userId: user.id,
          email
        });
      } else {
        // 5. Buat user baru
        user = await User.create({
          google_id: googleId,
          email,
          name,
          avatar,
          role: UserRole.CUSTOMER
        });

        logger.info("New user created via Google OAuth", {
          userId: user.id,
          email
        });
      }

      // 6. Simpan/update OAuth account
      await OAuthAccount.findOrCreate({
        where: {
          provider: "google",
          provider_id: googleId
        },
        defaults: {
          user_id: user.id,
          provider: "google",
          provider_id: googleId,
          access_token: accessToken,
          refresh_token: tokens.refresh_token || null,
          expires_at: tokens.expiry_date
            ? new Date(tokens.expiry_date)
            : null
        }
      });
    }

    // 7. Pastikan Customer tersedia
    await Customer.findOrCreate({
      where: {
        email,
        type: "REGISTERED"
      },
      defaults: {
        user_id: user.id,
        name,
        email,
        phone: userInfo.phone || "",
        address: "",
        city: "",
        postal_code: "",
        type: "REGISTERED"
      }
    });

    // 8. Generate JWT aplikasi
    const token = generateToken(user);

    logger.info("Google OAuth login successful", {
      userId: user.id,
      email
    });

    return {
      user: {
        id: user.id,
        email,
        name: user.name,
        role: user.role,
        avatar: user.avatar
      },
      token
    };
  } catch (error) {
    logger.error("Google OAuth callback error", {
      error: error instanceof Error ? error.message : error
    });

    throw error;
  }
}

export async function handleLogout(): Promise<{ success: boolean }> {
  logger.info("Logout requested");
  return { success: true };
}

export async function getMe(userId: number): Promise<Partial<User> | null> {
  const user = await User.findByPk(userId, {
    attributes: ["id", "email", "name", "role", "avatar", "is_active"]
  });

  if (!user) return null;
  return user.toJSON() as any;
}

export async function registerLocal(name: string, email: string, password: string, phone: string): Promise<{ user: Partial<User>; token: string }> {
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new Error("Email already registered");
  }

  const hashedPassword = await hashPassword(password);
  const user = await User.create({
    email,
    name,
    password: hashedPassword,
    role: UserRole.CUSTOMER
  });

  await Customer.create({
    user_id: user.id,
    name: user.name,
    email: user.email,
    phone,
    address: "",
    city: "",
    postal_code: "",
    type: "REGISTERED"
  });

  const token = generateToken(user);
  logger.info("Local registration successful", { userId: user.id, email: user.email });

  return {
    user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar },
    token
  };
}

export async function loginLocal(email: string, password: string): Promise<{ user: Partial<User>; token: string }> {
  const user = await User.findOne({ where: { email } });
  if (!user || !user.password) {
    throw new Error("Invalid email or password");
  }

  const valid = await comparePassword(password, user.password);
  if (!valid) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken(user);

  return {
    user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar },
    token
  };
}

const authService = {
  handleGoogleLogin,
  handleGoogleCallback,
  handleLogout,
  getMe,
  registerLocal,
  loginLocal
};

export default authService;





