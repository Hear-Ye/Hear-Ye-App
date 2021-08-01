/*
 * Copyright (c) Hear Ye LLC and its affiliates
 *
 * This source code is licensed under the Apache 2.0 license found
 * in the LICENSE file in the root directory of this source tree.
 *
 * @format
 */

const BASE = 16,
  BUTTON_WIDTH = BASE * 9,
  BUTTON_HEIGHT = BASE * 2.75;

export const DEFAULT_BUTTON_STYLE = {
  borderRadius: 4,
  width: BUTTON_WIDTH,
  height: BUTTON_HEIGHT,
  alignItems: 'center',
  justifyContent: 'center',
  margin: 8,
};

// noinspection JSSuspiciousNameCombination
export const ROUND_BUTTON_STYLE = {
  ...DEFAULT_BUTTON_STYLE,
  ...{
    borderRadius: BASE * 2,
    width: BUTTON_HEIGHT,
    margin: 0,
  },
};

// noinspection JSSuspiciousNameCombination
export const LARGE_ROUND_BUTTON_STYLE = {
  ...ROUND_BUTTON_STYLE,
  ...{
    width: BUTTON_HEIGHT * 2,
  },
};

const SIZES = {
  font: 'Teko-Regular',

  BUTTON_WIDTH: BUTTON_WIDTH,
  BUTTON_HEIGHT: BUTTON_HEIGHT,
  BUTTON_SHADOW_RADIUS: 3,
  DEFAULT_BUTTON_STYLE: DEFAULT_BUTTON_STYLE,
  ROUND_BUTTON_STYLE: ROUND_BUTTON_STYLE,
  LARGE_ROUND_BUTTON_STYLE: LARGE_ROUND_BUTTON_STYLE,
  VERTICAL_PADDING: {
    marginVertical: 5,
  },
};

export default SIZES;
