import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // The project lives behind a symlink/junction (e.g. OneDrive). Preserving
  // symlinks keeps all paths under the project folder instead of resolving to
  // the real OneDrive path, which otherwise breaks both `vite dev` and `build`.
  resolve: {
    preserveSymlinks: true,
  },
})
