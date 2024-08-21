const bgComm={
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
      if(msg.page=="bzBg"){
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
              msg.page=msg.fromPage
              msg.toId=msg.fromId
              delete msg.fromId
              delete msg.fromPage
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
  //Send message to extension (ide or app)
  postToTab:function(msg){
    if(msg.toId){
      console.log("post message to",msg)
      chrome.tabs.sendMessage(parseInt(msg.toId),msg)
    }
  },
  //Send message to page without response
  postMessageToIDE:function(tId,_msg){
    _msg.toId=tId
    _msg.toPage="bzIde"
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
  exeScriptInExtension:function(_script,_tabId,_sendResponse){
    chrome.scripting.executeScript({
      target: { tabId: _tabId },
      function: (_script) => {
        _doIt()
        function _doIt(){
          if(window._bzEval){
            _bzEval._exe(_script)
          }else{
            setTimeout(_doIt,1)
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