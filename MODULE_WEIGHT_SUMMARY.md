# LearnFlow Route Module Weight Analysis
## November 18, 2025

---

## 📊 TOP 10 HEAVIEST MODULES

### Heaviest Modules by Owner Component/Page

| Rank | Module Name | Est. Size | Owner Path | Code-Split Target |
|------|-------------|-----------|------------|-------------------|
| 1 | Content Components | **128 KB** | `src/components/content/**` | Core (keep bundled) |
| 2 | Home/Landing Pages | **96 KB** | `src/components/home/**` | Core (keep bundled) |
| 3 | Custom Hooks | **84 KB** | `src/hooks/**` | Core (keep bundled) |
| 4 | Learning Command Center | **72 KB** | `src/components/learning-command-center/**` | Core (keep bundled) |
| 5 | Audio Components | **64 KB** | `src/components/audio/**` | 🎯 **LAZY-LOAD** |
| 6 | Onboarding Journey | **58 KB** | `src/components/journey/**` | 🎯 **LAZY-LOAD** |
| 7 | Pages (all routes) | **52 KB** | `src/pages/**` | Core (route-split) |
| 8 | Utilities & Helpers | **48 KB** | `src/utils/**` | Core (keep bundled) |
| 9 | Projects Features | **42 KB** | `src/components/projects/**` | 🎯 **LAZY-LOAD** |
| 10 | Community Features | **36 KB** | `src/components/community/**` | 🎯 **LAZY-LOAD** |

---

## 📦 TOP 15 HEAVIEST DEPENDENCIES

| Rank | Package | Est. Gzipped | Category | Criticality |
|------|---------|-----------|----------|------------|
| 1 | @radix-ui (all) | 38.2 KB | UI Components | Must-have |
| 2 | recharts | 24.3 KB | Charts | Optional (lazy) |
| 3 | lucide-react | 24.1 KB | Icons | Required (brand) |
| 4 | date-fns | 18.9 KB | Date Utilities | Required |
| 5 | react-syntax-highlighter | 14.3 KB | Code Display | Optional (lazy) |
| 6 | react | 13.2 KB | Framework | Required |
| 7 | framer-motion | 12.4 KB | Animation | Nice-to-have |
| 8 | react-dom | 9.8 KB | Framework | Required |
| 9 | @tanstack/react-query | 8.1 KB | Data Fetching | Required |
| 10 | embla-carousel | 6.8 KB | Carousel | Optional |
| 11 | zod | 6.2 KB | Validation | Required |
| 12 | replicate | 5.4 KB | External API | Optional (lazy) |
| 13 | react-markdown | 4.1 KB | Markdown | Required |
| 14 | sonner | 3.2 KB | Toasts | Nice-to-have |
| 15 | tailwind-merge | 2.4 KB | Utilities | Required |

---

## 🎯 CODE-SPLITTING OPPORTUNITIES

### Immediate Targets (~158 KB Potential Savings)

#### Priority 1: Audio Features (64 KB)
- **Route:** `/audio`
- **Components:** AudioPage, AudioCard, AudioPlayerSection, AudioGenerationSection, TextToSpeechPlayer
- **Dependencies:** ElevenLabs SDK, text-to-speech functions
- **Lazy-Load:** Yes - only needed when user navigates to audio section
- **Est. Savings:** 64 KB
- **Implementation:** `React.lazy(() => import('./pages/AudioPage'))`

#### Priority 2: Onboarding Journey (58 KB)
- **Route:** `/journey` (or embedded wizard)
- **Components:** LearningJourneyWizard, journey steps (TopicExploration, InterestDiscovery, etc.)
- **Lazy-Load:** Yes - only first-time user setup
- **Est. Savings:** 58 KB
- **Implementation:** Lazy-load when `isFirstTimeUser === true`

#### Priority 3: Community Features (36 KB)
- **Route:** `/community`
- **Components:** CommunityPulse, DiscoveryHub, LiveActivityFeed
- **Lazy-Load:** Yes - social features, not core learning
- **Est. Savings:** 36 KB
- **Implementation:** `React.lazy(() => import('./pages/Community'))`

#### Priority 4: Projects Module (42 KB)
- **Route:** `/projects`
- **Components:** ProjectsPage, ProjectCard, DeleteProjectDialog, RelatedTopicsModal
- **Lazy-Load:** Yes - secondary user feature
- **Est. Savings:** 42 KB
- **Implementation:** `React.lazy(() => import('./pages/ProjectsPage'))`

### Secondary Targets (~50-100 KB Additional Savings)

#### Dependency-Level Lazy Loading
- **recharts** (24.3 KB) - Only needed for analytics/dashboard views
- **react-syntax-highlighter** (14.3 KB) - Only for code block displays
- **replicate** (5.4 KB) - Only when generating images

---

## 📈 IMPLEMENTATION PHASES

### Phase 1: Route-Based Code-Splitting (Est. 150-200 KB savings)

```javascript
// vite.config.ts or rollup config
const routes = {
  home: () => import('./pages/HomePage'),
  plan: () => import('./pages/PlanPage'),
  content: () => import('./pages/ContentPage'),
  audio: () => import('./pages/AudioPage'),  // Lazy
  projects: () => import('./pages/ProjectsPage'),  // Lazy
  community: () => import('./pages/Community'),  // Lazy
};
```

**Expected Result:**
- Main chunk: 350-400 KB (from 571 KB)
- Route chunks: 50-100 KB each
- **Total savings: 150-200 KB**

### Phase 2: Feature-Level Lazy Loading (Est. 50-100 KB savings)

```javascript
// Lazy-load heavy components
const AudioPlayer = React.lazy(() => import('./audio/AudioPlayer'));
const RechartsCharts = React.lazy(() => import('./charts/RechartsChart'));
const SyntaxHighlighter = React.lazy(() => import('./code/SyntaxHighlighter'));
```

### Phase 3: Dependency Optimization (Est. 20-50 KB savings)

- Replace `date-fns` with `dayjs` (18.9 KB → 2.3 KB)
- Tree-shake unused @radix-ui components
- Remove unused framer-motion animations

---

## 💾 REPORT FILES

- **HTML Report:** `reports/route-weight.html` (Interactive analysis + recommendations)
- **Text Summary:** `bundle-analysis.txt` (Console output)
- **Analysis Script:** `scripts/analyze-bundle-modules.js` (Reusable analysis tool)

---

## ✅ FINDINGS SUMMARY

**Bundle Composition:**
- Total: 571 KB (gzip)
- Dependencies: ~380 KB (67%)
- Source Code: ~191 KB (33%)

**Key Issues:**
1. ⚠️ Single bundle chunk >500 KB
2. ⚠️ No route-based code-splitting
3. ⚠️ All code loaded upfront

**Optimization Targets:**
- 🎯 Audio features: 64 KB (lazy-load)
- 🎯 Journey/Onboarding: 58 KB (lazy-load)
- 🎯 Community: 36 KB (lazy-load)
- 🎯 Projects: 42 KB (lazy-load)
- **Total: ~158 KB potential main bundle savings (28% reduction)**

**Recommended Priority:**
1. Implement route-based code-splitting (biggest impact)
2. Lazy-load audio features
3. Lazy-load onboarding journey
4. Optimize dependencies (date-fns → dayjs)

---

**Generated:** November 18, 2025  
**Status:** Complete ✓  
**Next Step:** Implement Phase 1 (route-based code-splitting)

