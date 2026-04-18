import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import dbConnect from "./mongodb";
import { User, IUser } from "@/models";
import { env } from "./env";

const JWT_SECRET = env.jwtSecret || "your-secret-key";

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthResult {
  user: IUser | null;
  error: string | null;
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser(
  request: NextRequest,
): Promise<AuthResult> {
  try {
    await dbConnect();

    const token = request.cookies.get("token")?.value;

    if (!token) {
      return { user: null, error: "No token provided" };
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return { user: null, error: "Invalid token" };
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return { user: null, error: "User not found or inactive" };
    }

    return { user, error: null };
  } catch (error) {
    return { user: null, error: "Authentication failed" };
  }
}

export function generateToken(
  userId: string,
  email: string,
  role: string,
): string {
  return jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: "7d" });
}
