/**
 * Visualization of features, including exons and coding regions.
 * 
 */
'use strict';var _createClass = (function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};})();var _get = function get(_x, _x2, _x3) {var _again = true;_function: while (_again) {var object = _x, property = _x2, receiver = _x3;_again = false;if (object === null) object = Function.prototype;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {var parent = Object.getPrototypeOf(object);if (parent === null) {return undefined;} else {_x = parent;_x2 = property;_x3 = receiver;_again = true;desc = parent = undefined;continue _function;}} else if ('value' in desc) {return desc.value;} else {var getter = desc.get;if (getter === undefined) {return undefined;}return getter.call(receiver);}}};function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError('Cannot call a class as a function');}}function _inherits(subClass, superClass) {if (typeof superClass !== 'function' && superClass !== null) {throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}var _react = require(









'react');var _react2 = _interopRequireDefault(_react);var _shallowEquals = require(
'shallow-equals');var _shallowEquals2 = _interopRequireDefault(_shallowEquals);var _underscore = require(
'underscore');var _underscore2 = _interopRequireDefault(_underscore);var _d3utils = require(

'./d3utils');var _d3utils2 = _interopRequireDefault(_d3utils);var _RemoteRequest = require(
'../RemoteRequest');var _RemoteRequest2 = _interopRequireDefault(_RemoteRequest);var _ContigInterval = require(
'../ContigInterval');var _ContigInterval2 = _interopRequireDefault(_ContigInterval);var _canvasUtils = require(
'./canvas-utils');var _canvasUtils2 = _interopRequireDefault(_canvasUtils);var _TiledCanvas2 = require(
'./TiledCanvas');var _TiledCanvas3 = _interopRequireDefault(_TiledCanvas2);var _dataCanvas = require(
'data-canvas');var _dataCanvas2 = _interopRequireDefault(_dataCanvas);var _style = require(
'../style');var _style2 = _interopRequireDefault(_style);var _utils = require(
'../utils');var _utils2 = _interopRequireDefault(_utils);var 


FeatureTiledCanvas = (function (_TiledCanvas) {_inherits(FeatureTiledCanvas, _TiledCanvas);



  function FeatureTiledCanvas(source, options) {_classCallCheck(this, FeatureTiledCanvas);
    _get(Object.getPrototypeOf(FeatureTiledCanvas.prototype), 'constructor', this).call(this);
    this.source = source;
    this.options = options;}























  // Draw features
  _createClass(FeatureTiledCanvas, [{ key: 'update', value: function update(newOptions) {this.options = newOptions;} // TODO: can update to handle overlapping features
  }, { key: 'heightForRef', value: function heightForRef(ref) {return _style2['default'].VARIANT_HEIGHT;} }, { key: 'render', value: function render(ctx, scale, range, originalRange, resolution) {var relaxedRange = new _ContigInterval2['default'](range.contig, range.start() - 1, range.stop() + 1);var vFeatures = this.source.getFeaturesInRange(relaxedRange, resolution);renderFeatures(ctx, scale, relaxedRange, vFeatures);} }]);return FeatureTiledCanvas;})(_TiledCanvas3['default']);function renderFeatures(ctx, scale, 
range, 
features) {

  ctx.font = _style2['default'].GENE_FONT_SIZE + 'px ' + _style2['default'].GENE_FONT;
  ctx.textAlign = 'center';

  features.forEach(function (feature) {
    var position = new _ContigInterval2['default'](feature.contig, feature.start, feature.stop);
    if (!position.chrIntersects(range)) return;
    ctx.pushObject(feature);
    ctx.lineWidth = 1;

    // Create transparency value based on score. Score of <= 200 is the same transparency.
    var alphaScore = Math.max(feature.score / 1000.0, 0.2);
    ctx.fillStyle = 'rgba(0, 0, 0, ' + alphaScore + ')';

    var x = Math.round(scale(feature.start));
    var width = Math.ceil(scale(feature.stop) - scale(feature.start));
    ctx.fillRect(x - 0.5, 0, width, _style2['default'].VARIANT_HEIGHT);
    ctx.popObject();});}var 



FeatureTrack = (function (_React$Component) {_inherits(FeatureTrack, _React$Component);




  function FeatureTrack(props) {_classCallCheck(this, FeatureTrack);
    _get(Object.getPrototypeOf(FeatureTrack.prototype), 'constructor', this).call(this, props);
    this.state = { 
      networkStatus: null };}_createClass(FeatureTrack, [{ key: 'render', value: 



    function render() {
      var statusEl = null, 
      networkStatus = this.state.networkStatus;
      if (networkStatus) {
        statusEl = 
        _react2['default'].createElement('div', { ref: 'status', className: 'network-status-small' }, 
        _react2['default'].createElement('div', { className: 'network-status-message-small' }, 'Loading features…'));}





      var rangeLength = this.props.range.stop - this.props.range.start;
      // If range is too large, do not render 'canvas'
      if (rangeLength > _RemoteRequest2['default'].MONSTER_REQUEST) {
        return (
          _react2['default'].createElement('div', null, 
          _react2['default'].createElement('div', { className: 'center' }, 'Zoom in to see features'), 


          _react2['default'].createElement('canvas', { onClick: this.handleClick.bind(this) })));} else 


      {
        return (
          _react2['default'].createElement('div', null, 
          statusEl, 
          _react2['default'].createElement('div', { ref: 'container' }, 
          _react2['default'].createElement('canvas', { ref: 'canvas', onClick: this.handleClick.bind(this) }))));}} }, { key: 'componentDidMount', value: 






    function componentDidMount() {var _this = this;
      this.tiles = new FeatureTiledCanvas(this.props.source, this.props.options);

      // Visualize new reference data as it comes in from the network.
      this.props.source.on('newdata', function (range) {
        _this.tiles.invalidateRange(range);
        _this.updateVisualization();});

      this.props.source.on('networkprogress', function (e) {
        _this.setState({ networkStatus: e });});

      this.props.source.on('networkdone', function (e) {
        _this.setState({ networkStatus: null });});


      this.updateVisualization();} }, { key: 'getScale', value: 


    function getScale() {
      return _d3utils2['default'].getTrackScale(this.props.range, this.props.width);} }, { key: 'componentDidUpdate', value: 


    function componentDidUpdate(prevProps, prevState) {
      if (!(0, _shallowEquals2['default'])(this.props, prevProps) || 
      !(0, _shallowEquals2['default'])(this.state, prevState)) {
        this.tiles.update(this.props.options);
        this.tiles.invalidateAll();
        this.updateVisualization();}} }, { key: 'updateVisualization', value: 



    function updateVisualization() {
      var canvas = this.refs.canvas;var _props = 
      this.props;var width = _props.width;var height = _props.height;
      var genomeRange = this.props.range;

      var range = new _ContigInterval2['default'](genomeRange.contig, genomeRange.start, genomeRange.stop);

      // Hold off until height & width are known.
      if (width === 0 || typeof canvas == 'undefined') return;
      _d3utils2['default'].sizeCanvas(canvas, width, height);

      var ctx = _dataCanvas2['default'].getDataContext(_canvasUtils2['default'].getContext(canvas));
      ctx.reset();
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      this.tiles.renderToScreen(ctx, range, this.getScale());
      ctx.restore();} }, { key: 'handleClick', value: 



    function handleClick(reactEvent) {
      var ev = reactEvent.nativeEvent, 
      x = ev.offsetX;

      var genomeRange = this.props.range, 
      // allow some buffering so click isn't so sensitive
      range = new _ContigInterval2['default'](genomeRange.contig, genomeRange.start - 1, genomeRange.stop + 1), 
      scale = this.getScale(), 
      // leave padding of 2px to reduce click specificity
      clickStart = Math.floor(scale.invert(x)) - 2, 
      clickEnd = clickStart + 2, 
      // If click-tracking gets slow, this range could be narrowed to one
      // closer to the click coordinate, rather than the whole visible range.
      vFeatures = this.props.source.getFeaturesInRange(range);
      var feature = _underscore2['default'].find(vFeatures, function (f) {return _utils2['default'].tupleRangeOverlaps([[f.start], [f.stop]], [[clickStart], [clickEnd]]);});
      var alert = window.alert || console.log;
      if (feature) {
        // Construct a JSON object to show the user.
        var messageObject = _underscore2['default'].extend(
        { 
          'id': feature.id, 
          'range': feature.contig + ':' + feature.start + '-' + feature.stop, 
          'score': feature.score });

        alert(JSON.stringify(messageObject, null, '  '));}} }]);return FeatureTrack;})(_react2['default'].Component);




FeatureTrack.displayName = 'features';

module.exports = FeatureTrack;