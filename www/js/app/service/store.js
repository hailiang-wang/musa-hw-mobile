/**
* crud notifications in local storage
*/
define(function(require, exports, module) {

	var config = require('app/config');
	var util = require('app/util');

	function _save(key, data){
		
		if(config.dropstore){
			window.localStorage.removeItem(key);
		}

		var blob = window.localStorage.getItem(key);
		var json = {};
		if(blob){
			json = JSON.parse(blob);
		}
		// #TODO for data has Chinese, the text has encoded as Unicode,
		// but here does not handle it, so now we get messy code.
		// need to fix it for Beta
		json[data.url] = {
				type : data.type,
				alert : data.alert,
				date : util.getDate()
		};
		console.log('[DEBUG] save notifications ... ' + JSON.stringify(json));
		window.localStorage.setItem(key, JSON.stringify(json));
	}

	function _get(key){
		var json = {};
		var blob = window.localStorage.getItem(key);
		if(blob){
			json = JSON.parse(blob);
		}
		return json;
	}

	// data is in json format
	function _setUserProfile(data){
		window.localStorage.setItem('MUSA_USER_PROFILE', JSON.stringify(data));
	}

	function _getUserProfile(){
		return JSON.parse(window.localStorage.getItem('MUSA_USER_PROFILE'));
	}

	function _getUserEmail(){
		return _getUserProfile().emails[0].value;
	}

	function _getUserSID(){
		return window.localStorage.getItem('MUSA_USER_SID');
	}

	function _setUserSID(sid){
		window.localStorage.setItem('MUSA_USER_SID',sid);
	}	

	exports.save = _save;
	exports.get = _get;
	exports.getUserEmail = _getUserEmail;
	exports.setUserProfile = _setUserProfile;
	exports.getUserProfile = _getUserProfile;
	exports.setUserSID = _setUserSID;
	exports.getUserSID = _getUserSID;

});