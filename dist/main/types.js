/**
 * Common types used in many modules.
 *
 * Flow makes it difficult for a module to export both symbols and types. This
 * module serves as a dumping ground for types which we'd really like to export
 * from other modules.
 *
 * 
 */
'use strict';

// Public API
Object.defineProperty(exports, '__esModule', { value: true });
















































// BAM/BAI parsing
var AllelFrequencyStrategy = { Minor: { name: "Minor" }, Major: { name: "Major" } };exports.AllelFrequencyStrategy = AllelFrequencyStrategy; // for css class and options
/*
TODO(danvk): kill types/types.js and use this
export type GenomeRange = {
  contig: string;
  start: number;  // inclusive
  stop: number;  // inclusive
}
*/ // src/utils.js
// This is a DataSource object
// data source