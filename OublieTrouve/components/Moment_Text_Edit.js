import React, { Component } from 'react';

import { 
  StyleSheet,
  Text,
  TextInput, 
  View
} from 'react-native';

import shorthand from 'react-native-styles-shorthand';
import update from 'react-addons-update';
import { base, groups } from './base_styles';
import SimpleStore from 'react-native-simple-store';
import events from './Events';

// Component
export default class MomentTextEdit extends Component {

  constructor(props) {
    super(props);

    this.state = {
      details: {
        title: '',
        description: '',
        elevation: 0,
        distance_from_home: 0,
        temp: 75,
        humidity: 22.5,
        posted: 0, 
      },

      titleHeight: 0,
      paraHeight: 0,
    }
  }

  componentDidMount(){
    this.setState({details: this.props.details});
  }

  _updateDetailState(text, updateMe){
    let newDetail = update(this.state.details, {$merge: {[updateMe]: text} });
    this.setState({details: newDetail});
  }
          

  render() {
    
    let date = new Date(this.state.details.posted);

    return (
      <View>
        <TextInput
           style={[styles.text, styles.title, {height: Math.max(88, this.state.titleHeight)}]}
           onChangeText={(text) => this._updateDetailState.call(this, text, 'title')}
           value={this.state.details.title}
           multiline={true}
           editable={editOn}
           />
        <TextInput
           style={[styles.text, styles.para, {height: Math.max(260, this.state.titleHeight)}]}
           onChangeText={(text) => this._updateDetailState.call(this, text, 'description')}
           value={this.state.details.description}
           multiline={true}
           editable={editOn}
           />
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