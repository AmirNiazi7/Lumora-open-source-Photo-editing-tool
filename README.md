# Lumora Photo Studio 🎨✨

> An advanced, browser-based photo editor and Photoshop PSD suite built with React 19, TypeScript, Vite, and HTML5 Canvas. Inspired by professional photo editing ergonomics and workflows.

![Lumora Studio Banner](https://img.shields.io/badge/Lumora-Photo%20Studio-blue?style=for-the-badge&logo=adobephotoshop)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.x-646cff?style=flat-square&logo=vite)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 🌟 Key Features

### 📁 Native Adobe Photoshop (`.psd`) Compatibility
* **Full Multi-Layer PSD Import**: Open your own `.psd` files directly from your computer or drag-and-drop onto the canvas.
* **Preserved Layers**: Individual layers are preserved with accurate coordinates `(x, y)`, names, opacity, and blend modes.
* **Export to PSD**: Export projects directly back to multi-layer `.psd` files via `ag-psd`.
* **Export Formats**: Also supports exporting to PNG and JPEG.

### 🖌️ Creative Editing Suite
* **Transform & Move Tool (<kbd>V</kbd>)**: Free transform with 8 handles and rotation anchor. Auto-select layers on click.
* **Brush Tool (<kbd>B</kbd>)**: Variable brush size, opacity, and hardness.
* **Eraser Tool (<kbd>E</kbd>)**: Pixel-level eraser with opacity controls.
* **Vector Shape Tool (<kbd>U</kbd>)**: Real-time rectangle, ellipse, and line drawing with configurable fill, stroke, and stroke width.
* **Type Tool (<kbd>T</kbd>)**: Multi-font typography with size, bold, italic, and color controls.
* **Color Eyedropper (<kbd>I</kbd>)**: Pixel color sampling with dual primary/secondary color swatches.
* **Crop Tool (<kbd>C</kbd>)**: Bounding crop area with instant canvas recalculation and layer alignment.
* **Pan Hand (<kbd>H</kbd> / <kbd>Space</kbd>) & Zoom (<kbd>Z</kbd>)**: Smooth canvas zooming from 5% up to 3200%.

### 📑 Layer Management
* **Blend Modes**: Normal (`source-over`), Multiply, Screen, Overlay, Darken, Lighten, Color Dodge, Color Burn, Difference.
* **Layer Controls**: Opacity slider, Visibility toggle, Lock toggle, Layer reordering (<kbd>Up</kbd>/<kbd>Down</kbd>), Layer duplication (<kbd>Ctrl+J</kbd>), and Layer deletion.
* **Inline Renaming**: Double-click any layer name to rename it.

### 🎛️ Real-time Pixel Adjustments
* **Brightness & Contrast**
* **Saturation**
* **Gaussian Blur**
* **Sepia Filter**
* **Grayscale**
* **Color Inversion**

### ⏪ History Stack & Undo/Redo
* Snapshot-based state management with unlimited undo/redo (<kbd>Ctrl+Z</kbd> / <kbd>Ctrl+Y</kbd>).
* Interactive **History Panel** with step-jumping to revert to any previous editing milestone.

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* [npm](https://www.npmjs.com/)

### Installation

```bash
# Clone the repository
git clone git@github.com:AmirNiazi7/Lumora-open-source-Photo-editing-tool.git

# Navigate into the project folder
cd Lumora-open-source-Photo-editing-tool

# Install dependencies
npm install
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```bash
npm run build
```

The optimized static production bundle will be generated in `dist/`.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>V</kbd> | Move / Transform Tool |
| <kbd>B</kbd> | Brush Tool |
| <kbd>E</kbd> | Eraser Tool |
| <kbd>T</kbd> | Text Tool |
| <kbd>U</kbd> | Shape Tool |
| <kbd>I</kbd> | Eyedropper Tool |
| <kbd>C</kbd> | Crop Tool |
| <kbd>H</kbd> / <kbd>Space</kbd> + Drag | Pan Canvas |
| <kbd>Ctrl</kbd> + <kbd>Z</kbd> | Undo |
| <kbd>Ctrl</kbd> + <kbd>Y</kbd> / <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd> | Redo |
| <kbd>Ctrl</kbd> + <kbd>J</kbd> | Duplicate Active Layer |
| <kbd>Ctrl</kbd> + <kbd>O</kbd> | Open PSD / Image / Project |
| <kbd>Ctrl</kbd> + <kbd>S</kbd> | Save Project (.lumora) |
| <kbd>Delete</kbd> / <kbd>Backspace</kbd> | Delete Active Layer |

---

## 🛠️ Tech Stack & Architecture

* **Frontend**: React 19, TypeScript
* **Styling**: Modern dark-theme vanilla CSS with CSS custom properties
* **Canvas Engine**: Decoupled HTML5 2D Canvas composite pipeline (`LumoraEngine.ts`)
* **PSD Processing**: `ag-psd` (Adobe Photoshop binary parser and serializer)
* **Icons**: `lucide-react`
* **Bundler**: Vite 6

---

## 📄 License

This project is licensed under the MIT License.
