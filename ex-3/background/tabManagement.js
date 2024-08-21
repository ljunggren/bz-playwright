class BZTab{
  relatedItems=[]
  constructor(t){
    this.id=t.tabId||t.id
    this.windowId=t.windowId
    this.url=t.url
    this.appIFrames={}
    let o=this
    if(!t.windowId){
      chrome.tabs.query({}, (tabs) => {
        tabs.find(x=>{
          if(x.id==o.id){
            o.windowId=x.windowId
          }
        })
      })
    }

    if(t.url.match(/(localhost|boozang\.com)\/extension/)){
      this.ide=1
    }else{
      let v=t.url.match(/^(.+)\/empty\.html\?bzIde=([0-9]+)\#/)
      if(v){
        this.app=1
        this.myIde=parseInt(v[2])
      }
    }
  }
}
const _tabManagement={
  _map:{},
  init:function(){
    chrome.storage.local.clear()
    chrome.tabs.onRemoved.addListener((t, removeInfo) => {
      _tabManagement._loadData(function(){
        let td=t.tabId||t
        let a=_tabManagement._map[td]
        if(!a){
          return
        }
        let i=_tabManagement._map[a.myIde]
        if(i){
          if(t.frameId){
            let p=_getParentFrame(a.appIFrames,t.parentFrameId)
            if(p){
              delete p[t.frameId]
            }
            _tabManagement._assignId({
              appIFrames:i.appIFrames
            },a.id)
          }else if(i.myApp==td){
            delete _tabManagement._map[td]
            i.myApp=""
            i.appIFrames={}
          }
          _tabManagement._assignId({
            app:i.myApp,
            appIFrames:i.appIFrames
          },i.id)
        }else if(!t.frameId){
          delete _tabManagement._map[td]
          _closeApp(a)
        }
      })
    });

    chrome.webNavigation.onErrorOccurred.addListener((t) => {
      _tabManagement._loadData(function(){
        let td=t.tabId||t
        let a=_tabManagement._map[td]
        if(!a){
          return
        }
        let i=_tabManagement._map[a.myIde]
        if(i){
          bgComm.postMessageToIDE(a.myIde,{
            scope:"BZ",
            fun:"infoLoadPageError",
            ps:[t]
          })
        }
      })
    })

    chrome.webNavigation.onCommitted.addListener((t) => {
      _tabManagement._loadData(function(){
        _loadTab(t)
      })
    });

    chrome.runtime.onInstalled.addListener(() => {
      chrome.tabs.query({}, (tabs) => {
          for (let tab of tabs) {
              if (tab.id&&(tab.url||"").match(/^http/)) {
                  chrome.scripting.executeScript({
                      target: { tabId: tab.id },
                      files: ["extension/content.js","extension/extensionCode.js","formatter/formatter.js"]
                  });
              }
          }
      });
    });


    function _loadTab(t){
      let a=_tabManagement._map[t.tabId||t.id]||new BZTab(t),f=t.frameId,pf=t.parentFrameId;
      _tabManagement._map[a.id]=a
      a.url=t.url
      if(a.ide){
        _closeApp(a)
        _tabManagement._assignId({ide:a.id,appIFrames:a.appIFrames},a.id)
        delete a.myApp
        _tabManagement._store()
      }else if(a.app){
        let i=_tabManagement._map[a.myIde]
        if(i){
          let fs=i.appIFrames
          if(i.myApp!=a.id){
            i.myApp=a.id
            fs={0:{}}
            if(f){
              fs[pf]={[f]:{}}
            }
          }else if(!f){
            fs={0:{}}
          }else{
            let p=_getParentFrame(fs,pf)
            if(p){
              p[f]={}
            }
          }
          a.appIFrames=i.appIFrames=fs
          _tabManagement._assignId({
            app:a.id,
            appIFrames:fs
          },i.id)
          _tabManagement._assignId({
            "bz-id":chrome.runtime.id,
            app:a.id,
            ide:i.id,
            appIFrames:fs
          },a.id)
          _tabManagement._store()
        }
      }
    }

    function _closeApp(a){
      if(a.myApp){
        bgComm.postToTab({
          page:"bzApp",
          toId:a.myApp,
          fun:"close",
          scope:"window"
        })
      }
    }

    function _getParentFrame(a,p){
      for(let k in a){
        if(k==p){
          return a[k]
        }else{
          let pp=_getParentFrame(a[k],p)
          if(pp){
            return pp
          }
        }
      }
    }
  },
  _buildMap:function(fun){
    if(Object.keys(_tabManagement._map).length){
      return fun()
    }
    _tabManagement._map={}
    chrome.tabs.query({}, (tabs) => {
      tabs=tabs.map(x=>new BZTab(x))
      tabs.forEach(t=>{
        _tabManagement._map[t.id]=t
      })
      _loadTabs(tabs)
    })

    function _loadTabs(ts){
      let t=ts.shift()
      if(t){
        if(t.ide){
          _tabManagement._askBZInfo(t,function(){
            if(t.myApp){
              let a=_tabManagement._map[t.myApp]
              if(a){
                a.myIde=t.id
                a.app=1
                a.appIFrames=t.appIFrames
              }
            }
            _loadTabs(ts)
          })
        }else{
          _loadTabs(ts)
        }
      }else{
        fun()
      }
    }
  },
  _getTabById: function(id,fun){
    _tabManagement._buildMap(function(){
      fun(_tabManagement._map[id])
    })
  },
  _assignId:function(d,id){
    d.appIFrames=JSON.stringify(d.appIFrames).replace(/"/g,"'")
    let _script=`BZ.assignId(${JSON.stringify(d)});`

    bgComm.exeScriptInExtension(_script,id)
  },
  _askBZInfo:function(t,_fun){
    bgComm.postMessageToIDE(t.id,{
      scope:"BZ",
      fun:"getIds",
      return:function(v){
        t.myApp=v.app
        t.appIFrames=JSON.parse((v.appIFrames||"{}").replace(/'/g,'"'))

        _fun()
      }
    })
  },
  _store:function(){
    chrome.storage.local.set({ "bz-tabs": _tabManagement._map });
  },
  _loadData:function(fun){
    if(!Object.keys(_tabManagement._map).length){
      chrome.storage.local.get("bz-tabs",function(d){
        if(d&&d["bz-tabs"]){
          _tabManagement._map=d["bz-tabs"]
          console.log("tabs loaded",_tabManagement._map)
          fun()
        }else{
          _tabManagement._buildMap(fun)
        }
      })
    }else{
      fun()
    }
  }
}
_tabManagement.init()