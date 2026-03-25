import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const publicDir = path.join(root, "public");
const sourceSvgPath = path.join(publicDir, "favicon.svg");

const svg = fs.readFileSync(sourceSvgPath, "utf8");
const fillMatch = svg.match(/<rect[^>]*fill="(#[0-9A-Fa-f]{6})"/);
const textMatch = svg.match(/<text[\s\S]*?>([^<]+)<\/text>/);

if (!fillMatch || !textMatch) {
  throw new Error("Could not parse favicon.svg for required shape/text data.");
}

const blueHex = fillMatch[1];
const label = textMatch[1].trim();

const hexToRgba = (hex) => {
  const value = parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255, 255];
};

const BLUE = hexToRgba(blueHex);
const WHITE = [255, 255, 255, 255];
const TRANSPARENT = [0, 0, 0, 0];

const makeCanvas = (size) => Array.from({ length: size }, () => Array.from({ length: size }, () => [...TRANSPARENT]));

const fillRect = (canvas, x0, y0, x1, y1, color) => {
  const size = canvas.length;
  const sx0 = Math.max(0, Math.floor(x0));
  const sy0 = Math.max(0, Math.floor(y0));
  const sx1 = Math.min(size, Math.ceil(x1));
  const sy1 = Math.min(size, Math.ceil(y1));

  for (let y = sy0; y < sy1; y += 1) {
    for (let x = sx0; x < sx1; x += 1) {
      canvas[y][x] = [...color];
    }
  }
};

const fillRoundedRect = (canvas, radius, color) => {
  const size = canvas.length;
  const r2 = radius * radius;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let inside = true;

      if (x < radius && y < radius) {
        const dx = x - radius;
        const dy = y - radius;
        inside = (dx * dx) + (dy * dy) <= r2;
      } else if (x >= size - radius && y < radius) {
        const dx = x - (size - radius - 1);
        const dy = y - radius;
        inside = (dx * dx) + (dy * dy) <= r2;
      } else if (x < radius && y >= size - radius) {
        const dx = x - radius;
        const dy = y - (size - radius - 1);
        inside = (dx * dx) + (dy * dy) <= r2;
      } else if (x >= size - radius && y >= size - radius) {
        const dx = x - (size - radius - 1);
        const dy = y - (size - radius - 1);
        inside = (dx * dx) + (dy * dy) <= r2;
      }

      if (inside) {
        canvas[y][x] = [...color];
      }
    }
  }
};

const drawAaGlyph = (canvas, color) => {
  const size = canvas.length;

  // Stylized "Aa" mark suitable for tiny icon sizes.
  fillRect(canvas, size * 0.24, size * 0.62, size * 0.30, size * 0.80, color);
  fillRect(canvas, size * 0.38, size * 0.62, size * 0.44, size * 0.80, color);
  fillRect(canvas, size * 0.27, size * 0.56, size * 0.41, size * 0.62, color);
  fillRect(canvas, size * 0.30, size * 0.50, size * 0.38, size * 0.56, color);
  fillRect(canvas, size * 0.32, size * 0.44, size * 0.36, size * 0.50, color);

  fillRect(canvas, size * 0.52, size * 0.62, size * 0.58, size * 0.80, color);
  fillRect(canvas, size * 0.58, size * 0.62, size * 0.70, size * 0.68, color);
  fillRect(canvas, size * 0.64, size * 0.68, size * 0.70, size * 0.80, color);
  fillRect(canvas, size * 0.52, size * 0.74, size * 0.70, size * 0.80, color);
  fillRect(canvas, size * 0.52, size * 0.68, size * 0.58, size * 0.74, color);
};

const pngChunk = (type, data) => {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const crcData = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE((crc32(crcData) >>> 0), 0);

  return Buffer.concat([length, Buffer.from(type), data, crc]);
};

const crc32Table = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let j = 0; j < 8; j += 1) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(buffer) {
  let c = 0xFFFFFFFF;
  for (const byte of buffer) {
    c = crc32Table[(c ^ byte) & 0xFF] ^ (c >>> 8);
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

const canvasToPng = (canvas) => {
  const height = canvas.length;
  const width = canvas[0].length;

  const rawRows = [];
  for (let y = 0; y < height; y += 1) {
    rawRows.push(Buffer.from([0]));
    const row = Buffer.alloc(width * 4);
    for (let x = 0; x < width; x += 1) {
      const [r, g, b, a] = canvas[y][x];
      const idx = x * 4;
      row[idx] = r;
      row[idx + 1] = g;
      row[idx + 2] = b;
      row[idx + 3] = a;
    }
    rawRows.push(row);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const idat = zlib.deflateSync(Buffer.concat(rawRows), { level: 9 });

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", idat),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
};

const renderIcon = (size) => {
  const canvas = makeCanvas(size);
  const radius = Math.max(1, Math.round((104 / 512) * size));
  fillRoundedRect(canvas, radius, BLUE);
  drawAaGlyph(canvas, WHITE);
  return canvas;
};

const writePng = (filename, size) => {
  const png = canvasToPng(renderIcon(size));
  fs.writeFileSync(path.join(publicDir, filename), png);
  return png;
};

const icon16 = writePng("favicon-16x16.png", 16);
const icon32 = writePng("favicon-32x32.png", 32);
writePng("apple-touch-icon.png", 180);

const icoHeader = Buffer.alloc(6);
icoHeader.writeUInt16LE(0, 0);
icoHeader.writeUInt16LE(1, 2);
icoHeader.writeUInt16LE(2, 4);

const entries = [];
let offset = 6 + (2 * 16);

for (const [size, png] of [[16, icon16], [32, icon32]]) {
  const entry = Buffer.alloc(16);
  entry[0] = size;
  entry[1] = size;
  entry[2] = 0;
  entry[3] = 0;
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(offset, 12);
  offset += png.length;
  entries.push(entry);
}

fs.writeFileSync(path.join(publicDir, "favicon.ico"), Buffer.concat([icoHeader, ...entries, icon16, icon32]));

console.log(`Generated favicon set from ${path.relative(root, sourceSvgPath)} (${label}).`);
