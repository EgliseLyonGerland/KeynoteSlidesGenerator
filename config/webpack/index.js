const path = require("path");

const rootPath = path.join(__dirname, "../..");

module.exports = {
  mode: "development",
  entry: path.join(rootPath, "/src/index.js"),
  output: {
    path: path.join(rootPath, "/dist"),
    filename: "index.jxa"
  }
};
