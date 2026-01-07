import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { createCanvas, Canvas, Image, ImageData } from 'canvas';

const require = createRequire(import.meta.url);
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DIR = path.join(__dirname, '../src/assets/portfolio_com');

// --- DOM SHIM ---
global.Canvas = Canvas;
global.Image = Image;
global.ImageData = ImageData;

class NodeCanvasFactory {
    create(width, height) {
        if (width <= 0 || height <= 0) throw new Error("Invalid canvas size");
        const canvas = createCanvas(width, height);
        const context = canvas.getContext("2d");
        return { canvas, context };
    }

    reset(canvasAndContext, width, height) {
        if (width <= 0 || height <= 0) throw new Error("Invalid canvas size");
        canvasAndContext.canvas.width = width;
        canvasAndContext.canvas.height = height;
    }

    destroy(canvasAndContext) {
        canvasAndContext.canvas.width = 0;
        canvasAndContext.canvas.height = 0;
        canvasAndContext.canvas = null;
        canvasAndContext.context = null;
    }
}

async function convertPdfToImages(pdfPath, outDir) {
    console.log(`Processing ${path.basename(pdfPath)}...`);

    try {
        const data = new Uint8Array(fs.readFileSync(pdfPath));
        const loadingTask = pdfjsLib.getDocument({
            data,
            cMapUrl: path.join(__dirname, '../node_modules/pdfjs-dist/cmaps/'),
            cMapPacked: true,
            fontExtraProperties: true,
            disableFontFace: true,
            canvasFactory: new NodeCanvasFactory(),
        });

        const pdf = await loadingTask.promise;
        console.log(`  > Found ${pdf.numPages} pages.`);

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const scale = 2.0;
            const viewport = page.getViewport({ scale });

            const canvas = createCanvas(viewport.width, viewport.height);
            const context = canvas.getContext('2d', { alpha: false });

            // White background 
            context.fillStyle = 'white';
            context.fillRect(0, 0, viewport.width, viewport.height);

            await page.render({
                canvasContext: context,
                viewport: viewport,
                canvasFactory: new NodeCanvasFactory(),
            }).promise;

            const outFile = path.join(outDir, `page-${i}.jpg`);
            const buffer = canvas.toBuffer('image/jpeg', { quality: 0.90 });
            fs.writeFileSync(outFile, buffer);
            console.log(`  > Saved: ${path.basename(outFile)}`);

            // Cleanup
            page.cleanup();
        }
    } catch (e) {
        console.error(`  ERROR converting ${path.basename(pdfPath)}:`, e.message);
    }
}

async function main() {
    if (!fs.existsSync(SRC_DIR)) {
        console.error(`Source directory ${SRC_DIR} not found.`);
        return;
    }

    const entries = fs.readdirSync(SRC_DIR);
    const pdfs = entries.filter(f => f.toLowerCase().endsWith('.pdf'));

    if (pdfs.length === 0) {
        console.log("No PDFs found to convert.");
        return;
    }

    // Process each PDF
    for (const pdfFile of pdfs) {
        const projectSlug = path.basename(pdfFile, '.pdf');
        const pdfPath = path.join(SRC_DIR, pdfFile);
        const targetDir = path.join(SRC_DIR, projectSlug);

        // Prepare directory
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        await convertPdfToImages(pdfPath, targetDir);
    }
}

main();
