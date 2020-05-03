module.exports = function(config) {
  config.set({
    frameworks: ["jasmine", "source-map-support"],
    files: [
      {pattern: "out/bundle.js", watched: true, included: true},
      {pattern: "out/bundle.js.map", watched: true, included: false},
    ],
    exclude: [
    ],
    preprocessors: {
    },
    plugins: [
      require("karma-jasmine"),
      require("karma-sourcemap-loader"),
      require("karma-chrome-launcher"),
      require("dev/karma-reporter"),
      require("karma-source-map-support"),
    ],
    port: 8888,
    browsers: ['ChromeHeadless'],
    reporters: ["gs"],
    singleRun: false
  });
};
