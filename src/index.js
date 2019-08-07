const STANDART_BACKGROUNDS_RANGE = [1, 9];
const SONG_BACKGROUNDS_RANGE = [10, 13];

const app = Application("Keynote");
app.activate();

let doc;
if (app.documents.length) {
  doc = app.documents[0];
} else {
  doc = app.Document();
  app.documents.push(doc);
}

doc.width = 1920;
doc.height = 1080;

function addSlide(backgroundId = 1) {
  const slide = app.Slide({
    baseSlide: doc.masterSlides[backgroundId]
  });

  doc.slides.push(slide);

  slide.transitionProperties = {
    automaticTransition: false,
    transitionEffect: "magic move",
    transitionDuration: 0.7
  };

  return slide;
}

function addText(text) {
  const slide = doc.currentSlide;
  const textItem = app.TextItem({
    objectText: text
  });
  slide.textItems.push(textItem);
  textItem.objectText.size = 100;
  textItem.objectText.color = [0, 0, 65535];
  textItem.objectText.font = "AdobeHebrew-BoldItalic";
}

addSlide(2);
addText("Hello World!");
