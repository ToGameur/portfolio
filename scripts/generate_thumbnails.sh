#!/bin/bash
# Generate thumbnails (page 1) for all PDFs in src/assets/portfolio_com/

SRC_DIR="src/assets/portfolio_com"

echo "Generating thumbnails from PDFs..."

# Create thumbnails for each PDF
for pdf in "$SRC_DIR"/*.pdf; do
    [ -e "$pdf" ] || continue
    
    filename=$(basename "$pdf" .pdf)
    target="$SRC_DIR/$filename.jpg"
    
    echo "  $filename.pdf -> $filename.jpg"
    
    # sips by default converts the first page of a PDF to the output image
    sips -s format jpeg -s formatOptions 80 "$pdf" --out "$target" > /dev/null
done

echo "Thumbnail generation complete."
