/**
 * LocalStringFile is a representation of a file that was created from input string. Used for testing and small input files.
 * 
 */
'use strict';var _createClass = (function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};})();var _get = function get(_x, _x2, _x3) {var _again = true;_function: while (_again) {var object = _x, property = _x2, receiver = _x3;_again = false;if (object === null) object = Function.prototype;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {var parent = Object.getPrototypeOf(object);if (parent === null) {return undefined;} else {_x = parent;_x2 = property;_x3 = receiver;_again = true;desc = parent = undefined;continue _function;}} else if ('value' in desc) {return desc.value;} else {var getter = desc.get;if (getter === undefined) {return undefined;}return getter.call(receiver);}}};function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError('Cannot call a class as a function');}}function _inherits(subClass, superClass) {if (typeof superClass !== 'function' && superClass !== null) {throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}var _q = require(

'q');var _q2 = _interopRequireDefault(_q);var _AbstractFile2 = require(
'./AbstractFile');var _AbstractFile3 = _interopRequireDefault(_AbstractFile2);var 

LocalStringFile = (function (_AbstractFile) {_inherits(LocalStringFile, _AbstractFile);




  function LocalStringFile(content) {_classCallCheck(this, LocalStringFile);
    _get(Object.getPrototypeOf(LocalStringFile.prototype), 'constructor', this).call(this);
    this.fileLength = content.length;
    this.buffer = new ArrayBuffer(content.length); // 2 bytes for each char
    this.content = content;

    var bufView = new Uint8Array(this.buffer);
    for (var i = 0; i < this.fileLength; i++) {
      bufView[i] = content.charCodeAt(i);}}_createClass(LocalStringFile, [{ key: 'getBytes', value: 



    function getBytes(start, length) {
      if (length < 0) {
        return _q2['default'].reject('Requested <0 bytes (' + length + ')');}


      // If the remote file length is known, clamp the request to fit within it.
      var stop = start + length - 1;
      if (this.fileLength != -1) {
        stop = Math.min(this.fileLength - 1, stop);}


      // First check the cache.
      var buf = this.getFromCache(start, stop);
      return _q2['default'].when(buf);}


    // Read the entire file -- not recommended for large files!
  }, { key: 'getAll', value: function getAll() {
      var buf = this.getFromCache(0, this.fileLength - 1);
      return _q2['default'].when(buf);}


    // Reads the entire file as a string (not an ArrayBuffer).
    // This does not use the cache.
  }, { key: 'getAllString', value: function getAllString() {
      return _q2['default'].when(this.content);}


    // Returns a promise for the number of bytes in the remote file.
  }, { key: 'getSize', value: function getSize() {
      return _q2['default'].when(this.fileLength);} }, { key: 'getFromCache', value: 


    function getFromCache(start, stop) {
      return this.buffer.slice(start, stop + 1);} }]);return LocalStringFile;})(_AbstractFile3['default']);




module.exports = LocalStringFile; //content of this "File"