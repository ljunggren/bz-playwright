var innerScript={
  _insertJQuery:function(_root,_fun){
    var _script=document.createElement("script")
    _script.src=_root+"lib/jquery.min.v1.12.4.js"
    _script.onload=function(){
      _fun&&_fun()
    }
    document.body.appendChild(_script)
  },
  _insertExtraScript:function(_root,_fun){
    if(!window.$util){
      var _script=document.createElement("script")
      _script.src=_root+"page/pageExtra.js"
      _script.onload=function(){
        _fun&&_fun()
      }
      document.body.appendChild(_script)
    }else{
      _fun&&_fun()
    }
  },
  initScript:function(_root,d,_fun){
    console.log("initScript",bzComm.getIframeId())
    if(!window.jQuery || !jQuery.fn||!jQuery.fn.jquery){
      innerScript._insertJQuery(_root,()=>{
        innerScript._insertExtraScript(_root,_end)
      })
    }else{
      innerScript._insertExtraScript(_root,_end)
    }

    function _end(){
      d&&BZ.assignShareData(d);
      _fun&&_fun()
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