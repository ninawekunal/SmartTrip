const path = require("path");
const fs = require("fs");

function parseJsonc(input) {
  const withoutBlockComments = input.replace(/\/\*[\s\S]*?\*\//g, "");
  const withoutLineComments = withoutBlockComments.replace(/^\s*\/\/.*$/gm, "");
  return JSON.parse(withoutLineComments);
}

const rawConfig = fs.readFileSync(path.resolve(process.cwd(), "config/global.config.jsonc"), "utf8");
const config = parseJsonc(rawConfig);

module.exports = {
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  entry: config.webpack.client.entry,
  output: {
    filename: config.webpack.client.outputFile,
    path: path.resolve(process.cwd(), config.webpack.client.outputDir)
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  }
};
