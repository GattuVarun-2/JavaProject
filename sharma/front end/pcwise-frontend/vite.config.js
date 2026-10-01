import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const proxy = {
    "/api": {
      target: env.API_TARGET || "http://localhost:8086",
      changeOrigin: true,
    },
  };
  return {
    plugins: [react()],
    server: { host: "localhost", port: 5173, proxy },
    preview: { host: "localhost", port: 4173, proxy },
  };
});
