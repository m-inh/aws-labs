# MD5 to validate integrity of the key

KEY_BASE64=$(echo -n "my-secret-key" | base64)
KEY_MD5=$(echo -n "my-secret-key" | openssl md5 -binary | base64)

curl -X PUT "https://bucket.s3.amazonaws.com/file.txt" \
  -H "x-amz-server-side-encryption-customer-algorithm: AES256" \
  -H "x-amz-server-side-encryption-customer-key: $KEY_BASE64" \
  -H "x-amz-server-side-encryption-customer-key-MD5: $KEY_MD5" \
  --data "hello world"