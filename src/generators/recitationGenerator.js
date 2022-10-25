import SongGenerator from './songGenerator';

export default class RecitationGenerator extends SongGenerator {
  init() {
    this.data.lyrics = this.data.content;
  }
}
