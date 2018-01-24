/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');
var path = require('path');
module.exports = function(app) {

  // Insert routes below
  app.use('/api/workstreams', require('./api/workstream'));

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendFile(path.join(__dirname, '../' + app.get('appPath') + '/index.html'));
    });
};
