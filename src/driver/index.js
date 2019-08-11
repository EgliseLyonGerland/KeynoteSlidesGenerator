const _ = require('lodash');
const { documentWidth, documentHeight, typography } = require('../config');

export function createDriver() {
  const systemEvent = Application('System Events');
  const keynote = Application('Keynote');
  const mainWindow = systemEvent.processes.Keynote.windows.byName('Slides');
  let doc;

  function initDocument() {
    if (keynote.documents.length) {
      // eslint-disable-next-line prefer-destructuring
      doc = keynote.documents[0];
    } else {
      doc = keynote.Document();
      keynote.documents.push(doc);
    }

    doc.width = documentWidth;
    doc.height = documentHeight;
  }

  function press(
    key,
    { shift = false, command = false, option = false, control = false } = {},
  ) {
    const using = [];
    if (shift) using.push('shift down');
    if (command) using.push('command down');
    if (control) using.push('control down');
    if (option) using.push('option down');

    systemEvent.keystroke(key, { using });
    delay(0.2);
  }

  function copyBubbles() {
    const currentSlideIndex = _.indexOf(doc.slides, doc.currentSlide);
    // eslint-disable-next-line prefer-destructuring
    doc.currentSlide = doc.slides[1];
    press('a', { command: true });
    press('c', { command: true });
    doc.currentSlide = doc.slides[currentSlideIndex];
  }

  function openInspector(tab = 0) {
    const group = mainWindow.toolbars[0].radioGroups[0];
    const button = group.radioButtons[tab];

    if (button.value() === 0) {
      button.click();
      delay(0.5);
    }
  }

  function selectInspectorTab(tab) {
    mainWindow.radioGroups[0].radioButtons.byName(tab).click();
  }

  function openBuildOrderWindow() {
    openInspector(1);
    mainWindow.buttons.byName('Ordre de composition').click();
  }

  function getBuildOrderWindow() {
    openBuildOrderWindow();

    return systemEvent.processes.Keynote.windows.byName('Ordre de composition');
  }

  function selectEffect(effect) {
    const addEffectButton = mainWindow.buttons.byName('Ajouter un effet');
    addEffectButton.click();
    delay(0.2);
    addEffectButton.popOvers[0].scrollAreas[0].buttons.byName(effect).click();
    delay(0.2);
  }

  function addText(text, format) {
    const textProperties = typography[format];
    const slide = doc.currentSlide;
    const textItem = keynote.TextItem({
      objectText: text,
    });
    slide.textItems.push(textItem);
    textItem.objectText.size = textProperties.size;
    textItem.objectText.font = textProperties.font;
    textItem.objectText.color = [65535, 65535, 65535];

    if (textProperties.opacity) {
      textItem.opacity = textProperties.opacity;
    }

    return textItem;
  }

  function addBubbles(index = 0, align = 'top') {
    press('v', { command: true });

    const { currentSlide: slide } = doc;

    _.forEach(slide.images, (shape, position) => {
      let y = -(position + 1) * 50 * index;

      if (align === 'center') {
        y -= (5000 - documentHeight) / 2;
      }

      // eslint-disable-next-line no-param-reassign
      shape.position = { x: 0, y };
    });
  }

  function addSlide(backgroundName) {
    const slide = keynote.Slide({
      baseSlide: doc.masterSlides.byName(backgroundName),
    });

    doc.slides.push(slide);

    slide.transitionProperties = {
      automaticTransition: false,
      transitionEffect: 'magic move',
      transitionDuration: 0.7,
    };

    return slide;
  }

  initDocument();
  keynote.activate();
  delay(1);
  copyBubbles();

  return {
    keynote,
    mainWindow,
    doc,
    initDocument,
    copyBubbles,
    press,
    openInspector,
    selectInspectorTab,
    openBuildOrderWindow,
    getBuildOrderWindow,
    selectEffect,
    addText,
    addBubbles,
    addSlide,
  };
}

export default null;
