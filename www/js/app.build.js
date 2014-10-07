({
    appDir: "../",
    baseUrl: "./js",
    dir: "../../www-build",
    paths:{
    	jquery: 'lib/jquery',
    	swiper: 'lib/idangerous.swiper.min',
        mapbox: 'lib/mapbox/mapbox',
        noty : 'lib/jquery.noty.packaged.min',
        jqm: 'lib/jqm/jquery.mobile-1.4.3.min',
        underscore: 'lib/underscore-min',
        backbone : 'lib/backbone-min',
        geolib : 'lib/geolib.min',
        q: 'lib/q.min',
        console: 'lib/console.min',
        showdown: 'lib/showdown'
    },
    modules: [
        {
            name: "app"
        }
    ]
})