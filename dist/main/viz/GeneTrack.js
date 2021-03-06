/**
 * Visualization of genes, including exons and coding regions.
 * 
 */
'use strict';var _createClass = (function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};})();var _get = function get(_x, _x2, _x3) {var _again = true;_function: while (_again) {var object = _x, property = _x2, receiver = _x3;_again = false;if (object === null) object = Function.prototype;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {var parent = Object.getPrototypeOf(object);if (parent === null) {return undefined;} else {_x = parent;_x2 = property;_x3 = receiver;_again = true;desc = parent = undefined;continue _function;}} else if ('value' in desc) {return desc.value;} else {var getter = desc.get;if (getter === undefined) {return undefined;}return getter.call(receiver);}}};function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError('Cannot call a class as a function');}}function _inherits(subClass, superClass) {if (typeof superClass !== 'function' && superClass !== null) {throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}var _react = require(






'react');var _react2 = _interopRequireDefault(_react);var _reactDom = require(
'react-dom');var _reactDom2 = _interopRequireDefault(_reactDom);var _underscore = require(
'underscore');var _underscore2 = _interopRequireDefault(_underscore);var _shallowEquals = require(
'shallow-equals');var _shallowEquals2 = _interopRequireDefault(_shallowEquals);var _dataBedtools = require(

'../data/bedtools');var _dataBedtools2 = _interopRequireDefault(_dataBedtools);var _Interval = require(
'../Interval');var _Interval2 = _interopRequireDefault(_Interval);var _d3utils = require(
'./d3utils');var _d3utils2 = _interopRequireDefault(_d3utils);var _scale = require(
'../scale');var _scale2 = _interopRequireDefault(_scale);var _ContigInterval = require(
'../ContigInterval');var _ContigInterval2 = _interopRequireDefault(_ContigInterval);var _canvasUtils = require(
'./canvas-utils');var _canvasUtils2 = _interopRequireDefault(_canvasUtils);var _dataCanvas = require(
'data-canvas');var _dataCanvas2 = _interopRequireDefault(_dataCanvas);var _style = require(
'../style');var _style2 = _interopRequireDefault(_style);


// Draw an arrow in the middle of the visible portion of range.
function drawArrow(ctx, 
clampedScale, 
range, 
tipY, 
strand) {
  var x1 = clampedScale(1 + range.start), 
  x2 = clampedScale(1 + range.stop);

  // it's off-screen or there's not enough room to draw it legibly.
  if (x2 - x1 <= 2 * _style2['default'].GENE_ARROW_SIZE) return;

  var cx = (x1 + x2) / 2;
  ctx.beginPath();
  if (strand == '-') {
    ctx.moveTo(cx + _style2['default'].GENE_ARROW_SIZE, tipY - _style2['default'].GENE_ARROW_SIZE);
    ctx.lineTo(cx, tipY);
    ctx.lineTo(cx + _style2['default'].GENE_ARROW_SIZE, tipY + _style2['default'].GENE_ARROW_SIZE);} else 
  {
    ctx.moveTo(cx - _style2['default'].GENE_ARROW_SIZE, tipY - _style2['default'].GENE_ARROW_SIZE);
    ctx.lineTo(cx, tipY);
    ctx.lineTo(cx - _style2['default'].GENE_ARROW_SIZE, tipY + _style2['default'].GENE_ARROW_SIZE);}

  ctx.stroke();}


function drawGeneName(ctx, 
clampedScale, 
geneLineY, 
gene, 
textIntervals) {
  var p = gene.position, 
  centerX = 0.5 * (clampedScale(1 + p.start()) + clampedScale(1 + p.stop()));
  var name = gene.name || gene.id;
  var textWidth = ctx.measureText(name).width;
  var textInterval = new _Interval2['default'](centerX - 0.5 * textWidth, 
  centerX + 0.5 * textWidth);
  if (!_underscore2['default'].any(textIntervals, function (iv) {return textInterval.intersects(iv);})) {
    textIntervals.push(textInterval);
    var baselineY = geneLineY + _style2['default'].GENE_FONT_SIZE + _style2['default'].GENE_TEXT_PADDING;
    ctx.fillText(name, centerX, baselineY);}}var 



GeneTrack = (function (_React$Component) {_inherits(GeneTrack, _React$Component);



  function GeneTrack(props) {_classCallCheck(this, GeneTrack);
    _get(Object.getPrototypeOf(GeneTrack.prototype), 'constructor', this).call(this, props);
    this.state = { 
      genes: [] };}_createClass(GeneTrack, [{ key: 'render', value: 



    function render() {
      return _react2['default'].createElement('canvas', { onClick: this.handleClick.bind(this) });} }, { key: 'componentDidMount', value: 


    function componentDidMount() {var _this = this;
      // Visualize new reference data as it comes in from the network.
      this.props.source.on('newdata', function (range) {
        _this.setState({ 
          genes: _this.props.source.getFeaturesInRange(range) });});



      this.updateVisualization();} }, { key: 'getScale', value: 


    function getScale() {
      return _d3utils2['default'].getTrackScale(this.props.range, this.props.width);} }, { key: 'componentDidUpdate', value: 


    function componentDidUpdate(prevProps, prevState) {
      if (!(0, _shallowEquals2['default'])(prevProps, this.props) || 
      !(0, _shallowEquals2['default'])(prevState, this.state)) {
        this.updateVisualization();}} }, { key: 'updateVisualization', value: 



    function updateVisualization() {
      var canvas = _reactDom2['default'].findDOMNode(this);var _props = 
      this.props;var width = _props.width;var height = _props.height;

      // Hold off until height & width are known.
      if (width === 0) return;

      _d3utils2['default'].sizeCanvas(canvas, width, height);
      var ctx = _canvasUtils2['default'].getContext(canvas);
      var dtx = _dataCanvas2['default'].getDataContext(ctx);
      this.renderScene(dtx);} }, { key: 'renderScene', value: 


    function renderScene(ctx) {var _props2 = 
      this.props;var width = _props2.width;var height = _props2.height;
      var genomeRange = this.props.range;

      var range = new _ContigInterval2['default'](genomeRange.contig, genomeRange.start, genomeRange.stop);

      // Hold off until height & width are known.
      if (width === 0) return;

      var sc = this.getScale(), 
      // We can't clamp scale directly because of offsetPx.
      clampedScale = _scale2['default'].linear().
      domain([sc.invert(0), sc.invert(width)]).
      range([0, width]).
      clamp(true);

      ctx.reset();
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      var geneLineY = Math.round(height / 4);
      var textIntervals = []; // x-intervals with rendered gene names, to avoid over-drawing.
      // TODO: don't pull in genes via state.
      ctx.font = _style2['default'].GENE_FONT_SIZE + 'px ' + _style2['default'].GENE_FONT;
      ctx.textAlign = 'center';
      this.state.genes.forEach(function (gene) {
        if (!gene.position.chrIntersects(range)) return;
        ctx.pushObject(gene);
        ctx.lineWidth = 1;
        ctx.strokeStyle = _style2['default'].GENE_COLOR;
        ctx.fillStyle = _style2['default'].GENE_COLOR;

        _canvasUtils2['default'].drawLine(ctx, clampedScale(1 + gene.position.start()), geneLineY + 0.5, 
        clampedScale(1 + gene.position.stop()), geneLineY + 0.5);

        // TODO: only compute all these intervals when data becomes available.
        var exons = _dataBedtools2['default'].splitCodingExons(gene.exons, gene.codingRegion);
        exons.forEach(function (exon) {
          ctx.fillRect(sc(1 + exon.start), 
          geneLineY - 3 * (exon.isCoding ? 2 : 1), 
          sc(exon.stop + 2) - sc(1 + exon.start), 
          6 * (exon.isCoding ? 2 : 1));});


        var introns = gene.position.interval.complementIntervals(gene.exons);
        introns.forEach(function (range) {
          drawArrow(ctx, clampedScale, range, geneLineY + 0.5, gene.strand);});

        ctx.strokeStyle = _style2['default'].GENE_COMPLEMENT_COLOR;
        ctx.lineWidth = 2;
        gene.exons.forEach(function (range) {
          drawArrow(ctx, clampedScale, range, geneLineY + 0.5, gene.strand);});


        drawGeneName(ctx, clampedScale, geneLineY, gene, textIntervals);

        ctx.popObject();});} }, { key: 'handleClick', value: 



    function handleClick(reactEvent) {
      var ev = reactEvent.nativeEvent, 
      x = ev.offsetX, 
      y = ev.offsetY, 
      canvas = _reactDom2['default'].findDOMNode(this), 
      ctx = _canvasUtils2['default'].getContext(canvas), 
      trackingCtx = new _dataCanvas2['default'].ClickTrackingContext(ctx, x, y);
      this.renderScene(trackingCtx);
      if (trackingCtx.hit && trackingCtx.hit.length > 0) {
        //user provided function for displaying popup
        if (typeof this.props.options.onGeneClicked === "function") {
          this.props.options.onGeneClicked(trackingCtx.hit);} else 
        {
          console.log("Genes clicked: ", trackingCtx.hit);}}} }]);return GeneTrack;})(_react2['default'].Component);





GeneTrack.displayName = 'genes';

module.exports = GeneTrack;