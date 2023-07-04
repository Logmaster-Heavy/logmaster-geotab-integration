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
            
            template: './src/app/pages/reportNHVRBreachesPage.html',
            inject: true,
            chunks: 'all',
            filename: './reportNHVRBreachesPage.html'
        }),
        new HtmlWebPackPlugin({
            
            template: './src/app/pages/reportPreStartChecksPage.html',
            inject: true,
            chunks: 'all',
            filename: './reportPreStartChecksPage.html'
        }),
        new HtmlWebPackPlugin({
            
            template: './src/app/pages/reportFitnessDeclarationsPage.html',
            inject: true,
            chunks: 'all',
            filename: './reportFitnessDeclarationsPage.html'
        }),
        new HtmlWebPackPlugin({
            
            template: './src/app/pages/reportFormsReportPage.html',
            inject: true,
            chunks: 'all',
            filename: './reportFormsReportPage.html'
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css'
        }),
        new HtmlWebPackPlugin({
            
            template: './src/app/pages/businessDashboardPage.html',
            inject: true,
            chunks: 'all',
            filename: './businessDashboardPage.html'
        }),
        new HtmlWebPackPlugin({
            
            template: './src/app/pages/adminUserListPage.html',
            inject: true,
            chunks: 'all',
            filename: './adminUserListPage.html'
        }),
        new HtmlWebPackPlugin({
            
            template: './src/app/pages/adminRoleListPage.html',
            inject: true,
            chunks: 'all',
            filename: './adminRoleListPage.html'
        }),
        new HtmlWebPackPlugin({
            
            template: './src/app/pages/adminDepotConfigurationPage.html',
            inject: true,
            chunks: 'all',
            filename: './adminDepotConfigurationPage.html'
        }),
        new HtmlWebPackPlugin({
            
            template: './src/app/pages/adminReportSetupPage.html',
            inject: true,
            chunks: 'all',
            filename: './adminReportSetupPage.html'
        }),
        new HtmlWebPackPlugin({
            
            template: './src/app/pages/adminFatigueCompliancePage.html',
            inject: true,
            chunks: 'all',
            filename: './adminFatigueCompliancePage.html'
        }),
    ],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'logmasterEwd2.js'
    }
}