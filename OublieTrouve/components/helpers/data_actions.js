import React, { Component } from 'react';

import {
  StyleSheet,
  Text,
  TextInput, 
  TouchableHighlight,
  View
} from 'react-native';

import update           from 'react-addons-update';
import SimpleStore      from 'react-native-simple-store';
import events           from '../Events';
import BaseMoment       from './base_moment';
import { weatherID }    from './credentials';

// This will need to be rewritten to match the _addFromButton construction eventually
const _addToStore = function() {

  let newEntry = this.state ? _.cloneDeep(this.state.details) : new BaseMoment();

  Promise.all([newEntry.populate(), SimpleStore.get('all_moments')])
    .then(values => {
      console.log('values', values);
      // set ID now that we have the data length
      let data = values[1];
      newEntry.id = data.length;
      console.log(newEntry);
      return data;
    })
    .then((data) => {
      data.unshift(newEntry);
      SimpleStore.save('all_moments', data);
      events.emit('refreshData');
    })
    .then(() => SimpleStore.get('all_moments'))
    .then((data) => {
      console.log('gotten', data[0]);
    })
    .catch(error => {
      console.error(error.message);
    });
}

// This will need to be rewritten to match the _addFromButton construction eventually
const _saveToStore = function(){
    let idx;

    SimpleStore.get('all_moments')
    .then((data) => {
       idx = _.findIndex(data, { id: this.props.details.id });
       data[idx].title = this.state.details.title;
       data[idx].description = this.state.details.description;
       SimpleStore.save('all_moments', data);
       events.emit('refreshData');
    })
    .then(() => SimpleStore.get('all_moments'))
    .then((data) => {
      console.log('gotten', data[idx]);
    })
    .catch(error => {
      console.error(error.message);
    });
  }

const _updateDetailState = function(text, updateMe){
  let newDetail = update(this.state.details, {$merge: {[updateMe]: text} });
  this.setState({details: newDetail});
}

export {_addToStore, _addFromButton, _saveToStore, _updateDetailState }