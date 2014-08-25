/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

 function createMap(){
    L.mapbox.accessToken = 'pk.eyJ1IjoiaGFpbiIsImEiOiJFQUVqelIwIn0.397XBIShpknPNDl6e95mow';
    var map = L.mapbox.map('map', 'hain.ja31ci75')
    .setView([0, 50], 3);
}


function createNotifications(){
    $('#notifications').empty();
    $('#notifications').append(function(){
        return '<div class="swiper-container">'
        + '<div class="swiper-wrapper">'
        + '   <div class="swiper-slide red-slide">'
        + '       <div class="title">Slide 1</div>'
        + '   </div>'
        + '</div>'
        + '</div>';
    });
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
                console.log('show notifications ...')
                $("#map").hide();
                $("#notifications").show();
                createNotifications();
                break;
                case 1:
                console.log('show map ...')
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
