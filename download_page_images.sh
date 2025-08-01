#!/bin/bash

# Script to download page images from Magzin website
# Downloads img-1.png to img-54.png (img-45.png might be missing)

# Configuration
BASE_URL="https://magzin-html-demos.vercel.app/assets/imgs/page/"
TARGET_DIR="assets/imgs/page/"
BATCH_SIZE=5
DELAY_BETWEEN_BATCHES=2
DELAY_BETWEEN_DOWNLOADS=0.5

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create target directory if it doesn't exist
mkdir -p "$TARGET_DIR"

# Function to download a single image
download_image() {
    local img_num=$1
    local filename="img-${img_num}.png"
    local url="${BASE_URL}${filename}"
    local output_path="${TARGET_DIR}${filename}"
    
    # Skip if file already exists
    if [ -f "$output_path" ]; then
        echo -e "${YELLOW}[SKIP]${NC} $filename already exists"
        return 0
    fi
    
    # Download the image
    echo -n "Downloading $filename... "
    if curl -s -f -o "$output_path" "$url"; then
        echo -e "${GREEN}[OK]${NC}"
        return 0
    else
        echo -e "${RED}[FAILED]${NC}"
        # Remove empty file if download failed
        rm -f "$output_path"
        return 1
    fi
}

# Main download loop
echo "Starting download of page images..."
echo "Base URL: $BASE_URL"
echo "Target directory: $TARGET_DIR"
echo "Batch size: $BATCH_SIZE images"
echo "Delay between batches: ${DELAY_BETWEEN_BATCHES}s"
echo "----------------------------------------"

successful_downloads=0
failed_downloads=0
batch_count=0

for i in $(seq 1 54); do
    # Download the image
    if download_image $i; then
        ((successful_downloads++))
    else
        ((failed_downloads++))
    fi
    
    # Add delay between individual downloads
    sleep $DELAY_BETWEEN_DOWNLOADS
    
    # Check if we've completed a batch
    if (( i % BATCH_SIZE == 0 )) && (( i < 54 )); then
        ((batch_count++))
        echo "----------------------------------------"
        echo "Completed batch $batch_count. Waiting ${DELAY_BETWEEN_BATCHES}s before next batch..."
        echo "----------------------------------------"
        sleep $DELAY_BETWEEN_BATCHES
    fi
done

# Final summary
echo "----------------------------------------"
echo "Download completed!"
echo -e "${GREEN}Successful downloads:${NC} $successful_downloads"
echo -e "${RED}Failed downloads:${NC} $failed_downloads"
echo "----------------------------------------"

# List of failed images (if any)
if [ $failed_downloads -gt 0 ]; then
    echo "Note: Some images failed to download. This might be expected (e.g., img-45.png might not exist)."
    echo "Check the output above to see which images failed."
fi