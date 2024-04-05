import _ from 'lodash';
import {
  documentHeight,
  documentWidth,
  regularBackgroundsNumber,
} from '../config';
import * as slideUtils from '../utils/slide';
import { t } from '../utils/t';

export default class Driver {
  systemEvent;
  keynote: any;
  mainWindow;
  doc;
  currentClipboard?: number;
  backgrounds: number[] = [];
  templates: Record<string, number[]> = {};
  findElement;
  findTextElement;

  constructor(filename: string) {
    this.findElement = (...args: ParametersExceptFirst<typeof slideUtils.findElement>) => slideUtils.findElement(this.doc.currentSlide, ...args);
    this.findTextElement = (...args: ParametersExceptFirst<typeof slideUtils.findTextElement>) => slideUtils.findTextElement(this.doc.currentSlide, ...args);

    this.systemEvent = Application('System Events');
    this.keynote = Application('Keynote');
    this.mainWindow
      = this.systemEvent.processes.Keynote.windows.byName(filename);

    if (this.keynote.documents.length) {
      this.doc = this.keynote.documents[0];
    }
    else {
      this.doc = this.keynote.Document();
      this.keynote.documents.push(this.doc);
    }

    this.doc.width = documentWidth;
    this.doc.height = documentHeight;

    this.initTemplates();
    this.keynote.activate();

    while (!this.keynote.frontmost()) {
      delay(0);
    }
  }

  initTemplates() {
    for (let i = 0; i < this.doc.slides.length; i += 1) {
      const slide = this.doc.slides[i];
      const slideName = slideUtils.findTextElement(slide, /^slide:/);

      if (!slideName) {
        break;
      }

      const name = slideName.objectText().split(':')[1].trim();

      if (name === 'end') {
        break;
      }

      if (!this.templates[name]) {
        this.templates[name] = [i, i];
      }

      this.templates[name][1] = i;
    }
  }

  getNextRegularBackground() {
    if (this.backgrounds.length === 0) {
      this.backgrounds = _.shuffle(_.range(1, regularBackgroundsNumber));
    }

    return `backgroundR${this.backgrounds.pop()}`;
  }

  press(key: string, using: KeystrokeUsingOption) {
    this.systemEvent.keystroke(key, { using });
    delay(0.2);
  }

  // See https://eastmanreference.com/complete-list-of-applescript-key-codes
  pressEnter() {
    this.systemEvent.keyCode(36);
  }

  pressBackspace() {
    this.systemEvent.keyCode(51);
  }

  // function pressEscape() {
  //   this.systemEvent.press(53);
  // }

  // function pressTab() {
  //   this.systemEvent.press(48);
  // }

  setTextFieldValue(textField: any, value: string) {
    textField.focused = true;
    textField.value = `${value}`;
    textField.focused = false;
    textField.confirm();
  }

  selectElement(element: any) {
    element.locked = true;
    element.locked = false;
  }

  selectSlide(index: number) {
    this.doc.currentSlide = this.doc.slides[index];
  }

  duplicateSlide(index: number) {
    this.doc.slides[index].duplicate();
    delay(0.1);
    this.doc.currentSlide.skipped = false;
  }

  copyPasteObjectsFromSlide(slideIndex: number) {
    if (this.currentClipboard !== slideIndex) {
      const currentSlideIndex = _.indexOf(
        this.doc.slides,
        this.doc.currentSlide,
      );
      this.selectSlide(slideIndex);
      this.press('a', 'command down');
      this.press('c', 'command down');
      delay(0.5);
      this.selectSlide(currentSlideIndex);
      this.currentClipboard = slideIndex;
    }

    this.press('v', 'command down');
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

  selectInspectorTab(tab: string) {
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

  setSelectBoxValue(selectBox: any, name: string) {
    selectBox.click();
    selectBox.menus[0].menuItems.byName(name).click();
  }

  setSelectBoxIndex(selectBox: any, index: number) {
    selectBox.click();
    const size = _.size(selectBox.menus[0].menuItems);
    selectBox.menus[0].menuItems[Math.min(index, size - 1)].click();
  }

  /**
   * Effect helpers
   */

  selectEffect(effect: string) {
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
   * @param {int} delay Delay
   */
  setEffectStartup(begin: 'onClick' | 'afterPrevious' | 'withPrevious', delay = 0) {
    const win = this.getBuildOrderWindow();

    let beginIndex = 0;
    if (begin === 'withPrevious') {
      beginIndex = 1;
    }
    else if (begin === 'afterPrevious') {
      beginIndex = 2;
    }

    this.setSelectBoxIndex(win.popUpButtons[0], beginIndex);

    const delayTextField = win.textFields[0];
    this.setTextFieldValue(delayTextField, `${delay}`.replace('.', ','));
  }

  setEffectDuration(duration: number) {
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
    }
    else if (appears === 'byChar') {
      this.setSelectBoxValue(appearsSelect, t('Par caractère'));
    }
    else {
      this.setSelectBoxValue(appearsSelect, t('Par objet'));
    }

    if (startsFrom === 'bottom') {
      this.setSelectBoxValue(startsFromSelect, t('Vers l\'arrière'));
    }
    else if (startsFrom === 'center') {
      this.setSelectBoxValue(startsFromSelect, t('À partir du center'));
    }
    else if (startsFrom === 'edges') {
      this.setSelectBoxValue(startsFromSelect, t('À partir des bords'));
    }
    else if (startsFrom === 'random') {
      this.setSelectBoxValue(startsFromSelect, t('Aléatoire'));
    }
    else {
      this.setSelectBoxValue(startsFromSelect, t('Vers l\'avant'));
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
    if (direction === 'leftToRight') {
      directionIndex = 0;
    }
    else if (direction === 'rightToLeft') {
      directionIndex = 1;
    }
    else if (direction === 'topToBottom') {
      directionIndex = 2;
    }
    else if (direction === 'topLeftToBottomRight') {
      directionIndex = 4;
    }
    else if (direction === 'topRightToBottomLeft') {
      directionIndex = 5;
    }
    else if (direction === 'bottomLeftToTopRight') {
      directionIndex = 6;
    }
    else if (direction === 'bottomRightToTopLeft') {
      directionIndex = 7;
    }

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

  addText(text: string, textProperties: {
    size: number
    font: number
    opacity: number
  }) {
    const slide = this.doc.currentSlide;
    const textItem = this.keynote.TextItem({
      objectText: text,
    });
    slide.textItems.push(textItem);

    textItem.objectText = {
      size: textProperties.size,
      font: textProperties.font,
      color: [65535, 65535, 65535],
    };

    if (textProperties.opacity) {
      textItem.opacity = textProperties.opacity;
    }

    this.selectElement(textItem);

    return textItem;
  }

  setTextLineHeight(textItem: JXAKeynote.TextItem, value: string) {
    this.selectElement(textItem);

    this.openInspector(0);
    this.selectInspectorTab(t('Texte'));

    const scrollArea = this.mainWindow.scrollAreas[0];
    const textField = scrollArea.textFields[3];
    this.setTextFieldValue(textField, `${value}`.replace('.', ','));
  }

  setTextAlignment(textItem: JXAKeynote.TextItem, align?: 'left' | 'right') {
    this.selectElement(textItem);

    this.openInspector(0);
    this.selectInspectorTab(t('Texte'));

    const scrollArea = this.mainWindow.scrollAreas[0];
    const group = _.find(
      scrollArea.groups,
      item => item.description() === t('alignement de paragraphe'),
    );

    if (!group) {
      return;
    }

    if (align === 'left') {
      group.checkboxes[0].click();
    }
    else if (align === 'right') {
      group.checkboxes[2].click();
    }
    else {
      group.checkboxes[1].click();
    }
  }

  setTextNumbered(textItem: JXAKeynote.TextItem, number: number, indent = null) {
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

  addLine({ vertical = false, withAnimation = true, width }: {
    vertical?: boolean
    withAnimation?: boolean
    width?: number
  } = { }) {
    const { currentSlide: slide } = this.doc;

    let size;
    if (width) {
      size = width;
    }
    else {
      size = vertical ? 600 : 800;
    }

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

  addSlide(backgroundName: string) {
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

  addSlideFromTemplate(template: string, index = 0) {
    const [firstIndex] = this.templates[template];

    this.duplicateSlide(firstIndex + index);
  }

  setElementX(element: any, x: number) {
    element.position = { x, y: element.position().y };
  }

  setElementY(element: any, y: number) {
    element.position = { x: element.position().x, y };
  }

  setElementXY(element: any, x: number, y: number) {
    element.position = { x, y };
  }

  deleteElement(element: any) {
    this.selectElement(element);
    delay(0.5);
    this.pressBackspace();
    // element.delete();
  }
}
