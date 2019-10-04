const path = require('path');

module.exports = {
  entry: ['./src/mainVC.js'],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.bundle.js'
  }
};