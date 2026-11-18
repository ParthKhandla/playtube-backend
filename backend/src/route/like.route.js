/** @format */

import { Router } from "express";
import {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos,
  checkIfVideoLiked,
  checkIfCommentLiked,
  checkIfTweetLiked,
  getVideoLikesCount,
  getCommentLikesCount,
  getTweetLikesCount,
} from "../controller/like.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

// Toggle likes
router.route("/toggle/v/:videoId").post(toggleVideoLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/toggle/t/:tweetId").post(toggleTweetLike);

// Fetch user's liked videos
router.route("/videos").get(getLikedVideos);

// Check if current user liked
router.route("/check/v/:videoId").get(checkIfVideoLiked);
router.route("/check/c/:commentId").get(checkIfCommentLiked);
router.route("/check/t/:tweetId").get(checkIfTweetLiked);

// Likes count
router.route("/count/v/:videoId").get(getVideoLikesCount);
router.route("/count/c/:commentId").get(getCommentLikesCount);
router.route("/count/t/:tweetId").get(getTweetLikesCount);

export default router;
