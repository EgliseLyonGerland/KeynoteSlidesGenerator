/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import Generator from '../services/Generator';
import { createText as createAnnouncementText } from './announcementsGenerator';

export default class GoodbyeGenerator extends Generator {
  generate() {
    this.driver.addSlideFromTemplate('goodbye', 0);
    this.driver.addSlideFromTemplate('goodbye', 1);

    const textElt = this.driver.findTextElement(/^Lorem ipsum/);
    const { announcements = [] } = this.data;

    createAnnouncementText(textElt, announcements);
  }
}
