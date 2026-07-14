import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === "development", // Disable in development to prevent caching loops
});

export default withPWA({
  // Your normal nextConfig settings...
});
