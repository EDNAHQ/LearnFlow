---
name: visual-feedback-loop
description: Use when building UI/frontend features to continuously verify changes visually in the browser
---

# Visual Feedback Loop

## Overview

Continuously capture and analyze browser screenshots while building UI features. Every change gets visual verification before moving on.

**Core principle:** Don't trust code alone—see what users will see.

## When to Use

- Building new UI components
- Fixing visual bugs
- Implementing responsive layouts
- Any frontend work where appearance matters

## Requirements

### Screenshot Tool

You need ONE of these available:

**Option 1: Playwright (Recommended)**
```bash
npm install -D playwright
npx playwright install chromium
```

**Option 2: Puppeteer**
```bash
npm install puppeteer
```

**Option 3: System Screenshot (if browser is visible)**
```bash
# Windows: Use built-in screenshot or install
npm install -g screenshot-desktop

# Mac
screencapture -x screenshot.png
```

### Dev Server Running

Your app needs to be running locally:
```bash
npm run dev          # or equivalent
# Usually at http://localhost:3000 or similar
```

## The Loop

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   ┌─────────────┐                                           │
│   │ Make Change │ ◄────────────────────────────────┐        │
│   └──────┬──────┘                                  │        │
│          ▼                                         │        │
│   ┌─────────────┐                                  │        │
│   │ Wait for    │  (hot reload / rebuild)          │        │
│   │ Render      │                                  │        │
│   └──────┬──────┘                                  │        │
│          ▼                                         │        │
│   ┌─────────────┐                                  │        │
│   │ Capture     │  screenshot.png                  │        │
│   │ Screenshot  │                                  │        │
│   └──────┬──────┘                                  │        │
│          ▼                                         │        │
│   ┌─────────────┐                                  │        │
│   │ Analyze     │  "Is this right?"                │        │
│   │ Visually    │                                  │        │
│   └──────┬──────┘                                  │        │
│          ▼                                         │        │
│   ┌─────────────┐     ┌─────────────┐              │        │
│   │ Issues      │────►│ Fix Issues  │──────────────┘        │
│   │ Found?      │ yes └─────────────┘                       │
│   └──────┬──────┘                                           │
│          │ no                                               │
│          ▼                                                  │
│   ┌─────────────┐                                           │
│   │ ✅ Continue │                                           │
│   │ to Next     │                                           │
│   └─────────────┘                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Screenshot Script

Create `scripts/screenshot.js` in your project:

```javascript
// scripts/screenshot.js
const { chromium } = require('playwright');

async function captureScreenshot(url, outputPath, options = {}) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Set viewport (desktop default, or specify mobile)
  await page.setViewportSize(options.viewport || { width: 1280, height: 720 });
  
  await page.goto(url, { waitUntil: 'networkidle' });
  
  // Optional: wait for specific element
  if (options.waitFor) {
    await page.waitForSelector(options.waitFor);
  }
  
  // Optional: wait extra time for animations
  if (options.delay) {
    await page.waitForTimeout(options.delay);
  }
  
  await page.screenshot({ path: outputPath, fullPage: options.fullPage || false });
  await browser.close();
  
  console.log(`Screenshot saved: ${outputPath}`);
}

// CLI usage
const args = process.argv.slice(2);
const url = args[0] || 'http://localhost:3000';
const output = args[1] || 'screenshot.png';

captureScreenshot(url, output);
```

Usage:
```bash
node scripts/screenshot.js http://localhost:3000 screenshot.png
node scripts/screenshot.js http://localhost:3000/login login-page.png
```

## How to Use

### After Every Meaningful Change:

```
1. Make the code change
2. Run: node scripts/screenshot.js http://localhost:3000/page screenshot.png
3. View the screenshot (Claude can analyze images)
4. Evaluate: Does it look right?
5. If issues → fix and repeat
6. If good → continue to next change
```

### Visual Checklist for Each Screenshot

When analyzing, check:

- [ ] **Layout:** Elements positioned correctly?
- [ ] **Spacing:** Padding/margins look right?
- [ ] **Text:** Readable, not cut off, correct content?
- [ ] **Colors:** Match design/expectations?
- [ ] **Responsive:** (if testing mobile) Fits viewport?
- [ ] **Interactive elements:** Buttons/links visible?
- [ ] **Images:** Loading, correct size?
- [ ] **Alignment:** Things line up properly?

### Report Format

After analyzing screenshot:

```
📸 VISUAL CHECK: [page/component name]

✅ Looks Good:
- Header displays correctly
- Navigation links visible
- Main content centered

❌ Issues Found:
- Button text cut off on right side
- Footer overlapping content
- Missing padding on mobile

🔧 Fixing: Button text overflow...
```

## Responsive Testing

Test multiple viewports in sequence:

```javascript
// scripts/screenshot-responsive.js
const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'wide', width: 1920, height: 1080 },
];

// Capture all viewports
for (const vp of viewports) {
  await captureScreenshot(url, `screenshot-${vp.name}.png`, { viewport: vp });
}
```

Then analyze each:
```
"Checking mobile view... ❌ Menu icon missing
 Checking tablet view... ✅ Looks good
 Checking desktop view... ✅ Looks good
 Checking wide view... ❌ Content not centered"
```

## Autonomous Mode Additions

For AFK visual verification, add to your loop:

```markdown
## Visual Verification Steps

After implementing each UI task:

1. Capture screenshot of affected page(s)
2. Analyze for obvious issues:
   - Layout broken?
   - Text/elements cut off?
   - Completely wrong appearance?
3. If major issues: attempt fix and re-screenshot
4. If minor issues: log for human review
5. If looks good: continue

Log in progress.md:
- Screenshot captured: [timestamp]
- Analysis: [passed/issues found]
- Issues logged: [list if any]
```

## Common Visual Issues to Catch

| Issue | What to Look For |
|-------|------------------|
| Overflow | Text/elements cut off at edges |
| Z-index | Elements hidden behind others |
| Missing styles | Unstyled HTML (no CSS loaded) |
| Broken images | Placeholder boxes or missing images |
| Layout shift | Elements in wrong positions |
| White space | Unexpected gaps or overlaps |
| Font issues | Wrong font, size, or weight |
| Color contrast | Text hard to read |

## Integration with Other Skills

Use with:
- **prepare-autonomous-execution**: Add screenshot check to pre-flight
- **subagent-driven-development**: Each UI task gets visual verification
- **project-status**: Include "last visual check passed" in status

## Limitations

- Can't interact (hover states, clicks, animations)
- Static snapshot only
- Needs running dev server
- Headless browser may render slightly differently

For full interaction testing, consider adding Playwright test scripts for specific flows.

