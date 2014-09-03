/**
* Handle views navigations
*/
define(function(require, exports, module) {
	var config = require('app/config');
	var store = require('app/service/store');

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

	exports.respPushNotificationArrival = _respPushNotificationArrival;

})