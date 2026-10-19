/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  outputFileTracingIncludes: { '/*': ['./library/**/*'] },
  // published sites live at /sites/<slug>/ and use relative asset links, so the trailing slash must survive
  skipTrailingSlashRedirect: true,
};
export default nextConfig;
