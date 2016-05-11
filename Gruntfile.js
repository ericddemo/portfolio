var _ = require('lodash');

var proxyMap = {
  "proxy":{
    "remoteMaps": {
      "http://sodah.net:80": [ "/turbo" ]
    }
  }
}


/**
 * Given an array of maps, return the dest url or proxy-config
 *
 * @param req
 * @param {Array<ProxyConfig>} maps Array of maps defined in dev.config.json
 * @return {MapDef|Boolean} MapDef if found, false if no match
 */
function checkProxyMaps( req, maps ){
  //console.log("CheckProxyMaps: " + req.url, maps);
  var i, contextResult;
  for (i in maps) {
    contextResult = hasContext(maps[i], req.url);
    if( contextResult === true ) return { dest : i };
    if( Object.prototype.toString.call( contextResult ) === '[object Object]') {
      return { dest: i, options: contextResult };
    }
  }
  return false;
}


/**
 * Test function to match url paths used for proxy map tests
 *
 * @param {ProxyConfig|String|Array<ProxyConfig|String>} context
 * @param {String} uri URI To search for a map
 * @returns {ProxyConfig|Boolean} True or Proxy config on match, false otherwise
 */
function hasContext(context, uri) {
  var url = require('url'),
    urlPath = url.parse(uri).path,
    cIdx, tmpResult;

  // For strings, this is a simple test
  if (typeof context === 'string') {
    return urlPath.indexOf(context) === 0;
  }

  // Objects are custom http-proxy defs, use the pattern property
  if( Object.prototype.toString.call( context ) === '[object Object]') {
    return urlPath.indexOf(context.pattern) === 0 ? context : false;
  }

  // Arrays need recursion
  if( Object.prototype.toString.call( context ) === '[object Array]' ) {
    for (cIdx = 0; cIdx < context.length; cIdx++) {
      tmpResult = hasContext(context[cIdx], uri);
      if( tmpResult ) return tmpResult;
    }
  }
  return false;
}

/**
 * Create a proxy from a MapDef
 * @param req
 * @param res
 * @param {MapDef|Boolean} map
 */
function createProxy(req, res, map ){
  var opts = {
    target: map.dest,
    secure: false,
    changeOrigin: true
  };
  if( map.options ){
    opts = _.extend(opts, map.options )
  }
  return require('http-proxy').createProxyServer({}).web( req, res, opts );
}

// Grunt init
module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    //Development HTTP Server, HTTP Proxy, and live reload
    express: {
      dev: {
        options: {
          port: 7070,
          hostname: "0.0.0.0",
          bases: "public/",
          open: true,
          middleware: [function(req,res,next){
            var map = false;
            //If developing the core module and hitting a module endpoint, use the local dev api
            if(req && req.url) {
              map = checkProxyMaps(req, proxyMap.proxy.remoteMaps);
            }

            // If there's a map use it.
            if( map ) return createProxy(req, res, map );

            next(); // Otherwise run next middleware
          }]
        }
      }
    }

  });

  //Load tasks
  grunt.loadNpmTasks('grunt-express');

  //Register new tasks

  //Local Development server
  grunt.registerTask('dev', [
    'express:dev',
    'express-keepalive'
  ]);

  //Use to develop an app server locally as well.
  grunt.registerTask("dev-localapp", "Dev environment with additional local http-proxy maps enabled. Useful for local app server development.", function(){
    useLocalProxyMaps = true;
    grunt.task.run("dev");
  });

};
