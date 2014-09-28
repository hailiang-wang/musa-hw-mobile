/**
* Handle map in views
*/
define(function(require, exports, module) {
	var config = require('app/config');
	var util = require('app/util');
	var store = require('app/service/store');
	
 	var markers = {};
	var map;

	var surveyor = {};
	_.extend(surveyor, Backbone.Events);

	surveyor.on('paint', function(data){
		var userEmail = store.getUserId();
		switch(data.type){
			case 'visible':
			    // show the visible btn if painting himself
			    if(data.username === userEmail &&
			    	($('#map').is(":visible"))){
			    	$("#headerBtn2").show();
			    }
			    var index = _.indexOf(_getMarkerNames(), data.username);
			    if(index == -1){
			      // create new marker
			      _addMarkerInMap(data.username, data.displayName, data.status, data.lat, data.lng, "<img onclick='javascript:SnowOpenLKDProfileByLink(\"{1}\")' src='{0}'></img>".f(data.picture, data.profile),
			      	data.picture);
			    }else{
			      // update marker
			      _updateMarkerInMap(data.username, data.displayName, data.status, data.lat, data.lng, "<img src='{0}'></img>".f(data.picture),
			      	data.picture);
			    }
				break;
			case 'invisible':
				if(data.username === userEmail){
			    	$("#headerBtn2").hide();
			    }
		    	_deleteMarkerByName(data.username);
				break;
			default:
				console.log('unknow sse event type.');
				break;
		}

		if(util.getHomeSwiperPage() == 2){
			$('#headerBtn1').buttonMarkup({icon:'bullseye'}, false);
			$('#headerBtn1').show();
		}

		try{
			// add local notification
			// TODO add settings for this option
			// docs https://github.com/apache/cordova-plugin-vibration/blob/master/doc/index.md
			navigator.vibrate(2000);
		}catch(e){
			console.error(e);
		}
	});

	function _getMapsMetadata(){
		var deferred = $.Deferred();
		$.ajax({
			url:'http://{0}/rtls/maps'.f(config.host),
			dataType: 'json',
			headers:{
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			},
			success:function(resp){
				// save metadata into database
				store.setMaps(resp);
				deferred.resolve(resp);
			},
			error:function(xhr, textStatus, errorThrown){
				deferred.reject(errorThrown);
			}
		});
		return deferred.promise();
	}

 	function _createMap(){
 		var deferred = $.Deferred();

 		if(map){
 			map.remove();
 			map = null;
 		}

 		_getMapsMetadata().then(function(data){
 			L.mapbox.accessToken = data[config.myPremise].mapbox.accessToken;
			map = L.mapbox.map('map', data[config.myPremise].mapbox.id).setView([0, 50], 3);
			$.ajax({
				type: 'GET',
				url: "http://{0}/rtls/hw".f(config.host),
				headers: {
				  "Accept": "application/json",
				  "Content-Type": "application/json"
				},
				success: function(data){
					if(data){
						console.log('get map data ' + JSON.stringify(data));
							_.each(data, function(value, key, list){
								surveyor.trigger('paint', JSON.parse(value));
							});
					}else{
						console.log('Hello World Cafe has no location-sharing user');
					}
				},
				error: function(XMLHttpRequest, textStatus, errorThrown) { 
				  console.log("[error] Post http://{0}/sse/in/loc throw an error.".f(config.host));
				  console.log("[error] Status: " + textStatus); 
				  console.log("[error] Error: " + errorThrown); 
				}
			});
			deferred.resolve();
 		},function(err){
 			deferred.reject(err);
 		});
		return deferred.promise();
  	}

	function _addMarkerInMap(username, displayName, status, lat, lng, popUpHtml, picture){
		if(markers[username]){
			console.log('try to create a marker that does already exist for {0}'.f(username));
		} else {
			// add a marker in the given location, attach some popup content to it and open the popup
			var marker = L.marker([lat, lng]).addTo(map)
			    .bindPopup(popUpHtml)
			    .openPopup();
			markers[username] = {picture: picture||'sample/user-default.png',
								displayName: displayName,
								status: status || 'TA 什么也没说',
								marker: marker};
		}
	}

	function _getMarkerNames(){
		return _.keys(markers);
	}

	function _updateMarkerInMap(username, displayName, status, lat, lng, popUpHtml, picture){
		if(markers[username]){
			// add a marker in the given location, attach some popup content to it and open the popup
			markers[username].marker.setLatLng([lat, lng]);
			markers[username].marker.update();
			markers[username].marker.bindPopup(popUpHtml)
			    .openPopup();
			markers[username].picture = picture;
			markers[username].status = status;
			markers[username].displayName = displayName;
		} else {
			console.log('try to update a marker that does not exist for {0}'.f(username));
		}
	}

	function _deleteMarkerByName(username){
		if(markers[username]){
			map.removeLayer(markers[username].marker);
			delete markers[username];
		}else{
			console.log('try to delete an not exist marker {0}'.f(username));
		}
	}

	exports.createMap =  _createMap;
	exports.addMarkerInMap = _addMarkerInMap;
	exports.getMarkerNames  = _getMarkerNames;
	exports.deleteMarkerByName = _deleteMarkerByName;
	exports.updateMarkerInMap = _updateMarkerInMap;
	exports.surveyor = surveyor;
	exports.people = markers;
})