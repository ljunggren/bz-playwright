const _apiListenerManagement={
  _filterTypes:["xmlhttprequest", "main_frame","sub_frame"],
  _init:function(){
    chrome.webRequest.onBeforeRequest.addListener(function(v){
      _apiListenerManagement._postAPIInfo(v,"addReq")
    },{urls: ["<all_urls>"],types:_apiListenerManagement._filterTypes})
    
    
    chrome.webRequest.onBeforeRedirect.addListener(function(v){
      _apiListenerManagement._postAPIInfo(v,"addRep")
    },{urls: ["<all_urls>"],types:_apiListenerManagement._filterTypes})
    
    chrome.webRequest.onCompleted.addListener(function(v){
      _apiListenerManagement._postAPIInfo(v,"addRep")
    },{urls: ["<all_urls>"],types:_apiListenerManagement._filterTypes},["responseHeaders"])
    
    chrome.webRequest.onErrorOccurred.addListener(function(v){
      _apiListenerManagement._postAPIInfo(v,"addRep")
    },{urls: ["<all_urls>"],types:_apiListenerManagement._filterTypes})
  },
  _postAPIInfo:function(v,type){
    _tabManagement._loadData(function(){
      let t=_tabManagement._map[v.tabId]
      if(t&&t.myIde){
        bgComm.postMessageToIDE(t.myIde,{
          scope:"BZ",
          fun:type,
          ps:[v]
        })
      }
    })
  },
  _buildAjaxData:function(v){
    return {
      requestId:v.requestId,
      url:v.url,
      timeStamp:v.timeStamp,
      statusCode:v.statusCode,
      type:v.type,
      method:v.method,
      tabId:v.tabId,
      error:v.error
    }
  },
  _isDownloading:function(rs){
    for(var i=0;rs && i<rs.length;i++){
      var r=rs[i];
      if(r.name=="Content-Disposition" && (r.value.includes("attachment")||r.value.includes("filename"))){
        return 1
      }else if((r.name||"").toLowerCase()=="content-type" && (r.value.includes("application")||r.value.includes("stream"))){
        return 1
      }
    }
  }
}

_apiListenerManagement._init()