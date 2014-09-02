define(function(require, exports, module) {
	var config = require('app/config');

    function _setupPushNotificationService(username){
        IBMBluemix.hybrid.initialize({applicationId: config.pushAppId,
                    applicationRoute: config.pushAppRoute,
                    applicationSecret: config.pushAppSecret}).then(function(){
            IBMPush.hybrid.initializeService().then(
                function(pushService){
                    console.log("Initialized push successfully");
                    _registerDevice(pushService, username);
                }, 
                function(err){
                    console.error("Error initializing the Push SDK");
            });
        }); 
    }

    function _handleBlueMixNotification(msg){
        console.log('get notifications ...');
        console.log(typeof msg);
        console.log(msg);
        alert(msg);
    }

    function _registerDevice(push, username){
        push.registerDevice(device.uuid, username, '_handleBlueMixNotification').then(
            function(response) {
                console.log('bluemix push registered device ' + response);
            }, 
            function(error) {    
                console.log('bluemix push error registering device ' + error);
            }
        );
    }

	var PushWrapper = function(){

	}

	PushWrapper.prototype.init = function(username){
		_setupPushNotificationService(username);
	}

	exports.push = new PushWrapper();
});