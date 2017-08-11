/**
 * A data source which implements generic JSON protocol.
 * Currently only used to load alignments.
 * 
 */
'use strict';function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}var _underscore = require(



'underscore');var _underscore2 = _interopRequireDefault(_underscore);var _backbone = require(
'backbone');var _ContigInterval = require(

'../ContigInterval');var _ContigInterval2 = _interopRequireDefault(_ContigInterval);var _GA4GHAlignment = require(
'../GA4GHAlignment');var _GA4GHAlignment2 = _interopRequireDefault(_GA4GHAlignment);

function create(json) {

  // parse json
  var parsedJson = JSON.parse(json);
  var reads = [];

  // fill reads with json
  if (!_underscore2['default'].isEmpty(parsedJson)) {
    reads = _underscore2['default'].values(parsedJson.alignments).map(function (alignment) {return new _GA4GHAlignment2['default'](alignment);});}


  function rangeChanged(newRange) {
    // Data is already parsed, so immediately return
    var range = new _ContigInterval2['default'](newRange.contig, newRange.start, newRange.stop);
    o.trigger('newdata', range);
    o.trigger('networkdone');
    return;}


  function getAlignmentsInRange(range) {
    if (!range) return [];
    var r = _underscore2['default'].filter(reads, function (read) {return read.intersects(range);});
    return r;}


  var o = { 
    rangeChanged: rangeChanged, 
    getAlignmentsInRange: getAlignmentsInRange, 

    on: function on() {}, 
    once: function once() {}, 
    off: function off() {}, 
    trigger: function trigger() {} };

  _underscore2['default'].extend(o, _backbone.Events);
  return o;}


module.exports = { 
  create: create };