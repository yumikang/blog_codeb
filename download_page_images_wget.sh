#!/bin/bash

# Alternative script using wget with retry mechanism
# Downloads img-1.png to img-54.png from Magzin website

# Configuration
BASE_URL="https://magzin-html-demos.vercel.app/assets/imgs/page/"
TARGET_DIR="assets/imgs/page/"
BATCH_SIZE=5
DELAY_BETWEEN_BATCHES=2

# Create target directory if it doesn't exist
mkdir -p "$TARGET_DIR"

# Change to target directory
cd "$TARGET_DIR" || exit 1

echo "Starting download of page images using wget..."
echo "Base URL: $BASE_URL"
echo "Target directory: $(pwd)"
echo "----------------------------------------"

# Create a list of URLs to download
for i in $(seq 1 54); do
    echo "${BASE_URL}img-${i}.png"
done > download_list.txt

# Download using wget with batching
batch_count=0
line_count=0

while IFS= read -r url; do
    ((line_count++))
    
    # Extract filename from URL
    filename=$(basename "$url")
    
    # Skip if file already exists
    if [ -f "$filename" ]; then
        echo "[SKIP] $filename already exists"
    else
        # Download with wget (retry 3 times, timeout 30s)
        wget -t 3 -T 30 -q --show-progress "$url" || echo "[FAILED] $filename"
    fi
    
    # Check if we've completed a batch
    if (( line_count % BATCH_SIZE == 0 )) && (( line_count < 54 )); then
        ((batch_count++))
        echo "----------------------------------------"
        echo "Completed batch $batch_count. Waiting ${DELAY_BETWEEN_BATCHES}s..."
        echo "----------------------------------------"
        sleep $DELAY_BETWEEN_BATCHES
    fi
done < download_list.txt

# Clean up
rm -f download_list.txt

echo "----------------------------------------"
echo "Download completed!"
echo "Check the directory for downloaded images."

# Count downloaded files
downloaded_count=$(ls -1 img-*.png 2>/dev/null | wc -l)
echo "Total images in directory: $downloaded_count"

# Return to original directory
cd - > /dev/null