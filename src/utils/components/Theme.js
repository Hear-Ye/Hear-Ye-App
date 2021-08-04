/*
 * Copyright (c) Hear Ye LLC and its affiliates
 *
 * This source code is licensed under the Apache 2.0 license found
 * in the LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import {StyleSheet} from 'react-native';

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

export const CENTER_STYLE = {alignItems: 'center', justifyContent: 'center'};

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

export const CENTER_BUTTON_CONTAINER = {
  width: '100%',
  height: '50%',
  ...CENTER_STYLE,
};

export const TOP_RIGHT_ICON = {};

const SIZES = {
  font: 'Teko-Regular',

  BUTTON_WIDTH: BUTTON_WIDTH,
  BUTTON_HEIGHT: BUTTON_HEIGHT,
  BUTTON_SHADOW_RADIUS: 3,
  DEFAULT_BUTTON_STYLE: DEFAULT_BUTTON_STYLE,
  ROUND_BUTTON_STYLE: ROUND_BUTTON_STYLE,
  LARGE_ROUND_BUTTON_STYLE: LARGE_ROUND_BUTTON_STYLE,
  CENTER_BUTTON_CONTAINER: CENTER_BUTTON_CONTAINER,
  CENTER_STYLE: CENTER_STYLE,
  VERTICAL_PADDING: {
    marginVertical: 5,
  },
  LARGE_VERTICAL_PADDING: {
    marginVertical: 12,
  },
  separator: {
    marginVertical: 8,
    borderBottomColor: '#737373',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
};

export default SIZES;
