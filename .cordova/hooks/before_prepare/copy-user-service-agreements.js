#!/usr/bin/env node
var path = require("path");
    fs = require ('fs');
    ncp = require('ncp').ncp;

ncp.limit = 16;

var _NMR = process.env.NODE_PATH;
if (!_NMR) {
  console.log("copy user service agreements during preparing build.");
  return;
}
var cordova_util = require(path.join(_NMR, 'cordova/src/util'));
var projRoot = cordova_util.isCordova(process.cwd());

var src = projRoot+'/extras/user-service-agreements.md';
var dest = projRoot+'/www/user-service-agreements.md';

fs.exists(src, function(exists) {
    if (exists) {
        ncp(src, dest, function (err) {
            if (err) {
                return console.error(err);
            } else {
                return console.log("Copied " + src + " to " + dest);
            }
        });
    }else{
        throw Error('user service agreements does not exist.')
    }
});

