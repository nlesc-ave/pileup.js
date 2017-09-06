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
  strand: ?string;
  source: ?string;
  phase: ?string;
  attributes: ?string;

  constructor(feature: Object) {
   this.id = feature.id;
   this.featureType = feature.featureType;
   this.contig = feature.contig;
   this.start = feature.start;
   this.stop = feature.stop;
   this.score = feature.score;
   this.strand = feature.strand;
   this.source = feature.source;
   this.phase = feature.phase;
   this.attributes = feature.attributes;
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

  static fromBedFeature(f, fieldNames): Feature {
    var x = f.rest.split('\t');
    return new Feature({
      id: x[fieldNames.name],  // bed name column
      featureType: x[fieldNames.type], // 2nd extra field of bed6+4
      contig: f.contig,
      start: f.start,
      stop: f.stop,
      score: parseInt(x[fieldNames.score]), // bed score column
      strand: x[fieldNames.strand],
      source: x[fieldNames.source], 
      phase: x[fieldNames.phase], 
      attributes: x[fieldNames.attributes]
    });
  }

  intersects(range: ContigInterval<string>): boolean {
    return range.intersects(new ContigInterval(this.contig, this.start, this.stop));
  }
}

module.exports = Feature;
