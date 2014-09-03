/**
* Handle views navigations
*/
define(function(require, exports, module) {
	var config = require('app/config');
	var store = require('app/service/store');
	var notiSwiper;
  var inViewSlideKeys;

  function setNotificationsTitle(name){
      var scrollTopOffset = $("body").scrollTop();
      $('#notifications-index .header .title').hide();
      $('#notifications-index .header').append('<a href="#" data-shadow="false" onclick="SnowBackToNotificationsList({0});return false;" '.f(scrollTopOffset)
          + 'class="ui-btn ui-icon-back ui-btn-icon-left">'
          + '<span style="color:red">{0}</span></a>'.f(name));
  }

  function _backToNotificationsList(offset){
      $('#notifications-index .header .title').show();
      $('#notifications-index .header a').remove();
      openMsgs();
      // //$("body").scrollTop(offset);
      // $.mobile.silentScroll(offset);
      // $('#notifications').show();
      // $('#notification').hide();
      // // the below line is required . https://forum.jquery.com/topic/scrolltop-problem-screen-flashing-before-scroll
      // return false;
  }

	function _openMsg(title, link){
      $('#notifications-index .messages').hide();
      setNotificationsTitle(title);
      $('#notifications-index .message').append(function(){
        var msgWindow = '<iframe id="article" src="{0}" name="frame1" class="width:100%; height:100%;padding:0px; margin:0px;" scrolling="yes"></iframe>'.f(link);
        return msgWindow;
      });
      $('#notifications-index .message').show();
    }

    function openMsgs(){
      $('#notifications-index .message').empty();
      $('#notifications-index .message').hide();
      $('#notifications-index .messages').show();
    }

    function getSlide(title, link){
      console.log(title + link);
      if( link && (link !== "#")){
        return '<div class="title"><a href="#" onclick="SnowOpenMsg(\'{0}\',\'{1}\')">'.f(title, link)
        + '{0}</a>'.f(title)
        + '</div>';
      } else{
        return '<div class="title">{0}</div>'.f(title);
      }
    }

    function _initSlides(){
        var holdPosition = 0;
        var slideNumber = 0;
        inViewSlideKeys = [];

        notiSwiper = new Swiper('#notifications-index .swiper-container',{
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
                $('#notifications-index .messages .pull-to-refresh').hide();
                $('#notifications-index .messages .release-to-refresh').show();
            }else if(holdPosition > 30){
                $('#notifications-index .messages .release-to-refresh').hide();
                $('#notifications-index .messages .pull-to-refresh').show();
            }else{
                $('#notifications-index .messages .release-to-refresh').hide();
                $('#notifications-index .messages .pull-to-refresh').hide();
            }
          },
          onTouchEnd: function(){
            if (holdPosition > 100) {
                // Hold Swiper in required position
                notiSwiper.setWrapperTranslate(0,100,0)

                //Dissalow futher interactions
                notiSwiper.params.onlyExternal=true

                //Show loader
                $('#notifications-index .messages .release-to-refresh').hide();
                $('#notifications-index .messages .pull-to-refresh').hide();
                $('#notifications-index .messages .refreshing').show();

                //Load slides
                loadNewSlides();
              }else{
                $('#notifications-index .messages .release-to-refresh').hide();
                $('#notifications-index .messages .pull-to-refresh').hide();
              }
            }
          });

        function loadNewSlides() {
            /* 
            Probably you should do some Ajax Request here
            But we will just use setTimeout
            */
            // #TODO read data from server
            setTimeout(function(){
              //Prepend new slide
              var slides = store.get('notifications');
              var slideKeys = _.keys(slides);  
              slideKeys.forEach(function(key){
                var sld = slides[key];
                if( _.indexOf(inViewSlideKeys, key) == -1){
                  notiSwiper.prependSlide(getSlide(sld.alert, key), 
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
              $('#notifications-index .messages .refreshing').hide();
            },1000)

            slideNumber++;
        }

        var slides = store.get('notifications');
        var slideKeys = _.keys(slides);  
        slideKeys.forEach(function(key){
        	var sld = slides[key];
        	notiSwiper.prependSlide(getSlide(sld.alert, key), 
                'swiper-slide ui-li-static ui-body-inherit');
          inViewSlideKeys.push(key);
        });
        console.log(' init inViewSlideKeys ' + JSON.stringify(inViewSlideKeys));

        // mySwiper.prependSlide(getSlide('foo', 'http://baidu.com'), 
        //         'swiper-slide ui-li-static ui-body-inherit');
        //     mySwiper.prependSlide(getSlide('foo', 'http://baidu.com'), 
        //         'swiper-slide ui-li-static ui-body-inherit');
        //         mySwiper.prependSlide(getSlide('foo', 'http://baidu.com'), 
        //         'swiper-slide ui-li-static ui-body-inherit');
        //             mySwiper.prependSlide(getSlide('foo', 'http://baidu.com'), 
        //         'swiper-slide ui-li-static ui-body-inherit');
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

  function _openLKDProfile(){
    cordova.exec(null, null, "InAppBrowser", "open",
     [JSON.parse(window.localStorage.getItem('MUSA_USER_PROFILE'))._json.publicProfileUrl, 
     "_system"]);
  }

	function _respPushNotificationArrival(data){
		store.save('notifications', _parseNotification(data));
	}


	exports.initSlides = _initSlides;
	exports.respPushNotificationArrival = _respPushNotificationArrival;
	/**
	* export to window is not the perfect way, the pattern is use $(doc).ready, but it needs more code.
	* So, use window to reduce coding
	* http://stackoverflow.com/questions/10302724/calling-methods-in-requirejs-modules-from-html-elements-such-as-onclick-handlers
	*/
	window.SnowOpenMsg = _openMsg;
	window.SnowBackToNotificationsList = _backToNotificationsList;
  window.SnowOpenLKDProfile = _openLKDProfile;

})