import { defineConfig, type Plugin } from 'vite';
import { darsniTekshir } from './src/engine/validate.ts';

/**
 * Har bir src/lessons/*.json ni sxemaga tekshiradi.
 * Build'da xato bo'lsa build to'xtaydi, dev serverda brauzerda xato oynasi chiqadi.
 */
function darslarniTekshir(): Plugin {
  return {
    name: 'algoritmi:dars-tekshiruvi',
    enforce: 'pre',
    transform(kod, id) {
      const yol = id.split('?')[0].replace(/\\/g, '/');
      if (!/\/src\/lessons\/[^/]+\.json$/.test(yol)) return null;
      const nom = yol.slice(yol.lastIndexOf('/src/') + 1);

      let dars: unknown;
      try {
        dars = JSON.parse(kod);
      } catch (e) {
        this.error(`${nom}: JSON o'qib bo'lmadi: ${(e as Error).message}`);
      }
      const xatolar = darsniTekshir(dars);
      if (xatolar.length > 0) {
        this.error(`${nom} dars sxemasiga mos emas (${xatolar.length} ta xato):\n  - ${xatolar.join('\n  - ')}`);
      }
      return null;
    },
  };
}

// Hozircha sayt backendsiz ishlaydi (src/ui/qobiq.ts dagi izohga qarang).
// Backend (Telegram kirish) qayta yoqilganda /api ni Python serverga uzatish:
//   const proxy = { '/api': { target: 'http://127.0.0.1:8000', changeOrigin: false } };
//   server: { proxy }, preview: { proxy },

export default defineConfig({
  plugins: [darslarniTekshir()],
});
