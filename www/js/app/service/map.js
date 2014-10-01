/**
* Handle map in views
*/
define(function(require, exports, module) {
	var config = require('app/config');
	var util = require('app/util');
	var store = require('app/service/store');
	var gps = require('app/service/gps');
	
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
		return Q($.ajax({
			url:'http://{0}/rtls/maps'.f(config.host),
			dataType: 'json',
			headers:{
				'Content-Type': 'application/json',
				'Accept': 'application/json'
				}
			})).then(function(data){
				// save metadata into database
				store.setMaps(data);
				return data;
			}, function(xhr){
				console.error('XHR ERROR ' + xhr.status);
				console.error(xhr.responseText);
				throw JSON.parse(xhr.responseText);
			});
	}

	function _resolveMap(data){
		var maps = data||store.getMaps();
		var defer = Q.defer();
		gps.getCurrentPosition().then(function(pos){
			try{
				var mapId;
				_.find(maps, function(value, key, list){
				    if(gps.isPointInsideCircle(maps, key, pos.coords)){
				        mapId = key;
				        return true;
				    }else{
				        return false;
				    }
				});
				if(mapId){
				    store.setCurrentMapId(mapId);
				    defer.resolve();
				}else{
				    console.log('>> can not resolve map, set a default one')
				    store.setCurrentMapId('HelloWorldCafe');
				    defer.resolve();
				}
			}catch(e){
				console.error(e);
				defer.reject({rc:1, msg:e});
			}

		}, function(err){
		   // can not get gps data  
		   defer.reject({rc:2, msg:err});
		});
		return defer.promise;
	}

 	function _createMap(){
 		var defer = Q.defer();

 		if(map){
 			map.remove();
 			map = null;
 		}

 		var maps = store.getMaps();
 		if(maps && maps[store.getCurrentMapId()]){
 			L.mapbox.accessToken = maps[store.getCurrentMapId()].mapbox.accessToken;
			map = L.mapbox.map('map', maps[store.getCurrentMapId()].mapbox.id).setView([0, 50], 3);
			$.ajax({
				type: 'GET',
				url: "http://{0}/rtls/hw".f(config.host),
				headers: {
				  "Accept": "application/json",
				  "Content-Type": "application/json"
				},
				success: function(data){
					if(data){
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
			defer.resolve();
 		}else{
 			defer.reject({rc:3, msg:'NO MAPS DATA AVAILABLE IN LOCALSTORAGE.'});
 		}
		return defer.promise;
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

	exports.getMapsMetadata = _getMapsMetadata;
	exports.resolveMap = _resolveMap;
	exports.createMap =  _createMap;
	exports.addMarkerInMap = _addMarkerInMap;
	exports.getMarkerNames  = _getMarkerNames;
	exports.deleteMarkerByName = _deleteMarkerByName;
	exports.updateMarkerInMap = _updateMarkerInMap;
	exports.surveyor = surveyor;
	exports.people = markers;
})