# CRÁNEOS3D — Repositorio inclusivo
Sitio listo para GitHub Pages que lista modelos GLB de cráneos y ofrece tres visores: 3D (model-viewer), AR (model-viewer WebXR) y VR (A-Frame).

## Características
- Tarjetas con emojis y tres botones: 3D / AR / VR
- Controles de **alto contraste**, **tamaño de fuente**, y **idioma ES/EN** con persistencia localStorage
- Diseño simple y responsive

## Estructura
```
/assets/css/styles.css
/assets/js/app.js
/assets/models/*.glb
index.html
viewer3d.html
viewerar.html
viewervr.html
```
Sube todo el contenido a un repositorio y habilita GitHub Pages (Branch `main`, carpeta `/root`).

> Nota: Los scripts de `model-viewer` y `A-Frame` se cargan desde CDN.
