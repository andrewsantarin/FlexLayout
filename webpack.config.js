const webpack = require('webpack');

module.exports = {
	mode:'development',
	entry: {
		demo: "./examples/demo/App.tsx",
	    tests: "./spec/main.ts"
	},

	output: {
		path: __dirname,
		filename: "./bundles/[name].js"
	},

	resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js", ".json"]
    },

	watch:true,

	devServer: {
		contentBase: '.',
		port: 3000,
		hot: true
	},

	plugins: [
		new webpack.HotModuleReplacementPlugin()
	],

	devtool: 'source-map',

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            { test: /\.tsx?$/, loader: "awesome-typescript-loader" },

            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
        ]
    }
};
