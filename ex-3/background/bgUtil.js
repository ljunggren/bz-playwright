globalThis.bgUtil={
  requestMap:{},
  openWindow:function(t,d){
    let w=chrome.windows.create(d)
  },
  ajax:async function(tab,data,fun){
    let asFile=data.notDownloadAsFile
    delete data.notDownloadAsFile
    let hs={},d={
      data:{
        headers:hs
      }
    }

    data.headers=data.headers||{}

    if(data.contentType){
      data.headers["Content-Type"]=data.contentType
      delete data.contentType
    }else{
      data.headers["Content-Type"]="application/json"
    }
    delete data.cache
    if(data.data){
      data.body=data.body||data.data
    }
    delete data.data
    if(data.headers["Content-Type"].includes("form")){
      if(data.body&&data.body.constructor==Object){
        data.body=new URLSearchParams(data.body).toString()
      }
    }
    if(data.body&&data.body.constructor==Object){
      data.body=JSON.stringify(data.body)
    }
    await fetch(data.url,data).then(r=>{
      for (var k of r.headers.entries()) {
        hs[k[0]]=k[1]
      }
      d.data.status=r.status
      if(data.responseType=="arraybuffer"&&!asFile){
        return r.blob()
      }else{
        return r.text()
      }
    }).then(dd=>{
      if(data.responseType=="arraybuffer"&&!asFile){
        return dd.arrayBuffer()
      }else{
        d.data.data=dd;
        if(data.responseType&&this.response){
          d.data.data=String.fromCharCode.apply(null, new Uint8Array(this.response));
        }
        fun(d.data)
      }
    }).then(dd=>{
      if(data.responseType=="arraybuffer"&&!asFile){
        let o=_handleBold(dd,data.url)
        fun(o)
      }
    })

    function _handleBold(blob,_url){
      var str=_handleCodePoints(new Uint8Array(blob));
      
      //var str = String.fromCharCode.apply(null, new Uint8Array(blob));
      //var str=new TextDecoder("utf-8").decode(new Uint8Array(blob));
      var v=_url.split("/");
      var n=v.pop()||v.pop()

      var t=n.split(".").pop()||"";
      if(["jpg","png","svg","bmp","gif","jpeg","ico"].includes(t)){
        t="image/"+t;
      }else if("txt"==t){
        t="plant/text"
      }else{
        t="application/"+t;
      }
      return [{
        size:str.length,
        name:n,
        base64Link:"data:"+t+";base64,"+_b64EncodeUnicode(str),
        lastModified:Date.now(),
        lastModifiedDate:new Date(),
        webkitRelativePath:"",
        type:t
      }];
    }
    function _handleCodePoints(array) {
      var CHUNK_SIZE = 0x8000; // arbitrary number here, not too small, not too big
      var index = 0;
      var length = array.length;
      var result = '';
      var slice;
      while (index < length) {
        slice = array.slice(index, Math.min(index + CHUNK_SIZE, length)); // `Math.min` is not really necessary here I think
        result += String.fromCharCode.apply(null, slice);
        index += CHUNK_SIZE;
      }
      return result;
    }

    function _b64EncodeUnicode(str) {
      try{
        return btoa(str)
      }catch(e){
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
            function toSolidBytes(match, p1) {
                return String.fromCharCode('0x' + p1);
        }));
      }
    }
  },
  getScreenshot:function(t,fun){
    _tabManagement._getTabById(t.tab.id,function(o){
      if(o){
        if(o.ide){
          if(o.myApp){
            _tabManagement._getTabById(o.myApp,doFinal)
          }
        }else{
          doFinal(o)
        }
      }else{
        fun(0)
      }
    })

    function doFinal(o){
      chrome.tabs.captureVisibleTab(o.windowId,(img) => {
        fun(img)
      })
    }
  },
  focusTab:function(t){
    chrome.tabs.update(t.id,{active:true})
  },
  exeRuntimeCmd:function(t,k,ps,f){
    if(f){
      if(ps.constructor==Array){
        chrome.runtime[k](...ps,f)
      }else if(ps.constructor==Object){
        if(ps.insertFun){
          if(ps.parameters){
            chrome.runtime[k](...ps.parameters,f)
          }else{
            chrome.runtime[k](f)
          }
        }else{
          chrome.runtime[k](ps)
        }
      }else{
        chrome.runtime[k](ps)
      }
    }else{
      chrome.runtime[k]()
    }
  },
  updateWindow:function(t,d){
    let w=_tabManagement._map[t.tab.id]
    _doIt()
    function _doIt(_retry){
      _retry=_retry||0
      if(w){
        if(d[0]=="ide"){
          w=w.myIde||w.id
        }else{
          if(w.myApp){
            w=w.myApp
          }else if(w.myIde){
            w=w.id
          }else if(_retry<10){
            return setTimeout(()=>{
              _doIt(_retry+1)
            },100)
          }else{
            return
          }
        }
        w=_tabManagement._map[w].windowId
        chrome.windows[d[1]](w,d[2],()=>{
          console.log("ok")
        })
      }
    }
  }
}

