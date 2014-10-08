/**
* Handle map in views
*/
define(function(require, exports, module) {
	var config = require('app/config');
	var util = require('app/util');
	var store = require('app/service/store');
	var gps = require('app/service/gps');

	var map;

	var surveyor = {};
	_.extend(surveyor, Backbone.Events);

	surveyor.on('paint', function(data){
		var userEmail = store.getUserId();
		if(data.mapId == store.getCurrentMapId()){
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
				      _addMarkerInMap(data.username, data.displayName, data.status, data.lat, data.lng, 
				      	"<img width='50px' height='50px' src='{0}' onclick='javascript:SnowOpenUserInMap(\"{1}\")'></img>".f(data.profile.pictureUrl, data.username),
				      	data.profile);
				    }else{
				      // update marker
				      _updateMarkerInMap(data.username, data.displayName, data.status, data.lat, data.lng, 
				      	"<img width='50px' height='50px' src='{0}' onclick='javascript:SnowOpenUserInMap(\"{1}\")'></img>".f(data.profile.pictureUrl, data.username),
				      	data.profile);
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
		}else{
			// the event is for other location
			console.debug('update data for other map.');
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
				    console.debug('can not resolve map, set a default one')
				    store.setCurrentMapId('HelloWorldCafe');
				    defer.resolve();
				}
			}catch(e){
				console.error(e);
				defer.reject({rc:1, msg:e});
			}

		}, function(err){
			// can not get gps data
			console.warn('CAN NOT GET GPS DATA.');
			console.warn('If app is running in simulator, it is fine.');
			console.warn('Otherwise, the user maybe reject the GPS permissions.');
			console.warn('Finally, load the default map anyway.')
		    store.setCurrentMapId('HelloWorldCafe');
		    defer.resolve();
		});
		return defer.promise;
	}

 	function _createMap(){
 		var defer = Q.defer();

 		/**
 		 * SnowMapMarkers
 		 */
 		// add a global namespace for markers management
 		// save user names/marker/status/avatar
 		// Why not export an object in a module varible ?
 		// requirejs' exports does not work well for this usage
 		// as it is exported previously, then update it in createMap
 		// the values in viewMgr does not updated. 
	 	window.SnowMapMarkers = {};

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
						console.debug('{0} has no location-sharing user'.f(maps[store.getCurrentMapId()].name));
					}
				},
				error: function(XMLHttpRequest, textStatus, errorThrown) { 
				  console.error("[error] Post http://{0}/sse/in/loc throw an error.".f(config.host));
				  console.error("[error] Status: " + textStatus); 
				  console.error("[error] Error: " + errorThrown); 
				}
			});
			defer.resolve();
 		}else{
 			defer.reject({rc:3, msg:'NO MAPS DATA AVAILABLE IN LOCALSTORAGE.'});
 		}
		return defer.promise;
  	}

	function _addMarkerInMap(username, displayName, status, lat, lng, popUpHtml, profile){
		if(SnowMapMarkers[username]){
			console.debug('try to create a marker that does already exist for {0}'.f(username));
		} else {
			console.debug('create marker for %s', username);
			// add a marker in the given location, attach some popup content to it and open the popup
			var marker = L.marker([lat, lng]).addTo(map)
			    .bindPopup(popUpHtml)
			    .openPopup();
			SnowMapMarkers[username] = {picture: profile.pictureUrl||'sample/user-default.png',
								displayName: displayName,
								status: status || 'TA 什么也没说',
								marker: marker,
								profile:profile};
			console.debug(_.keys(SnowMapMarkers));
		}
	}

	function _getMarkerNames(){
		return _.keys(SnowMapMarkers);
	}

	function _updateMarkerInMap(username, displayName, status, lat, lng, popUpHtml, profile){
		if(SnowMapMarkers[username]){
			console.debug('update marker for %s', username)
			// add a marker in the given location, attach some popup content to it and open the popup
			SnowMapMarkers[username].marker.setLatLng([lat, lng]);
			SnowMapMarkers[username].marker.update();
			SnowMapMarkers[username].marker.bindPopup(popUpHtml)
			    .openPopup();
			SnowMapMarkers[username].picture = profile.pictureUrl;
			SnowMapMarkers[username].status = status;
			SnowMapMarkers[username].displayName = displayName;
			SnowMapMarkers[username].profile = profile;
		} else {
			console.debug('try to update a marker that does not exist for %s', username);
		}
	}

	function _deleteMarkerByName(username){
		if(SnowMapMarkers[username]){
			map.removeLayer(SnowMapMarkers[username].marker);
			delete SnowMapMarkers[username];
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
})