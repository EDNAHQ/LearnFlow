# Presentation Image Generation System

## Overview

The presentation mode now supports AI-generated images to create visually stunning slides. Images are generated using Replicate's Qwen model and automatically integrated into your presentations.

## Architecture

### Components

1. **Supabase Edge Function** (`supabase/functions/generate-presentation-image`)
   - Calls Replicate API to generate images
   - Stores images in Supabase Storage (`presentation_images` bucket)
   - Updates `learning_steps` table with image URLs

2. **Frontend Utilities**
   - `imagePromptGenerator.ts` - Smart prompt generation based on slide content
   - `generatePresentationImage.ts` - Edge function client
   - `usePresentationImages.tsx` - React hook for managing image loading

3. **UI Components**
   - `PresentationSlide.tsx` - Renders three image layouts:
     - **Hero Layout**: Full-screen background for title slides
     - **Split-Screen**: Image + content side-by-side for concepts
     - **Standard**: Text-only slides (no image)

## Image Types

### 1. Hero Images (Full Background)
- **When**: First slide or slides with h1/h2 headings
- **Layout**: Full-screen background with gradient overlay + glassmorphic text card
- **Best for**: Topic introductions, section breaks

### 2. Concept Images (Split-Screen)
- **When**: Slides with keywords like "concept", "architecture", "system"
- **Layout**: Image on left (50%), content on right (50%)
- **Best for**: Explaining technical concepts, architectures

### 3. Technical Images (Split-Screen)
- **When**: Slides with keywords like "infrastructure", "workflow", "database"
- **Layout**: Same as concept images
- **Best for**: Technical diagrams, system architecture

## Setup

### 1. Create Supabase Storage Bucket

```sql
-- Create the presentation_images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('presentation_images', 'presentation_images', true);

-- Set up storage policies
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'presentation_images');

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'presentation_images' AND auth.role() = 'authenticated');
```

### 2. Add Database Column

```sql
-- Add presentation_image_url to learning_steps table
ALTER TABLE learning_steps
ADD COLUMN presentation_image_url TEXT;
```

### 3. Set Environment Variables

Ensure `REPLICATE_API_TOKEN` is set in Supabase Edge Function secrets:

```bash
supabase secrets set REPLICATE_API_TOKEN=your_token_here
```

## Usage

### Automatic Generation (Recommended)

Images are automatically generated for eligible slides when using the `usePresentationImages` hook:

```typescript
import { usePresentationImages } from '@/hooks/usePresentationImages';

const { slides, loadingImages, isLoading } = usePresentationImages(
  originalSlides,
  topic,
  true // enabled
);
```

### Manual Generation

Generate an image for a specific slide:

```typescript
import { generatePresentationImage } from '@/utils/presentation/generatePresentationImage';

const result = await generatePresentationImage({
  prompt: 'Abstract visualization of machine learning neural networks',
  stepId: 'step-123',
  topic: 'Machine Learning Basics',
});

if (result.success) {
  console.log('Image URL:', result.imageUrl);
}
```

### Custom Prompts

Override the automatic prompt generation:

```typescript
import { generateImagePrompt } from '@/utils/presentation/imagePromptGenerator';

const { prompt, type } = generateImagePrompt(
  slideContent,
  'Custom Topic',
  0, // slide index
  10 // total slides
);
```

## Image Generation Strategy

### Smart Detection

Images are generated for:
- ✅ First slide (hero image)
- ✅ Slides with section headings (# or ##)
- ✅ Slides with architectural/technical keywords
- ✅ Conceptual explanations
- ❌ Code blocks
- ❌ Very short text slides

### Cost Optimization

1. **Selective Generation**: Only ~10-20% of slides get images
2. **Caching**: Generated images are stored and reused
3. **Batch Processing**: Generate during content creation, not on-demand

## Prompt Engineering

All prompts are automatically enhanced with brand styling:

```
"{user_prompt}, modern minimalist style,
purple and pink gradient colors,
professional tech aesthetic, 4k,
high quality, clean composition"
```

### Example Prompts by Type

**Hero:**
```
"Abstract digital visualization representing 'Machine Learning',
modern tech aesthetic with flowing lines and nodes,
gradient colors transitioning from deep purple to vibrant pink"
```

**Technical:**
```
"Clean technical diagram illustrating database architecture,
minimalist vector style, purple and pink accent colors,
white background, professional and modern"
```

**Concept:**
```
"Abstract conceptual visualization of REST API principles,
geometric shapes and flowing forms,
gradient from purple to pink, modern and sophisticated"
```

## Performance

- **Generation Time**: ~10-60 seconds per image
- **Image Size**: ~200-500KB (WebP format)
- **Storage**: Supabase Storage bucket (`presentation_images`)
- **Caching**: Images cached indefinitely until deleted

## Troubleshooting

### Images Not Generating

1. Check Replicate API token is set correctly
2. Verify `presentation_images` bucket exists
3. Check Edge Function logs: `supabase functions logs generate-presentation-image`

### Slow Generation

- Images generate asynchronously in background
- UI shows loading states while generating
- Consider pre-generating during content creation

### Image Quality

- Qwen model produces high-quality 4K images
- Prompts are automatically enhanced for brand consistency
- Adjust `num_inference_steps` in edge function for quality vs speed

## Future Enhancements

- [ ] Diagram generation for code architecture
- [ ] Comparison layouts (before/after, A vs B)
- [ ] Ambient backgrounds for all slides
- [ ] User-customizable prompt templates
- [ ] Image regeneration UI
- [ ] Alternative models (DALL-E, Stable Diffusion)