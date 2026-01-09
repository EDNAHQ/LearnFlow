---
name: image-generation
description: Use when you need to create images - hero images, icons, placeholders, marketing assets, or visual content
---

# Image Generation

## Overview

Generate images using AI (DALL-E or Stable Diffusion) for use in your projects.

**Core principle:** Describe what you need, get a usable image.

## When to Use

- Creating hero/banner images for landing pages
- Generating placeholder images during development
- Creating icons or illustrations
- Marketing assets and social media images
- Visual prototyping before designer involvement
- Any time you need an image and don't have one

## Setup

### API Keys Required

Add to your environment (`.env` or system):

```bash
# For DALL-E (OpenAI)
OPENAI_API_KEY=sk-...

# For Stable Diffusion (Replicate)
REPLICATE_API_TOKEN=r8_...
```

### Script Location

```
.claude/scripts/apis/generate-image.js
```

## Usage

### Basic

```bash
node .claude/scripts/apis/generate-image.js "a serene mountain landscape at sunset"
```

### With Options

```bash
# Specific size
node generate-image.js "app icon, minimal design" --size=512x512

# HD quality
node generate-image.js "professional headshot" --quality=hd

# Natural style (less stylized)
node generate-image.js "product photo" --style=natural

# Use Stable Diffusion instead
node generate-image.js "fantasy landscape" --provider=replicate

# Custom output name
node generate-image.js "hero banner" --output=hero.png
```

## Writing Good Prompts

### Structure

```
[Subject] + [Style] + [Details] + [Mood/Atmosphere]
```

### Examples

**Hero Image:**
```
"Modern SaaS dashboard interface, clean minimalist design, 
blue and white color scheme, professional, abstract data 
visualization elements, suitable for website hero section"
```

**App Icon:**
```
"App icon for a task management app, simple geometric design,
gradient from blue to purple, modern flat style, centered 
checkmark symbol, suitable for iOS app store"
```

**Product Image:**
```
"Sleek wireless headphones on white background, product 
photography style, soft shadows, high-end luxury feel,
studio lighting, e-commerce ready"
```

**Illustration:**
```
"Isometric illustration of a busy office workspace, 
colorful cartoon style, people working at computers,
plants and modern furniture, tech startup vibe"
```

## Best Practices

### DO:
- Be specific about style, colors, and mood
- Mention the intended use (hero, icon, etc.)
- Include technical requirements (background, size context)
- Describe what you DON'T want if relevant

### DON'T:
- Use vague descriptions ("a nice image")
- Request text in images (AI struggles with text)
- Expect exact brand logos or copyrighted content
- Request real people's likenesses

## Integration with Projects

### Workflow

```
1. Identify image need (hero for landing page)
2. Consider brand context (colors, style)
3. Write descriptive prompt
4. Generate image
5. Review and iterate if needed
6. Place in project (public/images/)
7. Update component to use image
```

### Example Session

```
Task: Create hero image for app-2 landing page

Context:
- app-2 is a finance dashboard
- Brand colors: dark blue (#1a365d), gold accents
- Modern, professional feel

Prompt:
"Modern financial dashboard visualization, dark blue background,
gold and white accent colors, abstract charts and graphs floating
in 3D space, professional and trustworthy mood, clean lines,
suitable for website hero banner, wide aspect ratio feel"

$ node .claude/scripts/apis/generate-image.js "[prompt]" --size=1792x1024

Output: generated/image-2025-12-22T10-30-00.png

Next: Move to public/images/hero.png and update Hero component
```

## Provider Comparison

| Feature | DALL-E 3 | Stable Diffusion |
|---------|----------|------------------|
| Quality | Excellent | Very Good |
| Speed | Fast (~10s) | Moderate (~20-30s) |
| Style | Artistic, polished | More varied |
| Cost | ~$0.04/image | ~$0.01/image |
| Text in images | Better | Struggles |
| Photorealism | Good | Excellent |

## Sizes

### DALL-E 3

- `1024x1024` (square, default)
- `1792x1024` (landscape)
- `1024x1792` (portrait)

### Replicate/SD

Any size divisible by 8, e.g.:
- `512x512`
- `768x768`
- `1024x1024`
- `1280x720`

## Iteration

If first result isn't right:

1. **Adjust prompt** - Be more specific about what was wrong
2. **Try different style** - vivid vs natural
3. **Try other provider** - DALL-E vs Replicate
4. **Generate variations** - Run same prompt again

## Output

Images saved to: `./generated/image-{timestamp}.png`

Move to appropriate location in your project after reviewing.

