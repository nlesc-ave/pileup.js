/**
 * Class representing a closed numeric interval, [start, stop].
 *
 * 
 */

"use strict";var _createClass = (function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};})();function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError('Cannot call a class as a function');}}var 

Interval = (function () {



  // Represents [start, stop] -- both ends are inclusive.
  // If stop < start, then this is an empty interval.
  function Interval(start, stop) {_classCallCheck(this, Interval);
    this.start = start;
    this.stop = stop;}


  // TODO: make this a getter method & switch to Babel.
  _createClass(Interval, [{ key: 'length', value: function length() {
      return Math.max(0, this.stop - this.start + 1);} }, { key: 'intersect', value: 


    function intersect(other) {
      return new Interval(Math.max(this.start, other.start), 
      Math.min(this.stop, other.stop));} }, { key: 'intersects', value: 


    function intersects(other) {
      return this.start <= other.stop && other.start <= this.stop;} }, { key: 'contains', value: 


    function contains(value) {
      return value >= this.start && value <= this.stop;} }, { key: 'containsInterval', value: 


    function containsInterval(other) {
      return this.contains(other.start) && this.contains(other.stop);}


    // Rounds the interval to the nearest multiples of size.
    // Optional minimum parameter determines the lowest
    // possible value for the start of the resulting Interval.
  }, { key: 'round', value: function round(size, zeroBased) {
      var minimum = zeroBased ? 0 : 1;
      var roundDown = function roundDown(x) {return x - x % size;};
      var newStart = Math.max(minimum, roundDown(this.start)), 
      newStop = roundDown(this.stop + size - 1);

      return new Interval(newStart, newStop);} }, { key: 'clone', value: 


    function clone() {
      return new Interval(this.start, this.stop);}


    /**
     * Is this Interval entirely covered by the union of the ranges?
     * The ranges parameter must be sorted by range.start
     */ }, { key: 'isCoveredBy', value: 
    function isCoveredBy(ranges) {
      var remaining = this.clone();
      for (var i = 0; i < ranges.length; i++) {
        var r = ranges[i];
        if (i && r.start < ranges[i - 1].start) {
          throw 'isCoveredBy must be called with sorted ranges';}

        if (r.start > remaining.start) {
          return false; // A position has been missed and there's no going back.
        }
        remaining.start = Math.max(remaining.start, r.stop + 1);
        if (remaining.length() <= 0) {
          return true;}}


      return false;}


    /**
     * Find the subintervals which are not in `other`.
     * This can yield either zero, one or two Intervals.
     */ }, { key: 'subtract', value: 
    function subtract(other) {
      if (!this.intersects(other)) {
        return [this]; // unaffected by this range
      } else if (this.containsInterval(other)) {
          // return the bit before and the bit after
          return [new Interval(this.start, other.start - 1), 
          new Interval(other.stop + 1, this.stop)].filter(function (x) {return x.length() > 0;});} else 
        if (other.containsInterval(this)) {
          return []; // it's been completely obliterated
        } else {
            // it overlaps one end
            if (other.start < this.start) {
              return [new Interval(other.stop + 1, this.stop)];} else 
            {
              return [new Interval(this.start, other.start - 1)];}}}




    /**
     * Find the disjoint subintervals not covered by any interval in the list.
     *
     * If comp = interval.complementIntervals(ranges), then this guarantees that:
     * - comp union ranges = interval
     * - a int b = 0 forall a \in comp, b in ranges
     *
     * (The input ranges need not be disjoint.)
     */ }, { key: 'complementIntervals', value: 
    function complementIntervals(ranges) {
      var comps = [this];
      ranges.forEach(function (range) {
        var newComps = [];
        comps.forEach(function (iv) {
          newComps = newComps.concat(iv.subtract(range));});

        comps = newComps;});

      return comps;} }, { key: 'toString', value: 



























    function toString() {
      return '[' + this.start + ', ' + this.stop + ']';} }], [{ key: 'intersectAll', value: function intersectAll(intervals) {if (!intervals.length) {throw new Error('Tried to intersect zero intervals');}var result = intervals[0].clone();intervals.slice(1).forEach(function (_ref) {var start = _ref.start;var stop = _ref.stop;result.start = Math.max(start, result.start);result.stop = Math.min(stop, result.stop);});return result;} // Returns an interval which contains all the given intervals.
  }, { key: 'boundingInterval', value: function boundingInterval(intervals) {if (!intervals.length) {throw new Error('Tried to bound zero intervals');}var result = intervals[0].clone();intervals.slice(1).forEach(function (_ref2) {var start = _ref2.start;var stop = _ref2.stop;result.start = Math.min(start, result.start);result.stop = Math.max(stop, result.stop);});return result;} }]);return Interval;})();


module.exports = Interval;