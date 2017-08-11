/**
 * A data source which implements generic JSON protocol.
 * Currently only used to load alignments.
 * 
 */
'use strict';function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}var _dataFeature = require(


'../data/feature');var _dataFeature2 = _interopRequireDefault(_dataFeature);var _underscore = require(

'underscore');var _underscore2 = _interopRequireDefault(_underscore);var _backbone = require(
'backbone');var _ContigInterval = require(

'../ContigInterval');var _ContigInterval2 = _interopRequireDefault(_ContigInterval);

function create(json) {

  // parse json
  var parsedJson = JSON.parse(json);
  var features = [];

  // fill features with json
  if (!_underscore2['default'].isEmpty(parsedJson)) {
    features = _underscore2['default'].values(parsedJson.features).map(function (feature) {return _dataFeature2['default'].fromGA4GH(feature);});}


  function rangeChanged(newRange) {
    // Data is already parsed, so immediately return
    var range = new _ContigInterval2['default'](newRange.contig, newRange.start, newRange.stop);
    o.trigger('newdata', range);
    o.trigger('networkdone');
    return;}


  function getFeaturesInRange(range) {
    if (!range) return [];
    var r = _underscore2['default'].filter(features, function (feature) {return feature.intersects(range);});
    return r;}


  var o = { 
    rangeChanged: rangeChanged, 
    getFeaturesInRange: getFeaturesInRange, 

    on: function on() {}, 
    once: function once() {}, 
    off: function off() {}, 
    trigger: function trigger() {} };

  _underscore2['default'].extend(o, _backbone.Events);
  return o;}


module.exports = { 
  create: create };