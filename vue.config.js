const CopyWebpackPlugin = require('copy-webpack-plugin')
const path = require('path')
const UglifyJS = require('uglify-es')
const htmlMinifier = require('html-minifier').minify

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
        from: path.resolve('src/background/'),
        to: `${path.resolve('dist')}/background/[name].min.[ext]`,
        transform(content) {
            return UglifyJS.minify(content.toString()).code
        },
        ignore: ['*.html', '*.min.js'],
    },
    {
        from: path.resolve('src/background/'),
        to: `${path.resolve('dist')}/background/[name].[ext]`,
        transform(content, path) {
            if (/.html$/.test(path)) {
                return htmlMinifier(content.toString(), {
                    removeAttributeQuotes: true,
                    collapseWhitespace: true,
                    // minifyCSS: true,
                    // minifyJS: (text, inline) => {
                    //     return UglifyJS.minify(text).code
                    // },
                    removeComments: true,
                })
            } else {
                return content.toString()
            }
        },
        ignore: ['bg.js'],
    },
    {
        from: path.resolve('src/content-script/'),
        to: `${path.resolve('dist')}/content-script/[name].min.[ext]`,
        transform(content) {
            return UglifyJS.minify(content.toString()).code
        },
    },
    {
        from: path.resolve('src/icons/'),
        to: `${path.resolve('dist')}/icons/[name].[ext]`,
    },
]

module.exports = {
    pages: pagesObj,
    configureWebpack: {
        plugins: [CopyWebpackPlugin(plugins)],
    },
}
