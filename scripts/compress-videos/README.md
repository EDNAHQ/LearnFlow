# Video Compression Utilities

This folder contains tools for compressing video files used in the LearnFlow project.

## Overview

Videos can become large and cause performance issues on production sites. These scripts help compress videos while maintaining good quality using the H.265 (HEVC) codec.

## What's Inside

- **compress.cjs** - Main compression script (Node.js/CommonJS)
- **backups/** - Stores original uncompressed videos before compression
- **README.md** - This file

## Prerequisites

Before using these tools, ensure you have FFmpeg installed:

```bash
# Check if FFmpeg is installed
ffmpeg -version
```

If not installed, download from: https://ffmpeg.org/download.html

## Usage

### Compress All Videos

Run the compression script from the project root:

```bash
node scripts/compress-videos/compress.cjs
```

### What It Does

1. ✅ Finds all `.mp4` files in `public/videos/`
2. ✅ Creates backups of originals in `scripts/compress-videos/backups/`
3. ✅ Compresses each video using H.265 codec (typically 75-80% reduction)
4. ✅ Replaces originals with compressed versions
5. ✅ Reports compression results

### Example Output

```
==================================================
Video Compression Script
==================================================

Found 5 video(s) to compress
Video directory: C:\Users\GGPC\CascadeProjects\LearnFlow\public\videos
Backup directory: C:\Users\GGPC\CascadeProjects\LearnFlow\scripts\compress-videos\backups

Processing: video1.mp4
  Original size: 8.54 MB
  ✓ Compressed to: 1.77 MB (reduced by 79.3%)

...

==================================================
Compression Complete!
==================================================
✓ Successfully compressed: 5 video(s)
✗ Failed: 0 video(s)
📁 Backups saved in: ...
```

## Compression Settings

The script uses these settings:

- **Codec**: `libx265` (H.265/HEVC - better compression than H.264)
- **Quality**: `crf 28` (visually lossless, ~0-23 is high quality)
- **Speed**: `fast` (faster encoding, good quality)
- **Audio**: `aac 128k` (compressed audio codec)

### Adjusting Compression

Edit `compress.cjs` to change compression settings:

```javascript
const cmd = `"${FFMPEG_PATH}" -i "${inputPath}" -vcodec libx265 -crf 28 -preset fast -acodec aac -b:a 128k -y "${outputPath}"`;
```

**CRF Values:**
- `18-23` - High quality (larger files)
- `24-28` - Balanced (current setting)
- `29-35` - More aggressive (smaller files, lower quality)

## Restoring Original Videos

If you need to restore the original uncompressed videos:

```bash
# Copy backups from scripts/compress-videos/backups/
# back to public/videos/
```

All original videos are backed up before compression.

## File Size Results

Current project videos were reduced by **78.4%**:

| Video | Before | After | Reduction |
|-------|--------|-------|-----------|
| Abstract_explosion_0 | 8.54 MB | 1.77 MB | 79.3% |
| Abstract_explosion_3 | 10.77 MB | 2.45 MB | 77.3% |
| Circular_abstract_loop | 11.43 MB | 2.61 MB | 77.2% |
| Network_nodes_0 | 7.08 MB | 1.39 MB | 80.4% |
| Network_nodes_2 | 7.67 MB | 1.60 MB | 79.1% |
| **TOTAL** | **45.49 MB** | **9.82 MB** | **78.4%** |

## Troubleshooting

### FFmpeg not found

Ensure FFmpeg is installed and in your PATH:

```bash
# Windows
ffmpeg -version

# If not recognized, add to PATH or use full path
```

### Compression taking too long

The script has a 1-hour timeout per video. For very large videos, you may need to:

1. Increase the timeout in `compress.cjs`
2. Use a less complex `-preset` (e.g., `ultrafast`, `superfast`)
3. Increase the `-crf` value for faster compression

### Video quality issues

If compressed videos look bad:

1. Lower the CRF value (e.g., from 28 to 24)
2. Use `-preset slow` for better quality
3. Check that your original videos are good quality

## Next Steps

After compression:

1. Test videos locally: `npm run dev`
2. Commit and push: `git add public/videos/` && `git commit -m "..."`
3. Deploy to production
4. Verify videos play on live site

## References

- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [H.265 vs H.264](https://en.wikipedia.org/wiki/HEVC)
- [CRF Guide](https://trac.ffmpeg.org/wiki/Encode/H.265)
