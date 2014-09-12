/*
* Licensed Materials - Property of Hai Liang Wang
* All Rights Reserved.
*/
define(['jqm', 'swiper', 'mapbox', 
    'app/config', 'app/service/mbaas', 'app/viewMgr',
    'app/service/map','app/service/sseclient',
    'app/service/store','noty', 'app/service/agent',
    'app/service/gps'], function() {
        
        var config = require('app/config');
        var mbaas = require('app/service/mbaas');
        var viewMgr = require('app/viewMgr');
        var sseclient = require('app/service/sseclient');
        var store = require('app/service/store');
        var util = require('app/util');
        var agent = require('app/service/agent');
        var gps = require('app/service/gps');


        agent.start();
        
        $(function() {
            $( "[data-role='navbar']" ).navbar();
            $( "[data-role='footer']" ).toolbar();
        });
            // Update the contents of the toolbars
        $( document ).on( "pagecontainershow", function() {
            // Each of the four pages in this demo has a data-title attribute
            // which value is equal to the text of the nav button
            // For example, on first page: <div data-role="page" data-title="Info">
            var current = $( ".ui-page-active" ).jqmData( "title" );
            // Change the heading
            $( "[data-role='header'] h1" ).text( current );
            // Remove active class from nav buttons
            $( "[data-role='navbar'] a.ui-btn-active" ).removeClass( "ui-btn-active" );
            // Add active class to current nav button
            $( "[data-role='navbar'] a" ).each(function() {
                if ( $( this ).jqmData('icon') === current ) {
                    $( this ).addClass( "ui-btn-active" );
                }
            });
        });

        function getUserProfile(callback){
            //var reqHeaders = {accept:"application/json"}
            // connection available
            util.getNetwork().then(function(networkType){
                $.ajax({
                    type: "GET",
                    url: "http://{0}/user/me".f(config.host),
                    dataType: 'json',
                    // timeout in 20 seconds, bluemix sucks for visits from china due to GFW
                    timeout: 20000,
                    success: function(data){
                        //console.log('[debug] user profile got from remote server : ' + JSON.stringify(data));
                        
                        callback(data);
                    },
                    error:function(XMLHttpRequest, textStatus, errorThrown){
                        console.log('[error] failed to request remote server for user profile');
                        console.log(textStatus);
                        console.log(errorThrown);
                        window.location = 'login.html';
                    }
                });
            },function(err){
                // no network
                callback(store.getUserProfile());
            });
        }

        function ngv(){
            $("#homeBtn").on('click',function(){
                $.mobile.changePage( "home.html", {
                    transition: "none",
                    reloadPage: false,
                    reverse: false,
                    changeHash: false
                });
            });
            $("#notificationsBtn").on('click',function(){
                $.mobile.changePage( "notifications.html", {
                    transition: "none",
                    reloadPage: false,
                    reverse: false,
                    changeHash: false
                });
            }); 
            $("#userBtn").on('click',function(){
                $.mobile.changePage( "user.html", {
                    transition: "none",
                    reloadPage: false,
                    reverse: false,
                    changeHash: false
                });
            });  
        }


        function homeHandler(){
            ngv();
            // http://api.jquerymobile.com/pagecontainer/
            $( document.body ).pagecontainer({
                beforehide: function( event, ui ) {
                    var page = ui.nextPage;
                    switch(page.attr('id')) {
                        case 'home-index':
                            break;
                        case 'notifications':
                            console.log('beforehide this page to notifications page ...');
                            break;
                        case 'user-index':
                            viewMgr.renderUserProfilePage();
                            break;
                        case 'notification':
                            console.log('beforehide this page to notification page ...')
                            break;
                        default:
                            console.log('you can never find me.')
                            break;
                    }
                },
                show: function( event, ui ){
                    try{
                        var page = ui.toPage;
                        switch(page.attr('id')){
                            case 'notifications':
                                viewMgr.initSlides();
                                break;
                            case 'notification':
                                viewMgr.initNotificationPage();
                                break;
                            default:
                                break;
                        }
                    }catch(err){
                        console.log(err);
                    }
                }
            });
            var userSid = store.getUserSID();
            if(userSid){
                cordova.plugins.musa.setCookieByDomain('http://{0}/'.f(config.host), userSid, function(){
                    // succ callback
                    // create home page at initializing 
                    getUserProfile(function(data){
                        // TODO support api /user/me for local passport 
                        store.setUserId(data.emails[0].value);
                        store.setUserProfile(data);
                        mbaas.push.init(data.emails[0].value);
                        viewMgr.respPushNotificationArrival();
                        viewMgr.createHomeSwiperHeader();
                        viewMgr.createMap();
                        sseclient.start();
                        // Fix Home Btn unactive issue
                        $("#homeBtn").addClass('ui-btn-active');
                        // set default style for some btn
                        $("#closeShowUpStatusBtn").hide();
                        // hide people page
                        $("#people").hide();
                        setTimeout(function(){
                            navigator.splashscreen.hide();
                        },2000)
                    });
                }, function(err){
                    // err callback
                    console.log('err happends for cordova.plugins.musa.setCookieByDomain');
                });
            }else{
                window.location = 'login.html';
            }
        }

        function loginHandler(){
            // fix height for login page background
            $('#login-index').css('height', ($(window).height() - $('#login-index .footer').height()) +'px');
            cordova.getAppVersion().then(function (version) {
                $('.version').text('v'+version);
                navigator.splashscreen.hide();
            });

            $('body').append("<div class='ui-loader-background'> </div>");
        
            $('#loginBtn').on('click', function(){
                $('#loginBtn').addClass('ui-state-disabled');
                $.mobile.loading( "show", {
                    textVisible: false,
                    theme: "a",
                    textonly: false
                });
                // window.open () will open a new window, 
                // whereas window.location.href will open the new URL in your current window.
                var ref = window.open(encodeURI("http://{0}{1}".f(config.host, config.path)), '_blank', 'location=no,toolbar=no,clearcache=yes,clearsessioncache=yes');
                ref.addEventListener('loadstart', function(event) {
                    if(event.url.indexOf("http://localhost/?") == 0) {
                        navigator.splashscreen.show();
                        // login succ
                        var succUrl = event.url;
                        var sid = succUrl.replace('http://localhost/?','')
                        store.setUserSID(sid);
                        window.location = 'home.html';
                    }else if(event.url == 'http://localhost/'){
                        // login fail 
                        alert('登入失败，请稍后重试。');
                        ref.close();
                        $.mobile.loading('hide');
                        $('#loginBtn').removeClass('ui-state-disabled');
                    }
                });
            });
        };

        return {home:function(){
            homeHandler();
        },login: function(){
            loginHandler();
        }};
    }
);