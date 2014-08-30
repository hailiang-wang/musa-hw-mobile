/*
* Licensed Materials - Property of Hai Liang Wang
* All Rights Reserved.
*/

var pushServiceClient;
var isRegistered = false;

function setupPushNotificationService(username, callback){
    IBMBluemix.hybrid.initialize({applicationId: snowballCfg.pushAppId,
                applicationRoute: snowballCfg.pushAppRoute,
                applicationSecret: snowballCfg.pushAppSecret}).then(function(){
        IBMPush.hybrid.initializeService().then(
            function(pushService){
                console.log("Initialized push successfully");
                pushServiceClient = pushService;
                callback(username);
            }, 
            function(err){
                console.error("Error initializing the Push SDK");
        });
    }); 
}

function handleBlueMixNotification(msg){
    console.log('get notifications ...');
    console.log(typeof msg);
    console.log(msg);
    alert(msg);
}

function registerDevice(username){
    pushServiceClient.registerDevice(device.uuid, username, 'handleBlueMixNotification').then(
        function(response) {
            isRegistered = true;
            console.log('bluemix push registered device ' + response);
        }, 
        function(error) {    
            console.log('bluemix push error registering device ' + error);
        }
    );
}

function createMap(){
    L.mapbox.accessToken = 'pk.eyJ1IjoiaGFpbiIsImEiOiJFQUVqelIwIn0.397XBIShpknPNDl6e95mow';
    var map = L.mapbox.map('map', 'hain.ja31ci75')
    .setView([0, 50], 3);
}

function backToNotificationsList(offset){
    $('#notifications-index .header .title').show();
    $('#notifications-index .header a').remove();
    $("#notificationsiframe")[0].contentWindow.openMsgs();
    // //$("body").scrollTop(offset);
    // $.mobile.silentScroll(offset);
    // $('#notifications').show();
    // $('#notification').hide();
    // // the below line is required . https://forum.jquery.com/topic/scrolltop-problem-screen-flashing-before-scroll
    // return false;
}

function setNotificationsTitle(name){
    var scrollTopOffset = $("body").scrollTop();
    $('#notifications-index .header .title').hide();
    $('#notifications-index .header').append('<a href="#" data-shadow="false" onclick="backToNotificationsList({0});return false;" '.f(scrollTopOffset)
        + 'class="ui-btn ui-icon-back ui-btn-icon-left">'
        + '<span style="color:red">{0}</span></a>'.f(name));
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
    $.ajax({
        type: "GET",
        url: "http://{0}/user/me".f(snowballCfg.host),
        dataType: 'json',
        // timeout in 5 seconds
        timeout: 5000,
        success: function(data){
            console.log('[debug] user profile got from remote server : ' + JSON.stringify(data));
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
            $('#user-index .blurry p.edu').append('{0} {1} <br> '.f(education.schoolName, education.degree));
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
            $('#user-index .blurry p.skill').append('{0} <br> '.f(skill.skill.name));
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

function setUp(){
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
                //slideNotifications();
                //createNotifications();
                break;
                case 'user-index':
                console.log('render user page ...');
                renderUserProfilePage();
                break;
                default:
                console.log('you can never find me.')
                break;
            }
        }
    });
    // TODO delete the below line if login function is done.
    // window.localStorage.removeItem('MUSA_USER_SID')
    if(window.localStorage.getItem('MUSA_USER_SID')){
        cordova.plugins.musa.setCookieByDomain('http://{0}/'.f(snowballCfg.host), window.localStorage.getItem('MUSA_USER_SID'), function(){
            // succ callback
            // create home page at initializing 
            getUserProfile(function(data){
                setupPushNotificationService(data.emails[0].value, registerDevice);
                createHomeSwiperHeader();
                createMap();
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
        setUp();
    }
};
