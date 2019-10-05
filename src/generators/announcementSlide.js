const _ = require('lodash');
const { documentWidth, documentHeight } = require('../config');

let driver;

const contentWidth = documentWidth - 200;
const contentHeight = documentHeight - 430;
const contentPositionY = documentHeight - contentHeight - 100;
const margin = 80;

function createSlide({ items = [] } = {}) {
  const background = driver.getNextRegularBackground();

  _.forEach(_.chunk(items, 6), (chunk, chunkIndex) => {
    const withAnimation = chunkIndex === 0;

    driver.addSlide(background);
    driver.addBubbles(chunkIndex);

    const line = driver.addLine({ vertical: true, withAnimation });
    driver.setElementY(
      line,
      (contentHeight - line.width()) / 2 + contentPositionY,
    );

    const title = driver.addText('Annonces', 'title');
    driver.setElementY(title, 90);

    if (withAnimation) {
      driver.setFadeMoveEffect({
        duration: 0.7,
        direction: 'bottomToTop',
        distance: 10,
      });
      driver.setEffectStartup('afterPrevious');
    }

    const itemWidth = (contentWidth - margin * 2) / 2;
    const leftPartX = (documentWidth - contentWidth) / 2;
    const rightPartX = leftPartX + itemWidth + margin * 2;
    let currentY = contentPositionY;

    _.forEach(chunk, (item, itemIndex) => {
      const x = itemIndex / 3 < 1 ? leftPartX : rightPartX;
      const y = currentY;

      const itemTitle = driver.addText(item.title, 'announcementItemTitle');
      itemTitle.width = itemWidth;

      driver.setTextAlignment(itemTitle, 'left');
      driver.setElementXY(itemTitle, x, y);
      driver.setDissolveEffect({ duration: 0.7, appears: 'byChar' });

      if (!itemIndex) {
        driver.setEffectStartup('afterPrevious');
      } else {
        driver.setEffectStartup('withPrevious', 0.1);
      }

      if (item.detail) {
        const itemDetail = driver.addText(
          item.detail,
          'announcementItemDetail',
        );
        itemDetail.width = itemWidth;

        driver.setTextAlignment(itemDetail, 'left');
        driver.setElementXY(itemDetail, x, y + itemTitle.height());
        driver.setDissolveEffect({ duration: 0.7, appears: 'byChar' });
        driver.setEffectStartup('withPrevious', 0.1);

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

export function createAnnouncementSlideGenerator(driver_) {
  driver = driver_;

  return createSlide;
}

export default null;
