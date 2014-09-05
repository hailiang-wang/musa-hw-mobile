/**
* Handle map in views
*/
define(function(require, exports, module) {
	L.mapbox.accessToken = 'pk.eyJ1IjoiaGFpbiIsImEiOiJFQUVqelIwIn0.397XBIShpknPNDl6e95mow';
 	var markers = {};
	var map;

 	function _createMap(){
		map = L.mapbox.map('map', 'hain.ja31ci75').setView([0, 50], 3);
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
})