/**
* Handle views navigations
*/
define(function(require, exports, module) {
	var config = require('app/config');
	var store = require('app/service/store');
  var mapController = require('app/service/map');
  var util = require('app/util');
  var homeSwiper;
	var notiSwiper;
  var inViewSlideKeys;

  function showModal(){
    $("#notification .content").append('<div class="modalWindow"/>');
    $.mobile.loading('show');
  }

  function hideModal(){
    $(".modalWindow").remove();
    $.mobile.loading('hide');
  }

  function _initNotificationPage(){

    $("#notificationsBtn").addClass('ui-btn-active');

    showModal();
      
    $('#notification .header .title').append('<a href="#" onclick="SnowBackToNotificationsList()" data-shadow="false"' 
    + 'class="musa-nostate-btn ui-btn ui-icon-back ui-btn-icon-left">'
    + '{0}</a>'.f(SnowNotificationObject.title));
    $('#notification .content').append(function(){
      var msgWindow = '<iframe id="article" src="{0}" scrolling="yes"></iframe>'.f(SnowNotificationObject.link);
      return msgWindow;
    });
    $('#article').load(function(){
      hideModal();
    });
  }

  function _backToNotificationsList(){
      $.mobile.changePage('notifications.html',{
          transition: "none",
          reloadPage: false,
          reverse: false,
          changeHash: false
      });
  }

  function _openMsg(title, link){
      window.SnowNotificationObject = {
        title : title,
        link : link
      };

      $.mobile.changePage('notification.html',{
          transition: "none",
          reloadPage: false,
          reverse: false,
          changeHash: false
      });
    }

  function getSlide(title, link, date){
      console.log(title + link);
      if( link && (link !== "#")){
        return '<div class="card">'
                + '<a href="#" onclick="SnowOpenMsg(\'{0}\',\'{1}\')">'.f(title, link)
                  + '<img src="sample/msg-demo.png" style="vertical-align:middle;">'
                  + '<span style="display: inline-block;vertical-align:top;top:0px;">{0}<br/>{1}</span>'.f(title, date)
                + '</a>'
              + '</div>';
      } else{
        return '<div class="card">{0}</div>'.f(title);
      }
    }

  function _initSlides(){
      var holdPosition = 0;
      var slideNumber = 0;
      inViewSlideKeys = [];
      notiSwiper = new Swiper('#notifications .swiper-container',{
        mode:'vertical',
        watchActiveIndex: true,
        slidesPerView: 'auto',
        freeMode: false,
        slideElement: 'li',
        grabCursor: true,
        onTouchStart: function() {
          holdPosition = 0;
        },
        onResistanceBefore: function(s, pos){
          holdPosition = pos;
          if( holdPosition > 100){
              $('#notifications .messages .pull-to-refresh').hide();
              $('#notifications .messages .release-to-refresh').show();
          }else if(holdPosition > 30){
              $('#notifications .messages .release-to-refresh').hide();
              $('#notifications .messages .pull-to-refresh').show();
          }else{
              $('#notifications .messages .release-to-refresh').hide();
              $('#notifications .messages .pull-to-refresh').hide();
          }
        },
        onTouchEnd: function(){
          if (holdPosition > 100) {
              // Hold Swiper in required position
              notiSwiper.setWrapperTranslate(0,100,0)

              //Dissalow futher interactions
              notiSwiper.params.onlyExternal=true

              //Show loader
              $('#notifications .messages .release-to-refresh').hide();
              $('#notifications .messages .pull-to-refresh').hide();
              $('#notifications .messages .refreshing').show();

              //Load slides
              loadNewSlides();
            }else{
              $('#notifications .messages .release-to-refresh').hide();
              $('#notifications .messages .pull-to-refresh').hide();
            }
          }
        });
      var slides = store.getNotifications();
      var slideKeys = _.keys(slides);  
      slideKeys.forEach(function(key){
        var sld = slides[key];
        notiSwiper.prependSlide(getSlide(sld.title, "{0}/{1}".f(sld.server, key), sld.date), 
              'swiper-slide ui-li-static ui-body-inherit');
        inViewSlideKeys.push(key);
      });
      console.log(' init inViewSlideKeys ' + JSON.stringify(inViewSlideKeys));
      function loadNewSlides() {
          /* 
          Probably you should do some Ajax Request here
          But we will just use setTimeout
          */
          // #TODO read data from server
          setTimeout(function(){
            //Prepend new slide
            var slides = store.getNotifications();
            var slideKeys = _.keys(slides);  
            slideKeys.forEach(function(key){
              var sld = slides[key];
              if( _.indexOf(inViewSlideKeys, key) == -1){
                notiSwiper.prependSlide(getSlide(sld.title, "{0}/{1}".f(sld.server, key), sld.date), 
                      'swiper-slide ui-li-static ui-body-inherit');
                inViewSlideKeys.push(key);
                console.log(' reset inViewSlideKeys ' + JSON.stringify(inViewSlideKeys));
              }
            });

            //Release interactions and set wrapper
            notiSwiper.setWrapperTranslate(0,0,0)
            notiSwiper.params.onlyExternal=false;

            //Update active slide
            notiSwiper.updateActiveSlide(0)

            //Hide loader
            $('#notifications .messages .refreshing').hide();
          },1000)

          slideNumber++;
      }
  }

	function _parseNotification(msg){
		var msgJson = {}; 
		msg.split( "\n" ).forEach(function(a){
		    var b = a.trim();
		    if(b.startsWith('URL')){
		        msgJson.url = b.slice(7,-2);
		    }else if(b.startsWith('alert')){
		    	msgJson.alert = b.slice(9,-2);
		    }else if(b.startsWith('type')){
		    	msgJson.type = b.slice(7,-1);
		    }
		});
		return msgJson;
	}

  function _openMyLKDProfile(){
    cordova.exec(null, null, "InAppBrowser", "open",
     [store.getUserProfile()._json.publicProfileUrl, 
     "_system"]);
  }

  function _openLKDProfileByLink(link){
    cordova.exec(null, null, "InAppBrowser", "open",
     [link, "_system"]);
  }

	function _respPushNotificationArrival(){
    console.log('get noti ...');
		util.getNotification().then(function(data){
      console.log(JSON.stringify(data));
      if(_.isObject(data.notifications)){
        var keys = _.keys(data.notifications);
        keys.forEach(function(key){
          var notification = JSON.parse(data.notifications[key]);
          store.saveNotifications(notification);
        });
      }
    },function(err){
      console.log(err);
    });
	}

  function _createHomeSwiperHeader(){
      homeSwiper = new Swiper('#home-swiper-header .swiper-container',{
          pagination: '#home-swiper-header .pagination',
          loop:true,
          grabCursor: false,
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

  /**
  * Bind some events from UI
  */ 
  (function(){
    // Scan QR 
    $('#qrcodeBtn').on('click', function(){
      try{
        cordova.plugins.barcodeScanner.scan(
          function (result) {
              var code = result.text;
              if(code){
                var data = JSON.parse(code);
                // TODO validate code and handle exceptions
                $.ajax({
                    type: "POST",
                    url: "http://{0}/rtls/locin".f(config.host),
                    dataType: 'json',
                    data: JSON.stringify({ lat: data.lat, lng: data.lng}),
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    },
                    success: function(data){
                        console.log(JSON.stringify(data));
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown) { 
                        console.log("[error] Post http://{0}/sse/in/loc throw an error.".f(config.host));
                        console.log("[error] Status: " + textStatus); 
                        console.log("[error] Error: " + errorThrown); 
                    }
                });
              }
          },
          function (error) {
            console.log(error);
          }
        );
      }catch(e){
        console.log(e);
      }
    });
    
    /**
     * stop sharing location
     */
    $("#closeShowUpStatusBtn").on('click', function(){
      var profile = store.getUserProfile();
      var email = profile.emails[0].value;
      $.ajax({
          type: "POST",
          url: "http://{0}/rtls/locout".f(config.host),
          dataType: 'json',
          data: JSON.stringify({ username : email}),
          headers: {
              "Accept": "application/json",
              "Content-Type": "application/json"
          },
          success: function(data){
              console.log(JSON.stringify(data));
          },
          error: function(XMLHttpRequest, textStatus, errorThrown) { 
              console.log("[error] Post http://{0}/sse/in/loc throw an error.".f(config.host));
              console.log("[error] Status: " + textStatus); 
              console.log("[error] Error: " + errorThrown); 
          }
      });
    }); 

    /**
     * handle logout event
     */
    $("#signOutBtn").on('click', function(){
      navigator.splashscreen.show();
      $.ajax({
          type: "GET",
          url: "http://{0}/logout".f(config.host),
          success: function(data){
              console.log("LOGOUT user's session is cleaned in server.")
              store.deleteUserSID();
              window.location = 'login.html';
          },
          error: function(XMLHttpRequest, textStatus, errorThrown) { 
              console.log("[error] Post http://{0}/logout throw an error.".f(config.host));
              console.log("[error] Status: " + textStatus); 
              console.log("[error] Error: " + errorThrown); 
              store.deleteUserSID();
              window.location = 'login.html';
          }
      });
    });

  })();

  exports.initSlides = _initSlides;
  exports.respPushNotificationArrival = _respPushNotificationArrival;
  exports.createMap = mapController.createMap;
  exports.createHomeSwiperHeader = _createHomeSwiperHeader;
  exports.initNotificationPage = _initNotificationPage;

	/**
	* export to window is not the perfect way, the pattern is use $(doc).ready, but it needs more code.
	* So, use window to reduce coding
	* http://stackoverflow.com/questions/10302724/calling-methods-in-requirejs-modules-from-html-elements-such-as-onclick-handlers
	*/
	window.SnowOpenMsg = _openMsg;
	window.SnowBackToNotificationsList = _backToNotificationsList;
  window.SnowOpenMyLKDProfile = _openMyLKDProfile;
  window.SnowOpenLKDProfileByLink = _openLKDProfileByLink;

})