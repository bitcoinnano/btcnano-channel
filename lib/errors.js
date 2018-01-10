'use strict';

var spec = {
  name: 'Channel',
  message: 'Internal Error on btcnano-channels Module {0}',
};

module.exports = require('btcnano-lib').errors.extend(spec);
