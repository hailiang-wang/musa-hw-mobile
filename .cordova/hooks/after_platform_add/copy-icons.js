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
			"identifier_ios_40x40.png": projName + "/Resources/icons/icon-40.png",
			"identifier_ios_80x80.png": projName + "/Resources/icons/icon-40@2x.png",
			"identifier_ios_50x50.png": projName + "/Resources/icons/icon-50.png",
			"identifier_ios_100x100.png": projName + "/Resources/icons/icon-50@2x.png",
			"identifier_ios_120x120.png": projName + "/Resources/icons/icon-60@2x.png",
			"identifier_ios_72x72.png": projName + "/Resources/icons/icon-72.png",
			"identifier_ios_144x144.png": projName + "/Resources/icons/icon-72@2x.png",
			"identifier_ios_76x76.png": projName + "/Resources/icons/icon-76.png",
			"identifier_ios_152x152.png": projName + "/Resources/icons/icon-76@2x.png",
			"identifier_ios_29x29.png": projName + "/Resources/icons/icon-small.png",
			"identifier_ios_58x58.png": projName + "/Resources/icons/icon-small@2x.png",
			"identifier_ios_57x57.png": projName + "/Resources/icons/icon.png",
			"identifier_ios_114x114.png": projName + "/Resources/icons/icon@2x.png",
			"splash_ios_iphone_320x480.png": projName + "/Resources/splash/Default~iphone.png",
			"splash_ios_iphone_640x960.png": projName + "/Resources/splash/Default@2x~iphone.png",
			"splash_ios_iphone_640x1136.png": projName + "/Resources/splash/Default-568h@2x~iphone.png"
	},
	android: {
      "identifier_android_72x72.png": "res/drawable/icon.png",
			"identifier_android_36x36.png": "res/drawable-ldpi/icon.png",
			"identifier_android_48x48.png": "res/drawable-mdpi/icon.png",
			"identifier_android_72x72.png": "res/drawable-hdpi/icon.png",
			"identifier_android_96x96.png": "res/drawable-xhdpi/icon.png"
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

        var srcPath = 'extras/resources/' + platform +'/icons/';
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
