/**
* handle messages.html events
*/

function openMsg(title, link){
  parent.setNotificationsTitle(title);
  $('#messages').hide();
  $('#message').append(function(){
    var msgWindow = '<iframe id="article" src="{0}" name="frame1" class="width:100%; height:100%;padding:0px; margin:0px;"></iframe>'.f(link);
    return msgWindow;
  });
  $('#message').show();
}

function openMsgs(){
  $('#message').hide();
  $('#messages').show();
}
function getSlide(el){
  return slide = '<div class="swiper-slide {0}-slide">'.f(el.style)
      + '<div class="title"><a href="#" onclick="openMsg(\'{0}\',\'{1}\');return false;">'.f(el.title, el.link)
      + '{0}</a>'.f(el.title)
      + '</div>'
      + '</div>';

}

function createMessageSwiper(){
  var holdPosition = 0;
  var mySwiper = new Swiper('.swiper-container',{
    slidesPerView:'auto',
    mode:'vertical',
    watchActiveIndex: true,
    onTouchStart: function() {
      holdPosition = 0;
    },
    onResistanceBefore: function(s, pos){
      holdPosition = pos;
    },
    onTouchEnd: function(){
      if (holdPosition>100) {
        // Hold Swiper in required position
        mySwiper.setWrapperTranslate(0,100,0)

        //Dissalow futher interactions
        mySwiper.params.onlyExternal=true

        //Show loader
        $('.preloader').addClass('visible');

        //Load slides
        loadNewSlides();
      }
    }
  });
  var slideNumber = 0;
  function loadNewSlides() {
      /* 
      Probably you should do some Ajax Request here
      But we will just use setTimeout
      */
      // #TODO read data from server
      setTimeout(function(){
        //Prepend new slide
        var colors = ['red','blue','green','orange','pink'];
        var color = colors[Math.floor(Math.random()*colors.length)];
        mySwiper.prependSlide('<div class="title">New slide '+slideNumber+'</div>', 'swiper-slide '+color+'-slide')

        //Release interactions and set wrapper
        mySwiper.setWrapperTranslate(0,0,0)
        mySwiper.params.onlyExternal=false;

        //Update active slide
        mySwiper.updateActiveSlide(0)

        //Hide loader
        $('.preloader').removeClass('visible')
      },1000)

      slideNumber++;
  }
}

// create slides at init phase
// #TODO read data from storage
function createMessageSlides(){
  $('.swiper-wrapper').append(getSlide({title: 'slide 1', style: 'red', link: 'http://baidu.com'}));
  $('.swiper-wrapper').append(getSlide({title: 'slide 2', style: 'blue', link: 'http://baidu.com'}));
  $('.swiper-wrapper').append(getSlide({title: 'slide 2', style: 'blue', link: 'http://baidu.com'}));
  $('.swiper-wrapper').append(getSlide({title: 'slide 2', style: 'blue', link: 'http://baidu.com'}));
  $('.swiper-wrapper').append(getSlide({title: 'slide 2', style: 'blue', link: 'http://baidu.com'}));
  $('.swiper-wrapper').append(getSlide({title: 'slide 2', style: 'blue', link: 'http://baidu.com'}));
  $('.swiper-wrapper').append(getSlide({title: 'slide 2', style: 'blue', link: 'http://baidu.com'}));
  $('.swiper-wrapper').append(getSlide({title: 'slide 2', style: 'blue', link: 'http://baidu.com'}));
  $('.swiper-wrapper').append(getSlide({title: 'slide 2', style: 'blue', link: 'http://baidu.com'}));
  $('.swiper-wrapper').append(getSlide({title: 'slide 2', style: 'blue', link: 'http://baidu.com'}));
}

// set up messages slides swiper 
var messages = {
  initialize : function(){
    createMessageSlides();
    createMessageSwiper();
  }
}