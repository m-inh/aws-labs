# Managing Amazon S3 access with VPC endpoints and S3 Access Points

- https://aws.amazon.com/blogs/storage/managing-amazon-s3-access-with-vpc-endpoints-and-s3-access-points/

Note:
- Trong cùng 1 AWS account, user hoặc role chỉ cần IAM policy cấp quyền là có thể `GetObject`, ... trên S3 bucket.
- Bucket policy chủ yếu dùng cho cross-account access, public access, additional restriction.
- Không thấy tác dụng của S3 Access Point policy trong pattern này. Không thể giới hạn quyền access vào thư mục cụ thể bằng S3 Access Point policy.
- S3 Access Point policy có hiệu lực chỉ khi bucket policy cũng cho phép access: [link](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-points-policies.html?icmpid=docs_amazons3_console#access-points-delegating-control)

```
Permissions granted in an access point policy are effective only if the underlying bucket also allows the same access. You can accomplish this in two ways:

(Recommended) Delegate access control from the bucket to the access point, as described in Delegating access control to access points.

Add the same permissions contained in the access point policy to the underlying bucket's policy. The Example 1 access point policy example demonstrates how to modify the underlying bucket policy to allow the necessary access.
```

Bucket policy that delegates access control to access points:
```json
{
    "Version":"2012-10-17",		 	 	 
    "Statement" : [
    {
        "Effect": "Allow",
        "Principal" : { "AWS": "*" },
        "Action" : "*",
        "Resource" : [ "arn:aws:s3:::amzn-s3-demo-bucket", "arn:aws:s3:::amzn-s3-demo-bucket/*"],
        "Condition": {
            "StringEquals" : { "s3:DataAccessPointAccount" : "111122223333" }
        }
    }]
}
```