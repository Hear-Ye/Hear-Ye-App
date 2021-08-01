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
  useColorScheme,
  View,
} from 'react-native';
import {WebView} from 'react-native-webview';

import {handleWebViewStateChange} from '../../../utils/functions/webview';
import {PressableOpacity} from '../../../components/PressableOpacity';
import Analytics from './Analytics';
import {Colors, Theme} from '../../../utils';

const sendInitialVote = async (topic_id, vote, voteCbs) => {
  // server automatically handles whether it was initial or updated vote
  try {
    await request('voting/vote/', 'POST', {
      body: JSON.stringify({topic: topic_id, vote: vote}),
    });
    voteCbs.forEach(voteCb => {
      voteCb(vote);
    });
  } catch (e) {}
};

function generateHTML(html) {
  // Requires extra <br>'s for some reason. Not sure how to reliably
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

/**
 * @typedef {Object} TopicInfo topic information
 * @property {string} created ISO8601 string for when the topic was created/
 * when we published this summary
 * @property {string} title topic title
 * @property {(number|null)} user_vote user vote as an integer or null
 * @property {Object.<string, number>} total_district_votes each key has a
 * prefix district_total_X where X represents the vote type as an integer and
 * value is number of votes.
 * @property {Object.<string, number>} total_votes like total_district_votes, keys
 * follow same pattern but it's total_X.
 */

/**
 * Summary/Analytics Screen from Dashboard to here.
 * @param topic_id {number} topic id
 * @param topic {TopicInfo} topic information
 * @param voteCb {function} callback to dashboard to update the SummaryCard
 * @param componentId component ID from React Native Navigation
 * @returns {JSX.Element}
 */
export default ({topic_id, topic, voteCb, componentId}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const textColor = isDarkMode ? Colors.white : Colors.black;
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.light,
  };
  // Solution for utilizing in ScrollView:
  // https://medium.com/@caphun/reactnative-why-your-webview-disappears-inside-scrollview-c6057c9ac6dd
  const [webViewHeight, setWebViewHeight] = useState(0);
  const [additionalScrollHeight, setAdditionalScrollHeight] = useState({});
  const onMessage = event => {
    setWebViewHeight(Number(event.nativeEvent.data));
    setLoading(false);
  };

  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState({});
  const [userVote, setUserVote] = useState(topic.user_vote);
  const [isMounted, setIsMounted] = useState(false);

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
    setIsMounted(true);
  }, [topic_id]);

  const getDimensionsFromLayout = (e, key) => {
    // Don't question this please... idk how I got it to work; I tried using
    // FlatList + Header/Footer components (like I would with Swift) and tried
    // using onLayout on every single component. Why this works is beyond me.
    // Best explanation I can give is that each View is calculating its children
    if (isMounted) {
      const LHeight = e.nativeEvent.layout.height;
      const merging = {};
      merging[key] = LHeight ? LHeight : 0;
      setAdditionalScrollHeight({...additionalScrollHeight, ...merging});
    }
  };

  /**
   * Sends initial or updated vote
   * @param vote {number} the user vote to be sent
   * @returns {Promise<void>}
   */
  const sendVote = async vote => {
    await sendInitialVote(topic_id, vote, [voteCb, setUserVote]);
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollView,
        backgroundStyle,
        {
          height:
            webViewHeight +
            // summing up the views' heights
            Object.values(additionalScrollHeight).reduce((a, b) => a + b, 0),
        },
      ]}>
      {typeof userVote === 'number' && (
        <View
          onLayout={e => {
            getDimensionsFromLayout(e, 0);
          }}>
          <Analytics
            topic={topic}
            summary_data={data}
            componentId={componentId}
          />
        </View>
      )}
      {isLoading && (
        <ActivityIndicator
          onLayout={e => {
            // Intentionally 1 for overriding in the bottom button section
            getDimensionsFromLayout(e, 1);
          }}
          style={styles.highTopMargin}
          size="large"
        />
      )}
      <WebView
        style={!isLoading || styles.transparentWebView}
        originWhitelist={['*']}
        source={{html: generateHTML(data.content)}}
        scrollEnabled={false}
        startInLoadingState={true}
        // We have to use ActivityIndicator outside instead of in renderLoading
        // to properly calculate the height for the scroll view
        renderLoading={() => <></>}
        onMessage={onMessage}
        injectedJavaScript={injectedJavascript}
        onNavigationStateChange={handleWebViewStateChange}
      />
      {!isLoading && voteCb && (
        <View
          onLayout={e => {
            // Intentionally 1 for overriding ActivityIndicator height
            getDimensionsFromLayout(e, 1);
          }}>
          <View
            style={{
              borderBottomColor: textColor,
              borderBottomWidth: StyleSheet.hairlineWidth,
            }}
          />
          <View>
            <Text style={[styles.centerText, {color: textColor}]}>
              {typeof userVote === 'number'
                ? '(You can update your vote here, but your initial vote will still be stored)'
                : "(Update your vote as many times as you'd like. Your initial vote is still stored)"}
            </Text>
          </View>
          <View style={styles.buttonContainer}>
            <PressableOpacity
              onPress={async () => {
                await sendVote(1);
              }}
              style={[
                Theme.DEFAULT_BUTTON_STYLE,
                {backgroundColor: Colors.approve},
              ]}>
              <Text style={{color: Colors.black}}>👍 Approve</Text>
            </PressableOpacity>
            <PressableOpacity
              onPress={async () => {
                await sendVote(0);
              }}
              style={[
                Theme.DEFAULT_BUTTON_STYLE,
                {backgroundColor: Colors.red},
              ]}>
              <Text style={styles.disapproveText}>👎 Disapprove</Text>
            </PressableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
  },
  longText: {flex: 1, flexWrap: 'wrap', flexShrink: 1},
  h1: {fontSize: 20},
  highTopMargin: {marginTop: 12},
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transparentWebView: {flex: 0, height: 0, opacity: 0},
  centerText: {
    textAlign: 'center',
  },
  disapproveText: {
    color: Colors.white,
    fontWeight: '600',
  },
});
