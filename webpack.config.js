const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = function (env, argv) {
    env = env || {
        development: true
    };
    let config = {
        target: false,
        ...env.production ? require("./config/webpack.production") : require("./config/webpack.development"),
        entry: './src/js/index.js',
        module: {
            rules: [{
                test: /\.txt$/,
                use: 'raw-loader'
            }, {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader']
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
        optimization: {
            minimize: true,
            minimizer: [
                // For webpack@5 you can use the `...` syntax to extend existing minimizers (i.e. `terser-webpack-plugin`), uncomment the next line
                `...`,
                new CssMinimizerPlugin({
                    test: /\.css$/i,
                  }),
            ],
        },
        plugins: [
            new HtmlWebpackInlineSourcePlugin(HtmlWebpackPlugin),
            new MiniCssExtractPlugin(),
            new HtmlWebpackPlugin({
                template: './src/index.html',
                inlineSource: '.(js|css)$'
            }),
        ],
        // devtool: 'source-map
        devServer: {
            proxy: {
                '/': 'http://192.168.1.245:80'
            }
        }
    }
    return config;
};