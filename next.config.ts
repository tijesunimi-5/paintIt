import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  // skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig = {
  // 🎯 THE FIX: Force silence the compiler gate by adding an empty turbopack configuration layer
  turbopack: {},

  // Your other standard parameters like images, redirects, etc.
};

export default withPWA(nextConfig);
