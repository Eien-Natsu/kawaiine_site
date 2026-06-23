# Kawaiine( •̀ ω •́ )✧

A full-screen WebGL gallery for glitch art works.

The title kaomoji flashes between `( •̀ ω •́ )✧` and `(◎﹏◎)`.

这一网站将用于发布我的 glitch art 作品。

glitch art 高频的焦虑 可爱 躁狂

## Architecture

- Each artwork lives in one file under `js/artworks/`.
- The homepage is also an artwork, named `kawaiine`, implemented in `js/artworks/kawaiine.js`.
- Shared shader code lives in isolated files:
  - `js/shader-common.js` for common GLSL helpers.
  - `js/effects/scanlines.js` for the optional scanline effect.
- Artwork files register fragment shaders on `window.KawaiineShaders` using their artwork name.
- `index.html` references shared shader files first, then each artwork file, then `script.js`.
- `script.js` is the gallery runtime: it creates WebGL renderers for canvases with `data-piece`, handles full-screen page switching, and keeps artwork rendering independent from artwork definitions.

Current artworks:

- `kawaiine`
- `gem`
- `sun`
- `void`
- `rainbow`
