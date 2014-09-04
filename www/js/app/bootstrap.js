/*
* Licensed Materials - Property of Hai Liang Wang
* All Rights Reserved.
*/
define(['jqm', 'swiper', 'mapbox', 'app/config', 'app/service/mbaas', 'app/viewMgr', 'app/service/sseclient'], function() {
        var config = require('app/config');
        var mbaas = require('app/service/mbaas');
        var viewMgr = require('app/viewMgr');
        var sseclient = require('app/service/sseclient');

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

        function createMap(){
            L.mapbox.accessToken = 'pk.eyJ1IjoiaGFpbiIsImEiOiJFQUVqelIwIn0.397XBIShpknPNDl6e95mow';
            var map = L.mapbox.map('map', 'hain.ja31ci75')
            .setView([0, 50], 3);
            // add a marker in the given location, attach some popup content to it and open the popup
            L.marker([-31, -12]).addTo(map)
                .bindPopup('A pretty CSS3 popup. <br> Easily customizable.')
                .openPopup();
            }


        function createHomeSwiperHeader(){
            var mySwiper = new Swiper('#home-swiper-header .swiper-container',{
                pagination: '#home-swiper-header .pagination',
                loop:true,
                grabCursor: true,
                paginationClickable: true,
                onSlideChangeEnd : function(swiper, direction){
                    switch(swiper.activeIndex % 2){
                        case 0:
                        $("#map").hide();
                        $("#people").show();
                        break;
                        case 1:
                        $("#people").hide();
                        $("#map").show();
                        break;
                        default :
                        console.log('fine me if you can.');
                        break;
                    }
                }
            })
            $('.arrow-left').on('click', function(e){
                e.preventDefault()
                mySwiper.swipePrev()
            })
            $('.arrow-right').on('click', function(e){
                e.preventDefault()
                mySwiper.swipeNext()
            })
        }

        function getUserProfile(callback){
            //var reqHeaders = {accept:"application/json"}
            // connection available
            if( config.debug ){
                console.log('getUserProfile [DEBUG]');
                callback(JSON.parse(window.localStorage.getItem('MUSA_USER_PROFILE')));
            } else {
                $.ajax({
                    type: "GET",
                    url: "http://{0}/user/me".f(config.host),
                    dataType: 'json',
                    // timeout in 20 seconds, bluemix sucks for visits from china due to GFW
                    timeout: 20000,
                    success: function(data){
                        //console.log('[debug] user profile got from remote server : ' + JSON.stringify(data));
                        window.localStorage.setItem('MUSA_USER_PROFILE', JSON.stringify(data));
                        callback(data);
                    },
                    error:function(XMLHttpRequest, textStatus, errorThrown){
                        console.log('[error] failed to request remote server for user profile');
                        console.log(textStatus);
                        console.log(errorThrown);
                        window.location = 'login.html';
                    }
                });
            }
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

        function renderUserProfilePage(){
            var user = JSON.parse(window.localStorage.getItem('MUSA_USER_PROFILE'));
            // displayName
            $('#user-index .content .blurContainer').empty();
            $('#user-index .content .blurContainer').append('<h1>hey, {0} </h1>'.f(user.displayName));
            // user avatar
            $('#user-index .content .blurContainer h1').css('background-image','url("{0}")'.f(user._json.pictureUrl));
            // collegue
            if(user._json.educations._total > 0){
                // how to render it Master?Bachelor, now just show up a school
                $.each(user._json.educations.values, function(index, education){
                    if( index < 1){
                        $('#user-index .blurry p.edu').append('{0} {1} <br> '.f(education.schoolName, education.degree));
                    }
                })
            }else{
                // no school
                $('#user-index .blurry p.edu').append('{0} <br> '.f("您什么也没有写。"));
            }
            // positions
            if(user._json.positions._total > 0){
                $.each(user._json.positions.values,function(index, position){
                    if(position.isCurrent){
                        $('#user-index .blurry p.company').text(position.company.name);
                    }
                })
            }else{
                $('#user-index .blurry p.company').append('{0} <br> '.f("您什么也没有写。"));
                // no positions available
            }
            // skills
            if(user._json.skills._total > 0){
                // how to render it Master?Bachelor, now just show up a school
                $.each(user._json.skills.values, function(index, skill){
                    if(index < 3){
                        $('#user-index .blurry p.skill').append('{0} <br> '.f(skill.skill.name));
                    }
                })
            }else{
                // no skills
                $('#user-index .blurry p.skill').append('{0} <br> '.f("您什么也没有写。"));
            }
            // interest
            if(user._json.interests){
                $('#user-index .blurry p.interest').append('{0} <br> '.f(user._json.interests));
            }else{
                // no interest
                $('#user-index .blurry p.interest').append('{0} <br> '.f("您什么也没有写。"));
            }
        }

        function homeHandler(){
            ngv();
            // http://api.jquerymobile.com/pagecontainer/
            $( document.body ).pagecontainer({
                beforehide: function( event, ui ) {
                    var page = ui.nextPage;
                    switch(page.attr('id')) {
                        case 'home-index':
                        console.log('render home page ...');
                        break;
                        case 'notifications-index':
                        console.log('render notifications page ...');
                        break;
                        case 'user-index':
                        console.log('render user page ...');
                        renderUserProfilePage();
                        break;
                        default:
                        console.log('you can never find me.')
                        break;
                    }
                },
                show: function( event, ui ){
                    try{
                        var page = ui.toPage;
                        console.log('show:' + page.attr('id'));
                        switch(page.attr('id')){
                            case 'notifications-index':
                                viewMgr.initSlides();
                                break;
                            default:
                                break;
                        }
                    }catch(err){
                        console.log(err);
                    }
                }
            });
            // TODO delete the below line if login function is done.
            // window.localStorage.removeItem('MUSA_USER_SID')
            if(window.localStorage.getItem('MUSA_USER_SID')){
                cordova.plugins.musa.setCookieByDomain('http://{0}/'.f(config.host), window.localStorage.getItem('MUSA_USER_SID'), function(){
                    // succ callback
                    // create home page at initializing 
                    getUserProfile(function(data){
                        mbaas.push.init(data.emails[0].value);
                        createHomeSwiperHeader();
                        createMap();
                        sseclient.start();
                        // Fix Home Btn unactive issue
                        $("#homeBtn").addClass('ui-btn-active');
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
                        window.localStorage.setItem('MUSA_USER_SID',sid);
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