/**
* Handle gps events
*/
define(function(require, exports, module) {
	var config = require('app/config');
	var geolib = require('geolib');

	function _getCurrentPosition(){
		var deferred = $.Deferred();
		navigator.geolocation.getCurrentPosition(function(position) {
			// onSuccess Callback
			// This method accepts a Position object, which contains the
			// current GPS coordinates
			//
		    // alert('Latitude: '          + position.coords.latitude          + '\n' +
		    //       'Longitude: '         + position.coords.longitude         + '\n' +
		    //       'Altitude: '          + position.coords.altitude          + '\n' +
		    //       'Accuracy: '          + position.coords.accuracy          + '\n' +
		    //       'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
		    //       'Heading: '           + position.coords.heading           + '\n' +
		    //       'Speed: '             + position.coords.speed             + '\n' +
		    //       'Timestamp: '         + position.timestamp                + '\n');
		    deferred.resolve(position);
		}, 	
		// onError Callback receives a PositionError object
		//
		function(error) {
		    alert('code: '    + error.code    + '\n' +
		          'message: ' + error.message + '\n');
		    deferred.reject(error);
		});
		return deferred.promise();
	}

	function _isPointInsidePolygon(premise, point){
		return geolib.isPointInside(point, config.premises[premise].polygon);
	}

	function _isPointInsideCircle(premise, point){
		console.log('center '+ JSON.stringify(config.premises[premise].circle));
		console.log('point ' + JSON.stringify(point));
		return geolib.isPointInCircle(point, 
			config.premises[premise].circle.center, 
			config.premises[premise].circle.radius);
	}

	exports.getCurrentPosition = _getCurrentPosition;
	exports.isPointInsidePolygon = _isPointInsidePolygon;
	exports.isPointInsideCircle = _isPointInsideCircle;
})