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

	function _isPointInside(premise, point){
		console.log('isPointInside ' + JSON.stringify(point));
		console.log(typeof geolib);
		return geolib.isPointInside(point, config.premises[premise].polygon);
	}

	exports.getCurrentPosition = _getCurrentPosition;
	exports.isPointInside = _isPointInside;
})