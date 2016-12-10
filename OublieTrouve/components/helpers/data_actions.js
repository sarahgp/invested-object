import React, { Component } from 'react';

import Native, {
  StyleSheet,
  Text,
  TextInput, 
  TouchableHighlight,
  View
} from 'react-native';

import update               from 'react-addons-update';
import SimpleStore          from 'react-native-simple-store';
import events               from '../Events';
import DetailView           from '../Detail';
import BaseMoment           from './base_moment';
import { tests, conxList }  from './conx';
import _                    from 'lodash';


// Helper function to create simple conx
const _populateMembers = function(moment, cxList, testList, addMoment){

  _.each(cxList, function(category){

    // Have to do it this way becasue JSON won't let us save functions
    let test = testList[category.type][category.modifier];

    if (test(moment)){
      addMoment && category.members.unshift(moment);
      
      moment.conx.push({
        type: category.type,
        modifier: category.modifier,
        imageTitle: category.imageTitle,
      });
    }

  });

  return cxList;
}

// Helper function to create complex conx

const _complexConx = function(list){
  
  let complexes = [
    ['Weather'],
    ['Distance From Home', 'Elevation'],
    ['Distance From Home', 'Weather'],
    ['Time of Day', 'Temp'],
    ['Temp', 'Humidity', 'Weather'],
  ];

  let getOne = function(a){
    return _.map(a, (first) => {
                  return {
                    type: 'Compound',
                    modifier: first.modifier,
                    members: first.members,
                    images: [first.imageTitle],
                  } 
                });
  }

  let getTwo = function([a, b]){
    let flat = _.flatten(_.map(a, (first) => {
      return _.map(b, (second) => {
        let intersected = _.intersectionBy(first.members, second.members, 'title');
        return { 
          type: 'Compound',
          modifier: first.modifier + '-' + second.modifier, 
          members: intersected,
          images: [first.imageTitle, second.imageTitle],
        }
      })
    }));

    return _.filter(flat, (f) => f.members.length > 0);
  }

  let getThree = function([a, b, c]) {
    let flat = _.flatten(_.map(a, (first) => {
      return _.flatten(_.map(b, (second) => {
        return _.map(c, (third) => {
          let intersected = _.intersectionBy(first.members, second.members, third.members, 'title');
          return { 
            type: 'Compound',
            modifier: first.modifier + '-' + second.modifier + '-' + third.modifier, 
            members: intersected,
            images: [first.imageTitle, second.imageTitle, third.imageTitle],
          }
        })
      }))
    }))

    return _.filter(flat, (f) => f.members.length > 0);
  }

  let test = _.map(complexes, (complex) => {

    let to;
    let name = complex.join('-');
    let members = _.map(complex, (c) => _.filter(list, { type: c }));

    if (complex.length === 1){
      let flat = _.flatten(members);
      to = getOne(flat);
    } else if (complex.length === 2){
      to = getTwo(members);
    } else if (complex.length === 3){
      to = getThree(members);
    }
    
    return to;


  });

  // console.log('test', _.flatten(test));
  return _.flatten(test);

}

// Adds new moment, whether generated by form or button
const _addToStore = function() {

  // how should this function if called from position
  let newEntry = this.state ? Object.assign(new BaseMoment(), _.cloneDeep(this.state.details)) : new BaseMoment(),
      updatedMoments, updatedCxList, updatedCompCx;

  Promise.all([newEntry.populate(), SimpleStore.get('all_moments'), SimpleStore.get('all_conx'), SimpleStore.get('comp_conx')])
    .then(([populatedEntry, moments, conx, compConx]) => {
      // set ID now that we have the data length
      // let data = values[1];
      populatedEntry.id = moments.length;
      moments.unshift(populatedEntry);
      conx = _populateMembers(populatedEntry, conx, tests, true);
      compConx = _complexConx(conx);

      Promise.all([SimpleStore.save('all_moments', moments),
                   SimpleStore.save('all_conx', conx),
                   SimpleStore.save('comp_conx', compConx)])
      .then(() => events.emit('refreshData'))
      
      return [populatedEntry, moments, conx, compConx];
    })
    .then(() => SimpleStore.get('comp_conx'))
    .then((data) => {
      console.log('gotten compConx', data);
    })
    .then(() => SimpleStore.get('all_moments'))
    .then((data) => {
      console.log('gotten', data[0]);
    })
    .catch(error => {
      console.error(error);
    });
}

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

const _checkForConx = function(navigator, threshold){
  
  let go = Math.random() > threshold;

  if (go) {
    let thisMoment = new BaseMoment();

    thisMoment.populate()
      .then(() => Promise.all([SimpleStore.get('all_conx'), SimpleStore.get('comp_conx')]))
      .then(([conx, compConx]) => {

        // We do this to get the list of conx added to our current moment
        _populateMembers(thisMoment, conx, tests, false);

        let num        = _.random(1, 3),
            collection = _.map(_.sampleSize(thisMoment.conx, num), 'modifier').join('-'),
            cx         = _.find(compConx, {modifier: collection});

        
        if (cx && cx.members.length > 0){
          Native.NativeModules.Bean.buzzBean();

          // Prevent a stack from accumulating
          let method = navigator.getCurrentRoutes().length === 1 ? 'push' : 'replace'; 
          navigator[method]({
            name: 'Detail',
            component: DetailView,
            passProps: {
              navigator: navigator,
              title: collection.type + ': ' + collection.modifier,
              detailKind: 'list',
              filter: collection.modifier,
            }
          });
        }

      })
      .catch(error => {
        console.log(error.message);
      });
  }


  // show the conx as the default app page
}

export {_addToStore, _saveToStore, _updateDetailState, _populateMembers, _checkForConx, _complexConx }