const S3 = require("@aws-sdk/client-s3");
const getSignedUrl = require("@aws-sdk/s3-request-presigner").getSignedUrl;
const { v4: uuidv4 } = require('uuid');

const s3Client = new S3.S3Client({
    region: process.env.AWS_REGION || "ap-northeast-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const generatePresignedUrl = async (bucketName, objectKey, expiresIn) => {
    const command = new S3.PutObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        // Optional: Add conditions the client must meet, e.g., ContentType
        ContentType: "image/jpg",
        // ContentLength: 110985,
        Conditions: [
            ["content-length-range", 1, 100], // ≤ 1MB
        ],

    });

    const signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: expiresIn || 3600, // URL expiration time in seconds (default 1 hour)
    });

    return signedUrl;
};

async function main() {
    const url = await generatePresignedUrl("okmen-website-v1", `upload/${uuidv4()}.jpg`);
    console.log("Presigned URL:", url);
}

main();

// SIGNED_URL='https://okmen-website-v1.s3.ap-northeast-1.amazonaws.com/upload/okmen.html?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA5EDLHFRIOZWRR2NK%2F20260131%2Fap-northeast-1%2Fs3%2Faws4_request&X-Amz-Date=20260131T100617Z&X-Amz-Expires=3600&X-Amz-Signature=6ce375aaf88f8369c054b976d196cb381627e96e09594c5c696ed4597ed4653f&X-Amz-SignedHeaders=host&x-amz-checksum-crc32=AAAAAA%3D%3D&x-amz-sdk-checksum-algorithm=CRC32&x-id=PutObject'
// SIGNED_URL='https://okmen-website-v1.s3.ap-northeast-1.amazonaws.com/upload/98cf0ec8-941b-4a80-9ed7-7766b28c0d5c.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA5EDLHFRIOZWRR2NK%2F20260131%2Fap-northeast-1%2Fs3%2Faws4_request&X-Amz-Date=20260131T130458Z&X-Amz-Expires=3600&X-Amz-Signature=37149c05c86670bb0a54a4c88adf43d0edda18291578800e4b76b27dbd556ceb&X-Amz-SignedHeaders=host&x-amz-checksum-crc32=AAAAAA%3D%3D&x-amz-sdk-checksum-algorithm=CRC32&x-id=PutObject'

// curl -X PUT --data-binary '@okmen.html' "$SIGNED_URL"