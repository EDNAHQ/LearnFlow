---
name: audio-generation
description: Use when you need to create audio - voiceovers, narration, text-to-speech, or sound content
---

# Audio Generation

## Overview

Generate spoken audio from text using AI voices (OpenAI TTS or ElevenLabs).

**Core principle:** Turn text into natural-sounding speech.

## When to Use

- Creating voiceovers for videos/demos
- Generating audio for tutorials
- Building voice interfaces or assistants
- Creating podcast intros/outros
- Notification sounds with voice
- Accessibility features (read-aloud)
- Prototyping before hiring voice talent

## Setup

### API Keys Required

```bash
# For OpenAI TTS
OPENAI_API_KEY=sk-...

# For ElevenLabs (better voice quality, more options)
ELEVENLABS_API_KEY=...
```

### Script Location

```
.claude/scripts/apis/generate-audio.js
```

## Usage

### Basic

```bash
node .claude/scripts/apis/generate-audio.js "Welcome to our application"
```

### With Options

```bash
# Different voice
node generate-audio.js "Hello world" --voice=nova

# HD quality
node generate-audio.js "Important announcement" --model=tts-1-hd

# Faster/slower speech
node generate-audio.js "Quick update" --speed=1.25

# Use ElevenLabs
node generate-audio.js "Premium narration" --provider=elevenlabs

# Custom output name
node generate-audio.js "Welcome message" --output=welcome.mp3
```

## OpenAI Voices

| Voice | Character |
|-------|-----------|
| `alloy` | Neutral, balanced |
| `echo` | Warm, conversational |
| `fable` | British, storytelling |
| `onyx` | Deep, authoritative |
| `nova` | Friendly, upbeat |
| `shimmer` | Clear, professional |

### Voice Selection Guide

| Use Case | Recommended Voice |
|----------|-------------------|
| Product demo | nova, alloy |
| Tutorial | echo, fable |
| Announcement | onyx |
| Customer service | shimmer, nova |
| Storytelling | fable |
| Professional/Corporate | alloy, shimmer |

## Writing Good Scripts

### Tips

1. **Write for speaking** - Not reading
2. **Use punctuation** - Controls pacing
3. **Avoid jargon** - Unless necessary
4. **Short sentences** - Easier to follow
5. **Include pauses** - Use periods, commas

### Example Scripts

**App Welcome:**
```
Welcome to TaskFlow. Let's get you set up in just a few minutes.
First, we'll create your workspace. Then, you can invite your team.
```

**Tutorial:**
```
To create a new project, click the plus button in the top right corner.
Give your project a name, and optionally add a description.
When you're ready, click Create.
```

**Notification:**
```
You have a new message from your team.
```

## Provider Comparison

| Feature | OpenAI TTS | ElevenLabs |
|---------|------------|------------|
| Voice Quality | Very Good | Excellent |
| Voice Variety | 6 voices | 100+ voices |
| Voice Cloning | No | Yes |
| Languages | Many | Many |
| Cost | ~$0.015/1K chars | ~$0.30/1K chars |
| Speed | Fast | Fast |
| Emotion Control | Limited | Good |

## Use Cases

### 1. Video Voiceover

```bash
# Generate narration for product demo
node generate-audio.js "TaskFlow helps teams stay organized. 
With powerful project management tools, your team can 
collaborate seamlessly, no matter where they are." \
  --voice=nova --model=tts-1-hd --output=demo-voiceover.mp3
```

### 2. In-App Audio

```bash
# Generate notification sounds
node generate-audio.js "Task completed" --voice=shimmer --output=task-complete.mp3
node generate-audio.js "New message received" --voice=shimmer --output=new-message.mp3
```

### 3. Tutorial Audio

```bash
# Generate step-by-step instructions
node generate-audio.js "Step one: Click the Create button. 
Step two: Enter your project name. 
Step three: Click Save." \
  --voice=echo --speed=0.9 --output=tutorial.mp3
```

## Integration with Projects

### Workflow

```
1. Write script (text to be spoken)
2. Choose appropriate voice
3. Generate audio
4. Review and adjust if needed
5. Place in project (public/audio/)
6. Integrate into application
```

### Example Session

```
Task: Create welcome audio for app-5 onboarding

Script:
"Hi there! Welcome to BudgetBuddy. I'm here to help you 
take control of your finances. Let's start by connecting 
your first bank account."

$ node .claude/scripts/apis/generate-audio.js "[script]" \
    --voice=nova --model=tts-1-hd

Output: generated/audio-2025-12-22T10-45-00.mp3

Next: Move to public/audio/welcome.mp3
      Add to OnboardingWelcome component
```

## Speed Settings

| Speed | Effect | Use For |
|-------|--------|---------|
| 0.75 | Slow, deliberate | Complex instructions |
| 1.0 | Normal | Most content |
| 1.25 | Slightly fast | Quick updates |
| 1.5 | Fast | Notifications |

## Output

Audio saved to: `./generated/audio-{timestamp}.mp3`

Format: MP3 (compatible with all browsers and devices)

