if (process.env.NODE_ENV === 'test') {
  module.exports = {
    presets: ['next/babel']
  };
} else {
  module.exports = {};
}
