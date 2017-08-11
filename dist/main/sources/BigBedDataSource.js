'use strict';























// human-readable name, e.g. "TP53"


// Flow type for export.








// Flow type for export.
Object.defineProperty(exports, '__esModule', { value: true });var _slicedToArray = (function () {function sliceIterator(arr, i) {var _arr = [];var _n = true;var _d = false;var _e = undefined;try {for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i['return']) _i['return']();} finally {if (_d) throw _e;}}return _arr;}return function (arr, i) {if (Array.isArray(arr)) {return arr;} else if (Symbol.iterator in Object(arr)) {return sliceIterator(arr, i);} else {throw new TypeError('Invalid attempt to destructure non-iterable instance');}};})();function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}var _underscore = require('underscore');var _underscore2 = _interopRequireDefault(_underscore);var _q = require('q');var _q2 = _interopRequireDefault(_q);var _backbone = require('backbone');var _ContigInterval = require('../ContigInterval');var _ContigInterval2 = _interopRequireDefault(_ContigInterval);var _Interval = require('../Interval');var _Interval2 = _interopRequireDefault(_Interval);var _dataBigBed = require('../data/BigBed');var _dataBigBed2 = _interopRequireDefault(_dataBigBed); // requirement for jshint to pass
/* exported Feature */var _dataFeature = require('../data/feature');var _dataFeature2 = _interopRequireDefault(_dataFeature);






// The fields are described at http://genome.ucsc.edu/FAQ/FAQformat#format1
function parseBedFeature(f) {
  var position = new _ContigInterval2['default'](f.contig, f.start, f.stop), 
  x = f.rest.split('\t'), 
  // exons arrays sometimes have trailing commas
  exonLengths = x[7].replace(/,*$/, '').split(',').map(Number), 
  exonStarts = x[8].replace(/,*$/, '').split(',').map(Number), 
  exons = _underscore2['default'].zip(exonStarts, exonLengths).
  map(function (_ref) {var _ref2 = _slicedToArray(_ref, 2);var start = _ref2[0];var length = _ref2[1];
    return new _Interval2['default'](f.start + start, f.start + start + length);});


  return { 
    position: position, 
    id: x[0], // e.g. ENST00000359597
    strand: x[2], // either + or -
    codingRegion: new _Interval2['default'](Number(x[3]), Number(x[4])), 
    geneId: x[9], 
    name: x[10], 
    exons: exons };}




function createFromBigBedFile(remoteSource) {
  // Collection of genes that have already been loaded.
  var genes = {};

  // Ranges for which we have complete information -- no need to hit network.
  var coveredRanges = [];

  function addGene(newGene) {
    if (!genes[newGene.id]) {
      genes[newGene.id] = newGene;}}



  function getFeaturesInRange(range) {
    if (!range) return [];
    var results = [];
    _underscore2['default'].each(genes, function (gene) {
      if (range.intersects(gene.position)) {
        results.push(gene);}});


    return results;}


  function fetch(range) {
    var interval = new _ContigInterval2['default'](range.contig, range.start, range.stop);

    // Check if this interval is already in the cache.
    if (interval.isCoveredBy(coveredRanges)) {
      return _q2['default'].when();}


    coveredRanges.push(interval);
    coveredRanges = _ContigInterval2['default'].coalesce(coveredRanges);

    return remoteSource.getFeatureBlocksOverlapping(interval).then(function (featureBlocks) {
      featureBlocks.forEach(function (fb) {
        coveredRanges.push(fb.range);
        coveredRanges = _ContigInterval2['default'].coalesce(coveredRanges);
        var genes = fb.rows.map(parseBedFeature);
        genes.forEach(function (gene) {return addGene(gene);});
        //we have new data from our internal block range
        o.trigger('newdata', fb.range);});});}




  var o = { 
    rangeChanged: function rangeChanged(newRange) {
      fetch(newRange).done();}, 

    getFeaturesInRange: getFeaturesInRange, 

    // These are here to make Flow happy.
    on: function on() {}, 
    off: function off() {}, 
    trigger: function trigger() {} };

  _underscore2['default'].extend(o, _backbone.Events); // Make this an event emitter

  return o;}


function create(data) {
  var url = data.url;
  if (!url) {
    throw new Error('Missing URL from track: ' + JSON.stringify(data));}


  return createFromBigBedFile(new _dataBigBed2['default'](url));}


module.exports = { 
  create: create, 
  createFromBigBedFile: createFromBigBedFile }; // transcript ID, e.g. "ENST00000269305"
// locus of coding start
// ensembl gene ID