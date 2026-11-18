/** @format */

import mongoose from "mongoose";
import { Like } from "../model/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Toggle like on a video
const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  if (!existingLike) {
    await Like.create({
      video: videoId,
      likedBy: req.user._id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { isLiked: true, liked: true }, "Video liked successfully"));
  } else {
    await Like.deleteMany({
      video: videoId,
      likedBy: req.user._id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { isLiked: false, liked: false }, "Video unliked successfully"));
  }
});

// Toggle like on a comment
const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (!existingLike) {
    await Like.create({
      comment: commentId,
      likedBy: req.user._id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { isLiked: true, liked: true }, "Comment liked successfully"));
  } else {
    await Like.deleteMany({
      comment: commentId,
      likedBy: req.user._id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { isLiked: false, liked: false }, "Comment unliked successfully"));
  }
});

// Toggle like on a tweet
const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  const existingLike = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  if (!existingLike) {
    await Like.create({
      tweet: tweetId,
      likedBy: req.user._id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { isLiked: true, liked: true }, "Tweet liked successfully"));
  } else {
    await Like.deleteMany({
      tweet: tweetId,
      likedBy: req.user._id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { isLiked: false, liked: false }, "Tweet unliked successfully"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const likedVideos = await Like.find({
    likedBy: userId,
    video: { $exists: true, $ne: null },
  })
    .populate({
      path: "video",
      populate: {
        path: "owner",
        select: "fullname username avatar",
      },
    })
    .select("-_id video");

  // Filter out any populated videos that might have been deleted from the DB
  const validLikedVideos = likedVideos.filter((item) => item.video !== null);

  return res
    .status(200)
    .json(
      new ApiResponse(200, validLikedVideos, "Fetched liked videos successfully")
    );
});

const checkIfVideoLiked = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user?._id;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const like = await Like.findOne({
    likedBy: userId,
    video: videoId,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { isLiked: !!like, liked: !!like },
      "Video like status fetched"
    )
  );
});

const getVideoLikesCount = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const likesCount = await Like.countDocuments({ video: videoId });

  return res.status(200).json(
    new ApiResponse(200, { likesCount }, "Video likes count fetched")
  );
});

const checkIfCommentLiked = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user?._id;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const like = await Like.findOne({
    likedBy: userId,
    comment: commentId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { isLiked: !!like, liked: !!like }, "Comment like status fetched"));
});

const checkIfTweetLiked = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user?._id;

  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  const like = await Like.findOne({
    likedBy: userId,
    tweet: tweetId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { isLiked: !!like, liked: !!like }, "Tweet like status fetched"));
});

const getCommentLikesCount = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const likesCount = await Like.countDocuments({ comment: commentId });

  return res
    .status(200)
    .json(new ApiResponse(200, { likesCount }, "Comment likes count fetched"));
});

const getTweetLikesCount = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  const likesCount = await Like.countDocuments({ tweet: tweetId });

  return res
    .status(200)
    .json(new ApiResponse(200, { likesCount }, "Tweet likes count fetched"));
});

export { 
  toggleCommentLike, 
  toggleTweetLike, 
  toggleVideoLike, 
  getLikedVideos,  
  checkIfVideoLiked,
  checkIfCommentLiked,
  checkIfTweetLiked,
  getVideoLikesCount,
  getCommentLikesCount,
  getTweetLikesCount
};
