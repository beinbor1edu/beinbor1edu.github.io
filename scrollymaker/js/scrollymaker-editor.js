(function () {
  const state = {
    story: null,
    runtime: null,
    activeStepId: null,
    selectedBlockId: null,
    nextBlockNumber: 1
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

  function getActiveBlocks() {
    return getActiveStep()?.blocks || [];
  }

  function getSelectedBlock() {
    return getActiveBlocks().find((block) => block.id === state.selectedBlockId) || getActiveBlocks()[0] || null;
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
      button.addEventListener('click', () => selectStep(step.id));
      els.stepList.append(button);
    });
  }

  function renderWysiwygBlocks() {
    const step = getActiveStep();
    const blocks = getActiveBlocks();
    els.wysiwygBlocks.innerHTML = '';

    els.activeStepName.textContent = step?.title || 'No active step';
    els.selectedBlockName.textContent = getSelectedBlock()?.label || 'None';

    if (!blocks.length) {
      const empty = document.createElement('div');
      empty.className = 'sm-empty';
      empty.textContent = 'No blocks yet. Use the add-block buttons above to compose this step.';
      els.wysiwygBlocks.append(empty);
      return;
    }

    blocks.forEach((block, index) => {
      const article = document.createElement('article');
      article.className = `sm-block-card sm-block-card--${block.type || 'text'}${block.id === state.selectedBlockId ? ' is-selected' : ''}`;
      article.tabIndex = 0;
      article.dataset.blockId = block.id;

      const header = document.createElement('div');
      header.className = 'sm-block-card__header';
      header.innerHTML = `
        <div>
          <div class="sm-block-card__type">${block.type || 'text'} block</div>
          <div class="sm-block-card__title">${block.label || `Block ${index + 1}`}</div>
        </div>
        <button class="sm-button sm-button--secondary" type="button" data-remove-block="${block.id}">Remove</button>
      `;

      const content = document.createElement('div');
      content.className = 'sm-block-card__content';
      if (block.type === 'image') {
        content.innerHTML = `
          <img src="${block.content || 'https://placehold.co/900x520/1b2440/f4f7fb?text=Image+Block'}" alt="${block.caption || block.label || 'Image block'}">
        `;
      } else if (block.type === 'embed') {
        content.innerHTML = `<div class="sm-empty">${block.content || 'External interactive placeholder'}</div>`;
      } else {
        content.textContent = block.content || '';
      }

      article.append(header, content);

      if (block.caption) {
        const caption = document.createElement('div');
        caption.className = 'sm-block-card__caption';
        caption.textContent = block.caption;
        article.append(caption);
      }

      article.addEventListener('click', (event) => {
        if (event.target instanceof HTMLElement && event.target.dataset.removeBlock) {
          removeBlock(event.target.dataset.removeBlock);
          return;
        }
        selectBlock(block.id);
      });
      article.addEventListener('focus', () => selectBlock(block.id));
      els.wysiwygBlocks.append(article);
    });
  }

  function renderPreviewMeta() {
    els.previewTitle.textContent = state.story.meta.title;
    els.previewDescription.textContent = state.story.meta.description;
    els.previewMeta.innerHTML = `
      <div class="sm-meta-pill">${getSteps().length} scroll steps</div>
      <div class="sm-meta-pill">${Object.keys(state.story.components || {}).length} reusable components</div>
      <div class="sm-meta-pill">${getActiveBlocks().length} canvas blocks in active step</div>
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

  function renderBlockInspector() {
    const block = getSelectedBlock();
    const hasBlock = Boolean(block);

    els.blockPanelEmpty.hidden = hasBlock;
    els.blockSettings.hidden = !hasBlock;

    if (!hasBlock) {
      els.blockType.value = '';
      els.blockLabel.value = '';
      els.blockContent.value = '';
      els.blockCaption.value = '';
      els.selectedBlockName.textContent = 'None';
      return;
    }

    els.selectedBlockName.textContent = block.label || block.type;
    els.blockType.value = block.type || '';
    els.blockLabel.value = block.label || '';
    els.blockContent.value = block.content || '';
    els.blockCaption.value = block.caption || '';
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
    renderWysiwygBlocks();
    renderBlockInspector();
    renderJson();
    renderExport();
    renderPreviewMeta();
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
        .map((value) => (Number.isFinite(value) ? Math.max(0, Math.min(value, 100)) : 0));
    }

    fillForm();
    rerenderRuntime();
  }

  function updateBlockFromForm() {
    const block = getSelectedBlock();
    if (!block) {
      return;
    }

    block.label = els.blockLabel.value.trim() || block.label;
    block.content = els.blockContent.value.trim();
    block.caption = els.blockCaption.value.trim();

    fillForm();
    rerenderRuntime();
  }

  function selectStep(stepId) {
    state.activeStepId = stepId;
    const firstBlock = getActiveBlocks()[0];
    state.selectedBlockId = firstBlock?.id || null;
    fillForm();
    if (state.runtime) {
      state.runtime.activateStep(stepId);
    }
  }

  function selectBlock(blockId) {
    state.selectedBlockId = blockId;
    fillForm();
  }

  function createBlock(type) {
    state.nextBlockNumber += 1;
    const id = `block-${Date.now()}-${state.nextBlockNumber}`;

    const defaults = {
      text: {
        label: 'New text block',
        content: 'Add narrative copy for this step here.',
        caption: ''
      },
      callout: {
        label: 'New callout',
        content: 'Highlight an important insight, instruction, or teaching note.',
        caption: ''
      },
      image: {
        label: 'New image block',
        content: 'https://placehold.co/900x520/1b2440/f4f7fb?text=New+Image+Block',
        caption: 'Describe what the image adds to the lesson.'
      },
      embed: {
        label: 'New embed block',
        content: 'External interactive placeholder',
        caption: 'Add setup instructions or context for this embed.'
      }
    };

    return {
      id,
      type,
      ...(defaults[type] || defaults.text)
    };
  }

  function addBlock(type) {
    const step = getActiveStep();
    if (!step) {
      return;
    }

    if (!Array.isArray(step.blocks)) {
      step.blocks = [];
    }

    const block = createBlock(type);
    step.blocks.push(block);
    state.selectedBlockId = block.id;
    fillForm();
    rerenderRuntime();
  }

  function removeBlock(blockId) {
    const step = getActiveStep();
    if (!step || !Array.isArray(step.blocks)) {
      return;
    }

    step.blocks = step.blocks.filter((block) => block.id !== blockId);
    state.selectedBlockId = step.blocks[0]?.id || null;
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
    state.selectedBlockId = story.sections?.[0]?.steps?.[0]?.blocks?.[0]?.id || null;
    state.nextBlockNumber = countBlocks(story);
  }

  function countBlocks(story) {
    return (story.sections || []).reduce((total, section) => {
      return total + (section.steps || []).reduce((stepTotal, step) => stepTotal + (step.blocks || []).length, 0);
    }, 0);
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
      wysiwygBlocks: $('wysiwyg-blocks'),
      activeStepName: $('active-step-name'),
      selectedBlockName: $('selected-block-name'),
      blockPanelEmpty: $('block-panel-empty'),
      blockSettings: $('block-settings'),
      blockType: $('block-type'),
      blockLabel: $('block-label'),
      blockContent: $('block-content'),
      blockCaption: $('block-caption'),
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

    document.querySelectorAll('[data-sync-block]').forEach((field) => {
      field.addEventListener('input', updateBlockFromForm);
    });

    document.querySelectorAll('[data-add-block]').forEach((button) => {
      button.addEventListener('click', () => addBlock(button.getAttribute('data-add-block')));
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
