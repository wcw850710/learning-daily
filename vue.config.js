const CopyWebpackPlugin = require('copy-webpack-plugin')
const path = require('path')
const UglifyJS = require('uglify-es')
const htmlMinify = require('html-minifier').minify

// Generate pages object
const pagesObj = {}

const chromeName = ['popup' /*, 'options'*/]

chromeName.forEach(name => {
    pagesObj[name] = {
        entry: `src/${name}/index.js`,
        template: 'public/index.html',
        filename: `${name}.html`,
    }
})

const plugins = [
    {
        from: path.resolve('src/manifest.json'),
        to: `${path.resolve('dist')}/manifest.json`,
    },
    {
        from: path.resolve('src/bg/'),
        to: `${path.resolve('dist')}/[name].[ext]`,
        transform(content) {
            return UglifyJS.minify(content.toString()).code
        },
        ignore: ['*.html'],
    },
    {
        from: path.resolve('src/bg/bg.html'),
        to: `${path.resolve('dist')}/bg.html`,
        transform(content) {
            return htmlMinify(content.toString(), {
                removeAttributeQuotes: true,
                collapseWhitespace: true,
                minifyCSS: true,
                minifyJS: true,
                removeComments: true,
            })
        },
    },
    {
        from: path.resolve('src/icons/'),
        to: `${path.resolve('dist')}/[name].[ext]`,
    },
]

module.exports = {
    pages: pagesObj,
    configureWebpack: {
        plugins: [CopyWebpackPlugin(plugins)],
    },
}
