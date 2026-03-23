(function () {
  const state = {
    story: null,
    runtime: null,
    activeStepId: null
  };

  const els = {};

  function $(id) {
    return document.getElementById(id);
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function getSteps() {
    return state.story?.sections?.[0]?.steps || [];
  }

  function getActiveStep() {
    return getSteps().find((step) => step.id === state.activeStepId) || getSteps()[0] || null;
  }

  function getChart() {
    return state.story?.components?.chart1 || null;
  }

  function applyThemeToDocument(theme) {
    document.documentElement.style.setProperty('--sm-color-brand-1', theme.accent);
    document.documentElement.style.setProperty('--sm-color-bg', theme.background);
    document.documentElement.style.setProperty('--sm-color-surface', theme.surface);
    document.documentElement.style.setProperty('--sm-color-surface-alt', theme.surfaceAlt);
    document.documentElement.style.setProperty('--sm-color-text', theme.text);
    document.documentElement.style.setProperty('--sm-color-text-muted', theme.textMuted);
    document.documentElement.style.setProperty('--sm-color-border', theme.border);
    document.documentElement.style.setProperty('--sm-color-success', theme.success);
  }

  function renderStepList() {
    const steps = getSteps();
    els.stepList.innerHTML = '';

    steps.forEach((step, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `sm-step-card${step.id === state.activeStepId ? ' is-active' : ''}`;
      button.innerHTML = `
        <div class="sm-step-card__index">Step ${index + 1}</div>
        <h3>${step.title}</h3>
        <p>${step.body}</p>
      `;
      button.addEventListener('click', () => {
        state.activeStepId = step.id;
        fillForm();
        if (state.runtime) {
          state.runtime.activateStep(step.id);
        }
      });
      els.stepList.append(button);
    });
  }

  function fillForm() {
    const activeStep = getActiveStep();
    const chart = getChart();
    const theme = state.story.theme;

    if (!activeStep || !chart) {
      return;
    }

    els.storyTitle.value = state.story.meta.title || '';
    els.storyDescription.value = state.story.meta.description || '';
    els.accentColor.value = theme.accent;
    els.backgroundColor.value = theme.background;
    els.surfaceColor.value = theme.surface;
    els.textColor.value = theme.text;
    els.stepTitle.value = activeStep.title;
    els.stepBody.value = activeStep.body;

    const chartStateName = activeStep.componentStates.find((componentState) => componentState.id === 'chart1')?.state;
    const chartState = chart.states?.[chartStateName];
    els.chartStateName.textContent = chartStateName || 'overview';
    els.chartAnnotation.value = chartState?.annotation || '';

    const values = Array.isArray(chartState?.values) ? chartState.values : [];
    els.chartValue1.value = String(values[0] ?? '');
    els.chartValue2.value = String(values[1] ?? '');
    els.chartValue3.value = String(values[2] ?? '');

    renderStepList();
    renderJson();
    renderExport();
    renderPreviewMeta();
  }

  function renderPreviewMeta() {
    els.previewTitle.textContent = state.story.meta.title;
    els.previewDescription.textContent = state.story.meta.description;
    els.previewMeta.innerHTML = `
      <div class="sm-meta-pill">${getSteps().length} scroll steps</div>
      <div class="sm-meta-pill">${Object.keys(state.story.components || {}).length} reusable components</div>
      <div class="sm-meta-pill">GSAP + ScrollTrigger runtime</div>
    `;
  }

  function renderJson() {
    els.jsonOutput.textContent = JSON.stringify(state.story, null, 2);
  }

  function renderExport() {
    els.exportOutput.textContent = [
      '<div id="scrollymaker-story"></div>',
      '<link rel="stylesheet" href="https://your-cdn.example/scrollymaker.css">',
      '<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.7/dist/gsap.min.js"></script>',
      '<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.7/dist/ScrollTrigger.min.js"></script>',
      '<script src="https://your-cdn.example/scrollymaker-runtime.js"></script>',
      '<script>',
      `  const story = ${JSON.stringify(state.story, null, 2)};`,
      '  const runtime = new ScrollyMakerRuntime({',
      '    container: document.getElementById("scrollymaker-story"),',
      '    story',
      '  });',
      '  runtime.mount();',
      '</script>'
    ].join('\n');
  }

  function rerenderRuntime() {
    if (state.runtime) {
      state.runtime.destroy();
    }

    applyThemeToDocument(state.story.theme);
    state.runtime = new window.ScrollyMakerRuntime({
      container: els.previewCanvas,
      story: clone(state.story)
    });
    state.runtime.mount();
    if (state.activeStepId) {
      state.runtime.activateStep(state.activeStepId);
    }
  }

  function updateStoryFromForm() {
    const activeStep = getActiveStep();
    const chart = getChart();
    if (!activeStep || !chart) {
      return;
    }

    state.story.meta.title = els.storyTitle.value.trim() || 'Untitled ScrollyMaker story';
    state.story.meta.description = els.storyDescription.value.trim();
    state.story.theme.accent = els.accentColor.value;
    state.story.theme.background = els.backgroundColor.value;
    state.story.theme.surface = els.surfaceColor.value;
    state.story.theme.text = els.textColor.value;
    state.story.theme.textMuted = deriveMutedText(els.textColor.value);
    state.story.theme.border = deriveBorderColor(els.textColor.value);

    activeStep.title = els.stepTitle.value.trim() || activeStep.title;
    activeStep.body = els.stepBody.value.trim() || activeStep.body;

    const chartStateName = activeStep.componentStates.find((componentState) => componentState.id === 'chart1')?.state;
    if (chartStateName && chart.states?.[chartStateName]) {
      chart.states[chartStateName].annotation = els.chartAnnotation.value.trim();
      chart.states[chartStateName].values = [els.chartValue1.value, els.chartValue2.value, els.chartValue3.value]
        .map((value) => Number.parseInt(value, 10))
        .map((value) => Number.isFinite(value) ? Math.max(0, Math.min(value, 100)) : 0);
    }

    fillForm();
    rerenderRuntime();
  }

  function deriveMutedText(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) {
      return '#b7c2da';
    }
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.72)`;
  }

  function deriveBorderColor(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) {
      return 'rgba(167, 181, 212, 0.24)';
    }
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.24)`;
  }

  function hexToRgb(hex) {
    const normalized = hex.replace('#', '');
    if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
      return null;
    }
    return {
      r: parseInt(normalized.slice(0, 2), 16),
      g: parseInt(normalized.slice(2, 4), 16),
      b: parseInt(normalized.slice(4, 6), 16)
    };
  }

  async function loadStory() {
    const response = await fetch('./story.json');
    const story = await response.json();
    state.story = story;
    state.activeStepId = story.sections?.[0]?.steps?.[0]?.id || null;
  }

  async function init() {
    Object.assign(els, {
      storyTitle: $('story-title'),
      storyDescription: $('story-description'),
      accentColor: $('accent-color'),
      backgroundColor: $('background-color'),
      surfaceColor: $('surface-color'),
      textColor: $('text-color'),
      stepTitle: $('step-title'),
      stepBody: $('step-body'),
      chartStateName: $('chart-state-name'),
      chartAnnotation: $('chart-annotation'),
      chartValue1: $('chart-value-1'),
      chartValue2: $('chart-value-2'),
      chartValue3: $('chart-value-3'),
      stepList: $('step-list'),
      jsonOutput: $('json-output'),
      exportOutput: $('export-output'),
      previewCanvas: $('story-preview'),
      previewTitle: $('preview-title'),
      previewDescription: $('preview-description'),
      previewMeta: $('preview-meta'),
      rerenderButton: $('rerender-button'),
      resetButton: $('reset-button')
    });

    await loadStory();
    applyThemeToDocument(state.story.theme);
    fillForm();
    rerenderRuntime();

    document.querySelectorAll('[data-sync-story]').forEach((field) => {
      field.addEventListener('input', updateStoryFromForm);
    });

    els.rerenderButton.addEventListener('click', rerenderRuntime);
    els.resetButton.addEventListener('click', async () => {
      await loadStory();
      applyThemeToDocument(state.story.theme);
      fillForm();
      rerenderRuntime();
    });

    window.addEventListener('resize', () => {
      if (window.ScrollTrigger) {
        window.ScrollTrigger.refresh();
      }
    });
  }

  window.addEventListener('DOMContentLoaded', init);
})();
