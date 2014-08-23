/*
* Licensed Materials - Property of IBM
* (C) Copyright IBM Corp. 2014. All Rights Reserved.
* US Government Users Restricted Rights - Use, duplication or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
*/

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