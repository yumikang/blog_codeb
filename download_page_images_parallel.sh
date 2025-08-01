#!/bin/bash

# Parallel download script for page images
# Uses GNU parallel for efficient concurrent downloads

# Configuration
BASE_URL="https://magzin-html-demos.vercel.app/assets/imgs/page/"
TARGET_DIR="assets/imgs/page/"
MAX_PARALLEL=5  # Number of concurrent downloads

# Create target directory if it doesn't exist
mkdir -p "$TARGET_DIR"

echo "Parallel download script for page images"
echo "Base URL: $BASE_URL"
echo "Target directory: $TARGET_DIR"
echo "Max parallel downloads: $MAX_PARALLEL"
echo "----------------------------------------"

# Check if GNU parallel is installed
if ! command -v parallel &> /dev/null; then
    echo "GNU parallel is not installed."
    echo "You can install it with:"
    echo "  - macOS: brew install parallel"
    echo "  - Ubuntu/Debian: sudo apt-get install parallel"
    echo "  - Or use one of the other download scripts instead."
    exit 1
fi

# Function to download a single image
download_single() {
    local num=$1
    local filename="img-${num}.png"
    local url="${BASE_URL}${filename}"
    local output="${TARGET_DIR}${filename}"
    
    if [ -f "$output" ]; then
        echo "[SKIP] $filename already exists"
        return 0
    fi
    
    if curl -s -f -o "$output" "$url"; then
        echo "[OK] Downloaded $filename"
        return 0
    else
        rm -f "$output"
        echo "[FAILED] Could not download $filename"
        return 1
    fi
}

# Export the function so parallel can use it
export -f download_single
export BASE_URL
export TARGET_DIR

# Generate the list of numbers and download in parallel
seq 1 54 | parallel -j $MAX_PARALLEL --delay 0.2 download_single {}

echo "----------------------------------------"
echo "Parallel download completed!"

# Count downloaded files
downloaded_count=$(ls -1 "${TARGET_DIR}"img-*.png 2>/dev/null | wc -l)
echo "Total images downloaded: $downloaded_count out of 54"

# Check specifically for img-45.png
if [ ! -f "${TARGET_DIR}img-45.png" ]; then
    echo "Note: img-45.png was not found (this might be expected)"
fi