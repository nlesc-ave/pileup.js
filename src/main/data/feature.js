/**
 * Class for parsing features.
 * @flow
 */
'use strict';

import ContigInterval from '../ContigInterval';

class Feature {
  id: string;
  featureType: string;
  contig: string;
  start: number;
  stop: number;
  score: number;

  constructor(feature: Object) {
   this.id = feature.id;
   this.featureType = feature.featureType;
   this.contig = feature.contig;
   this.start = feature.start;
   this.stop = feature.stop;
   this.score = feature.score;
  }

  static fromGA4GH(ga4ghFeature: Object): Feature {
   return new Feature(
     {
      id: ga4ghFeature.id,
      featureType: ga4ghFeature.featureType,
      contig: ga4ghFeature.referenceName,
      start: ga4ghFeature.start,
      stop: ga4ghFeature.end,
      score: 1000
    });
  }

  static fromBedFeature(f): Feature {
    var x = f.rest.split('\t');
    return new Feature({
      id: x[0],  // bed name column
      featureType: x[4], // 2nd extra field of bed6+4
      contig: f.contig,
      start: f.start,
      stop: f.stop,
      score: x[1], // bed score column
    });
  }

  intersects(range: ContigInterval<string>): boolean {
    return range.intersects(new ContigInterval(this.contig, this.start, this.stop));
  }
}

module.exports = Feature;
