const path = require("path");
const packageJson = require("./package.json");

const libraryName = packageJson.name; // Fetch name from package.json

module.exports = {
  entry: "./src/index.js", // Main entry point of your library
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: `${libraryName}.min.js`, // Dynamically set filename
    library: "MyLibrary",
    libraryTarget: "umd", // Supports CommonJS, AMD, and global variable
    globalObject: "this", // Ensures compatibility with browser and Node.js
    clean: true, // Cleans the output directory before each build
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
  resolve: {
    extensions: [".js"],
  },
};
