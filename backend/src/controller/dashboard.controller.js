/** @format */

import mongoose from "mongoose";
import { Video } from "../model/video.model.js";
import { Subscription } from "../model/subscription.model.js";
import { Like } from "../model/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const userVideos = await Video.find({ owner: userId });
  const totalVideos = userVideos.length;
  const totalViews = userVideos.reduce((acc, video) => acc + (video.views || 0), 0);

  const totalSubscribers = await Subscription.countDocuments({
    channel: userId,
  });

  const totalLikes = await Like.countDocuments({
    video: { $in: userVideos.map((v) => v._id) },
  });

  const stats = {
    totalSubscribers,
    totalVideos,
    totalViews,
    totalLikes,
  };
  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Channel stats fetched successfully"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const channelVideo = await Video.find({ owner: userId });

  return res
    .status(200)
    .json(new ApiResponse(200, channelVideo, "Channel videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
