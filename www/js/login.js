/**
* Handle login event, page, sessionid
*/

var credential = {
    server : 'http://192.168.9.232:3013',
    path: '/mobile/auth/linkedin'
}

var app = {
    // Application Constructor
    initialize: function() {
    	this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
    	document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
    	app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
    	console.log('Received Event: ' + id);
        // fix height for login page background
        $('#login-index').css('height', ($(window).height() - $('#login-index .footer').height()) +'px');
        cordova.getAppVersion().then(function (version) {
            $('.version').text('v'+version);
            navigator.splashscreen.hide();
        });

        $('body').append("<div class='ui-loader-background'> </div>");
    
        $('#loginBtn').on('click', function(){
            $('#loginBtn').addClass('ui-state-disabled');
            $.mobile.loading( "show", {
                textVisible: false,
                theme: "a",
                textonly: false
            });
            // window.open () will open a new window, 
            // whereas window.location.href will open the new URL in your current window.
            var ref = window.open(encodeURI(credential.server + credential.path), '_blank', 'location=no,toolbar=no,clearcache=yes,clearsessioncache=yes');
            ref.addEventListener('loadstart', function(event) {
                if(event.url.indexOf("http://localhost") == 0) {
                    ref.close();
                }
            });
        });
    }
};