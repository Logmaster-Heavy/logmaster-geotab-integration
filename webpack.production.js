const path = require('path');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const config = require('./src/app/config.json');
const ESLintPlugin = require('eslint-webpack-plugin');


/**
 * Removes "dev" element of the config tree on production build
 * 
 * @param {Buffer} content content of file
 * @param {string} path path to file
 */
const transform = function (content, path) {
    let config = JSON.parse(content);
    // let host = config.dev.dist.host;
    // let len = config.items.length;
    // // Appending the host to all item's url and icon
    // for(let i=0;i<len;i++){
    //     config.items[i].url = host + config.items[i].url;
    //     config.items[i].icon = host + config.items[i].icon; 
    // }

    delete config['dev'];
    let response = JSON.stringify(config, null, 2);
    // Returned string is written to file
    return response;
}

const entry_point = function (env) {
    if(env.CORE_ENV == 'dev'){
        return './src/.sandbox/index.js';
    } else if(env.CORE_ENV == 'staging'){
        return './src/.staging/index.js';
    }
    return './src/app/index.js';
}

module.exports = function (env) {
    return merge(common, {
        mode: 'production',
        entry: entry_point(env),
        module: {
            rules: [
                {
                    test: /\.css$/,
                    exclude: /\.dev/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                            options: {
                                publicPath: ''
                            }
                        },
                        'css-loader',
                        {
                            loader: './src/.dev/loaders/css-sandbox/css-sandbox.js',
                            options: { prefix: '#logmasterEwd2' }
                        }
                    ]
                },
                {
                    test: /\.js$/,
                    exclude: [/node_modules/, /\.dev/],
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env']
                        }
                    },
                },
                {
                    test: /\.html$/,
                    exclude: /\.dev/,
                    use: [
                        {
                            loader: 'html-loader',
                            options: { minimize: true }
                        }
                    ]
                },
                {
                    test: /\.(png|svg|jpg|gif)$/,
                    exclude: /\.dev/,
                    type: 'asset/resource'
                }
            ]
        },
        optimization: {
            minimize: true,
            minimizer: [
                new CssMinimizerPlugin(),
                new TerserPlugin({
                    test: /\.js(\?.*)?$/i
                })
            ]
        },
        plugins: [
            new ESLintPlugin({
                extensions: ['js'],
                exclude: ['/node_modules/', '/\.dev/'],
                formatter: 'stylish'
            }),
            new RemoveEmptyScriptsPlugin(),
            new ImageMinimizerPlugin({
                exclude: /dev/,
                test: /\.(jpe?g|png|gif|svg)$/,
                minimizerOptions: {
                    plugins: [
                        ['gifsicle'],
                        ['mozjpeg'],
                        ['pngquant'],
                        [
                            'svgo',
                            {
                                plugins: [
                                    {
                                        name: 'cleanupIDs',
                                        active: false 
                                    }
                                ]
                            }
                        ]
                    ]
                }
            }),
            new CopyWebpackPlugin({
                patterns: [
                    { from: './src/app/images', to: 'images' },
                    { from: './src/app/translations/', to: 'translations/' },
                    { from: './src/app/config.json', transform: transform },
                ]
            }) 
        ],
        output: {
            publicPath: ''
        }
    })
};