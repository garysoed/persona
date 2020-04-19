const glob = require("glob");

const webpackBuilder = require('dev/webpack/builder');
module.exports = webpackBuilder(__dirname)
    .forDevelopment('persona', builder => builder
        .addEntry('entry', glob.sync('./src/**/*.test.ts'))
        .setOutput('bundle.js', '/out')
        .addTypeScript()
        .addHtml(),
    )
    .build();
