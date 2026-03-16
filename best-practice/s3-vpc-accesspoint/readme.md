# Managing Amazon S3 access with VPC endpoints and S3 Access Points

- https://aws.amazon.com/blogs/storage/managing-amazon-s3-access-with-vpc-endpoints-and-s3-access-points/

Note:
- Trong cùng 1 AWS account, user hoặc role chỉ cần IAM policy cấp quyền là có thể `GetObject`, ... trên S3 bucket.
- Bucket policy chủ yếu dùng cho cross-account access, public access, additional restriction.
- Chưa rõ cách sử dụng của S3 Access Point policy.