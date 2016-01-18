import React from 'react-native';

import Constants from '../Utils/Constants';

var {
  ActivityIndicatorIOS,
  Platform,
  ProgressBarAndroid,
  StyleSheet,
  Text,
  View,
} = React;

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    fontSize: 20,
    margin: 15
  }
});

export default class Loading extends React.Component {
  render() {
    const loading = Platform.OS === 'ios' ? (
      <ActivityIndicatorIOS
        animating={true}
        color={Constants.THEME_DARK_BLUE}
        size="large" />
    ) : (
      <ProgressBarAndroid
        styleAttr="Inverse"
        color={Constants.THEME_DARK_BLUE} />
    );

    return (
      <View style={[styles.container, this.props.style && this.props.style]}>
        {loading}
        {this.props.hideText ? <View /> : (
          <Text style={styles.loadingText}>Loading {this.props.text}</Text>
        )}
      </View>
    );
  }
};
