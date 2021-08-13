/*
 * Copyright (c) Hear Ye LLC and its affiliates
 *
 * This source code is licensed under the Apache 2.0 license found
 * in the LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';
import React from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  Modal,
  Linking,
  Dimensions,
  useColorScheme,
  Alert,
} from 'react-native';
import {authorize, prefetchConfiguration} from 'react-native-app-auth';
import {Navigation} from 'react-native-navigation';
import Config from 'react-native-config';
import LinearGradient from 'react-native-linear-gradient';

import {Colors, dashboardNavigationRoot, Theme, Storage} from '../../utils';
import {PressableOpacity} from '../../components/PressableOpacity';
import Onboarding from './onboarding';
import {
  Authenticate,
  setToken,
  userStillNeeds,
  socialConfigs,
} from '../../api/components/auth';

const height = Dimensions.get('screen').height;
const onboardedKey = 'onboarded-user-for-app';

// The Stop talking image came from
// https://www.pexels.com/photo/woman-in-black-shirt-holding-yellow-and-black-no-smoking-sign-2372440/
const LandingScreen = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [modalVisible, setModalVisible] = React.useState(false);

  React.useEffect(() => {
    setModalVisible(!Storage.getBoolean(onboardedKey));
    // noinspection JSIgnoredPromiseFromCall
    prefetchConfiguration({
      warmAndPrefetchChrome: true,
      ...socialConfigs.velnota,
    });
  }, []);

  const handleAuthorize = React.useCallback(async () => {
    try {
      const newAuthState = await authorize(socialConfigs.velnota);
      await setToken('velnota_access', newAuthState.accessToken);
      await setToken('velnota_refresh', newAuthState.refreshToken);
      // Finish registration process by showing a bunch of modals.
      // once we pop all numbers from the array, we can finally show app
      const data = userStillNeeds(await Authenticate());
      if (typeof data === 'boolean') {
        if (data) {
          await Navigation.setRoot(dashboardNavigationRoot);
        } else {
          Alert.alert('Failed to login. Please try again.');
        }
      } else {
        // The way this works is that we have an array with what to do.
        // We create modals that set configuration values until there's
        // nothing left to do... Except I just want to get this published
        // so instead I'm just going to show a modal lmao
        if (data.includes(1)) {
          await Navigation.showModal({
            stack: {
              children: [
                {
                  component: {
                    name: 'SELECT_DISTRICT_MODAL',
                    options: {
                      topBar: {
                        title: {
                          text: 'Select your current district',
                        },
                      },
                      hardwareBackButton: {
                        dismissModalOnPress: false,
                      },
                      modal: {
                        swipeToDismiss: false,
                      },
                    },
                  },
                },
              ],
            },
          });
        } else {
          await Navigation.setRoot(dashboardNavigationRoot);
        }
      }
    } catch (e) {}
  }, []);

  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        presentationStyle="pageSheet"
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}>
        <Onboarding
          onDone={() => {
            setModalVisible(false);
          }}
        />
      </Modal>
      <ImageBackground
        accessibilityRole="image"
        source={require('./stop-talking.jpg')}
        style={[
          styles.background,
          {
            backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
          },
        ]}
        imageStyle={styles.image}>
        <LinearGradient
          style={styles.linearGradient}
          locations={[0.04, 0.5]}
          colors={[Colors.black, 'rgba(0, 0, 0, 0)']}>
          <View style={[styles.padded, {bottom: height / 2}]}>
            <Text
              style={[
                styles.text,
                {
                  color: isDarkMode ? Colors.white : Colors.black,
                },
              ]}>
              Hear Ye!
            </Text>
          </View>
          <View style={styles.padded}>
            <Text
              style={[
                styles.text,
                styles.smallFontSize,
                {
                  color: isDarkMode ? Colors.white : Colors.black,
                },
              ]}>
              Because We Should Be Talking
            </Text>
          </View>
          <View style={[styles.padded, styles.buttonGroup]}>
            <View>
              <PressableOpacity
                onPress={() => {
                  handleAuthorize();
                }}
                style={[
                  Theme.DEFAULT_BUTTON_STYLE,
                  {backgroundColor: Colors.primary},
                ]}>
                <Text style={{color: Colors.white}}>Login</Text>
              </PressableOpacity>
            </View>
            <View>
              <PressableOpacity
                onPress={async () => {
                  await Linking.openURL(
                    `${Config.VELNOTA_ISSUER_URL}/accounts/register/` +
                      '?invite=hear-ye-0001&project=Hear%20Ye',
                  );
                }}
                style={[
                  Theme.DEFAULT_BUTTON_STYLE,
                  {backgroundColor: Colors.red},
                ]}>
                <Text style={{color: Colors.white}}>Register</Text>
              </PressableOpacity>
            </View>
            <View>
              <PressableOpacity
                onPress={async () => {
                  setModalVisible(vis => !vis);
                  await Storage.set(onboardedKey, true);
                }}
                style={[
                  Theme.ROUND_BUTTON_STYLE,
                  {backgroundColor: Colors.light},
                ]}>
                <Text style={{color: Colors.dark}}>?</Text>
              </PressableOpacity>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    height: '100%',
    width: '100%',
    zIndex: 1,
  },
  padded: {
    position: 'absolute',
    zIndex: 2,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    opacity: 0.3,
    overflow: 'visible',
    resizeMode: 'cover',
    marginLeft: -128,
    marginBottom: -132,
  },
  linearGradient: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  text: {
    fontSize: 70,
    fontFamily: Theme.font,
    fontWeight: '900',
    textAlign: 'center',
  },
  smallFontSize: {
    fontSize: 35,
  },
  buttonGroup: {
    flexDirection: 'row',
    top: height / 2,
  },
});

export default LandingScreen;
