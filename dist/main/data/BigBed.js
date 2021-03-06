/**
 * Parser for bigBed format.
 * Based on UCSC's src/inc/bbiFile.h
 * 
 */
'use strict';var _slicedToArray = (function () {function sliceIterator(arr, i) {var _arr = [];var _n = true;var _d = false;var _e = undefined;try {for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i['return']) _i['return']();} finally {if (_d) throw _e;}}return _arr;}return function (arr, i) {if (Array.isArray(arr)) {return arr;} else if (Symbol.iterator in Object(arr)) {return sliceIterator(arr, i);} else {throw new TypeError('Invalid attempt to destructure non-iterable instance');}};})();var _createClass = (function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};})();function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError('Cannot call a class as a function');}}var _q = require(

'q');var _q2 = _interopRequireDefault(_q);var _underscore = require(
'underscore');var _underscore2 = _interopRequireDefault(_underscore);var _jbinary = require(
'jbinary');var _jbinary2 = _interopRequireDefault(_jbinary);var _pakoLibInflate = require(
'pako/lib/inflate');var _pakoLibInflate2 = _interopRequireDefault(_pakoLibInflate); // for gzip inflation
var _RemoteFile = require(
'../RemoteFile');var _RemoteFile2 = _interopRequireDefault(_RemoteFile);var _Interval = require(
'../Interval');var _Interval2 = _interopRequireDefault(_Interval);var _ContigInterval = require(
'../ContigInterval');var _ContigInterval2 = _interopRequireDefault(_ContigInterval);var _utils = require(
'../utils');var _utils2 = _interopRequireDefault(_utils);var _formatsBbi = require(
'./formats/bbi');var _formatsBbi2 = _interopRequireDefault(_formatsBbi);


function parseHeader(buffer) {
  // TODO: check Endianness using magic. Possibly use jDataView.littleEndian
  // to flip the endianness for jBinary consumption.
  // NB: dalliance doesn't support big endian formats.
  return new _jbinary2['default'](buffer, _formatsBbi2['default'].TYPE_SET).read('Header');}


// The "CIR" tree contains a mapping from sequence -> block offsets.
// It stands for "Chromosome Index R tree"
function parseCirTree(buffer) {
  return new _jbinary2['default'](buffer, _formatsBbi2['default'].TYPE_SET).read('CirTree');}


// The "CIR" tree header contains size of a mapping from sequence -> block offsets.
// It stands for "Chromosome Index R tree"
function parseCirTreeHeader(buffer) {
  return new _jbinary2['default'](buffer, _formatsBbi2['default'].TYPE_SET).read('CirTreeHeader');}


// Extract a map from contig name --> contig ID from the bigBed header.
function generateContigMap(header) {
  // Just assume it's a flat "tree" for now.
  var nodes = header.chromosomeTree.nodes.contents;
  if (!nodes) {
    throw 'Invalid chromosome tree';}

  return _underscore2['default'].object(nodes.map(function (_ref) {var id = _ref.id;var key = _ref.key;
    // remove trailing nulls from the key string
    return [key.replace(/\0.*/, ''), id];}));}



// Generate the reverse map from contig ID --> contig name.
function reverseContigMap(contigMap) {
  var ary = [];
  _underscore2['default'].each(contigMap, function (index, name) {
    ary[index] = name;});

  return ary;}



function extractFeaturesFromBlock(buffer, 
dataRange, 
block, 
isCompressed) {
  var blockOffset = block.offset - dataRange.start, 
  blockLimit = blockOffset + block.size, 

  blockBuffer = 
  // NOTE: "+ 2" skips over two bytes of gzip header (0x8b1f), which pako.inflateRaw will not handle.
  buffer.slice(
  blockOffset + (isCompressed ? 2 : 0), 
  blockLimit);


  var inflatedBuffer = 
  isCompressed ? 
  _pakoLibInflate2['default'].inflateRaw(new Uint8Array(blockBuffer)) : 
  blockBuffer;

  var jb = new _jbinary2['default'](inflatedBuffer, _formatsBbi2['default'].TYPE_SET);
  // TODO: parse only one BedEntry at a time & use an iterator.
  return jb.read('BedBlock');}



















// All features found in range.










// A copy of LeafData from bbi.js.









// This (internal) version of the BigBed class has no promises for headers,
// only immediate data. This greatly simplifies writing methods on it.
var ImmediateBigBed = (function () {






  function ImmediateBigBed(remoteFile, header, cirTree, contigMap) {_classCallCheck(this, ImmediateBigBed);
    this.remoteFile = remoteFile;
    this.header = header;
    this.cirTree = cirTree;
    this.contigMap = contigMap;
    this.chrIdToContig = reverseContigMap(contigMap);}


  // Map contig name to contig ID. Leading "chr" is optional. Throws on failure.
  _createClass(ImmediateBigBed, [{ key: 'getContigId', value: function getContigId(contig) {
      if (contig in this.contigMap) return this.contigMap[contig];
      var chr = 'chr' + contig;
      if (chr in this.contigMap) return this.contigMap[chr];
      throw 'Invalid contig ' + contig;} }, { key: 'getChrIdInterval', value: 


    function getChrIdInterval(range) {
      return new _ContigInterval2['default'](
      this.getContigId(range.contig), range.start(), range.stop());} }, { key: 'getContigInterval', value: 


    function getContigInterval(range) {
      return new _ContigInterval2['default'](
      this.chrIdToContig[range.contig], range.start(), range.stop());}


    // Bed entries have a chromosome ID. This converts that to a contig string.
  }, { key: 'attachContigToBedRows', value: function attachContigToBedRows(beds) {var _this = this;
      return beds.map(function (bed) {return { 
          contig: _this.chrIdToContig[bed.chrId], 
          start: bed.start, 
          stop: bed.stop, 
          rest: bed.rest };});}



    // Find all blocks containing features which intersect with contigRange.
  }, { key: 'findOverlappingBlocks', value: function findOverlappingBlocks(range) {
      // Do a recursive search through the index tree
      var matchingBlocks = [];
      var tupleRange = [[range.contig, range.start()], 
      [range.contig, range.stop()]];
      var find = function find(node) {
        if (node.contents) {
          node.contents.forEach(find);} else 
        {
          var nodeRange = 
          [
          [node.startChromIx, node.startBase], 
          [node.endChromIx, node.endBase]];


          if (_utils2['default'].tupleRangeOverlaps(nodeRange, tupleRange)) {
            matchingBlocks.push(node);}}};



      find(this.cirTree.blocks);

      return matchingBlocks;}


    // Internal function for fetching features by block.
  }, { key: 'fetchFeaturesByBlock', value: function fetchFeaturesByBlock(range) {
      var blocks = this.findOverlappingBlocks(range);
      if (blocks.length === 0) {
        return _q2['default'].when([]);}


      // Find the range in the file which contains all relevant blocks.
      // In theory there could be gaps between blocks, but it's hard to see how.
      var byteRange = _Interval2['default'].boundingInterval(
      blocks.map(function (n) {return new _Interval2['default'](+n.offset, n.offset + n.size);}));

      var isCompressed = this.header.uncompressBufSize > 0;
      return this.remoteFile.getBytes(byteRange.start, byteRange.length()).
      then(function (buffer) {
        return blocks.map(function (block) {
          var beds = extractFeaturesFromBlock(buffer, byteRange, block, isCompressed);
          if (block.startChromIx != block.endChromIx) {
            throw 'Can\'t handle blocks which span chromosomes!';}


          return { 
            range: new _ContigInterval2['default'](block.startChromIx, block.startBase, block.endBase), 
            rows: beds };});});}





    // TODO: merge this into getFeaturesInRange
    // Fetch the relevant blocks from the bigBed file and extract the features
    // which overlap the given range.
  }, { key: 'fetchFeatures', value: function fetchFeatures(contigRange) {var _this2 = this;
      return this.fetchFeaturesByBlock(contigRange).
      then(function (bedsByBlock) {
        var beds = _underscore2['default'].flatten(bedsByBlock.map(function (b) {return b.rows;}));

        beds = beds.filter(function (bed) {
          // Note: BED intervals are explicitly half-open.
          // The "- 1" converts them to closed intervals for ContigInterval.
          var bedInterval = new _ContigInterval2['default'](bed.chrId, bed.start, bed.stop - 1);
          return contigRange.intersects(bedInterval);});


        return _this2.attachContigToBedRows(beds);});} }, { key: 'getFeaturesInRange', value: 



    function getFeaturesInRange(range) {
      return this.fetchFeatures(this.getChrIdInterval(range));} }, { key: 'getFeatureBlocksOverlapping', value: 


    function getFeatureBlocksOverlapping(range) {var _this3 = this;
      var indexRange = this.getChrIdInterval(range);
      return this.fetchFeaturesByBlock(indexRange).
      then(function (featureBlocks) {
        // Convert chrIds to contig strings.
        return featureBlocks.map(function (fb) {return { 
            range: _this3.getContigInterval(fb.range), 
            rows: _this3.attachContigToBedRows(fb.rows) };});});} }]);return ImmediateBigBed;})();





function parseAutoSqlFields(autoSql) {
  return autoSql.slice(autoSql.indexOf('(') + 2, autoSql.lastIndexOf(')') - 1).split('\n').map(function (line) {
    var cols = line.trim().split(';')[0].split(/\s+/);
    return cols[1];});}var 



BigBed = (function () {






  /**
   * Prepare to request features from a remote bigBed file.
   * The remote source must support HTTP Range headers.
   * This will kick off several async requests for portions of the file.
   */
  function BigBed(url) {var _this4 = this;_classCallCheck(this, BigBed);
    this.remoteFile = new _RemoteFile2['default'](url);
    this.header = this.remoteFile.getBytes(0, 64 * 1024).then(parseHeader);
    this.contigMap = this.header.then(generateContigMap);

    // Next: fetch the block index and parse out the "CIR" tree.
    this.cirTree = this.header.then(function (header) {
      // zoomHeaders[0].dataOffset is the next entry in the file.
      // We assume the "cirTree" section goes all the way to that point.
      // Lacking zoom headers, download header of CirTree to determine length
      var start = header.unzoomedIndexOffset, 
      zoomHeader = header.zoomHeaders[0], 
      length = zoomHeader ? zoomHeader.dataOffset - start : 4096;
      if (zoomHeader) {
        return _this4.remoteFile.getBytes(start, length).then(parseCirTree);} else 
      {
        // Download CirTreeHeader to find length of whole CirTree
        return _this4.remoteFile.getBytes(start, 4 * 11).then(parseCirTreeHeader).then(function (treeHeader) {
          var cirTreeLength = treeHeader.blockSize * treeHeader.itemCount.lo;
          return _this4.remoteFile.getBytes(start, cirTreeLength);}).
        then(parseCirTree);}});



    this.immediate = _q2['default'].all([this.header, this.cirTree, this.contigMap]).
    then(function (_ref2) {var _ref22 = _slicedToArray(_ref2, 3);var header = _ref22[0];var cirTree = _ref22[1];var contigMap = _ref22[2];
      var cm = contigMap;
      header.autoSqlFields = parseAutoSqlFields(header.autoSql);
      return new ImmediateBigBed(_this4.remoteFile, header, cirTree, cm);});


    // Bubble up errors
    this.immediate.done();}


  /**
   * Returns all BED entries which overlap the range.
   * Note: while the requested range is inclusive on both ends, ranges in
   * bigBed format files are half-open (inclusive at the start, exclusive at
   * the end).
   */_createClass(BigBed, [{ key: 'getFeaturesInRange', value: 
    function getFeaturesInRange(contig, start, stop) {
      var range = new _ContigInterval2['default'](contig, start, stop);
      return this.immediate.then(function (im) {return im.getFeaturesInRange(range);});}


    /**
     * Returns all features in blocks overlapping the given range.
     * Because these features must all be fetched, decompressed and parsed
     * anyway, this can be helpful for upstream caching.
     */ }, { key: 'getFeatureBlocksOverlapping', value: 
    function getFeatureBlocksOverlapping(range) {
      return this.immediate.then(function (im) {return im.getFeatureBlocksOverlapping(range);});} }, { key: 'getAutoSqlFields', value: 


    function getAutoSqlFields() {
      return this.immediate.then(function (im) {return im.header.autoSqlFields;});} }]);return BigBed;})();



module.exports = BigBed; // Half-open interval for the BED row.
// Remaining fields in the BED row (typically tab-delimited)
// note: not inclusive