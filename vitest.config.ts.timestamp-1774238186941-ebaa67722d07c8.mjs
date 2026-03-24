// vitest.config.ts
import { defineConfig } from "file:///C:/Users/danie/OneDrive/Documents/Antigravity/2.%20Gravity/node_modules/vitest/dist/config.js";
import react from "file:///C:/Users/danie/OneDrive/Documents/Antigravity/2.%20Gravity/node_modules/@vitejs/plugin-react/dist/index.js";
import path from "path";
import { fileURLToPath } from "url";
var __vite_injected_original_import_meta_url = "file:///C:/Users/danie/OneDrive/Documents/Antigravity/2.%20Gravity/vitest.config.ts";
var __dirname = path.dirname(fileURLToPath(__vite_injected_original_import_meta_url));
var vitest_config_default = defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./testes/testes-unitarios/setup.ts"],
    environmentMatchGlobs: [
      // Testes de middleware e serviços Node.js puro devem rodar em ambiente node
      ["testes/testes-unitarios/middleware/**", "node"],
      ["testes/testes-unitarios/servicos-tenant/**", "node"]
    ],
    env: {
      CLERK_SECRET_KEY: "test-clerk-secret",
      RESEND_API_KEY: "test-resend-key",
      TENANT_DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/tenant_test"
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "./testes/testes-unitarios/resultados",
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70
      },
      include: [
        "nucleo-global/**/src/**/*.ts",
        "nucleo-global/**/src/**/*.tsx"
      ],
      exclude: [
        "nucleo-global/**/src/index.ts",
        "**/*.d.ts"
      ]
    }
  },
  resolve: {
    alias: {
      "@nucleo/tabela-global": path.resolve(__dirname, "nucleo-global/tabela-global/src/index.ts"),
      "@nucleo/modal-global": path.resolve(__dirname, "nucleo-global/modal-global/src/index.ts"),
      "@nucleo/select": path.resolve(__dirname, "nucleo-global/select/src/index.ts"),
      "@nucleo/utils": path.resolve(__dirname, "nucleo-global/utils/src/index.ts"),
      "@gravity/shell": path.resolve(__dirname, "servicos-global/shell/index.ts"),
      "@tenant/middleware": path.resolve(__dirname, "servicos-global/tenant/middleware"),
      "@tenant": path.resolve(__dirname, "servicos-global/tenant")
    }
  }
});
export {
  vitest_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZXN0LmNvbmZpZy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXGRhbmllXFxcXE9uZURyaXZlXFxcXERvY3VtZW50c1xcXFxBbnRpZ3Jhdml0eVxcXFwyLiBHcmF2aXR5XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxkYW5pZVxcXFxPbmVEcml2ZVxcXFxEb2N1bWVudHNcXFxcQW50aWdyYXZpdHlcXFxcMi4gR3Jhdml0eVxcXFx2aXRlc3QuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9kYW5pZS9PbmVEcml2ZS9Eb2N1bWVudHMvQW50aWdyYXZpdHkvMi4lMjBHcmF2aXR5L3ZpdGVzdC5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlc3QvY29uZmlnJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGggfSBmcm9tICd1cmwnXG5cbmNvbnN0IF9fZGlybmFtZSA9IHBhdGguZGlybmFtZShmaWxlVVJMVG9QYXRoKGltcG9ydC5tZXRhLnVybCkpXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtyZWFjdCgpXSxcbiAgdGVzdDoge1xuICAgIGVudmlyb25tZW50OiAnanNkb20nLFxuICAgIGdsb2JhbHM6IHRydWUsXG4gICAgc2V0dXBGaWxlczogWycuL3Rlc3Rlcy90ZXN0ZXMtdW5pdGFyaW9zL3NldHVwLnRzJ10sXG4gICAgZW52aXJvbm1lbnRNYXRjaEdsb2JzOiBbXG4gICAgICAvLyBUZXN0ZXMgZGUgbWlkZGxld2FyZSBlIHNlcnZpXHUwMEU3b3MgTm9kZS5qcyBwdXJvIGRldmVtIHJvZGFyIGVtIGFtYmllbnRlIG5vZGVcbiAgICAgIFsndGVzdGVzL3Rlc3Rlcy11bml0YXJpb3MvbWlkZGxld2FyZS8qKicsICdub2RlJ10sXG4gICAgICBbJ3Rlc3Rlcy90ZXN0ZXMtdW5pdGFyaW9zL3NlcnZpY29zLXRlbmFudC8qKicsICdub2RlJ10sXG4gICAgXSxcbiAgICBlbnY6IHtcbiAgICAgIENMRVJLX1NFQ1JFVF9LRVk6ICd0ZXN0LWNsZXJrLXNlY3JldCcsXG4gICAgICBSRVNFTkRfQVBJX0tFWTogJ3Rlc3QtcmVzZW5kLWtleScsXG4gICAgICBURU5BTlRfREFUQUJBU0VfVVJMOiAncG9zdGdyZXNxbDovL3Bvc3RncmVzOnBvc3RncmVzQGxvY2FsaG9zdDo1NDMyL3RlbmFudF90ZXN0JyxcbiAgICB9LFxuICAgIGNvdmVyYWdlOiB7XG4gICAgICBwcm92aWRlcjogJ3Y4JyxcbiAgICAgIHJlcG9ydGVyOiBbJ3RleHQnLCAnaHRtbCddLFxuICAgICAgcmVwb3J0c0RpcmVjdG9yeTogJy4vdGVzdGVzL3Rlc3Rlcy11bml0YXJpb3MvcmVzdWx0YWRvcycsXG4gICAgICB0aHJlc2hvbGRzOiB7XG4gICAgICAgIGxpbmVzOiA4MCxcbiAgICAgICAgZnVuY3Rpb25zOiA4MCxcbiAgICAgICAgYnJhbmNoZXM6IDcwLFxuICAgICAgfSxcbiAgICAgIGluY2x1ZGU6IFtcbiAgICAgICAgJ251Y2xlby1nbG9iYWwvKiovc3JjLyoqLyoudHMnLFxuICAgICAgICAnbnVjbGVvLWdsb2JhbC8qKi9zcmMvKiovKi50c3gnLFxuICAgICAgXSxcbiAgICAgIGV4Y2x1ZGU6IFtcbiAgICAgICAgJ251Y2xlby1nbG9iYWwvKiovc3JjL2luZGV4LnRzJyxcbiAgICAgICAgJyoqLyouZC50cycsXG4gICAgICBdLFxuICAgIH0sXG4gIH0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJ0BudWNsZW8vdGFiZWxhLWdsb2JhbCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdudWNsZW8tZ2xvYmFsL3RhYmVsYS1nbG9iYWwvc3JjL2luZGV4LnRzJyksXG4gICAgICAnQG51Y2xlby9tb2RhbC1nbG9iYWwnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnbnVjbGVvLWdsb2JhbC9tb2RhbC1nbG9iYWwvc3JjL2luZGV4LnRzJyksXG4gICAgICAnQG51Y2xlby9zZWxlY3QnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnbnVjbGVvLWdsb2JhbC9zZWxlY3Qvc3JjL2luZGV4LnRzJyksXG4gICAgICAnQG51Y2xlby91dGlscyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdudWNsZW8tZ2xvYmFsL3V0aWxzL3NyYy9pbmRleC50cycpLFxuICAgICAgJ0BncmF2aXR5L3NoZWxsJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NlcnZpY29zLWdsb2JhbC9zaGVsbC9pbmRleC50cycpLFxuICAgICAgJ0B0ZW5hbnQvbWlkZGxld2FyZSc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzZXJ2aWNvcy1nbG9iYWwvdGVuYW50L21pZGRsZXdhcmUnKSxcbiAgICAgICdAdGVuYW50JzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NlcnZpY29zLWdsb2JhbC90ZW5hbnQnKSxcbiAgICB9LFxuICB9LFxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBOFcsU0FBUyxvQkFBb0I7QUFDM1ksT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHFCQUFxQjtBQUh5TSxJQUFNLDJDQUEyQztBQUt4UixJQUFNLFlBQVksS0FBSyxRQUFRLGNBQWMsd0NBQWUsQ0FBQztBQUU3RCxJQUFPLHdCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsRUFDakIsTUFBTTtBQUFBLElBQ0osYUFBYTtBQUFBLElBQ2IsU0FBUztBQUFBLElBQ1QsWUFBWSxDQUFDLG9DQUFvQztBQUFBLElBQ2pELHVCQUF1QjtBQUFBO0FBQUEsTUFFckIsQ0FBQyx5Q0FBeUMsTUFBTTtBQUFBLE1BQ2hELENBQUMsOENBQThDLE1BQU07QUFBQSxJQUN2RDtBQUFBLElBQ0EsS0FBSztBQUFBLE1BQ0gsa0JBQWtCO0FBQUEsTUFDbEIsZ0JBQWdCO0FBQUEsTUFDaEIscUJBQXFCO0FBQUEsSUFDdkI7QUFBQSxJQUNBLFVBQVU7QUFBQSxNQUNSLFVBQVU7QUFBQSxNQUNWLFVBQVUsQ0FBQyxRQUFRLE1BQU07QUFBQSxNQUN6QixrQkFBa0I7QUFBQSxNQUNsQixZQUFZO0FBQUEsUUFDVixPQUFPO0FBQUEsUUFDUCxXQUFXO0FBQUEsUUFDWCxVQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EsU0FBUztBQUFBLFFBQ1A7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLE1BQ0EsU0FBUztBQUFBLFFBQ1A7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCx5QkFBeUIsS0FBSyxRQUFRLFdBQVcsMENBQTBDO0FBQUEsTUFDM0Ysd0JBQXdCLEtBQUssUUFBUSxXQUFXLHlDQUF5QztBQUFBLE1BQ3pGLGtCQUFrQixLQUFLLFFBQVEsV0FBVyxtQ0FBbUM7QUFBQSxNQUM3RSxpQkFBaUIsS0FBSyxRQUFRLFdBQVcsa0NBQWtDO0FBQUEsTUFDM0Usa0JBQWtCLEtBQUssUUFBUSxXQUFXLGdDQUFnQztBQUFBLE1BQzFFLHNCQUFzQixLQUFLLFFBQVEsV0FBVyxtQ0FBbUM7QUFBQSxNQUNqRixXQUFXLEtBQUssUUFBUSxXQUFXLHdCQUF3QjtBQUFBLElBQzdEO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
