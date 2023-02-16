const path = require("path");
const webpack = require("webpack");

module.exports = {
    entry: {
        'vote-received': "./src/autotask/vote-received.ts",
    },
    target: "node",
    mode: "development",
    devtool: 'cheap-module-source-map',
    module: {
        rules: [{test: /\.tsx?$/, use: "ts-loader", exclude: /node_modules/}],
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    externals: [
        // List here all dependencies available on the Autotask environment
        /axios/,
        /apollo-client/,
        /defender-[^\-]+-client/,
        /ethers/,
        /web3/,
        /@ethersproject\/.*/,
        /aws-sdk/,
        /aws-sdk\/.*/,
    ],
    externalsType: "commonjs2",
    plugins: [
        // List here all dependencies that are not run in the Autotask environment
        new webpack.IgnorePlugin({resourceRegExp: /dotenv/}),
    ],
    output: {
        filename: "[name]/index.js",
        path: path.resolve(__dirname, "build", "relay"),
        sourceMapFilename: '[file].map',
        library: {type: "commonjs2"},
    },
};
