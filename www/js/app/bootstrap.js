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
                            console.log('beforehide this page to notification page ...');
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
                        },2000);
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
            $('#login-index').css('height', $(window).height()+'px');
            cordova.getAppVersion().then(function (version) {
                $('.version').text('v'+version);
                navigator.splashscreen.hide();
            });

            $('body').append("<div class='ui-loader-background'> </div>");
        
            $('#lkdLoginBtn').on('click', function(){
                $('#lkdLoginBtn').addClass('ui-state-disabled');
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
                        var sid = succUrl.replace('http://localhost/?','');
                        store.setUserSID(sid);
                        window.location = 'home.html';
                    }else if(event.url == 'http://localhost/'){
                        // login fail 
                        noty({
                            text:'登入失败，请稍后重试。',
                            timeout: 2000,
                            type : 'warning',
                            layout: 'center'
                        });
                        ref.close();
                        $.mobile.loading('hide');
                        $('#lkdLoginBtn').removeClass('ui-state-disabled');
                    }
                });
            });
        }

        function signupHandler () {

            var rules = {
                    username: /^\w+$/i,
                    email: /^(\w)+(\.\w+)*@(\w)+((\.\w{2,3}){1,3})$/i,
                    password: /^.+$/i
                },
                userEmail;

            navigator.splashscreen.hide();
            $('#signupBtn').button('option', 'disabled', true);

            $("#vericode").on("pagecreate", function(event, ui) {
                $('#activeBtn').button('option', 'disabled', true);
            });
            // $('#activeBtn').button('option', 'disabled', true);
            $('#signupBtn').on('click', function (e) {

                var params = {
                    username: $('#username').val(),
                    password: $('#password').val(),
                    email: $('#email').val()
                };

                $.mobile.loading( "show", {
                    textVisible: false,
                    theme: "a",
                    textonly: false
                });

                $.ajax({
                    url: 'http://hwcafe.mybluemix.net/auth/local/signup',
                    type: 'POST',
                    headers: {
                        'Content-Type':'application/json',
                        'Accept': 'application/json'
                    },
                    data: JSON.stringify(params),
                    dataType: 'json',
                    timeout: 20000,
                    complete: function (xhr, status) {
                        var rst;

                        $.mobile.loading( "hide");
                        userEmail = params.email;

                        if(xhr.status === 200) {
                            rst = xhr.responseJSON;

                            if(rst.rc == '1') {
                                $.mobile.changePage('#vericode', {
                                    transition: 'slideup'
                                });
                            } else if(rst.rc == '3') {
                                $('#signup').find('.errorTip').text('邮箱已经被注册！');
                            } else if(rst.rc == '4') {
                                $('#signup').find('.errorTip').text('网络错误，请稍后重试！');
                            } else if(rst.rc == '5') {
                                $('#signup').find('.errorTip').text('非法请求！');
                            } else {
                                $('#signup').find('.errorTip').text('网络错误，请稍后重试！');
                            }
                        } else if (xhr.status === 404) {
                            $('#signup').find('.errorTip').text('网络错误，请稍后重试！');
                        } else {
                            $('#signup').find('.errorTip').text('服务器通信错误！');
                        }
                    }
                });
                
            });

            $('#activeBtn').on('click', function (e) {
                var params = {
                    code: $('#code').val(),
                    email: userEmail
                };

                $.mobile.loading( "show", {
                    textVisible: false,
                    theme: "a",
                    textonly: false
                });

                $.ajax({
                    url: 'http://hwcafe.mybluemix.net/auth/local/verify',
                    type: 'POST',
                    headers: {
                        'Content-Type':'application/json',
                        'Accept': 'application/json'
                    },
                    data: JSON.stringify(params),
                    dataType: 'json',
                    timeout: 20000,
                    complete: function (xhr, status) {
                        var rst;
                        $.mobile.loading( "hide");

                        if(xhr.status === 200) {
                            rst = xhr.responseJSON;

                            if(rst.rc == '1') {
                                store.setUserSID(rst.sid);
                                navigator.splashscreen.show();
                                window.location = 'home.html';
                            } else if(rst.rc == '2') {
                                $('#vericode').find('.errorTip').text('验证码错误！');
                            } else if(rst.rc == '3') {
                                $('#vericode').find('.errorTip').text('尝试次数过多，注册失败！！');
                            } else if(rst.rc == '4') {
                                $('#vericode').find('.errorTip').text('非法请求！');
                            } else if(rst.rc == '5') {
                                $('#vericode').find('.errorTip').text('服务器通信错误！');
                            } else {
                                $('#vericode').find('.errorTip').text('网络错误，请稍后重试！');
                            }
                        } else if (xhr.status === 404) {
                            $('#vericode').find('.errorTip').text('网络错误，请稍后重试！');
                        } else {
                            $('#vericode').find('.errorTip').text('服务器通信错误！');
                        }
                    }
                });
            });

            $('#username,#email,#password').on('input', function (e) {
                var $el;

                for(var id in rules) {
                    $el = $('#' + id);

                    if(!rules[id].test($el.val())) {
                        $('#signupBtn').button('disable');
                        return false;
                    }

                }

                $('#signupBtn').button('enable');
            });

            $('#code').on('input', function (e) {
                var $t = $(this);

                if(!/^\w+$/.test($t.val())) {
                    $('#activeBtn').button('disable');
                    return false;
                }

                $('#activeBtn').button('option', 'disabled', false);

            });

            $('#username,#email,#password').on('change', function (e) {
                var $t = $(this),
                    id = $t.attr('id');

                if(!rules[id].test($t.val())) {
                    $t.closest('.ui-input-text').addClass('ui-input-error');
                } else {
                    $t.closest('.ui-input-text').removeClass('ui-input-error');
                }

            });
        }

        return {
            home: function() {
                homeHandler();
            },
            login: function() {
                loginHandler();
            },
            signup: function() {
                signupHandler();
            }
        };
    }
);