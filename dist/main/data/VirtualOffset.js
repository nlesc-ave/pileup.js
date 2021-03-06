/**
 * A virtual offset into a BAM file.
 * This combines the offset to the beginning of the compression block with an
 * offset into the inflated data.
 * These are usually represented as uint64s, which are awkward to work with in
 * JavaScript.
 * 
 */

"use strict";var _createClass = (function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};})();function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var 

VirtualOffset = (function () {



  function VirtualOffset(coffset, uoffset) {_classCallCheck(this, VirtualOffset);
    this.coffset = coffset;
    this.uoffset = uoffset;}_createClass(VirtualOffset, [{ key: "toString", value: 


    function toString() {
      return this.coffset + ":" + this.uoffset;} }, { key: "isLessThan", value: 


    function isLessThan(other) {
      return this.coffset < other.coffset || 
      this.coffset == other.coffset && 
      this.uoffset < other.uoffset;} }, { key: "isLessThanOrEqual", value: 


    function isLessThanOrEqual(other) {
      return this.coffset <= other.coffset || 
      this.coffset == other.coffset && 
      this.uoffset <= other.uoffset;} }, { key: "isEqual", value: 


    function isEqual(other) {
      return this.coffset == other.coffset && 
      this.uoffset == other.uoffset;}


    // Returns <0 if this < other, 0 if this == other, >0 if this > other.
    // Useful for sorting.
  }, { key: "compareTo", value: function compareTo(other) {
      return this.coffset - other.coffset || this.uoffset - other.uoffset;} }, { key: "clone", value: 


    function clone() {
      return new VirtualOffset(this.coffset, this.uoffset);}


    // This is a faster stand-in for jBinary.read('VirtualOffset')
  }], [{ key: "fromBlob", value: function fromBlob(u8, offset) {
      offset = offset || 0;
      var uoffset = u8[offset] + 
      u8[offset + 1] * 256, 
      coffset = u8[offset + 2] + 
      u8[offset + 3] * 256 + 
      u8[offset + 4] * 65536 + 
      u8[offset + 5] * 16777216 + 
      u8[offset + 6] * 4294967296 + 
      u8[offset + 7] * 1099511627776;
      return new VirtualOffset(coffset, uoffset);} }]);return VirtualOffset;})();



module.exports = VirtualOffset;