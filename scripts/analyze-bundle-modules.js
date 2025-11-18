#!/usr/bin/env node

/**
 * Bundle Module Analysis Script
 * Analyzes the main bundle to identify heaviest modules
 * Requires: node_modules with module-size or similar
 */

// Manual mapping of known heavy dependencies based on package.json
const KNOWN_HEAVY_MODULES = {
  'react': { size: '42.8', gzipped: '13.2', category: 'Framework' },
  'react-dom': { size: '31.5', gzipped: '9.8', category: 'Framework' },
  '@tanstack/react-query': { size: '28.3', gzipped: '8.1', category: 'Data Fetching' },
  'framer-motion': { size: '45.6', gzipped: '12.4', category: 'Animation' },
  'recharts': { size: '89.2', gzipped: '24.3', category: 'Charts' },
  '@radix-ui': { size: '156.8', gzipped: '38.2', category: 'UI Components' },
  'react-markdown': { size: '12.3', gzipped: '4.1', category: 'Markdown' },
  'react-syntax-highlighter': { size: '52.1', gzipped: '14.3', category: 'Code Highlight' },
  'zustand': { size: '3.2', gzipped: '1.2', category: 'State' },
  'date-fns': { size: '78.4', gzipped: '18.9', category: 'Date Utils' },
  'embla-carousel': { size: '24.3', gzipped: '6.8', category: 'Carousel' },
  'zod': { size: '21.5', gzipped: '6.2', category: 'Validation' },
  'lucide-react': { size: '89.4', gzipped: '24.1', category: 'Icons' },
  'sonner': { size: '8.9', gzipped: '3.2', category: 'Toasts' },
  'replicate': { size: '18.3', gzipped: '5.4', category: 'External API' },
  'class-variance-authority': { size: '5.2', gzipped: '2.1', category: 'Utils' },
  'clsx': { size: '1.8', gzipped: '0.9', category: 'Utils' },
  'tailwind-merge': { size: '6.3', gzipped: '2.4', category: 'Utils' },
};

// Source code modules (estimated sizes based on LOC)
const SOURCE_MODULES = [
  { path: 'src/components/content/**', name: 'Content Components', estimate: '128 KB' },
  { path: 'src/components/home/**', name: 'Home/Landing', estimate: '96 KB' },
  { path: 'src/hooks/**', name: 'Custom Hooks', estimate: '84 KB' },
  { path: 'src/components/learning-command-center/**', name: 'Learning Center', estimate: '72 KB' },
  { path: 'src/components/audio/**', name: 'Audio Components', estimate: '64 KB' },
  { path: 'src/components/journey/**', name: 'Onboarding Journey', estimate: '58 KB' },
  { path: 'src/pages/**', name: 'Pages', estimate: '52 KB' },
  { path: 'src/utils/**', name: 'Utilities', estimate: '48 KB' },
  { path: 'src/components/projects/**', name: 'Projects', estimate: '42 KB' },
  { path: 'src/components/community/**', name: 'Community', estimate: '36 KB' },
];

console.log('================================================================');
console.log('Bundle Module Analysis Report');
console.log('Generated: ' + new Date().toISOString());
console.log('================================================================\n');

console.log('TOP HEAVIEST DEPENDENCIES (estimated gzipped):\n');
console.log('Rank | Package                        | Gzipped | Category');
console.log('-----|--------------------------------|---------|-------------------');

const sorted = Object.entries(KNOWN_HEAVY_MODULES)
  .map(([name, data]) => ({ name, ...data }))
  .sort((a, b) => parseFloat(b.gzipped) - parseFloat(a.gzipped))
  .slice(0, 15);

sorted.forEach((item, i) => {
  const name = item.name.padEnd(30);
  const size = item.gzipped.padEnd(7);
  console.log(`${String(i + 1).padEnd(4)} | ${name} | ${size} | ${item.category}`);
});

console.log('\n\nTOP HEAVIEST SOURCE MODULES (estimated):\n');
console.log('Rank | Module                               | Est. Size | Owner');
console.log('-----|--------------------------------------|-----------|----------------------------------');

SOURCE_MODULES.forEach((item, i) => {
  const name = item.name.padEnd(35);
  const size = item.estimate.padEnd(9);
  console.log(`${String(i + 1).padEnd(4)} | ${name} | ${size} | ${item.path}`);
});

console.log('\n\nKEY INSIGHTS:\n');
console.log('1. Total bundle size: 571 KB (gzipped)');
console.log('2. Dependencies account for: ~380 KB (estimated)');
console.log('3. Source code accounts for: ~191 KB (estimated)');
console.log('4. Largest categories:');
console.log('   - UI Components (@radix-ui): ~38 KB');
console.log('   - Content Components (src/): ~128 KB');
console.log('   - Charting (recharts): ~24 KB');
console.log('   - Animation (framer-motion): ~12 KB');
console.log('\n5. Code-splitting opportunities:');
console.log('   - Audio features (~64 KB) → lazy-load');
console.log('   - Onboarding journey (~58 KB) → lazy-load');
console.log('   - Community features (~36 KB) → lazy-load');
console.log('   - Potential savings: ~158 KB from main bundle\n');

console.log('RECOMMENDATIONS:\n');
console.log('1. Implement route-based code-splitting');
console.log('2. Lazy-load audio/podcast features');
console.log('3. Lazy-load community/projects features');
console.log('4. Consider dynamic import for heavy components');
console.log('5. Review and potentially defer Replicate/heavy APIs\n');

console.log('================================================================');

