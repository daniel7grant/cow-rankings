const path = require('path');

module.exports = {
	mode: 'development',
	entry: {
		index: './src/index.js',
		thanks: './src/thanks.js',
		result: './src/result.js',
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: '[name].bundle.js'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				use: 'babel-loader'
			},
			{
				test: /\.scss$/,
				use: [{
					loader: "style-loader" // creates style nodes from JS strings
				}, {
					loader: "css-loader" // translates CSS into CommonJS
				}, {
					loader: "sass-loader" // compiles Sass to CSS
				}]
			},
			{
				test: /\.css$/,
				use: [{
					loader: "style-loader" // creates style nodes from JS strings
				}, {
					loader: "css-loader" // translates CSS into CommonJS
				}]
			},
			{
				test: /\.hbs$/,
				use: 'handlebars-loader'
			},
		]
	},
	node: {
		fs: 'empty'
	}
};
