export default {
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  region: 'auto',
  bucket: process.env.R2_BUCKET_NAME,
  publicUrl: `https://${process.env.R2_PUBLIC_DOMAIN}`,
}
