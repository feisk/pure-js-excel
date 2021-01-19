const path = require('path');

module.exports = {
    context: path.resolve(__dirname, 'src'),
    mode: 'development',
    entry: './index.js',
    output: {
        filename: '[name].bundle.js',
        path: path.join(__dirname, 'dist')
    }
};
