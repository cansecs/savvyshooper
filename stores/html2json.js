var MAIN=function(url,parse_object,options){
  this.url=url;
  this.parse_object=parse_object || {};
  this.options=options || {};
};
const MP=MAIN.prototype;
MP.digKey=""; // if digKey is not null, will try to dig more into the key on calling getValue
MP.accessJSON=function(obj,key){
  var current = obj;
  if (key){
    keychain=key.split(".");
    var i=0;kl=keychain.length;
    while (current && i<kl){
      current = current[keychain[i]];
      i++;
    }
  }
  return current;
}
MP.getValue=function(qa,q){
  if (qa){
    if ( q === null){
      return qa;
    }
    if (!q){
      return qa["textContent"] || qa["structedText"];
    }else{
      var v=qa[q],attr=qa[this.digKey];
        if (v) return v;
        else if (typeof attr == 'object'){
          return attr[q];
        }
    }
  }
  return {};
};
MP.dia=function(a,b,q){
  if (!b) return {};
   //console.debug("Checking",b,"on",a);
   var [first,...rest]=b.split(/\s+/);
   if (first.match(/^\+/)){
     a=a[first.substring(1)];
     b=rest.join(" ");
   }
   //console.debug("Checking",b,"on",a);
  var qa=a.querySelector(b) || {};
  return this.getValue(qa,q);
};
MP.engine=function(dom){
  return new Promise((resolve,reject)=>{
     var po=this.parse_object,list=po.list;
     if (!dom || !dom.window){
       return reject("Cannot find dom");
     }
  var document=dom.window.document;
  this.currentDocument=document;
  if (list){
     var t=document.querySelectorAll(list);
     var r=[];
     if (t.length > 0){
       var ret={},poe=po.elements || {};
       var followup=false;
       t.forEach(a=>{
         var goon=(go,target)=>{
          for ( var k in go ){
           var v=go[k];
           var [e,...left]=v.split('@');
           var r,i,rest;
           if (left.length > 0){
             r=(left.join('@')).split('=>');i=r[0];rest=r[1];
           }
           var f=this.dia(target,e,i);
           if (rest ){
            if(rest.match(/\{/)){
             try{
                var obj=JSON.parse(rest);
               followup=true;
                this.JSDOM.fromURL(f,this.options).then(dom=>{
                    this.secondDocument=dom.window.document;
                   followup=false;
                   goon(obj,dom.window.document);
                })
                .catch(err=>{
                        console.error("Cannot follow the link:",f);
                        followup=false;
                });
              }catch(e){
                 console.error("Not a good JSON obj",rest);
               }
               }else if (rest.match(/^function\(/)){
                       try{
                          var func=eval(rest);
                          ret[k]=func(f);
                       }catch(e){
                          console.error("Not a good function",rest);
                       }
               }
             }else{
               ret[k]=f && f.trim?f.trim():f;
             }
           }
           if (!followup){
             resolve(ret);
           }
          }
           goon(poe,a);
        });
       }else{
         resolve({});
       }

    }else{
      resolve({});
    }

    });
  };
  MP.search=function(keyword){
    var url=typeof(this.url) == 'function'?this.url(keyword):this.url+keyword.replace(/\s+/g,'+');
    var key=url.match(/^http/i)?"fromURL":"fromFile";
          options=this.options;
            return this.JSDOM[key](url,options).then(dom=>{
              return this.engine(dom);
            })
  };
  const _JSDOM="_JSDOM",_Parser="_parser";
  Object.defineProperty(MP,"Parser",{set:function(parser){
    if (typeof parser === 'function')
      MP[_Parser]=parser;
  }});
  Object.defineProperty(MP,"JSDOM",{get:function(){
    var name=_JSDOM,parser=_Parser;

    if (!MP[name]){
            var inRN = typeof fetch === 'function',hasParser=MP[parser];
            this[name]={
              fromURL:function(url,options){
                console.log("Fetching:",url);
                return inRN?fetch(url,options)
                .then(ret=>ret.text())
                .then(html=>this.parse(html)):new Promise((resolve,reject)=>{
                  return reject("You need to have a fetcher specified in this object named as:"+name);
                });
              },
              fromFile:function(){

              },
              parse:function(html){
                return new Promise((resolve,reject)=>{
                  if (!hasParser) return reject("You need to specify a DOM parser, name in this object as:"+parser);
                  try{
                    return resolve(hasParser(html));
                  } catch(e){
                    return reject(e);
                  }
                });
              }
            }
    }
    return this[name];
  },
  set:function(jsdom){
    if (typeof jsdom == 'object'){
      MP[_JSDOM]=jsdom;
    }
  }
})
module.exports=MAIN;
