# Video Downsizing Scripts

This directory contains scripts to compress and optimize video files in the LearnFlow application.

## Overview

The LearnFlow app currently uses ~46MB of video files as background animations. These scripts help reduce file sizes to improve loading performance, especially on slower internet connections.

## Current Videos

| File | Size | Used In |
|------|------|---------|
| `902bb92b...0.mp4` | 8.6 MB | Hero section |
| `902bb92b...3.mp4` | 11 MB | Auth pages (SignIn, SignUp, etc.) |
| `68369123...0.mp4` | 7.1 MB | Projects page |
| `68369123...2.mp4` | 7.7 MB | Topics section |
| `7d73c7eb...0.mp4` | 12 MB | **Unused** (can be deleted) |

**Total: 46.4 MB**

## Available Scripts

### 1. Node.js Script (Recommended)

**File:** `downsize-videos.js`

**Usage:**
```bash
node scripts/downsize-videos.js [quality]
```

**Quality Options:**
- `high` - Better quality, ~30-40% size reduction (CRF 23)
- `medium` - Balanced quality, ~50-60% size reduction (CRF 28) **[DEFAULT]**
- `low` - Lower quality, ~70-80% size reduction (CRF 32)

**Examples:**
```bash
# Use default (medium) quality
node scripts/downsize-videos.js

# Use high quality preset
node scripts/downsize-videos.js high

# Use low quality for maximum compression
node scripts/downsize-videos.js low
```

### 2. Bash Script (Alternative)

**File:** `downsize-videos.sh`

**Usage:**
```bash
./scripts/downsize-videos.sh [quality]
```

Same quality options as Node.js script.

**Example:**
```bash
./scripts/downsize-videos.sh medium
```

## Prerequisites

Both scripts require **ffmpeg** to be installed:

- **Ubuntu/Debian:** `sudo apt-get install ffmpeg`
- **macOS:** `brew install ffmpeg`
- **Windows:** Download from [ffmpeg.org](https://ffmpeg.org/download.html)

**Verify installation:**
```bash
ffmpeg -version
```

## How It Works

The scripts:

1. **Backup Original Videos** - Creates `public/videos/originals/` directory and copies original files there
2. **Compress Videos** - Uses H.264 codec with optimized settings:
   - CRF (Constant Rate Factor) for quality control
   - Slow preset for better compression
   - Maximum bitrate limiting
   - Removes audio (videos are muted background loops anyway)
   - Fast start optimization for web streaming
3. **Replace Files** - Overwrites original files with compressed versions
4. **Show Results** - Displays size comparison and reduction percentage

## Compression Settings

The scripts use these ffmpeg optimizations:

- **Codec:** H.264 (libx264) - widely supported, good compression
- **Preset:** slow - better compression at cost of encoding time
- **Fast Start:** Moves metadata to beginning for faster streaming
- **No Audio:** Removes audio track (not needed for background videos)
- **Bitrate Limiting:** Prevents quality spikes that increase file size
- **Resolution:** Maintains original resolution (can be adjusted if needed)

## Expected Results

Based on quality preset:

| Preset | Size Reduction | Quality | Best For |
|--------|---------------|---------|----------|
| **high** | 30-40% | Excellent | High-quality displays, demos |
| **medium** | 50-60% | Good | General use (recommended) |
| **low** | 70-80% | Acceptable | Very slow connections |

Example with **medium** quality:
- Before: 46.4 MB total
- After: ~20-23 MB total
- **Saved: ~23-26 MB** (50-56% reduction)

## Safety

- ✅ **Original files are backed up** to `public/videos/originals/`
- ✅ **Non-destructive** - you can always restore from backups
- ✅ **No data loss** - compression is carefully tuned to maintain visual quality

## Restoring Original Videos

If you need to restore original videos:

```bash
# Restore all videos
cp public/videos/originals/* public/videos/

# Restore specific video
cp public/videos/originals/video-name.mp4 public/videos/
```

## Additional Recommendations

### 1. Remove Unused Video

The file `7d73c7eb...0.mp4` (12 MB) is not referenced in the codebase. Consider removing it:

```bash
rm public/videos/social_sam.mckay.edna_Circular_abstract_loop_of_arrows_where_text_vo_7d73c7eb-7181-4271-a2e6-f97078b9f8f4_0.mp4
```

This alone saves **12 MB** without any quality trade-off.

### 2. Consider WebM Format

For even better compression, you could convert to WebM format:

```bash
ffmpeg -i input.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 output.webm
```

WebM typically offers 20-30% better compression than H.264, but requires updating video sources in the code.

### 3. Lazy Loading

Consider implementing lazy loading for videos not immediately visible on page load to further improve initial load times.

### 4. CDN Delivery

For production, consider hosting videos on a CDN (Cloudflare, AWS CloudFront, etc.) for faster global delivery.

## Troubleshooting

**Error: "ffmpeg: command not found"**
- Install ffmpeg using the commands in Prerequisites section

**Script hangs or takes too long**
- The `slow` preset provides best compression but takes time
- For faster processing, you can modify the scripts to use `-preset medium` or `-preset fast`

**Compressed videos look blurry**
- Try using `high` quality preset
- Or modify the CRF value (lower = better quality): `-crf 20` for very high quality

**Videos won't play after compression**
- This is rare but can happen. Restore from backups: `cp public/videos/originals/* public/videos/`
- Try a different quality preset

## Questions?

For issues or questions about these scripts, check the main project documentation or open an issue on the repository.
