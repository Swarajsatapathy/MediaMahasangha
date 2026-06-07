import dotenv from "dotenv";
import { S3Client } from "@aws-sdk/client-s3";

dotenv.config();

const region =
  process.env.AWS_BUCKET_REGION?.trim() ||
  process.env.AWS_REGION?.trim();

const bucket = process.env.AWS_BUCKET_NAME?.trim();

console.log("S3 ENV CHECK:", {
  region,
  bucket,
});

if (!region || !bucket) {
  throw new Error("Missing AWS S3 environment variables");
}

const s3 = new S3Client({
  region,
});

export default s3;