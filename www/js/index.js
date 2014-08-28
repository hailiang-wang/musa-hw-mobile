/*
* Licensed Materials - Property of Hai Liang Wang
* All Rights Reserved.
*/

/****************************************************************************************/
/**                         Definitin for common string method                         **/
/****************************************************************************************/

/* format string value with arguments */
String.prototype.format = String.prototype.f = function() {
    var s = this,
        i = arguments.length;

    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};

/* if a string ends with a given suffix */
String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

/* if a string starts with a given prefix */
String.prototype.startsWith = function (str){
    return this.indexOf(str) == 0;
};

 function createMap(){
    L.mapbox.accessToken = 'pk.eyJ1IjoiaGFpbiIsImEiOiJFQUVqelIwIn0.397XBIShpknPNDl6e95mow';
    var map = L.mapbox.map('map', 'hain.ja31ci75')
    .setView([0, 50], 3);
}

function notification2notifications(){
    $('#notifications-index .header .title').show();
    $('#notifications-index .header a').remove();
    $('#notifications').show();
    $('#notification').hide();
}
function openNotification(name, link){
    $('#notifications').hide();
    $('#notification').empty();
    $('#notification').show();
    $('#notifications-index .header .title').hide();
    $('#notifications-index .header').append('<a href="#" data-shadow="false" onclick="notification2notifications();return false;" '
        + 'class="ui-btn ui-icon-back ui-btn-icon-left">'
        + '<span style="color:red">{0}</span></a>'.f(name));
    $('#notification').append('<iframe src="http://baidu.com" name="frame1" class="width:100%; height:100%;padding:0px; margin:0px;" id="frame1"></iframe>');
}

function addNotificationSlides(slides){
    var sildesHtml = '';
    $.each(slides, function(index, slide){
        sildesHtml +=  '   <li class="swiper-slide {0}-slide">'.f(slide.style)
                    + '        <a class="title" href="#" onclick="openNotification(\'{0}\', \'{1}\'); return false;"> {0} </a>'.f(slide.name, slide.link)
                    + '   </li>';
    });

    $('#notifications').append(function(){
        return '<div id="noties-filter" class="noties-filter"></div>'
        + '<div class="swiper-container">'
        + '<ul id="noties" class="swiper-wrapper" data-role="listview" data-inset="true" data-filter="true" data-filter-placeholder="搜索">'
        + sildesHtml
        + '</ul>'
        + '</div>';
    });

    $($("#noties").listview().prev()).each(function(idx){
        $("#noties-filter").append(this);
    });
}

function sampleNoty(){
    var colors = ['red','blue','green','orange','pink'];
    var titles = ['CBD Coffee for Eight',
            'Business, Career, Professional & Social',
            'Song Tang Volunteers',
            'Monthly Python Meetup',
            'The Ancient Greek',
            'Meet up and play go'];
    var slides = [];
    for(var i=0; i<100; i++){
        var title = titles[Math.floor(Math.random()*titles.length)]
        var color = colors[i%5];
        slides.push({name: i + title, style: color, link: 'http://www.baidu.com'});
    }
    addNotificationSlides(slides);
}

function createNotifications(){
    $('#notifications').empty();
    sampleNoty();
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
        url: "http://192.168.9.232:3013/user/me",
        dataType: 'json',
        // timeout in 5 seconds
        timeout: 5000,
        success: function(data){
            console.log('[debug] user profile got from remote server : ' + JSON.stringify(data));
            window.localStorage.setItem('MUSA_USER_PROFILE', JSON.stringify(data));
            callback();
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
    }
    // positions
    if(user._json.positions._total > 0){
        $.each(user._json.positions.values,function(index, position){
            if(position.isCurrent){
                $('#user-index .blurry p.company').text(position.company.name);
            }
        })
    }else{
        // no positions available
    }

}

function setUp(){
    ngv();
    // http://api.jquerymobile.com/pagecontainer/
    $( document.body ).pagecontainer({
        beforehide: function( event, ui ) {
            var page = ui.nextPage;
            switch(page.attr('id')) {
                case 'notifications-index':
                console.log('render notifications page ...');
                createNotifications();
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
        cordova.plugins.musa.setCookieByDomain('http://192.168.9.232:3013/', window.localStorage.getItem('MUSA_USER_SID'), function(){
            // succ callback
            // create home page at initializing 
            getUserProfile(function(){
                createHomeSwiperHeader();
                createMap();
                setTimeout(function(){
                    navigator.splashscreen.hide();
                },3000)
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
