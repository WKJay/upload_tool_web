const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function (env, argv) {
    env = env || {
        development: true
    };
    let config = {
        target:false,
        ...env.production ? require("./config/webpack.production") : require("./config/webpack.development"),
        entry: './src/js/index.js',
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
                template: './src/index.html',
            })
        ],
        devtool: 'source-map',
        devServer: {
            proxy: {
                '/': 'http://192.168.1.245:80'
            }
        }
    }
    return config;
};