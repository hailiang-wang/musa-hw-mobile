({
    appDir: "../",
    baseUrl: "./js",
    dir: "../../www-build",
    paths: {
        jquery: 'lib/jquery',
        swiper: 'lib/idangerous.swiper.min',
        mapbox: 'lib/mapbox/mapbox',
        noty: 'lib/jquery.noty.packaged.min',
        jqm: 'lib/jqm/jquery.mobile-1.4.3.min',
        underscore: 'lib/underscore-min',
        backbone: 'lib/backbone-min',
        geolib: 'lib/geolib.min',
        q: 'lib/q.min',
        console: 'lib/console.min',
        showdown: 'lib/showdown',
        i18next: 'lib/i18next.amd.min',
        energize: 'lib/energize.min'
    },
    modules: [{
        name: "app"
    }],
    //Allow CSS optimizations. Allowed values:
    //- "standard": @import inlining and removal of comments, unnecessary
    //whitespace and line returns.
    //Removing line returns may have problems in IE, depending on the type
    //of CSS.
    //- "standard.keepLines": like "standard" but keeps line returns.
    //- "none": skip CSS optimizations.
    //- "standard.keepComments": keeps the file comments, but removes line
    //returns.  (r.js 1.0.8+)
    //- "standard.keepComments.keepLines": keeps the file comments and line
    //returns. (r.js 1.0.8+)
    //- "standard.keepWhitespace": like "standard" but keeps unnecessary whitespace.
    optimizeCss: "standard"
})