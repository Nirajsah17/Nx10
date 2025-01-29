const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const TerserPlugin = require("terser-webpack-plugin");
const packageJson = require("./package.json");

module.exports = merge(common, {
  mode: "production",
  devtool: "source-map",
  output: {
    filename: `${packageJson.name}.min.js`, // Fetch name dynamically
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
});
