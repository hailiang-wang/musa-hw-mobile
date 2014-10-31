#!/usr/bin/env node

/*
 * this hook updates the build number in config.xml, which is then displayed in the app UI
 */

var fs = require('fs');
var path = require('path');

var rootdir = process.argv[2];
var buildstamp = process.env.buildstamp;

function format(n) {
    if (n < 10)
        return "0" + n;
    else
        return "" + n;
}

if (rootdir) {
    var fullfilename = path.join(rootdir, "www/config.xml");

    if (fs.existsSync(fullfilename)) {
        var d = new Date();
        var m = d.getMonth() + 1;
        var build;
        if (buildstamp)
        	build = buildstamp.replace(/-/, '_');
        else
        	build = d.getFullYear() + "" + format(m) + format(d.getDate()) + format(d.getHours()) + format(d.getMinutes());

        var data = fs.readFileSync(fullfilename, 'utf8');
        var result = data.replace(/(ios-CFBundleVersion=['"])[\d_]+(['"])/g, "$1" + build + "$2");

        fs.writeFileSync(fullfilename, result, 'utf8');
        console.log("Updated build id: " + build);
    } else {
        console.log("missing: "+fullfilename);
    }
}

