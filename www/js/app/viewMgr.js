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
  var userEmail;

  var notificationsPng = {
    itnews:"sample/noty-itnews.png",
    activity:"sample/noty-activity.png",
    promotion:"sample/noty-promotion.png"
  };

  function _initIBMPushService(){
    mbaas.push.init(store.getUserId());
  }

  function _initializeMap(){
    return mapController.getMapsMetadata()
      .then(function(maps){
        return mapController.resolveMap(maps);
      }).then(function(){
        return mapController.createMap();
      }).then(function(){
        _setHomeSwiperHeaderTitleByMapId(store.getCurrentMapId());
      }).fail(function(err){
        console.error(err);
        if((typeof err == 'object') && err.rc){
          switch(err.rc){
            case 1:
              // can not resolve maps metadata with gps data
              break;
            case 2:
              // localStorage has no maps related data
              break;
            default:
              console.error('UNKNOWN ERROR.')
              break;
          }
        }
      });
  }

  function showModal(containerDiv){
    $(containerDiv).append('<div class="modalWindow"/>');
    $.mobile.loading('show');
  }

  function hideModal(){
    $(".modalWindow").remove();
    $.mobile.loading('hide');
  }

  function _renderLoginPage(){
    var $loginInputs = $('#loginEmail,#loginPassword'),
    $signupInputs = $('#signupEmail,#signupUsername,#signupPassword'),
    rules = {
        username: /^\w+$/i,
        email: /^(\w)+(\.\w+)*@(\w)+((\.\w{2,3}){1,3})$/i,
        password: /^.+$/i
    },
    inSubmit = false;

    /**
     * login input events
     */
    $loginInputs.on('focus', function (e) {
        $('#loginContent').addClass('login-focus');
    }).on('blur', function (e) {
        if(inSubmit) return false;
        $('#loginContent').removeClass('login-focus');
    });
    /**
     * signup input events
     */
    $signupInputs.on('focus', function (e) {
        $('#loginContent').addClass('signup-focus');
    }).on('blur', function (e) {
        $('#loginContent').removeClass('signup-focus');
    }).on('input', function (e) {
        var $el;

        for(var id in rules) {
            $el = $('#' + $.camelCase('signup-' + id));

            if(!rules[id].test($el.val())) {
                $('#signupBtn').button('option', 'disabled', true);
                return false;
            }

        }

        $('#signupBtn').button('option','disabled', false);

    }).on('change', function (e) {
        var $t = $(this),
            id = '';

        try {
            id = /^signup(\w+)$/i.exec($t.attr('id'))[1].toLowerCase();
        } catch (error) {
            id = '';
        }

        if(!rules[id].test($t.val())) {
            $t.closest('.ui-input-text').addClass('ui-input-error');
        } else {
            $t.closest('.ui-input-text').removeClass('ui-input-error');
        }

    });

    $('#signupBtn').button('option', 'disabled', true);
    $('#signupBtn').on('touchend', function (e) {

        var params = {
            username: $('#signupUsername').val(),
            password: $('#signupPassword').val(),
            email: $('#signupEmail').val()
        };

        inSubmit = true;
        window.navigator.splashscreen.show();

        $.ajax({
            url: 'http://{0}/auth/local/signup'.f(config.host),
            type: 'POST',
            headers: {
                'Content-Type':'application/json',
                'Accept': 'application/json'
            },
            data: JSON.stringify(params),
            dataType: 'json',
            timeout: 20000,
            complete: function (xhr, status) {
                var rst;

                inSubmit = false;

                // $.mobile.loading("hide");
                userEmail = params.email;

                if(xhr.status === 200) {
                    rst = xhr.responseJSON;

                    if(rst.rc == '1') {
                        $.mobile.changePage('#activation', {
                            transition: 'fade'
                        });
                    } else if(rst.rc == '3') {
                        $('#signup').find('.errorTip').text('邮箱已经被注册！');
                    } else if(rst.rc == '4') {
                        $('#signup').find('.errorTip').text('网络错误，请稍后重试！');
                    } else if(rst.rc == '5') {
                        $('#signup').find('.errorTip').text('非法请求！');
                    } else {
                        $('#signup').find('.errorTip').text('网络错误，请稍后重试！');
                    }
                } else if (xhr.status === 404) {
                    $('#signup').find('.errorTip').text('网络错误，请稍后重试！');
                } else {
                    $('#signup').find('.errorTip').text('服务器通信错误！');
                }
            }
        });
        return false;
    });
    /**
     * Log-In via LinkedIn Passport
     * ======================================
     */

    $('#lkdLoginBtn').on('click', function(){
        $('#lkdLoginBtn').addClass('ui-state-disabled');
        $.mobile.loading( "show", {
            textVisible: false,
            theme: "a",
            textonly: false
        });
        // window.open () will open a new window, 
        // whereas window.location.href will open the new URL in your current window.
        var ref = window.open(encodeURI("http://{0}{1}".f(config.host, config.path)), '_blank', 'location=no,toolbar=no,clearcache=yes,clearsessioncache=yes');
        ref.addEventListener('loadstart', function(event) {
            if(event.url.indexOf("http://localhost/?") == 0) {
                navigator.splashscreen.show();
                // login succ
                var succUrl = event.url;
                var sid = succUrl.replace('http://localhost/?','');
                store.setUserSID(sid);
                window.location = 'home.html';
            }else if(event.url == 'http://localhost/'){
                // login fail 
                noty({
                    text:'登入失败，请稍后重试。',
                    timeout: 2000,
                    type : 'warning',
                    layout: 'center'
                });
                ref.close();
                $.mobile.loading('hide');
                $('#lkdLoginBtn').removeClass('ui-state-disabled');
            }
        });
    });
    /**
     * Register locally
     * ======================================
     */
    $('#locRegisBtn').on('click', function(){
        $.mobile.changePage('#signup', {
            transition: 'slideup'
        });
    });

    /**
     * Sign In locally
     * ======================================
     */
    $('#locLoginBtn').on('click', function(){
        var username = $('#loginEmail').val();
        var password = $('#loginPassword').val();
        
        if(username && password){
            // wait the keyboard hidden
            navigator.splashscreen.show();
            $('#loginEmail').val('');
            $('#loginPassword').val('');
            // Get cookie at first
            // this is a trick approach, in order to get the 
            // Set-Cookie value, first attempt to access an 
            // unsupport GET path, express will inject the 
            // Set-Cookie value into the headers. The browser
            // then accepts it. In the following post request,
            // Server side can get the req.cookies.
            $.ajax({
                url: 'http://{0}/auth/local'.f(config.host),
                type: 'GET',
                complete:function (xhr, status){
                    $.ajax({
                        url: 'http://{0}/auth/local'.f(config.host),
                        type: 'POST',
                        data: JSON.stringify({email:username, password: password}),
                        dataType: 'json',
                        headers:{
                            'Content-Type' : 'application/json',
                            'Accept': 'application/json'
                        },
                        success: function(response){
                            if(response.rc == 1){
                                store.setUserSID(response.sid);
                                window.location = 'home.html';
                            }else if(response.rc == 2){
                                navigator.splashscreen.hide();
                                noty({
                                    text:'用户名不存在，请确认后再输入.',
                                    type:'warning',
                                    layout:'center',
                                    timeout: 2000
                                });
                            }else if(response.rc == 3){
                                navigator.splashscreen.hide();
                                noty({
                                    text:'密码错误，请确认后再输入.',
                                    type:'warning',
                                    layout:'center',
                                    timeout: 2000
                                });
                            }else {
                                navigator.splashscreen.hide();
                                noty({
                                    text:'服务器返回信息无法理解，确认应用是最新版本.',
                                    type:'warning',
                                    layout:'center',
                                    timeout: 2000
                                });
                            }
                        },
                        error: function(XMLHttpRequest, textStatus, errorThrown){
                            console.log('Login throw an error');
                            console.log(textStatus);
                            console.log(errorThrown);
                            navigator.splashscreen.hide();
                            noty({
                                text:'服务器通信错误！',
                                type:'warning',
                                layout:'center',
                                timeout: 2000
                            });
                        }
                    });
                }
            });
        }else{
            noty({text: '邮箱或密码不能为空.',
                  layout:'center',
                  timeout: 2000,
                  type: 'warning'});
        }
    });
    navigator.splashscreen.hide();
  }

  function _renderActivationPage(){
    $('#activeBtn').button('option', 'disabled', true);
    $('#activeBtn').on('touchend', function (e) {
        var params = {
            code: $('#code').val(),
            email: userEmail
        };

        $.mobile.loading( "show", {
            textVisible: false,
            theme: "a",
            textonly: false
        });

        $.ajax({
            url: 'http://{0}/auth/local/verify'.f(config.host),
            type: 'POST',
            headers: {
                'Content-Type':'application/json',
                'Accept': 'application/json'
            },
            data: JSON.stringify(params),
            dataType: 'json',
            timeout: 20000,
            complete: function (xhr, status) {
                var rst;
                $.mobile.loading( "hide");

                if(xhr.status === 200) {
                    rst = xhr.responseJSON;

                    if(rst.rc == '1') {
                        store.setUserSID(rst.sid);
                        navigator.splashscreen.show();
                        window.location = 'home.html';
                    } else if(rst.rc == '2') {
                        $('#activation').find('.errorTip').text('验证码错误！');
                    } else if(rst.rc == '3') {
                        $('#activation').find('.errorTip').text('尝试次数过多，注册失败！！');
                        var timeout = setTimeout(function () {
                            window.location = 'login.html';
                        }, 2000);
                    } else if(rst.rc == '4') {
                        $('#activation').find('.errorTip').text('非法请求！');
                    } else if(rst.rc == '5') {
                        $('#activation').find('.errorTip').text('服务器通信错误！');
                    } else {
                        $('#activation').find('.errorTip').text('网络错误，请稍后重试！');
                    }
                } else if (xhr.status === 404) {
                    $('#activation').find('.errorTip').text('网络错误，请稍后重试！');
                } else {
                    $('#activation').find('.errorTip').text('服务器通信错误！');
                }
            }
        });

        return false;

    });

    $('#code').on('input', function (e) {
        var $t = $(this);

        if(!/^\w+$/.test($t.val())) {
            $('#activeBtn').button('disable');
            return false;
        }

        $('#activeBtn').button('option', 'disabled', false);

    });

    window.navigator.splashscreen.hide();
  }

  function _renderForgetPwdPage(){
    $('#forget-pwd .errorTip').text('');

    $('#forgetPwdCancelBtn').on('click', function(){
      $.mobile.changePage('#login-index', {
          transition: "none",
          reloadPage: false,
          reverse: false,
          changeHash: false
      });
    });

    $('#forgetPwdSubmitBtn').on('click', function(){
      var email = $('#forgetPwdEmail').val();
      var pwd = $('#forgetPwdpassword').val();
      if(email && pwd){
        userEmail = email;
        $('#forgetPwdEmail').val('');
        $('#forgetPwdpassword').val('');
        // put request to generate new verify code
        $.ajax({
          url: 'http://{0}/auth/local/signup'.f(config.host),
          type: 'PUT',
          dataType: 'json',
          data: JSON.stringify({
            email: email,
            password: pwd
          }),
          headers:{
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          success: function(resp){
            console.log(JSON.stringify(resp));
            if(resp && resp.rc){
              switch(resp.rc){
                case 1:
                  // the verify code is send out
                    $.mobile.changePage('#activation',{
                        transition: "none",
                        reloadPage: false,
                        reverse: false,
                        changeHash: false
                    });
                  break;
                case 3:
                  // the target user does not exist
                  $('#forget-pwd').find('.errorTip').text('用户不存在');
                  break;
                case 4:
                  // require parameters in request
                  $('#forget-pwd').find('.errorTip').text('服务器返回，缺少参数');
                  break;
                default:
                  // otherwise, just throw the err
                  $('#forget-pwd').find('.errorTip').text('服务器发生错误，请联系客服');
                  break;
              }
            }else{
              // can not understand the response
              console.error('CAN NOT UNDERSTAND THE RESPONSE.')
            }
          },
          error: function(xhr, textStatus, errorThrown){
            console.error(textStatus);
            console.error(errorThrown);
          }
        });
      }else{
        $('#forget-pwd').find('.errorTip').text('邮箱或密码不能为空');
      }
    });
  }

  function _renderAboutAppPage(){
    $('#backToSettingsBtn').unbind();
    $('#backToSettingsBtn').on('click', function(){
      $.mobile.changePage('settings.html', {
          transition: "none",
          reloadPage: false,
          reverse: false,
          changeHash: false
      });
    });
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
    // add appVersion
    cordova.getAppVersion().then(function (version) {
      $('#settings-index .appVersion').text('v'+version);
    });

    // open about page
    $('#aboutAppBtn').on('click', function(){
      $.mobile.changePage('about.html',{
          transition: "none",
          reloadPage: false,
          reverse: false,
          changeHash: false
      });
    });

    // add btns for handling subscriptions
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
            // not subscribe tag
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
            // subscribe tag
            console.debug('subscribeTag {0}'.f(candidate.tagName));
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

    // change page to reset password
    $('#settings-index .resetPwdBtn').on('click',function(){
      $.mobile.changePage('reset-pwd.html', {
          transition: "none",
          reloadPage: false,
          reverse: false,
          changeHash: false
      });
      return false;
    });
  }

  function _renderResetPwdPage(){
    $('#backToSettingsBtn').unbind();
    $('#backToSettingsBtn').on('click', function(){
      $.mobile.changePage('settings.html', {
          transition: "none",
          reloadPage: false,
          reverse: false,
          changeHash: false
      });
    });

    // request to send a verifiy code to user mail
    $('#submitNewPassword').on('click', function(){
      var newPwd = $('#reset-pwd .newPassword').val();
      if(newPwd){
        var params = {
                    username: store.getUserProfile().displayName,
                    password: newPwd,
                    email: store.getUserId()
              };
        $.ajax({
            url: 'http://{0}/auth/local/signup'.f(config.host),
            type: 'POST',
            headers: {
                'Content-Type':'application/json',
                'Accept': 'application/json'
            },
            data: JSON.stringify(params),
            dataType: 'json',
            timeout: 20000,
            success: function(response){
              if(response.rc == 1){
                $.mobile.changePage('reset-pwd-verify.html',{
                    transition: "none",
                    reloadPage: false,
                    reverse: false,
                    changeHash: false
                });
              }else{
                alert(JSON.stringify(response));
              }
            },
            error:function(XMLHttpRequest, textStatus, errorThrown){
              alert(errorThrown);
            }
        });
      }else{
        noty({
          text: '新密码不能为空.',
          timeout: 2000,
          type: 'information',
          layout: 'center'
        });
      }
    });
  }

  function _renderResetPwdVerifyPage(){
    $('#backToSettingsBtn').unbind();
    $('#backToSettingsBtn').on('click', function(){
      $.mobile.changePage('settings.html', {
          transition: "none",
          reloadPage: false,
          reverse: false,
          changeHash: false
      });
    });

    // listen on btn click event to check the verify code
    $('#submitVerifyCode').on('click', function(){
      // TODO send verify code
      var code = $('#reset-pwd-verify .code').val();
      if(code){
          $('#reset-pwd-verify .code').val('');
          var params = {
              code: code,
              email: store.getUserId()
          };
          $.ajax({
            url: 'http://{0}/auth/local/verify'.f(config.host),
            type: 'POST',
            headers: {
                'Content-Type':'application/json',
                'Accept': 'application/json'
            },
            data: JSON.stringify(params),
            dataType: 'json',
            timeout: 20000,
            complete: function(xhr, status) {
                var rst;
                if(xhr.status === 200) {
                    rst = xhr.responseJSON;
                    if(rst.rc == '6') {
                        // reset password successfully
                        // logout the current user
                        // reset user to login page
                        navigator.splashscreen.show();
                        logoutHandler();
                    } else if(rst.rc == '2') {
                        noty({
                          text: '验证码错误.',
                          timeout: 2000,
                          layout: 'center',
                          type: 'information'
                        });
                    } else if(rst.rc == '3') {
                        noty({
                          text: '尝试测试过多.',
                          timeout: 2000,
                          layout: 'center',
                          type: 'information'
                        });
                        // TODO go back to settings page
                    } else if(rst.rc == '4') {
                        noty({
                          text: '非法请求.',
                          timeout: 2000,
                          layout: 'center',
                          type: 'information'
                        });
                    } else if(rst.rc == '5') {
                        noty({
                          text: '服务器通信错误！',
                          timeout: 2000,
                          layout: 'center',
                          type: 'information'
                        });
                    } else {
                        noty({
                          text: '网络错误，请稍后重试！',
                          timeout: 2000,
                          layout: 'center',
                          type: 'information'
                        });
                    }
                } else if (xhr.status === 404) {
                     noty({
                          text: '网络错误，请稍后重试！',
                          timeout: 2000,
                          layout: 'center',
                          type: 'information'
                        });
                } else {
                     noty({
                          text: '服务器通信错误！',
                          timeout: 2000,
                          layout: 'center',
                          type: 'information'
                        });
                }
            }
        });
      }else{
        noty({
          text: '验证码不能为空.',
          timeout: 2000,
          type: 'information',
          layout: 'center'
        });
      }

      return false;
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

  function getNotificationSilde(id, title, link, date, category){
      if( link && (link !== "#")){
        return '<div class="card">'
                + '<a href="#" onclick="SnowOpenMsg(\'{0}\',\'{1}\',\'{2}\')">'.f(id, title, link)
                  + '<img src="{0}" style="vertical-align:middle;">'.f(notificationsPng[category])
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
        notiSwiper.prependSlide(getNotificationSilde(key, sld.title, "http://{0}/cms/post/{1}".f(config.host, key), sld.date, sld.category), 
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
                notiSwiper.prependSlide(getNotificationSilde(key, sld.title, "{0}/{1}".f(sld.server, key), sld.date, sld.category), 
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

  function logoutHandler(){
      $.ajax({
        type: "GET",
        url: "http://{0}/logout".f(config.host),
        success: function(data){
            console.log("LOGOUT user's session is cleaned in server.")
            store.deleteUserSID();
            cordova.plugins.musa.removeCookieByDomain(
              'http://{0}/,http://{1}/'.f(config.host, config.ssehost),
              function(){
                window.location = 'login.html';
              },
              function(err){
                window.location = 'login.html';
              }
            );
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) { 
            console.log("[error] Post http://{0}/logout throw an error.".f(config.host));
            console.log("[error] Status: " + textStatus); 
            console.log("[error] Error: " + errorThrown); 
            store.deleteUserSID();
            window.location = 'login.html';
        }
      });
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
      $('#user-index .header .title').html('{0}'.f(user.displayName));
      // user avatar
      if(user._json.pictureUrl ){
        $('#user-index .avatar img').attr('src', user._json.pictureUrl);
      } else {
        // no user pic, add a image for user choosing a photo
        $('#user-index .avatar img').attr('src', defaultAvatar);
      }
      // collegue
      if(user._json.educations._total > 0){
          // how to render it Master?Bachelor, now just show up a school
          $.each(user._json.educations.values, function(index, education){
              if( index < 1){
                  $('#user-index i .edu').append('{0} {1} <br> '.f(education.schoolName, education.degree||''));
              }
          })
      }else{
          // no school
          $('#user-index i .edu').append('{0} <br> '.f("您什么也没有写。"));
      }
      // positions
      if(user._json.positions._total > 0){
          $.each(user._json.positions.values,function(index, position){
              if(position.isCurrent){
                  $('#user-index i .company').text(position.company.name);
              }
          })
      }else{
          $('#user-index i .company').append('{0} '.f("您什么也没有写。"));
          // no positions available
      }

      // interests
      if(user._json.interests){
          $('#user-index i .interest').append('{0} <br> '.f(user._json.interests));
      }else{
          // no interest
          $('#user-index i .interest').append('{0} <br> '.f("您什么也没有写。"));
      }

      /**
       * handle logout event
       */
      $("#signOutBtn").on('click', function(){
        navigator.splashscreen.show();
        logoutHandler();
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
      /**
       * change user avatar
       */
      var cameraOptions = {
        quality : 75,
        destinationType : Camera.DestinationType.DATA_URL,
        sourceType : Camera.PictureSourceType.SAVEDPHOTOALBUM,
        allowEdit : true,
        encodingType: Camera.EncodingType.JPEG,
        targetWidth: 180,
        targetHeight: 180,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false
      };
      /** 
       * photo selection success callback
       */
      var cameraSuccess = function (imageData) {
        util.getNetwork().then(function (data) {
          $('.popSelect').slideUp(300);

          $.mobile.loading('show');
          $.ajax({
            type:'POST',
            url: 'http://{0}/user/avatar'.f(config.host),
            dataType: 'json',
            data: JSON.stringify({
              base64: 'data:image/png;base64,' + imageData
            }),
            headers:{
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            complete: function (xhr, status) {
              $.mobile.loading('hide');
              var rst;

              if(xhr.status == '200') {
                rst = xhr.responseJSON;

                if(rst.rc == '4') {
                  noty({
                    text: '上传失败，请稍后重试！',
                    layout:'center',
                    timeout: 2000,
                    type: 'warning'
                  });
                }else{
                  $('.avatar img').attr('src', "data:image/jpeg;base64," + imageData);
                  store.saveUserAvatar("data:image/jpeg;base64," + imageData);
                }

              } else {
                noty({
                  text: '上传失败，请稍后重试！',
                  layout:'center',
                  timeout: 2000,
                  type: 'warning'
                });
              }
            }
          });
        }, function (error) {
          noty({
            text: '无网络服务',
            layout:'center',
            timeout: 2000,
            type: 'warning'
          });
        });
      };

      var cameraError = function () {

        $('.popSelect').slideUp(300);
        // Comment out for Issue #242 
        // noty({
        //   text: '无法选择照片！',
        //   layout:'center',
        //   timeout: 2000,
        //   type: 'warning'
        // });
      };

      $('#camera').on('touchend', function () {
        cameraOptions.sourceType = Camera.PictureSourceType.CAMERA;
        navigator.camera.getPicture(cameraSuccess, cameraError, cameraOptions);
      });

      $('#photoLibrary').on('touchend', function () {
        cameraOptions.sourceType = Camera.PictureSourceType.SAVEDPHOTOALBUM;
        navigator.camera.getPicture(cameraSuccess, cameraError, cameraOptions);
      });

      $('#cancel').on('touchend', function () {
        $('.popSelect').slideUp(300);
        return false;
      });

      $('.avatar').on('touchend', function () {
        $('.popSelect').slideDown(300);
      });

      $('.popSelect').on('touchmove', function () {
        return false;
      });
  }

	function _respPushNotificationArrival(){
		util.getNotification().then(function(data){
      console.log(JSON.stringify(data));
      if(_.isObject(data.notifications)){
        var tags = store.getSubTags();
        var keys = _.keys(data.notifications);
        keys.forEach(function(key){
          try{
            var notification = JSON.parse(data.notifications[key]);
            // check if the notification is subscribed by this user
            if(_.indexOf(tags, notification.category) != -1){
              store.saveNotifications(notification);
            }
          }catch(e){
            console.log(e);
          }
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
                      var maps = store.getMaps();
                      var currMapId = store.getCurrentMapId();
                      console.log('get position ...' + JSON.stringify(pos));
                      if(gps.isPointInsideCircle(maps, currMapId, pos.coords)){
                        
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
                              mapId: currMapId,
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
                        noty({text: '您当前不在{0}.'.f(maps[currMapId].name),
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
    // SnowMapMarkers is defined in map.js for global accessing 
    // markers
    if(SnowMapMarkers[store.getUserId()]){
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
      // add the new online user
      var currentPeopleKeys = _.keys(SnowMapMarkers).sort();
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
          candidate = peopleSwiper.prependSlide(getPeopleSilde(userId, SnowMapMarkers[userId].displayName, SnowMapMarkers[userId].picture, SnowMapMarkers[userId].status), 
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
    var candidates = _.keys(SnowMapMarkers).sort();
    console.log('Get people : ' + JSON.stringify(candidates));
    if(candidates.length > 0){
      candidates.forEach(function(userId){
        try{
          var candidate = peopleSwiper.prependSlide(getPeopleSilde(userId, SnowMapMarkers[userId].displayName, 
            SnowMapMarkers[userId].picture, SnowMapMarkers[userId].status), 
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

  function _setHomeSwiperHeaderTitleByMapId(mapId,callback){
    var maps = store.getMaps();
    $('#home-index .map.swiper-slide p').text(util.trimByPixel('地图@{0}'.f(maps[mapId].name), 150));
    $('#home-index .people.swiper-slide p').text(util.trimByPixel('圈子@{0}'.f(maps[mapId].name), 150));
    if(callback){
      callback();
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


      $("#home-index .swiper-slide.map").on('click', function(){
        // TODO add an panel window to select map locations
        // $("#selectMapPanel").panel().enhanceWithin();
        $("#selectMapPanel").panel("open", { 
          position: "left" 
        });
        return false;
      });

      $("#home-index .swiper-slide.people").on('click', function(){
        // people header is clicked !
        // TODO show a panel in the people page
        // this is panel can be used for searching people, filter people
        return false;
      });

      $( "#selectMapPanel" ).panel({
        beforeopen: function( event, ui ) {
          var currMapId = store.getCurrentMapId();
          $('#selectMapPanel ul').empty();
          $('#selectMapPanel ul').append('<li data-role="list-divider">服务号</li>')
          _.each(store.getMaps(), function(value, key, list){
            $('#selectMapPanel ul').append(function(){
              if(key != currMapId){
                return '<li data-icon="arrow-circle-right"><a onclick="javascript:SnowResetMapAndPeopleByMapID(\'{0}\');return false;" href="#">{1}</a></li>'.f(key, value.name);
              }else{
                // do need to change map, cause the current map is it.
                return '<li data-icon="arrow-circle-right"><a class="ui-state-disabled" href="#">{0}</a></li>'.f(value.name);
              }
            });
          });
          $( "#selectMapPanel ul" ).listview( "refresh" );
        }
      });
  }

  // Global API for Panel
  function _resetMapAndPeopleByMapID(mapId){
    $( "#selectMapPanel" ).panel("close");
    store.setCurrentMapId(mapId);
    // hide eye btn
    $('#headerBtn2').hide();
    _setHomeSwiperHeaderTitleByMapId(mapId,function(){
      mapController.createMap();
    });
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
          data: JSON.stringify({ mapId: store.getCurrentMapId(),
            username : email}),
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


  exports.renderLoginPage = _renderLoginPage;
  exports.renderActivationPage = _renderActivationPage;
  exports.renderForgetPwdPage = _renderForgetPwdPage;
  exports.getUserProfile = _getUserProfile;
  exports.respPushNotificationArrival = _respPushNotificationArrival;
  exports.initializeMap = _initializeMap;
  exports.initIBMPushService = _initIBMPushService;
  exports.createHomeSwiperHeader = _createHomeSwiperHeader;
  exports.initNotificationSlides = _initNotificationSlides;
  exports.initNotificationPage = _initNotificationPage;
  exports.renderUserProfilePage = _renderUserProfilePage;
  exports.renderProfileEditor = _renderProfileEditor;
  exports.bindQRbtn = bindQRbtn;
  exports.renderSettingsPage = _renderSettingsPage;
  exports.renderResetPwdPage = _renderResetPwdPage;
  exports.renderResetPwdVerifyPage = _renderResetPwdVerifyPage;
  exports.renderAboutAppPage = _renderAboutAppPage;


	/**
	* export to window is not the perfect way, the pattern is use $(doc).ready, but it needs more code.
	* So, use window to reduce coding
	* http://stackoverflow.com/questions/10302724/calling-methods-in-requirejs-modules-from-html-elements-such-as-onclick-handlers
	*/
	window.SnowOpenMsg = _openMsg;
	window.SnowBackToNotificationsList = _backToNotificationsList;
  window.SnowOpenMyLKDProfile = _openMyLKDProfile;
  window.SnowOpenLKDProfileByLink = _openLKDProfileByLink;
  window.SnowResetMapAndPeopleByMapID = _resetMapAndPeopleByMapID;

})
