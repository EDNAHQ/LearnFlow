
# CSS Structure

This directory contains modular CSS files for better organization and maintainability:

- `base.css`: Contains Tailwind directives, CSS variables, and base styles
- `components.css`: Component-specific classes like cards, panels, buttons 
- `animations.css`: Animation keyframes, transitions, and related utilities
- `content.css`: Styles specific to content rendering (markdown, typography)
- `legacy.css`: Contains styles from the original App.css file for backward compatibility

## Usage

All files are imported in `src/index.css`, which is the main entry point for styles in the application.

## Guidelines

When adding new styles:
1. Place them in the appropriate file based on their purpose
2. Use Tailwind classes when possible instead of custom CSS
3. Follow the existing naming conventions
4. Add comments for complex or non-obvious styles
