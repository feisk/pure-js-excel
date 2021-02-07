const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const PrettierPlugin = require('prettier-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

const getFileName = (extention) => `bundle${isProd ? '.[hash]' : ''}.${extention}`;

const getCssLoader = (extra) => {
  const loaders = [MiniCssExtractPlugin.loader, 'css-loader'];

  if (extra) {
    loaders.push(extra);
  }

  return loaders;
};

const getBabelLoader = (preset) => {
  const presets = [['@babel/preset-env']];

  if (preset) {
    presets.push(preset);
  }

  const params = {
    exclude: /node_modules/,
    use: [
      {
        loader: 'babel-loader',
        options: {
          presets,
          plugins: [['@babel/plugin-transform-runtime']],
        },
      },
    ],
  };

  return params;
};

module.exports = {
  context: path.resolve(__dirname, 'src'),
  entry: './index.js',
  output: {
    filename: getFileName('js'),
    path: path.join(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@core': path.resolve(__dirname, 'src/core'),
    },
  },
  devtool: isDev ? 'source-map' : false,
  devServer: {
    port: 9000,
  },
  target: isDev ? 'web' : 'browserslist',
  plugins: [
    new CleanWebpackPlugin(),
    new HTMLWebpackPlugin({
      template: 'index.html',
      favicon: path.resolve(__dirname, 'src/favicon.ico'),
      cache: false,
      minify: {
        removeComments: isProd,
        collapseWhitespace: isProd,
      },
    }),
    new MiniCssExtractPlugin({ filename: getFileName('css') }),
    new PrettierPlugin(),
    new ESLintPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        ...getBabelLoader(),
      },
      {
        test: /\.css$/,
        use: getCssLoader(),
      },
      {
        test: /\.(sa|sc)ss$/,
        use: getCssLoader('sass-loader'),
      },
    ],
  },
};
