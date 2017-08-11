/**
 * Class for parsing variants.
 * 
 */
'use strict';var _createClass = (function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};})();function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError('Cannot call a class as a function');}}var _ContigInterval = require(

'../ContigInterval');var _ContigInterval2 = _interopRequireDefault(_ContigInterval);var 

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
  Variant: Variant, 
  intersects: _intersects }; //this is the biggest allele frequency for single vcf entry
//single vcf entry might contain more than one variant like the example below
//20 1110696 rs6040355 A G,T 67 PASS NS=2;DP=10;AF=0.333,0.667;AA=T;DB
//this is the smallest allel frequency for single vcf entry