(function () {
  class BaseComponent {
    constructor(id, definition, runtime) {
      this.id = id;
      this.definition = definition;
      this.runtime = runtime;
      this.element = null;
      this.currentState = null;
    }

    init() {}

    render() {
      return document.createElement('div');
    }

    enter() {}

    update(state) {
      this.currentState = state;
    }

    exit() {}

    destroy() {
      if (this.element?.remove) {
        this.element.remove();
      }
    }
  }

  class TextComponent extends BaseComponent {
    render() {
      const el = document.createElement('div');
      el.className = 'sm-component-caption';
      el.textContent = this.definition.content || '';
      this.element = el;
      return el;
    }
  }

  class ImageComponent extends BaseComponent {
    render() {
      const figure = document.createElement('figure');
      figure.className = 'sm-component-card';

      const img = document.createElement('img');
      img.src = this.definition.src || '';
      img.alt = this.definition.alt || '';
      img.style.width = '100%';
      img.style.borderRadius = '14px';

      const caption = document.createElement('figcaption');
      caption.className = 'sm-note';
      caption.style.marginTop = '0.75rem';
      caption.textContent = this.definition.caption || '';

      figure.append(img, caption);
      this.element = figure;
      return figure;
    }
  }

  class VideoComponent extends BaseComponent {
    render() {
      const card = document.createElement('div');
      card.className = 'sm-component-card';
      card.innerHTML = `
        <h3>${this.definition.title || 'Video component'}</h3>
        <p class="sm-note">Video scaffolding is present in the registry for future story states and export support.</p>
      `;
      this.element = card;
      return card;
    }
  }

  class ChartComponent extends BaseComponent {
    init() {
      this.rows = [];
      this.valueEls = [];
      this.annotationEl = null;
    }

    render() {
      const container = document.createElement('section');
      container.className = 'sm-component-card sm-chart';
      container.setAttribute('aria-label', this.definition.description || this.definition.title || 'Chart');

      const heading = document.createElement('h3');
      heading.textContent = this.definition.title || 'Chart';

      const desc = document.createElement('p');
      desc.className = 'sm-note';
      desc.textContent = this.definition.description || '';

      const bars = document.createElement('div');
      bars.className = 'sm-chart__bars';

      const labels = Array.isArray(this.definition.labels) ? this.definition.labels : [];
      labels.forEach((label) => {
        const row = document.createElement('div');
        row.className = 'sm-chart__row';

        const labelBar = document.createElement('div');
        labelBar.className = 'sm-chart__labelbar';

        const labelEl = document.createElement('div');
        labelEl.className = 'sm-chart__label';
        labelEl.textContent = label;

        const track = document.createElement('div');
        track.className = 'sm-chart__track';

        const fill = document.createElement('div');
        fill.className = 'sm-chart__fill';
        track.append(fill);

        const valueEl = document.createElement('div');
        valueEl.className = 'sm-chart__value';
        valueEl.textContent = `0${this.definition.units || ''}`;

        labelBar.append(labelEl, track, valueEl);
        row.append(labelBar);
        bars.append(row);

        this.rows.push(fill);
        this.valueEls.push(valueEl);
      });

      const annotation = document.createElement('p');
      annotation.className = 'sm-chart__annotation';
      annotation.textContent = 'Scroll to activate each step.';

      container.append(heading, desc, bars, annotation);
      this.annotationEl = annotation;
      this.element = container;
      return container;
    }

    update(stateName) {
      super.update(stateName);
      const state = this.definition.states?.[stateName];
      if (!state) {
        return;
      }

      const values = Array.isArray(state.values) ? state.values : [];
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const tweenDuration = reduceMotion ? 0 : 0.7;
      const ease = reduceMotion ? 'none' : 'power2.out';

      this.rows.forEach((fill, index) => {
        const value = Number(values[index] || 0);
        const valueEl = this.valueEls[index];
        const current = { value: Number.parseFloat(valueEl.dataset.value || '0') || 0 };
        valueEl.dataset.value = String(value);

        if (window.gsap) {
          window.gsap.to(fill, {
            width: `${Math.max(0, Math.min(value, 100))}%`,
            duration: tweenDuration,
            ease
          });
          window.gsap.to(current, {
            value,
            duration: tweenDuration,
            ease,
            onUpdate: () => {
              valueEl.textContent = `${Math.round(current.value)}${this.definition.units || ''}`;
            }
          });
        } else {
          fill.style.width = `${Math.max(0, Math.min(value, 100))}%`;
          valueEl.textContent = `${value}${this.definition.units || ''}`;
        }
      });

      if (this.annotationEl) {
        this.annotationEl.textContent = state.annotation || '';
      }
    }
  }

  const registry = {
    text: TextComponent,
    image: ImageComponent,
    video: VideoComponent,
    chart: ChartComponent
  };

  function renderRuntimeBlock(block) {
    const wrapper = document.createElement('div');
    wrapper.className = `sm-rendered-step__block sm-rendered-step__block--${block.type || 'text'}`;

    if (block.label) {
      const heading = document.createElement('strong');
      heading.textContent = block.label;
      heading.style.display = 'block';
      heading.style.marginBottom = '0.45rem';
      wrapper.append(heading);
    }

    if (block.type === 'image') {
      const img = document.createElement('img');
      img.src = block.content || '';
      img.alt = block.caption || block.label || 'Image block';
      img.style.borderRadius = '12px';
      img.style.marginBottom = '0.75rem';
      wrapper.append(img);
    } else {
      const text = document.createElement('div');
      text.textContent = block.content || '';
      wrapper.append(text);
    }

    if (block.caption) {
      const caption = document.createElement('p');
      caption.className = 'sm-note';
      caption.style.marginTop = '0.6rem';
      caption.textContent = block.caption;
      wrapper.append(caption);
    }

    return wrapper;
  }

  class ScrollyMakerRuntime {
    constructor({ container, story }) {
      this.container = container;
      this.story = story;
      this.instances = new Map();
      this.triggers = [];
      this.stepMap = new Map();
      this.activeStepId = null;
    }

    loadStory(story) {
      this.story = story;
      return story;
    }

    resolveAssets() {
      return this.story;
    }

    instantiateComponents() {
      this.instances.clear();
      const definitions = this.story.components || {};
      Object.entries(definitions).forEach(([id, definition]) => {
        const ComponentClass = registry[definition.type];
        if (!ComponentClass) {
          return;
        }

        const instance = new ComponentClass(id, definition, this);
        instance.init();
        this.instances.set(id, instance);
      });
    }

    createLayout() {
      this.container.innerHTML = '';
      this.stepMap.clear();

      const storyEl = document.createElement('div');
      storyEl.className = 'sm-story';
      storyEl.style.setProperty('--theme-accent', this.story.theme?.accent || 'var(--sm-color-brand-1)');
      storyEl.style.setProperty('--theme-bg', this.story.theme?.background || 'var(--sm-color-bg)');
      storyEl.style.setProperty('--theme-surface', this.story.theme?.surface || 'var(--sm-color-surface)');
      storyEl.style.setProperty('--theme-surface-alt', this.story.theme?.surfaceAlt || 'var(--sm-color-surface-alt)');
      storyEl.style.setProperty('--theme-text', this.story.theme?.text || 'var(--sm-color-text)');
      storyEl.style.setProperty('--theme-text-muted', this.story.theme?.textMuted || 'var(--sm-color-text-muted)');
      storyEl.style.setProperty('--theme-border', this.story.theme?.border || 'var(--sm-color-border)');

      (this.story.sections || []).forEach((section, sectionIndex) => {
        const sectionEl = document.createElement('section');
        sectionEl.className = 'sm-section';
        sectionEl.dataset.sectionId = section.id || `section-${sectionIndex + 1}`;

        const header = document.createElement('header');
        header.className = 'sm-section__header';
        header.innerHTML = `
          <span class="sm-section__eyebrow">${section.eyebrow || 'Section'}</span>
          <h2 class="sm-section__title">${section.title || `Section ${sectionIndex + 1}`}</h2>
        `;

        const layout = document.createElement('div');
        layout.className = `sm-layout sm-layout--${section.layout || 'text-graphic'}`;

        const stepsCol = document.createElement('div');
        stepsCol.className = 'sm-steps';
        const mediaFrame = document.createElement('aside');
        mediaFrame.className = 'sm-media-frame';

        const canvas = document.createElement('div');
        canvas.className = 'sm-canvas';
        const mediaSlot = document.createElement('div');
        mediaSlot.className = 'sm-slot';
        mediaSlot.dataset.slot = 'media';
        const captionSlot = document.createElement('div');
        captionSlot.className = 'sm-slot';
        captionSlot.dataset.slot = 'caption';
        canvas.append(mediaSlot, captionSlot);
        mediaFrame.append(canvas);

        const mountedSlots = { media: mediaSlot, caption: captionSlot };
        const renderedIds = new Set();
        (section.steps || []).forEach((step) => {
          (step.componentStates || []).forEach((componentState) => {
            const instance = this.instances.get(componentState.id);
            const slot = mountedSlots[componentState.slot];
            if (!instance || !slot || renderedIds.has(componentState.id)) {
              return;
            }
            const rendered = instance.render();
            rendered.dataset.componentId = componentState.id;
            slot.append(rendered);
            renderedIds.add(componentState.id);
          });
        });

        (section.steps || []).forEach((step, stepIndex) => {
          const article = document.createElement('article');
          article.className = 'sm-rendered-step';
          article.tabIndex = 0;
          article.dataset.stepId = step.id;

          const index = document.createElement('div');
          index.className = 'sm-rendered-step__index';
          index.textContent = `Step ${stepIndex + 1}`;

          const heading = document.createElement('h3');
          heading.textContent = step.title || `Step ${stepIndex + 1}`;

          const summary = document.createElement('p');
          summary.textContent = step.body || '';

          const blocks = document.createElement('div');
          blocks.className = 'sm-rendered-step__blocks';
          (step.blocks || []).forEach((block) => blocks.append(renderRuntimeBlock(block)));

          article.append(index, heading, summary, blocks);
          stepsCol.append(article);
          this.stepMap.set(step.id, { step, element: article });
        });

        layout.append(stepsCol, mediaFrame);
        sectionEl.append(header, layout);
        storyEl.append(sectionEl);
      });

      this.container.append(storyEl);
    }

    registerScrollTriggers() {
      this.destroyTriggers();
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      this.stepMap.forEach(({ step, element }) => {
        if (window.ScrollTrigger) {
          const trigger = window.ScrollTrigger.create({
            trigger: element,
            start: reduceMotion ? 'top 80%' : 'top center',
            end: 'bottom center',
            onEnter: () => this.activateStep(step.id),
            onEnterBack: () => this.activateStep(step.id)
          });
          this.triggers.push(trigger);
        }

        element.addEventListener('focus', () => this.activateStep(step.id));
        element.addEventListener('click', () => this.activateStep(step.id));
      });
    }

    activateInitialStep() {
      const firstStep = this.story.sections?.[0]?.steps?.[0];
      if (firstStep) {
        this.activateStep(firstStep.id);
      }
    }

    activateStep(stepId) {
      if (this.activeStepId === stepId) {
        return;
      }

      this.activeStepId = stepId;
      this.stepMap.forEach(({ element, step }) => {
        const isActive = step.id === stepId;
        element.classList.toggle('is-active', isActive);
        element.setAttribute('aria-current', isActive ? 'step' : 'false');
      });

      const activeStep = this.findStep(stepId);
      if (!activeStep) {
        return;
      }

      this.instances.forEach((instance) => instance.exit());
      (activeStep.componentStates || []).forEach((componentState) => {
        const instance = this.instances.get(componentState.id);
        if (!instance) {
          return;
        }
        instance.enter();
        instance.update(componentState.state);
      });
    }

    findStep(stepId) {
      for (const section of this.story.sections || []) {
        for (const step of section.steps || []) {
          if (step.id === stepId) {
            return step;
          }
        }
      }
      return null;
    }

    destroyTriggers() {
      this.triggers.forEach((trigger) => trigger.kill && trigger.kill());
      this.triggers = [];
    }

    destroy() {
      this.destroyTriggers();
      this.instances.forEach((instance) => instance.destroy());
      this.instances.clear();
      if (this.container) {
        this.container.innerHTML = '';
      }
    }

    mount() {
      this.loadStory(this.story);
      this.resolveAssets();
      this.instantiateComponents();
      this.createLayout();
      this.registerScrollTriggers();
      this.activateInitialStep();
      if (window.ScrollTrigger) {
        window.ScrollTrigger.refresh();
      }
    }
  }

  window.ScrollyMakerRuntime = ScrollyMakerRuntime;
})();
