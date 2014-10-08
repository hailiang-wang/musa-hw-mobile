/**
* crud notifications in local storage
*/
define(function(require, exports, module) {

	var config = require('app/config');
	var util = require('app/util');

	function _getAppVersion(){
		return window.localStorage.getItem('MUSA_SNOWBALL_VERSION');
	}

	function _setAppVersion(appVersion){
		window.localStorage.setItem('MUSA_SNOWBALL_VERSION', appVersion);
	}

	function _saveUserAvatar(data){
		var profile = _getUserProfile();
		profile._json.pictureUrl = data;
		_setUserProfile(profile);
	}

     function _setMaps(data){
          window.localStorage.setItem('{0}-MUSA_MAPS'.f(_getUserId()), JSON.stringify(data));
     }

     function _getMaps(){
          var value = window.localStorage.getItem('{0}-MUSA_MAPS'.f(_getUserId()));
          if(value){
               return JSON.parse(value);
          }else{
               return {};
          }
     }

     function _setCurrentMapId(mapId){
          window.localStorage.setItem('{0}-MUSA_CUR_MAP'.f(_getUserId()), mapId);
     }

     function _getCurrentMapId(){
          return window.localStorage.getItem('{0}-MUSA_CUR_MAP'.f(_getUserId()));
     }

	// email address
	function _setUserId(id){
		window.localStorage.setItem('MUSA_USER_ID', id);
	}

	function _getUserId(){
		return window.localStorage.getItem('MUSA_USER_ID');
	}

	function _getSubTags(){
		return JSON.parse(window.localStorage.getItem('{0}-SUBTAGS'.f(_getUserId()))||'[]');
	}

	function _setSubTags(data){
		window.localStorage.setItem('{0}-SUBTAGS'.f(_getUserId()), JSON.stringify(data));
	}

	function _removeSubTag(tagName){
		if(_.indexOf(_getSubTags(), tagName) != -1){
			var tmp = _.without(_getSubTags(), tagName);
			_setSubTags(tmp);
			return tmp;
		}else{
			return _getSubTags();
		}
	}

	function _saveNotifications(data){
		var key = '{0}-NOTIFICATIONS'.f(_getUserId());
		var blob = window.localStorage.getItem(key);
		var json = {};
		if(blob){
			json = JSON.parse(blob);
		}
		// #TODO for data has Chinese, the text has encoded as Unicode,
		// but here does not handle it, so now we get messy code.
		// need to fix it for Beta
		json[data.id] = {
				server : data.server,
				title : data.title,
				date : data.date,
				tags : data.tags,
				isRead : data.isRead||false,
				category : data.category,
				description: data.description
		};
		console.log('[DEBUG] save notifications ... ' + JSON.stringify(json));
		window.localStorage.setItem(key, JSON.stringify(json));
	}

	function _getNotifications(){
		var json = {};
		var blob = window.localStorage.getItem('{0}-NOTIFICATIONS'.f(_getUserId()));
		if(blob){
			json = JSON.parse(blob);
		}
		return json;
	}

	// data is in json format
	function _setUserProfile(data){
		window.localStorage.setItem('{0}-MUSA_USER_PROFILE'.f(_getUserId()), JSON.stringify(data));
	}

	function _getUserProfile(){
		return JSON.parse(window.localStorage.getItem('{0}-MUSA_USER_PROFILE'.f(_getUserId())));
	}

	function _getUserSID(){
		return window.localStorage.getItem('MUSA_USER_SID'.f(_getUserId()));
	}

	function _setUserSID(sid){
		window.localStorage.setItem('MUSA_USER_SID'.f(_getUserId()),sid);
	}	

	function _deleteUserSID(){
		window.localStorage.removeItem('MUSA_USER_SID'.f(_getUserId()));
	}

	function _setNotificationAsRead(id){	
		var json = _getNotifications()[id];
		console.log('get json ' + JSON.stringify(json));
		json.isRead = true;
		json.id = id;
		_saveNotifications(json);
	}

	function _setProfileEditorProperty(property){
		window.sessionStorage.setItem('MUSA_USER_PROFILE_EDITOR_PROPERTY', property);
	}

	function _getProfileEditorProperty(){
		return window.sessionStorage.getItem('MUSA_USER_PROFILE_EDITOR_PROPERTY');
	}

	exports.saveNotifications = _saveNotifications;
	exports.getNotifications = _getNotifications;
	exports.setUserProfile = _setUserProfile;
	exports.getUserProfile = _getUserProfile;
	exports.setUserSID = _setUserSID;
	exports.getUserSID = _getUserSID;
	exports.deleteUserSID = _deleteUserSID;
	exports.setAppVersion = _setAppVersion;
	exports.getAppVersion = _getAppVersion;
	exports.setUserId = _setUserId;
	exports.getUserId = _getUserId;
	exports.setNotificationAsRead = _setNotificationAsRead;
	exports.getSubTags = _getSubTags;
	exports.setSubTags = _setSubTags;
	exports.removeSubTag = _removeSubTag;
	exports.saveUserAvatar = _saveUserAvatar;
	exports.getMaps = _getMaps;
	exports.setMaps = _setMaps;
	exports.setCurrentMapId = _setCurrentMapId;
	exports.getCurrentMapId = _getCurrentMapId;
	exports.setProfileEditorProperty = _setProfileEditorProperty;
	exports.getProfileEditorProperty = _getProfileEditorProperty;
});