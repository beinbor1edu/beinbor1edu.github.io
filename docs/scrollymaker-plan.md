# ScrollyMaker Project Plan

## Vision
ScrollyMaker is a WYSIWYG-style scrollytelling editor that lets educators and content creators assemble interactive, media-rich narratives and then export them as Squarespace-friendly embed bundles built with HTML, CSS, JavaScript, and GSAP ScrollTrigger loaded from a CDN.

The core product goal is to make advanced scrollytelling feel like page building instead of custom front-end development, while still giving technical users clean hooks for customization.

## Primary product goals
1. **WYSIWYG authoring** for scroll-driven stories made of reusable sections and blocks.
2. **Easy Squarespace insertion** through copy-paste embeds, code blocks, and lightweight asset hosting patterns.
3. **Rich media support** including text, images, video, audio, embeds, 3D assets, and data visualization.
4. **Animation without build tooling** by relying on GSAP/ScrollTrigger via CDN and plain web technologies.
5. **Accessible by default** with guardrails for keyboard access, reduced motion, semantics, captions, and contrast.
6. **Responsive by design** for mobile, tablet, and desktop layouts.
7. **Themeable CSS tokens** so colors, spacing, typography, and borders update globally from shared variables.

## Ideal users
- Educators building interactive learning modules.
- Journalists and storytellers building explainers.
- Marketers creating immersive case studies or product narratives.
- Designers who need richer web storytelling without a full custom code workflow.
- Developers who want a fast starter that can still be extended manually.

## Core use cases
### 1. Learning experiences
- Scroll through a lesson with staged text reveals.
- Tie a 3D model rotation or camera movement to scroll progress.
- Animate charts or diagrams as the learner advances.
- Mix narration audio, captions, quiz-like prompts, and supplementary embeds.

### 2. Interactive explainers
- Pin key scenes while text steps advance.
- Transition between images, charts, maps, and annotated media.
- Let users switch from scroll control to direct manipulation with touch or mouse.

### 3. Squarespace publishing
- Build in ScrollyMaker.
- Export a self-contained package or a hosted asset bundle plus a short embed snippet.
- Paste the embed into a Squarespace Code Block with minimal manual setup.

## Product principles
- **Progressive power:** simple defaults for non-technical users, advanced panels for technical refinement.
- **Portable output:** exported experiences should work outside the editor.
- **Declarative authoring:** author content and behaviors through configuration instead of handwritten animation code where possible.
- **Composable sections:** sections should stack cleanly and remain reusable.
- **Performance-aware:** media-heavy stories should degrade gracefully on constrained devices.
- **Accessible motion:** animations should support reduced-motion alternatives.

## Recommended technical approach
### Runtime stack
- **HTML** for exported document structure.
- **CSS** with custom properties for theming and spacing.
- **Vanilla JavaScript** for editor output/runtime glue.
- **GSAP + ScrollTrigger via CDN** for timeline and scroll orchestration.

### Suggested optional integrations
These can remain optional plugins so the base output stays simple.
- **3D:** model-viewer for easy embeds, with optional Three.js adapter for advanced scenes.
- **Data viz:** D3.js, Observable-style embeds, or lightweight chart adapters.
- **Video:** native HTML5 video, Vimeo, YouTube wrappers.
- **Audio:** native audio plus transcript/caption support.
- **Embeds:** iframe wrapper blocks with aspect-ratio and lazy-load support.

## Proposed architecture
### 1. Authoring model
Use a schema-driven document model:
- **Project**
  - metadata
  - theme tokens
  - global assets
  - sections[]
- **Section**
  - layout type
  - narrative steps
  - pinned/sticky behavior
  - background/media
  - contained blocks[]
  - timeline settings
- **Block/Component**
  - text
  - image
  - video
  - audio
  - chart
  - 3D viewer
  - embed
  - callout
  - button
  - hotspot/annotation

The editor should save projects as JSON, then render/export them into HTML/CSS/JS bundles.

### 2. Editor surface
The editor can be split into five areas:
1. **Canvas preview** with live scroll simulation.
2. **Section outline** for ordering and structure.
3. **Component library** for dragging blocks into sections.
4. **Properties panel** for layout, content, theme, accessibility, and animation settings.
5. **Timeline/trigger panel** for scroll ranges, pinning, scrub, and transitions.

### 3. Export system
Support multiple export modes:
- **Embed snippet export:** JS/CSS/HTML snippet for Squarespace Code Blocks.
- **Hosted package export:** upload generated assets somewhere stable and paste a single embed wrapper into Squarespace.
- **Standalone export:** plain files for any static host.

### 4. Squarespace integration strategy
Because Squarespace can be restrictive, optimize for low-friction insertion:
- Export a **single mount container** like `<div id="scrollymaker-story"></div>`.
- Load CSS and JS from one or two hosted files when possible.
- Prefer **scoped CSS** to avoid collisions with Squarespace styles.
- Avoid assumptions about global resets or page width.
- Provide presets for:
  - full-width section
  - inset narrative section
  - sticky side-by-side explainer
  - stacked mobile-safe layout
- Include a **Squarespace checklist** in exports:
  - where to paste HTML
  - where to paste optional header scripts
  - how to avoid duplicate CDN injections
  - how to size spacers and full-bleed containers

## Content/component system
### Essential first-wave components
1. **Rich text block**
   - headings, paragraphs, lists, pull quotes
   - inline links and emphasis
2. **Image block**
   - alt text, caption, focal point, responsive sources
3. **Video block**
   - autoplay rules, captions, poster, mute/loop controls
4. **Audio block**
   - transcript support, captions where applicable, waveform option later
5. **Embed block**
   - iframe, form, map, external interactive
6. **Callout/stat block**
   - highlight important teaching moments or key numbers
7. **Button/link block**
   - jump to section, open modal, external link

### Advanced second-wave components
8. **3D asset block**
   - model source (GLB/USDZ where supported)
   - camera presets
   - scroll-linked rotation/translation
   - optional user orbit controls on desktop/mobile
   - annotations and hotspots
9. **Data visualization block**
   - simple charts from CSV/JSON
   - step-based state changes tied to scroll
   - optional hover/tap exploration mode
10. **Annotation layer**
   - pin labels to images, charts, or 3D scenes
11. **Comparison block**
   - before/after slider or side-by-side transitions
12. **Timeline/process block**
   - ideal for lessons and historical sequences
13. **Knowledge check block**
   - lightweight formative prompts or reveal answers

## Scroll behavior model
The editor should let users configure behaviors without writing code.

### Section-level scroll patterns
- Standard enter/exit reveal.
- Sticky/pinned scene with progressing steps.
- Parallax backgrounds.
- Scroll-scrubbed media progress.
- Step narrative with active state changes.
- Horizontal-on-vertical scroll sections.
- Chapter breaks with full-screen transitions.

### Component-level animation options
- Fade, slide, scale, blur, mask reveal.
- SVG path draw.
- Number/count-up animation.
- Chart/data state transitions.
- 3D transform and camera keyframes.
- Audio/video cue points.

### Interaction layering
Allow both **scroll-driven** and **direct interaction** modes:
- A 3D object rotates on scroll until the user drags it.
- A chart changes by scroll step, then supports hover/tap exploration.
- A map pans by scroll, then allows pinch/zoom or tooltip interaction.

This dual-mode approach is especially important for education because learners may want both guided sequencing and self-directed exploration.

## Accessibility requirements
Accessibility should be designed into the model, not treated as cleanup.

### Must-have accessibility features
- Semantic heading structure per section.
- Alt text and long-description support for images and charts.
- Captions/subtitles for video.
- Transcript support for audio.
- Keyboard access for all interactive controls.
- Visible focus states.
- Color contrast checking in the editor.
- Reduced-motion mode with simplified transitions.
- Non-scroll fallbacks so important content remains reachable.
- Screen-reader-safe handling for pinned/sticky scenes.
- Pause/stop controls for auto-playing or motion-heavy media.

### Accessibility-specific product guardrails
- Warn if a component lacks alt text, captions, or transcript fields.
- Warn if color tokens create low contrast.
- Preview reduced-motion behavior in the editor.
- Let users mark decorative assets as hidden from assistive tech.
- Require text equivalents for essential data visualizations.

## Responsive strategy
Mobile and tablet should not be an afterthought.

### Layout rules
- Sections should support desktop, tablet, and mobile overrides.
- Sticky side-by-side layouts should collapse into stacked layouts on narrow screens.
- Animation intensity should scale down on low-height or touch-first viewports.
- Tap targets should meet accessible sizing.
- Media should use aspect-ratio constraints and lazy loading.

### Device-specific behavior
- Allow per-breakpoint control over:
  - pinning enabled/disabled
  - asset quality level
  - animation complexity
  - text size and spacing
  - media swap options
- For 3D and data-heavy experiences, provide graceful fallbacks:
  - static poster or video fallback
  - simplified chart image + text summary
  - alternate no-WebGL content path

## CSS system plan
A tokenized CSS structure is a strong fit for your requirement that one color update every related usage.

### CSS architecture
Use layers of custom properties:
1. **Core tokens**: brand/system colors, spacing, typography, radius, shadows.
2. **Semantic tokens**: text, background, accent, border, muted, success, warning.
3. **Component tokens**: section backgrounds, card borders, button colors, chart palette slots.
4. **Section overrides**: local token changes for a specific chapter/scene.

### Example token model
```css
:root {
  --color-brand-1: #1d4ed8;
  --color-brand-2: #0f172a;
  --color-surface-1: #ffffff;
  --color-surface-2: #f8fafc;
  --color-text-1: #0f172a;
  --color-text-2: #475569;
  --color-border-1: #cbd5e1;

  --theme-accent: var(--color-brand-1);
  --theme-bg: var(--color-surface-1);
  --theme-bg-alt: var(--color-surface-2);
  --theme-text: var(--color-text-1);
  --theme-text-muted: var(--color-text-2);
  --theme-border: var(--color-border-1);

  --section-bg: var(--theme-bg);
  --section-text: var(--theme-text);
  --section-border: var(--theme-border);
  --button-bg: var(--theme-accent);
  --button-text: #ffffff;
}
```

This lets one brand color update:
- buttons
- links
- key borders
- chart accents
- annotation highlights
- focus rings if desired

### CSS implementation guidance
- Scope exported styles under a story root class such as `.sm-story`.
- Use semantic variables instead of hard-coded per-component colors.
- Let sections override tokens with inline variables or section-specific classes.
- Use `clamp()` for fluid type and spacing.
- Include light/dark theme support.
- Consider cascade layers for base, components, utilities, and overrides.

## Data model sketch
A project JSON could look roughly like:
```json
{
  "meta": {
    "title": "Example lesson",
    "slug": "example-lesson"
  },
  "theme": {
    "accent": "#1d4ed8",
    "background": "#ffffff",
    "text": "#0f172a",
    "border": "#cbd5e1"
  },
  "sections": [
    {
      "id": "intro",
      "layout": "hero-sticky",
      "scrollMode": "pinned-steps",
      "blocks": [
        {
          "type": "text",
          "content": "Intro copy"
        },
        {
          "type": "model3d",
          "src": "model.glb",
          "interaction": {
            "scrollLinked": true,
            "dragEnabled": true
          }
        }
      ]
    }
  ]
}
```

## Suggested milestones
### Phase 1: Proof of concept
- Build runtime output for a small set of sections.
- Support text, image, video, and sticky narrative steps.
- Add GSAP/ScrollTrigger orchestration through CDN.
- Export a Squarespace-compatible embed example.

### Phase 2: Editor foundation
- Add section list, canvas preview, and properties panel.
- Save/load project JSON.
- Add theme token editing.
- Add accessibility validation warnings.

### Phase 3: Advanced media
- Add 3D block.
- Add basic chart/data block.
- Add annotations and step-driven transitions.
- Improve mobile/touch interactions.

### Phase 4: Publishing polish
- Add export presets for Squarespace and generic static hosting.
- Add performance budget checks.
- Add reduced-motion preview and fallbacks.
- Create starter templates for education-focused stories.

## Risks and design tensions to plan for
- **Squarespace code injection limits** may affect how global assets are loaded.
- **3D performance** can vary drastically on older mobile devices.
- **Pinned sections** can create accessibility and viewport-height issues on mobile browsers.
- **WYSIWYG accuracy** may diverge from final embedded behavior if Squarespace styles interfere.
- **External embeds** can create layout, privacy, and performance problems.
- **Data visualization authoring** can become a product unto itself if not scoped carefully.

## Early success metrics
- Time required to publish a first story to Squarespace.
- Percentage of stories published without hand-editing code.
- Lighthouse/performance/accessibility baseline on mobile.
- Number of reusable templates/components adopted by educators.
- Completion rate for readers on learning experiences.

## Immediate product questions that come to mind
### Publishing and Squarespace
1. Should ScrollyMaker export **fully self-contained snippets**, or is it acceptable to host shared CSS/JS assets externally and only paste a short embed into Squarespace?
2. Which Squarespace version(s) matter most: **7.0, 7.1, Fluid Engine**, or multiple?
3. Are users comfortable adding code to **header/footer injection areas**, or should the tool assume only a **single Code Block** is available?
4. Do you want stories to live **inline within an existing page**, or often as **full landing pages**?

### Editor scope
5. How WYSIWYG should the first version be: true drag-and-drop visual editing, or a structured block editor with a strong live preview?
6. Should the first release prioritize **template assembly** over freeform design?
7. Do you want collaborative authoring/version history in scope early, or should this stay single-author at first?

### 3D and interactivity
8. Is the 3D goal mostly **product/artefact viewing**, **scientific/educational models**, or more cinematic scene-based storytelling?
9. Do you need support for **annotated hotspots**, exploded views, or multiple model states?
10. Should scroll always be able to hand off to touch/mouse interaction, or only for selected components?
11. Is WebGL acceptable as an enhancement with fallback, or do you need a robust non-WebGL path from day one?

### Data visualization
12. Should charts be authored from **uploaded CSV/JSON**, connected to live data sources, or both?
13. Do you mainly need **standard charts** first, or more bespoke annotated diagrams/maps/process graphics?
14. Should users be able to define chart state changes visually, like “at step 3 highlight this series and update this annotation”?

### Accessibility and pedagogy
15. Are there accessibility standards you need to align to explicitly, such as **WCAG 2.2 AA**?
16. Do learning experiences need built-in supports like **glossary terms, checkpoints, knowledge checks, transcripts, or downloadable resources**?
17. Should there be a **reduced-motion preset** that is automatically generated for every project?
18. Will stories need multilingual/localized content?

### Media and content operations
19. Where will assets live: inside the tool, inside Squarespace, or on a separate CDN/storage bucket?
20. Do you want reusable asset libraries and component templates for teams?
21. Should video/audio support analytics, chapter markers, or narration sync?
22. Are there privacy/compliance requirements for student-facing experiences?

### Technical strategy
23. Is “no build step” a hard requirement only for exported stories, or also for the editor itself?
24. Should exported code be intentionally readable/editable by advanced users?
25. How important is offline/local authoring compared with a hosted web app?
26. Do you want a plugin system so new components like simulations or quizzes can be added later without changing the core editor?

## Recommended next step
The best next step is to define a **v1 product slice** with:
- 3 to 4 section templates
- 5 to 6 core components
- one 3D prototype path
- one data-viz prototype path
- one Squarespace publishing workflow
- one accessibility checklist baked into the editor

That would keep the first build focused while proving the most important publishing and learning-experience assumptions.
