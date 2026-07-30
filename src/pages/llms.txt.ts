export function GET() {
  return new Response(`## TurnsTo

TurnsTo is an English-first collection of small, browser-local conversion tools.

### Tools
- /tools/pet-age — Estimates human-equivalent ages for 8 companion animal categories. Dogs use size-aware milestones; cats use life-stage milestones; other categories use lifespan-scaled comparisons. Results are not veterinary assessments.
- /tools/color — Converts among HEX, RGB, HSL, and OKLCH; accepts pasted color values and provides WCAG contrast ratios against black and white.
- /tools/screen-ruler — Calibrates a display using its diagonal and aspect ratio, then renders a shareable on-screen ruler in centimeters and inches.

### Product principles
- No account is required.
- Calculator input is represented in URL query parameters so results can be shared.
- Interactive controls are progressively enhanced; explanatory content is available in the server-rendered HTML.
`, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
