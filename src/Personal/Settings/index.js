/*
 * Copyright (c) Hear Ye LLC and its affiliates
 *
 * This source code is licensed under the Apache 2.0 license found
 * in the LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import React, {useState} from 'react';
import {
  Button,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import Dialog from 'react-native-dialog';

import {DeleteLoggedInAccount, Logout} from '../../api/components/auth';
import {Colors, Theme} from '../../utils';

export default () => {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    width: '90%',
    borderRadius: 12,
    backgroundColor: isDarkMode ? Colors.darker : Colors.white,
  };
  const containerBackgroundStyle = {
    backgroundColor: isDarkMode ? Colors.black : Colors.light,
  };

  // Account delete
  const [showAccountDelete, setShowAccountDelete] = useState(false);
  const [accDeleteVal, setAccDeleteVal] = useState('');
  function handleCancel() {
    setShowAccountDelete(false);
  }
  function deleteAcc() {
    if (['delete', '"delete"'].includes(accDeleteVal.toLowerCase())) {
      DeleteLoggedInAccount();
    }
  }

  return (
    <ScrollView style={containerBackgroundStyle}>
      <Dialog.Container
        visible={showAccountDelete}
        onBackdropPress={handleCancel}>
        <Dialog.Title>Delete Account</Dialog.Title>
        <Dialog.Description>
          To delete the Hear Ye account, you must type "Delete"{'\n'}
          Note: your vote records will still be stored by a numeric ID, but your
          personal identity will be completely stripped. Your Velnota account
          will still be active, and you must delete your account on Velnota
          separately.
        </Dialog.Description>
        <Dialog.Input value={accDeleteVal} onChangeText={setAccDeleteVal} />
        <Dialog.Button label="Cancel" onPress={handleCancel} />
        <Dialog.Button label="Delete" onPress={deleteAcc} />
      </Dialog.Container>
      <View style={Theme.CENTER_STYLE}>
        <View
          style={[
            styles.sectionPadding,
            Theme.CENTER_BUTTON_CONTAINER,
            backgroundStyle,
          ]}>
          <Button color="red" title="Logout" onPress={Logout} />
        </View>
      </View>
      <View style={Theme.CENTER_STYLE}>
        <View
          style={[
            styles.sectionPadding,
            Theme.CENTER_BUTTON_CONTAINER,
            backgroundStyle,
          ]}>
          <Button
            color="red"
            title="Delete Account"
            onPress={() => {
              setShowAccountDelete(true);
            }}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  sectionPadding: {marginVertical: 12},
});
