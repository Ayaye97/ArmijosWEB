# Armijos Decoraciones – Frontend

Sitio estático, sin build. Usa Tailwind por CDN, JavaScript vanilla y PWA (manifest + service worker).

## Estructura mínima
- index.html (shell principal)
- css/custom.css
- js/main.js
- js/tailwind-config.js
- partials/*.html (4 categorías)
- imagenes/*
- manifest.webmanifest
- sw.js

## Cómo desplegar

### Opción A: GitHub Pages (carpeta raíz)
1. Sube este folder a un repositorio.
2. En Settings → Pages → Source: “Deploy from a branch”, Branch: main, Folder: /root.
3. Abre: https://<tu_usuario>.github.io/<repo>/

### Opción B: GitHub Pages (carpeta /docs)
1. Mueve todo a /docs o copia el contenido en /docs.
2. Settings → Pages → Branch: main, Folder: /docs.
3. Abre: https://<tu_usuario>.github.io/<repo>/

### Opción C: Netlify
- Drag & Drop la carpeta en https://app.netlify.com/drop
- O conecta tu repo. Public dir: la raíz del proyecto.

### Opción D: Vercel
- Importa el repo en https://vercel.com/new
- Framework: “Other”. Output/public dir: raíz del proyecto.

## Notas PWA / caché
- Cambié start_url a /index.html y el SW a v4 para invalidar caches viejos.
- Tras subir cambios del SW, fuerza la recarga: Ctrl+F5 (Windows) o borra “Application → Storage → Clear site data”.
- El SW sólo funciona en HTTPS o localhost.

## Desarrollo local rápido
- Abre index.html con una extensión de servidor local o “Live Server”.
- Si modificas sw.js, recarga dura o incrementa la constante CACHE.

## Troubleshooting
- Página blanca tras update: limpia caché del sitio o espera al “activate” del SW.
- Rutas 404: asegúrate de conservar la estructura de carpetas (partials, imagenes, js, css).
- Imágenes pesadas: usa WebP y mantén nombres sin espacios cuando sea posible.
