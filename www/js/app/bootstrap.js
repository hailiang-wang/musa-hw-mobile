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
                        viewMgr.createMap();
                        sseclient.start();
                        // Fix Home Btn unactive issue
                        $("#homeBtn").addClass('ui-btn-active');
                        // set default style for some btns
                        $('#headerBtn1').buttonMarkup({icon:'qrcode'}, false);
                        viewMgr.bindQRbtn();
                        $("#headerBtn2").hide();
                        // TODO btn not bind for QR Code
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

            var $loginInputs = $('#loginEmail,#loginPassword'),
                $signupInputs = $('#signupEmail,#signupUsername,#signupPassword'),
                rules = {
                    username: /^\w+$/i,
                    email: /^(\w)+(\.\w+)*@(\w)+((\.\w{2,3}){1,3})$/i,
                    password: /^.+$/i
                },
                inSubmit = false,
                userEmail;

            /**
             * login input events
             */
            $loginInputs.on('focus', function (e) {
                $('#loginContent').addClass('login-focus');
            }).on('blur', function (e) {
                if(inSubmit) return false;
                $('#loginContent').removeClass('login-focus');
            });
            /**
             * signup input events
             */
            $signupInputs.on('focus', function (e) {
                $('#loginContent').addClass('signup-focus');
            }).on('blur', function (e) {
                $('#loginContent').removeClass('signup-focus');
            }).on('input', function (e) {
                var $el;

                for(var id in rules) {
                    $el = $('#' + $.camelCase('signup-' + id));

                    if(!rules[id].test($el.val())) {
                        $('#signupBtn').button('option', 'disabled', true);
                        return false;
                    }

                }

                $('#signupBtn').button('option','disabled', false);

            }).on('change', function (e) {
                var $t = $(this),
                    id = '';

                try {
                    id = /^signup(\w+)$/i.exec($t.attr('id'))[1].toLowerCase();
                } catch (error) {
                    id = '';
                }

                if(!rules[id].test($t.val())) {
                    $t.closest('.ui-input-text').addClass('ui-input-error');
                } else {
                    $t.closest('.ui-input-text').removeClass('ui-input-error');
                }

            });

            $('#signupBtn').button('option', 'disabled', true);
            // $('#activeBtn').button('option', 'disabled', true);
            $('#signupBtn').on('touchend', function (e) {

                var params = {
                    username: $('#signupUsername').val(),
                    password: $('#signupPassword').val(),
                    email: $('#signupEmail').val()
                };

                inSubmit = true;
                window.navigator.splashscreen.show();

                $.ajax({
                    url: 'http://{0}/auth/local/signup'.f(config.host),
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

                        inSubmit = false;

                        // $.mobile.loading("hide");
                        userEmail = params.email;

                        if(xhr.status === 200) {
                            rst = xhr.responseJSON;

                            if(rst.rc == '1') {
                                $.mobile.changePage('#vericode', {
                                    transition: 'fade'
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
                
                return false;
                
            });
            /**
             * Log-In via LinkedIn Passport
             * ======================================
             */

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
            /**
             * Register locally
             * ======================================
             */
            $('#locRegisBtn').on('click', function(){
                $.mobile.changePage('#signup', {
                    transition: 'slideup'
                });
            });

            /**
             * Sign In locally
             * ======================================
             */
            $('#locLoginBtn').on('click', function(){
                var username = $('#loginEmail').val();
                var password = $('#loginPassword').val();
                
                if(username && password){
                    // wait the keyboard hidden
                    navigator.splashscreen.show();
                    $('#loginEmail').val('');
                    $('#loginPassword').val('');
                    // Get cookie at first
                    // this is a trick approach, in order to get the 
                    // Set-Cookie value, first attempt to access an 
                    // unsupport GET path, express will inject the 
                    // Set-Cookie value into the headers. The browser
                    // then accepts it. In the following post request,
                    // Server side can get the req.cookies.
                    $.ajax({
                        url: 'http://{0}/auth/local'.f(config.host),
                        type: 'GET',
                        complete:function (xhr, status){
                            $.ajax({
                                url: 'http://{0}/auth/local'.f(config.host),
                                type: 'POST',
                                data: JSON.stringify({email:username, password: password}),
                                dataType: 'json',
                                headers:{
                                    'Content-Type' : 'application/json',
                                    'Accept': 'application/json'
                                },
                                success: function(response){
                                    if(response.rc == 1){
                                        store.setUserSID(response.sid);
                                        window.location = 'home.html';
                                    }else if(response.rc == 2){
                                        navigator.splashscreen.hide();
                                        noty({
                                            text:'用户名不存在，请确认后再输入.',
                                            type:'warning',
                                            layout:'center',
                                            timeout: 2000
                                        });
                                    }else if(response.rc == 3){
                                        navigator.splashscreen.hide();
                                        noty({
                                            text:'密码错误，请确认后再输入.',
                                            type:'warning',
                                            layout:'center',
                                            timeout: 2000
                                        });
                                    }else {
                                        navigator.splashscreen.hide();
                                        noty({
                                            text:'服务器返回信息无法理解，确认应用是最新版本.',
                                            type:'warning',
                                            layout:'center',
                                            timeout: 2000
                                        });
                                    }
                                },
                                error: function(XMLHttpRequest, textStatus, errorThrown){
                                    console.log('Login throw an error');
                                    console.log(textStatus);
                                    console.log(errorThrown);
                                    navigator.splashscreen.hide();
                                    noty({
                                        text:'服务器通信错误！',
                                        type:'warning',
                                        layout:'center',
                                        timeout: 2000
                                    });
                                }
                            });
                        }
                    });
                }else{
                    noty({text: '邮箱或密码不能为空.',
                          layout:'center',
                          timeout: 2000,
                          type: 'warning'});
                }
            });
            /**
             * verify code page
             */
            $("#vericode").on("pagecreate", function(event, ui) {

                $('#activeBtn').button('option', 'disabled', true);

                $('#activeBtn').on('touchend', function (e) {
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
                        url: 'http://{0}/auth/local/verify'.f(config.host),
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
                                    var timeout = setTimeout(function () {
                                        window.location = 'login.html';
                                    }, 2000);
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

                    return false;

                });

                $('#code').on('input', function (e) {
                    var $t = $(this);

                    if(!/^\w+$/.test($t.val())) {
                        $('#activeBtn').button('disable');
                        return false;
                    }

                    $('#activeBtn').button('option', 'disabled', false);

                });

                window.navigator.splashscreen.hide();

            });
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