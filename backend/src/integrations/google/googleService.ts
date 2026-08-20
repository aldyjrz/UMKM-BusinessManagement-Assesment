import { OAuth2Client } from "google-auth-library";
import logger from "../../utils/logger.js";

class GoogleService {
  private oauth2Client: OAuth2Client;

  constructor() {
    this.oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL
    );
  }

  getAuthUrl(): string {
    const scopes = [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile"
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      prompt: "consent"
    });
  }

  async verifyIdToken(idToken: string): Promise<{ google_id: string; email: string; name: string; avatar: string; email_verified: boolean } | null> {
    try {
      const ticket = await this.oauth2Client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();
      if (!payload) {
        return null;
      }

      return {
        google_id: payload.sub,
        email: payload.email || "",
        name: payload.name || "",
        avatar: payload.picture || "",
        email_verified: payload.email_verified || false
      };
    } catch (error) {
      logger.error("Google token verification failed", { error: (error as Error).message });
      return null;
    }
  }

  async getTokens(code: string): Promise<any> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      return tokens;
    } catch (error) {
      logger.error("Google token exchange failed", { error: (error as Error).message });
      throw error;
    }
  }

  async getUserInfo(accessToken: string): Promise<any> {
    try {
      const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo?access_token=" + accessToken);
      const data = await response.json();
      return data;
    } catch (error) {
      logger.error("Failed to get Google user info", { error: (error as Error).message });
      throw error;
    }
  }
}

export default new GoogleService();


