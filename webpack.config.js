const webpackBuilder = require('dev/webpack/builder');
const glob = require('glob');

module.exports = webpackBuilder(__dirname)
    .forDevelopment('main', builder => builder
        .addEntry(
            'entry',
            [
              ...glob.sync('./src/**/*.test.ts'),
              ...glob.sync('./src-next/**/*.test.ts'),
            ],
        )
        .setOutput('bundle.js', '/out')
        .addTypeScript()
        .addHtml(),
    )
    .build('main');
