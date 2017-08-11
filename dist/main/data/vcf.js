/**
 * Fetcher/parser for VCF files.
 * This makes very little effort to parse out details from VCF entries. It just
 * extracts CONTIG, POSITION, REF and ALT.
 *
 * 
 */
'use strict';





// This is a minimally-parsed line for facilitating binary search.
var _createClass = (function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};})();function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError('Cannot call a class as a function');}}var _ContigInterval = require('../ContigInterval');var _ContigInterval2 = _interopRequireDefault(_ContigInterval);






function extractLocusLine(vcfLine) {
  var tab1 = vcfLine.indexOf('\t'), 
  tab2 = vcfLine.indexOf('\t', tab1 + 1);

  return { 
    contig: vcfLine.slice(0, tab1), 
    position: Number(vcfLine.slice(tab1 + 1, tab2)), 
    line: vcfLine };}




function extractVariant(vcfLine) {
  var parts = vcfLine.split('\t');
  var maxFrequency = null;
  var minFrequency = null;
  if (parts.length >= 7) {
    var params = parts[7].split(';');
    for (var i = 0; i < params.length; i++) {
      var param = params[i];
      if (param.startsWith("AF=")) {
        maxFrequency = 0.0;
        minFrequency = 1.0;
        var frequenciesStrings = param.substr(3).split(",");
        for (var j = 0; j < frequenciesStrings.length; j++) {
          var currentFrequency = parseFloat(frequenciesStrings[j]);
          maxFrequency = Math.max(maxFrequency, currentFrequency);
          minFrequency = Math.min(minFrequency, currentFrequency);}}}}




  var contig = parts[0];
  var position = Number(parts[1]);

  return new Variant({ 
    contig: contig, 
    position: position, 
    id: parts[2], 
    ref: parts[3], 
    alt: parts[4], 
    majorFrequency: maxFrequency, 
    minorFrequency: minFrequency, 
    vcfLine: vcfLine });}




function compareLocusLine(a, b) {
  // Sort lexicographically by contig, then numerically by position.
  if (a.contig < b.contig) {
    return -1;} else 
  if (a.contig > b.contig) {
    return +1;} else 
  {
    return a.position - b.position;}}




// (based on underscore source)
function lowestIndex(haystack, needle, compare) {
  var low = 0, 
  high = haystack.length;
  while (low < high) {
    var mid = Math.floor((low + high) / 2), 
    c = compare(haystack[mid], needle);
    if (c < 0) {
      low = mid + 1;} else 
    {
      high = mid;}}


  return low;}var 



ImmediateVcfFile = (function () {

  // canonical map

  function ImmediateVcfFile(lines) {_classCallCheck(this, ImmediateVcfFile);
    this.lines = lines;
    this.contigMap = this.extractContigs();}_createClass(ImmediateVcfFile, [{ key: 'extractContigs', value: 


    function extractContigs() {
      var contigs = [], 
      lastContig = '';
      for (var i = 0; i < this.lines.length; i++) {
        var line = this.lines[i];
        if (line.contig != lastContig) {
          contigs.push(line.contig);}}



      var contigMap = {};
      contigs.forEach(function (contig) {
        if (contig.slice(0, 3) == 'chr') {
          contigMap[contig.slice(4)] = contig;} else 
        {
          contigMap['chr' + contig] = contig;}

        contigMap[contig] = contig;});

      return contigMap;} }, { key: 'getFeaturesInRange', value: 


    function getFeaturesInRange(range) {
      var lines = this.lines;
      var contig = this.contigMap[range.contig];
      if (!contig) {
        return [];}


      var startLocus = { 
        contig: contig, 
        position: range.start(), 
        line: '' }, 

      endLocus = { 
        contig: contig, 
        position: range.stop(), 
        line: '' };

      var startIndex = lowestIndex(lines, startLocus, compareLocusLine);

      var result = [];

      for (var i = startIndex; i < lines.length; i++) {
        if (compareLocusLine(lines[i], endLocus) > 0) {
          break;}

        result.push(lines[i]);}


      return result.map(function (line) {return extractVariant(line.line);});} }]);return ImmediateVcfFile;})();var 




VcfFile = (function () {



  function VcfFile(remoteFile) {_classCallCheck(this, VcfFile);
    this.remoteFile = remoteFile;

    this.immediate = this.remoteFile.getAllString().then(function (txt) {
      // Running this on a 12MB string takes ~80ms on my 2014 Macbook Pro
      var lines = txt.split('\n').
      filter(function (line) {return line.length && line[0] != '#';}).
      map(extractLocusLine);
      return lines;}).
    then(function (lines) {
      // Sorting this structure from the 12MB VCF file takes ~60ms
      lines.sort(compareLocusLine);
      return new ImmediateVcfFile(lines);});

    this.immediate.done();}_createClass(VcfFile, [{ key: 'getFeaturesInRange', value: 


    function getFeaturesInRange(range) {
      return this.immediate.then(function (immediate) {
        return immediate.getFeaturesInRange(range);});} }]);return VcfFile;})();var 




Variant = (function () {














  function Variant(variant) {_classCallCheck(this, Variant);
    this.contig = variant.contig;
    this.position = variant.position;
    this.ref = variant.ref;
    this.alt = variant.alt;
    this.id = variant.id;
    this.majorFrequency = variant.majorFrequency;
    this.minorFrequency = variant.minorFrequency;
    this.vcfLine = variant.vcfLine;}_createClass(Variant, [{ key: 'intersects', 












    // TODO
    value: 


    function intersects(range) {
      return _intersects(this, range);} }], [{ key: 'fromGA4GH', value: function fromGA4GH(ga4ghVariant) {return new Variant({ contig: ga4ghVariant.referenceName, position: ga4ghVariant.start, id: ga4ghVariant.id, ref: ga4ghVariant.referenceBases, alt: ga4ghVariant.alternateBases, majorFrequency: 0, minorFrequency: 0, // TODO extract these
        vcfLine: "" });} }]);return Variant;})();



function _intersects(variant, range) {
  return range.intersects(new _ContigInterval2['default'](variant.contig, variant.position, variant.position + 1));}


module.exports = { 
  VcfFile: VcfFile, 
  Variant: Variant }; //this is the bigest allel frequency for single vcf entry
//single vcf entry might contain more than one variant like the example below
//20 1110696 rs6040355 A G,T 67 PASS NS=2;DP=10;AF=0.333,0.667;AA=T;DB
//this is the smallest allel frequency for single vcf entry