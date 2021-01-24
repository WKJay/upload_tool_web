const path = require('path');
module.exports = {
    mode: "production",
    output: {
        filename: 'bundle.min.js',
        path: path.resolve(__dirname, '../dist'),
    },
}