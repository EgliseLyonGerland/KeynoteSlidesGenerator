const context = require.context('.', false, /\.song$/);
const songs = {};

context.keys().forEach(key => {
  const matches = /\/(.+?)\.song$/.exec(key);
  const songId = matches[1];
  songs[songId] = {
    id: songId,
    ...context(key),
  };
});

export default songs;
