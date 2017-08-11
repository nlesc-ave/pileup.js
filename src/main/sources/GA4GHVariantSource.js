/**
 * A data source which implements the GA4GH Variant protocol.
 * @flow
 */
'use strict';

import _ from 'underscore';
import {Events} from 'backbone';

import ContigInterval from '../ContigInterval';

import type {VcfDataSource} from './VcfDataSource';
import {Variant} from '../data/variant';

var BASE_PAIRS_PER_FETCH = 100;
var VARIANTS_PER_REQUEST = 400;
var ZERO_BASED = false;

type GA4GHVariantSpec = {
  endpoint: string;
  variantSetId: string;
  callSetIds: string[];
  // HACK for demo. If true, strips "chr" from reference names. If false, adds chr.
  killChr: boolean;
};

function create(spec: GA4GHVariantSpec): VcfDataSource {
  var url = spec.endpoint + '/variants/search';

  var variants: {[key:string]: Variant} = {};

  // Ranges for which we have complete information -- no need to hit network.
  var coveredRanges: ContigInterval<string>[] = [];

  function addVariantsFromResponse(response: Object) {
    if (response.variants === undefined) {
      return;
    }

    response.variants.forEach(ga4ghVariant => {
      var key = ga4ghVariant.id;
      if (key in variants) return;

      var variant = Variant.fromGA4GH(ga4ghVariant);
      variants[key] = variant;
    });
  }

  function rangeChanged(newRange: GenomeRange) {
    var contig = newRange.contig.replace(/^chr/, '');
    if (!spec.killChr) {
      contig = `chr${contig}`;
    }
    var interval = new ContigInterval(contig, newRange.start, newRange.stop);

    if (interval.isCoveredBy(coveredRanges)) return;

    interval = interval.round(BASE_PAIRS_PER_FETCH, ZERO_BASED);

    // select only intervals not yet loaded into coveredRangesß
    var intervals = interval.complementIntervals(coveredRanges);

    // We "cover" the interval immediately (before the reads have arrived) to
    // prevent duplicate network requests.
    coveredRanges.push(interval);
    coveredRanges = ContigInterval.coalesce(coveredRanges);

    intervals.forEach(i => {
      fetchVariantsForInterval(i, null, 1 /* first request */);
    });
  }

  function notifyFailure(message: string) {
    o.trigger('networkfailure', message);
    o.trigger('networkdone');
    console.warn(message);
  }

  function fetchVariantsForInterval(range: ContigInterval<string>,
                                      pageToken: ?string,
                                      numRequests: number) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.responseType = 'json';
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.addEventListener('load', function(e) {
      var response = this.response;
      if (this.status >= 400) {
        notifyFailure(this.status + ' ' + this.statusText + ' ' + JSON.stringify(response));
      } else {
        if (response.errorCode) {
          notifyFailure('Error from GA4GH Variant endpoint: ' + JSON.stringify(response));
        } else {
          addVariantsFromResponse(response);
          o.trigger('newdata', range);  // display data as it comes in.
          if (response.nextPageToken) {
            fetchVariantsForInterval(range, response.nextPageToken, numRequests + 1);
          } else {
            o.trigger('networkdone');
          }
        }
      }
    });
    xhr.addEventListener('error', function(e) {
      notifyFailure('Request failed with status: ' + this.status);
    });

    o.trigger('networkprogress', {numRequests});
    xhr.send(JSON.stringify({
      variantSetId: spec.variantSetId,
      pageToken: pageToken,
      pageSize: VARIANTS_PER_REQUEST,
      referenceName: range.contig,
      callSetIds: spec.callSetIds,
      start: range.start(),
      end: range.stop()
    }));
  }

  function getFeaturesInRange(range: ContigInterval<string>): Variant[] {
    if (!range) return [];

    var contig = range.contig.replace(/^chr/, '');
    if (!spec.killChr) {
      contig = `chr${contig}`;
    }
    range = new ContigInterval(contig, range.start(), range.stop());

    return _.filter(variants, variant => intersects(variant, range));
  }

  var o = {
    rangeChanged,
    getFeaturesInRange,

    // These are here to make Flow happy.
    on: () => {},
    once: () => {},
    off: () => {},
    trigger: () => {}
  };
  _.extend(o, Events);  // Make this an event emitter
  return o;
}

function intersects(variant: Variant, range: ContigInterval<string>): boolean {
  var thisRange = new ContigInterval(variant.contig, variant.position, variant.position + 1);
  return range.intersects(thisRange);
}

module.exports = {
  create,
  intersects
};
