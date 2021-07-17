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

import {Colors, dashboardNavigationRoot, Theme, Storage} from '../../utils';
import {PressableOpacity} from '../../components/PressableOpacity';
import Onboarding from './onboarding';
import {Authenticate, setToken} from '../../api/components/auth';
import {Navigation} from 'react-native-navigation';
import Config from 'react-native-config';

const height = Dimensions.get('screen').height;
const onboardedKey = 'onboarded-user-for-app';

const velnotaUrl = Config.VELNOTA_ISSUER_URL,
  configs = {
    velnota: {
      issuer: velnotaUrl,
      clientId: Config.VELNOTA_CLIENT_ID,
      redirectUrl: 'us.hearye.auth://velnota/login/callback/',
      usePKCE: true,
      scopes: ['openid'],
      serviceConfiguration: {
        authorizationEndpoint: `${velnotaUrl}/oauth/v1/authorize/`,
        tokenEndpoint: `${velnotaUrl}/oauth/v1/token/`,
        revocationEndpoint: `${velnotaUrl}/oauth/v1/revoke_token/`,
      },
    },
  };

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
      ...configs.velnota,
    });
  }, []);

  const handleAuthorize = React.useCallback(async () => {
    try {
      const newAuthState = await authorize(configs.velnota);
      await setToken('velnota_access', newAuthState.accessToken);
      await setToken('velnota_refresh', newAuthState.refreshToken);
      if (await Authenticate()) {
        await Navigation.setRoot(dashboardNavigationRoot);
      } else {
        Alert.alert('Failed to login');
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
          setModalVisible(!modalVisible);
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
                setModalVisible(!modalVisible);
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
