/*
 * Copyright (c) Hear Ye LLC and its affiliates
 *
 * This source code is licensed under the Apache 2.0 license found
 * in the LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {WebView} from 'react-native-webview';
import {Navigation} from 'react-native-navigation';

import {handleWebViewStateChange} from '../../../utils/functions/webview';
import {PressableOpacity} from '../../../components/PressableOpacity';
import {Colors, Theme} from '../../../utils';

const sendInitialVote = async (component_id, topic_id, topic_title, vote) => {
  try {
    await request('voting/vote/', 'POST', {
      body: JSON.stringify({topic: topic_id, vote: vote}),
    });
    await Navigation.pop(component_id);
    await Navigation.push('DashboardStack', {
      component: {
        name: 'AnalyticsScreen',
        options: {
          topBar: {
            title: {
              text: topic_title,
            },
          },
        },
      },
    });
  } catch (e) {}
};

function generateHTML(html) {
  // Requires extra 3 <br>'s for some reason. Not sure how to reliably
  // get the scroll height of the document
  return `<!DOCTYPE html><html lang="en">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark light">
  <title></title>
  <style>
    body {
      word-wrap: break-word;
      overflow-wrap: break-word;
      font-size: 135%;
    }
    details > summary > * {
      display: inline;
    }
    summary {
      text-align: center;
      padding-top: 15px;
      padding-bottom: 15px;
      font-size: 1.3rem;
    }
    summary::after {
      content: " (Click Here!)"
    }
  </style>
</head>
<body>${html}<br><br><br></body>
</html>`;
}

// Sends the initial height; adds an event listener that'll continuously
// resize the scroll view to accommodate for dropdown menus (i.e. <details>)
const injectedJavascript = `
function getHeight() {
  return Math.max(
    document.body.scrollHeight, document.documentElement.scrollHeight,
    document.body.offsetHeight, document.documentElement.offsetHeight,
    document.body.clientHeight, document.documentElement.clientHeight
  );
}
let maxHeight = getHeight();
window.ReactNativeWebView.postMessage(maxHeight);

function _resize() {
  const newHeight = getHeight();
  if (newHeight > maxHeight) {
    maxHeight = newHeight;
    window.ReactNativeWebView.postMessage(maxHeight);
    return true;
  }
  return false;
}

for (const x of document.body.querySelectorAll("details")) {
  x.addEventListener("toggle", function() {
    const currentHeight = maxHeight, _key = "height-delta";
    if (this.hasAttribute("open") && _resize()) {
      this.setAttribute(_key, (maxHeight - currentHeight).toString());
    } else if (!this.hasAttribute("open") && this.hasAttribute(_key)) {
      const delta = parseInt(this.getAttribute(_key));
      maxHeight -= delta;
      window.ReactNativeWebView.postMessage(maxHeight);
    }
  });
}
`;

export default ({component_id, topic_id, topic_title}) => {
  // Solution for utilizing in ScrollView:
  // https://medium.com/@caphun/reactnative-why-your-webview-disappears-inside-scrollview-c6057c9ac6dd
  const [webViewHeight, setWebViewHeight] = useState(0);
  const onMessage = event => {
    setWebViewHeight(Number(event.nativeEvent.data));
    setLoading(false);
  };

  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState({});

  useEffect(() => {
    const getSummary = async () => {
      try {
        const response = await request(
          `content/topic/${topic_id}/?include_summary`,
          'GET',
        );
        setData(await response.json());
      } catch (e) {
        switch (e) {
          default:
            break;
        }
        setLoading(undefined);
      }
    };

    getSummary();
  }, [topic_id]);

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollView,
        {
          height: webViewHeight,
        },
      ]}>
      <WebView
        style={!isLoading || styles.transparentWebView}
        originWhitelist={['*']}
        source={{html: generateHTML(data.content)}}
        scrollEnabled={false}
        startInLoadingState={true}
        renderLoading={() => <ActivityIndicator size="large" />}
        onMessage={onMessage}
        injectedJavaScript={injectedJavascript}
        onNavigationStateChange={handleWebViewStateChange}
      />
      {!isLoading && (
        <View style={styles.buttonContainer}>
          <PressableOpacity
            onPress={() => {
              sendInitialVote(component_id, topic_id, topic_title, 1);
            }}
            style={[
              Theme.DEFAULT_BUTTON_STYLE,
              {backgroundColor: Colors.approve},
            ]}>
            <Text>👍 Approve</Text>
          </PressableOpacity>
          <PressableOpacity
            onPress={() => {
              sendInitialVote(component_id, topic_id, topic_title, 0);
            }}
            style={[Theme.DEFAULT_BUTTON_STYLE, {backgroundColor: Colors.red}]}>
            <Text style={{color: Colors.white}}>👎 Disapprove</Text>
          </PressableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transparentWebView: {flex: 0, height: 0, opacity: 0},
});
