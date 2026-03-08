import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();

// Configured S3 details from environment variables
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  }
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || "uprising-cofounder-bucket";

/**
 * Uploads a base64 encoded image to S3.
 * Returns the object URL.
 * If AWS credentials are not configured, it acts as a pass-through and returns the base64 string.
 */
export const uploadImageToS3 = async (base64Image: string): Promise<string> => {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.warn("AWS S3 is not configured. Falling back to storing base64 image in database.");
    return base64Image;
  }

  try {
    // Extract base64 part and mime type
    const matches = base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error("Invalid base64 string format");
    }

    const type = matches[1];
    const buffer = Buffer.from(matches[2], "base64");
    const extension = type.split("/")[1] || "png";
    const filename = `images/${uuidv4()}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: buffer,
      ContentType: type,
      // Note: Object ACLs must be supported by the bucket configuration if applying "public-read"
      // ACL: "public-read" 
    });

    await s3Client.send(command);

    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${filename}`;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error("Failed to upload image.");
  }
};
