'use strict';

// Production specific configuration
// =================================
module.exports = {
  // Server IP
  ip:       process.env.OPENSHIFT_NODEDIY_IP ||
            process.env.IP ||
            'localhost',

  // Server port
  port:     process.env.OPENSHIFT_NODEDIY_PORT ||
            process.env.PORT ||
            8080,
};
