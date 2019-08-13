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

    const line = driver.addLine(true, withAnimation);
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

    _.forEach(chunk, (item, itemIndex) => {
      const itemHeight = contentHeight / 3;
      const itemWidth = (contentWidth - margin * 2) / 2;
      const leftPartX = (documentWidth - contentWidth) / 2;
      const rightPartX = leftPartX + itemWidth + margin * 2;
      const x = itemIndex % 2 === 0 ? leftPartX : rightPartX;
      const y = itemHeight * Math.floor(itemIndex / 2) + contentPositionY;

      const itemTitle = driver.addText(item.title, 'announcementItemTitle');
      itemTitle.width = itemWidth;

      driver.setTextAlignment(itemTitle, 'left');
      driver.setElementXY(itemTitle, x, y);
      driver.setDissolveEffect({ duration: 0.7, appears: 'byChar' });

      if (!itemIndex) {
        driver.setEffectStartup('afterPrevious');
      } else {
        driver.setEffectStartup('whilePrevious', 0.1);
      }

      if (item.detail) {
        const detailTitle = driver.addText(
          item.detail,
          'announcementItemDetail',
        );
        detailTitle.width = itemWidth;

        driver.setTextAlignment(detailTitle, 'left');
        driver.setElementXY(detailTitle, x, y + itemTitle.height());
        driver.setDissolveEffect({ duration: 0.7, appears: 'byChar' });
        driver.setEffectStartup('whilePrevious', 0.1);
      }
    });
  });
}

export function createAnnouncementSlideGenerator(driver_) {
  driver = driver_;

  return createSlide;
}

export default null;
