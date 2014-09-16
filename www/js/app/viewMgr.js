/**
* Handle views navigations
*/
define(function(require, exports, module) {
	var config = require('app/config');
	var store = require('app/service/store');
  var mapController = require('app/service/map');
  var gps = require('app/service/gps');
  var util = require('app/util');
  var homeSwiper;
	var notiSwiper;
  var inViewSlideKeys;

  function showModal(containerDiv){
    $(containerDiv).append('<div class="modalWindow"/>');
    $.mobile.loading('show');
  }

  function hideModal(){
    $(".modalWindow").remove();
    $.mobile.loading('hide');
  }
  
  function _getUserProfile(callback){
      //var reqHeaders = {accept:"application/json"}
      // connection available
      util.getNetwork().then(function(networkType){
          $.ajax({
              type: "GET",
              url: "http://{0}/user/me".f(config.host),
              dataType: 'json',
              // timeout in 20 seconds, bluemix sucks for visits from china due to GFW
              timeout: 20000,
              success: function(data){
                  //console.log('[debug] user profile got from remote server : ' + JSON.stringify(data));
                  callback(data);
              },
              error:function(XMLHttpRequest, textStatus, errorThrown){
                  console.log(errorThrown);
                  window.location = 'login.html';
              }
          });
      },function(err){
          // no network
          callback(store.getUserProfile());
      });
  }

  function _initNotificationPage(){

    $("#notificationsBtn").addClass('ui-btn-active');

    showModal("#notification .content");
      
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

  function getNotificationSilde(title, link, date){
      if( link && (link !== "#")){
        return '<div class="card">'
                + '<a href="#" onclick="SnowOpenMsg(\'{0}\',\'{1}\')">'.f(title, link)
                  + '<img src="sample/msg-demo.png" style="vertical-align:middle;">'
                  + '<span style="display: inline-block;vertical-align:top;top:0px;">{0}<br/><br/><div style="text-align:right;padding-left:50px">{1}</div></span>'.f(util.trimByPixel(title, 160), util.getDate(date))
                + '</a>'
              + '</div>';
      } else{
        return '<div class="card">{0}</div>'.f(title);
      }
    }

  function _initNotificationSlides(){
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
      slideKeys.sort().forEach(function(key){
        var sld = slides[key];
        notiSwiper.prependSlide(getNotificationSilde(sld.title, "{0}/{1}".f(sld.server, key), sld.date), 
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
            slideKeys.sort().forEach(function(key){
              var sld = slides[key];
              if( _.indexOf(inViewSlideKeys, key) == -1){
                notiSwiper.prependSlide(getNotificationSilde(sld.title, "{0}/{1}".f(sld.server, key), sld.date), 
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

  function _updateUserProfile(newProfile){
    var deferred = $.Deferred();
    $.ajax({
      url: 'http://{0}/user/me'.f(config.host),
      type: 'PUT',
      data: JSON.stringify({profile: newProfile}),
      dataType: 'json',
      headers:{
        'Content-Type' : 'application/json',
        'Accept' : 'application/json'
      },
      success: function(response){
        deferred.resolve(response);
      },
      error: function(XMLHttpRequest, textStatus, errorThrown){
        console.log("[error] PUT http://{0}/user/me throw an error.".f(config.host));
        console.log("[error] Status: " + textStatus); 
        console.log("[error] Error: " + errorThrown); 
        deferred.reject({textStatus: textStatus, error: errorThrown });
      }
    });        
    return deferred.promise();  
  }

  function _renderUserProfilePage(){

      // bind events
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

      var user = store.getUserProfile();
      var defaultAvatar = 'img/user-default-avatar.png';
      // if local passport, show the eidt btn
      switch(user.provider){
        case 'local':
          $('.more-linkedin-profile').hide();
          // insert values into profileEditor
          if(user._json.educations._total > 0)
            $('#eduText').val(user._json.educations.values[0].schoolName);

          if(user._json.skills._total > 0)
            $('#skillText').val(user._json.skills.values[0].skill.name);

          if(user._json.positions._total > 0)
            $('#posText').val(user._json.positions.values[0].company.name);

          if(user._json.interests)
            $('#interestText').val(user._json.interests);

          break;
        case 'linkedin':
          $('#eidtProfileBtn').hide();
          defaultAvatar = 'img/linkedin-default-avatar.png'
          break;
        default:
          console.log('You can find me.')
        break;
      }

      // displayName
      $('#user-index .content .blurContainer').empty();
      $('#user-index .content .blurContainer').append('<h1>hey, {0} </h1>'.f(user.displayName));
      // user avatar
      if(user._json.pictureUrl ){
        $('#user-index .content .blurContainer h1').css('background-image','url("{0}")'.f(user._json.pictureUrl));
      } else {
        // no user pic, add a image for user choosing a photo
        $('#user-index .content .blurContainer h1').css('background-image','url("{0}")'.f(defaultAvatar));
      }
      // collegue
      if(user._json.educations._total > 0){
          // how to render it Master?Bachelor, now just show up a school
          $.each(user._json.educations.values, function(index, education){
              if( index < 1){
                  $('#user-index .blurry p.edu').append('{0} {1} <br> '.f(education.schoolName, education.degree||''));
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

      // modify local user profile
      $('#saveProfileBtn').on('click', function(){
          var profile = store.getUserProfile();
          var interests = $('#interestText').val();
          var skills = $('#skillText').val();
          var education = $('#eduText').val();
          var positions = $('#posText').val();
          // set profile 
          if(interests){
            profile._json.interests = interests;
          }
          if(skills){
            profile._json.skills._total = 1;
            profile._json.skills.values[0] = { skill:{
              name: skills
            }};
          }
          if(education){
            profile._json.educations._total = 1;
            profile._json.educations.values[0] = { schoolName : education};
          }
          if(positions){
            profile._json.positions._total = 1;
            profile._json.positions.values[0] = { isCurrent : true,
               company: {
                name : positions 
              }
            }
          }

          console.log('update profile by ' + JSON.stringify(profile));

          _updateUserProfile(profile).then(function(response){
            // refresh user profile page
            _getUserProfile(function(data){
              store.setUserProfile(data);
              /*
               * add the card value and set input box values
               */
            });

          }, function(err){
            noty({
              type: 'warning',
              text: '发生错误，请更新应用或者重新登录。',
              layout: 'center',
              timeout: 2000
            });
          });
      });
  }

	function _respPushNotificationArrival(){
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

  function renderPeoplePage(){
    $('#people .list').empty();
    var people = mapController.people;
    _.keys(people).sort().forEach(function(userId){
      console.log('PeoplePage add ' + userId);
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
                    //renderPeoplePage();
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
                if(data.lng && data.lat){
                  gps.getCurrentPosition().then(function(pos){
                      console.log('get position ...' + JSON.stringify(pos));
                      if(gps.isPointInsideCircle(config.myPremise, pos.coords)){
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
                      }else{
                        noty({text: '您当前不在{0}.'.f(config.myPremise),
                          layout: 'center',
                          type: 'warning',
                          timeout: 2000});
                      }
                  }, function(err){
                    noty({text: '无法获得GPS位置服务信息.',
                          layout: 'center',
                          type: 'warning',
                          timeout: 2000})
                  });
                }else{
                  console.log('do not have position data !');
                }
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

  })();

  exports.getUserProfile = _getUserProfile;
  exports.respPushNotificationArrival = _respPushNotificationArrival;
  exports.createMap = mapController.createMap;
  exports.createHomeSwiperHeader = _createHomeSwiperHeader;
  exports.initNotificationSlides = _initNotificationSlides;
  exports.initNotificationPage = _initNotificationPage;
  exports.renderUserProfilePage = _renderUserProfilePage;

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