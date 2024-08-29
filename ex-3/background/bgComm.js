globalThis.bgComm={
  _exeMap:{},
  init:function(){
    chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse){
      handleMessage(msg,sender,sendResponse);
    });

    chrome.runtime.onMessageExternal.addListener(function(msg, sender, sendResponse){
      handleMessage(msg,sender,sendResponse);
    });

    function handleMessage(msg,sender,sendResponse){
      console.log("receive message from "+msg.fromPage)
      if(msg.toPage=="bzBg"){
        if(msg.result){
          let f=bgComm._exeMap[msg.return]
          if(f){
            delete bgComm._exeMap[msg.return]
            f(msg.result.value)
          }
        }else{
          globalThis[msg.scope][msg.fun](sender,...(msg.ps||[]),(r)=>{
            if(msg.return){
              msg.result={value:r}
              msg.toPage=msg.fromPage
              msg.toId=msg.fromId
              msg.toIFrameId=msg.fromIFrameId
              delete msg.fromId
              delete msg.fromPage
              delete msg.fromIFrameId
              bgComm.postToTab(msg)
            }
          })
        }
      }else{
        bgComm.postToTab(msg)
      }
      sendResponse(0)
    }  
  },
  tabReady:function(t){
    _tabManagement._tabReady(t.tab.id,t.frameId)
  },
  updateIframeIdx:function(t,frameId,idx){
    _tabManagement._updateIframeIdx(t.tab.id,frameId,idx)
  },
  //Send message to extension (ide or app)
  postToTab:function(msg){
    let _toId=parseInt(msg.toId)
    if(_toId){
      console.log("post message to",msg)
      if(msg.toIFrameId=="parent"){
        _tabManagement._getParentIFrameId(msg.fromId,msg.fromIFrameId,(pId)=>{
          _doIt(_toId,msg,{frameId:parseInt(pId)},0)
        })
      }else if(msg.toIFrameId=="*"){
        _tabManagement._getTabById(_toId,function(v){
          v.forEachIframe((i,k)=>{
            _doIt(_toId,msg,{frameId:k},0)
          })
        })
      }else{
        _doIt(_toId,msg,{frameId:parseInt(msg.toIFrameId||0)},0)
      }
    }

    function _doIt(id,msg,f,_retry){
      try{
        chrome.tabs.sendMessage(id,msg,f,(r)=>{
          if(r===undefined){
            _doRetry(id,msg,f,_retry)
          }
        })
      }catch(e){
        _doRetry(id,msg,f,_retry,e)
      }

    }

    function _doRetry(id,msg,f,_retry,e){
      if(_retry<10){
        console.log("retry post message to",id,msg,f)
        setTimeout(()=>{
          _tabManagement._getTabById(id,function(v){
            if(v){
              _doIt(id,msg,f,_retry+1)
            }
          })
        },100)
      }else{
        console.log("post message error",e?e.stack:"")
      }
    }
  },
  //Send message to page without response
  postMessageToIDE:function(tId,_msg){
    _msg.toId=tId
    _msg.toPage="bzIde"
    _msg.toIFrameId=0
    _msg.fromPage="bzBg"


    if(_msg.return){
      let id=bgComm.getExeId()
      bgComm._exeMap[id]=_msg.return
      _msg.return=id
    }
    bgComm.postToTab(_msg)
  },
  postMessageToAppExtension:function(tId,_msg){
    _msg.toId=tId
    _msg.toPage="bzAppExtension"
    _msg.toIFrameId=_msg.toIFrameId||0
    _msg.fromPage="bzBg"

    if(_msg.return){
      let id=bgComm.getExeId()
      bgComm._exeMap[id]=_msg.return
      _msg.return=id
    }
    bgComm.postToTab(_msg)
  },
  getExeId:function(){
    bgComm._exeId=bgComm._exeId||Date.now()
    return bgComm._exeId++
  },
  exeScriptInExtension:function(_script,_tabId,_frameId,_sendResponse){
    console.log("exeScriptInExtension",_script,_tabId,_frameId)
    let _target={ tabId: parseInt(_tabId) }
    _target.frameIds=[parseInt(_frameId||0)]
    
    chrome.scripting.executeScript({
      target: _target,
      function: (_script) => {
        _doIt(Date.now())
        function _doIt(t){
          if(window.bzComm){
            eval(_script)
          }else if(location.href!="about:blank"){
            if(Date.now()-t<3000){
              setTimeout(()=>{
                _doIt(t)
              },1)
            }
          }
        }
      },
      args: [_script]
    },(result)=>{
      _sendResponse&&_sendResponse(result);
    });
  }
}
bgComm.init()