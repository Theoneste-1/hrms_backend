import jwt, { type SignOptions } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Define StringValue as a union of valid expiration strings
type StringValue = `${number}${"h" | "m" | "d" | "s"}`; // e.g., "60m", "7d", "1h"

interface JwtPayload {
  userId: string;
  companyId: string;
  email: string;
  role: string;
}

export class JwtService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpires: StringValue; 
  private readonly refreshTokenExpires: StringValue; 

  constructor() {
    this.accessTokenSecret = process.env["ACCESS_TOKEN_SECRET"] || "default_access_token_secret";
    this.refreshTokenSecret = process.env["REFRESH_TOKEN_SECRET"] || "default_refresh_token_secret";
    this.accessTokenExpires = (process.env["ACCESS_TOKEN_EXPIRES"] || "60m") as StringValue;
    this.refreshTokenExpires = (process.env["REFRESH_TOKEN_EXPIRES"] || "7d") as StringValue; 

    if (!process.env["ACCESS_TOKEN_SECRET"] || !process.env["REFRESH_TOKEN_SECRET"]) {
      console.warn("Default values being used for JWT secrets.");
    }
  }

  generateAccessToken(payload: JwtPayload): string {
    const options: SignOptions = { expiresIn: this.accessTokenExpires };
    return jwt.sign(payload, this.accessTokenSecret, options);
  }

  generateRefreshToken(payload: JwtPayload): string {
    const options: SignOptions = { expiresIn: this.refreshTokenExpires };
    return jwt.sign(payload, this.refreshTokenSecret, options);
  }

  verifyAccessToken(token: string): JwtPayload | null {
    try {
      return jwt.verify(token, this.accessTokenSecret) as JwtPayload;
    } catch (error) {
      throw error;
    }
  }

  verifyRefreshToken(token: string): JwtPayload | null {
    try {
      return jwt.verify(token, this.refreshTokenSecret) as JwtPayload;
    } catch (error) {
      throw error;
    }
  }

  decodeToken(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload;
    } catch (error) {
      throw error;
    }
  }
}

export const jwtService = new JwtService();