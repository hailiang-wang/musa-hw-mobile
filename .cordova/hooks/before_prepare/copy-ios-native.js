#!/usr/bin/env node
var path = require("path");
    fs = require ('fs');
    ncp = require('ncp').ncp;

ncp.limit = 16;

var _NMR = process.env.NODE_PATH;
if (!_NMR) {
  console.log("To copy icons during prepare, need to set the NODE_PATH environment variable to point to the system's node_modules path");
  return;
}

var cordova_util = require('cordova-lib/src/cordova/util');
var projRoot = cordova_util.isCordova(process.cwd());
var projXml = cordova_util.projectConfig(projRoot);
var ConfigParser = require('cordova-lib/src/ConfigParser/ConfigParser');
var projConfig = new ConfigParser(projXml);
var projName = projConfig.name();

var icons = {
  ios: {
			"AppDelegate.h": projName + "/Classes/AppDelegate.h",
			"AppDelegate.m": projName + "/Classes/AppDelegate.m"
	}
};

// parse platform argv
var cmdline = (process.env.CORDOVA_CMDLINE);
var tag = ' prepare ', i = cmdline.indexOf(tag);
var isAll = true, selected = [];
if( i > -1) {
  var parr = cmdline.substr(i +tag.length).toLowerCase().split(/\s+/);
  parr.forEach(function(v){
    if(icons[v]) {
      // if the target platform is supported in RapidApps Mobile
      selected.push(v);
    }
  });

  if(selected.length > 0)
    isAll = false;
}

for (var platform in icons) {
    if( isAll || selected.indexOf(platform) >= 0 ) {
        var files = icons[platform];

        var srcPath = 'extras/native/' + platform +'/';
        var dstPath = 'platforms/' + platform;

        Object.keys(files).forEach(function(key) {
            var val = files[key];
            var src = path.join(srcPath, key);
            var dest = path.join(dstPath, val);
            
            fs.exists(dest, function(exists) {
                if (exists) {
                    ncp(src, dest, function (err) {
                        if (err) {
                            return console.error(err);
                        } else {
                            return console.log("Copied " + src + " to " + dest);
                        }
                    });
                }
            });
        });
    }
};
