import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} from "../controllers/follow.controller";

const router = Router();

router.use(authMiddleware);

router.post("/", followUser);
router.delete("/:targetUserId", unfollowUser);
router.get("/followers", getFollowers);
router.get("/following", getFollowing);

export default router;
