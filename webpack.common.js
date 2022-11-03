const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    plugins: [
        new HtmlWebPackPlugin({
            
            template: './src/app/logmasterEwd2.html',
            inject: true,
            chunks: 'all',
            filename: './logmasterEwd2.html'
        }),
        new HtmlWebPackPlugin({
            
            template: './src/app/pages/businessDriverPage.html',
            inject: true,
            chunks: 'all',
            filename: './businessDriverPage.html'
        }),
        new HtmlWebPackPlugin({
            
            template: './src/app/pages/manualEventsPage.html',
            inject: true,
            chunks: 'all',
            filename: './manualEventsPage.html'
        }),
        new HtmlWebPackPlugin({
            
            template: './src/app/pages/vehiclesPage.html',
            inject: true,
            chunks: 'all',
            filename: './vehiclesPage.html'
        }),
        new HtmlWebPackPlugin({
            
            template: './src/app/pages/reportNHVRCompliancePage.html',
            inject: true,
            chunks: 'all',
            filename: './reportNHVRCompliancePage.html'
        }),
        new HtmlWebPackPlugin({
            
            template: './src/app/pages/reportWACompliancePage.html',
            inject: true,
            chunks: 'all',
            filename: './reportWACompliancePage.html'
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css'
        }),
    ],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'logmasterEwd2.js'
    }
}