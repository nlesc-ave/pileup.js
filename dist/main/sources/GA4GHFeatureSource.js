/**
 * A data source which implements the GA4GH Feature protocol.
 * 
 */
'use strict';function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}var _underscore = require(

'underscore');var _underscore2 = _interopRequireDefault(_underscore);var _backbone = require(
'backbone');var _ContigInterval = require(

'../ContigInterval');var _ContigInterval2 = _interopRequireDefault(_ContigInterval);var _dataFeature = require(


'../data/feature');var _dataFeature2 = _interopRequireDefault(_dataFeature);

var BASE_PAIRS_PER_FETCH = 100;
var FEATURES_PER_REQUEST = 400;
var ZERO_BASED = false;






function create(spec) {
  var url = spec.endpoint + '/features/search';

  var features = {};

  // Ranges for which we have complete information -- no need to hit network.
  var coveredRanges = [];

  function addFeaturesFromResponse(response) {
    if (response.features === undefined) {
      return;}


    response.features.forEach(function (ga4ghFeature) {
      var contigInterval = new _ContigInterval2['default'](ga4ghFeature.referenceName, ga4ghFeature.start, ga4ghFeature.end);

      var key = ga4ghFeature.id + contigInterval.toString();
      if (key in features) return;
      var feature = _dataFeature2['default'].fromGA4GH(ga4ghFeature);
      features[key] = feature;});}



  function rangeChanged(newRange) {
    var interval = new _ContigInterval2['default'](newRange.contig, newRange.start, newRange.stop);
    if (interval.isCoveredBy(coveredRanges)) return;

    interval = interval.round(BASE_PAIRS_PER_FETCH, ZERO_BASED);

    // select only intervals not yet loaded into coveredRangesß
    var intervals = interval.complementIntervals(coveredRanges);

    // We "cover" the interval immediately (before the reads have arrived) to
    // prevent duplicate network requests.
    coveredRanges.push(interval);
    coveredRanges = _ContigInterval2['default'].coalesce(coveredRanges);

    intervals.forEach(function (i) {
      fetchFeaturesForInterval(i, null, 1 /* first request */);});}



  function notifyFailure(message) {
    o.trigger('networkfailure', message);
    o.trigger('networkdone');
    console.warn(message);}


  function fetchFeaturesForInterval(range, 
  pageToken, 
  numRequests) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.responseType = 'json';
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.addEventListener('load', function (e) {
      var response = this.response;
      if (this.status >= 400) {
        notifyFailure(this.status + ' ' + this.statusText + ' ' + JSON.stringify(response));} else 
      {
        if (response.errorCode) {
          notifyFailure('Error from GA4GH Feature endpoint: ' + JSON.stringify(response));} else 
        {
          addFeaturesFromResponse(response);
          o.trigger('newdata', range); // display data as it comes in.
          if (response.nextPageToken) {
            fetchFeaturesForInterval(range, response.nextPageToken, numRequests + 1);} else 
          {
            o.trigger('networkdone');}}}});




    xhr.addEventListener('error', function (e) {
      notifyFailure('Request failed with status: ' + this.status);});


    o.trigger('networkprogress', { numRequests: numRequests });
    xhr.send(JSON.stringify({ 
      featureSetId: spec.featureSetId, 
      pageToken: pageToken, 
      pageSize: FEATURES_PER_REQUEST, 
      referenceName: range.contig, 
      start: range.start(), 
      end: range.stop() }));}



  function getFeaturesInRange(range) {
    if (!range) return [];
    return _underscore2['default'].filter(features, function (feature) {return feature.intersects(range);});}


  var o = { 
    rangeChanged: rangeChanged, 
    getFeaturesInRange: getFeaturesInRange, 

    // These are here to make Flow happy.
    on: function on() {}, 
    once: function once() {}, 
    off: function off() {}, 
    trigger: function trigger() {} };

  _underscore2['default'].extend(o, _backbone.Events); // Make this an event emitter
  return o;}


module.exports = { 
  create: create };