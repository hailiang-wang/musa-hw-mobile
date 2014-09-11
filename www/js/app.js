


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
        noty : 'jquery.noty.packaged.min',
        jqm: 'jqm/jquery.mobile-1.4.3.min',
        underscore: 'underscore-min',
        backbone : 'backbone-min'
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
        },
        'noty':{
            deps: ['jquery']
        },
        'underscore': {
            exports: '_'
        },
        'backbone':{
            //These script dependencies should be loaded before loading
            //backbone.js
            deps: ['underscore', 'jquery'],
            //Once loaded, use the global 'Backbone' as the
            //module value.
            exports: 'Backbone'
        }
    }
});

/**
* this code is ugly, but still not found better ways to make handleBlueMixNotification globally.
* because it has to be global to support callback from IBMPush iOS Native Code.
* use a timeout function can make backgroud-foreground works.
* but close-foreground still does not work.
* the message arrives, but when the app wake up, the cordova method does not called.
*/ 
function handleApplePushNotificationArrival(msg){
    requirejs(['jquery', 'jqm', 'app/viewMgr'], function(){
            var viewMgr = require('app/viewMgr');
            viewMgr.respPushNotificationArrival();
    });
}

requirejs(['jquery','cordova.js', 'app/config', 'app/util', 'underscore', 'backbone'],
    function   ($) {
// start of require

// cordova is now available globally
var exec = cordova.require('cordova/exec');
var config = require('app/config');


$('#qrcodeBtn' ).on('touchend click', function() {
    var self = this;
    setTimeout(function() {
            $(self).removeClass("ui-btn-active");
        },
    0);
});

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
