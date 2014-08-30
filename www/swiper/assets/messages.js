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
function getSlide(title, link){
  return slide =  '<div class="title"><a href="#" onclick="openMsg(\'{0}\',\'{1}\');return false;">'.f(title, link)
  + '{0}</a>'.f(title)
  + '</div>';
}

var holdPosition = 0;
var slideNumber = 0;

var mySwiper = new Swiper('.swiper-container',{
  slidesPerView:'auto',
  mode:'vertical',
  watchActiveIndex: true,
  slidesPerView: 'auto',
  freeMode: false,
  grabCursor: true,
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

function loadNewSlides(title, link) {
    /* 
    Probably you should do some Ajax Request here
    But we will just use setTimeout
    */
    // #TODO read data from server
    setTimeout(function(){
      //Prepend new slide
      var colors = ['red','blue','green','orange','pink'];
      var color = colors[Math.floor(Math.random()*colors.length)];
      mySwiper.prependSlide('<div class="title">{0}</div>'.f(title||'new slide', link||'#'), 
        'swiper-slide {0}-slide'.f(color));

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

// set up messages slides swiper 
var messages = {
  initialize : function(){
    //createMessageSlides();
    loadNewSlides('new slide', 'http://baidu.com');
  }
}