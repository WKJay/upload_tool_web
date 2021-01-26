const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    target: 'web',
    mode: "development",
    output: {
        filename: 'bundle.js'
    },
    module: {
        rules: [{
            test: /\.txt$/,
            use: 'raw-loader'
        }, {
            test: /\.css$/i,
            use: ['style-loader', 'css-loader', 'postcss-loader']
        }, {
            test: /\.(jpg|png|gif)$/i,
            use: {
                loader: 'url-loader',
                options: {
                    outputPath: 'imgs/',
                    publicPath: 'dest/imgs/',
                    limit: 4 * 1024
                }
            }
        }, {
            test: /\.js$/i,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ["@babel/preset-env"]
                }
            }
        }]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html'
        }),
    ],

    devtool: 'source-map',
    devServer: {
        proxy: {
            '/': 'http://192.168.31.56:80'
        }
    }
}