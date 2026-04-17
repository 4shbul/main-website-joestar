# Deploy ke Vercel

Project ini sudah disiapkan untuk pindah dari Netlify ke Vercel.

## Yang dipakai

- Frontend statis dari root project
- Vercel Function untuk AI chat di `/api/ai-chat`
- Rewrite `/api/*` ke backend eksternal `https://api.joestarpeptides.com/api/*`

## File penting

- `vercel.json`
- `api/ai-chat.mjs`
- `package.json`
- `scripts/build-static.mjs`

## Environment Variables di Vercel

Tambahkan di Project Settings > Environment Variables:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

Jika backend Anda juga dipindah nanti, tambahkan variabel backend di project/server yang relevan, bukan di frontend statis ini.

## Langkah deploy

1. Push repo ini ke GitHub/GitLab/Bitbucket.
2. Import project ke Vercel.
3. Pastikan Vercel membaca:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Tambahkan environment variables Cloudflare di atas.
5. Deploy.
6. Setelah URL `*.vercel.app` normal, tambahkan custom domain di Vercel.
7. Ikuti DNS records yang ditampilkan Vercel untuk domain apex dan `www`.

## Catatan

- `netlify.toml` dan Netlify Function lama sudah dihapus.
- Folder `server/` tidak ikut dipublikasikan ke hasil deploy statis.
- Jika custom domain lama masih bermasalah, setup ulang domain dari awal di Vercel lebih aman daripada memakai konfigurasi Netlify yang lama.
