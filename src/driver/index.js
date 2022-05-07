/* eslint-disable no-param-reassign */

const _ = require('lodash');
const {
  documentWidth,
  documentHeight,
  typography,
  regularBackgroundsNumber,
  templateRanges,
} = require('../config');

const dictionary = {
  // Format
  Texte: 'Text',
  Numéros: 'Numbers',
  Opacité: 'Opacity',

  // Animate
  Entrée: 'Build In',
  Action: 'Action',
  Sortie: 'Build Out',

  'Ordre de composition': 'Build Order',
  'Ajouter un effet': 'Add an Effect',
  'Tracé de ligne': 'Line Draw',
  Disparition: 'Disappear',
  Dissolution: 'Dissolve',
  'Fondu et déplacement': 'Fade and Move',
  'Fondu et échelle': 'Fade and Scale',

  'Du milieu aux extrémités': 'Middle to Ends',

  "Vers l'avant": 'Forward',
  "Vers l'arrière": 'Backward',
  'À partir du center': 'From Center',
  'À partir des bords': 'From Edges',
  Aléatoire: 'Random',

  'alignement de paragraphe': 'paragraph alignment',

  'Par caractère': 'By Character',
  'Par mot': 'By Word',
  'Par objet': 'By Object',
};

function t(term) {
  if (!dictionary[term]) {
    throw new Error(`No translation for "${term}"`);
  }

  return dictionary[term];
}

export function createDriver(filename) {
  const systemEvent = Application('System Events');
  const keynote = Application('Keynote');
  const mainWindow = systemEvent.processes.Keynote.windows.byName(filename);
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

  // See https://eastmanreference.com/complete-list-of-applescript-key-codes
  function pressEnter() {
    systemEvent.keyCode(36);
  }

  // function pressEscape() {
  //   systemEvent.press(53);
  // }

  // function pressTab() {
  //   systemEvent.press(48);
  // }

  function setTextFieldValue(textField, value) {
    textField.focused = true;
    textField.value = `${value}`;
    textField.focused = false;
    textField.confirm();
  }

  function selectElement(element) {
    element.locked = false;
  }

  function selectSlide(index) {
    // eslint-disable-next-line prefer-destructuring
    doc.currentSlide = doc.slides[index];
  }

  function duplicateSlide(index) {
    doc.slides[index].duplicate();
    doc.currentSlide.skipped = false;
  }

  function copyPasteObjectsFromSlide(slideIndex) {
    if (currentClipboard !== slideIndex) {
      const currentSlideIndex = _.indexOf(doc.slides, doc.currentSlide);
      selectSlide(slideIndex);
      press('a', { command: true });
      press('c', { command: true });
      delay(0.5);
      selectSlide(currentSlideIndex);
      currentClipboard = slideIndex;
    }

    press('v', { command: true });
    delay(0.2);
  }

  /**
   * Navigation helpers
   */

  function openInspector(tab = 0) {
    const group = mainWindow.toolbars[0].groups[9].groups[0];
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
    mainWindow.buttons.byName(t('Ordre de composition')).click();
  }

  function getBuildOrderWindow() {
    openBuildOrderWindow();

    return systemEvent.processes.Keynote.windows.byName(
      t('Ordre de composition'),
    );
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
    const addEffectButton = mainWindow.buttons.byName(t('Ajouter un effet'));
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
  function setEffectStartup(begin, delay = 0) {
    const win = getBuildOrderWindow();

    let beginIndex = 0;
    if (begin === 'withPrevious') beginIndex = 1;
    else if (begin === 'afterPrevious') beginIndex = 2;

    setSelectBoxIndex(win.popUpButtons[0], beginIndex);

    const delayTextField = win.textFields[0];
    setTextFieldValue(delayTextField, `${delay}`.replace('.', ','));
  }

  function setEffectDuration(duration) {
    const scrollArea = mainWindow.scrollAreas[0];
    scrollArea.sliders[0].value = Math.log(duration + 1);
  }

  function setLineDrawEffect({
    duration = 0.7,
    direction = t('Du milieu aux extrémités'),
  } = {}) {
    openInspector(1);
    selectInspectorTab(t('Entrée'));
    selectEffect(t('Tracé de ligne'));
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
    selectInspectorTab(t('Entrée'));
    selectEffect(t('Dissolution'));
    setEffectDuration(duration);

    const scrollArea = mainWindow.scrollAreas[0];
    const appearsSelect = scrollArea.popUpButtons[0];
    const startsFromSelect = scrollArea.popUpButtons[1];

    if (appears === 'byWord') {
      setSelectBoxValue(appearsSelect, t('Par mot'));
    } else if (appears === 'byChar') {
      setSelectBoxValue(appearsSelect, t('Par caractère'));
    } else {
      setSelectBoxValue(appearsSelect, t('Par objet'));
    }

    if (startsFrom === 'bottom') {
      setSelectBoxValue(startsFromSelect, t("Vers l'arrière"));
    } else if (startsFrom === 'center') {
      setSelectBoxValue(startsFromSelect, t('À partir du center'));
    } else if (startsFrom === 'edges') {
      setSelectBoxValue(startsFromSelect, t('À partir des bords'));
    } else if (startsFrom === 'random') {
      setSelectBoxValue(startsFromSelect, t('Aléatoire'));
    } else {
      setSelectBoxValue(startsFromSelect, t("Vers l'avant"));
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
    selectInspectorTab(t('Entrée'));
    selectEffect(t('Fondu et déplacement'));
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

  function setFadeScaleEffect({
    duration = 2,
    scale = 100, // from 0% to 200%
  } = {}) {
    openInspector(1);
    selectInspectorTab(t('Entrée'));
    selectEffect(t('Fondu et échelle'));
    setEffectDuration(duration);

    const scrollArea = mainWindow.scrollAreas[0];
    const scaleSlider = scrollArea.sliders[1];

    scaleSlider.value = scale;
  }

  function setFadeScaleOutEffect({
    duration = 2,
    scale = 100, // from 0% to 200%
  } = {}) {
    openInspector(1);
    selectInspectorTab(t('Sortie'));
    selectEffect(t('Fondu et échelle'));
    setEffectDuration(duration);

    const scrollArea = mainWindow.scrollAreas[0];
    const scaleSlider = scrollArea.sliders[1];

    scaleSlider.value = scale;
  }

  function setDisappearEffect() {
    openInspector(1);
    selectInspectorTab(t('Sortie'));
    selectEffect(t('Disparition'));
  }

  function setOpacityEffect({ duration = 1, opacity = 50 }) {
    openInspector(1);
    selectInspectorTab(t('Action'));
    selectEffect(t('Opacité'));
    setEffectDuration(duration);

    const scrollArea = mainWindow.scrollAreas[0];
    scrollArea.sliders[1].value = opacity;
  }

  function addHorizontalOverlays() {
    copyPasteObjectsFromSlide(1);
  }

  function addVerticalOverlays() {
    copyPasteObjectsFromSlide(2);
  }

  function addText(text, ...args) {
    let [format, textProperties = {}] = args;

    if (args.length === 1 && typeof format === 'object') {
      // eslint-disable-next-line no-unused-expressions
      textProperties = format;
      format = null;
    }

    if (format) {
      textProperties = { ...typography[format], ...textProperties };
    }

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

  function setTextLineHeight(textItem, value) {
    selectElement(textItem);

    openInspector(0);
    selectInspectorTab(t('Texte'));

    const scrollArea = mainWindow.scrollAreas[0];
    const textField = scrollArea.textFields[3];
    setTextFieldValue(textField, `${value}`.replace('.', ','));
  }

  function setTextAlignment(textItem, align) {
    selectElement(textItem);

    openInspector(0);
    selectInspectorTab(t('Texte'));

    const scrollArea = mainWindow.scrollAreas[0];
    const group = _.find(
      scrollArea.groups,
      (item) => item.description() === t('alignement de paragraphe'),
    );

    if (align === 'left') {
      group.checkboxes[0].click();
    } else if (align === 'right') {
      group.checkboxes[2].click();
    } else {
      group.checkboxes[1].click();
    }
  }

  function setTextNumbered(textItem, number, indent = null) {
    selectElement(textItem);

    openInspector(0);
    selectInspectorTab(t('Texte'));

    const scrollArea = mainWindow.scrollAreas[0];
    const group = scrollArea.groups[4];

    setSelectBoxValue(scrollArea.popUpButtons[4], t('Numéros'));
    group.radioGroups[0].radioButtons[1].click();

    _.range(1, number).forEach(() => {
      group.incrementors[3].buttons[0].click();
    });

    if (indent !== null) {
      setTextFieldValue(group.textFields[1], indent);
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
      baseLayout: doc.slideLayouts.byName(backgroundName),
    });

    doc.slides.push(slide);

    slide.transitionProperties = {
      automaticTransition: false,
      transitionEffect: 'magic move',
      transitionDuration: 0.7,
    };

    return slide;
  }

  function addSlideFromTemplate(template, index = 0) {
    const [firstIndex] = templateRanges[template];

    this.duplicateSlide(firstIndex + index);
  }

  function setElementX(element, x) {
    element.position = { x, y: element.position().y };
  }

  function setElementY(element, y) {
    element.position = { x: element.position().x, y };
  }

  function setElementXY(element, x, y) {
    element.position = { x, y };
  }

  function findElement(matcher, from = 0, type = 'iworkItem') {
    let matched = 0;
    for (let i = 0; i < doc.currentSlide[`${type}s`].length; i += 1) {
      const item = doc.currentSlide.iworkItems[i];

      if (!matcher(item)) {
        // eslint-disable-next-line no-continue
        continue;
      }
      if (from === matched) {
        return item;
      }

      matched += 1;
    }

    return null;
  }

  function findTextElement(expr, from = 0) {
    return findElement((item) => {
      try {
        return item.objectText().match(expr);
      } catch (e) {
        return false;
      }
    }, from);
  }

  initDocument();
  keynote.activate();

  while (!keynote.frontmost()) {
    delay(0);
  }

  return {
    addHorizontalOverlays,
    addLine,
    addSlide,
    addSlideFromTemplate,
    addText,
    addVerticalOverlays,
    doc,
    getBuildOrderWindow,
    getNextRegularBackground,
    initDocument,
    keynote,
    mainWindow,
    openBuildOrderWindow,
    openInspector,
    press,
    pressEnter,
    selectEffect,
    selectElement,
    selectSlide,
    findElement,
    findTextElement,
    duplicateSlide,
    selectInspectorTab,
    setDisappearEffect,
    setDissolveEffect,
    setEffectDuration,
    setEffectStartup,
    setElementX,
    setElementXY,
    setElementY,
    setFadeMoveEffect,
    setFadeScaleEffect,
    setFadeScaleOutEffect,
    setLineDrawEffect,
    setOpacityEffect,
    setTextAlignment,
    setTextLineHeight,
    setTextNumbered,
  };
}

export default null;
