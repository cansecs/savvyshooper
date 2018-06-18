import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  InputAccessoryView,
  Button,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
const placeHolder = 'What do you want to check today?';
const inputAccessoryViewID = "searchId";

const MAIN=require('../stores/html2json');
MAIN.prototype.digKey="attributes";
const Parser = require('fast-html-parser');

const ps=new MAIN('http://www.primedentalsupply.com/advanced_search_result.php?Submit=&keywords=',{
  list:'div.pro-list1',
  elements:{
    large:".imgbox img@src",
    "short-description":".prodetail h3",
    sku: ".btnbox p:nth-child(2) strong",
    vendor: ".btnbox p:nth-child(1) strong",
    price: ".normal-price .red",
    //link:'.prodetail a@href',
    link:'.prodetail a@href=>{"description":".long-desc@innerHTML","small":"img[id*=zoom_]@src"}',
  },
});
ps.Parser = html => {
  var obj = Parser.parse(html) || {};
  obj.window={document:obj};
  return obj;
};
const locate=text=>{
   return ps.search(text)
}

export default class SearchView extends React.Component {

  state = {
    text: '',
    lastText: '',
    output:''
  }
  _onChangeText(text){
    console.log("Calling here:",text);
    if (text != this.state.text){
      this.setState({lastText:this.state.text,text:text});
    }
  }
  _onEndEditing(){
      locate(this.state.text)
      .then(obj=>{
        this.setState({output:JSON.stringify(obj)})
      })
      .catch(err=>{
        this.setState({output:err+''})
      })

    return true;
  }
  render(){

  /*  return (
      <View>
        <ScrollView keyboardDismissMode="interactive">
          <TextInput
            style={{
              padding: 10,
              paddingTop: 50,
            }}
            inputAccessoryViewID={inputAccessoryViewID}
            onChangeText={text => this.setState({text})}
            value={this.state.text}
          />
        </ScrollView>
        <InputAccessoryView nativeID={inputAccessoryViewID}>
          <Button
            onPress={() => this.setState({text: placeHolder})}
            title="Reset"
          />
        </InputAccessoryView>
      </View>
    );*/
    return (
      <View><ScrollView keyboardDismissMode="interactive"><Text>Hloe there </Text>
      <TextInput
        style={{
          padding: 10,
          paddingTop: 20,
        }}
        placeholder={placeHolder}
        clearButtonMode='while-editing'
        inputAccessoryViewID={inputAccessoryViewID}
        onChangeText={text => this._onChangeText(text)}
        onEndEditing={text => this._onEndEditing()}
      />
      <Text>{this.state.output}</Text>
    </ScrollView>
    </View>
    )
  }
}
