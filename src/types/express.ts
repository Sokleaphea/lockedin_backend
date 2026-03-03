/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: string;
      email?: string;
      iat?: number;
      exp?: number;
    };
  }
}
