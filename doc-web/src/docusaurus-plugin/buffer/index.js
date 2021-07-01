const webpack = require('webpack');

module.exports = function () {
    return {
      name: 'custom-buffer-plugin',
      configureWebpack() {
        return {
            plugins: [
                new webpack.ProvidePlugin({
                    process: "process/browser",
                    Buffer: [ "buffer", "Buffer" ],
                }),
            ]
        };
      },
    };
};