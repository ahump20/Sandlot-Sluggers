#!/bin/bash

# Sandlot Sluggers - Asset Upload Script
# Uploads assets to Cloudflare R2 bucket

set -e

echo "⚾ Sandlot Sluggers - Asset Upload"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

BUCKET_NAME="sandlot-sluggers-assets"

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}❌ Wrangler CLI not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Wrangler CLI found${NC}"
echo ""

# Function to upload directory
upload_directory() {
    local source_dir=$1
    local dest_path=$2
    local file_count=0

    if [ ! -d "$source_dir" ]; then
        echo -e "${YELLOW}  ⚠ Directory not found: $source_dir${NC}"
        return
    fi

    echo -e "${BLUE}Uploading: $source_dir → $dest_path${NC}"

    # Find all files and upload
    while IFS= read -r file; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")

            # Skip README files
            if [ "$filename" == "README.md" ]; then
                continue
            fi

            # Determine content type
            extension="${filename##*.}"
            case "$extension" in
                mp3)
                    content_type="audio/mpeg"
                    ;;
                ogg)
                    content_type="audio/ogg"
                    ;;
                glb)
                    content_type="model/gltf-binary"
                    ;;
                jpg|jpeg)
                    content_type="image/jpeg"
                    ;;
                png)
                    content_type="image/png"
                    ;;
                hdr|env)
                    content_type="application/octet-stream"
                    ;;
                *)
                    content_type="application/octet-stream"
                    ;;
            esac

            # Upload file
            relative_path="${file#$source_dir/}"
            r2_path="$dest_path/$relative_path"

            echo -e "  Uploading: $filename"
            wrangler r2 object put "$BUCKET_NAME/$r2_path" \
                --file="$file" \
                --content-type="$content_type" 2>&1 | grep -v "Creating"

            ((file_count++))
        fi
    done < <(find "$source_dir" -type f)

    if [ $file_count -eq 0 ]; then
        echo -e "${YELLOW}  No files found to upload${NC}"
    else
        echo -e "${GREEN}  ✓ Uploaded $file_count files${NC}"
    fi
    echo ""
}

echo "Starting asset upload to R2..."
echo ""

# Upload audio files
echo "1/3 Audio Assets"
upload_directory "public/audio/sfx" "audio/sfx"
upload_directory "public/audio/music" "audio/music"
upload_directory "public/audio/ambience" "audio/ambience"

# Upload 3D models
echo "2/3 3D Models"
upload_directory "public/models/characters" "models/characters"
upload_directory "public/models/stadiums" "models/stadiums"

# Upload textures
echo "3/3 Textures"
upload_directory "public/textures" "textures"

echo "================================"
echo "Upload Complete!"
echo "================================"
echo ""
echo "Assets uploaded to: $BUCKET_NAME"
echo ""
echo "To verify uploads:"
echo "  wrangler r2 object list $BUCKET_NAME"
echo ""
echo "⚾ Assets ready!"
