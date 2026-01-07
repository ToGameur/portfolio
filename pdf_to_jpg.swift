import PDFKit
import Foundation
import CoreGraphics

// Arguments: input PDF path, output directory
let args = CommandLine.arguments
guard args.count == 3 else {
    print("Usage: swift pdf_to_jpg.swift <input_pdf> <output_dir>")
    exit(1)
}

let inputPath = args[1]
let outputDir = args[2]

let pdfUrl = URL(fileURLWithPath: inputPath)
guard let document = PDFDocument(url: pdfUrl) else {
    print("Error: Could not load PDF at \(inputPath)")
    exit(1)
}

// Create output directory if it doesn't exist
let fileManager = FileManager.default
try? fileManager.createDirectory(atPath: outputDir, withIntermediateDirectories: true, attributes: nil)

print("Processing \(document.pageCount) pages...")

for i in 0..<document.pageCount {
    guard let page = document.page(at: i) else { continue }
    let pageNum = i + 1
    
    // Get page bounds
    let pageRect = page.bounds(for: .mediaBox)

    
    // Convert to image
    let img = page.thumbnail(of: pageRect.size, for: .mediaBox)
    
    // Save as JPEG
    guard let tiffData = img.tiffRepresentation,
          let bitmap = NSBitmapImageRep(data: tiffData),
          let jpegData = bitmap.representation(using: .jpeg, properties: [.compressionFactor: 0.9]) else {
        print("Error converting page \(pageNum) to image")
        continue
    }
    
    let outputPath = "\(outputDir)/page-\(pageNum).jpg"
    let success = fileManager.createFile(atPath: outputPath, contents: jpegData, attributes: nil)
    
    if success {
        print("Saved: \(outputPath)")
    } else {
        print("Failed to save: \(outputPath)")
    }
}

print("Done.")
