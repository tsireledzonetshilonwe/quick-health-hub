import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // VITE_API_BASE can be set to the backend origin, e.g. http://localhost:8081
  const backend = env.VITE_API_BASE || "http://localhost:8080";

  return {
    server: {
      host: "::",
      port: 5173,
      proxy: {
        // proxy all /api requests to the backend server during development
        "/api": {
          target: backend,
          changeOrigin: true,
          secure: false,
          // strip the browser's Origin header so the backend doesn't treat proxied requests as cross-origin
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq, req, res) => {
              try {
                proxyReq.removeHeader("origin");
              } catch (e) {
                // ignore
              }
            });
          },
        },
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
