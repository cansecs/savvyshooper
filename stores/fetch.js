const HTTP=require('http');
const HTTPS=require('https');
const Url = require('url');
var fetch_page=function (proxy,port,testpath,header,data,callback,myTimeout,iconv){
  var noiconv=!iconv;
  if (!myTimeout) { myTimeout=6e4; } // default timeout is 30 seconds
var options = {
  hostname: proxy,
  port: port,
  path: testpath,
  pool: false,
  headers: {
    Accept:'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8', 'Cache-Control':'max-age=0',
    'Accept-Language':'zh-CN,zh;q=0.8,en;q=0.6,ru;q=0.4',
    'Proxy-Connection':'close','Connection':'close',
    'User-Agent':'Mozilla/5.0 (Linux; U; Android 4.3; en-us; SM-N900T Build/JSS15J) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30'}
};
var usecurl=false,unwantedHeaders=['accept-encoding','host','proxy-connection','accept'];
if (header) { for (var k in header ){
   k=k.toLowerCase(); if (!k) continue;
   if ( k == 'noiconv' ) {
      noiconv=header[k]
      continue;
   }else if ( k == 'usecurl' ) {
      usecurl=true;
      continue;
   }else if ( k == 'method' ){
     options[k]=header[k];
     continue;
   }else if ( unwantedHeaders.indexOf(k) > -1 ){
     continue
   }
   if ( header[k]) options.headers[k]=header[k];
 }
}

var h='Host',ishttps=false;
if ( !options.headers[h] ){
  var p = Url.parse(testpath),_h;
  if ( p.host) _h=p.host;
  else { _h=proxy; }
  ishttps=(p.protocol=='https:');
  if ( !proxy || ishttps) {
    options.hostname=p.host;
    options.port=p.port;
    options.path=p.path;
  }
  options.headers[h]=_h;
  if ( ishttps && proxy){
    if(usecurl) {
        return curl_page(proxy,port,testpath,options.headers,data,callback,myTimeout);
    }
    options.agent=new https_agent({proxyHost:proxy,proxyPort:port});
  }
}
console.log("Calling fetchpage",options);
var _useful={start:new Date(),data:Buffer.from("")}
var postData=null;
if ( data ){
  if ( data && JSON.stringify(data) != '{}' ) {
  postData=Querystring.stringify(data);
  //.replace('%20','+');
  _useful.postData=postData;
  options.headers['Content-Type']='application/x-www-form-urlencoded';
  options.headers['Content-Length']=postData.length;
  options['method']='POST';
  }
};
var action=HTTP;
if ( ishttps ) {
   action=HTTPS;
}
var req = action.request(options, ((useful)=>function(_res) {
  //console.log('STATUS: ' + res.statusCode);
  //console.log('HEADERS: ' + JSON.stringify(res.headers));
  useful.resHeaders=_res.headers;
  //res.setEncoding(enc);
  var res=_res;
  if ( !noiconv ){
   res = Iconv.decodeStream('gb2312');
   _res.pipe(res);
  }
  res.on('data', ((useful)=>function (chunk) {
    if ( process.env.FETCHPAGE ){ // keep the cache for each page
      var _cache="_cache",c=internals[_cache]=internals[_cache]||{};
      var url=options.hostname+':'+options.port+options.path;
      var p=c[url]=c[url] || [];
      p.push(chunk,useful.data);
    }
    if ( chunk instanceof Buffer ){
      useful.data=Buffer.concat([useful.data,chunk]);
    }else{
      useful.data=useful.data.toString()+chunk;
    }
  })(_useful));
  res.on('end', function() {
    useful.end=new Date();
    useful.data=useful.data.toString('utf-8');
    if (callback ) {
        return process.nextTick(()=>{
          return callback(null,useful);
        });
    }
    //console.log('No more data in response.')
  })
})(_useful));

req.on('socket', function (socket) {
  socket.setTimeout(myTimeout);
  socket.on('timeout', function() {
    console.log('Socket request timedout',socket);
    req.abort();
    if ( callback ) {
        return process.nextTick(()=>{
          callback("timeout",_useful);
        });
    }
  });
});

req.on('error', ((useful)=>function(e) {
  //console.log('problem with request: ' + e.message);
  if (callback) {
        return process.nextTick(()=>{
          callback(e,useful);
        });
  }
})(_useful));

// write data to request body
if (postData){ req.write(postData);}
req.end();
_useful.requestHeader=req._header;
};
module.exports.fetch=fetch_page;
