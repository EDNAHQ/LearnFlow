---
name: transcription
description: Use when you need to convert audio or video to text - meetings, interviews, podcasts, or any spoken content
---

# Transcription

## Overview

Convert audio/video files to text using AI (OpenAI Whisper or AssemblyAI).

**Core principle:** Turn spoken content into written text.

## When to Use

- Transcribing meeting recordings
- Converting podcast episodes to text
- Creating subtitles for videos
- Processing interview recordings
- Extracting text from voice memos
- Making audio content searchable
- Accessibility (creating captions)

## Setup

### API Keys Required

```bash
# For OpenAI Whisper
OPENAI_API_KEY=sk-...

# For AssemblyAI (better for long files)
ASSEMBLYAI_API_KEY=...
```

### Script Location

```
.claude/scripts/apis/transcribe.js
```

## Usage

### Basic

```bash
node .claude/scripts/apis/transcribe.js meeting-recording.mp3
```

### With Options

```bash
# Include timestamps
node transcribe.js podcast.mp3 --timestamps

# Generate SRT subtitles
node transcribe.js video.mp4 --format=srt

# Generate VTT subtitles
node transcribe.js video.mp4 --format=vtt

# Specify language (faster, more accurate)
node transcribe.js spanish-audio.mp3 --language=es

# Use AssemblyAI (better for long files)
node transcribe.js long-meeting.mp3 --provider=assemblyai

# Custom output name
node transcribe.js interview.mp3 --output=interview-transcript.txt
```

## Supported Formats

Audio: `mp3`, `mp4`, `mpeg`, `mpga`, `m4a`, `wav`, `webm`

## Output Formats

### Plain Text (default)

```
Hi everyone, welcome to the weekly standup. Let's go around 
and share what we worked on this week. Sarah, why don't you 
start us off?
```

### With Timestamps

```
[00:00:00.000 --> 00:00:03.500] Hi everyone, welcome to the weekly standup.
[00:00:03.500 --> 00:00:07.200] Let's go around and share what we worked on this week.
[00:00:07.200 --> 00:00:09.800] Sarah, why don't you start us off?
```

### SRT (Subtitles)

```
1
00:00:00,000 --> 00:00:03,500
Hi everyone, welcome to the weekly standup.

2
00:00:03,500 --> 00:00:07,200
Let's go around and share what we worked on this week.

3
00:00:07,200 --> 00:00:09,800
Sarah, why don't you start us off?
```

### VTT (Web Subtitles)

```
WEBVTT

00:00:00.000 --> 00:00:03.500
Hi everyone, welcome to the weekly standup.

00:00:03.500 --> 00:00:07.200
Let's go around and share what we worked on this week.
```

## Provider Comparison

| Feature | OpenAI Whisper | AssemblyAI |
|---------|----------------|------------|
| Max file size | 25MB | Unlimited |
| Speed | Fast | Moderate |
| Accuracy | Excellent | Excellent |
| Languages | 50+ | 100+ |
| Speaker labels | No | Yes |
| Cost | ~$0.006/min | ~$0.012/min |
| Punctuation | Good | Excellent |

### When to Use Which

| Scenario | Provider |
|----------|----------|
| Short clips (< 25MB) | OpenAI |
| Long recordings | AssemblyAI |
| Need speaker labels | AssemblyAI |
| Quick turnaround | OpenAI |
| Non-English | Both work |

## Use Cases

### 1. Meeting Transcription

```bash
# Transcribe team meeting
node transcribe.js team-standup-2025-12-22.mp3 --timestamps

# Output: meeting notes with timestamps
```

### 2. Video Subtitles

```bash
# Generate SRT for video
node transcribe.js product-demo.mp4 --format=srt --output=demo-subtitles.srt

# Add to video player or upload to YouTube
```

### 3. Podcast Processing

```bash
# Transcribe podcast episode
node transcribe.js episode-42.mp3 --provider=assemblyai

# Use transcript for:
# - Blog post
# - Show notes
# - SEO content
```

### 4. Interview Analysis

```bash
# Transcribe research interview
node transcribe.js user-interview-01.m4a --timestamps

# Now searchable and quotable
```

## Integration with Projects

### Workflow

```
1. Obtain audio/video file
2. Run transcription
3. Review and edit transcript
4. Use in project:
   - Subtitles for video
   - Meeting notes documentation
   - Content for blog posts
   - Searchable archive
```

### Example Session

```
Task: Create subtitles for app-5 demo video

$ node .claude/scripts/apis/transcribe.js demo-video.mp4 --format=srt

Output: generated/demo-video-transcript.srt

Next: 
1. Review for accuracy
2. Move to public/subtitles/demo.srt
3. Add <track> element to video player
```

## Tips for Better Accuracy

### Audio Quality

- Clear audio produces better results
- Reduce background noise if possible
- Multiple speakers should be distinct

### Language Hints

```bash
# Specify language for better accuracy
node transcribe.js spanish-meeting.mp3 --language=es
```

### Post-Processing

Transcripts may need:
- Punctuation fixes
- Proper noun corrections
- Speaker attribution
- Paragraph formatting

## Output

Transcripts saved to: `./generated/{filename}-transcript.{ext}`

Where `{ext}` is `txt`, `srt`, or `vtt` based on format.

