const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const packageJson = require("./package.json");

module.exports = merge(common, {
  mode: "development",
  devtool: "inline-source-map",
  output: {
    filename: `${packageJson.name}.dev.js`, // Fetch name dynamically
  },
  devServer: {
    static: "./dist",
    port: 3000,
    open: true,
    hot: true,
  },
});
