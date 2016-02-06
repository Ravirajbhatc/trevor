import React from 'react-native';

var {
  StyleSheet,
  Text,
  View,
} = React;

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    color: '#FFF'
  }
});

export default class NavigationTitle extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{this.props.route.title}</Text>
      </View>
    );
  }
}