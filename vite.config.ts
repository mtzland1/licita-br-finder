import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // --- INÍCIO DA ADIÇÃO ---
    // Adicione o objeto de proxy aqui dentro do server
    proxy: {
      // Qualquer requisição para /api/proxy/...
      '/api/proxy': {
        // ... será redirecionada para o servidor do PNCP
        target: 'https://pncp.gov.br',
        // Necessário para o servidor de destino aceitar a requisição
        changeOrigin: true,
        // Reescreve a URL: remove /api/proxy e coloca /pncp-api no lugar
        rewrite: (path) => path.replace(/^\/api\/proxy/, '/pncp-api'),
      },
    },
    // --- FIM DA ADIÇÃO ---
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));