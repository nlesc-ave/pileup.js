/**
 * RemoteRequest is a generic endpoint for serving http requests. RemoteRequest
 * handles json data, which is specified by genomic range (contig, start, stop)
 *
 * 
 */
'use strict';var _createClass = (function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};})();function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError('Cannot call a class as a function');}}var _q = require(

'q');var _q2 = _interopRequireDefault(_q);var _ContigInterval = require(
'./ContigInterval');var _ContigInterval2 = _interopRequireDefault(_ContigInterval);

var MONSTER_REQUEST = 5000000;var 

RemoteRequest = (function () {


  // track this for debugging/testing

  function RemoteRequest(url) {_classCallCheck(this, RemoteRequest);
    this.cache = require('memory-cache');
    this.url = url;
    this.numNetworkRequests = 0;}_createClass(RemoteRequest, [{ key: 'get', value: 


    function get(contig, start, stop) {
      var length = stop - start;
      if (length <= 0) {
        return _q2['default'].reject('Requested <0 interval (' + length + ') from ' + this.url);}


      // First check the cache.
      var contigInterval = new _ContigInterval2['default'](contig, start, stop);
      var buf = this.cache.get(contigInterval);
      if (buf) {
        return _q2['default'].when(buf);}


      // Need to fetch from the network.
      return this.getFromNetwork(contig, start, stop);}


    /**
     * Request must be of form "url/contig?start=start&end=stop"
    */ }, { key: 'getFromNetwork', value: 
    function getFromNetwork(contig, start, stop) {var _this = this;
      var length = stop - start;
      if (length > 5000000) {
        throw 'Monster request: Won\'t fetch ' + length + ' sized ranges from ' + this.url;}

      var xhr = new XMLHttpRequest();
      var endpoint = this.getEndpointFromContig(contig, start, stop);
      xhr.open('GET', endpoint);
      xhr.responseType = 'json';
      xhr.setRequestHeader('Content-Type', 'application/json');

      return this.promiseXHR(xhr).then(function (json) {
        // extract response from promise
        var buffer = json[0];
        var contigInterval = new _ContigInterval2['default'](contig, start, stop);
        _this.cache.put(contigInterval, buffer);
        return buffer;});} }, { key: 'getEndpointFromContig', value: 



    function getEndpointFromContig(contig, start, stop) {
      return this.url + '/' + contig + '?start=' + start + '&end=' + stop;}


    // Wrapper to convert XHRs to Promises.
    // The promised values are the response (e.g. an ArrayBuffer) and the Event.
  }, { key: 'promiseXHR', value: function promiseXHR(xhr) {
      var url = this.url;
      var deferred = _q2['default'].defer();
      xhr.addEventListener('load', function (e) {
        if (this.status >= 400) {
          deferred.reject('Request for ' + url + ' failed with status: ' + this.status + ' ' + this.statusText);} else 
        {
          deferred.resolve([this.response, e]);}});


      xhr.addEventListener('error', function (e) {
        deferred.reject('Request for ' + url + ' failed with status: ' + this.status + ' ' + this.statusText);});

      this.numNetworkRequests++;
      xhr.send();
      return deferred.promise;} }]);return RemoteRequest;})();



module.exports = { 
  RemoteRequest: RemoteRequest, 
  MONSTER_REQUEST: MONSTER_REQUEST };