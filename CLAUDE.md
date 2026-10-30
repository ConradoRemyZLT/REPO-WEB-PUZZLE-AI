# puzzle-web

Sitio de Puzzle AI (ver `LEEME.txt`). Fuente en `src/`, salida en `html/PUZZLE-WEB-home.html`
(un solo HTML autocontenido) generada con `python build.py` (requiere Pillow).

## Reglas
- No editar `html/PUZZLE-WEB-home.html` a mano: editar `src/` y correr `build.py`.
- Todo texto lleva par bilingüe `<span class="l-es">…</span><span class="l-en">…</span>`.
- Marca: Causten (300/400/500/600/700/900), paleta #324158 · #7EA78C · #000 · #FFF; acentos de los
  degradados oficiales (teal #2c83a7, peri #5e71ba). Titulares Bold minúscula, keywords Bold MAYÚSCULA.
- Anatomía de cada unidad (`.unit`): eyebrow → estado (tag) → logo → título sr-only → ubicación →
  bajada → datos clave → chips → botones → créditos → galería.
- Breakpoints: 480, 640, 860, 900 (+1100 para el menú).
- Imágenes: el build las pasa a WebP (fotos q78, PNG con alfa q90); nunca deformar.
- Animaciones con transform/opacity y requestAnimationFrame (60 fps); respetar prefers-reduced-motion.
- Login (`src/gate.js`): SALT y USERS son copia del gate de ZLT v2 (`zltdev/presentacion`). Si cambian
  los usuarios allá, copiarlos acá. Clave de sesión: `pz_gate_ok` (sessionStorage).
- Antes de entregar: verificar con Playwright a 1440/768/390 (consola, overflow, galerías, reveals).
- La página es `noindex` hasta la mudanza desde thepuzzle.ai.
