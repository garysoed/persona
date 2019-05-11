const glob = require("glob");

const WebpackBuilder = require('dev/webpack/builder');
module.exports = (new WebpackBuilder(__dirname))
    .addEntry('entry', glob.sync('./src/**/*.test.ts'))
    .setOutput('bundle.js', '/out')
    .addTypeScript()
    .buildForDevelopment('Persona');
