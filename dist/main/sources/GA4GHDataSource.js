/**
 * A data source which implements the GA4GH protocol.
 * Currently only used to load alignments.
 * 
 */
'use strict';function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}var _underscore = require(



'underscore');var _underscore2 = _interopRequireDefault(_underscore);var _backbone = require(
'backbone');var _ContigInterval = require(

'../ContigInterval');var _ContigInterval2 = _interopRequireDefault(_ContigInterval);var _GA4GHAlignment = require(
'../GA4GHAlignment');var _GA4GHAlignment2 = _interopRequireDefault(_GA4GHAlignment);

var ALIGNMENTS_PER_REQUEST = 200; // TODO: explain this choice.


// Genome ranges are rounded to multiples of this for fetching.
// This reduces network activity while fetching.
// TODO: tune this value -- setting it close to the read length will result in
// lots of reads being fetched twice, but setting it too large will result in
// bulkier requests.
var BASE_PAIRS_PER_FETCH = 100;

function expandRange(range) {
  var roundDown = function roundDown(x) {return x - x % BASE_PAIRS_PER_FETCH;};
  var newStart = Math.max(1, roundDown(range.start())), 
  newStop = roundDown(range.stop() + BASE_PAIRS_PER_FETCH - 1);

  return new _ContigInterval2['default'](range.contig, newStart, newStop);}










function create(spec) {
  if (spec.endpoint.slice(-6) != 'v0.5.1') {
    throw new Error('Only v0.5.1 of the GA4GH API is supported by pileup.js');}


  var url = spec.endpoint + '/reads/search';

  var reads = {};

  // Ranges for which we have complete information -- no need to hit network.
  var coveredRanges = [];

  function addReadsFromResponse(response) {
    response.alignments.forEach(function (alignment) {
      // optimization: don't bother constructing a GA4GHAlignment unless it's new.
      var key = _GA4GHAlignment2['default'].keyFromGA4GHResponse(alignment);
      if (key in reads) return;

      var ga4ghAlignment = new _GA4GHAlignment2['default'](alignment);
      reads[key] = ga4ghAlignment;});}



  function rangeChanged(newRange) {
    // HACK FOR DEMO
    var contig = spec.killChr ? newRange.contig.replace(/^chr/, '') : newRange.contig;
    var interval = new _ContigInterval2['default'](contig, newRange.start, newRange.stop);
    if (interval.isCoveredBy(coveredRanges)) return;

    interval = expandRange(interval);

    // select only intervals not yet loaded into coveredRangesß
    var intervals = interval.complementIntervals(coveredRanges);

    // We "cover" the interval immediately (before the reads have arrived) to
    // prevent duplicate network requests.
    coveredRanges.push(interval);
    coveredRanges = _ContigInterval2['default'].coalesce(coveredRanges);

    intervals.forEach(function (i) {
      fetchAlignmentsForInterval(i, null, 1 /* first request */);});}



  function notifyFailure(message) {
    o.trigger('networkfailure', message);
    o.trigger('networkdone');
    console.warn(message);}


  function fetchAlignmentsForInterval(range, 
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
          notifyFailure('Error from GA4GH endpoint: ' + JSON.stringify(response));} else 
        {
          addReadsFromResponse(response);
          o.trigger('newdata', range); // display data as it comes in.
          if (response.nextPageToken) {
            fetchAlignmentsForInterval(range, response.nextPageToken, numRequests + 1);} else 
          {
            o.trigger('networkdone');}}}});




    xhr.addEventListener('error', function (e) {
      notifyFailure('Request failed with status: ' + this.status);});


    o.trigger('networkprogress', { numRequests: numRequests });
    xhr.send(JSON.stringify({ 
      pageToken: pageToken, 
      pageSize: ALIGNMENTS_PER_REQUEST, 
      readGroupIds: [spec.readGroupId], 
      referenceName: range.contig, 
      start: range.start(), 
      end: range.stop() }));}



  function getAlignmentsInRange(range) {
    if (!range) return [];

    // HACK FOR DEMO
    if (spec.killChr) {
      range = new _ContigInterval2['default'](range.contig.replace(/^chr/, ''), range.start(), range.stop());}

    return _underscore2['default'].filter(reads, function (read) {return read.intersects(range);});}


  var o = { 
    rangeChanged: rangeChanged, 
    getAlignmentsInRange: getAlignmentsInRange, 

    // These are here to make Flow happy.
    on: function on() {}, 
    once: function once() {}, 
    off: function off() {}, 
    trigger: function trigger() {} };

  _underscore2['default'].extend(o, _backbone.Events); // Make this an event emitter
  return o;}


module.exports = { 
  create: create }; // HACK if set, strips "chr" from reference names.
// See https://github.com/ga4gh/schemas/issues/362