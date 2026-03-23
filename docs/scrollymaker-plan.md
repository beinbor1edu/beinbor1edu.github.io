# ScrollyMaker Unified Engineering Specification

Version: Draft – Consolidated for AI-assisted development.

This document is the working specification for ScrollyMaker: a WYSIWYG-style scrollytelling system for authoring and exporting interactive stories that can be embedded into Squarespace pages and other CMS environments.

It is intended to reduce ambiguity for future implementation work by aligning the editor, story schema, runtime engine, export pipeline, accessibility expectations, and Squarespace publishing model.

## System overview
ScrollyMaker has three layers:

1. **Editor**: React + TypeScript authoring environment.
2. **Story JSON**: portable schema shared between authoring and playback.
3. **Runtime engine**: framework-free HTML/CSS/JavaScript playback layer powered by GSAP + ScrollTrigger via CDN.

The runtime engine is the source of truth for playback behavior. The editor's job is to generate story JSON that the runtime can execute without modification.

## Product goals
- Make advanced scrollytelling feel approachable to non-developers.
- Keep exported stories portable and CMS-friendly.
- Support educational storytelling with text, image, video, audio, embeds, 3D assets, and data visualization.
- Preserve a framework-free runtime so stories can be embedded in systems like Squarespace with minimal friction.
- Bake in accessibility, responsive design, and reduced-motion support.
- Use CSS custom properties so one theme token can update related fonts, borders, backgrounds, chart accents, and interaction styles globally.

## Target users
- Educators creating interactive lessons and explainers.
- Designers and content teams producing immersive narratives.
- Developers who want a structured editor but readable exported code.
- CMS publishers who need copy-paste-friendly embeds for Squarespace.

## Architectural principles
1. Runtime must remain framework-free.
2. Story data must remain portable JSON.
3. Components must be declared globally and referenced by steps.
4. Steps modify component state, not component existence.
5. Animations are state-driven and implemented inside components.
6. Runtime must support CMS embedding and static hosting.
7. The editor must never invent runtime-only behavior that cannot be expressed in the story schema.

## Canonical story schema
The canonical structure is:

```text
story
 ├ components
 ├ sections
 │   └ steps
 │       └ componentStates
 └ theme
```

Components are declared once and reused across steps.

### Canonical example
```json
{
  "components": {
    "chart1": {
      "type": "chart"
    }
  },
  "sections": [
    {
      "layout": "text-graphic",
      "steps": [
        {
          "componentStates": [
            {
              "id": "chart1",
              "slot": "media",
              "state": "overview"
            }
          ]
        }
      ]
    }
  ],
  "theme": {}
}
```

### Schema rules
- `components` is a global registry for all component definitions.
- `sections` define story structure and layout.
- `steps` define narrative progression within a section.
- `componentStates` tell the runtime which globally defined component appears in which layout slot and which state it should take on during the step.
- `theme` contains portable design tokens used by the runtime CSS layer.

## Layout system
Layouts define the visual structure for each section.

### Minimum MVP layouts
- `text-graphic`
- `fullscreen`
- `overlay`

### Layout contract
Each layout defines one or more named slots. Example for `text-graphic`:

```text
text-graphic

slots:
- text
- media
```

Example component placement:

```json
{
  "id": "chart1",
  "slot": "media",
  "state": "highlight"
}
```

### Responsive layout behavior
- On desktop, slots may render side-by-side.
- On tablet/mobile, slots must stack vertically unless a layout explicitly defines another accessible fallback.
- Sticky and pinned experiences must degrade safely on short viewports and touch devices.

## Component model
Components are defined globally in the story schema and instantiated once during runtime.

### MVP component set
- `TextComponent`
- `ImageComponent`
- `VideoComponent`
- `ChartComponent`

### Planned extended component set
- `AudioComponent`
- `EmbedComponent`
- `Model3DComponent`
- `AnnotationComponent`
- `CalloutComponent`
- `KnowledgeCheckComponent`

### Key component rule
Steps reference components and update their state. Components should not be created and destroyed on every step transition unless runtime cleanup requires it.

## Component lifecycle contract
Every runtime component must implement the following methods:
- `init()`
- `render()`
- `enter()`
- `update(state)`
- `exit()`
- `destroy()`

### Lifecycle meanings
- `init()` → component instance is created and receives config.
- `render()` → DOM is created and mounted into a layout slot.
- `enter()` → step becomes active.
- `update(state)` → component animates from its current state to the requested state.
- `exit()` → step deactivates.
- `destroy()` → runtime removes the component completely.

The `update(state)` method is the primary mechanism for scrollytelling transitions.

## Runtime engine
The runtime engine is responsible for:
1. Loading story JSON.
2. Resolving assets.
3. Creating the section layout DOM.
4. Instantiating components from the global registry.
5. Registering ScrollTrigger-based step activation.
6. Activating the initial step.

### Runtime rendering pipeline
```text
loadStory()
resolveAssets()
createLayout()
instantiateComponents()
registerScrollTriggers()
activateInitialStep()
```

### Runtime source-of-truth rule
The runtime owns playback behavior. The editor preview should use the same runtime logic rather than a separate parallel interpretation.

## ScrollTrigger integration
ScrollTrigger controls step activation.

### Example pattern
```js
ScrollTrigger.create({
  trigger: stepElement,
  start: "top center",
  onEnter: () => activateStep(stepId)
})
```

When a step activates, the runtime updates all component states referenced in that step.

### Scroll behavior expectations
- Sections may use enter/exit transitions, sticky steps, or pinned scenes.
- Scroll progress may scrub state changes when a component supports it.
- Scroll-driven interaction may optionally hand off to direct touch/mouse interaction for supported components like 3D models or charts.
- Reduced-motion mode must minimize or simplify these transitions.

## Animation model
Animations are state-driven.

### Core rule
Steps update component states. Components handle their own animation transitions internally.

Example:

```js
chart.update("highlight")
```

The runtime does not implement component-specific animation logic; it only coordinates state changes and lifecycle events.

## Example story requirement
A reference story must exist to validate the runtime engine.

### Required example
- 1 section
- 3 steps
- 1 reusable chart component

### Required example states
- `overview`
- `highlight`
- `zoom`

### Purpose
- Demonstrate component reuse.
- Demonstrate state transitions.
- Validate ScrollTrigger integration.
- Provide a smoke-test fixture for the editor preview and export pipeline.

## Editor architecture
The editor should be implemented using React + TypeScript.

### Editor responsibilities
- Create sections.
- Create steps.
- Assign components to steps.
- Edit component states.
- Preview the runtime.
- Export stories.

### Editor layout
- Top Toolbar
- Component Library
- Canvas Editor
- Properties Panel
- Timeline / MiniMap

### Editor MVP scope
The first version should support:
- Section editor
- Step editor
- Component assignment
- State editing
- Runtime preview
- Export

The first version should explicitly defer:
- Advanced timeline editors
- Animation curve tools
- Fully freeform layout authoring
- Complex collaboration/versioning

## Export pipeline
Export must produce a portable story package.

### Required structure
```text
index.html
story.json
assets/
css/
js/
```

### Export requirements
- Exported stories must run without build tools.
- Runtime assets should be lightweight and portable.
- Packages should support both static hosting and CMS embedding.
- Export should produce a clean embed target for Squarespace Code Blocks.

## Squarespace publishing strategy
Squarespace compatibility is a first-class requirement.

### Publishing assumptions
- Many users will paste a story into a Squarespace Code Block.
- Some users may also use header/footer injection for shared assets.
- Exported code must avoid assumptions about global resets, page width, or host styles.

### Integration guidance
- Scope story styles under a root selector such as `.sm-story`.
- Support a single mount container like `<div id="scrollymaker-story"></div>`.
- Allow CDN-hosted runtime/CSS assets when a fully self-contained snippet is too large.
- Provide embed presets for inline, inset, and full-width page sections.
- Include a publisher checklist that explains where HTML, CSS, runtime JS, and optional CDN assets belong inside Squarespace.

## Runtime technology constraints
The runtime must remain framework-free.

### Allowed runtime dependencies
- GSAP
- ScrollTrigger

### Avoid in runtime
- React
- Vue
- Svelte
- Build-time-only runtime dependencies

Optional advanced integrations such as `model-viewer`, D3, or specialized embeds may be layered on top, but the core runtime should stay minimal and portable.

## Performance requirements
The runtime should:
- Lazy load heavy assets.
- Minimize DOM updates.
- Reuse component instances.
- Refresh ScrollTrigger on resize.
- Offer lower-cost fallbacks for mobile or constrained devices.

### Resize behavior
```js
window.addEventListener("resize", () => ScrollTrigger.refresh())
```

### Heavy-media strategy
- 3D scenes should have poster or simplified fallbacks.
- Large data visualizations should support reduced-detail mobile states.
- Videos should support posters, muted autoplay-safe modes, and caption tracks.
- Offscreen media should use lazy loading where possible.

## Accessibility guidelines
Runtime and editor output must support:
- Semantic HTML
- Alt text for images
- Captions for video
- Transcript support for audio
- Keyboard navigation
- Visible focus styles
- Reduced motion preference
- Screen-reader-safe step content
- Text alternatives for essential visualizations

### Reduced motion rule
If reduced motion is enabled, animated transitions should be minimized or replaced with non-animated state changes.

### Editor accessibility guardrails
The editor should warn when:
- An image lacks alt text.
- A video lacks captions.
- Audio lacks transcript content.
- Theme tokens create poor contrast.
- A chart or 3D scene lacks a text equivalent when the visual is instructional.

## Responsive and interaction requirements
- Layout slots should collapse into a readable vertical stack on narrow screens.
- Sticky and pinned behavior should be optional by breakpoint.
- Touch targets must remain accessible on tablets and phones.
- Direct manipulation should complement scroll, not block it.
- 3D and chart interactions should support touch/mouse exploration after or alongside scroll-based guidance where practical.

## CSS token system
ScrollyMaker should use CSS custom properties as the shared theming contract between exported stories and the editor preview.

### Token layers
1. Core tokens
2. Semantic tokens
3. Component tokens
4. Section overrides

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

### Token behavior expectations
Changing a single token such as `--theme-accent` should update all dependent uses consistently, including buttons, key borders, links, chart accents, callouts, and focus treatments when configured to do so.

## Media roadmap beyond MVP
The runtime/editor design should leave room for richer components that are especially valuable for learning experiences.

### 3D assets
- Scroll-linked state changes
- Optional direct manipulation via touch/mouse
- Annotations and hotspots
- Mobile-safe fallbacks when WebGL is unavailable or too heavy

### Data visualization
- Reusable chart components with named states
- Step-driven highlights and transitions
- Optional hover/tap exploration after the guided scroll sequence
- CSV/JSON-backed configuration in later iterations

### Audio, video, and embeds
- Native support for captions/transcripts where relevant
- Responsive aspect-ratio handling
- Lazy loading and poster strategies
- CMS-safe iframe wrappers for third-party embeds

## Build instructions for AI development
Recommended implementation order:
1. Implement runtime engine.
2. Implement component registry.
3. Implement component system.
4. Generate example story.
5. Implement editor scaffold.
6. Implement export pipeline.

### Suggested runtime directory structure
```text
runtime/
  scroll-engine.js
  component-registry.js
  animation-engine.js
```

## Implementation milestones
### Phase 1: Runtime proof of concept
- Load story JSON.
- Render one section with one reusable chart component.
- Activate 3 steps with ScrollTrigger.
- Validate the `overview`, `highlight`, and `zoom` state transitions.

### Phase 2: Editor scaffold
- Build React + TypeScript shell.
- Add section/step authoring.
- Add component assignment UI.
- Embed the runtime for preview.

### Phase 3: Export + CMS validation
- Export the required package structure.
- Test standalone static hosting.
- Test Squarespace Code Block embedding.
- Validate scoped CSS and CDN runtime loading.

### Phase 4: Extended components
- Add image/video support.
- Add audio and embed components.
- Prototype 3D and data visualization extensions.
- Add accessibility linting and responsive fallbacks.

## Risks and design tensions
- Squarespace injection constraints may affect whether exports are fully self-contained or asset-hosted.
- Sticky/pinned scenes can become fragile on mobile browsers.
- 3D features can quickly exceed performance budgets on older devices.
- Data visualization authoring can expand beyond MVP if not constrained to reusable state-driven components.
- A true WYSIWYG editor may diverge from final embedded behavior unless the preview is powered by the same runtime.

## Immediate open questions
### Publishing and CMS constraints
1. Should v1 prefer fully self-contained embed snippets, or is hosted CSS/JS acceptable for production use?
2. Which Squarespace environment matters most for testing: 7.0, 7.1, Fluid Engine, or multiple?
3. Should v1 assume only Code Block access, or also support header/footer injection setups?

### Editor and authoring scope
4. Should the first editor feel more like structured block authoring with preview, or true drag-and-drop WYSIWYG editing?
5. How much layout freedom should authors have in v1 beyond the three required layouts?
6. Should exported code remain intentionally readable/editable for advanced users?

### Learning-focused media
7. Which advanced capability matters first after MVP: 3D, charts/data-viz, audio/transcript workflows, or knowledge checks?
8. Do 3D and chart components need dual control modes from day one: scroll-driven plus touch/mouse interaction?
9. Are there privacy or compliance constraints for student-facing experiences that affect embeds, analytics, or asset hosting?

## Final notes for implementers
- Do not invent additional architecture without updating this document.
- Follow the schema and lifecycle contracts exactly.
- Keep the runtime minimal, portable, and framework-free.
- Ensure the editor always generates stories compatible with the runtime engine.
