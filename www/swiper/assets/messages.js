

function createMessageSlides(){
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
  })
  var slideNumber = 0;
  function loadNewSlides() {
    /* 
    Probably you should do some Ajax Request here
    But we will just use setTimeout
    */
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

var messages = {
  initialize : function(){
    createMessageSlides();
  }
}