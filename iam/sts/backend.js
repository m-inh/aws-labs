/**
 * npm install express jsonwebtoken jwks-rsa @aws-sdk/client-sts @aws-sdk/client-s3 axios
 */

import express from "express";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { STSClient, AssumeRoleWithWebIdentityCommand } from "@aws-sdk/client-sts";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const app = express();
app.use(express.json());

const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID";
const ROLE_ARN = "arn:aws:iam::123456789012:role/WebIdentityRole";
const BUCKET_NAME = "your-bucket";

// JWKS client for Google
const client = jwksClient({
  jwksUri: "https://www.googleapis.com/oauth2/v3/certs"
});

// Get signing key
function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

// Verify Google ID token
function verifyGoogleToken(idToken) {
  return new Promise((resolve, reject) => {
    jwt.verify(
      idToken,
      getKey,
      {
        audience: GOOGLE_CLIENT_ID,
        issuer: ["https://accounts.google.com", "accounts.google.com"]
      },
      (err, decoded) => {
        if (err) return reject(err);
        resolve(decoded);
      }
    );
  });
}

// Main endpoint
app.post("/login", async (req, res) => {
  try {
    const { idToken } = req.body;

    // 1. Verify token
    const decoded = await verifyGoogleToken(idToken);

    // 2. Call STS
    const stsClient = new STSClient({ region: "us-east-1" });

    const command = new AssumeRoleWithWebIdentityCommand({
      RoleArn: ROLE_ARN,
      RoleSessionName: "google-user-session",
      WebIdentityToken: idToken,
      DurationSeconds: 3600
    });

    const response = await stsClient.send(command);

    const creds = response.Credentials;

    // 3. Use temporary creds to access S3
    const s3 = new S3Client({
      region: "us-east-1",
      credentials: {
        accessKeyId: creds.AccessKeyId,
        secretAccessKey: creds.SecretAccessKey,
        sessionToken: creds.SessionToken
      }
    });

    const data = await s3.send(
      new ListObjectsV2Command({
        Bucket: BUCKET_NAME
      })
    );

    res.json({
      user: decoded.email,
      s3Objects: data.Contents || []
    });

  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Unauthorized" });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});