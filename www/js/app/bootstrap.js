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

        agent.start();
        
        $(function() {
            $( "[data-role='header'], [data-role='footer']" ).toolbar();
            $( "[data-role='navbar']" ).navbar();
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

        function loginHandler(){
            // fix height for login page background
            $('#login-index').css('height', $(window).height()+'px');
            $('body').append("<div class='ui-loader-background'> </div>");
            loginNgv();
            // beforehide event does not happen at first time
            viewMgr.renderLoginPage();
        }

        function loginNgv(){
            $( document.body ).pagecontainer({
                beforehide: function( event, ui ) {
                    var page = ui.nextPage;
                    switch(page.attr('id')) {
                        case 'login-index':
                            viewMgr.renderLoginPage();
                            break;
                        case 'activation':
                            viewMgr.renderActivationPage();
                            break;
                        case 'forget-pwd':
                            viewMgr.renderForgetPwdPage();
                            break;
                        default:
                            break;
                    }
                }
            })
        }

        function homeNgv(){
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
            $("#settingsBtn").on('click',function(){
                $.mobile.changePage( "settings.html", {
                    transition: "none",
                    reloadPage: false,
                    reverse: false,
                    changeHash: false
                });
            });
        }

        function homeHandler(){
            homeNgv();
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
                            console.log('beforehide next page - user-index');
                            viewMgr.renderUserProfilePage();
                            break;
                        case 'notification':
                            console.log('beforehide this page to notification page ...');
                            break;
                        case 'settings-index':
                            console.log('beforehide this page to settings page ...');
                            viewMgr.renderSettingsPage();
                            break;
                        case 'reset-pwd':
                            console.log('beforehide this page to reset-pwd page ...');
                            viewMgr.renderResetPwdPage();
                            break;
                        case 'reset-pwd-verify':
                            console.log('beforehide this page to reset-pwd-verify page ...');
                            viewMgr.renderResetPwdVerifyPage();
                            break;
                        case 'about-app':
                            viewMgr.renderAboutAppPage();
                            break;
                        default:
                            console.log('you can never find me.');
                            break;
                    }
                },
                show: function( event, ui ){
                    try{
                        var page = ui.toPage;
                        switch(page.attr('id')){
                            case 'notifications':
                                viewMgr.initNotificationSlides();
                                break;
                            case 'notification':
                                viewMgr.initNotificationPage();
                                break;
                            case 'user-index':
                                console.log('show user-index');
                                break;
                            case 'settings-index':
                                console.log('show settings');
                                break;
                             case 'profile-editor':
                                console.log('show editor');
                                viewMgr.renderProfileEditor();
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
                cordova.plugins.musa.setCookieByDomain('http://{0}/,http://{1}/'.f(config.host, config.ssehost), userSid, function(){
                    // succ callback
                    // create home page at initializing 
                    viewMgr.getUserProfile(function(data){
                        // TODO support api /user/me for local passport 
                        store.setUserId(data.emails[0].value);
                        store.setUserProfile(data);
                        // window.localStorage.removeItem('hailiang.hl.wang@gmail.com-NOTIFICATIONS');
                        viewMgr.initIBMPushService();
                        viewMgr.respPushNotificationArrival();
                        viewMgr.createHomeSwiperHeader();
                        // Fix Home Btn unactive issue
                        // set default style for some btns
                        $("#homeBtn").addClass('ui-btn-active');
                        $('#headerBtn1').buttonMarkup({icon:'qrcode'}, false);
                        // hide people page
                        $("#people").hide();
                        $("#headerBtn2").hide();
                        viewMgr.bindQRbtn();
                        // need to retrieve the map data with ajax
                        // so, deal with it in a callback
                        viewMgr.createMap().then(function(){
                            sseclient.start();
                            setTimeout(function(){
                                navigator.splashscreen.hide();
                            },2000);
                        }, function(err){
                            sseclient.start();
                            setTimeout(function(){
                                navigator.splashscreen.hide();
                                noty({
                                    text: '无法获得地图服务',
                                    timeout: 2000,
                                    type: 'information',
                                    layout:'center'
                                });
                            },2000);
                        });
                    });
                }, function(err){
                    // err callback
                    console.log('err happends for cordova.plugins.musa.setCookieByDomain');
                });
            }else{
                window.location = 'login.html';
            }
        }

        return {
            home: function() {
                homeHandler();
            },
            login: function() {
                loginHandler();
            }
        };
    }
);