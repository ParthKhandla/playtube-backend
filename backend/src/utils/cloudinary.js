/** @format */

import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (buffer, filenameOrOptions) => {
  let filename = "upload_" + Date.now();
  let options = {};

  if (typeof filenameOrOptions === "string") {
    filename = filenameOrOptions;
  } else if (filenameOrOptions && typeof filenameOrOptions === "object") {
    options = filenameOrOptions;
  }

  // Local fallback if Cloudinary is not configured
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    console.log(
      "Cloudinary credentials not set. Falling back to local storage in public/temp..."
    );
    const publicDir = path.resolve("public");
    const tempDir = path.join(publicDir, "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const fileExt = options.resource_type === "video" ? ".mp4" : ".png";
    const cleanFilename = `local_${Date.now()}_${Math.round(
      Math.random() * 1e9
    )}${fileExt}`;
    const filePath = path.join(tempDir, cleanFilename);

    fs.writeFileSync(filePath, buffer);

    const localUrl = `/temp/${cleanFilename}`;
    console.log(`Saved file locally: ${localUrl}`);

    return {
      url: localUrl,
      secure_url: localUrl,
      duration: 10, // dummy duration in seconds
    };
  }

  return new Promise((resolve, reject) => {
    const publicId =
      typeof filename === "string" && filename.includes(".")
        ? filename.split(".")[0]
        : `upload_${Date.now()}`; // fallback id if filename invalid

    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        folder: "youtube_video",
        public_id: publicId,
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(buffer);
  });
};
