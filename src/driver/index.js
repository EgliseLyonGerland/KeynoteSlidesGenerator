const _ = require('lodash');
const {
  documentWidth,
  documentHeight,
  typography,
  regularBackgroundsNumber,
} = require('../config');

export function createDriver() {
  const systemEvent = Application('System Events');
  const keynote = Application('Keynote');
  const mainWindow = systemEvent.processes.Keynote.windows.byName('Slides');
  let doc;
  let currentClipboard;
  let backgrounds = [];

  function getNextRegularBackground() {
    if (backgrounds.length === 0) {
      backgrounds = _.shuffle(_.range(1, regularBackgroundsNumber));
    }

    return `backgroundR${backgrounds.pop()}`;
  }

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

  function pressEnter() {
    systemEvent.keyCode(36);
  }

  function selectElement(element) {
    // eslint-disable-next-line no-param-reassign
    element.locked = false;
  }

  function copySlideObjects(slideIndex) {
    const currentSlideIndex = _.indexOf(doc.slides, doc.currentSlide);
    // eslint-disable-next-line prefer-destructuring
    doc.currentSlide = doc.slides[slideIndex];
    press('a', { command: true });
    press('c', { command: true });
    delay(0.5);
    doc.currentSlide = doc.slides[currentSlideIndex];
  }

  // function stringifyDuration(duration) {
  //   let str = `${duration}`;
  //   str = str.replace('.', ',');

  //   return `${str} s`;
  // }

  /**
   * Navigation helpers
   */

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

  /**
   * Form helpers
   */

  function setSelectBoxValue(selectBox, name) {
    selectBox.click();
    selectBox.menus[0].menuItems.byName(name).click();
  }

  function setSelectBoxIndex(selectBox, index) {
    selectBox.click();
    const size = _.size(selectBox.menus[0].menuItems);
    selectBox.menus[0].menuItems[Math.min(index, size - 1)].click();
  }

  /**
   * Effect helpers
   */

  function selectEffect(effect) {
    const addEffectButton = mainWindow.buttons.byName('Ajouter un effet');
    addEffectButton.click();
    delay(0.2);
    addEffectButton.popOvers[0].scrollAreas[0].buttons.byName(effect).click();
    delay(0.2);
  }

  /**
   * Set current effect startup options
   * @param {string} begin 'onClick' or 'afterPrevious' or 'withPrevious'
   * @param {int} delay$ Delay
   */
  function setEffectStartup(begin, delay$ = 0) {
    const win = getBuildOrderWindow();

    let beginIndex = 0;
    if (begin === 'withPrevious') beginIndex = 1;
    else if (begin === 'afterPrevious') beginIndex = 2;

    setSelectBoxIndex(win.popUpButtons[0], beginIndex);

    if (delay$ <= 1) {
      for (let i = 0; i < delay$; ) {
        win.incrementors[0].buttons[0].click();
        i += i > 1 ? 0.25 : 0.1;
      }
    }
  }

  function setEffectDuration(duration) {
    const scrollArea = mainWindow.scrollAreas[0];
    scrollArea.sliders[0].value = Math.log(duration + 1);
  }

  function setLineDrawEffect({
    duration = 0.7,
    direction = 'Du milieu aux extrémités',
  } = {}) {
    openInspector(1);
    selectInspectorTab('Entrée');
    selectEffect('Tracé de ligne');
    setEffectDuration(duration);

    const scrollArea = mainWindow.scrollAreas[0];
    setSelectBoxValue(scrollArea.popUpButtons[0], direction);
  }

  function setDissolveEffect({
    duration = 2,
    appears = 'byObject', // or 'byWord' or 'byChar'
    startsFrom = 'top', // or 'bottom' or 'center' or 'edges' or 'random'
  }) {
    openInspector(1);
    selectInspectorTab('Entrée');
    selectEffect('Dissolution');
    setEffectDuration(duration);

    const scrollArea = mainWindow.scrollAreas[0];
    const appearsSelect = scrollArea.popUpButtons[0];
    const startsFromSelect = scrollArea.popUpButtons[1];

    if (appears === 'byWord') {
      setSelectBoxValue(appearsSelect, 'Par mot');
    } else if (appears === 'byChar') {
      setSelectBoxValue(appearsSelect, 'Par caractère');
    } else {
      setSelectBoxValue(appearsSelect, 'Par object');
    }

    if (startsFrom === 'bottom') {
      setSelectBoxValue(startsFromSelect, "Vers l'arrière");
    } else if (startsFrom === 'center') {
      setSelectBoxValue(startsFromSelect, 'À partir du center');
    } else if (startsFrom === 'edges') {
      setSelectBoxValue(startsFromSelect, 'À partir des bords');
    } else if (startsFrom === 'random') {
      setSelectBoxValue(startsFromSelect, 'Aléatoire');
    } else {
      setSelectBoxValue(startsFromSelect, "Vers l'avant");
    }
  }

  function setFadeMoveEffect({
    duration = 2,
    direction = 'bottomToTop', // topToBottom, leftToRight, rightToLeft, topLeftToBottomRight, topRightToBottomLeft, bottomLeftToTopRight, bottomRightToTopLeft
    distance = 100, // from 0% to 100%
    // appears = 'byObject', // byWord, byChar
    // startsFrom = 'top', // bottom, center, edges, random
  }) {
    openInspector(1);
    selectInspectorTab('Entrée');
    selectEffect('Fondu et déplacement');
    setEffectDuration(duration);

    let directionIndex = 3;
    if (direction === 'leftToRight') directionIndex = 0;
    else if (direction === 'rightToLeft') directionIndex = 1;
    else if (direction === 'topToBottom') directionIndex = 2;
    else if (direction === 'topLeftToBottomRight') directionIndex = 4;
    else if (direction === 'topRightToBottomLeft') directionIndex = 5;
    else if (direction === 'bottomLeftToTopRight') directionIndex = 6;
    else if (direction === 'bottomRightToTopLeft') directionIndex = 7;

    const scrollArea = mainWindow.scrollAreas[0];
    const directionSelect = scrollArea.popUpButtons[0];
    const distanceSlider = scrollArea.sliders[1];

    setSelectBoxIndex(directionSelect, directionIndex);
    distanceSlider.value = distance / 100;
  }

  function addBubbles(index = 0, align = 'top') {
    if (currentClipboard !== 'bubbles') {
      copySlideObjects(0);
      currentClipboard = 'bubbles';
    }

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

  function addHorizontalOverlays() {
    if (currentClipboard !== 'horizontalOverlays') {
      copySlideObjects(1);
      currentClipboard = 'horizontalOverlays';
    }

    press('v', { command: true });
    delay(0.2);
  }

  function addVerticalOverlays() {
    if (currentClipboard !== 'verticalOverlays') {
      copySlideObjects(2);
      currentClipboard = 'verticalOverlays';
    }

    press('v', { command: true });
    delay(0.2);
  }

  function addText(text, format, overrides = {}) {
    const textProperties = { ...typography[format], ...overrides };
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

    selectElement(textItem);

    return textItem;
  }

  function setTextAlignment(text, align) {
    // eslint-disable-next-line no-param-reassign
    text.locked = false;

    openInspector(0);
    selectInspectorTab('Texte');

    const scrollArea = mainWindow.scrollAreas[0];
    const group = _.find(
      scrollArea.groups,
      item => item.description() === 'alignement de paragraphe',
    );

    if (align === 'left') {
      group.checkboxes[0].click();
    } else if (align === 'right') {
      group.checkboxes[2].click();
    } else {
      group.checkboxes[1].click();
    }
  }

  function addLine({ vertical = false, withAnimation = true, width } = {}) {
    const { currentSlide: slide } = doc;

    let size;
    if (width) size = width;
    else size = vertical ? 600 : 800;

    const line = keynote.Line(
      vertical
        ? {
            startPoint: {
              x: documentWidth / 2,
              y: (documentHeight - size) / 2,
            },
            endPoint: {
              x: documentWidth / 2,
              y: (documentHeight - size) / 2 + size,
            },
          }
        : {
            startPoint: {
              x: (documentWidth - size) / 2,
              y: documentHeight / 2,
            },
            endPoint: {
              x: (documentWidth - size) / 2 + size,
              y: documentHeight / 2,
            },
          },
    );
    slide.lines.push(line);

    if (withAnimation) {
      line.locked = false;
      setLineDrawEffect();
    }

    return line;
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

  function setElementX(element, x) {
    // eslint-disable-next-line no-param-reassign
    element.position = { x, y: element.position().y };
  }

  function setElementY(element, y) {
    // eslint-disable-next-line no-param-reassign
    element.position = { x: element.position().x, y };
  }

  function setElementXY(element, x, y) {
    // eslint-disable-next-line no-param-reassign
    element.position = { x, y };
  }

  initDocument();
  keynote.activate();

  while (!keynote.frontmost()) {
    delay(0);
  }

  return {
    keynote,
    mainWindow,
    doc,
    initDocument,
    press,
    pressEnter,
    openInspector,
    selectElement,
    selectInspectorTab,
    openBuildOrderWindow,
    getBuildOrderWindow,
    getNextRegularBackground,
    selectEffect,
    setEffectStartup,
    setEffectDuration,
    setLineDrawEffect,
    setDissolveEffect,
    setFadeMoveEffect,
    addText,
    setTextAlignment,
    addBubbles,
    addHorizontalOverlays,
    addVerticalOverlays,
    addLine,
    addSlide,
    setElementX,
    setElementY,
    setElementXY,
  };
}

export default null;
