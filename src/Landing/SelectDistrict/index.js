/*
 * Modified license boilerplate:
 *
 * Copyright (c) Hear Ye LLC and its affiliates
 *
 * This source code is licensed under the Apache 2.0 license found
 * in the LICENSE file in the root directory of this source tree.
 *
 ****************************************************************
 *
 * This file originally came from
 * https://github.com/Andrew-Chen-Wang/react-native-select-location-map-or-access
 * Its original license boilerplate:
 *
 * Copyright 2021 Andrew Chen Wang
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 ****************************************************************
 *
 * @format
 */

'use strict';
import React, {useRef, useState} from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {Navigation} from 'react-native-navigation';
import MapboxGL from '@react-native-mapbox-gl/maps';
import Config from 'react-native-config';

import Storage from '../../utils/components/Storage';
import {PressableOpacity} from '../../components/PressableOpacity';
import {Colors, Theme} from '../../utils';

MapboxGL.setAccessToken(Config.MAPBOX_TOKEN);

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(245,252,255,0.6)',
  },
  container: {
    height: '100%',
    width: '100%',
  },
  map: {
    flex: 1,
  },
  center: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinCenter: {
    top: -30, // adjust for pin
    left: 0,
    right: 0,
    bottom: 0,
  },
  locationCenter: {
    bottom: 44,
    left: 40,
  },
  imageSize: {
    height: 30,
    width: 30,
  },
  getConfirmationCenter: {
    bottom: 44,
    left: -20,
    right: 0,
  },
  getLocationCenter: {
    bottom: 44,
    right: 40,
  },
  centerText: {
    textAlign: 'center',
  },
});

const layerStyles = {
  districtsFill: {
    fillAntialias: true,
    fillColor: 'transparent',
  },
};

const districtsGeoJson = Config.MAP_DISTRICTS_SHAPE_URL;

/**
 * @async
 * @callback AsyncGetLocationCallback
 * @param center {Array<number>} coordinates at center of screen
 * @param districtProperties {Object} district properties
 * @param districtProperties.Code {string} the district code e.g. AK-AL / KS-01
 * @param districtProperties.District {string} the state and district
 * name verbose e.g. Kansas 1st
 */

/**
 * Creates a full page view with a map, location tracking
 * and district selection features.
 *
 * @param getLocationCallback {AsyncGetLocationCallback} function to give you
 * location and district properties at user selection. This callback is not for
 * user confirmation of selection.
 * @param componentId component ID from react native navigation
 * @return {JSX.Element} MapBox rendered view
 */
export default ({getLocationCallback, componentId}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const imageTintColor = isDarkMode ? 'white' : 'black';
  const imageColor = {tintColor: imageTintColor};
  const textColor = {color: imageTintColor};

  // For FillLayer
  const borderColor = isDarkMode ? 255 : 0;
  const [borderOpacity, setBorderOpacity] = useState('transparent');
  const borderLayerColor = {
    ...layerStyles.districtsFill,
    fillColor: borderOpacity,
    fillOutlineColor: `rgba(${borderColor}, ${borderColor}, ${borderColor}, 0.84)`,
  };

  const [followUser, setFollowUser] = useState(false);
  const locationImageTintColor = {
    tintColor: followUser
      ? Colors.cupertinoBlue
      : isDarkMode
      ? 'white'
      : 'black',
  };

  const mapRef = useRef();
  const cameraRef = useRef();

  const onUserMarkerUpdate = location => {
    if (followUser) {
      cameraRef.current.flyTo([
        location.coords.longitude,
        location.coords.latitude,
      ]);
    }
  };

  const followUserPress = () => {
    setFollowUser(_followUser => !_followUser);
  };

  const [districtProps, setDistrictProps] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const displayLocation = async () => {
    setFollowUser(false);

    const center = await mapRef.current.getCenter();
    // {"features": [{"geometry": [Object], "properties":
    // [Object], "type": "Feature"}], "type": "FeatureCollection"}
    const query = await mapRef.current.queryRenderedFeaturesAtPoint(
      await mapRef.current.getPointInView(center),
      null,
      ['districtsGeoFill'],
    );

    // Change opacity of the other layers to be dimmer and fill
    // the current district with whiter ish color.
    // https://docs.mapbox.com/ios/maps/examples/select-layer/
    if (query.features.length) {
      // {"Code": "KS-01", "District": "Kansas 1st"}
      const district = query.features[0].properties;
      setDistrictProps(district);
      setBorderOpacity([
        'case',
        ['==', ['get', 'Code'], district.Code],
        `rgba(${borderColor}, ${borderColor}, ${borderColor}, 0.24)`,
        'transparent',
      ]);

      if (getLocationCallback) {
        await getLocationCallback(center, district);
      }
      setShowConfirm(true);
    } else {
      Alert.alert('Invalid district');
    }
  };

  const sendRegistration = async () => {
    await Storage.set('district', districtProps);
    let [state, district] = districtProps.Code.split('-');
    if (district === 'AL') {
      district = 0;
    }
    try {
      await request('users/v1/finish-registration/', 'POST', {
        body: {state: state, district: district},
      });
      await Navigation.dismissModal(componentId);
    } catch (e) {
      console.debug(e);
      Alert.alert(
        'Invalid district (if your state was just redrawn, you may need to wait)',
      );
    }
  };

  const finalizeDistrict = () => {
    if (districtProps === null) {
      Alert.alert('You must select a district first!');
      return;
    }
    Alert.alert(
      'Confirm District',
      `You confirm that this is your district 
      (${districtProps.District}). Understand that you will not be able to 
      change your district for another 6 months (for security purposes).`,
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'OK', onPress: sendRegistration},
      ],
      {cancelable: true},
    );
  };

  return (
    <View style={styles.page}>
      <View style={styles.container}>
        <MapboxGL.MapView
          ref={mapRef}
          attributionPosition={{top: 14, left: 14}}
          style={styles.map}
          logoEnabled={false}
          styleURL={
            isDarkMode ? MapboxGL.StyleURL.Dark : MapboxGL.StyleURL.Street
          }>
          <MapboxGL.ShapeSource id="districtsGeoSource" url={districtsGeoJson}>
            <MapboxGL.FillLayer
              id="districtsGeoFill"
              style={borderLayerColor}
            />
          </MapboxGL.ShapeSource>
          <MapboxGL.Camera
            ref={cameraRef}
            defaultSettings={{
              centerCoordinate: [-100, 37.6396365],
              zoomLevel: 2.5,
            }}
          />
          <MapboxGL.UserLocation onUpdate={onUserMarkerUpdate} />
        </MapboxGL.MapView>
        <View
          style={[styles.center, styles.pinCenter]}
          pointerEvents="box-none">
          <Image
            style={[styles.imageSize, imageColor]}
            source={require('./pin/pin.png')}
          />
        </View>
        <View
          style={[styles.center, styles.locationCenter]}
          pointerEvents="box-none">
          <PressableOpacity
            style={[
              Theme.ROUND_BUTTON_STYLE,
              {backgroundColor: isDarkMode ? Colors.darker : Colors.white},
            ]}
            onPress={followUserPress}>
            <Image
              style={[styles.imageSize, locationImageTintColor]}
              source={require('./my-location/my-location.png')}
            />
          </PressableOpacity>
        </View>
        {showConfirm && (
          <View
            style={[styles.center, styles.getConfirmationCenter]}
            pointerEvents="box-none">
            <PressableOpacity
              style={[
                Theme.LARGE_ROUND_BUTTON_STYLE,
                {backgroundColor: Colors.red},
              ]}
              onPress={finalizeDistrict}>
              <Text style={[styles.centerText, {color: Colors.white}]}>
                Confirm District
              </Text>
            </PressableOpacity>
          </View>
        )}
        <View
          style={[styles.center, styles.getLocationCenter]}
          pointerEvents="box-none">
          <PressableOpacity
            style={[
              Theme.LARGE_ROUND_BUTTON_STYLE,
              {backgroundColor: isDarkMode ? Colors.darker : Colors.white},
            ]}
            onPress={displayLocation}>
            <Text style={[styles.centerText, textColor]}>Select Location</Text>
          </PressableOpacity>
        </View>
      </View>
    </View>
  );
};
