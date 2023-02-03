if (process.env.NODE_ENV === 'unittest') {
  module.exports = {
    presets: ['next/babel']
  };
} else {
  module.exports = {};
}
