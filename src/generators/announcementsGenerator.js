import _ from 'lodash';
import { documentWidth, documentHeight } from '../config';
import Generator from '../services/Generator';

const contentWidth = documentWidth - 200;
const contentHeight = documentHeight - 430;
const contentPositionY = documentHeight - contentHeight - 100;
const margin = 80;

export default class AnnouncementsGenerator extends Generator {
  generate() {
    const { items = [] } = this.data;

    const background = this.driver.getNextRegularBackground();

    _.forEach(_.chunk(items, 6), (chunk, chunkIndex) => {
      const withAnimation = chunkIndex === 0;

      this.driver.addSlide(background);

      const line = this.driver.addLine({ vertical: true, withAnimation });
      this.driver.setElementY(
        line,
        (contentHeight - line.width()) / 2 + contentPositionY,
      );
      this.driver.setEffectStartup('onClick');

      const title = this.driver.addText('Annonces', 'title');
      this.driver.setElementY(title, 90);

      if (withAnimation) {
        this.driver.setFadeMoveEffect({
          duration: 0.7,
          direction: 'bottomToTop',
          distance: 10,
        });
        this.driver.setEffectStartup('afterPrevious');
      }

      const itemWidth = (contentWidth - margin * 2) / 2;
      const leftPartX = (documentWidth - contentWidth) / 2;
      const rightPartX = leftPartX + itemWidth + margin * 2;
      let currentY = contentPositionY;

      _.forEach(chunk, (item, itemIndex) => {
        const x = itemIndex / 3 < 1 ? leftPartX : rightPartX;
        const y = currentY;

        const itemTitle = this.driver.addText(
          item.title,
          'announcementItemTitle',
        );
        itemTitle.width = itemWidth;

        this.driver.setTextAlignment(itemTitle, 'left');
        this.driver.setElementXY(itemTitle, x, y);
        this.driver.setDissolveEffect({ duration: 0.7, appears: 'byChar' });

        if (!itemIndex) {
          this.driver.setEffectStartup('afterPrevious');
        } else {
          this.driver.setEffectStartup('withPrevious', 0.1);
        }

        if (item.detail) {
          const itemDetail = this.driver.addText(
            item.detail,
            'announcementItemDetail',
          );
          itemDetail.width = itemWidth;

          this.driver.setTextAlignment(itemDetail, 'left');
          this.driver.setElementXY(itemDetail, x, y + itemTitle.height());
          this.driver.setDissolveEffect({ duration: 0.7, appears: 'byChar' });
          this.driver.setEffectStartup('withPrevious', 0.1);

          currentY += itemDetail.height();
        }

        if (itemIndex === 2) {
          currentY = contentPositionY;
        } else {
          currentY += itemTitle.height() + 60;
        }
      });
    });
  }
}
