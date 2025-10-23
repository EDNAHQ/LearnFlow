#!/bin/bash

# Video Downsizing Script for LearnFlow (Bash version)
# This is a simpler alternative to the Node.js script
#
# Requirements: ffmpeg installed
#
# Usage:
#   ./scripts/downsize-videos.sh [quality]
#
# Quality options: high, medium (default), low

VIDEOS_DIR="$(dirname "$0")/../public/videos"
BACKUP_DIR="$VIDEOS_DIR/originals"
QUALITY="${1:-medium}"

# Quality presets
case "$QUALITY" in
  high)
    CRF=23
    MAXRATE="2M"
    BUFSIZE="4M"
    ;;
  medium)
    CRF=28
    MAXRATE="1M"
    BUFSIZE="2M"
    ;;
  low)
    CRF=32
    MAXRATE="500k"
    BUFSIZE="1M"
    ;;
  *)
    echo "Invalid quality: $QUALITY"
    echo "Use: high, medium, or low"
    exit 1
    ;;
esac

echo "🎬 LearnFlow Video Downsizing Script"
echo ""
echo "Quality preset: $QUALITY (CRF: $CRF, Max bitrate: $MAXRATE)"
echo ""

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
  echo "❌ Error: ffmpeg is not installed!"
  echo ""
  echo "Please install ffmpeg:"
  echo "  - Ubuntu/Debian: sudo apt-get install ffmpeg"
  echo "  - macOS: brew install ffmpeg"
  echo "  - Windows: Download from https://ffmpeg.org/download.html"
  exit 1
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Process each video file
cd "$VIDEOS_DIR" || exit 1

total=0
count=0

for video in *.mp4 *.webm *.mov *.avi 2>/dev/null; do
  # Skip if no videos found
  [[ -e "$video" ]] || continue

  # Skip if it's a directory
  [[ -f "$video" ]] || continue

  total=$((total + 1))
done

if [ $total -eq 0 ]; then
  echo "No video files found to compress."
  exit 0
fi

echo "Found $total video file(s) to process"
echo ""

for video in *.mp4 *.webm *.mov *.avi 2>/dev/null; do
  # Skip if no videos found
  [[ -e "$video" ]] || continue

  # Skip if it's a directory
  [[ -f "$video" ]] || continue

  count=$((count + 1))

  echo "[$count/$total] Processing: $video"

  # Get original size
  original_size=$(du -h "$video" | cut -f1)
  echo "  Original size: $original_size"

  # Backup if not already backed up
  if [ ! -f "$BACKUP_DIR/$video" ]; then
    echo "  Creating backup..."
    cp "$video" "$BACKUP_DIR/$video"
  fi

  # Compress video
  echo "  Compressing... (this may take a minute)"

  ffmpeg -i "$video" \
    -c:v libx264 \
    -crf $CRF \
    -preset slow \
    -maxrate $MAXRATE \
    -bufsize $BUFSIZE \
    -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" \
    -movflags +faststart \
    -an \
    -y \
    "temp_$video" \
    2>&1 | grep -v "^frame=" || true

  if [ $? -eq 0 ] && [ -f "temp_$video" ]; then
    compressed_size=$(du -h "temp_$video" | cut -f1)
    echo "  Compressed size: $compressed_size"

    # Replace original
    mv "temp_$video" "$video"
    echo "  ✅ Done!"
  else
    echo "  ⚠️  Skipped due to error"
    rm -f "temp_$video"
  fi

  echo ""
done

echo "✅ All videos processed!"
echo "📁 Original videos backed up to: $BACKUP_DIR"
