import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User";

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || "12");

export function generateToken(user: User): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    secret,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d"
    } as jwt.SignOptions
  );
}
export function setTokenCookie(res: import("express").Response, token: string): void {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}


