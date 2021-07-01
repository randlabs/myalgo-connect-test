module.exports = function (context, options) {
    return {
      name: 'custom-algosdk-plugin',
      configureWebpack() {
        return {
          externals: {
            // Algosdk 1.9.1
            crypto: "crypto"
          },
        };
      },
    };
};