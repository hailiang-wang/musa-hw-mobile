/**
* Handle map in views
*/
define(function(require, exports, module) {
	var config = require('app/config');
	var store = require('app/service/store');
	L.mapbox.accessToken = 'pk.eyJ1IjoiaGFpbiIsImEiOiJFQUVqelIwIn0.397XBIShpknPNDl6e95mow';
 	var markers = {};
	var map;

	var surveyor = {};
	_.extend(surveyor, Backbone.Events);

	surveyor.on('paint', function(data){
		console.log('surveyor paint ' + JSON.stringify(data));
		var userEmail = store.getUserId();
		switch(data.type){
			case 'visible':
			    // show the visible btn if painting himself
			    if(data.username === userEmail){
			    	$("#closeShowUpStatusBtn").show();
			    }
			    var index = _.indexOf(_getMarkerNames(), data.username);
			    if(index == -1){
			      // create new marker
			      _addMarkerInMap(data.username, data.lat, data.lng, "<img onclick='javascript:SnowOpenLKDProfileByLink(\"{1}\")' src='{0}'></img>".f(data.picture, data.profile));
			    }else{
			      // update marker
			      _updateMarkerInMap(data.username, data.lat, data.lng, "<img src='{0}'></img>".f(data.picture));
			    }
				break;
			case 'invisible':
				if(data.username === userEmail){
			    	$("#closeShowUpStatusBtn").hide();
			    }
		    	_deleteMarkerByName(data.username);
				break;
			default:
				console.log('unknow sse event type.');
				break;
		}
	});

 	function _createMap(){
		map = L.mapbox.map('map', 'hain.ja31ci75').setView([0, 50], 3);
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
  	}

	function _addMarkerInMap(username, lat, lng, popUpHtml){
		if(markers[username]){
			console.log('try to create a marker that does already exist for {0}'.f(username));
		} else {
			// add a marker in the given location, attach some popup content to it and open the popup
			var marker = L.marker([lat, lng]).addTo(map)
			    .bindPopup(popUpHtml)
			    .openPopup();
			markers[username] = marker;
		}
	}

	function _getMarkerNames(){
		return _.keys(markers);
	}

	function _updateMarkerInMap(username, lat, lng, popUpHtml){
		if(markers[username]){
			// add a marker in the given location, attach some popup content to it and open the popup
			markers[username].setLatLng([lat, lng]);
			markers[username].update();
			markers[username].bindPopup(popUpHtml)
			    .openPopup();
		} else {
			console.log('try to update a marker that does not exist for {0}'.f(username));
		}
	}

	function _deleteMarkerByName(username){
		if(markers[username]){
			map.removeLayer(markers[username]);
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
})