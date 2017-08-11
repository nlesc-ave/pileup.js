/**
 * This exposes the main entry point into pileup.js.
 * 
 */
'use strict';function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}var _types = require(


'./types');var _underscore = require(

'underscore');var _underscore2 = _interopRequireDefault(_underscore);var _react = require(
'react');var _react2 = _interopRequireDefault(_react);var _reactDom = require(
'react-dom');var _reactDom2 = _interopRequireDefault(_reactDom);

// Data sources
var _sourcesTwoBitDataSource = require('./sources/TwoBitDataSource');var _sourcesTwoBitDataSource2 = _interopRequireDefault(_sourcesTwoBitDataSource);var _sourcesBigBedDataSource = require(
'./sources/BigBedDataSource');var _sourcesBigBedDataSource2 = _interopRequireDefault(_sourcesBigBedDataSource);var _sourcesVcfDataSource = require(
'./sources/VcfDataSource');var _sourcesVcfDataSource2 = _interopRequireDefault(_sourcesVcfDataSource);var _sourcesBamDataSource = require(
'./sources/BamDataSource');var _sourcesBamDataSource2 = _interopRequireDefault(_sourcesBamDataSource);var _sourcesEmptySource = require(
'./sources/EmptySource');var _sourcesEmptySource2 = _interopRequireDefault(_sourcesEmptySource);

// Data sources from json
var _jsonGA4GHAlignmentJson = require('./json/GA4GHAlignmentJson');var _jsonGA4GHAlignmentJson2 = _interopRequireDefault(_jsonGA4GHAlignmentJson);var _jsonGA4GHVariantJson = require(
'./json/GA4GHVariantJson');var _jsonGA4GHVariantJson2 = _interopRequireDefault(_jsonGA4GHVariantJson);var _jsonGA4GHFeatureJson = require(
'./json/GA4GHFeatureJson');var _jsonGA4GHFeatureJson2 = _interopRequireDefault(_jsonGA4GHFeatureJson);

// GA4GH sources
var _sourcesGA4GHAlignmentSource = require('./sources/GA4GHAlignmentSource');var _sourcesGA4GHAlignmentSource2 = _interopRequireDefault(_sourcesGA4GHAlignmentSource);var _sourcesGA4GHVariantSource = require(
'./sources/GA4GHVariantSource');var _sourcesGA4GHVariantSource2 = _interopRequireDefault(_sourcesGA4GHVariantSource);var _sourcesGA4GHFeatureSource = require(
'./sources/GA4GHFeatureSource');var _sourcesGA4GHFeatureSource2 = _interopRequireDefault(_sourcesGA4GHFeatureSource);

// Visualizations
var _vizCoverageTrack = require('./viz/CoverageTrack');var _vizCoverageTrack2 = _interopRequireDefault(_vizCoverageTrack);var _vizGenomeTrack = require(
'./viz/GenomeTrack');var _vizGenomeTrack2 = _interopRequireDefault(_vizGenomeTrack);var _vizGeneTrack = require(
'./viz/GeneTrack');var _vizGeneTrack2 = _interopRequireDefault(_vizGeneTrack);var _vizFeatureTrack = require(
'./viz/FeatureTrack');var _vizFeatureTrack2 = _interopRequireDefault(_vizFeatureTrack);var _vizLocationTrack = require(
'./viz/LocationTrack');var _vizLocationTrack2 = _interopRequireDefault(_vizLocationTrack);var _vizPileupTrack = require(
'./viz/PileupTrack');var _vizPileupTrack2 = _interopRequireDefault(_vizPileupTrack);var _vizScaleTrack = require(
'./viz/ScaleTrack');var _vizScaleTrack2 = _interopRequireDefault(_vizScaleTrack);var _vizVariantTrack = require(
'./viz/VariantTrack');var _vizVariantTrack2 = _interopRequireDefault(_vizVariantTrack);var _Root = require(
'./Root');var _Root2 = _interopRequireDefault(_Root);






















function findReference(tracks) {
  return _underscore2['default'].find(tracks, function (t) {return !!t.track.isReference;});}


function create(elOrId, params) {
  var el = typeof elOrId == 'string' ? document.getElementById(elOrId) : elOrId;
  if (!el) {
    throw new Error('Attempted to create pileup with non-existent element ' + elOrId);}


  var vizTracks = params.tracks.map(function (track) {
    var source = track.data ? track.data : track.viz.component.defaultSource;
    if (!source) {
      throw new Error(
      'Track \'' + track.viz.component.displayName + '\' doesn\'t have a default ' + 'data source; you must specify one when initializing it.');}




    return { visualization: track.viz, source: source, track: track };});


  var referenceTrack = findReference(vizTracks);
  if (!referenceTrack) {
    throw new Error('You must include at least one track with type=reference');}


  var reactElement = 
  _reactDom2['default'].render(_react2['default'].createElement(_Root2['default'], { referenceSource: referenceTrack.source, 
    tracks: vizTracks, 
    initialRange: params.range }), el);

  //if the element doesn't belong to document DOM observe DOM to detect
  //when it's attached
  var observer = null;

  if (!document.body.contains(el)) {
    observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === 'childList') {
          var added = false;
          for (var i = 0; i < mutation.addedNodes.length; i++) {
            //when added element is element where we visualize pileup
            //or it contains element where we visualize pileup
            //then we will have to update component
            if (mutation.addedNodes[i] === el || mutation.addedNodes[i].contains(el)) {
              added = true;}}


          if (added) {
            if (reactElement) {
              reactElement.setState({ updateSize: true });} else 
            {
              throw 'ReactElement was not initialized properly';}}}});});





    // configuration of the observer:
    var config = { attributes: true, childList: true, characterData: true, subtree: true };

    // start observing document
    observer.observe(document, config);}


  return { 
    setRange: function setRange(range) {
      if (reactElement === null) {
        throw 'Cannot call setRange on a destroyed pileup';}

      reactElement.handleRangeChange(range);}, 

    getRange: function getRange() {
      if (reactElement === null) {
        throw 'Cannot call setRange on a destroyed pileup';}

      return _underscore2['default'].clone(reactElement.state.range);}, 

    destroy: function destroy() {
      if (!vizTracks) {
        throw 'Cannot call destroy() twice on the same pileup';}

      vizTracks.forEach(function (_ref) {var source = _ref.source;
        source.off();});

      _reactDom2['default'].unmountComponentAtNode(el);
      reactElement = null;
      referenceTrack = null;
      vizTracks = null;

      // disconnect observer if it was created
      if (observer !== null && observer !== undefined) {
        observer.disconnect();}} };}







function makeVizObject(component) {
  return function (options) {
    options = _underscore2['default'].extend({}, component.defaultOptions, options);
    return { component: component, options: options };};}



var pileup = { 
  create: create, 
  formats: { 
    bam: _sourcesBamDataSource2['default'].create, 
    alignmentJson: _jsonGA4GHAlignmentJson2['default'].create, 
    variantJson: _jsonGA4GHVariantJson2['default'].create, 
    featureJson: _jsonGA4GHFeatureJson2['default'].create, 
    vcf: _sourcesVcfDataSource2['default'].create, 
    twoBit: _sourcesTwoBitDataSource2['default'].create, 
    bigBed: _sourcesBigBedDataSource2['default'].create, 
    GAReadAlignment: _sourcesGA4GHAlignmentSource2['default'].create, 
    GAVariant: _sourcesGA4GHVariantSource2['default'].create, 
    GAFeature: _sourcesGA4GHFeatureSource2['default'].create, 
    empty: _sourcesEmptySource2['default'].create }, 

  viz: { 
    coverage: makeVizObject(_vizCoverageTrack2['default']), 
    genome: makeVizObject(_vizGenomeTrack2['default']), 
    genes: makeVizObject(_vizGeneTrack2['default']), 
    features: makeVizObject(_vizFeatureTrack2['default']), 
    location: makeVizObject(_vizLocationTrack2['default']), 
    scale: makeVizObject(_vizScaleTrack2['default']), 
    variants: makeVizObject(_vizVariantTrack2['default']), 
    pileup: makeVizObject(_vizPileupTrack2['default']) }, 

  'enum': { 
    variants: { 
      allelFrequencyStrategy: _types.AllelFrequencyStrategy } }, 


  version: '0.6.8' };


module.exports = pileup;

// Export a global until the distributed package works with CommonJS
// See https://github.com/hammerlab/pileup.js/issues/136
if (typeof window !== 'undefined') {
  window.pileup = pileup;}