/*
 * Copyright (c) Hear Ye LLC and its affiliates
 *
 * This source code is licensed under the Apache 2.0 license found
 * in the LICENSE file in the root directory of this source tree.
 *
 * @format
 */

/**
 * Original file is from
 * https://github.com/mrousavy/react-native-pressable-opacity/blob/master/src/PressableOpacity.tsx
 * with modifications of the file to make it JS-only compatible. The original
 * license text can be found at this specific commit's link:
 * https://github.com/mrousavy/react-native-pressable-opacity/blob/df3aca366faf65705162f43b2a14819bba1a4bb7/LICENSE
 *
 * MIT License
 *
 * Copyright (c) 2020 Marc Rousavy

 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import React, {useCallback} from 'react';
import {PressableProps, Pressable} from 'react-native';

export interface PressableOpacityProps extends PressableProps {
  /**
   * The opacity to use when `disabled={true}`
   *
   * @default 0.3
   */
  disabledOpacity?: number;
  /**
   * The opacity to animate to when the user presses the button
   *
   * @default 0.2
   */
  activeOpacity?: number;
}

export function PressableOpacity({
  style,
  disabled = false,
  disabledOpacity = 0.3,
  activeOpacity = 0.5,
  ...passThroughProps
}) {
  const getOpacity = useCallback(
    (pressed: boolean) => {
      return disabled ? disabledOpacity : pressed ? activeOpacity : 1;
    },
    [activeOpacity, disabled, disabledOpacity],
  );
  const _style = useCallback(
    ({pressed}) => [style, {opacity: getOpacity(pressed)}],
    [getOpacity, style],
  );

  return <Pressable style={_style} disabled={disabled} {...passThroughProps} />;
}
