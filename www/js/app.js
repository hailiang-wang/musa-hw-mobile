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
        noty: 'jquery.noty.packaged.min',
        jqm: 'jqm/jquery.mobile-1.4.3.min',
        underscore: 'underscore-min',
        backbone: 'backbone-min',
        geolib: 'geolib.min',
        q: 'q.min',
        console: 'console.min',
        showdown: 'showdown',
        i18next: 'i18next.amd.min',
        energize: 'energize.min'
    },
    shim: {
        'jquery': {
            exports: '$'
        },
        'swiper': {
            deps: ['jquery']
        },
        'jqm': {
            deps: ['jquery']
        },
        'noty': {
            deps: ['jquery']
        },
        'underscore': {
            exports: '_'
        },
        'backbone': {
            //These script dependencies should be loaded before loading
            //backbone.js
            deps: ['underscore', 'jquery'],
            //Once loaded, use the global 'Backbone' as the
            //module value.
            exports: 'Backbone'
        },
        'q': {
            exports: 'Q'
        },
        'console': {},
        'showdown': {},
        'energize':{
            deps: ['jquery']
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
function handleApplePushNotificationArrival(msg) {
    requirejs(['jquery', 'jqm', 'app/viewMgr'], function() {
        var viewMgr = require('app/viewMgr');
        viewMgr.respPushNotificationArrival();
    });
}

requirejs(['jquery', 'cordova.js', 'app/config',
        'app/util', 'underscore', 'backbone', 
        'q', 'showdown', 'i18next', 'energize'
    ],
    function($) {
        // start of require

        // cordova is now available globally
        var exec = cordova.require('cordova/exec');
        var config = require('app/config');
        var i18n = require('i18next');
        var util = require('app/util');


        DEBUG = config.console;

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

                /**
                 * mobileinit
                 */
                // This event is triggered after jQuery Mobile has 
                // finished loading, but before it has started enhancing 
                // the start page. Thus, handlers of this event have the 
                // opportunity to modify jQuery Mobile's global configuration 
                // options and all the widgets' default option values before 
                // they influence the library's behavior.
                $(document).bind("mobileinit", function(){
                    // add these options for acceleration
                    $.mobile.defaultDialogTransition = "none";
                    $.mobile.defaultPageTransition = "none";
                });
                try {
                    // resolve locale and language 
                    navigator.globalization.getPreferredLanguage(function(properties) {
                        // This plugin obtains information and performs operations 
                        // specific to the user's locale, language, and timezone. 
                        // Note the difference between locale and language: locale 
                        // controls how numbers, dates, and times are displayed for a 
                        // region, while language determines what language text appears 
                        // as, independently of locale settings. Often developers use 
                        // locale to set both settings, but there is no reason a user 
                        // couldn't set her language to "English" but locale to "French", 
                        // so that text is displayed in English but dates, times, etc., are
                        //  displayed as they are in France. Unfortunately, most mobile 
                        // platforms currently do not make a distinction between these 
                        // settings.
                        // properties = {'value':'en-US'}
                        // TODO set locale and lang
                        var option = {
                            resGetPath: 'locales/__lng__/__ns__.json',
                            lng: properties.value,
                            preload: ['en-US', 'en']
                        };
                        // If language is set to 'en-US' following resource 
                        // files will be loaded one-by-one: en-US en dev (default fallback language)
                        i18n.init(option);
                        requirejs(['app/bootstrap'], function(bootstrap) {

                            if (pathname.endsWith('home.html')) {
                                bootstrap.home();
                            } else if (pathname.endsWith('login.html')) {
                                bootstrap.login();
                            }
                        });
                    }, function(err) {
                        console.error('can not resolve locale with cordova globalization plugin.')
                        console.error(err);
                    });
                } catch (e) {
                    console.error(e)
                }
            }
        };

        if (config.weinreDebug == 'true') {
            require([config.weinreServer], function() {
                app.initialize();
            });
        } else {
            app.initialize();
        }

        // end of require
    });