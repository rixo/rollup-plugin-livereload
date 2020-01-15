'use strict';

var livereload$1 = require('livereload');
var path = require('path');

var server;

function livereload(options) {
  if ( options === void 0 ) options = { watch: '' };

  if (typeof options === 'string') {
    options = {
      watch: options
    };
  } else {
    options.watch = options.watch || '';
  }

  // release previous server instance if rollup is reloading configuration in watch mode
  if (server) {
    server.close();
  }

  var enabled = options.verbose === false;
  var port = options.port || 35729;
  var snippetSrc = options.clientUrl ? JSON.stringify(options.clientUrl) : ("'//' + (window.location.host || 'localhost').split(':')[0] + ':" + port + "/livereload.js?snipver=1'");
  server = livereload$1.createServer(options);

  // Start watching
  if (Array.isArray(options.watch)) {
    server.watch(options.watch.map(function (w) { return path.resolve(process.cwd(), w); }));
  } else {
    server.watch(path.resolve(process.cwd(), options.watch));
  }

  // hooking on SIGINT/SIGTERM might cause more harm than good, since only one
  // plugin / lib can do that, we might cause process.exit before actual cleanup
  // is all completed -- disabling by default behind an option for now...
  if (options.closeServerOnTermination) {
    closeServerOnTermination(server);
  }

  return {
    name: 'livereload',
    banner: function banner() {
      return ("(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = " + snippetSrc + "; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);")
    },
    generateBundle: function generateBundle () {
      if (!enabled) {
        enabled = true;
        console.log(green('LiveReload enabled'));
      }
    }
  }
}

function green (text) {
  return '\u001b[1m\u001b[32m' + text + '\u001b[39m\u001b[22m'
}

function closeServerOnTermination (server) {
  var terminationSignals = ['SIGINT', 'SIGTERM'];
  terminationSignals.forEach(function (signal) {
    process.on(signal, function () {
      server.close();
      process.exit();
    });
  });
}

module.exports = livereload;
