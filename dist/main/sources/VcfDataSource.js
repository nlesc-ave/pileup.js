/**
 * Caching & prefetching for VCF sources.
 *
 * 
 */
'use strict';Object.defineProperty(exports, '__esModule', { value: true });function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}var _backbone = require(


'backbone');var _backbone2 = _interopRequireDefault(_backbone);var _underscore = require(
'underscore');var _underscore2 = _interopRequireDefault(_underscore);var _q = require(
'q');var _q2 = _interopRequireDefault(_q);var _ContigInterval = require(

'../ContigInterval');var _ContigInterval2 = _interopRequireDefault(_ContigInterval);var _RemoteFile = require(
'../RemoteFile');var _RemoteFile2 = _interopRequireDefault(_RemoteFile);var _LocalStringFile = require(
'../LocalStringFile');var _LocalStringFile2 = _interopRequireDefault(_LocalStringFile);
// requirement for jshint to pass
/* exported Variant */var _dataVariant = require(
'../data/variant');var _dataVcf = require(
'../data/vcf');










var BASE_PAIRS_PER_FETCH = 100;
var ZERO_BASED = false;

function variantKey(v) {
  return v.contig + ':' + v.position;}



function createFromVcfFile(remoteSource) {
  var variants = {};

  // Ranges for which we have complete information -- no need to hit network.
  var coveredRanges = [];

  function addVariant(v) {
    var key = variantKey(v);
    if (!variants[key]) {
      variants[key] = v;}}



  function fetch(range) {
    var interval = new _ContigInterval2['default'](range.contig, range.start, range.stop);

    // Check if this interval is already in the cache.
    if (interval.isCoveredBy(coveredRanges)) {
      return _q2['default'].when();}


    interval = interval.round(BASE_PAIRS_PER_FETCH, ZERO_BASED);

    // "Cover" the range immediately to prevent duplicate fetches.
    coveredRanges.push(interval);
    coveredRanges = _ContigInterval2['default'].coalesce(coveredRanges);
    return remoteSource.getFeaturesInRange(interval).then(function (variants) {
      variants.forEach(function (variant) {return addVariant(variant);});
      o.trigger('newdata', interval);});}



  function getFeaturesInRange(range) {
    if (!range) return []; // XXX why would this happen?
    return _underscore2['default'].filter(variants, function (v) {return range.chrContainsLocus(v.contig, v.position);});}


  var o = { 
    rangeChanged: function rangeChanged(newRange) {
      fetch(newRange).done();}, 

    getFeaturesInRange: getFeaturesInRange, 

    // These are here to make Flow happy.
    on: function on() {}, 
    off: function off() {}, 
    trigger: function trigger() {} };

  _underscore2['default'].extend(o, _backbone2['default']); // Make this an event emitter

  return o;}


function create(data) {var 
  url = data.url;var content = data.content;
  if (url) {
    return createFromVcfFile(new _dataVcf.VcfFile(new _RemoteFile2['default'](url)));} else 
  if (content) {
    return createFromVcfFile(new _dataVcf.VcfFile(new _LocalStringFile2['default'](content)));}

  // If no URL or content is passed, fail
  throw new Error('Missing URL or content from track: ' + JSON.stringify(data));}


module.exports = { 
  create: create, 
  createFromVcfFile: createFromVcfFile };