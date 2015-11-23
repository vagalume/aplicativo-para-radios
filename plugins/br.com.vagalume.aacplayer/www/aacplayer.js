/*global cordova, module*/

module.exports = {
    setStream: function (streaming, successCallback, errorCallback) {
        cordova.exec(successCallback, errorCallback, "PlayerAAC", "setStream", [streaming]);
    },
    stop: function (successCallback, errorCallback) {
        cordova.exec(successCallback, errorCallback, "PlayerAAC", "stop", []);
    },
    destroy: function (successCallback, errorCallback) {
        cordova.exec(successCallback, errorCallback, "PlayerAAC", "destroy", []);
    },
    play: function (successCallback, errorCallback) {
        cordova.exec(successCallback, errorCallback, "PlayerAAC", "play", []);
    },
    getStatus: function(successCallback, errorCallback) {
    	cordova.exec(successCallback, errorCallback, "PlayerAAC", "getStatus", []);	
    }, 
    statusCallback: function(onChanged, errorCallback) {
    	cordova.exec(onChanged, errorCallback, "PlayerAAC", "statusCallback", []);	
    }
};
