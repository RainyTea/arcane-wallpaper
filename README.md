# Arcane Wallpaper

[![MIT License](https://img.shields.io/github/license/RainyTea/arcane-wallpaper.svg?style=flat-square)](https://github.com/RainyTea/arcane-wallpaper/blob/main/LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)

<p align="left">
  <img src="public/preview.png" alt="Preview" width="640" />
</p>

**Arcane Wallpaper** is an interactive fantasy-themed web wallpaper for [Wallpaper Engine](https://www.wallpaperengine.io/). Featuring a desk with a candle, twin lanterns, runestones, drifting embers, dust motes and magical sparkles - overlaid with live stock tickers and a system info codex.

## Table of Contents

- [Features](#features)
- [Install](#install)
- [Companion App](#companion-app)
- [Technologies](#technologies)
- [License](#license)
- [Sources](#sources)

## Features

- Animated candle and twin lanterns with a synchronized day/night atmosphere cycle
- Ambient dust motes drifting through the scene, picking up the light of the lanterns and candle
- Magical sparkles and drifting rune embers around active books
- Up to 4 configurable stock tickers with live sparkline charts. Books glow green/red and emit colored particles tied to the day's gain/loss
- System Codex book with a reactive violet glow that intensifies with CPU usage
- System Codex panel: FPS by default. With the optional companion app installed, also shows CPU/GPU name, clock, usage, temperature, system power with per-device (GPU/CPU) breakdown, RAM, VRAM and total storage
- All toggles, tickers, and visual options configurable from the Wallpaper Engine properties panel

## Install

Subscribe via the [Steam Workshop](https://steamcommunity.com/app/431960/workshop/) listing, then apply the wallpaper and open its properties to set your stock tickers.

> Stock tickers require Internet access to be enabled in Wallpaper Engine's general settings.

## Companion App

For live hardware stats in the System Codex panel, install the optional [hwinfo-bridge](https://github.com/RainyTea/hwinfo-bridge) companion app. It runs HWInfo64 in shared-memory mode and exposes the sensors on `http://127.0.0.1:8765/sensors`, which this wallpaper polls automatically.

Without the bridge, the System Codex still shows FPS, everything else is hidden gracefully.

## Technologies

- [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
- [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
- [![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev)
- [![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://www.w3.org/TR/CSS/)
- [![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://html.spec.whatwg.org)

## License

Distributed under the [MIT License](LICENSE). See `LICENSE` for more information.

## Sources

- [Wallpaper Engine Web Guide](https://docs.wallpaperengine.io/en/web/overview.html)
- [HWInfo64](https://www.hwinfo.com/) - sensor data source for the optional companion app
- Framework references: [React](https://react.dev), [TypeScript](https://www.typescriptlang.org/docs/), [Vite](https://vite.dev/guide/)
- Web technology references: [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML), [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS), [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
