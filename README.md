# Nutrirme Bien — landing page

Proyecto en Node + Express. Página de una sola vista (single page) para Ani.

## Cómo correrlo en tu compu

```bash
npm install
npm run dev
```

Después abrís `http://localhost:3000` en el navegador.

## Cómo editar el contenido

**Todo el texto, precios, recetas, tips y servicios salen de un único archivo:**

```
data/content.json
```

No hace falta tocar HTML, CSS ni JS para cambiar textos. Editás ese JSON,
guardás, recargás la página, y ya está.

Reglas del JSON:
- Para sacar un servicio/receta/tip: borrás ese bloque `{ ... }` completo del array (ojo con las comas).
- Para agregar uno nuevo: copiás un bloque existente similar y cambiás los valores.
- El campo `whatsappNumero` (arriba del todo) es el número al que llegan TODOS los
  botones de WhatsApp de la página — completalo con el número real antes de publicar
  (formato: código de país + número, sin espacios ni "+", ej: `5493511234567`).

## Imágenes y videos de recetas

Por ahora las imágenes de recetas/hero usan un placeholder automático si no
encuentran el archivo real (no rompe la página). Cuando Ani mande las fotos:

1. Las ponés en `public/img/` (podés crear subcarpetas, ej: `public/img/recetas/`).
2. En `data/content.json`, en el campo `imagen` de cada receta, poné la ruta,
   ej: `"/img/recetas/mousse-chocolate.jpg"`.

El botón "Ver más" de las recetas está deshabilitado a propósito por ahora
(todavía no hay video). Cuando Ani mande los videos, avisame y conectamos
ese botón para que abra el video en un modal.

## Deploy gratis en Vercel (sin demoras de carga)

1. Subís este proyecto a un repo de GitHub.
2. Entrás a vercel.com, "Add New Project", conectás el repo.
3. Vercel detecta `vercel.json` solo y despliega. No hace falta configurar nada más.
4. Cada vez que hagas `git push`, Vercel actualiza la página sola.

## Estructura

```
data/content.json   → único archivo que se edita para cambiar contenido
app.js               → define el server Express (rutas, estáticos)
server.js            → corre el server localmente (npm run dev)
api/index.js         → entrypoint para Vercel (serverless)
public/               → HTML, CSS, JS del frontend
```
