// http://mbaas-gettingstarted.ng.bluemix.net/hybrid
define(function(require, exports, module) {
	var config = require('app/config');
    var _push;
    var store = require('app/service/store');

    function _setupPushNotificationService(username){
        IBMBluemix.hybrid.initialize({applicationId: config.pushAppId,
                    applicationRoute: config.pushAppRoute,
                    applicationSecret: config.pushAppSecret}).then(function(){
            IBMPush.hybrid.initializeService().then(
                function(pushService){
                    console.debug("Initialized push successfully");
                    // set _push
                    _push = pushService;
                    _registerDevice(username);
                }, 
                function(err){
                    console.error("Error initializing the Push SDK");
            });
        }); 
    }

    function _registerDevice(username){
    	// handleApplePushNotificationArrival is defined as globally in app.js
        _push.registerDevice(device.uuid, username, '(function(msg){setTimeout(handleApplePushNotificationArrival(msg),5000);})').then(
            function(response) {
                console.debug('bluemix push registered device ' + JSON.stringify(response));
                _push.getSubscriptions().done(function(response){
                    console.debug('get subscriptions in mbaas '+ JSON.stringify(response.subscriptions));
                    store.setSubTags(response.subscriptions);
                }, function(err){
                    console.error(err)
                });
            }, 
            function(error) {    
                console.error('bluemix push error registering device ' + error);
            }
        );
    }

	var PushWrapper = function(){

	}

	PushWrapper.prototype.init = function(username){
		_setupPushNotificationService(username);
	}

    PushWrapper.prototype.subTag = function(tagName){
        var deferred = $.Deferred();
        if(_push){
            _push.subscribeTag(tagName).done(function(response) {
                // Successfully subscribed to tag
                deferred.resolve({rc:1, msg:response});
            }, function(err) {
                // Handle errors
                deferred.reject({rc:2, msg:err});
            });
        }else{
            deferred.reject({rc:3, msg: "mbass is not initialized."})
        }
        return deferred.promise();
    }

    //retrieve the list of tags to which the device has subscribed with the
    PushWrapper.prototype.getSubscriptions = function(){
        var deferred = $.Deferred();
        if(_push){
            _push.getSubscriptions().done(function(response){
                deferred.resolve({rc: 1, msg: response});
            }, function(err){
                deferred.reject({rc: 2, msg: err});
            });
        }else{
            deferred.reject({rc:3, msg: "mbass is not initialized."})
        }
        return deferred.promise();
    }

    PushWrapper.prototype.unsubTag = function(tagName){
        var deferred = $.Deferred();
        if(_push){
            _push.unsubscribeTag(tagName).done(function(response) {
                // Successfully subscribed to tag
                deferred.resolve({rc:1, msg:response});
            }, function(err) {
                // Handle errors
                deferred.reject({rc:2, msg:err});
            });
        }else{
            deferred.reject({rc:3, msg: "mbass is not initialized."})
        }
        return deferred.promise(); 
    }

	exports.push = new PushWrapper();
});