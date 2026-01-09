---
description: Translate text to another language
arguments:
  - name: text
    description: "Text to translate, or 'file:<path>' for file, optionally prefix with 'to:<lang>'"
    required: true
---

Translate text following the translation skill.

**Usage:**
```
/translate Bonjour, comment allez-vous?
/translate to:spanish Hello, how are you?
/translate to:ja This is a test
/translate file:readme.md to:french
```

**Process:**
1. Detect source language (or use specified)
2. Translate to target (default: English)
3. Preserve formatting

**Output:**
```
## Translation

**From:** <source language>
**To:** <target language>

---

<translated text>

---

*Original:*
> <original text>
```

For code files, only translate comments and strings, preserve code structure.
