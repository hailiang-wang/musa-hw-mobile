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
        sildesHtml +=  '   <div class="swiper-slide {0}-slide">'.f(slide.style)
                    + '       <div class="title"> {0} </div>'.f(slide.name)
                    + '   </div>';
    });

    $('#notifications').append(function(){
        return '<div class="swiper-container">'
        + '<div class="swiper-wrapper">'
        + sildesHtml
        + '</div>'
        + '</div>';
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

    for(var i=0; i<100; i++){
        var title = titles[Math.floor(Math.random()*titles.length)]
        var color = colors[i%5];
        addNotificationSlides([{name: title, style: color}]);
    }
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
                $("#notifications").show();
                createNotifications();
                break;
                case 1:
                $("#notifications").hide();
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
    ngv();
    switch($.mobile.activePage.attr("id")){
        case "home-index":
        createMap();
        createHomeSwiperHeader();
        break;
        case "user-index":
        break;
        default:
        break;
    }
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
        setUp();
    }
};
