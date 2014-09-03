/**
* Handle views navigations
*/
define(function(require, exports, module) {
	var config = require('app/config');
	var store = require('app/service/store');
	var mySwiper;


	function openMsg(title, link){
      $('#notifications-index .messages').hide();
      setNotificationsTitle(title);
      $('#notifications-index .message').append(function(){
        var msgWindow = '<iframe id="article" src="{0}" name="frame1" class="width:100%; height:100%;padding:0px; margin:0px;"></iframe>'.f(link);
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
        return '<div class="title"><a href="#" onclick="openMsg(\'{0}\',\'{1}\');return false;">'.f(title, link)
        + '{0}</a>'.f(title)
        + '</div>';
      } else{
        return '<div class="title">{0}</div>'.f(title);
      }
    }

    function _initSlides(){
        var holdPosition = 0;
        var slideNumber = 0;

        mySwiper = new Swiper('#notifications-index .swiper-container',{
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
                mySwiper.setWrapperTranslate(0,100,0)

                //Dissalow futher interactions
                mySwiper.params.onlyExternal=true

                //Show loader
                $('#notifications-index .messages .release-to-refresh').hide();
                $('#notifications-index .messages .pull-to-refresh').hide();
                $('#notifications-index .messages .refreshing').show();

                //Load slides
                loadNewSlides('new slide ' + slideNumber, 'http://baidu.com');
              }else{
                $('#notifications-index .messages .release-to-refresh').hide();
                $('#notifications-index .messages .pull-to-refresh').hide();
              }
            }
          });

        function loadNewSlides(title, link) {
            /* 
            Probably you should do some Ajax Request here
            But we will just use setTimeout
            */
            // #TODO read data from server
            setTimeout(function(){
              //Prepend new slide
              mySwiper.prependSlide(getSlide(title, link), 
                'swiper-slide ui-li-static ui-body-inherit');

              //Release interactions and set wrapper
              mySwiper.setWrapperTranslate(0,0,0)
              mySwiper.params.onlyExternal=false;

              //Update active slide
              mySwiper.updateActiveSlide(0)

              //Hide loader
              $('#notifications-index .messages .refreshing').hide();
            },1000)

            slideNumber++;
        }

        var preslides = store.get('notifications');
        _.keys(preslides).forEach(function(key){
        	var sld = preslides[key];
        	mySwiper.prependSlide(getSlide(sld.alert, key), 
                'swiper-slide ui-li-static ui-body-inherit');
        });
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

	function _respPushNotificationArrival(data){
		store.save('notifications', _parseNotification(data));
	}


	exports.initSlides = _initSlides;
	exports.respPushNotificationArrival = _respPushNotificationArrival;

})