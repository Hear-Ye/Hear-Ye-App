/*
 * Copyright (c) Hear Ye LLC and its affiliates
 *
 * This source code is licensed under the Apache 2.0 license found
 * in the LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

// Screen to display Representative stuff
// TODO Add Contributions graph like GitHub for a representative to show
//  how often they're voting alongside their party. Then another to show
//  how often with district. Basically the representative data
/**
 * @typedef {Object} RepresentativeInfo
 * @property {number} id server id for representative
 * @property {string} name representative name
 * @property {string} bioguide bioguide ID
 * @property {string} state representative' state
 * @property {(string|null)} district representative's district if one exists
 * @property {string} party the display name for the representative's party
 */
