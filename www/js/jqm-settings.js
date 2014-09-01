/**
  * js file to initialize and customarize jQuery Mobile
  */

$(document).bind('mobileinit', function(){

	$.extend($.mobile, {
        autoInitializePage			      : 		   false,			     // initialize automatically when dom is ready
        defaultPageTransition		      :    	   'none',		     // default effect when changing page
        loadingMessageTextVisible	    :        true,			     // display message when loading a page
        loadingMessage                :        'loading ...',	 // default message when loading
        loadingMessageTheme			      : 		   'A',			       // loading dialog theme
  });
});
