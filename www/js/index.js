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

function addNotificationSlides(slides){
    var sildesHtml = '';
    $.each(slides, function(index, slide){
        sildesHtml +=  '   <li class="swiper-slide {0}-slide">'.f(slide.style)
                    + '        <a class="title" href="#" onclick="window.location=(\'{1}\'); return false;"> {0} </a>'.f(slide.name, slide.link)
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

function setUp(){
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
                break;
                default:
                console.log('you can never find me.')
                break;
            }
        }
    });
    // create home page at initializing 
    createHomeSwiperHeader();
    createMap();
    navigator.splashscreen.hide();
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
        ngv();
        setUp();
    }
};
