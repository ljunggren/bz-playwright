window.insertScript={
  _getPageRoot:function(){
    return `chrome-extension:/`+`/${bzComm.getBZId()}/`
  },
  insertJQuery:function(d,_fun){
    if(!window.jQuery || !jQuery.fn||!jQuery.fn.jquery){
      insertScript.insertJS("lib/jquery.min.v1.12.4.js",()=>{
        d&&BZ.assignShareData(d);
        extendJQuery()
        _fun&&_fun()
      })
    }else{
      _fun&&_fun()
    }
  },
  insertIDE:function(appLang,ideLang,_fun){
    insertScript.insertJS("ide/"+appLang+"/config.js",()=>{
      insertScript.insertJS("ide/"+ideLang+"/word.js",()=>{
        insertScript.insertJS("ide/main.js",()=>{
          _fun&&_fun()
        })
      })
    })
  },
  insertJS:function(d,_fun){
    var _script=document.createElement("script")
    _script.src=insertScript._getPageRoot()+d
    _script.onload=function(){
      _fun&&_fun()
    }
    if(document.body){
      document.body.appendChild(_script)
    }else{
      setTimeout(function(){
        insertScript.insertJS(d,_fun)
      },100)
    }
  },
  exeScript:function({script,$loop,$parameter,$test,$module,$project,$action,$group,$element,funMap},_fun){
    if($element){
      $element=$util.findDom($element)
    }
    if(funMap){
      Object.keys(funMap).forEach(k=>{
        eval(k+"="+funMap[k])
      })
    }
    try{
      let r=eval(script)
      if(r&&r.constructor==Promise){
        r.then(_end)
      }else if(r&&r.constructor==Function){
        r(_end)
      }else{
        _end()
      }
    }catch(e){
      _fun({
        _type:1,
        _msg:e.message
      })
    }

    function _end(v){
      Object.keys(funMap).forEach(k=>{
        eval("delete "+k)
      })
      _fun({
        _type:4
      })
    }
  }
}