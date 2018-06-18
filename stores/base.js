'use restrict';
//const HTMLParser = require('fast-html-parser');
// const DomParser = require('react-native-html-parser').DOMParser;
const DomParser = require('jsdom');
let parseHtml=(html)=>{
  //return HTMLParser.parse(html);
  try{
  return new DOMParser(html).window.document;
}catch(e){
  console.debug("Unknonw document:",e);
}

  //return new DomParser().parseFromString(html,'text/html')
};

class onlineStore {

    constructor(features){
      this.features = this._features;
      var dFeature = {
        website: '',
        displayName: '',
        icon: '',
        parser: null,
        barcodeFormat: '',
        isMyBarcode: (a)=>{false};
        parsingElement:{

        }
      }
      for (var f in dFeatures || {}){
        var v=features[f],dv=dFeatures[f];
        if (typeof v == 'function' ) v=v.bind(this);
        else if ( typeof v == 'object' && typeof dv == 'object'){
          for ( var k in dv){
            v[k]=v[k] || dv[k];
          }
        }
        this.features[f] = v || dv;;
      }

    this._barcodeFormat = "";
    this._features = {};
    this._result = {
      name: '',
      details: '',
      price: 0,
      img: '',
      url: '',
    };
  }
    _clone(o){
      if (o){
        return JSON.parse(JSON.stringify(o));
      }
    }
    parseResult(obj){
      var ret = this._clone(this._result);
      if (typeof obj == 'object'){
          var k;
          for ( k in ret){
            ret[k]=obj[k];
          }
      }else if (typeof obj == 'string') {
        var po = parseHtml(obj);
        if ( po ){

        }
      }
      return ret;
    }
    isMyBarcode(barcode){ // only this return true, will handle this request
      if (!barcode) return false;
      let bf =this.features.barcodeFormat;
      if (bf){
        return barcode.match(bf);
      }else if (typeof this.features.isMyBarcode == 'function'){
        return this.features.isMyBarcode(barcode);
      }
    }
}
module.exports=onlineStore;
