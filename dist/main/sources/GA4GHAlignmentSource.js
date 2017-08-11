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
var ZERO_BASED = false;


// Genome ranges are rounded to multiples of this for fetching.
// This reduces network activity while fetching.
// TODO: tune this value -- setting it close to the read length will result in
// lots of reads being fetched twice, but setting it too large will result in
// bulkier requests.
var BASE_PAIRS_PER_FETCH = 100;













function create(spec) {
  var url = spec.endpoint + '/reads/search';

  var reads = {};

  // Ranges for which we have complete information -- no need to hit network.
  var coveredRanges = [];

  function addReadsFromResponse(response) {
    if (response.alignments === undefined) {
      return;}

    response.alignments.forEach(function (alignment) {
      // optimization: don't bother constructing a GA4GHAlignment unless it's new.
      var key = _GA4GHAlignment2['default'].keyFromGA4GHResponse(alignment);
      if (key in reads) return;
      try {
        var ga4ghAlignment = new _GA4GHAlignment2['default'](alignment);
        reads[key] = ga4ghAlignment;} 
      catch (e) {
        // sometimes, data from the server does not have an alignment.
        // this will catch an exception in the GA4GHAlignment constructor
      }});}



  function rangeChanged(newRange) {
    // HACK FOR DEMO
    var contig = newRange.contig.replace(/^chr/, '');
    if (!spec.killChr) {
      contig = 'chr' + contig;}

    var interval = new _ContigInterval2['default'](contig, newRange.start, newRange.stop);
    if (interval.isCoveredBy(coveredRanges)) return;

    interval = interval.round(BASE_PAIRS_PER_FETCH, ZERO_BASED);

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
    // hack for DEMO. force GA4GH reference ID
    var contig = range.contig;
    if (spec.forcedReferenceId !== null) 
    {
      contig = spec.forcedReferenceId;}

    xhr.send(JSON.stringify({ 
      pageToken: pageToken, 
      pageSize: ALIGNMENTS_PER_REQUEST, 
      readGroupIds: [spec.readGroupId], 
      referenceId: contig, 
      start: range.start(), 
      end: range.stop() }));}



  function getAlignmentsInRange(range) {
    if (!range) return [];

    // HACK FOR DEMO
    var contig = range.contig.replace(/^chr/, '');
    if (!spec.killChr) {
      contig = 'chr' + contig;}

    range = new _ContigInterval2['default'](contig, range.start(), range.stop());

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
// HACK for demo. If set, will always use this reference id.
// This is for fetching referenceIds specified in GA4GH reference
// server