export default class Generator {
  constructor(driver, data) {
    this.driver = driver;
    this.data = data;
    this.previousBlock = null;
    this.nextBlock = null;
  }

  setPreviousBlock(block) {
    this.previousBlock = block;
  }

  setNextBlock(block) {
    this.nextBlock = block;
  }
}
