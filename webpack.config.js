module.exports = function (env, argv) {
    env = env || {
        development: true
    };
    let config = {
        entry: './src/js/index.js',
        ...env.production ? require("./config/webpack.production") : require("./config/webpack.development"),
    }
    return config;
};