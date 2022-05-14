/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */

import _ from 'lodash';
import {
  documentWidth,
  documentHeight,
  typography,
  regularBackgroundsNumber,
  templateRanges,
} from '../config';

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

export default class Driver {
  systemEvent;

  keynote;

  mainWindow;

  doc;

  currentClipboard;

  backgrounds = [];

  constructor(filename) {
    this.systemEvent = Application('System Events');
    this.keynote = Application('Keynote');
    this.mainWindow = this.systemEvent.processes.Keynote.windows.byName(
      filename,
    );

    this.initDocument();
    this.keynote.activate();

    while (!this.keynote.frontmost()) {
      delay(0);
    }
  }

  getNextRegularBackground() {
    if (this.backgrounds.length === 0) {
      this.backgrounds = _.shuffle(_.range(1, regularBackgroundsNumber));
    }

    return `backgroundR${this.backgrounds.pop()}`;
  }

  initDocument() {
    if (this.keynote.documents.length) {
      // eslint-disable-next-line prefer-destructuring
      this.doc = this.keynote.documents[0];
    } else {
      this.doc = this.keynote.Document();
      this.keynote.documents.push(this.doc);
    }

    this.doc.width = documentWidth;
    this.doc.height = documentHeight;
  }

  press(
    key,
    { shift = false, command = false, option = false, control = false } = {},
  ) {
    const using = [];
    if (shift) using.push('shift down');
    if (command) using.push('command down');
    if (control) using.push('control down');
    if (option) using.push('option down');

    this.systemEvent.keystroke(key, { using });
    delay(0.2);
  }

  // See https://eastmanreference.com/complete-list-of-applescript-key-codes
  pressEnter() {
    this.systemEvent.keyCode(36);
  }

  // function pressEscape() {
  //   this.systemEvent.press(53);
  // }

  pressBackspace() {
    this.systemEvent.keyCode(51);
  }

  // function pressTab() {
  //   this.systemEvent.press(48);
  // }

  setTextFieldValue(textField, value) {
    textField.focused = true;
    textField.value = `${value}`;
    textField.focused = false;
    textField.confirm();
  }

  selectElement(element) {
    element.locked = true;
    element.locked = false;
  }

  selectSlide(index) {
    // eslint-disable-next-line prefer-destructuring
    this.doc.currentSlide = this.doc.slides[index];
  }

  duplicateSlide(index) {
    this.doc.slides[index].duplicate();
    delay(0.1);
    this.doc.currentSlide.skipped = false;
  }

  copyPasteObjectsFromSlide(slideIndex) {
    if (this.currentClipboard !== slideIndex) {
      const currentSlideIndex = _.indexOf(
        this.doc.slides,
        this.doc.currentSlide,
      );
      this.selectSlide(slideIndex);
      this.press('a', { command: true });
      this.press('c', { command: true });
      delay(0.5);
      this.selectSlide(currentSlideIndex);
      this.currentClipboard = slideIndex;
    }

    this.press('v', { command: true });
    delay(0.2);
  }

  /**
   * Navigation helpers
   */

  openInspector(tab = 0) {
    const group = this.mainWindow.toolbars[0].groups[9].groups[0];
    const button = group.radioButtons[tab];

    if (button.value() === 0) {
      button.click();
      delay(0.5);
    }
  }

  selectInspectorTab(tab) {
    this.mainWindow.radioGroups[0].radioButtons.byName(tab).click();
  }

  openBuildOrderWindow() {
    this.openInspector(1);
    this.mainWindow.buttons.byName(t('Ordre de composition')).click();
  }

  getBuildOrderWindow() {
    this.openBuildOrderWindow();

    return this.systemEvent.processes.Keynote.windows.byName(
      t('Ordre de composition'),
    );
  }

  /**
   * Form helpers
   */

  setSelectBoxValue(selectBox, name) {
    selectBox.click();
    selectBox.menus[0].menuItems.byName(name).click();
  }

  setSelectBoxIndex(selectBox, index) {
    selectBox.click();
    const size = _.size(selectBox.menus[0].menuItems);
    selectBox.menus[0].menuItems[Math.min(index, size - 1)].click();
  }

  /**
   * Effect helpers
   */

  selectEffect(effect) {
    const addEffectButton = this.mainWindow.buttons.byName(
      t('Ajouter un effet'),
    );
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
  setEffectStartup(begin, delay = 0) {
    const win = this.getBuildOrderWindow();

    let beginIndex = 0;
    if (begin === 'withPrevious') beginIndex = 1;
    else if (begin === 'afterPrevious') beginIndex = 2;

    this.setSelectBoxIndex(win.popUpButtons[0], beginIndex);

    const delayTextField = win.textFields[0];
    this.setTextFieldValue(delayTextField, `${delay}`.replace('.', ','));
  }

  setEffectDuration(duration) {
    const scrollArea = this.mainWindow.scrollAreas[0];
    scrollArea.sliders[0].value = Math.log(duration + 1);
  }

  setLineDrawEffect({
    duration = 0.7,
    direction = t('Du milieu aux extrémités'),
  } = {}) {
    this.openInspector(1);
    this.selectInspectorTab(t('Entrée'));
    this.selectEffect(t('Tracé de ligne'));
    this.setEffectDuration(duration);

    const scrollArea = this.mainWindow.scrollAreas[0];
    this.setSelectBoxValue(scrollArea.popUpButtons[0], direction);
  }

  setDissolveEffect({
    duration = 2,
    appears = 'byObject', // or 'byWord' or 'byChar'
    startsFrom = 'top', // or 'bottom' or 'center' or 'edges' or 'random'
  }) {
    this.openInspector(1);
    this.selectInspectorTab(t('Entrée'));
    this.selectEffect(t('Dissolution'));
    this.setEffectDuration(duration);

    const scrollArea = this.mainWindow.scrollAreas[0];
    const appearsSelect = scrollArea.popUpButtons[0];
    const startsFromSelect = scrollArea.popUpButtons[1];

    if (appears === 'byWord') {
      this.setSelectBoxValue(appearsSelect, t('Par mot'));
    } else if (appears === 'byChar') {
      this.setSelectBoxValue(appearsSelect, t('Par caractère'));
    } else {
      this.setSelectBoxValue(appearsSelect, t('Par objet'));
    }

    if (startsFrom === 'bottom') {
      this.setSelectBoxValue(startsFromSelect, t("Vers l'arrière"));
    } else if (startsFrom === 'center') {
      this.setSelectBoxValue(startsFromSelect, t('À partir du center'));
    } else if (startsFrom === 'edges') {
      this.setSelectBoxValue(startsFromSelect, t('À partir des bords'));
    } else if (startsFrom === 'random') {
      this.setSelectBoxValue(startsFromSelect, t('Aléatoire'));
    } else {
      this.setSelectBoxValue(startsFromSelect, t("Vers l'avant"));
    }
  }

  setFadeMoveEffect({
    duration = 2,
    direction = 'bottomToTop', // topToBottom, leftToRight, rightToLeft, topLeftToBottomRight, topRightToBottomLeft, bottomLeftToTopRight, bottomRightToTopLeft
    distance = 100, // from 0% to 100%
    // appears = 'byObject', // byWord, byChar
    // startsFrom = 'top', // bottom, center, edges, random
  }) {
    this.openInspector(1);
    this.selectInspectorTab(t('Entrée'));
    this.selectEffect(t('Fondu et déplacement'));
    this.setEffectDuration(duration);

    let directionIndex = 3;
    if (direction === 'leftToRight') directionIndex = 0;
    else if (direction === 'rightToLeft') directionIndex = 1;
    else if (direction === 'topToBottom') directionIndex = 2;
    else if (direction === 'topLeftToBottomRight') directionIndex = 4;
    else if (direction === 'topRightToBottomLeft') directionIndex = 5;
    else if (direction === 'bottomLeftToTopRight') directionIndex = 6;
    else if (direction === 'bottomRightToTopLeft') directionIndex = 7;

    const scrollArea = this.mainWindow.scrollAreas[0];
    const directionSelect = scrollArea.popUpButtons[0];
    const distanceSlider = scrollArea.sliders[1];

    this.setSelectBoxIndex(directionSelect, directionIndex);
    distanceSlider.value = distance / 100;
  }

  setFadeScaleEffect({
    duration = 2,
    scale = 100, // from 0% to 200%
  } = {}) {
    this.openInspector(1);
    this.selectInspectorTab(t('Entrée'));
    this.selectEffect(t('Fondu et échelle'));
    this.setEffectDuration(duration);

    const scrollArea = this.mainWindow.scrollAreas[0];
    const scaleSlider = scrollArea.sliders[1];

    scaleSlider.value = scale;
  }

  setFadeScaleOutEffect({
    duration = 2,
    scale = 100, // from 0% to 200%
  } = {}) {
    this.openInspector(1);
    this.selectInspectorTab(t('Sortie'));
    this.selectEffect(t('Fondu et échelle'));
    this.setEffectDuration(duration);

    const scrollArea = this.mainWindow.scrollAreas[0];
    const scaleSlider = scrollArea.sliders[1];

    scaleSlider.value = scale;
  }

  setDisappearEffect() {
    this.openInspector(1);
    this.selectInspectorTab(t('Sortie'));
    this.selectEffect(t('Disparition'));
  }

  setOpacityEffect({ duration = 1, opacity = 50 }) {
    this.openInspector(1);
    this.selectInspectorTab(t('Action'));
    this.selectEffect(t('Opacité'));
    this.setEffectDuration(duration);

    const scrollArea = this.mainWindow.scrollAreas[0];
    scrollArea.sliders[1].value = opacity;
  }

  addHorizontalOverlays() {
    this.copyPasteObjectsFromSlide(1);
  }

  addVerticalOverlays() {
    this.copyPasteObjectsFromSlide(2);
  }

  addText(text, ...args) {
    let [format, textProperties = {}] = args;

    if (args.length === 1 && typeof format === 'object') {
      // eslint-disable-next-line no-unused-expressions
      textProperties = format;
      format = null;
    }

    if (format) {
      textProperties = { ...typography[format], ...textProperties };
    }

    const slide = this.doc.currentSlide;
    const textItem = this.keynote.TextItem({
      objectText: text,
    });
    slide.textItems.push(textItem);
    textItem.objectText.size = textProperties.size;
    textItem.objectText.font = textProperties.font;
    textItem.objectText.color = [65535, 65535, 65535];

    if (textProperties.opacity) {
      textItem.opacity = textProperties.opacity;
    }

    this.selectElement(textItem);

    return textItem;
  }

  setTextLineHeight(textItem, value) {
    this.selectElement(textItem);

    this.openInspector(0);
    this.selectInspectorTab(t('Texte'));

    const scrollArea = this.mainWindow.scrollAreas[0];
    const textField = scrollArea.textFields[3];
    this.setTextFieldValue(textField, `${value}`.replace('.', ','));
  }

  setTextAlignment(textItem, align) {
    this.selectElement(textItem);

    this.openInspector(0);
    this.selectInspectorTab(t('Texte'));

    const scrollArea = this.mainWindow.scrollAreas[0];
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

  setTextNumbered(textItem, number, indent = null) {
    this.selectElement(textItem);

    this.openInspector(0);
    this.selectInspectorTab(t('Texte'));

    const scrollArea = this.mainWindow.scrollAreas[0];
    const group = scrollArea.groups[4];

    this.setSelectBoxValue(scrollArea.popUpButtons[4], t('Numéros'));
    group.radioGroups[0].radioButtons[1].click();

    _.range(1, number).forEach(() => {
      group.incrementors[3].buttons[0].click();
    });

    if (indent !== null) {
      this.setTextFieldValue(group.textFields[1], indent);
    }
  }

  addLine({ vertical = false, withAnimation = true, width } = {}) {
    const { currentSlide: slide } = this.doc;

    let size;
    if (width) size = width;
    else size = vertical ? 600 : 800;

    const line = this.keynote.Line(
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
      this.setLineDrawEffect();
    }

    return line;
  }

  addSlide(backgroundName) {
    const slide = this.keynote.Slide({
      baseLayout: this.doc.slideLayouts.byName(backgroundName),
    });

    this.doc.slides.push(slide);

    slide.transitionProperties = {
      automaticTransition: false,
      transitionEffect: 'magic move',
      transitionDuration: 0.7,
    };

    return slide;
  }

  addSlideFromTemplate(template, index = 0) {
    const [firstIndex] = templateRanges[template];

    this.duplicateSlide(firstIndex + index);
  }

  setElementX(element, x) {
    element.position = { x, y: element.position().y };
  }

  setElementY(element, y) {
    element.position = { x: element.position().x, y };
  }

  setElementXY(element, x, y) {
    element.position = { x, y };
  }

  findElement(matcher, from = 0, type = 'iworkItem') {
    let matched = 0;
    for (let i = 0; i < this.doc.currentSlide[`${type}s`].length; i += 1) {
      const item = this.doc.currentSlide.iworkItems[i];

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

  findTextElement(expr, from = 0) {
    return this.findElement((item) => {
      try {
        return item.objectText().match(expr);
      } catch (e) {
        return false;
      }
    }, from);
  }

  deleteElement(element) {
    this.selectElement(element);
    delay(0.5);
    this.pressBackspace();
    // element.delete();
  }
}
