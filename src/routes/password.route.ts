import express from "express";
import { sendOTP, resetPasswordWithOTP } from "../controllers/password.controller";

const router = express.Router();

router.post("/forgot", sendOTP);
router.post("/reset", resetPasswordWithOTP);

export default router;