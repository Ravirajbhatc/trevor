import React, { Component, PropTypes } from 'react'; // eslint-disable-line no-unused-vars
import { connect } from 'react-redux';

import {
  AlertIOS,
  WebView,
} from 'react-native';

import { fetchGithubToken, fetchTravisToken } from '../Actions';
import Constants from '../Utils/Constants';
import Loading from '../Components/Loading';

class OAuthView extends Component {
  static propTypes = {
    authUrl: PropTypes.string.isRequired
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.auth.token.github !== this.props.auth.token.github) {
      this.requestTravisToken(nextProps.auth.token.github);
    }

    if (nextProps.auth.token[this.props.isPro ? 'pro' : 'os']) {
      this.props.navigator.pop();
    }
  }

  requestGithubToken(code) {
    var data = {
      client_id: Constants.oAuthOptions.client_id,
      client_secret: Constants.oAuthOptions.client_secret,
      code: code
    };

    this.props.fetchGithubToken(data);
  }

  requestTravisToken(githubToken) {
    this.props.fetchTravisToken(this.props.isPro, githubToken);
  }

  onNavigationStateChange(args) {
    var url = args.url;
    var raw_code = /code=([^&]*)/.exec(url) || null;
    var code = (raw_code && raw_code.length > 1) ? raw_code[1] : null;
    var error = /\?error=(.+)$/.exec(url);

    // If there is a code, proceed to get token from github
    if (code) {
      this.requestGithubToken(code);
    }

    if (error) {
      AlertIOS.alert('Trevor', 'Oops! Something went wrong and we couldn\'t log' +
        'you in. Please try again.');
    }
  }

  render() {
    if (this.props.auth.isFetching || this.props.auth.token.github) {
      return <Loading text="Auth" />;
    }

    return (
      <WebView
        source={{uri: this.props.authUrl}}
        onNavigationStateChange={this.onNavigationStateChange.bind(this)}
        automaticallyAdjustContentInsets={true}
        startInLoadingState={true} />
    );
  }
};

function mapStateToProps(state) {
  return {
    auth: state.auth
  };
};

export default connect(mapStateToProps, { fetchGithubToken, fetchTravisToken })(OAuthView);
