requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: 'js/lib',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        app: '../app',
        swiper: 'idangerous.swiper.min',
        mapbox: 'mapbox/mapbox',
        jqm: 'jqm/jquery.mobile-1.4.3.min'
    },
    shim: {
        'jquery': {
            exports: '$'
        },
        'swiper':{
            deps: ['jquery']
        },
        'jqm':{
            deps: ['jquery']
        }
    }
});

requirejs(['jquery','cordova.js', 'app/config', 'app/util'],
    function   ($) {
// start of require

// cordova is now available globally
var exec = cordova.require('cordova/exec');
var config = require('app/config');

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
        var pathname = window.location.pathname;
        requirejs(['app/bootstrap'], function(bootstrap){
            if(pathname.endsWith('home.html')){
                bootstrap.home();
            }else if(pathname.endsWith('login.html')){
                bootstrap.login();
            }
        });
    }
};

if(config.debug){
    require([config.weinre], function(){
        app.initialize();
    });
} else {
    app.initialize();
}

// end of require
});
