import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
      } | JwtPayload;
      file?: Express.Multer.File;
      files?: Express.Multer.File[];
    }
  }
}
export interface MulterRequest extends Request {
  file: Express.Multer.File;
}
export {};
