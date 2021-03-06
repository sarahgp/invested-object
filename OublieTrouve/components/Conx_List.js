import React, { Component } from 'react';

import { 
  ScrollView,
  StyleSheet,
  TouchableHighlight, 
  View
} from 'react-native';

import shorthand    from 'react-native-styles-shorthand';
import { base }     from './helpers/base_styles';
import SimpleStore  from 'react-native-simple-store';
import _            from 'lodash';


// Components
import DetailView   from './Detail';
import Card         from './Conx_Card';

// Component
export default class MemoryList extends Component {

  constructor(props) {
    super(props);

    this.state = {
      cards: []
    };
  }


  _toDetail(type, modifier) {
    console.log("You tapped the link!");
    
    this.props.navigator.push({
      name: 'Detail',
      component: DetailView,
      passProps: {
        navigator: this.props.navigator.pop,
        title: type + ': ' + modifier,
        detailKind: 'list',
        filter: modifier,
      }
    })
  }

  componentWillMount() {
    SimpleStore.get('all_conx')
      .then((data) => {
        let list = _.remove(data, (d) => {
          return d.members.length > 0;
        });

        this.setState({
          cards: list
        })
      })
      .catch(error => {
        console.error(error.message);
      });
  }

  render() {

    let cardsList = this.state.cards.map((card, idx) => {
      return (
        <View key={idx}>
        <TouchableHighlight 
          underlayColor={base.lightSeafoam}
          onPress={this._toDetail.bind(this, card.type, card.modifier)}>
          
          <Card card={card} />  
            
        </TouchableHighlight>
        </View>
      )
    });

    return (
      <ScrollView style={styles.list}>
        {cardsList}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create(shorthand({
  list: {
    backgroundColor: '#fff',
    paddingTop: base.padding(0.5),
    flex: 4,
  }
}));