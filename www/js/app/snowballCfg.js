
/* format string value with arguments */
String.prototype.format = String.prototype.f = function() {
    var s = this,
        i = arguments.length;

    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};

/* if a string ends with a given suffix */
String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

/* if a string starts with a given prefix */
String.prototype.startsWith = function (str){
    return this.indexOf(str) == 0;
};

var snowballCfg = {
	host: "hwcafe.mybluemix.net",
    path: '/mobile/auth/linkedin',
    pushAppId : 'a87432fd-2d2e-43d4-91c9-0832af4d4aec',
    pushAppRoute: 'hwcafe.mybluemix.net',
    pushAppSecret : '049180170bdc55b6428f65f96f80518b37296000'
}