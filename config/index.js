if (process.env.NODE_ENV === 'unittest') {
  module.exports = require('./config.unittest.js');
} else if (process.env.NODE_ENV === 'development') {
  module.exports = require('./config.dev.js');
} else {
  module.exports = require('./config.online.js');
}
