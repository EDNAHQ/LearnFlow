---
description: Transcribe audio or video to text
arguments:
  - name: file
    description: Path to audio/video file
    required: true
---

Transcribe media following the transcription skill.

**Supported formats:**
- Audio: mp3, wav, m4a, ogg, flac
- Video: mp4, webm, mov (extracts audio)

**Process:**
1. Validate file exists and format is supported
2. Use transcription API/tool
3. Return formatted text

**Output:**
```
## Transcription: <filename>

**Duration:** <length>
**Language:** <detected>

---

<transcribed text with paragraphs>

---

*Transcribed on <date>*
```

Offer to save to a file if the transcription is long.
