---
name: translation
description: Use when you need to translate content - UI strings, documentation, or any text between languages
---

# Translation

## Overview

Translate text between languages using DeepL or Google Cloud Translation.

**Core principle:** Accurate, natural-sounding translations for your content.

## When to Use

- Internationalizing (i18n) your application
- Translating UI strings
- Creating multi-language documentation
- Translating user-generated content
- Communicating with international clients
- Localizing marketing content

## Setup

### API Keys Required

```bash
# For DeepL (recommended for quality)
DEEPL_API_KEY=...

# For Google Cloud Translation
GOOGLE_TRANSLATE_API_KEY=...
```

### Script Location

```
.claude/scripts/apis/translate.js
```

## Usage

### Basic

```bash
node .claude/scripts/apis/translate.js "Hello, how are you?" --target=es
```

### With Options

```bash
# Specify source language (faster)
node translate.js "Bonjour le monde" --target=en --source=fr

# Formal translation (DeepL)
node translate.js "Please complete this form" --target=de --formality=more

# Informal translation
node translate.js "Hey, what's up?" --target=es --formality=less

# Use Google instead
node translate.js "Thank you" --target=ja --provider=google

# Save to file
node translate.js "Welcome message" --target=es --output=welcome-es.txt
```

## Supported Languages

| Code | Language |
|------|----------|
| `EN` | English |
| `ES` | Spanish |
| `FR` | French |
| `DE` | German |
| `IT` | Italian |
| `PT` | Portuguese |
| `NL` | Dutch |
| `PL` | Polish |
| `RU` | Russian |
| `JA` | Japanese |
| `ZH` | Chinese |
| `KO` | Korean |

*And many more - see provider documentation for full list.*

## Provider Comparison

| Feature | DeepL | Google Translate |
|---------|-------|------------------|
| Quality | Excellent | Very Good |
| Formality control | Yes | No |
| Languages | 30+ | 100+ |
| Cost | ~$20/1M chars | ~$20/1M chars |
| Best for | European languages | Asian languages |

## Formality (DeepL Only)

| Setting | Use For |
|---------|---------|
| `default` | Automatic |
| `more` | Professional, formal content |
| `less` | Casual, friendly content |

### Example

```bash
# Formal (business email)
node translate.js "We would be pleased to assist you" --target=de --formality=more
# → "Wir würden uns freuen, Ihnen behilflich zu sein"

# Informal (app notification)  
node translate.js "Hey, you've got a new message!" --target=de --formality=less
# → "Hey, du hast eine neue Nachricht!"
```

## Use Cases

### 1. UI Internationalization

```bash
# Translate UI strings
node translate.js "Save changes" --target=es
# → "Guardar cambios"

node translate.js "Your profile has been updated" --target=fr
# → "Votre profil a été mis à jour"

node translate.js "Are you sure you want to delete this?" --target=de
# → "Möchten Sie dies wirklich löschen?"
```

### 2. Bulk Translation (i18n Files)

For translating entire locale files, create a script:

```javascript
// translate-locale.js
const translations = require('./locales/en.json');
const results = {};

for (const [key, value] of Object.entries(translations)) {
  // Call translate script for each string
  results[key] = await translate(value, 'es');
}

fs.writeFileSync('./locales/es.json', JSON.stringify(results, null, 2));
```

### 3. Documentation

```bash
# Translate README sections
node translate.js "## Getting Started

To install the package, run:
npm install my-package" --target=es

# Output: Spanish version of docs
```

### 4. User Content

```bash
# Translate user-submitted content
node translate.js "[user message]" --target=en
```

## Integration with Projects

### i18n Workflow

```
1. Write content in primary language (usually English)
2. Extract strings to locale file (en.json)
3. Translate to target languages using this skill
4. Review translations with native speakers
5. Place in locale files (es.json, fr.json, etc.)
```

### Example Session

```
Task: Add Spanish translations to app-1

$ node .claude/scripts/apis/translate.js "Welcome back!" --target=es
✅ "¡Bienvenido de nuevo!"

$ node translate.js "Your settings have been saved" --target=es
✅ "Tu configuración ha sido guardada"

$ node translate.js "Error: Please try again" --target=es
✅ "Error: Por favor, inténtalo de nuevo"

Next: Add to locales/es.json
```

## Quality Tips

### DO:
- Review translations with native speakers when possible
- Use formality settings appropriately
- Provide context if translating isolated strings
- Keep sentences simple for better translation

### DON'T:
- Blindly trust automated translation for critical content
- Translate idioms literally (rephrase first)
- Forget about text expansion (German is ~30% longer)
- Ignore cultural context

### Text Expansion

Budget for longer text in some languages:

| Language | Typical Expansion |
|----------|-------------------|
| German | +30% |
| French | +20% |
| Spanish | +15% |
| Japanese | -10% (but may need more height) |

## Output

```
🌐 Translating with deepl...
   Text: "Hello, how are you?"
   Target: ES

✅ Translation (EN → ES):

"Hola, ¿cómo estás?"
```

Saved to: `./generated/{filename}.txt` (if --output specified)

