/**
* Handle gps events
*/
define(function(require, exports, module) {
	var config = require('app/config');
	var geolib = require('geolib');

	function _getCurrentPosition(){
		var defer = Q.defer();
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
		    defer.resolve(position);
		}, 	
		// onError Callback receives a PositionError object
		//
		function(err) {
		    console.error(err);
		    defer.reject(err);
		});
		return defer.promise;
	}

	function _isPointInsidePolygon(metadata, premise, point){
		if(metadata){
			console.log(metadata);
			return geolib.isPointInside(point, metadata[premise].polygon);
		}else{
			console.error('NO MAP METADATA.');
			return false;
		}
	}

	function _isPointInsideCircle(metadata, premise, point){
		if(metadata){
			console.log('center '+ JSON.stringify(metadata[premise].circle));
			console.log('point ' + JSON.stringify(point));
			return geolib.isPointInCircle(point, 
				metadata[premise].circle.center, 
				metadata[premise].circle.radius);
		}else{
			console.error('NO MAP METADATA.');
			return false;
		}
	}

	exports.getCurrentPosition = _getCurrentPosition;
	exports.isPointInsidePolygon = _isPointInsidePolygon;
	exports.isPointInsideCircle = _isPointInsideCircle;
})