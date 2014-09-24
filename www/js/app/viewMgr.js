/**
* Handle views navigations
*/
define(function(require, exports, module) {
	var config = require('app/config');
	var store = require('app/service/store');
  var mapController = require('app/service/map');
  var gps = require('app/service/gps');
  var util = require('app/util');
  var mbaas = require('app/service/mbaas');
  var homeSwiper;
	var notiSwiper;
  var peopleSwiper;
  var inViewSlideKeys;
  var inPeopleSlideKeys;

  function _initIBMPushService(){
    mbaas.push.init(store.getUserId());
  }

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
      // mark message as read
      store.setNotificationAsRead(SnowNotificationObject.id);
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

  function _renderSettingsPage(){
    var currSubTags = store.getSubTags();
    currSubTags.forEach(function(tagName){
      switch(tagName){
        case "activity":
          // http://stackoverflow.com/questions/496052/jquery-setting-the-selected-value-of-a-select-control-via-its-text-description
          $("#subActivity").val('on'); 
          $("#subActivity").slider("refresh");
          break;
        case "itnews":
          $('#subItnews').val('on');
          $("#subItnews").slider("refresh");
          break;
        case "promotion":
          $('#subPromotion').val('on');
          $("#subPromotion").slider("refresh");
          break;
        default:
          console.log('tag {0} is not supported.'.f(tagName));
          break;
      }
    });

    [
      {el:"#subActivity", tagName:"activity"},
      {el:"#subItnews", tagName:"itnews"},
      {el:"#subPromotion", tagName:"promotion"}
    ].forEach(function(candidate){
      // bind events for activity tag
      $(candidate.el).unbind();
      $(candidate.el).change(function(){
        try{
          if($(candidate.el).val() == 'off'){
            // 不接收
              console.log('unsubscribeTag {0}'.f(candidate.tagName));
              mbaas.push.unsubTag(candidate.tagName).then(function(response){
                currSubTags = store.removeSubTag(candidate.tagName);
              },function(err){
                console.log('unsubscribeTag {0} failed.'.f(candidate.tagName));
                console.log(err);
                // notify user and reset the slider
                $(candidate.el).val('on'); 
                $(candidate.el).slider("refresh");
              });
          }else{
            // 接收
            console.log('subscribeTag {0}'.f(candidate.tagName));
            mbaas.push.subTag(candidate.tagName).then(function(response){
              currSubTags.push(candidate.tagName);
              store.setSubTags(currSubTags);
            },function(err){
              console.log(err);
              $(candidate.el).val('off'); 
              $(candidate.el).slider("refresh");
            });
          }
        }catch(err){
          console.log(err);
        }
      });   
    });
  }

  function _openMsg(id, title, link){
      window.SnowNotificationObject = {
        title : title,
        link : link,
        id: id
      };

      $.mobile.changePage('notification.html',{
          transition: "none",
          reloadPage: false,
          reverse: false,
          changeHash: false
      });
    }

  function getNotificationSilde(id, title, link, date){
      if( link && (link !== "#")){
        return '<div class="card">'
                + '<a href="#" onclick="SnowOpenMsg(\'{0}\',\'{1}\',\'{2}\')">'.f(id, title, link)
                  + '<img src="sample/msg-demo.png" style="vertical-align:middle;">'
                  + '<span style="display: inline-block;vertical-align:top;top:0px;">{0}<br/><br/><div style="color:#18260E;text-align:right;padding-left:50px">{1}</div></span>'.f(util.trimByPixel(title, 160), util.getDate(date))
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
              loadNewNotificationSlides();
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
        notiSwiper.prependSlide(getNotificationSilde(key, sld.title, "http://{0}/cms/post/{1}".f(config.host, key), sld.date), 
              'swiper-slide ui-li-static ui-body-inherit {0}'.f(sld.isRead ? '':'unread'));
        inViewSlideKeys.push(key);
      });
      console.log(' init inViewSlideKeys ' + JSON.stringify(inViewSlideKeys));
      function loadNewNotificationSlides() {
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
                notiSwiper.prependSlide(getNotificationSilde(key, sld.title, "{0}/{1}".f(sld.server, key), sld.date), 
                      'swiper-slide ui-li-static ui-body-inherit {0}'.f(sld.isRead ? '':'unread'));
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

  // render user profile editor page
  function _renderProfileEditor(){
    $("#userBtn").addClass('ui-btn-active');
    var profile = store.getUserProfile();
    // insert values into profile fields
    if(profile._json.educations._total > 0)
      $('#eduText').val(profile._json.educations.values[0].schoolName);

    if(profile._json.positions._total > 0)
      $('#posText').val(profile._json.positions.values[0].company.name);

    if(profile._json.interests)
      $('#interestText').val(profile._json.interests);

    /**
     * modify local user profile
     */
    $('#saveProfileBtn').on('click', function(){
        var interests = $('#interestText').val();
        var education = $('#eduText').val();
        var positions = $('#posText').val();
        // set profile 
        if(interests){
          profile._json.interests = interests;
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
        util.getNetwork().then(function(){
          _updateUserProfile(profile).then(function(response){
            // refresh user profile page
            _getUserProfile(function(data){
              store.setUserProfile(data);
              /*
               * add the card value and set input box values
               */
              $.mobile.changePage( "user.html", {
                  transition: "none",
                  reloadPage: false,
                  reverse: true,
                  changeHash: false
              });
            });
          }, function(err){
            noty({
              type: 'warning',
              text: '发生错误，请更新应用或者重新登录。',
              layout: 'center',
              timeout: 2000
            });
        });
      }, function(err){
        noty({
              type: 'warning',
              text: '无网络服务.',
              layout: 'center',
              timeout: 2000
        });
      });

    });

    // cancel editing user profile
    $('#cancelEditProfileBtn').on('click', function(){
      $.mobile.changePage( "user.html", {
          transition: "none",
          reloadPage: false,
          reverse: true,
          changeHash: false
      });
    });
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
      var user = store.getUserProfile();
      var defaultAvatar = 'img/user-default-avatar.png';
      // if local passport, show the eidt btn
      switch(user.provider){
        case 'local':
          $('.more-linkedin-profile').hide();
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
          $('#user-index .blurry p.company').append('{0} '.f("您什么也没有写。"));
          // no positions available
      }
      // // skills
      // if(user._json.skills._total > 0){
      //     // how to render it Master?Bachelor, now just show up a school
      //     $.each(user._json.skills.values, function(index, skill){
      //         if(index < 3){
      //             $('#user-index .blurry p.skill').append('{0} '.f(skill.skill.name));
      //         }
      //     })
      // }else{
      //     // no skills
      //     $('#user-index .blurry p.skill').append('{0} <br> '.f("您什么也没有写。"));
      // }
      // interest
      if(user._json.interests){
          $('#user-index .blurry p.interest').append('{0} <br> '.f(user._json.interests));
      }else{
          // no interest
          $('#user-index .blurry p.interest').append('{0} <br> '.f("您什么也没有写。"));
      }

      /**
       * handle logout event
       */
      $("#signOutBtn").on('click', function(){
        navigator.splashscreen.show();
        store.deleteUserSID();
        window.location = 'login.html';
        // $.ajax({
        //     type: "GET",
        //     url: "http://{0}/logout".f(config.host),
        //     success: function(data){
        //         console.log("LOGOUT user's session is cleaned in server.")
        //         store.deleteUserSID();
        //         cordova.plugins.musa.removeCookieByDomain(
        //           'http://{0}/'.f(config.host),
        //           function(){
        //             window.location = 'login.html';
        //           },
        //           function(err){
        //             window.location = 'login.html';
        //           }
        //         );
        //     },
        //     error: function(XMLHttpRequest, textStatus, errorThrown) { 
        //         console.log("[error] Post http://{0}/logout throw an error.".f(config.host));
        //         console.log("[error] Status: " + textStatus); 
        //         console.log("[error] Error: " + errorThrown); 
        //         store.deleteUserSID();
        //         window.location = 'login.html';
        //     }
        // });
      });

      /**
       * open user profile editor
       */      
      $('#eidtProfileBtn').on('click', function(){
        $.mobile.changePage( "profile-editor.html", {
            transition: "none",
            reloadPage: false,
            reverse: true,
            changeHash: false
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

  function bindQRbtn(){
    $('#headerBtn1').unbind();
    // Scan QR 
    $('#headerBtn1').on('click', function(){
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
                        
                        // change a page to get user status 
                        $('#popupStatus').popup( "open", {
                          transition: "fade",
                          positionTo: "window"
                        });

                        // the first attempt will not center the pop as the window
                        // is not full set
                        // setTimeout(function(){
                        //   $('#popupStatus').popup("reposition",{
                        //     positionTo: "window"
                        //   });
                        // }, 500);

                        $('#submitStatusBtn').unbind();
                        $('#submitStatusBtn').on('click', function(){
                          $.ajax({
                            type: "POST",
                            url: "http://{0}/rtls/locin".f(config.host),
                            dataType: 'json',
                            data: JSON.stringify({ 
                              lat: data.lat, 
                              lng: data.lng,
                              status: $('#myStatus').val(),
                              duration : $('#sharingDuration').val() * 60000
                            }),
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
      return false;
    });
  }

  function renderHomeMap(){
    $("#people").hide();
    $("#map").show();
    $('#headerBtn1').buttonMarkup({icon:'qrcode'}, false);
    $('#headerBtn1').show();
    bindQRbtn();
    if(mapController.people[store.getUserId()]){
      $('#headerBtn2').show();
    }
  }

  function renderPeoplePage(){
    $('#people').css('background','');
    $('#people .list').empty();
    $('#headerBtn2').hide();
    $('#headerBtn1').hide();
    $("#map").hide();
    $("#people").show();
    $('#headerBtn1').unbind();
    $('#headerBtn1').on('click', function(){
      renderPeoplePage();
    });

    var people = mapController.people;
    inPeopleSlideKeys = [];
    peopleSwiper = new Swiper('#people .swiper-container', {
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
              $('#people .pull-to-refresh').hide();
              $('#people .release-to-refresh').show();
          }else if(holdPosition > 30){
              $('#people .release-to-refresh').hide();
              $('#people .pull-to-refresh').show();
          }else{
              $('#people .release-to-refresh').hide();
              $('#people .pull-to-refresh').hide();
          }
        },
        onTouchEnd: function(){
          if (holdPosition > 100) {
              // Hold Swiper in required position
              peopleSwiper.setWrapperTranslate(0,100,0)

              //Dissalow futher interactions
              peopleSwiper.params.onlyExternal=true

              //Show loader
              $('#people .release-to-refresh').hide();
              $('#people .pull-to-refresh').hide();
              $('#people .refreshing').show();
              loadNewPeopleSlides();
            }else{
              $('#people .release-to-refresh').hide();
              $('#people .pull-to-refresh').hide();
            }
          }
      }
    );
    function loadNewPeopleSlides(){
      var people = mapController.people;
      // add the new online user
      var currentPeopleKeys = _.keys(people).sort();

      var newComers = _.difference(currentPeopleKeys, inPeopleSlideKeys);
      var leftPeople = _.difference(inPeopleSlideKeys, currentPeopleKeys);

      // remove left people
      try{
        peopleSwiper.slides.forEach(function(sld){
          if(_.indexOf(leftPeople, sld.data('userid')) != -1){
              sld.remove();
          }
        });
      }catch(err){
        console.log(err);          
      }

      // add new comer into slide
      newComers.forEach(function(userId){
        var candidate;
        try{
          candidate = peopleSwiper.prependSlide(getPeopleSilde(userId, people[userId].displayName, people[userId].picture, people[userId].status), 
                    'swiper-slide ui-li-static ui-body-inherit');
          candidate.data('userid', userId);
          inPeopleSlideKeys.push(userId);
        }catch(err){
          candidate = null;
          console.log(err);
        }
      });

      //Release interactions and set wrapper
      peopleSwiper.setWrapperTranslate(0,0,0)
      peopleSwiper.params.onlyExternal=false;

      //Update active slide
      peopleSwiper.updateActiveSlide(0)
      $('#people .refreshing').hide();

      if(peopleSwiper.slides.length == 0){
        peopleSwiper.destroy();
        peopleSwiper = null;
        $('#people').css('background','url("img/nobody-in-circle.png") no-repeat');
      }
    }

    function getPeopleSilde(userId, displayName, userPic, userStatus){
        return '<div class="card">'
          + '<a href="#" onclick="SnowOpenPeopleCard(\'{0}\')">'.f(userId)
            + '<img src="{0}" style="">'.f(userPic)
            + '<span style="display: inline-block;vertical-align:top;top:0px;">{0}<br/><br/><div style="color:#18260E;text-align:right;padding-left:50px">{1}</div></span>'.f(util.trimByPixel(userStatus, 200), displayName)
          + '</a>'
        + '</div>';
    }

    // add the current online user
    var candidates = _.keys(people).sort();
    if(candidates.length > 0){
      candidates.forEach(function(userId){
        try{
          var candidate = peopleSwiper.prependSlide(getPeopleSilde(userId, people[userId].displayName, people[userId].picture, people[userId].status), 
                    'swiper-slide ui-li-static ui-body-inherit');
          candidate.data('userid', userId);
          inPeopleSlideKeys.push(userId);
        }catch(err){
          console.log(err);
        }
      });
    }else{
      peopleSwiper.destroy();
      peopleSwiper = null;
      $('#people').css('background','url("img/nobody-in-circle.png") no-repeat');
    }
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
                    renderPeoplePage();
                    break;
                  case 1:
                    renderHomeMap();
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
    /**
     * stop sharing location
     */
    $("#headerBtn2").on('click', function(){
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
  exports.initIBMPushService = _initIBMPushService;
  exports.createHomeSwiperHeader = _createHomeSwiperHeader;
  exports.initNotificationSlides = _initNotificationSlides;
  exports.initNotificationPage = _initNotificationPage;
  exports.renderUserProfilePage = _renderUserProfilePage;
  exports.renderProfileEditor = _renderProfileEditor;
  exports.bindQRbtn = bindQRbtn;
  exports.renderSettingsPage = _renderSettingsPage;

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