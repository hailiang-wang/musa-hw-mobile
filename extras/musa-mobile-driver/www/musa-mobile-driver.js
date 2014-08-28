var exec = require('cordova/exec');

exports.setCookieByDomain = function(arg0, arg1, success, error) {
    exec(success, error, "io.musa.mobile.driver", "setCookieByDomain", [arg0, arg1]);
};
