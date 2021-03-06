import React, { Component } from 'react';

import { 
  StyleSheet,
  Text, 
  View
} from 'react-native';

import shorthand        from 'react-native-styles-shorthand';
import { base, groups } from './helpers/base_styles';

// Component
export default class MomentTextPlain extends Component {

  render() {
    
    return (
      <View>
        <Text style={[styles.text, styles.title]}>{this.props.details.title} </Text>
        <Text style={[styles.text, styles.para]}>{this.props.details.description || 'No notes.'} </Text>
        <Text style={[styles.text, styles.small]}>posted at: {this.props.date} </Text>
      </View>
    )
  }
}

const styles = StyleSheet.create(shorthand({
  text: groups.bodyFontGroup,
  title: {
    fontSize: 22,
  },
  para: {
    flex: 1,
    lineHeight: 21,
  },
  small: {
    fontSize: 12,
    fontStyle: 'italic',
    color: base.darkGray,
  },
}));