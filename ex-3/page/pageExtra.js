var $util={
  extractData:function(d,k){
    return _extractData._extract(d,k)
  },
  wait:function(v){
    return (_fun)=>{
      setTimeout(_fun,v)
    }
  },
  continue:function(){

  },
  break:function(){
    
  },
  showJsonValidateResult:function(v,d){
    if(!d&&v.valid){
      d=v.valid
      v=v.data
    }
    _extractData._showTools(v,d)
  },
  refreshData:function(m,t,n){
    let d=$data(m,t)
    _ideDataHandler._takeData((_ideDataManagement._curMap[(m||"")+(t||"")]||[]).find(x=>x.name==n),d,m,t)
  },
  validateData:function(v,d,r){
    let url;
    r=r||[]
    if(!window.extensionContent){
      let url=location.protocol+"/"+"/"+location.host+location.pathname+"?id="+BZ._data._curProject._id+"#"+_ideLocation._getPath(0,_ideTask._data._curModule||_IDE._data._curModule,_ideTask._data._curTest||_IDE._data._curTest)
      if(_domActionTask._lastAction){
        // _domActionTask._lastAction._extractJsonData=v
        // _domActionTask._lastAction._validJsonData=d
        _domActionTask._lastAction._url=url
      }
    }
    v=_Util._unConvertObj(v)
    console.log("BZ-LOG: BZ-Start-Validating:"
                +"url: "+url
                +"-- Data --"
                +JSON.stringify(v)
                +"-- Validation --"
                +JSON.stringify(d)
                +"BZ-End-Validating");
    let rr= !!_extractData._checkData(v,d,r)
    if(!rr){
      if(window.$result){
        window.$result.msg=JSON.stringify(r,0,2)
      }
    }
    return rr
  },
  extendExtensionScript:function(c,_pos){
    let d={bz:1}
    if(_pos=="end"){
      _pos="extendEndScript"
    }else{
      _pos="extendTopScript"
    }
    d[_pos]=`try{${c}}catch(ex){alert(ex.message)}`
    bzComm.postToBackground({
      fun:"setTmpCode",
      scope:"bzUtil",
      ps:[_pos,c]
    })
  },
  extendExceptionScript:function(c,_pos){
    return $util.extendExtensionScript(c,_pos)
  },
  removeDuplicateData:function(d){
    if(d&&d.constructor==Array){
      let v,_idx=d.length-1;
      while(_idx>=0){
        v=d[_idx]
        for(let i=0;i<_idx;i++){
          if(_Util._isSameObj(d[i],v)){
            d.splice(_idx,1)
            break
          }
        }
        _idx--
      }
    }else if(d&&d.constructor==Object){
      Object.keys(lws).forEach(k=>{
        if(!lws[k]){
          delete lws[k]
        }
      })
    }
  },
  attachScreenshotToReport:function(v){
    v=v||["BZ.TW.document","BODY",0]
    let _curBack,r=_ideTask._data._curExeAction
    $util.takeScreenshot(v,(x)=>{
      $util.attachInfoToReport(x,r)
      _curBack&&_curBack()
    })
    return function(_back){
      _curBack=_back
    }
  },
  attachInfoToReport:function(v,r){
    window._ideReport&&_ideReport._attachInfo(v,r)
  },
  jsonToXML:function(_obj,_root) {
    if(!_root||_root===1){
      _root="data"
    }
    let _xml = '';
    for (let _prop in _obj) {
      let v=_obj[_prop]
      if(v&&v.constructor==Function){
        continue
      }
      _xml += v instanceof Array ? '' : "<" + _prop + ">";
      if (v instanceof Array) {
        for (let _array in v) {
          _xml += "<" + _prop + ">";
          _xml += $util.jsonToXML(new Object(v[_array]),1);
          _xml += "</" + _prop + ">";
        }
      } else if (typeof v == "object") {
        _xml += $util.jsonToXML(new Object(v),1);
      } else {
        _xml += v;
      }
      _xml += v instanceof Array ? '' : "</" + _prop + ">";
    }
    _xml=_xml.replace(/<\/?[0-9]{1,}>/g, '');
    if(_root&&_root!==1){
      _xml=`<${_root}>${_xml}</${_root}>`
    }
    return _xml
  },
  xmlToJson:function(x) {
    let j = {},cj,ps=[j],k;
    let xo=x.match(/<[^< \n>]+(>| |\n)/g);

    if(xo){
      xo.forEach(o=>{
        let i=x.indexOf(o)
        if(i){
          let xx=x.substring(0,i).trim();
          x=x.substring(i)
          if(xx[xx.length-1]==">"){
            xx=xx.substring(0,xx.length-1).trim()
            _addNode(k)
            k=""
            if(xx.endsWith("/")){
              xx=xx.substring(0,xx.length-1).trim()
              _parseProperties(xx,j)
              ps.shift()
              j=ps[0]
            }else{
              _parseProperties(xx,j)
            }
          }else{
            if($.isNumeric(xx)){
              j[k]=parseFloat(xx)
            }else{
              j[k]=xx
            }
            k=""
          }
        }
        x=x.substring(o.length).trim()

        if(o[0]=="<"){
          o=o.substring(1)
        }
        if(o[o.length-1]==">"){
          o=o.substring(0,o.length-1)
        }
        if(o[o.length-1]=="/"){
          return
        }
        if(o[0]=="/"){
          o=_glossaryHandler._getVariableName(o.substring(1),0,1)
          if(ps[1]&&(ps[1][o]==j||(ps[1][o]&&ps[1][o].constructor==Array&&ps[1][o].includes(j)))){
            ps.shift()
            j=ps[0]
          }
          return
        }else{
          if(k){
            _addNode(k)
          }
          k=_glossaryHandler._getVariableName(o,0,1)
        }
      })
    }
    return j;

    function _addNode(k){
      let d={}
      if(j[k]){
        if(j[k].constructor!=Array){
          j[k]=[j[k]]
        }
        j[k].push(d)
      }else{
        j[k]=d
      }
      j=d
      ps.unshift(d)
    }

    function _parseProperties(xx,j){
      let xxo=xx.match(/[^\s=]+=\s*"/g)
      if(xxo){
        let k;
        xxo.forEach(o=>{
          if(k){
            let i=xx.indexOf(o)
            let v=xx.substring(0,i)
            xx=xx.substring(i)
            _parseValue(v,j,k)
          }
          xx=xx.substring(o.length)
          o=o.substring(0,o.length-1).trim()
          o=o.substring(0,o.length-1)
          k=o=_glossaryHandler._getVariableName(o,0,1)
        })
        _parseValue(xx,j,k)
      }
    }

    function _parseValue(v,j,k){
      v=v.trim()
      if(v){
        j[k]=v.substring(0,v.length-1)
        if($.isNumeric(j[k])){
          j[k]=parseFloat(j[k])
        }
      }
    }
  },
  resetClient:function(){
  },
  getHostIdxByUrl:function(_url){
    _url=_url||location.href
    return BZ._getHostList().findIndex(x=>_Util._isSameHost(x.host,_url))
  },
  openApp:function(_url){
    TWHandler._openUrl(_url)
  },
  isMatch:function(d1,d2){
    if(d1==d2){
      return !0
    }else if(d1=="bz-skip"||d2=="bz-skip"){
      return !0
    }else if(d1&&d2&&d1.constructor==d2.constructor){
      if(d1.constructor==Array){
        if(d1.length==d2.length){
          for(let i=0;i<d1.length;i++){
            if(!$util.isMatch(d1[i],d2[i])){
              return !1
            }
          }
          return !0
        }
        return !1
      }else if(d1.constructor==Object){
        for(let k in d1){
          if(!$util.isMatch(d1[k],d2[k])){
            return !1
          }
        }
        for(let k in d2){
          if(d1[k]===undefined){
            return !1
          }
        }
        return !0
      }
      return d1==d2
    }else if(d1&&d1.constructor==Array&&d1.length&&d2&&d2.constructor==Object){
      return !d1.find(x=>{
        return !$util.isMatch(x,d2)
      })
    }
    return !1
  },
  //search d1 in d2
  includes:function(d1,d2){
    if(d1==d2){
      return 1
    }else if($util.isMatch(d1,d2)){
      return 1
    }
    if(!d2){
      return
    }else if(d2.constructor==Array){
      if(!d1||![Object,Array].includes(d1.constructor)){
        return d2.find(x=>x==d1)
      }else if(d1.constructor==Object){
        return d2.find(x=>$util.includes(d1,x))
      }
      return !d2.find(x=>!$util.includes(x,d1))
    }else if(d2.constructor==Object){
      if(!d1||![Object,Array].includes(d2.constructor)){
        return
      }else{
        for(let k in d2){
          if($util.includes(d1,d2[k])){
            return 1
          }
        }
      }
    }
  },
  getElementValue:function(e,fun){
    if(fun){
      return fun(e)
    }
    let os=$(e).find("input,textarea,select").toArray()
    let v;
    if(!os.length){
      if($(e).is("input,textarea,select")){
        os=[e]
      }
    }
    os.forEach(x=>{
      if(x.type=="radio"){
        if(x.selected){
          v=x.value
        }
      }else if(x.type=="checkbox"){
        if(x.checked){
          v=x.value||"on"
        }
      }else if(x.tagName=="SELECT"){
        v=v||""
        for(a of x.selectedOptions){
          v+=","+a.text
        }
        v=v.substring(1)||""
      }else if(x.getBoundingClientRect().width){
        let vv=x.value
        if(!v||vv.length>v.length){
          v=vv
        }
      }
    })
    if(v===undefined){
      v=e.innerText.trim()
    }
    return v
  },
  //getLanguage
  // getLanguage:function(){
  //   return BZ._data._uiSwitch._curAppLanguage
  // },
  //translate
  // translate:function(v){
  //   let i=_IDE._data._setting.appLanguages.indexOf(BZ._data._uiSwitch._curAppLanguage)
  //   if(i){
  //     let w=_appWordHandler._wordMap[v]
  //     if(w){
  //       return w[i-1]||v
  //     }
  //   }
  //   return v
  // },
  //randomItem
  randomItem:function(d){
    let i=Math.floor(Math.random()*Object.keys(d).length)
    let k=Object.keys(d)[i]
    return {key:k,value:d[k]}
  },
  //addLogData
  addLogData:function(d){
    _ideTask._logData=_ideTask._logData||[]
    console.log("BZ-LOG: addLogData:")
    for(var i=0;i<arguments.length;i++){
      let v=arguments[i]
      _ideTask._logData.push(v)
      console.log("BZ-LOG: "+JSON.stringify(v))
    }
  },
  //setLogData
  setLogData:function(d){
    _ideTask._logData=[]
    for(var i=0;i<arguments.length;i++){
      _ideTask._logData.push(arguments[0])
    }
  },
  //cleanLogData
  cleanLogData:function(){
    _ideTask._logData=[]
  },
  //log
  log:function(){
    let v=_Util._log(...arguments)
    if(window.extensionContent){
      bzComm.postToIDE({scope:"$console",fun:"output",ps:["App: "+v]});
      return
    }
    $console.output(v)
  },
  //takeScreenshot
  takeScreenshot:function(o,_fun){
    _bzDomPicker._flashTmpCover(o)
    let _callBack
    let f=(bf)=>{
      _callBack=bf
    }
    bzComm.postToBackground({
      scope:"bgUtil",
      fun:"getScreenshot",
      return:(v)=>{
        console.log(v)
        $util.CV=v
        _fun&&_fun(v)
        _callBack&&_callBack(v)
      },
      insertCallFun:1,
    })
    return f
  },
  //findDataInMap
  findDataInMap:function(map,o){
    for(let k in map){
      let v=map[k],found=1
      if(o){
        for(let kk in o){
          if(o[kk]!=v[kk]){
            found=0
            break
          }
        }
      }
      if(found){
        return v
      }
    }
  },
  // exeTests:function(ts){
  //   console.log(ts)
  //   _ideTask._exeTmpTasks(ts)
  // },
  //formatTimestamp
  formatTimestamp:function(t,f){
    return _Util._formatTimestamp(t,f)
  },
  addDate:function(d,v,u,f){
    if(d.constructor==String){
      d=new Date(d.replace(/(^|-|\/)([0])/g,"$1"))
    }
    if(u=="y"||u=="year"){
      d.setFullYear(d.getFullYear()+v)
    }else if(u=="m"||u=="month"){
      d.setMonth(d.getMonth()+v)
    }else if(u=="d"||u=="date"){
      d.setDate(d.getDate()+v)
    }
    if(f){
      d=$util.formatTimestamp(d.getTime(),f)
    }
    return d
  },
  parseBoolean:function(v){
    return !!v&&!v.toString().match(/^(false|0|off|undefined|null)$/i)
  },
  //getScenariosByTag
  getScenariosByTag:function(ts){
    return _ideObjHandler._getItemsByTag(ts,"scenario",1)
  },
  //getTestsBySuite
  getTestsBySuite:function(t,_fun){
    return _ideObjHandler._getRefTests(t,_fun)
  },
  //downloadFile
  downloadFile:function(_name,_content,_type){
    console.log("BZ-LOG: download-data-file:"+_name)
    _Util._downloadFile(_name,_content,_type)
  },
  //getTestsByTag
  getTestsByTag:function(ts){
    return _ideObjHandler._getItemsByTag(ts,"unit")
  },
  //isEmptyData
  isEmptyData:function(d){
    return d!==0&&(!d||$.isEmptyObject(d))
  },
  //gotoFlag
  gotoFlag:function(s){
    _ideTask._gotoFlag(s)
  },
  //getRoles
  getRoles:function(){
    try{
      let t=BZ._getCurTest(),
          m=BZ._getCurModule()
      
      return _aiAuthHandler._getRolesByHostId(t?t._data.hostId:m?m._data.defaultHostId:0)
    }catch(e){}
    return []
  },
  //getElementText
  getElementText:function(u,_chkSvg){
    if(u.constructor==Array){
      return u.map(v=>$util.getElementText(v,_chkSvg))
    }
  //    return u.innerText?u.innerText.trim():""
    /*
    if(!_back){
      var _time=Date.now()
    }
    */
    if(u.nodeType==3){
      return (u.textContent||"").trim()
    }else if(u.innerText===undefined){
      if(_chkSvg){
        u=$("<div>"+u.outerHTML+"</div>").appendTo(document.body);
        var v=u[0].innerText;
        u.remove()
        return v.trim()
      }else{
        return ""
      }
    }else if(!u.innerText||!u.innerText.trim()){
      return ""
    }
    if(["SCRIPT","NOSCRIPT","STYLE","SELECT","TEXTAREA"].includes(u.tagName)){
      return ""
    }else if(u.tagName=="BR"){
      return "\n"
    }
    var t="",co=0,lo=0,s,r=u.getBoundingClientRect();
    for(var i=0;i<u.childNodes.length;i++){
      var n=u.childNodes[i],tt="";
      if(n.nodeType==1){
        if(!_Util._isHidden(n)){
          tt=$util.getElementText(n,_chkSvg)
          co=n.getBoundingClientRect()
        }else{
          continue
        }
      }else if(n.nodeType==3){
        tt=n.textContent.trim()
        co=0
      }
      if(tt){
        if(lo){
          if(co){
            if(lo.bottom>co.top){
              s="\n"
            }else{
              s=" "
            }
          }else{
            if(lo.width+lo.left>=r.left+r.width-20){
              s="\n"
            }else{
              s=" "
            }
          }
        }else if(t){
          if(co){
            if(co.left==r.left){
              s="\n"
            }else{
              s=" "
            }
          }else{
            s=" "
          }
        }else{
          s=""
        }
        t+=s+tt
      }
    }
    /*
    if(!_back){
      $util._chkFunTime+=Date.now()-_time
    }
    */
    return t.trim()
  },
  //printDataToFile
  printDataToFile:function(f,d){
    if(f.toLowerCase().endsWith("csv")){
      d=_Util._toFileCSV($util.jsonToCSV(d))
    }else if(f.toLowerCase().endsWith("html")){
      d=_Util._toFileCSV(_Util._listToHtml(d))
    }else{
      d=JSON.stringify(d,0,2)
    }
    d=f+"\n"+d.trim()+"\n"
    console.log("BZ-OUTPUT-FILE:"+d+"BZ-OUTPUT-FILE-END")

  },
  //jsonToCSV
  jsonToCSV:function(d){
    if(d&&d.constructor==Array&&d.length){
        return Object.keys(d[0]).join(",")+"\n"+
      d.map(o=>{
        let v=""
        for(var k in o){
            let x=o[k]
            v+=x&&x.constructor==String?'"'+o[k].replace(/\"/g,'""')+'",':o[k]+','
        }
        return v.replace(/,(\n|$)/g,"\n").trim()
      }).join("\n")
    }
    return ""
  },
  //clearCookie
  clearCookie:function(_document){
    _document=_document||document;
    var cookies = _document.cookie.split("; ");
    for (var c = 0; c < cookies.length; c++) {
      var d = window.location.hostname.split(".");
      var _name=encodeURIComponent(cookies[c].split(";")[0].split("=")[0])
      // console.log(_name)
      _document.cookie = _name + '=; Max-Age=-99999999;';
    }
  //    _document.cookie.split(";").forEach(function(c) { _document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });
  },
  clearLocalStorage:function(_document){
    var _bzData=localStorage.getItem("bz-data");
    localStorage.clear();
    localStorage.setItem("bz-data",_bzData);
  },
  //p: data path. like: "$test.data"
  //resetData
  resetData:function(pp){
    let d,p=pp.split(".")
    switch(p[0]){
      case "$project":d=$data(0,0,1);break;
      case "$module":d=$data(BZ._getCurModule()._data.code,0,1);break;
      case "$test":d=$data(BZ._getCurModule()._data.code,BZ._getCurTest()._data.code,1);break;
      case "$parameter":d=BZ._getCurTest()._data.defParameter;break;
    }
    if(d){
      try{
        if(d.constructor==String){
          d=eval(d)
          _ideDataManagement._initRandomValue(d)
        }
        if(p.length>1){
          for(let i=1;i<p.length;i++){
            d=d[p[i]]
          }
          eval(pp+"=d",{},"set",pp,d)
        }else{
          pp=eval(pp)
          for(var k in d){
            pp[k]=d[k]
          }
        }
      }catch(e){}
    }
  },
  //generateDataByRegex
  generateDataByRegex:function(d,key,dd,kk,_notParseInsertCode){
    let _apiData
    d=_handleData(d,key,dd,kk)
    function _handleData(d,_key,dd,kk){
      if(!d){
      }else if([String,RegExp].includes(d.constructor)){
        let s=d.toString()
        if(s.match(/^[\/].+[\/]$/)){
          d= $util.generateWordsByRegex(s,_key,dd,kk)
        }else{
          d=!_notParseInsertCode&&s.match(/\{\{.+\}\}/)?_JSHandler._prepareData(s):s
        }
        if(d&&!window.extensionContent&&d.constructor==BZApiDataPicker){
          _apiData=d
        }
      }else if([Object,Array].includes(d.constructor)){
        for(var k in d){
          d[k]= _handleData(d[k],k,d,k,1)
        }
      }
      return d
    }
    
    if(_apiData){
      _apiDataHandler._registerExeFun(function(){
        _doIt(d)
      })
    }else{
      _doIt(d)
    }
    return d
    
    function _doIt(d){
      if(dd){
        if(dd.constructor==Function){
          dd(d)
        }else if(kk){
          dd[kk]=d
        }
      }
    }
  },
    /*
    examples:
    let vs=[
      "[a-z]+[0-9]+",
      "BZ-name",
      "{today}",
      "{today-10}",
      "{today+10|MM/dd/yyyy}",
      "{today-1week|MM/dd/yyyy}",
      "{today+w}",
      "{today-1M}",
      "{today+M|MM/dd/yyyy}",
      "{today-1Y}",
      "{today+Y|MM/dd/yyyy}",
      "{today+10y+2M+1|MM/dd/yyyy}",
      "{this-month-first}",
      "{this-month-first+10|MM/dd/yyyy}",
      "{this-month-first+10M-2}",
      "{date:08/30/2020|MM/dd/yyyy|yyyy-MM-dd}",
      "{date:08/30/2020+y+1|MM/dd/yyyy|yyyy-MM-dd}",
      "{this-month,3}",
      "{date:08/20/2020+y+2M+12+7m+33s+3h|MM/dd/yyyy|yyyy-MM-dd hh:mm:ss}",
      "{last-month-first+y+2M+12+7m+33s+3h|MM/dd/yyyy|yyyy-MM-dd hh:mm:ss}"
    ]
    vs.forEach(v=>{
      console.log(v+": "+$util.generateWordsByRegex("/"+v+"/"))
    })
    */
  //generateWordsByRegex
  generateWordsByRegex(r,_key,_ddd,_kkk){
    try{
      if(!r){
        return _return(r)
      }
      r=r.toString()
      
      if(_Util._hasInsertCode(r)){
        r=_JSHandler._prepareData(r)
        return _return(r)
      }else if(_Util._hasCode(r)){
        r=eval(r)
        return _return(r)
      }
      
      if(r[0]=="/"&&r[r.length-1]=="/"){
        r=r.substring(1,r.length-1)
      }
      if(r[0]=="/"&&r[r.length-1]=="/"){
        return _return("/"+r+"/")
      }

      r=_Util._getRegexByBZName(r)
      let _std=r.match(/\{(label|random:?|search[\: ]|search-list[\: ]|new[\: ]|exist-new[\: ]|exist[\: ]|exist-list[\: ]|date[\: ]|time[\: ]|num|time|date|module|this|next|last|today|tomorrow|yesterday|timestamp|textstamp|longtextstamp)[^\}]*\}/g)
      if(_std){
        if(_std[0]=="{label}"){
          return _Util._idToName($util.generateWordsByRegex(r.replace("{label}",_key||_bzMessage._common._description)));
        }else if(_std[0]&&_std[0].startsWith("{random")){
          return _return(_getRandom(_std[0]))
        }else if(_std[0]&&_std[0].startsWith("{exist")){
          console.log("BZ-LOG: "+_std[0])
          let v= _return(_getExist(_std[0]))
          return v
        }else if(_std[0]&&_std[0].startsWith("{new")){
          console.log("BZ-LOG: "+_std[0])
          return _return(_getCreate(_std[0]))
        }else if(_std[0]&&_std[0].startsWith("{search")){
          console.log("BZ-LOG: "+_std[0])
          return _return(_getSearch(_std[0]))
        }
        _std.forEach(s=>{
          let _stdValue=getStandard(s)
          let vs=r.split(s)
          let _result=""
          for(var i=0;i<vs.length;i++){
            _result+=vs[i]
            if(i<vs.length-1){
              _result+=_stdValue
            }
          }
          r=_result
        })
        return $util.generateWordsByRegex(r,_key,_ddd,_kkk)
      }else{
        _std=r.match(/\{data[\: ](.+)\}/)
        if(_std){
          _std=_std[1]
          _std=_std.replace(/[\=\>\<\!]/g,"")
          return _return(_std)
        }else{
          var vs=[];
          var m=1;
          if(m.constructor!=Number){
            m=1
          }
          for(var i=0;i<m;i++){
            vs.push(new RandExp(r).gen())
          }
          vs=vs[0]
          
          return _return(vs)
        }
      }
    }catch(e){}
    
    function _return(v){
      if(_ddd){
        if(_ddd.constructor==Function){
          _ddd(v)
        }else{
          _ddd[_kkk]=v
          if(v&&v.constructor==Promise){
            v.then(x=>_ddd[_kkk]=x)
          }
        }
      }
      return v===null?undefined:v
    }
    function _getRandom(vv){
      let v=vv.split(":")[1]
      if(v){
        v=v.substring(0,v.length-1)
        v=v.split("|")
        if(v[0].match(/^[0-9-\.]+$/)||_Util._hasCode(v[0])){
          return _getRandomNumber(v[0],v[1])
        }else if(v.length>1){
          v=$util.randomItem(v)
          if(v){
            return v.value
          }
        }
      }
      return "/"+vv+"/"
    }
    
    function _getRandomNumber(vv,ee){
      let v1,v2,e,v=vv.split(/[-~]/)
      if(_Util._hasCode(vv)){
        v=vv.split(/~/)
      }
      if(v.length>1){
        v1=parseFloat(_Util._stringToData(v[0]))
        v2=parseFloat(_Util._stringToData(v[1]));
      }else{
        v1=0
        v2=v;
      }
      let vvv=Math.random()*(v2-v1)+v1,l=1;
      if(v[0].match(/[0-9]+\.[0-9]+/)){
        l=v[0].split(".")[1].length
        l=Math.pow(10,l)
      }else if(v[1].match(/[0-9]+\.[0-9]+/)){
        l=v[1].split(".")[1].length
        l=Math.pow(10,l)
      }
      vvv=vvv*l
      v= Math.round(vvv)/l
      if(v>v2){
        v=v2
      }
      if(ee){
        e=ee.split(",")
        if(e.includes(v+"")&&v1!=v2){
          return _getRandomNumber(vv,ee)
        }
      }
      return v
    }
    
    async function _getExist(v){
      let s={};
      if(v.match(/\{exist-list[ :]/)){
        s={_list:1}
        v=v.replace(/\{exist-list[ :](.+)\}/,"$1")
      }else if(v.match(/\{exist-new[ :]/)){
        s={_new:1}
        v=v.replace(/\{exist-new[ :](.+)\}/,"$1")
      }else{
        v=v.replace(/\{exist[ :](.+)\}/,"$1")
      }
      return await _aiAPI._getExistData(v,s,_ddd,_kkk)
    }
    
    async function _getCreate(v){
      let s;
      v=v.replace(/\{new[ \:](.+)\}/,"$1")
      return await _aiAPI._createData(v,_ddd,_kkk)
    }
    async function _getSearch(v){
      let s={};
      if(v.match(/\{search-list[ :]/)){
        s={_list:1}
        v=v.replace(/\{search-list[ :](.+)\}/,"$1")
      }else if(v.match(/\{search-new[ :]/)){
        s={_new:1}
        v=v.replace(/\{search-new[ :](.+)\}/,"$1")
      }else{
        v=v.replace(/\{search[ :](.+)\}/,"$1")
      }
      return await _aiAPI._searchData(v,s,_ddd,_kkk)
    }

    function getStandard(v){
      let now=new Date(),n,d=new Date();
      var y=d.getFullYear(),m=d.getMonth();
      
      v=v.substring(1,v.length-1)
      v=v.split("|")
      if(v.length>1&&v[0].startsWith("date:")){
        return _getDate(v[0],v[1],v[2])
      }
      var w=v[0].match(/[a-z-]+[a-z]/),c;
      if(!w){
        w=v[0]
      }else{
        w=w[0]
        c=v[0].substring(w.length)
      }
      switch(w){
        case "now": 
        case "this":
        case "this-month":
        case "today": 
          break;
        case "num": 
          $project._tmpIdx=$project._tmpIdx||1
          return $project._tmpIdx++
        case "module": 
          let _tmpModule=window._tmpTakeDataModule||BZ._getCurModule()
          if(_tmpModule){
            return _tmpModule._data.name.replace(/[ ,\.-]+/g,"-")
          }
          return "Module"
        case "timestamp": return Date.now();
        case "time": return _Util._formatTimestamp(0,"hh:mm:ss");
        case "date": return _Util._formatTimestamp(0,"yyyy-MM-dd");
        case "this-month-first": 
          d.setDate(1)
          break;
        case "this-month-end":
          d.setDate(_getLastDate(d.getMonth()+1,d.getYear()))
          break;
        case "this-year-first": 
          d.setDate(1)
          d.setMonth(0)
          break;
        case "this-year-end":
          d.setMonth(11)
          d.setDate(31)
          break;
        case "tomorrow": 
          d=new Date(d.getTime()+86400000);
          break;
        case "longtextstamp":
          w=_Util._to62(parseInt(Date.now()/1000))
          if(_cooperatorHandler._data.inService){
            w+=_cooperatorHandler._data.key
          }
          return w
        case "textstamp":
          w=_Util._to36(parseInt(Date.now()/1000))
          if(_cooperatorHandler._data.inService){
            w+=_cooperatorHandler._data.key
          }
          return w
        case "timestamp":
          w=parseInt(Date.now()/1000)+""
          if(_cooperatorHandler._data.inService){
            w+=_cooperatorHandler._data.key
          }
          return w
        case "yesterday":
          d=new Date(d.getTime()-86400000);
          break;
        case "last-year":
          d.setYear(y-1);
          break
        case "last-year-first":
          d.setMonth(0)
          d.setDate(1);
          d.setYear(y-1);
          break
        case "last-year-end":
          d.setMonth(11)
          d.setDate(31);
          d.setYear(y-1);
          break
        case "last-month": 
          if(d.getMonth()){
            d.setMonth(d.getMonth()-1);
          }else{
            d.setMonth(11);
            d.setYear(y-1)
          }
          break
        case "last-month-first": 
          d.setDate(1);
          d.setMonth(d.getMonth()-1);
          break
        case "last-month-end": 
          d.setDate(1);
          if(d.getMonth()){
            d.setMonth(d.getMonth()-1);
          }else{
            d.setMonth(11);
            d.setYear(y-1)
          }
          d.setDate(_getLastDate(d.getMonth()+1,d.getYear()));
          break
        case "last-hour":
          d=new Date(d.getTime()-3600000)
          break
        case "last-minute":
          d=new Date(d.getTime()-60000)
          break
        case "last-second":
          d=new Date(d.getTime()-1000)
          break
        case "last-mon":
          n=6
        case "last-tus":
        case "last-tue":
            n=n||5
        case "last-wed":
          n=n||4
        case "last-thu":
          n=n||3
        case "last-fri":
          n=n||2
        case "last-sat":
          n=n||1
        case "last-sun":
          n=n||7
          d=new Date(d.getTime()-86400000*(n+d.getDay()))
          break
        case "next-year":
          d.setYear(y+1);
          break
        case "next-year-first":
          d.setMonth(0)
          d.setDate(1);
          d.setYear(y+1);
          break
        case "next-year-end":
          d.setMonth(11)
          d.setDate(31);
          d.setYear(y+1);
          break
        case "next-month": 
          d.setMonth(d.getMonth()+1);
          break
        case "next-month-first":
          d.setDate(1);
          d.setMonth(d.getMonth()+1);
          break
        case "next-month-end": 
          d.setMonth(d.getMonth()+1);
          if(d.getMonth()+1==12){
            d.setDate(_getLastDate(0,d.getYear()+1));
          }else{
            d.setDate(_getLastDate(d.getMonth()+1,d.getYear()));
          }
          break
        case "next-hour":
          d=new Date(d.getTime()+3600000)
          break
        case "next-minute":
          d=new Date(d.getTime()+60000)
          break
        case "next-second":
          d=new Date(d.getTime()+1000)
          break
        case "next-mon":
          n=8-now.getDay();
        case "next-tus":
        case "next-tue":
          n=n||9-now.getDay();
        case "next-wed":
          n=n||10-now.getDay();
        case "next-thu":
          n=n||11-now.getDay();
        case "next-fri":
          n=n||12-now.getDay();
        case "next-sat":
          n=n||13-now.getDay();
        case "next-sun":
          n=n||7-now.getDay()
          d=new Date(d.getTime()+86400000*n)
          break
        case "this-mon":
          n=n||1
        case "this-tus":
        case "this-tue":
          n=n||2
        case "this-wed":
          n=n||3
        case "this-thu":
          n=n||4
        case "this-fri":
          n=n||5
        case "this-sat":
          n=n||6
        case "this-sun":
          n=n||0
          if(n){
            d=new Date(now.getTime()+86400000*(n-now.getDay()))
          }else{
            d=new Date(now.getTime()-86400000*now.getDay())
          }
      }
      
      if(c){
        if(c[0]==","){
          //for this month, last month, next month only
          d.setDate(parseInt(c.substring(1)))
        }else{
          d=_countDay(d,c)
        }
      }
      
      
      if(v.length==1){
        v.push(_IDE._data._setting.dateFormat||"yyyy-MM-dd")
      }
      return _Util._formatTimestamp(d.getTime(),v[1].replace(/Y/g,"y").replace(/D/g,"d"));
      // for(var i=1;i<v.length;i++){
        // if(v[i].match(/^[0-9]+$/)){
          // d.setDate(parseInt(v[1]))
        // }else if(v[i].match(/^[0-9]+-[0-9]+$/)){
          // var vv=v[i].split("-")
          // d.setDate(parseInt(vv[1]))
          // d.setMonth(parseInt(vv[0])-1)
        // }else if(v[i]=="end"){
          // d.setDate(_getLastDate(d.getMonth()+1,d.getFullYear()))
        // }else{
          // return v[i].replace(/yyyy/i,d.getFullYear())
                 // .replace(/yy/i,_Util._formatNumberLength(d.getFullYear()%100))
                 // .replace(/MM/,_Util._formatNumberLength(d.getMonth()+1))
                 // .replace(/dd/i,_Util._formatNumberLength(d.getDate()))
                 // .replace(/hh/i,_Util._formatNumberLength(d.getHours()))
                 // .replace(/mm/,_Util._formatNumberLength(d.getMinutes()))
                 // .replace(/ss/i,_Util._formatNumberLength(d.getSeconds()))
                 // .replace(/M/,d.getMonth()+1)
                 // .replace(/d/i,d.getDate())
                 // .replace(/h/i,d.getHours())
                 // .replace(/m/,d.getMinutes())
                 // .replace(/s/i,d.getSeconds())
        // }
      // }
      
    }
    
    function _getLastDate(m,y){
      if([1,3,5,7,8,10,12].includes(m)){
        return 31
      }else if(m==2){
        return y%4?28:29
      }
      return 30
    }
    
    function _countDay(d,v){
      if(v){
        v=v.match(/[+-]([0-9]*y|[0-9]*M|[0-9]*w|[0-9]*d|[0-9]*h|[0-9]*m|[0-9]*s|[0-9]+)/gi)
        v&&v.forEach(vv=>{
          vv=vv.match(/([-+])([0-9]*)(y|Y|M|w|W|h|H|d|D|m|S|s)*/)
          if(!vv[2]){
            vv[2]=1
          }
          v=parseInt(vv[1]+vv[2])
          
          switch(vv[3]){
            case "Y":
            case "y":d.setYear(d.getFullYear()+v);break;
            case "M":d.setMonth(d.getMonth()+v);break;
            case "W":
            case "w":d.setDate(d.getDate()+v*7);break;
            case "H":
            case "h":d.setHours(d.getHours()+v);break;
            case "m":d.setMinutes(d.getMinutes()+v);break;
            case "S":
            case "s":d.setSeconds(d.getSeconds()+v);break;
            case "d":
            case "D":
            default:
              d.setDate(d.getDate()+v)
          }
        })
      }      
      return d
    }
    //d: date, pf: parse date format, ft: format to
    function _getDate(d,pf,ft){
      d=d.substring(5)
      ft=ft||pf
      let f1=pf.split(_Util._allSign),
          f2=pf.split(_Util._allLetterAndNumber),
          d1=d.split(_Util._allSign),
          d2=d.split(_Util._allLetterAndNumber),c,ii=0,i=0,df={},fd="",
          ff=/yyyy|YYYY|yy|YY|MM|M|DD|dd|D|d|HH|H|hh|h|mm|m|SS|ss|S|s/g,
          di=["yy","yyyy","YY","YYYY","MM","M","DD","dd","D","d","HH","hh","H","h","mm","m","SS","ss","S","s"]
          
      _Util._spliceAll(f1,a=>{return !a})
      _Util._spliceAll(f2,a=>{return !a})
      _Util._spliceAll(d1,a=>{return !a})
      _Util._spliceAll(d2,a=>{return !a})
      d1.splice(f1.length)
      d2.splice(f2.length)
      if(f1.length){
        if(f1.length==1){
          i=f1[0].length
        }else{
          i=f1.reduce((v,o)=>{
            return (v.length||v)+(o?o.length:0)
          })
        }
      }
      if(f2.length){
        if(f2.length==1){
          ii=f2[0].length
        }else{
          ii=f2.reduce((v,o)=>{
            return (v.length||v)+(o?o.length:0)
          })
        }
      }
      i+=ii
      c=d.substring(i)
      d=d.substring(0,i)
      
      f1.forEach((v,j)=>{
        v=v.match(ff)
        v&&v.forEach(vv=>{
          if(v.length==1){
            df[vv]=d1[j]
          }else{
            df[vv]=d1[j].substring(0,vv.length)
            d1[j]=d1[j].substring(vv.length)
          }
        })
      })

      // di.forEach(v=>{
        // fd+=df[v]||""
        // if(
      // })
      d=new Date()
      d.setDate(1)
      for(let kk in df){
        let k=kk[0]
        if(k=="D"||k=="d"){
          let v=df[kk]
          delete df[kk]
          df[kk]=v
        }
      }
      for(let kk in df){
        let k=kk[0],
            v=df[kk]
            v=parseInt(v)||v
        switch(k){
          case "Y":
          case "y":
            if(kk.length==2){
              if(v>70){
                v+=1900
              }else{
                v+=2000
              }
            }
            d.setYear(v);
            break;
          case "M":d.setMonth(v-1); break;
          case "D":
          case "d":d.setDate(v);break;
          case "H":
          case "h":d.setHours(v);break;
          case "m":d.setMinutes(v);break;
          case "S":
          case "s":d.setSeconds(v);
        }
      }
      
      d=_countDay(d,c)
      return _Util._formatTimestamp(d.getTime(),ft)
    }
  },
  triggerHover:function(o){
    let cs=_cssHandler._findHoverCssByElement(o)||[]
    cs.forEach(x=>{
      let o=x.o
      o._tmpClass=o._tmpClass||("bz"+bzComm._newId())
      $(o).addClass(o._tmpClass)
      let c=x.v.split(":hover")
      let _last=c.pop()
      let _key=c.pop()
      c=c.join("")+_key+"."+o._tmpClass+_last
      let v=x.css.split("{")
      v.shift()
      v="{"+v.join("{")
      o._rule=c+v
      _Util._addCSSRule(o._rule)
    })

    return cs
  },
  //triggerKeyEvents
  triggerKeyEvents:function(o,k,ch,c,a,s,_fun){ //c:ctrl, a:alt, s:shift
        if(_Util._isSysButton(o)&&[13,32].includes(k)){
            return $util.triggerMouseEvents(o,"click",0,0,0,0,0,_fun)
    }

    $(o).focus();
    setTimeout(()=>{
      // o._bzSetKeyPress=0;
      try{
        $util.triggerKeyEvent(o,"keydown",k,ch,c,a,s)
      }catch(e){
        _domActionTask._doLog("util: "+1345+" "+e.stack)
      }
      _exe("_keydownDone",function(){
        if((!c && !a) || _Util._checkBrowserType().name=="firefox"){
          if(_Util._isHidden(o)){
            return _finalFun()
          }
          $util.triggerKeyEvent(o,"keypress",k,ch,c,a,s)
          _exe("_keypressDone",function(){
            if(_Util._isHidden(o)){
              return _finalFun()
            }
            $util.triggerKeyEvent(o,"textInput",k,ch,c,a,s);
            if(_Util._isHidden(o)){
              return _finalFun()
            }
            $util.triggerKeyEvent(o,"input",k,ch,c,a,s);
            if(_Util._isHidden(o)){
              return _finalFun()
            }
            try{
              $util.triggerKeyEvent(o,"keyup",k,ch,c,a,s);
              if(k==9 && ["INPUT","SELECT","A","LINK","BUTTON","TEXTAREA"].includes(o.tagName)){
                _Util._focusNextByTab(o)
              }
            }catch(ex){
            }
            _finalFun()
          })
        }else{
          $util.triggerKeyEvent(o,"keyup",k,ch,c,a,s);
          _finalFun()
        }
      })
    },1)
    function _exe(k,_next,_timer){
      _timer=_timer||Date.now()
      if(o[k]||Date.now()-_timer>50){
        o[k]=0
        console.log("next ...")
        return _next()
      }
      setTimeout(function(){
        console.log(k)
        _exe(k,_next,_timer)
      },1)
    }
    
    function _finalFun(){
      _fun&&_fun()
    }
  },
  //triggerKeyEvent
  triggerKeyEvent:function(o,e,k,ch,c,a,s){
    if(!o){
      return
    }

    $(o).focus()
    o._bzKey=ch
    o._bzKeyCode=k
    if(ch&&o.maxLength&&o.maxLength>0&&o.maxLength<=(o.value+"").length){
      return
    }
    if(!e.startsWith("key")){
      e="key"+e;
    }
    if(e=="keypress"){
      k=ch;
    }
    if(!o._bzSetKeyPress){
      o._bzSetKeyPress=1;
      
      $(o).keydown(function(_event){
        this._keydownDone=1
        this._bCancel=_event.originalEvent.cancelBubble
      });
      $(o).keypress(function(_event){
        this._keypressDone=1
        if(!this._bCancel && !_event.originalEvent.isTrusted){
          if(this._bzKey && (this.tagName=="TEXTAREA" || (this.tagName=="INPUT" && this._bzKey))){
            this.value+=String.fromCharCode(this._bzKey);
          }else if(this._bzKeyCode==13 && ["INPUT","SELECT"].includes(this.tagName)){
            var f=_Util._getParentByTagName(this,"FORM")
            if(f){
              var o=$(f).find("input[type=submit]")[0]
              if(o){
                f.submit()
              }else{
                f.dispatchEvent(new Event("submit"));
              }
            }
          }
        }
        this._bCancel=0
      })
    }
    
  //    if(!window.extensionContent){
  //      var k = new KeyboardEvent(e, {bubbles:true});
  //      Object.defineProperty(k, 'charCode', {get:function(){return e=="keypress"?ch:0;}});
  //      Object.defineProperty(k, 'keyCode', {get:function(){return k;}});
  //      Object.defineProperty(k, 'which', {get:function(){return k;}});
  //      Object.defineProperty(k, 'key', {get:function(){return String.fromCharCode(ch);}});
  //      Object.defineProperty(k, 'code', {get:function(){return 'Key'+String.fromCharCode(ch).toUpperCase();}});
  //      Object.defineProperty(k, 'composed', {get:function(){return true;}});
  //      k.charCodeVal = ch
  //      o.dispatchEvent(k);
  //    }else{
    let _jsPath

    o.focus()
    if(document.activeElement!=o){
            o.bzTmp=_cssHandler._findPath(o)
      _Util._setFindDomJS(o)
    //   _jsPath=o._jsPath
    // }else{
    //   _jsPath="document.activeElement"
    }

    // let _key=k==13?"Enter":k==9?"Tab":k==32?"Space":String.fromCharCode(ch),
    //     _code=k==13?"Enter":k==9?"Tab":k==32?"Space":'Key'+String.fromCharCode("+ch+").toUpperCase()
    // var s="(function(){const o="+_jsPath+";const k = new KeyboardEvent('"+e+"', {bubbles:true}); "
    //      +"Object.defineProperty(k, 'charCode', {get:function(){return "+(e=="keypress"?ch:0)+";}});"
    //      +"Object.defineProperty(k, 'keyCode', {get:function(){return "+k+";}});"
    //      +"Object.defineProperty(k, 'which', {get:function(){return "+k+";}});"
    //      +"Object.defineProperty(k, 'key', {get:function(){return '"+_key+"';}});"
    //      +"Object.defineProperty(k, 'code', {get:function(){return '"+_code+"';}});"
    //      +"Object.defineProperty(k, 'composed', {get:function(){return true;}});"
    //      +"k.charCodeVal = "+(ch||0)+";"
    //      +"o.dispatchEvent(k);})();"
    // var d=o.ownerDocument.createElement("script");
    // d.innerHTML=s;
    // o.ownerDocument.body.parentNode.append(d);
    // d.remove()
    setTimeout(()=>{
      o._keydownDone=1
    },10)
  //    }
    
  },
  //o:element, e:event, b:button, x, y, c:ctrlKey, a:alt, s:shift, t:target,tr:dataTransfer
  //triggerMouseEvent
  triggerMouseEvent:function(o,e,b,x,y,c,a,s,tr,_fun){
    if(!o){
      return
    }else if(o.constructor==Array){
      o.forEach(oo=>{
        $util.triggerMouseEvent(oo,e,b,x,y,c,a,s,tr)
      })
      return _fun&&_fun()
    }

    var _curWin=_Util._getWindowFromDom(o);
    if(o.tagName=="CANVAS"&&o.bzTxtElement&&(["click","mousedown","dblclick"].includes(e)||("mouseup"==e&&x==-1&&y==-1))){
      let r=o.getBoundingClientRect(),
          te=o.bzTxtElement;
      if(o._offset){
        x=o._offset.x
        y=o._offset.y
      }else{
        x=r.left+te.x+te.w/2
        y=r.top+te.y+te.h/2
      }
    }
    b=parseInt(b||1);
    x=parseInt(x||0)
    y=parseInt(y||0)
    if(b==2 && e=="click"){
      e="contextmenu"
    }else if(e=="click"){
      b=0
    }
    var ps={
      'view': _curWin,
      'bubbles': true,
      //composedPath:$util.getComposedPath(o),
      'cancelable': true,
      buttons:parseInt(b),
      ctrlKey:c,
      metaKey:false,
      altKey:a,
      shiftKey:s,
      clientX:x,
      clientY:y,
      pointerX:x,
      pointerY:y,
      relatedTarget:null
    },_event
    if(tr){
      ps.dataTransfer=tr;
      ps.target=o;
      _event = new DragEvent(e, ps);
    }else{
      _event = new MouseEvent(e, ps);
    }
    o.dispatchEvent(_event);
    if(e=="mouseover"){
      o.dispatchEvent(new MouseEvent("mouseenter",ps));
    }else if(e=="mousedown"){
      o.dispatchEvent(new MouseEvent("pointerdown",ps));
    }else if(e=="mouseup"){
      o.dispatchEvent(new MouseEvent("pointerup",ps));
    }else if(e=="mousemove"){
      o.dispatchEvent(new MouseEvent("pointermove",ps));
    }
    if(_fun){
      _fun()
    }
  },
  // getComposedPath:function(o){
    
  // },
  //triggerFocusEvent
  triggerFocusEvent:function(o){
    var _event=new FocusEvent("focus")
    o.dispatchEvent(_event)
  },
  //triggerWheelEvent
  triggerWheelEvent:function(o,x,y,z,c,a,s){
    var _event = new WheelEvent({
      'view': _curWin,
      'bubbles': true,
      'cancelable': true,
      ctrlKey:c,
      metaKey:false,
      altKey:a,
      shiftKey:s,
      deltaX:v,
      deltaY:v,
      deltaZ:v
    });
    o.dispatchEvent(_event);
    
  },
  //triggerDblClickEvents
  triggerDblClickEvents:function(o,b,x,y,c,a,s){
    $util.triggerMouseEvents(o,b,x,y,c,a,s)
    $util.triggerMouseEvents(o,b,x,y,c,a,s)
    $util.triggerMouseEvent(o,"dblclick",b,x,y,c,a,s);
  },
  //triggerMouseEvents
  triggerMouseEvents:function(o,b,x,y,c,a,s,_fun){
    x=x||1
    y=y||1
    let _focus=$(":focus")[0]
    this.triggerMouseEvent(o,"mouseenter",0,x,y,c,a,s);
    this.triggerMouseEvent(o,"mouseover",0,x,y,c,a,s);
    this.triggerMouseEvent(o,"mousemove",0,x,y,c,a,s);
    this.triggerMouseEvent(o,"mousedown",b,x,y,c,a,s);
    if(o.tagName=="CANVAS"&&o.bzTxtElement){
      this.triggerMouseEvent(o,"mouseup",b,-1,-1,c,a,s);
    }else{
      this.triggerMouseEvent(o,"mouseup",b,x,y,c,a,s);
    }
    this.triggerMouseEvent(o,"click",b,x,y,c,a,s);
    let _focus2=$(":focus")[0]
    if(_Util._isFocusable(o)){
      if(!_focus2||_focus2==_focus){
        this.triggerFocusEvent(o)
      }
    }else if(_focus2){
      _focus2.blur()
    }
    if(_fun){
      _fun()
    }
  },
  //triggerChangeEvent
  triggerChangeEvent:function(o,v,_blur,_result,_withEnter,_withSubmit,_fun,_noAutoSelect){
    if(!_withEnter&&!_withSubmit&&o.tagName=="INPUT"&&o.type!="file"){
      _Util._preTriggerEvent()
    }else{
      _noAutoSelect=1 
    }
    var ff,ov=v;

    o.focus()
    _doIt()
    // $util.triggerMouseEvents(o,1,0,0,0,0,0,function(){
    //   setTimeout(()=>{
    //   },v=="christina@pivohub"?3000:0)
    // })
  //    o.value=this._getRealWord(o,v);
    function _doIt(){
      try{
        if(!_Util._isStdInputElement(o)){
          if(!o.attributes["contenteditable"]&&(!v||$util.getElementText(o).includes(v)||v.startsWith("/{random"))){
            return $util.triggerMouseEvents(o,1,0,0,0,0,0)
          }else if(o.attributes["contenteditable"]){
            o.innerHTML=v;
          }
        }else if(o.tagName=="SELECT"){
          v=v.toLowerCase().trim()
          var _best=0,_found;
          for(var i=0;i<o.options.length;i++){
            var t=o.options[i].text || o.options[i].textContent||"";
            t=t.toLowerCase()
            if(v==t){
              o.options[i].selected=_found=true;
              break
            }else if(v.includes(t)){
              if(t.length>_best){
                _best=t.length
                o.options[i].selected=_found=true;
              }
            }else if(t.includes(v)){
              if(v.length>_best){
                _best=v.length
                o.options[i].selected=_found=true;
              }
            }
          }
          if(!_found&&_result){
            _result._type=2;
            _result._msg=_Util._formatMessage(_bzMessage._action._setValueFailed,[ov])
          }
        }else if(o.type=="file"){
          _uploadHandler._setFileValue(o,v);
        }
        
        try{
          if(o.type!="file"){
            //trigger react event
            if(o.tagName=="INPUT"){
              o.value=v
              var nativeInputValueSetter = Object.getOwnPropertyDescriptor(o.ownerDocument.defaultView.HTMLInputElement.prototype, "value").set;
              nativeInputValueSetter.call(o,v);
            }else if(o.tagName=="TEXTAREA"){
              o.value=v
              var nativeInputValueSetter = Object.getOwnPropertyDescriptor(o.ownerDocument.defaultView.HTMLTextAreaElement.prototype, "value").set;
              nativeInputValueSetter.call(o,v);
            }else if(o.tagName!="SELECT"){
              if(o.value!=v){
                o.value=v
              }
            }
          }
          var event = new Event("input", { bubbles: true });
          o.dispatchEvent(event);
        }catch(e){
          _domActionTask._doLog("util 1664: "+e.message)
          BZ._reportAppInfo("error on Set: "+e.stack)
        }
        try{
          var event = new Event("change", { bubbles: true });
          o.dispatchEvent(event);
        }catch(e){
          console.log(e.stack);
        }
        if(_withEnter){
          $util.triggerEnterEvent(o);
          _doFinal()
        }else if(_withSubmit){
          let _form=_Util._getParentElementByCss("form",o)
          if(_form){
                        _doFinal()
            _form.submit()
            return
          }
                    _doFinal()
        }else if(!_noAutoSelect){
                    return _autoClickMenuAfterSetValue(v,o,_doFinal)
        }else{
                    return _doFinal()
        }
      }catch(eee){
                _domActionTask._doLog("util: "+eee.stack)
        console.log(eee.stack);
        _doFinal()
      }
    }

    // 
    function _doFinal(){
      if(_blur){
        $util.triggerBlurEvent(o);
      }
      _domActionTask._doLog("util: "+1709+(_fun?1:0))
      if(_fun){
        let _tmp=_fun
        _fun=0
        _tmp()
      }
      
    }
    function _autoClickMenuAfterSetValue(v,dom,_afterFun){
            if(!_handleDiff(v,dom,_afterFun)){
        if(!_Util._isHidden(dom)){
                    $util.triggerKeyEvents(dom,null,null,false,false,false,_afterFun);
        }else{
                    _afterFun&&_afterFun()
        }
        setTimeout(()=>{
          if(!_Util._isHidden(dom)){
                        _handleDiff(v,dom)
          }
        },50)
      }else{
              }
    }

    function _handleDiff(v,dom,_afterFun){
      try{
        let _diff=_Util._getDiffAfterTriggerEvent()
        if(_diff){
          _diff=$(_diff).find(`:Contains(${v})`).toArray()
          if(_diff.length){
            _diff=_diff.filter((x,i)=>{
              if(_diff.length-i>1){
                return !$(_diff[i]).find(_diff[i+1])[0]&&x.getBoundingClientRect().width>20
              }else{
                return 1
              }
            })
            if(_diff.length){
              let ds=_diff.filter(x=>x.getBoundingClientRect().width&&x.innerText.trim())
              if(!ds.length){
                return
              }else{
                _diff=ds
              }
              ds=_diff.filter(x=>x.innerText.trim().toLowerCase().startsWith(v.toLowerCase()))
              if(ds.length){
                _diff=ds
              }
              if(_diff.find(x=>{
                if(_Util._isInMenu(x,o)){
                  _domActionTask._doLog("Click menu: "+x.outerHTML)
                  $util.triggerMouseEvents(x,1,0,0,0,0,0,function(){
                                        $util.triggerKeyEvents(dom,null,null,false,false,false,_afterFun);
                  })
                  return 1
                }
              })){
                return 1
              }
            }
          }
        }
      }catch(ex){
        BZ._reportAppInfo("Set input 88: "+ex.message+"\n"+ex.stack)
      }
    }
  },
  triggerEnterEvent:function(o){
    // 选择要触发事件的元素
    let d={
      key: "Enter",
      keyCode: 13,
      code: "Enter",
      which: 13,
      bubbles: true,
      cancelable: true
    }
    // 创建并触发 keydown 事件
    let e = new KeyboardEvent("keydown", d);
    o.dispatchEvent(e);

    // 创建并触发 keypress 事件
    e = new KeyboardEvent("keypress", d);
    o.dispatchEvent(e);

    // 创建并触发 keyup 事件
    e = new KeyboardEvent("keyup", d);
    o.dispatchEvent(e);
  },
  triggerTabEvent:function(o){
    // 选择要触发事件的元素
    let d={
      key: 'Tab',
      keyCode: 9,
      code: 'Tab',
      which: 9,
      bubbles: true,
      cancelable: true
    };
    // 创建并触发 keydown 事件
    let e = new KeyboardEvent("keydown", d);
    o.dispatchEvent(e);

    // 创建并触发 keypress 事件
    e = new KeyboardEvent("keypress", d);
    o.dispatchEvent(e);

    // 创建并触发 keyup 事件
    e = new KeyboardEvent("keyup", d);
    o.dispatchEvent(e);
  },
  //triggerBlurEvent
  triggerBlurEvent:function(o,_fun){
    window.focus();
    if(window.extensionContent){
      var _path=_Util._getQuickPath(o)
      bzComm.postToApp({
        fun:"triggerEventOnApp",
        scope:"$util",
        ps:[_path,"Event",["blur"]],
        insertCallFun:1,
        return:_fun
      })
    }else{
      $util.triggerEventOnApp(o,"Event",["blur"],_fun)
    }
  },
  triggerEventOnApp:function(o,e,eps,_fun){
    o=_Util._getElementByQuickPath(o)
    e=new window[e](...eps)
    o.dispatchEvent(e)
    _fun&&_fun()
  },
  findDoms:function(p){
    let o=_Util._findDoms(p)
    return o.toArray?o.toArray():o
  },
  //findDom
  findDom:function(paths,_errOnHidden){
    var os=_Util._findDoms(paths,_errOnHidden)
    if(os){
      os=os[0]
    }
    return window.$element=os
  },
  getParameterFromUrl:function(k,_url){
    let p={}
    _url=(_url||location.search).substring(1)
    _url.split("&").forEach(function(v){
      v=v.split("=")

      if(v[0]){
        p[v[0]]=v[1]
      }
    })
    return k?p[k]:p
  },
  //isDomExist
  isDomExist:function(p){
    return Boolean($util.findDom(p))
  },
  //nextKey
  // nextKey:function(d,ck){
  //   var _bNext=!ck && ck!=0;
  //   for(var k in d){
  //     if(k==ck){
  //       _bNext=true;
  //     }else if(_bNext){
  //       return k;
  //     }
  //   }
  //   return null;
  // },
  //getCurEnvironment
  getCurEnvironment:function(){
    var v= _Util._clone(BZ._curEnv)
    v.items.forEach((o,i)=>{
      let t=_aiAuthHandler._data[i]
      if(t){
        o.token=t.tokenValue
      }
    })
    return v;
  },
  getTokenByHostId:function(i){
    if(i===undefined){
      i=BZ._getCurTest()
      if(i){
        i=i._data.hostId
        i=_aiAuthHandler._getTokenHostIdxByUIHostIdx(i)
      }
    }
    return _aiAuthHandler._getToken(i||0)
  },
  setToken:function(v,i){
    if(v){
      if(v.constructor==String){
        v=v.trim()
        v.replace(/^authorization[^a-z0-1](.+)/i,"$1");
        v={
          Authorization:v
        }
      }
      if(i===undefined){
        i=_IDE._getDefaultAPIHostIdx()||0
      }
      _aiAuthHandler._setToken({
        tokenValue:v,
        _tokenHost:i
      })
    }
  },
  //removeToken
  removeToken:function(i){
    $aiAPI.removeToken(i)
  },
  //getCurEnvironmentIdx
  getCurEnvironmentIdx:function(){
    return _IDE._data._setting.curEnvironment
  },
  //setEnvironment
  setEnvironment:function(v){
    _IDE._data._setting.curEnvironment=v
    BZ._curEnv=_IDE._data._setting.environments[v];
    BZ._setSharedData({
      "BZ._curEnv":BZ._curEnv,
      "_IDE._data._setting.curEnvironment":_IDE._data._setting.curEnvironment
    })
  },
  //getCoopStatus
  getCoopStatus:function(d,n){
    return _cooperatorHandler._getCoopStatus(d,n)
  },
  //getCoopStatus
  getCoopStatus:function(d,n){
    return _cooperatorHandler._getCoopStatus(d,n)
  },
  //getCoopStatus
  getCoopStatus:function(d,n){
    return _cooperatorHandler._getCoopStatus(d,n)
  },
  //getCoopKey
  getCoopKey:function(){
    return _cooperatorHandler._data.key||0
  },
  //getCoopScope
  getCoopScope:function(){
    return _cooperatorHandler._data.inService?_cooperatorHandler._data.scope:""
  },
  //getCoopGroup
  getCoopGroup:function(){
    return _cooperatorHandler._data.inService?_cooperatorHandler._data.group:""
  }
}
/*******************************************************************************
//AI Functions
*******************************************************************************/
$aiAPI={
  // getModelAlias:function(o){
  //   if(o.constructor!=String){
  //     o=_descAnalysis._retrieveTextForElementPathItem(_cssHandler._findPath(o))||_descAnalysis._retrieveTextForElementPathItem(_cssHandler._findInputPath(o))||""
  //   }
  //   return _Util._toCamelWords(_Util._toSingularWord(o))
  // },
  //To generate test case by parameter: key
  getAccessTest:function(p,m){
    return _aiAPI._getAccessTest(p,m)
  },
  isSkipValue:function(v){
    return _aiAPI._isSkipValue(v)
  },
  deleteRef:function(d,k,m){
    _aiAPI._deleteRef(d,k,m)
  },
  //updateDataStatus
  updateDataStatus:function(data,step){
    _aiAPI._updateDataStatus(data,step)
  },
  //getExeSolutionByParameter
  getExeSolutionByParameter:function(p,toCreate){
    return _aiAPI._getExeSolutionByParameter(p,toCreate)||[]
  },
  async getExistData(express,takeList,data,key){
    if(takeList&&takeList.constructor!=Object){
      takeList={_list:1}
    }
    return await _aiAPI._getExistData(express,takeList||{},data,key)
  },
  searchData:function(express,takeList,data,key){
    if(takeList&&takeList.constructor!=Object){
      takeList={_list:1}
    }
    _aiAPI._searchData(express,takeList||{},data,key)
  },
  searchOrNewData:function(express,data,key){
    _aiAPI._searchData(express,{_new:1},data,key)
  },
  newData:function(express,data,key){
    _aiAPI._createData(express,data,key)
  },
  async initCurModuleData(fun){
    let d=_IDE._data._curModule._data
    return await _aiAPI._getExistData(d.alias||d.code,{_list:1},fun)
  },
  //removeToken
  removeToken:function(i){
    return _aiAPI._removeToken(i)
  },
  //addData
  addData:function(p,m,k){
    return _aiAPI._addData(p,m,k)
  },
  getModuleDataMap:function(m){
    return _aiAPI._getSysCtrlDataMap(m)
  },
  //updateData
  updateData:function(p,m,k){
    return _aiAPI._updateData(p,m,k)
  },
  //deleteData
  deleteData:function(p,m,k){
    return _aiAPI._deleteData(p,m,k)
  },
  rebuildData:function(d){
    return _aiAPI._rebuildData()
  },
  removeData:function(m,d){
    return _aiAPI._removeData(m,d)
  },
  //preHandleParameter
  preHandleParameter:function(p,t,m){
    return _aiAPI._preHandleParameter(p,t,m)
  },
  //getAllDataOfCurModule
  getAllDataOfCurModule:function(p){
    return _aiAPI._getAllDataOfCurModule(p)
  },
  //getAllRelatedDataOfCurModule
  getAllRelatedDataOfCurModule:function(m,mc){
    return _aiAPI._getAllRelatedDataOfCurModule(m,mc)
  },
  //stopRegexAction
  // stopRegexAction:function(r,p,k){
  //   return _aiAPI._stopRegexAction(r,p,k)
  // },
  //getCurRefModuleData
  // getCurRefModuleData:function(d,dn,k){
  //   return _aiAPI._getCurRefModuleData(d,dn,k)
  // },
  //assignCurtUser
  assignCurtUser:function(p){
    return _aiAPI._assignCurtUser(p)
  },
  //getAuthFlowByRole
  getAuthFlowByRole:function(t){
    return _aiAPI._getAuthFlowByRole(t)
  },
  getAccount:function(d,p){
    if(p&&p.constructor==Object){
      return p
    }
    return d.find((x,i)=>{
      if(!p){
        return 1
      }else if(p.constructor==String){
        return x.role==p
      }else{
        for(var k in p){
          if(p[k]!=x[k]){
            return
          }
        }
        return 1
      }
    })||d.find(x=>x.username==p)
  },
  //overwriteExistValue
  overwriteExistValue:function(d){
    return _aiAPI._overwriteExistValue(d)
  },
  //parseInnerData
  parseInnerData:function(d){
    return _aiAPI._parseInnerData(d)
  },
  getModuleDataById:function(v,m){
    return _aiAPI._getModuleDataById(v,m)
  },
  retrieveExistData:function(m,f,d){
    return _aiAPI._retrieveExistData(m,f,d)
  },
  toJSONParameter:function(v,fn,_insertIgnoreSubmit){
    v=v===null||v===undefined?{}:v
    if(v.constructor!=Object){
      let vv={}
      vv[fn]=v
      v=vv
    }
    if(_insertIgnoreSubmit){
      v.$ignoreSubmit=1
    }
    return v
  },
  getUpdateParameter:function(d,p){
    let n={}
    for(let k in p){
      if(d[k]!=p[k]){
        n[k]=p[k]
      }
    }
    return n
  }
}
//---------------------------------------------------------------------------------------------//
//Remove output function content
for(let k in $util){
  $util[k].toString=function(){}
}

for(let k in $aiAPI){
  $aiAPI[k].toString=function(){}
}

var __=function(v,c,_tab){
  if(!v){
    if(_IDE._data._curAction){
      BZ._log("_IDE._data._curAction")
    }else if(_IDE._data._curTest){
      BZ._log("_IDE._data._curTest")
    }else if(_IDE._data._curModule){
      BZ._log("_IDE._data._curModule")
    }else{
      BZ._log("_IDE._data._curVersion")
    }
    BZ._log("_IDE._data._curProject,_curVersion,_curModule,_curTest,_curAction,_Util,_CtrlDriver,_setting,_debug")
  }
  v=v||_IDE._data._curAction

  if(!v){
    var t=_IDE._data._curTest,m=_IDE._data._curModule,s=_IDE._data._curVersion.setting;
    var k=BZ._data._curPage._key;
    if(t){
      t=t._data;
      switch (k){
        case "_actions":v=t.actions;break;
        case "_data":v=t.dataMap;break;
      }
    }else if(m){
      v=m._data.dataMap
    }else{
      switch (k){
        case "_defaultData":v=s.defaultData;break;
        case "_service":v=s.service;break;
        // case "_preferences":v=curUser._curProject.setting.subscriptions;break;
        // case "_dictionary":v=s.dictionary;break;
        // case "_objectLib":v=s.objectLib;break;
        case "_contentPolice":v=s.content;break;
        case "_alias":v=s.aliasMap;break;
        case "_record":v=s.record;break;
      }
    }
  }
  if(_tab===undefined){
    _tab=2
  }
  return JSON.stringify(v,c,_tab);
}

function extendJQuery(){
  if(jQuery.expr[":"].include){
    return
  }

  var _bzExJQueryFun=/\:(attr|Contains|contains|hidden|show|input|data|link|near|panel|afterEqual|after|before|containCss|css|endContains|endEqual|equal|RowCol|rowcol|bz|textElement|blank|Attr|text) *(=|$)/g;

  /**
   * includes other element
   */
  jQuery.expr[":"].include= function(a,i,m){
    if(_Util._isIgnoreElement(a)){
      return
    }
    m=m[3]

    if(!document._include||document._include.k!=m||Date.now()-document._include._time>1000){
      document._include={_time:Date.now(),k:m}
      
      m=m.replace(/\\:/g,":\r")
      let s=m.match(/[\-]? *\{[^\}]+\}/g)||[m]
      s=s.map(x=>{
        let n=x.match(/^([\-]? *)\{/)||""
        if(n){
          n=n[1].trim()
          if(n){
            x=x.substring(1)
          }
        }
        x=x.trim()
        if(x.match(/^\{.+\}$/)){
          x=x.substring(1,x.length-1)
        }

        let v=x.match(_bzExJQueryFun),vs=[]
        if(v){
          v.forEach(y=>{
            let i=x.indexOf(y)
            vs.push(x.substring(0,i))
            x=x.substring(i+y.length)
          })
          vs.push(x)
          x=vs.map((y,i)=>{
            y=y.trim().replace(/[:]\r/g,":")
            if(i){
              let vv=v[i-1].replace(/=$/,"").trim()
              if(y){
                y=vv+"("+y+")"
              }else{
                y=vv
              }
            }
            return y
          }).join("")
        }
        x=$(x).toArray()
        return {n:n,x:x}
      })
      document._include.os=s
    }
    return !document._include.os.find(x=>{
      let xx=$(a).find(x.x)[0]
      return x.n?xx:!xx
    })
  }

  jQuery.expr[":"].text=function(a,i,m){
    if(_Util._isIgnoreElement(a)){
      return
    }
    var v2=m[3].toLowerCase().trim();
    if(!v2){
      return
    }
    v2=v2.replace(/\s+/," ")
    if(a.nodeType!=1){
      return
    }

    if(!document._text||document._text.k!=m[3]||Date.now()-document._text._time>1000){
      let f=document.body;

      // let o=_Util._findLabel(f,v2)

      // if(!o.length&&!_Util._isRegexData(v2)&&!v2.includes("|")){
      //   let vv=_Util._removeSign(v2," ")
      //   o=_Util._findLabel(f,vv,1)
      // }
      // o=o.map(x=>_cssHandler._findCellElement(x.o))

      let o=$(":Contains("+v2+")",f).toArray() 
      o=o.filter((x,i)=>{
        let n=o[i+1]
        return o.tagName=="LABEL"||_Util._isCellElement(o)||!n||!$(x).find(n)[0]
      })
      let _label=o.filter(x=>x.tagName=="LABEL")
      o=o.filter(x=>x.tagName!="LABEL")
      o.unshift(..._label)
      
      if(!o.length||!o.find(x=>x.innerText.trim().toLowerCase()==v2.toLowerCase())){
        let ks=_IDE._data._setting.content.contentAttribute.replace("placeholder","").replace(/\|\|/g,"|")
        let oa=$(`:attr(${ks}=${v2})`).toArray()
        if(!oa.length){
          oa=$(`input:attr(value=${v2})`).toArray()
          ks=["value"]
        }else{
          ks=ks.split("|")
        }
        if(oa.length){
          oa.forEach(x=>x._bzWordLength=_findBestAttrValue(x,ks))
          oa.sort((a,b)=>a._bzWordLength-b._bzWordLength)
          
          o=oa.filter(x=>x._bzWordLength==oa[0]._bzWordLength)
        }
      }

      document._text={
        _time:Date.now(),
        k:m[3],
        as:o
      }
    }

    let as=document._text.as
    return as.includes(a)||$(as).find(a)[0]||(["A","BUTTON"].includes(a.tagName)&&$(a).find(as)[0])
    function _findBestAttrValue(a,ks){
      let aa="";
      ks.forEach(x=>{
        x=a.attributes[x]||{}
        x=x.value
        if(x){
          if(x.toLowerCase().includes(v2.toLowerCase())){
            if(!aa||aa.length>x.length){
              aa=x
            }
          }
        }

      })
      a._bzWordLength=aa.length
      return aa.length
    }
  }

  jQuery.expr[":"].attr=function(a,i,m){
    if(_Util._isIgnoreElement(a)){
      return
    }
    return _chkAttr(a,i,m)
  }

  jQuery.expr[":"].Attr=function(a,i,m){
    if(_Util._isIgnoreElement(a)){
      return
    }
    return _chkAttr(a,i,m,1)
  }

  function _chkAttr(aa,i,m,_full){
    var v2=m[3],a=aa;
    v2=v2.split("=")
    var v1=v2.shift()
    v2=v2.join("=")

    v1=v1.replace("*","").trim()
    v1=v1.split("|")
    return v1.find(v1=>{
      if(v1!="value"){
        a=aa.attributes[v1]
      }
      if(a && a.value){
        try{
          if(_Util._isRegexData(v2)){
            v2=eval(v2)
            return a.value.match(v2)
          }
          if(v2.endsWith("\" i")||v2.endsWith("\i i")){
            v2=v2.substring(1,v2.length-3)
          }
          v2=_Util._filterTxt(v2)
          v2=_Util._trimSpace(v2)
          v1=_Util._filterTxt(a.value)
          
          if(v1==v2||(!_full&&v1.toLowerCase().includes(v2.toLowerCase()))){
            a._bzJq="attr"
            a._bzJqVal=v1
            return true
          }
        }catch(e){
          if(v1==v2){
            a._bzJq="attr"
            a._bzJqVal=_Util._filterTxt(a.value)
            return true
          }
        }
      }
    })
  }

  jQuery.expr[":"].Contains = function(a,i,m){
    if(_Util._isIgnoreElement(a)){
      return
    }
    m=m[3]

    if(!document._Contains||document._Contains.k!=m||!document._Contains._tag.includes(a.tagName)||a._Contains||Date.now()-document._Contains._time>1000){
      // console.log("pre-handle-dom: "+m)
      // console.log("init Contains: "+a.tagName+","+m)
      let v2=m;
      if(!document._Contains||document._Contains.k!=m||Date.now()-document._Contains._time>1000){
        document._Contains=0
      }
      let _inHidden=jQuery._inHidden
      
      let _inRegex=_Util._isRegexData(v2)
      if(_inRegex){
        v2=v2.substring(1,v2.length-1)
        v2=new RegExp(v2,"im")
      }else{
        v2=v2.trim().toLowerCase();
        v2=_Util._filterTxt(v2)
        v2=v2.replace(/\*/g,".*")
      }
      let os=_Util._getElementsByWord(function(w){
        w=(w||"").trim().toLowerCase();
        if(_inRegex){
          return w.match(v2)
        }else{
          w=_Util._filterTxt(w)
          return _Util._includesWord(w,v2,1)
        }
      },a.tagName,document._Contains?document._Contains._inHidden:_inHidden,_Util._getRootDom(a))
      if(document._Contains){
        document._Contains._tag.push(a.tagName)
        document._Contains.os=document._Contains.os.concat(os)
      }else{
        document._Contains={
          _inHidden:_inHidden,
          _tag:[a.tagName],
          k:m,
          os:os,
          _time:Date.now()
        }
        jQuery._inHidden=_inHidden
      }
    }
    return document._Contains.os.includes(a)
  };

  jQuery.expr[":"].hidden= function(a,i,m){
    if(_Util._isIgnoreElement(a)){
      return
    }
    return _Util._isHidden(a)
  }

  jQuery.expr[":"].show= function(a,i,m){
    return true
  }

  jQuery.expr[":"].panel=function(a,i,m){
    if(_Util._isIgnoreElement(a)){
      return
    }
    var v2=_Util._toTrimSign(m[3].toLowerCase());
    if(!v2){
      return
    }
    v2=v2.replace(/\s+/," ")
    if(a.nodeType!=1){
      return
    }

    if(!document._panel||document._panel.k!=m[3]||Date.now()-document._panel._time>1000){
      let os=_cssHandler._findNodeByTxt(document.body,v2),oo=new Set();
      if(!os.length&&!_Util._isRegexData(v2)&&!v2.includes("|")){
        let vv=_Util._removeSign(v2," ")
        os=_cssHandler._findNodeByTxt(document.body,vv,1)
      }
      os.forEach(x=>{
        let ss=[]
        _findPanelByHeader(x,ss)
        ss.forEach(y=>oo.add(y))
      })

      document._panel={
        _time:Date.now(),
        k:m[3],
        as:[...oo],
        _tags:new Set()
      }
    }
    
    return document._panel.as.includes(a)
    function _findPanelByHeader(x,ss){
      let e=x.e,
  //        c=_cssHandler._getUniqueClass(x.o),
          f=_cssHandler._retrieveFontInfo(x.o),
          _start,_hasPreHeader,
          pp=_cssHandler._getBetterParent(x.e);
      while(e.parentElement){
        let p=e.parentElement
        for(let c of p.children){
          if(c==e){
            _start=1
            ss.push(c)
          }else if(!_Util._isHidden(c)){
            if(_start){
              
              let os=$(c).find(x.o.tagName).toArray()
              if(x.o.tagName==c.tagName){
                os.unshift(c)
              }
              if(!os.find(y=>{
                if(!_Util._isHidden(y)){
                  y=_cssHandler._retrieveFontInfo(y)
                  return _Util._isSameObj(f,y)
                }
              })){
                ss.push(c)
              }else{
                return ss
              }
            }else{
              _hasPreHeader=1
            }
          }
        }
        if(p==pp||_cssHandler._isFixedAbsoluteElement(p)||p.previousElementSibling||p.tagName=="BODY"){
          if(_hasPreHeader){
            return ss
          }
          ss.length=0
          ss.push(p)
          return ss
        }
        e=p
      }

    }
  }

  jQuery.expr[":"].match=function(a,i,m){
    if(_Util._isIgnoreElement(a)){
      return
    }
    m=m[3]
    if(!_Util._isRegexData(m)){
      m="/"+m+"/"
    }
    m=eval(m)
    return (a.innerText||"").trim().match(m)
    
  }
  jQuery.expr[":"].input=function(a,i,m){
    if(_Util._isIgnoreElement(a)){
      return
    }
    var v2=m[3].toLowerCase().trim();
    if(!v2){
      return
    }
    v2=v2.replace(/\s+/," ")
    if(a.nodeType!=1){
      return
    }

    if($util._tmpFormForSearchingInput||!document._input||document._input.k!=m[3]||Date.now()-document._input._time>1000){
      let f=$util._tmpFormForSearchingInput||_cssHandler._findForm()||document.body;
      $util._tmpFormForSearchingInput=0
      let o=_Util._findLabel(f,v2),
          os=new Set()

      if(!o.length&&!_Util._isRegexData(v2)&&!v2.includes("|")){
        let vv=_Util._removeSign(v2," ")
        o=_Util._findLabel(f,vv,1)
      }
      o.forEach(x=>{
        let ss=[]
        _findInputByLabel(x,ss)
        ss.forEach(y=>os.add(y))
      })
      os=[...os]

      if(!os.length||!os.find(x=>_Util._isStdInputElement(x)||_Util._isInContentEditable(x))){
        let oos=$(`:attr(${_IDE._data._setting.content.contentAttribute}=${v2})`).toArray()
        _Util._spliceAll(oos,x=>{
          if(!_Util._isInputObj(x)||(_Util._isHidden(x)&&!["checkbox","radio"].includes(x.type))){
            return 1
          }
        })
        if(oos.length){
          os=oos
        }
      }

      let ios=$(os).find("input").toArray().filter(x=>["checkbox","radio"].includes(x.type))
      if(ios.length){
        os=ios
      }

      document._input={
        _time:Date.now(),
        k:m[3],
        as:os,
        _tags:new Set()
      }
    }

    
    return document._input.as.includes(a)||$(document._input.as).find(a)[0]
    
    function _findInputByLabel(o,os){
      if(o.e&&o.e.tagName=="LABEL"){
        let k=o.e.attributes.for
        if(k){
          k=$("#"+k.value.replace(/([^0-9a-zA-Z\_\-])/g,"\\$1"))[0]
          if(k){
            os.push(k)
            return
          }
        }
        let oo=_Util._findInputs(o.e,1)
        if(oo.length){
          os.push(...oo)
          return
        }
      }
      if(o.ks.length){
        o.ks.find(x=>{
          let oo=_Util._findInputs(x,1)
          if(oo.length){
            os.push(...oo)
            return 1
          }
        })
      }
      if(os.length){
        return
      }
      let e=o.e
      while(e&&e.tagName!="TD"&&e.nextElementSibling){
        if(_cssHandler._findSamilarElementByStyle(e.nextElementSibling,o.o).length){
          break
        }
        if(_cssHandler._findSamilarElementByStyle(e.nextElementSibling,o.e).length){
          break
        }
        if(e==o.e){
          let _chkbox=_findCheckboxInPreviousElement(e)
          if(_chkbox){
            os.push(_chkbox)
            break
          }
        }
        let oo=_Util._findInputs(e.nextElementSibling,1)
        oo=oo.filter(x=>!_Util._isHidden(x))
        os.push(...oo);
        
        if(!os.length){
          if(_cssHandler._lookLikeInput(o.e,e.nextElementSibling)){
            os.push(e.nextElementSibling)
            break
          }
        }else{
          break
        }
        e=e.nextElementSibling
      }
      if(os.length){
        return
      }
      if(o.ks.length==1){
        os.push(...o.ks)
      }else if(o.ks.length>1){
        os.push(_Util._getShareParent(o.ks[0],o.ks[1]))
      }
      if(!os.length&&o.e){
        o.e=o.e.parentElement
        _findInputByLabel(o,os)
      }
    }
    
    function _findCheckboxInPreviousElement(e){
      let p=e.previousElementSibling
      if(p){
        if(p.tagName=="INPUT"&&p.type=="checkbox"){
          return p
        }else if(!p.innerText){
          let cs=$(p).find("input[type=checkbox]")
          if(cs.length){
            return cs[cs.length-1]
          }else{
            return _findCheckboxInPreviousElement(p)
          }
        }
      }
    }
    
  }


  jQuery.expr[":"].data=function(a,i,m){
    let r=jQuery.expr[":"].input(a,i,m)
    if(r){
      var vv=_Util._removeSign(m[3]).toLowerCase().trim();
      if(_Util._isInputObj(a)){
        if(a.type=="checkbox"){
          a.bzData=a.checked
        }else if(a.type=="radio"){
          a.bzData=$(`input[name=${a.value}]:checked`).val()
        }else if(_Util._isInContentEditable(a)){
          a.bzData=a.innerText
        }else{
          a.bzData=$(a).val()
        }
      }else{
        let v=a.innerText
        v=v.split(/[:：]/)
        if(v.length>1){
          if(vv==_Util._removeSign(v[0].toLowerCase())){
            a.bzData=v[1]
          }
        }else{
          a.bzData=a.innerText
        }
      }
    }
    return r
  }

  jQuery.expr[":"].link=function(a,i,m){
    if(_Util._isIgnoreElement(a)){
      return
    }
    var v2=_Util._toTrimSign(m[3].toLowerCase());
    if(!v2){
      return
    }
    v2=v2.replace(/\s+/," ")
    if(a.nodeType!=1){
      return
    }

    /******************* New Code start *****************************************/
    if(!document._link||document._link.k!=v2||Date.now()-document._link._time>1000){
      let vs=v2.split("|"),oo=[]
      vs.forEach(v=>{
        let o=_Util._getTargetElement($(":endContains("+v+")")),os=[],ss=$("*")

        if(!o.length){
          o=$(":Contains("+v+")").toArray()
          o=_Util._getCeilDom(o)
        }
        if(!o.find(x=>x.innerText==v)){
          os=$("INPUT").toArray().filter(x=>["image","submit","button","reset"].includes(x.type)&&_Util._toTrimSign(x.value.toLowerCase())==v2)
          if(!os.length){
            os=$(`:attr(${_IDE._data._setting.content.contentAttribute}=${v2})`).toArray()
          }
          if(!os.length){
            os=o
          }
        }else{
          os=o
        }
        oo=oo.concat(os)
      })
      
      let os=oo.filter(x=>["A","BUTTON","INPUT"].includes(x.tagName))
      
      if(!os.length){
        os=oo.map(x=>_Util._getParentElementByCss("button,a",x)).filter(x=>x)
        if(!os.length){
          os=oo
        }
      }

      document._link={
        _time:Date.now(),
        k:v2,
        as:os,
        _tags:new Set()
      }
    }

    
    return document._link.as.includes(a)
  }

  jQuery.expr[":"].near = function(a,i,m){
    if(_Util._isIgnoreElement(a)){
      return
    }
    let v2=m[3]
    let _inRegex=_Util._isRegexData(v2)
    if(!v2){
      return
    }
    if(!_inRegex){
      v2=_Util._toTrimSign(v2.toLowerCase());
      v2=v2.replace(/\s+/," ")
    }else{
      _inRegex=eval(v2)
    }
    if(a.nodeType!=1){
      return
    }

    /******************* New Code start *****************************************/
    if(!document._near||document._near.k!=v2||a._near||Date.now()-document._near._time>1000){
      let _inHidden=jQuery._inHidden
      let o=_Util._getTargetElement($(":endContains("+v2+")"))
      _Util._spliceAll(o,x=>{
        return _Util._isHidden(x)
      })
      if(!o.length){
        o=$(":Contains("+v2+")").toArray()
        o=_Util._getCeilDom(o)
        _Util._spliceAll(o,x=>{
          return _Util._isHidden(x)
        })
      }

      document._near={
        _inHidden:_inHidden,
        o:o,
        _time:Date.now(),
        k:v2,
        as:new Set(),
        _tags:new Set()
      }
    }  

    if(document._near._inHidden){
      if(!_Util._isHidden(a)){
        return
      }
    }else{
      if(_Util._isHidden(a)){
        return
      }
    }
    _searchCandiate(a)
    if(!document._near.as.has(a)){
      return
    }
    /******************* New Code end *********************************************/
    v2=_Util._toTrimSign(v2,30)
    if(BZ._tmpNearRegexKey!=v2){
      BZ._tmpNearRegexKey=v2
      v2=_Util._filterTxt(v2);
      v2=_Util._trimSpace(v2)
      BZ._tmpNearRegex=v2.replace(/\*/g,".*")
    }
    var v1=_Util._findNearTxt(a,BZ._tmpNearRegex)
    if(v1){
      if((_inRegex&&v1.match(_inRegex))||(!_inRegex&&_Util._includesWord(v1,BZ._tmpNearRegex,1))){
        a._bzJq="near"
        a._bzJqVal=v1
        return true
      }
    }
    return false
    
    function _searchCandiate(a){
      let d=document._near
      if(d._tags.has(a.tagName)){
        return
      }
      d._tags.add(a.tagName)
      let o=Object.assign([],d.o)
      let oo=o.map(x=>x.getBoundingClientRect()),as=new Set(),_loop=0;
      while(oo.length&&_loop<3){
        
        for(let i=0;i<o.length;i++){
          let x=o[i]
          let p=x.parentElement
          if(!p||p.tagName=="BODY"){
            return
          }
          o[i]=p
          let os=$(p).find(a.tagName).toArray()
          if(os.length){
            os.forEach(y=>as.add(y))
            if(_Util._isCellElement(a)){
              o.splice(i,1)
              oo.splice(i--,1)
            }
          }
        }
        if(!o[0]||o[0].tagName=="BODY"){
          break
        }
        if(as.size){
          if(d._inHidden){
            break
          }
          _loop++
          for(let i=0;i<oo.length;i++){
            let or=o[i].getBoundingClientRect()
            if(or.width- oo[i].width>100&&or.height- oo[i].height>100){
              oo.splice(i,1)
              o.splice(i--,1)
            }
          }
        }
      }
      as=[...as]
      as.forEach(x=>d.as.add(x))
    }
  };

  jQuery.expr[":"].next= function(a,i,m){
    return a.nextElementSibling
  }

  jQuery.expr[":"].previous= function(a,i,m){
    return a.previousElementSibling
  }

  jQuery.expr[":"].parent= function(a,i,m){
    return a.parentNode
  }

  jQuery.expr[":"].afterEqual= function(a,i,m){
    return jQuery.expr[":"].after(a,i,m,"endEqual")
  }
  jQuery.expr[":"].after= function(a,i,m,_equal){
    if(_Util._isIgnoreElement(a)){
      return
    }
    m=m[3]
    if(a.nodeType!=1 ||a.type=="hidden"){
      return
    }

    if(!document._after||document._after.k!=m||a._after||Date.now()-document._after._time>1000){
      let _inHidden=jQuery._inHidden,
          _panel=jQuery.tmpPanel
      if(_panel&&_panel.constructor!=jQuery){
        _panel=$(_panel)
      }
      let o,os=_inHidden?$("*"):_Util._getAllVisableElementsInJQ();
      if(_isSubSelector(m)){
        o=$(m)[0]
      }else{
        o=_Util._getTargetElement($(":"+(_equal||"endContains")+"("+m+")"))
        
        _Util._spliceAll(o,x=>{
          return (_panel&&!_panel.find(x)[0])||_Util._isHidden(x)
        })
        if(!o.length){
          o=$(":Contains("+m+")").toArray()
          _Util._spliceAll(o,x=>{
            return (_panel&&!_panel.find(x)[0])||_Util._isHidden(x)
          })
          o=o.pop()
        }else{
          o=o[0]
        }
        jQuery._inHidden=_inHidden
      }

      document._after={
        _panel:_panel,
        _inHidden:_inHidden,
        o:o,
        _time:Date.now(),
        k:m,
        os:os,
        _idx:os.index(o)
      }
    }
    if(!document._after._inHidden&&_Util._isHidden(a)){
      return
    }
    if(document._after.os.index(a)>document._after._idx){
      return 1
    }
  };

  jQuery.expr[":"].before= function(a,i,m){
    if(_Util._isIgnoreElement(a)){
      return
    }
    return _findBeforeElement(a,i,m)
  };

  function _findBeforeElement(a,i,m){
    m=m[3]
    if(a.nodeType!=1 ||a.type=="hidden"){
      return
    }
    let _timer=Date.now()

    if(!document._before||document._before.k!=m||a._before||Date.now()-document._before._time>1000){
      let _inHidden=jQuery._inHidden
      let o=$(":endEqual("+m+")").toArray(),
          os=_inHidden?$("*"):_Util._getAllVisableElementsInJQ()
          
      if(!o.length){
        o=_Util._getTargetElement($(":endContains("+m+")"))
        _Util._spliceAll(o,x=>{
          return _Util._isHidden(x)
        })
      }
      if(!o.length){
        o=$(":Contains("+m+")").toArray()
        _Util._spliceAll(o,x=>{
          return _Util._isHidden(x)
        })
        o=_Util._getSameTextDom(_Util._getCeilDom(o),m)
      }
      jQuery._inHidden=_inHidden
      document._before={
        _inHidden:_inHidden,
        _time:Date.now(),
        k:m,
        os:os,
        o:o.map(x=>{
          return {
            o:x,
            _idx:os.index(x),
            r:x.getBoundingClientRect()
          }
        })
      }
    }
    if(!document._before._inHidden&&_Util._isHidden(a)){
      return
    }
    let n=document._before.os.index(a)
    return document._before.o.find(x=>{
      let _idx=x._idx
      if(a.tagName=="INPUT"&&a.type=="checkbox"&&$(x.o).find(a.tagName)[0]){
        return !!$(x.o).find(a)[0]
      }
      if(_idx>n){
        if(x._idx-n==1){
          return 1
        }
        for(let j=n+1;j<_idx;j++){
          let c=document._before.os[j]
          if((c.innerText||"").trim()&&!_Util._isHidden(c)){
            if($(c).find(x.o)[0]){
              continue
            }
            return
          }else if(c.tagName==a.tagName&&c.type!=="hidden"){
            return
          }else{
            c=c.getBoundingClientRect()

            if(c.top>x.r.bottom||c.right>x.r.right){
              return
            }
          }
        }
        return 1
      }else if(n-x._idx==1){
        return _Util._positionAfterElement(x.o,a)
      }
    })
  }
  jQuery.expr[":"].containCss = function(a,i,m){
    if(_Util._isIgnoreElement(a)){
      return
    }
    return $(a).find(m[3].trim()).length>0;
  };

  jQuery.expr[":"].css=function(a,i,m){
    if(_Util._isIgnoreElement(a)){
      return
    }
    let v=m[3].toLowerCase().split("|"),
        c=""
    return v.find(vv=>{
      if(vv[0]=="."){
        if(a.className&&a.className.constructor==String){
          return _includes(a.className,vv)
        }
      }else if(vv[0]=="#"){
        if(a.id&&a.id.constructor==String){
          return _includes(a.id,vv)
        }
      }
    })&&true
    
    function _includes(c,vv){
      c=c.toLowerCase()
      vv=vv.substring(1)
      let v2=vv.split(/[^a-z0-9]/)
      if(v2.length==1){
        return c.split(/[^a-z0-9]/).includes(vv)
      }else{
        return c.includes(vv)
      }
    }
    return $(a).find(m[3].trim()).length>0;
  };

  jQuery.expr[":"].noCss=function(a,i,m){
    if(_Util._isIgnoreElement(a)){
      return
    }
    let v=m[3].toLowerCase().split("|"),
        c=""
    return v.find(vv=>{
      if(vv[0]=="."){
        if(a.className&&a.className.constructor==String){
          return !_includes(a.className,vv)
        }
      }else if(vv[0]=="#"){
        if(a.id&&a.id.constructor==String){
          return !_includes(a.id,vv)
        }
      }
    })&&true
    
    function _includes(c,vv){
      c=c.toLowerCase()
      vv=vv.substring(1)
      let v2=vv.split(/[^a-z0-9]/)
      if(v2.length==1){
        return c.split(/[^a-z0-9]/).includes(vv)
      }else{
        return c.includes(vv)
      }
    }
  };

  jQuery.expr[":"].endContains = function(a,i,m){
    if(_Util._isIgnoreElement(a)){
      return
    }
    let o= _checkEndContains(a,i,m)
    if(o){
      a._bzJq="endContains"
    }
    return o
  };

  function _checkEndContains(a,i,m){
    m=m[3]

    if(!document._endContains||document._endContains.k!=m||!document._endContains._tag.includes(a.tagName)||a._endContains||Date.now()-document._endContains._time>1000){
      let _inHidden=jQuery._inHidden
      // console.log("init endContains:"+a.tagName+","+m)
      let v2=m;
      if(!document._endContains||document._endContains.k!=m||Date.now()-document._endContains._time>1000){
        document._endContains=0
      }
      let _inRegex=_Util._isRegexData(v2)
      if(_inRegex){
        v2=v2.substring(1,v2.length-1)
        v2=new RegExp(v2,"im")
      }else{
        v2=v2.trim().toLowerCase();
        v2=_Util._filterTxt(v2)
        v2=v2.replace(/\*/g,".*")
      }
      let os=_Util._getEndElementsByWord(function(w){
        w=(w||"").trim().toLowerCase();
        if(_inRegex){
          return w.match(v2)
        }else{
          w=_Util._filterTxt(w)
          return _Util._includesWord(w,v2,1)
        }
      },a.tagName,document._Contains?document._Contains._inHidden:_inHidden,a)
      if(document._endContains){
        document._endContains._tag.push(a.tagName)
        document._endContains.os=document._endContains.os.concat(os)
      }else{
        document._endContains={
          _inHidden:_inHidden,
          _tag:[a.tagName],
          k:m,
          os:os,
          _time:Date.now()
        }
        jQuery._inHidden=_inHidden
      }
    }
    return document._endContains.os.includes(a)
  }

  jQuery.expr[":"].endEqual = function(a,i,m){
    if(_Util._isIgnoreElement(a)){
      return
    }
    if(_Util._isNoTextElement(a)){
      return
    }
    var os=a.childNodes;
    var v2=m[3],_inRegex=_Util._isRegexData(v2)
    if(_inRegex){
      v2=v2.substring(1,v2.length-1)
      v2=new RegExp(v2,"i")
    }else{
      v2=v2.trim().toLowerCase();
      v2=_Util._trimSpace(v2)
    }
    for(var i=0;i<os.length;i++){
      var o=os[i];
      if(o.nodeType==3){
        var t=_Util._pickTextFromNode(os,i);
        i=t.i;
        var v1=_Util._trimSpace(t.t.toLowerCase()).replace(/^\*|\*$/,"").trim()
        if(_inRegex){
          if(v1.match(v2)){
            a._bzJq="endEqual"
            a._bzJqVal=t.t
            return true
          }else{
            return 
          }
        }else{
          try{
            if(v1==v2){
              a._bzJq="endEqual"
              a._bzJqVal=t.t
              return true;
    //          return $(a.ownerDocument.body).find(a).length;
    //          return !_Util._isHidden(a);
            }
          }catch(e){
            if(v1.includes(v2)){
              a._bzJq="endEqual"
              a._bzJqVal=t.t
              return true;
    //          return $(a.ownerDocument.body).find(a).length;
    //          return !_Util._isHidden(a);
            }
          }
        }
      }
    }
  };

  jQuery.expr[":"].equal = function(a,i,m){
    if(_Util._isIgnoreElement(a)){
      return
    }
    if(_Util._isNoTextElement(a)){
      return
    }
    let t=jQuery(a).text().trim().toLowerCase(),_match
    m=m[3].trim().toLowerCase()
    if(_Util._isRegexData(m)){
      m=eval(m)
      return !!t.match(m)
    }
    return t==m
  };

  //simplar(include)
  jQuery.expr[":"].RowCol=function(a,i,m){
    if(_Util._isIgnoreElement(a)){
      return
    }
    return _findRowCol(a,i,m,(v1,v2)=>{
      return v1.toLowerCase()==v2.toLowerCase()
    })
  }

  jQuery.expr[":"].rowcol=function(a,i,m){
    if(_Util._isIgnoreElement(a)){
      return
    }
    return _findRowCol(a,i,m,(v1,v2)=>{
      return v1==v2
    })
  }

  function _findRowCol(a,i,m,_fun){
    m=m[3].replace(/^\[(.+)\]$/,"$1")
    let rs,cs,k=m;
    let _timer=Date.now()

    if(!document._rowcol||document._rowcol.k!=m||a._rowcol||Date.now()-document._rowcol._time>1000){

      m=m.split("|")
      if(m[0]){
        rs=_Util._findTextBox(m[0],_fun)||[]
      }else{
        rs=$("*").toArray()
      }
      if(!rs.length){
        rs=_Util._findInputByValue(m[0])
      }
      rs=[...new Set(rs)]
      
      cs=_Util._findTextBox(m[1],_fun)||[]
      if(!cs.length){
        cs=_Util._findInputByValue(m[1])
      }
      cs=[...new Set(cs)]
      let _founds=[]
      if(rs.length&&cs.length){
        let ss=$("*").toArray()
        let mi=ss.indexOf(ss[0])
        rs.find((x,i)=>{
          if(ss.indexOf(x)<mi){
            return
          }
          let os1=_getCloser(x,cs,1),cc=[]
          os1.forEach(y=>{
            let os2=_getCloser(y,rs)
            if(os2.includes(x)){
              cc.push(y)
            }
          })
          if(cc.length){
            rs[i]={
              o:x,
              r:x.getBoundingClientRect(),
              cs:cc.map(y=>y.getBoundingClientRect()),
              cc:cc
            }
            return 1
          }
        });
        rs.forEach(r=>{
          if(r.cs){
            let xo=r.o,_chkRow
            while(1){
              let os=$(xo).find(a.tagName).toArray(),_found=[]
              if(!os.length){
                if($(xo).is(a.tagName)){
                  os=[xo]
                }
              }
              os.find(o=>{
                let or=o.getBoundingClientRect();
                if(_match([r],or)){
                  _found.push(o)
                }else if(_found.length){
                  return 1
                }
              })
              _chkRow=os.length
              _founds=_founds.concat(_found)
              if(_found.length||r.cs.find(c=>{return c.right-5<=xo.getBoundingClientRect().right})){
                break
              }
              xo=xo.parentElement
            }
          }
        })
      }

      document._rowcol=a._rowcol={
        _time:Date.now(),
        rs:rs,
        k:k,
        _founds:_founds
      }
    }
    return document._rowcol._founds.includes(a)

    function _match(rs,ar,_chkRow){
      let md=(ar.left+ar.right)/2
      return rs&&rs.find(y=>{
        return (y.r.right<=ar.left||y.r.left<=ar.left)
              &&(!_chkRow||(y.r.top-5<ar.top&&y.r.bottom+5>ar.bottom))
              &&y.cs.find(x=>{
                if(x.bottom<=ar.top){
                  if(x.left<=md&&x.right>=md){
                    return 1
                  }
                  x=(x.left+x.right)/2
                  return x>=ar.left&&x<=ar.right
                }
              })
      })
    }
    
    function _getCloser(x,os,_before){
      let xr=x.getBoundingClientRect(),
          vs=[]
      os.forEach(o=>{
        if(o.getBoundingClientRect){
          let or=o.getBoundingClientRect()
          if(_before){
            if(or.bottom<xr.top+5&&xr.left<=or.left+5){
              vs.push(o)
            }
          }else{
            if(or.top+5>xr.bottom&&xr.left+5>or.left){
              vs.push(o)
            }
          }
        }
      })
      while(vs.length){
        let cs=$(x).find(vs).toArray()
        if(!cs.length){
          x=x.parentElement
        }else{
          return cs
        }
      }
      return []
    }
  }
  //canvas text
  jQuery.expr[":"].textElement=function(a,i,m){
    if(_Util._isIgnoreElement(a)){
      return
    }
    if(a.tagName!="CANVAS"){
      return
    }
    if(TWHandler._getCanvasTextElement(a,m[3])){
      return true
    }
  }



  // jQuery.expr[":"].bz=function(a,i,m){
  //   let v=a.dataset.bz
  //   if(!v){
  //     return
  //   }

  //   m=m[3]
  //   m=m.split("=")
  //   a=_cssHandler._getBzPath(a)
  //   return a.bz.find(x=>x.k==m[0]&&(x.v==m[1]||!m[1]))
  // }

  jQuery.expr[":"].value=function(a,i,m){
    let v=m[3],vv=(a.value||"").toString()
    if(_Util._isRegexData(v)){
      v=eval(v)
      return vv.match(v)
    }
    return v==vv
  }

  jQuery.expr[":"].val=function(a,i,m){
    let v=m[3],vv=(a.value||"").toString()
    if(_Util._isRegexData(v)){
      v=eval(v)
      return vv.match(v)
    }
    return vv.includes(v)
  }

  for(var k in jQuery.expr[":"]){
    jQuery.expr[":"][k].toString=function(){}
  }

  //get sub iframe
  jQuery.fn.findIframe=function(a){
    return _findIFrame(arguments)
  }

  function _findIFrame(ii,n,d){
    d=d||BZ.TW;
    var i=0
    while(ii.length>i){
      var v=ii[i++]
      d=d.frames[v]
      if(!d){
        return
      }
    }
    return d.document
  }

  _isSubSelector=function(v){
    return v.match(/:(include|text|attr|Attr|Contains|hidden|show|panel|match|input|data|link|near|next|previous|parent|afterEqual|after|before|containCss|css|noCss|endContains|contains|endEqual|equal|RowCol|rowcol|textElement|blank|bz|value|val)\([^\)]*\)/)
  }
}
if(window.jQuery){
  extendJQuery()
};
var _cssHandler={
  _cssMap:{},
  _maxTextLength:100,
  _priorityItems:[],
  /*
  _cssMap={
    "input[type=checkbox]":{
      _names:["BUTTON"],
      _items:["INPUT","[type=checkbox]"]
    }
  },
  _nameMap:{
    //item link to _cssMap
    "button":{
      _css:["BUTTON",".btn","INPUT[type=button]","INPUT[type=submit]","INPUT[type=reset]"],
      _key:"XXX"
    }
  },
  _keyMap:{
    "24234234":{
      _name:"button",
      _css:"BUTTON,.btn,INPUT[type=button],INPUT[type=submit],INPUT[type=reset]"
    }
  }
  */
  _init:function(){
    _cssHandler._cssMap={};
    _cssHandler._nameMap={};
    _cssHandler._keyMap={};
    _cssHandler._inputCss="";
    
    var _duplidates={};
    var os=_IDE._data._curVersion.setting.objectLib,_found;
    os.component.forEach(function(o){
      o.items.forEach(function(v){
        for(var i=0;i<os.element.length;i++){
          var vv=os.element[i]
          if(vv.key==v.name){
            var c=(v.toggle||v.panel||[]).join(" ")
            if(!vv.css.includes(c)){
              vv.css+=","+c
            }
            _found=1
            break
          }
        }
        if(!_found&&v.panel){
          os.element.push({key:v.name,value:v.name,css:(v.toggle||v.panel).join(" "),component:1,data:v,hide:1})
        }
      })
    })
    for(var k in os){
      if(k=="component"){
        continue
      }
      var es=os[k]
      for(var i=0;i<es.length;i++){
        var e=es[i];
        if(k=="operation"){
          e.value=_dictionaryHandler._getWordsByKey(e.key).join("/")
        }else if(!e.value){
          e.value=_bzMessage._setting._objectLib._options[k][e.key];
          if(!e.value){
            continue
          }
        }
        var v=e.value.toLowerCase();
        var vs=v.split("/");
        var cs=_cssHandler._parseGroup(e.css);
        _cssHandler._keyMap[e.key]={_name:vs,_css:e.css,_type:k};
        
        vs.forEach(function(a){
          var vm=_cssHandler._nameMap[a];
          if(vm){
            _duplidates[a]=_duplidates[a]||[vm._css];
//            _duplidates[a].push(cs);
          }else{
            _cssHandler._nameMap[a]={_css:cs,_key:e.key};
          }
        });
        
        cs.forEach(function(a){
          if(!a){
            return;
          }
          var x=a.match(/^[a-z]+/i);
          if(x){
            x=x[0].toUpperCase()
            a=x+a.substring(x.length);
          }
          a=_cssHandler._parseItems(a);
          
          for(var ii=0;ii<a.length;ii++){
            var vv=_cssHandler._cssMap[a[ii]];
            if(!vv){
              vv=_cssHandler._cssMap[a[ii]]={};
            }
            if(!vv[v]){
              vv[v]={_names:vs,_items:[],_same:cs.length}
            }
            vv[v]._items.push({_item:a,_size:a.length});
          }
        });
      }
    }
    if(Object.keys(_duplidates).length){
      var _msg=_bzMessage._setting._objectLib._duplicateKey+"\n\n";
      for(var k in _duplidates){
        _msg+=k+": "+_duplidates[k].toString().replace(/,/g,", ")+"\n\n";
      }
      return alert(_msg);
    }
    //ignore class
    _cssHandler._ignoreClasses=_IDE._data._curVersion.setting.content.ignoreClasses.replace(/\s/g,"").replace(/,/g,"|");
    return 1;
  },
/*
  _addCss:function(d,v){
    if(d){
      d=new Set(d.split(","))
    }else{
      d=new Set()
    }
    d.add(v)
    return [...d].join(",")
  },
  _removeCss:function(d,v){
    d=new Set(d.split(","))
    d.delete(v)
    return [...d].join(",")
  },
  _replaceCss:function(d,v,nv){
    d=new Set(d.split(","))
    d.delete(v)
    d.add(nv)
    return [...d].join(",")
  },
  */
  _hasWaitingElement:function(){
    var c=_cssHandler._keyMap.waiting
    if(c&&c._css){
      var os=$(c._css).toArray()
      for(var i=0;i<os.length;i++){
        if(!_Util._isHidden(os[i])){
          if(!BZ._isAutoRunning()){
            _bzDomPicker._removeTmpCover()
            setTimeout(function(){
              _bzDomPicker._flashTmpCover(os[i])
            },1)
          }
          return 1
        }
      }
    }
  },
  _isNatureCustomizeInput:function(e){
    return (e.tagName=="INPUT"&&(e.type=="text"&&($(e).css("opacity")==0||$(e).css("visibility")=="hidden"))||["submit","button","image"].includes(e.type))
          ||(!_Util._isInContentEditable(e)&&(!_Util._isStdInputElement(e)||$(e).attr("readonly")))
  },
  _lookLikeInput:function(l,i){
    return !_Util._isHidden(i)&&(_Util._isInputObj(i)||(_isInputSize(i)&&_isInputPos(l,i)))
    function _isInputSize(o){
      o=o.getBoundingClientRect()
      return o.width/o.height>2
    }
    function _isInputPos(l,i){
      l=l.getBoundingClientRect()
      i=i.getBoundingClientRect()
      if(i.left<=l.left+10){
        return i.top>l.top-10&&i.top<l.bottom+30
      }else if(i.left>=l.right-10&&i.left<=l.right+30){
        return i.top>l.top-10&&i.top<l.bottom-10
      }
    }
  },
  _findSamilarElementByStyle:function(o,e){
    let c=e.tagName+" "+e.className.trim();
    c=c.split(/ +/).filter(x=>!x.match(/[0-9]/)).join(".")
    
    return $(o).find().toArray()
  },
  _findNodeByTxt:function(p,v,_removeSign){
    let ws=[],_fun;
    if(_Util._isRegexData(v)){
      _fun=_match
      v=eval(v+`i`)
    }else if(v.includes("|")){
      _fun=_match
      v=eval(`/${v}/i`)
    }else{
      v=v.toLowerCase()
    }
    let _txt=(p.innerText||"").replace(/[ \xa0]+/g," ")
    if(_removeSign){
      _txt=_Util._removeSign(_txt," ")
    }
    if(_fun){
    }else if(_include(_txt,v)){
      _fun=_include
    }else if(_include(_txt,v)){
      _fun=_advInclude
    }else{
      return ws
    }
    
    _doIt(p,v,ws)

    return ws
    
    function _doIt(p,v,ws){
      for(let n of p.childNodes){
        if(n.nodeType==3){
          let w=n.textContent
          
          if(_fun(w,v)){
            ws.push({e:n.parentElement,o:n.parentElement,w:w,n:n,ks:[]})
          }
        }else if(n.nodeType==1&&!["SVG","IMG"].includes(n.tagName)){
          let x=(n.innerText||"").replace(/[ \xa0]+/g," ")
          if(_removeSign){
            x=_Util._removeSign(x," ")
          }
          if(_fun(x,v)){
            if(!_Util._isHidden(n)){
              let ss=[]
              _doIt(n,v,ss)
              if(!ss.length){
                let ks=[]
                _removeTxtNode(n,v,ks)
                ks=ks.filter(y=>_cssHandler._lookLikeInput(n,y))
                ss.push({
                  e:n,w:x,ks:ks,o:n
                })
              }
              ws.push(...ss)
            }
          }
        }
      }
    }
    function _removeTxtNode(n,v,_keepNodes){
      for(let nn of n.childNodes){
        if(nn.nodeType==3){
          let _txt=nn.textContent.trim()
          if(_txt&&v.startsWith(_txt)){
            v=v.substring(_txt.length).trim()
          }
        }else if(nn.nodeType==1){
          if(!v){
            _keepNodes.push(nn)
          }else{
            v=_removeTxtNode(nn,v,_keepNodes)
          }
        }
      }
      return v
    }
    function _include(v1,v2){
      return (v1||"").toLowerCase().includes(v2)
    }
    function _advInclude(v1,v2){
      return _Util._removeSign((v1||"").toLowerCase()," ",0,1).includes(v2)
    }
    function _match(v1,v2){
      return v1.match(v2)
    }
  },
  //split css setting, like: "button,.btn" to ["button",".btn"]  
  _parseGroup:function(_css){
    _css=_css||""
    var _back=0,b=0,v="",vs=[];
    
    for(var i=0;_css&&i<_css.length;i++){
      var c=_css[i];
      
      if(c=="," && !b){
        v=v.trim();
        if(v){
          vs.push(v);
        }
        v="";
      }else{
        v+=c;
      }
      if(!b){
        var bi="\"'([".indexOf(c);
        if(bi>0){
          b="\"')]"[bi];
        }
      }else if(c==b && !_back){
        b=0;
      }else if(c=="\\"){
        _back=!_back;
      }else{
        _back=0;
      }
    }
    v=v.trim();
    if(v){
      vs.push(v)
    }
    return vs;
  },
  //split css like: "button.btn-add" to ["button",".btn-add"]
  _parseItems:function(_css){
    var _back=0,b=[],v="",vs=[];
    for(var i=0;i<_css.length;i++){
      var c=_css[i];
      if(".#[:".includes(c) && !b.length){
        v=v.trim();
        if(v){
          vs.push(v);
        }
        v=""
      }
      v+=c;
      var bi="\"'([{".indexOf(c);
      if(bi>0){
        b.unshift("\"')]}"[bi]);
      }
      if(c==b[0] && !_back){
        b.shift();
      }else if(c=="\\"){
        _back=!_back;
      }else{
        _back=0;
      }
    }
    v=v.trim();
    if(v){
      vs.push(v)
    }
    return vs;
  },
  //from ["LABEL",":endContains(Name)"] to ["{LABEL}","\"Name\""]
  _cssToDesc:function(p){
    var ss=[],_css=[];

    for(var n=0;n<p.length;n++){
      var c=_cssHandler._findDesc(p[n]);
      if(!c){
        continue;
      }else if('"'==c[0]){
        var s=_JSHandler._parseCode(c.substring(1,c.length-1));
        if(s.constructor==Array){
          var c=""
          for(var i=0;i<s.length;i++){
            if(s[i].txt){
              c+='"'+s[i].txt+'"'
            }else if(s[i].code){
              c+='('+s[i].code+')'
            }
          }
        }
        ss.push(c)
      }else if('{'==c[0]){
        if(!ss.includes(c)){
          ss.push(c)
        }
      }else if(c){
        var ks=[];
        for(var k in c){
          var cc=c[k];
          for(var m=0;m<p.length;m++){
            var pm=p[m];
            if(pm.match(/:has\(/)){
              pm=pm.substring(5,pm.length-1);
            }
            var _found=0;
            for(var ii=0;ii<cc._items.length;ii++){
              var _items=cc._items[ii];
              var _item=_items._item;
              
              var _idx=_item.indexOf(pm);
              if(_idx>=0){
                _item.splice(_idx,1);
                cc._find=cc._find||0;
                if(!_item.length){
                  if(!ks.includes(cc)){
                    ks.push(cc)
                  }
                  if(cc._find<_items._size){
                    cc._find=_items._size;
                  }
                }
              }
            }
          }
        }
        var k=0;
        for(var m=0;m<ks.length;m++){
          if(k){
            if(k._find<ks[m]._find){
              k=ks[m]
            }else if(k._find==ks[m]._find){
              if(k._names.length>ks[m]._names.length || k._same>ks[m]._same){
                k=ks[m]
              }
            }
          }else{
            k=ks[m]
          }
        }
        if(k){
          if(!ss.includes(k._names[0])){
            ss.push(k._names[0])
          }
        }else{
          ss.push("{"+p[n]+"}")
        }
      }
    }
    return ss;
  },
  /*From 
    Text: ":endContains(Sharing)" to "Sharing"
    Defined object: ".bz-delete" to "delete"
    un-defined object: "div" to {div}
  */
  _findDesc:function(v){
    if(!v){
      return
    }
    var _css=_cssHandler._cssMap[v];
    var _first;
    if(_css){
      return _Util._clone(_css);
    }else if(v[0]==":" && !v.startsWith(":attr(")){
      var si=v.indexOf("(")+1;
      if(si){
        var ei=v.lastIndexOf(")");
        if(ei<0){
          ei=v.length;
        }
        si=v.substring(si,ei);
        if(v.match(/^:has\(/)){
          return _cssHandler._findDesc(si);
        }else{
          si="\""+si+"\"";
        }
        return si;
      }
    }else if(v.startsWith(":attr(")){
      v=v.match(/\=(\"|\'|)([^\"\'\)]+)/)
      if(v){
        return '"'+v[2]+'"'
      }
    }else if(v.startsWith("[")){
      var si=v.indexOf("=")+2;
      if(si){
        var ei=v.lastIndexOf("\"");
        if(ei>0){
          si="\""+v.substring(si,ei)+"\"";
          return si;
        }
      }
    }else if("#.".includes(v[0]) || v[0].match(/[a-z]/i)){
      return "{"+v+"}"
    }
  },
  _getRootShadowDom:function(e){
    let r=0;
    while(e&&(e.parentNode||(e.host&&e.host.constructor!=String))){
      if(e.host){
        r=e;
      }
      e=e.parentNode||e.host;
    }
    return r;
  },
  _isInShadowDom:function(e){
    e=_cssHandler._getRootShadowDom(e);
    return e&&e.host&&e.host.constructor!=String&&!_Util._isHidden(e.host)
  },
  _getRoot:function(e){
    let d=e.ownerDocument;
    while(e.parentNode){
      e=e.parentNode;
      if(e.host&&e.host.constructor!=String){
        return e
      }
    }
    return d
  },
  _addPanelOnPath:function(d){
    try{
      let ps=_cssHandler._keyMap.panel,
          s=d.oe.bzTmp
          
      ps=ps&&ps._css
      if(ps){
        if(s.constructor==String){
          s=s.split("\n")
        }
        if(s[0]!="BZ.TW.document"){
          s.unshift("BZ.TW.document")
        }
        ps=ps.split(",")
        return ps.find(p=>{
          let os=$(p)
          if(os.find(d.oe).length){
            if(!p.match(/[A-Z]/i)){
              os=os.toArray()
              os.find(o=>{
                if($(o).find(d.oe).length){
                  p=o.tagName+p
                  return 1
                }
              })
            }
            s.splice(1,0,p)
            
            d.oe.bzTmp=s
            return 1
          }
        })
      }
    }catch(e){}
  },
  _isCover:function(c){
    c=c.getBoundingClientRect()
    return c.width>200&&c.height>200&&!c.innerText
  },
  _isCoverOfElement:function(c,e){
    let cr=c.getBoundingClientRect(),
        er=e.getBoundingClientRect()
    if(["checkbox","radio"].includes(e.type)){
      return cr.left<=er.right-10&&cr.right>=er.left+10&&cr.top<=er.bottom-10&&cr.bottom>=er.top+10
    }
    return cr.left<=er.left&&cr.right>=er.right&&cr.top<=er.top&&cr.bottom>=er.bottom
  },
  _findChkRadio:function(e){
    let k="input[type=radio],input[type=checkbox]"
    let o=$(e).find(k)
    if(o.length==1){
      return o[0]
    }
    o=$(e.parentElement).find(k)
    if(o.length==1){
      o=o[0]

      return (_Util._isHidden(o)||_cssHandler._isCoverOfElement(e,o))&&o
    }
    
  },
  _findHoverCssByElement:function(e,_cssOnly){
    if(e.constructor==Array||e.constructor==String){
      e=$util.findDom(e)
    }
    let r=[]
    if(e){
      let s = document.styleSheets;

      for(var i=0; i<s.length; i++) {
        try{
          var rs = (s[i]||{}).cssRules||[];

          for(var j=0; j<rs.length; j++) {
            let v=rs[j].selectorText||""
            if(v.includes(":hover")) {
              let hv=v.split(":hover")
              hv.pop()
              hv=$(hv.join(""))
              if(_cssOnly){
                if(hv.find(e).length||hv.is(e)){
                  r.push({
                    v:v,
                    css:rs[j].cssText
                  })
                }
              }else{
                let os=hv.toArray().forEach(x=>{
                  if(x==e||$(x).find(e).length){
                    r.push({
                      v:v,
                      o:x,
                      css:rs[j].cssText
                    })
                  }
                })
              }
            }
          }
            
        }catch(ex){}
      }
    }
    return r
  },
  _isLeftLabel:function(e){
    let p=e
    while(!p.innerText.trim()&&p.parentElement){
      p=p.parentElement
    }
    p=p.getBoundingClientRect()
    e=e.getBoundingClientRect()
    return e.left>p.left+p.width/2
  },
  _findLabelByInput:function(e,_retrieveElement){
    let _optionWord=""
    if(e.type=="radio"){
      return e.name
    }
    let _left="checkbox"!=e.type||_cssHandler._isLeftLabel(e),_file=e.type=="file",_break

    return _doIt(e.parentElement,e)||_cssHandler._getElementTitle(e)

    function _doIt(p,e){
      if(!p){
        return
      }
      let os=[],_start=_left,os2=[]
      let cs=os;
      for(let o of p.childNodes){
        if(o==e){
          if(_start){
            if(_file){
              cs=os2
            }else{
              break
            }
          }else{
            _start=1
          }
        }else if(_start&&((o.nodeType==1&&!_Util._isHidden(o))||o.nodeType==3)){
          cs.push(o)
        }
      }
      if(_left||_file){
        os.reverse()
      }
      if(os.length||os2.length){
        let w=_findInList(os)||_findInList(os2)||_optionWord
        
        if(w){
          return w
        }else if(_break||p.tagName=="BODY"){
          return
        }else{
          return _doIt(p.parentElement,p)
        }
      }else{
        return _doIt(p.parentElement,p)
      }
    }
    
    function _findInList(os){
      if(os.length){
        let w,oo;
        os.find(x=>{
          if(x.nodeType==3){
            w=_cleanWord(x.textContent||"")
            if(w){
              oo=x
            }
            return w
          }else if(x.nodeType==1){
              w=_cleanWord(x.innerText||"")
              if(w){
                if(_Util._isHidden(x)){
                  _optionWord=_optionWord||w
                  return
                }
                oo=x
                if(x.children.length){
                  w=_findTitle(x)||x
                }
              }
              return w
            // }else{
            //   _break=1
            //   return 1
            // }
          }
        })
        return _retrieveElement?oo:w
      }
    }
    
    function _cleanWord(w){
      return _Util._removeSign(w," ",["-"])
    }

    function _findTitle(o){
      let os=o.childNodes,ss=[];
      for(let x of os){
        ss.push(x)
      }
      return _findInList(ss)
    }
  },
  _findPanelPath:function(e,p,os){
    let r="BZ.TW.document",
        v=_findGoodPath(e,e,p,os);
    if(v){
      return [r,v,0]
    }
    let pp=e.parentElement
    while(pp){
      if($(pp).find(os).length==os.length){
        return
      }
      v=_findGoodPath(pp,e,pp.tagName,os,p)
      if(v){
        return [r,v,p,0]
      }
      pp=pp.parentElement
    }

    function _findGoodPath(e,o,p,os,ep){
      let v;
      if(_isGoodValue(e.id)){
        if($("#"+e.id).length==1){
          v= p+"#"+e.id
        }
      }else{
        let cs=(e.className||"").split(/\s+/)
        cs=cs.filter(x=>_isGoodValue(x)&&!_cssHandler._isIgnoreClass(x));
        cs.find(x=>{
          if(ep){
            let oo=_Util._findDoms([r,p+"."+x,ep])||[]
            if(oo[0]==o){
              v=p+"."+x
              return 1
            }
          }else{
            if($("."+x).find(os)[0]==o){
              v=p+"."+x
              return 1
            }
          }
        })
      }
  
  
      return v
  
    }

    function _isGoodValue(v){
      return v&&!v.match(/[0-9]/i)
    }
  },
  _findInputPath:function(e,_scope){
    let _label=_cssHandler._findLabelByInput(e)
    if(_label){
      return _findMethod(e,_label)
    }

    let _inHidden=_Util._isHidden(e)?":hidden":""
    let _type=["checkbox","radio","file"].includes(e.type)?`:attr(type=${e.type})`:""

    if(e.type=="radio"&&e.tagName=="INPUT"){
      if(e.name){
        return _insertScope(["BZ.TW.document","INPUT"+_type+":text("+e.name+")",0],_scope)
      }
    }
    let pe=_findFirstElementWithLabel(e,$util.getElementText(e));
    if(!pe){
      if(e.placeholder){
        return _insertScope(["BZ.TW.document",e.tagName+"[placeholder="+$(e).attr("placeholder")+"]",0],_scope)
      }
      return
    }

    if(e.type=="radio"&&e.tagName=="INPUT"){
      return _findSecondElementWithLabel(pe.p,e,pe.w)
    }
    
    function _findMethod(e,_label){
      let ms=["input","afterEqual","after","Contains","before"],
          _min={},fp;
      ms.find(x=>{
        let _path=["BZ.TW.document",`${e.tagName}:${x}(${_label})`]
        _insertScope(_path,_scope)
        let o=_Util._findDoms(_path)||[]

        if(o[0]==e){
          _path.push(0)
          fp=_path
          return 1
        }else if(o.includes(e)){
          let p=_cssHandler._findPanelPath(e,_path[1],o)
          if(p){
            fp=p
            return 1
          }

          let i=o.indexOf(e)
          if(!_min||i<_min.i){
            _path.push(i)
            _min={i:i,p:_path}
          }
        }
      })
      if(_min){
        fp=fp||_min.p
      }
      return fp
    }

    //return ["BZ.TW.document",e.tagName+_inHidden+_type+":near("+_formatLabel(pe.w)+")",0]

    function _findFirstElementWithLabel(o,pw){
      let p=o,_last=o,_lastWord=(pw||"").trim(),_bkLabel
      while(p.tagName!="BODY"&&p.parentElement){
        _last=p
        p=p.parentElement
        let _innerInputs=_Util._findInputs(p)
        if(_innerInputs.length>1&&_innerInputs.find(x=>x!=o&&!_Util._isHidden(x))){
          if(_bkLabel){
            return _bkLabel
          }
          return
        }
        let cw=$util.getElementText(p)
        if(cw&&cw!=_lastWord){
          let _start=!["radio","checkbox","file"].includes(o.type),
              w=""
          if(_lastWord){
            cw=cw.split(_lastWord)
            if(_start&&cw[0]){
              return {p:p,w:cw[0].trim()}
            }else if(cw[1]){
              return {p:p,w:cw[1].trim()}
            }
          }
          _lastWord=cw
          if(_start){
            let pr=p.getBoundingClientRect()
            let or=o.getBoundingClientRect()
            if(or.top-pr.top<15&&or.left-pr.left<20){
              _bkLabel={p:p,w:cw}
              continue
            }
          }
          for(let x of p.childNodes){
            if(_start){
              if(x==_last){
                if(w.trim()){
                  return {p:p,w:w.trim()}
                }
                break
              }
              
              if(x.nodeType==3){
                w=w.trim()+" "+x.textContent.toString().trim()
              }else if(x.nodeType==1&&x.getBoundingClientRect().width){
                w=w.trim()+" "+$util.getElementText(x)
              }
            }else if(x==_last){
              _start=1
            }
          }
          w=w.trim()
          if(w){
            return {p:p,w:w}
          }
        }
      }
    }

    function _findSecondElementWithLabel(o,e,w){
      let p=o
      while($(p).find("input").length==1&&p.innerText.trim()==w&&p.tagName!="BODY"){
        p=p.parentElement
      }
      if(p.tagName=="BODY"){
        return
      }
      if($(p).find("input").toArray().find(x=>{
        return x.type!="radio"
      })){
        return
      }
      let oo=$(p).find("input[type=radio]")[0]
      if(oo!=e){
        w=_findFirstElementWithLabel(oo)
        if(!w){
          return 
        }
        w=w.w.trim()
      }
      let ww=p.innerText.trim()
      ww=ww.substring(0,ww.indexOf(w))
      while(!ww){
        p=p.parentElement
        if(p.tagName=="BODY"){
          return
        }
        if($(p).find("input").toArray().find(x=>{
          return x.type!="radio"
        })){
          return
        }
        ww=p.innerText.trim()
        ww=ww.substring(0,ww.indexOf(w))
      }

      return ["BZ.TW.document",`INPUT[type=radio]${_inHidden}:after(${ww.trim()})`,0]
    }
    
    function _formatLabel(ww){
      ww=ww.split("\n")
      let wx=""
      ww.forEach(x=>{
        if(x.length>wx.length){
          wx=x
        }
      })
      
      return _Util._toTrimSign(wx,30).replace(/\*+$/,"").trim()
    }

    function _insertScope(p,s){
      if(s){
        p.splice(1,0,s)
      }
      return p
    }
    
  },
  _getOptionElementByBZFlag:function(e){
    return e.constructor==Array&&e
  },
  _getComPath:function(e,_withAIAnalysis){
    let c=window._comCss
    if(c){
      let p=["BZ.TW.document"]
      if(Object.keys(c).find(x=>{
        if($(x).find(e)[0]){
          let t=(_cssHandler._findLabel({e:e,oe:e})||{w:""}).w||""
          p.push(":"+c[x]+"("+t+")",0)
          return 1
        }
      })){
        if(_withAIAnalysis){
          p={
            W:{HH:[],WW:[]},
            _elementPath:p
          }
        }
        return p
      }
    }
  },
  _getDefinitedPath:function(e,_withAIAnalysis){
    let p=["BZ.TW.document"]
    if(e.bzPath){
      if(e.bzPath.constructor==String){
        p.push(e.bzPath)
      }else{
        if(e.bzPath[0].includes("BZ.TW.")){
          p=e.bzPath
        }else{
          p.push(...e.bzPath)
        }
      }
      if(!$.isNumeric(p[p.length-1])){
        p.push(0)
      }

      if(_withAIAnalysis){
        p={
          W:{HH:[],WW:[]},
          _elementPath:p
        }
      }
      return p
    }
    
  },
  _findStdTextElement:function(e,w,_panel){
    let _path,p
    let _data={e:e,oe:e,_headers:[]}
    _cssHandler._findAttributes(_data)
    _data=(_data._result||{})._main
    w=(w||"").trim()
    let ww=w.trim().split("\n")[0]

    if(ww){
      if(ww==w){
        _path=`${e.tagName}:equal(${w})`
      }else{
        _path=`${e.tagName}:Contains(${ww})`
      }
      p=_chkPath(_path,!_data&&_panel)
      if(p){
        return p
      }
    }

    if(_data){
      _data=_data.join("")

      if(ww){
        if(ww==w){
          _path=_data+":equal("+w+")"
        }else{
          _path=_data+`:Contains(${ww})`
        }
      }else{
        _path=_data
      }

      p=_chkPath(_path,_panel)
      if(p){
        return p
      }
    }
    
    if(!_panel){
      let h=_findHeader(e)
      if(h&&h.t){
        return _cssHandler._findStdTextElement(e,w,(h._path||h.e.tagName)+":Contains("+h.t+")")
      }
    }


    function _findHeader(e){
      let p=e.parentElement
      while(p){
        let _found
        for(let o of p.childNodes){
          if(o==e){
            break
          }
          if(o.nodeType==1){
            let w=(o.innerText||"").trim()
            if(w&&w.length<100){
              _found= {oe:p,e:p,t:w,_headers:[]}
            }
          }
        }
        if(_found){
          _cssHandler._findAttributes(_found)
          _found._path=((_found._result||{})._main||[]).join("")
          return _found
        }else{
          p=p.parentElement
        }
      }
    }

    function _chkPath(_path,_final){
      let ee;
      if(_panel){
        ee=$(_panel).find(_path).toArray()
      }else{
        ee=$(_path).toArray()
      }
      ee=ee.filter(x=>!_Util._isHidden(x))
      if(ee.includes(e)){
        let p= _shortPath(ee,e,_path)
        if(p&&$util.findDom(p)==e){
          return p
        }else if(_final){
          return _finalPath([_path,ee.indexOf(e)])
        }
      }
    }


    function _shortPath(ee,e,_path){
      if(ee[0]==e){
        return _finalPath([_path,0])
      }else if(ee._last()==e){
        return _finalPath([_path+":last",0])
      }
    }

    function _finalPath(v){
      let p= ["BZ.TW.document",...v]
      if(_panel){
        p.splice(1,0,_panel)
      }
      return p
    }
  },
  _getTextPath:function(e){
    let t=(e.innerText||"").trim().split("\n")[0]
    if(t){
      let tw=`${e.tagName}:text(${t})`
      let os=$(tw).toArray()
      let i=os.indexOf(e)
      if(i>=0){
        if(i&&i==os.length-1){
          return ["BZ.TW.document",tw+":last",0]
        }
        return ["BZ.TW.document",tw,i]
      }
    }
  },
  //get element path
  //_simple: 1: only level 1, 2: ignore label, 3: only label, 4: class first (for panel)
  //_simple: 1: only level 1, 2: ignore label, 3: only label
  _findPath:function(e,_withAIAnalysis,_simple){
    try{
      extendJQuery()
      if ($(e).hasClass("BZIgnore") || $(e.ownerDocument).find(".BZIgnore").find(e).length) {
        return;
      }
      if(e.bzShortCut&&e.tagName!="CANVAS"){
        if(_withAIAnalysis){
          return e.bzShortCut
        }
        return e.bzShortCut._elementPath
      }
      let _definitedPath=_cssHandler._getDefinitedPath(e,_withAIAnalysis)
      if(_definitedPath){
        return _definitedPath
      }

      _definitedPath=_cssHandler._getComPath(e,_withAIAnalysis)
      if(_definitedPath){
        return _definitedPath
      }

      e=_cssHandler._findCellElement(e);

      let _table=_Util._getParentElementByCss("table",e),_curScope
      if(_table){
        if(_table&&_cssHandler._getTableType(_table)=="dataTable"){
          let td=_Util._getParentElementByCss("td,th",e)
          if(td){
            _table=_findRowColPath(td,_table)
            if(_table){
              if(td==e){
                _table=["BZ.TW.document",_table,0]
                e.bzTmp=_table
                if(_withAIAnalysis){
                  return {
                    _elementPath:_table,
                    W:{}
                  }
                }
                return _table
              }else{
                _curScope=_table
              }
            }
          }
        }
      }

      if(e.tagName=="CANVAS"){
      }else if(!_isInput(e)){
        let w=e.innerText||e.value||_cssHandler._getElementTitle(e)

        let _path=_cssHandler._findStdTextElement(e,w,_curScope)
        if(_path){
          if(_withAIAnalysis){
            return {
              W:{HH:[],WW:[]},
              _elementPath:_path
            }
          }else{
            return _path
          }
        }
      }else{
        let _quickPath= _cssHandler._findInputPath(e,_curScope)
        if(_quickPath){
          let _chkInput=_quickPath.find((x,i)=>{
            if(x[0]==":"){
              x=e.tagName+x
              _quickPath[i]=x
            }
            if(x.constructor==String&&x.match(/:input\(/)){
              if(_IDE._data._curAction&&"02".includes(_IDE._data._curAction.type)){
                _quickPath[i]=x.replace(":input(",":data(")
              }
              return 1
            }
          })
          
          if(_chkInput||_chkPath(e,_quickPath)){
            if(_simple!=3){
              if(_withAIAnalysis){
                return {
                  W:{HH:[],WW:[]},
                  _elementPath:_quickPath
                }
              }else{
                return _quickPath
              }
            }else{
              return _quickPath
            }
          }
        }else if(_simple==3&&_Util._isHidden(e)){
          return
        }
      }
      
      let ep=_cssHandler._getTextPath(e)
      if(ep){
        if(_withAIAnalysis){
          return {
            W:{HH:[],WW:[]},
            _elementPath:ep
          }
        }
        return ep
      }
      if(!_simple&&e.tagName.match(/(DIV|PRE|P)/)&&$(e).find("button,a,input").length){
        _simple=4
      }
      var d={
        e:e,
        oe:e,
        ps:[],
        ee:1,
        _headers:[],
        _stopLabel:_simple==2,
        _labelOnly:_simple==3,
        _classFirst:_simple==4
      },o,bk,_chkPanel;
      if(!e.bzShortCut||e.tagName=="CANVAS"){
        e.bzW=0
        var ee=d.ee;
  //      console.time("_findPath")
        while(d.e.ownerDocument){
          _cssHandler._checkDescPath(d,_simple);
          if(_simple==1){
            break
          }
          if(d._label&&_simple==3&&(d.oe==d.ee||d.ee.length==1)){
            break
          }else if(d._label&&!_chkPanel&&(_chkPanel=1)&&_cssHandler._addPanelOnPath(d)){
            break
          }else if(!_Util._isEmpty(d._headers)&&!_chkPanel&&(_chkPanel=1)&&_cssHandler._addPanelOnPath(d)){
            break
          }else if(d.ee&&(d.ee==d.oe||d.ee[0]==d.oe)&&(d._label||d._stopLabel)&&(d._stopHeader||!_Util._isEmpty(d._headers))){
            break
          }else if(d._label&&d._labelOnly){
            break
          }else if(d.e!=d.oe){
            var ee=$(d.e).find(d.ee);
            if(!d.e.ownerDocument || d.e==d.e.ownerDocument.body.parentElement){
              bk=d.oe.bzTmp;
              if(!bk){
                return _Util._getElementSimplePath(d.oe);
              }
              if(_Util._isInputObj(d.oe)){
                var s=bk.constructor==String?bk.split("\n"):bk;
                if(s.length==2 && d.e.innerText && ee.length<4){
                  continue;
                }
              }
              _descAnalysis._findElementIdx(d.oe);
              if($util.findDom(d.oe.bzTmp)==d.oe){
                break;
              }else{
                if(bk.constructor==String){
                  bk=bk.split("\n")
                }
                d.oe.bzTmp=bk;
              }
            }
          }
          if(d.e.tagName=="BODY"||(d.e.host&&d.e.host.constructor!=String)){
            break
          }
        }
        if(d.oe.bzTmp){
          if(d.oe.bzTmp.constructor==Array){
            d.oe.bzTmp=d.oe.bzTmp.join("\n")
            if(d.e.host&&d.e.host.constructor!=String){
              let tmp=d.e.bzTmp;
              if(tmp.constructor==Array){
                tmp=tmp.join("\n")
              }
              if(!d.oe.bzTmp.startsWith(tmp)){
                d.oe.bzTmp=tmp+"\n"+d.oe.bzTmp;
              }
            }
          }
          if(!d.oe.bzTmp.startsWith("BZ.TW.document")){
            d.oe.bzTmp="BZ.TW.document\n"+d.oe.bzTmp
          }
          _descAnalysis._findElementIdx(d.oe,_simple)
        }
      }
      if(d.oe.bzTmp.constructor==String){
        d.oe.bzTmp=d.oe.bzTmp.split("\n")
      }

      if(_withAIAnalysis){
        if(d.oe.bzShortCut){
          return d.oe.bzShortCut
        }
        if(!d.oe.bzW){
          d.oe.bzW=_descAnalysis._getAICssData(d.oe,d.oe.bzTmp,d._label)
        }
        return d.oe.bzShortCut={
          _elementPath:d.oe.bzTmp, 
          W:d.oe.bzW||{}
        }
      }
      if(d.oe.bzShortCut){
        return d.oe.bzShortCut._elementPath
      }
      _Util._setBlankIFramePath(d.oe.bzTmp,d.oe)
      
      return d.oe.bzTmp||_Util._getElementSimplePath(d.oe);
    }catch(exx){
      e.bzTmp=_Util._getElementSimplePath(e)
      return e.bzTmp
    }

    function _chkPath(e,p){
      let fe=$util.findDom(p)
      return fe==e||(fe&&fe.type=="radio"&&e.type=="radio"&&fe.name==e.name)
    }
    
    function _isInput(e){
      let a=_IDE._data._curAction
      if(_Util._isInputObj(e)){
        return 1
      }
      if(a&&!BZ._isRecording()){
        if(a.type==1&&"change,key".includes(a.event.type)){
          return 1
        }else if(a.type==2||(a.type==0&&a.content&&["innerText","value","data"].includes(a.content.type))){
          let ee= _cssHandler._findLabelByInput(e,1)
          return ee.tagName!=e.tagName&&(e.tagName!="A"||!$(ee).find(e.tagName)[0])
        }
      }
    }

    //o:TR cell,t: table (option)
    function _findRowColPath(o,t){
      if(["TD","TH"].includes(o.tagName)){
        let p=o,tr,th,rc,hc,x,y,s,or=o.getBoundingClientRect();
        while(p.parentElement){
          p=p.parentElement
          if(p.tagName=="TR"){
            tr=p
            if(t){
              break
            }
          }else if(p.tagName=="TABLE"){
            t=p
            break
          }
        }
        th=$(t).find("tr:eq(0)")[0]
        rc=$(tr).find("td,th")[0]
        if(!$util.getElementText(th)){
          return
        }
        let trs=th.children
        x=$(tr).find("td,th").toArray().indexOf(o)

        if(x>=0){
          hc=trs[x]
          if(hc){
            if(!$util.getElementText(hc)){
              return
            }
            let rh=hc.getBoundingClientRect()
            if(rh.left-5<=or.left&&rh.right+5>or.right){
              return _getRCValue(rc,hc)
            }else if(rh.left>=or.right-5){
              x--
              s=-1
            }else{
              x++
              s=1
            }
          }else{
            x--
            s=-1
          }
        }

        for(;x<trs.length;x+=s){
          let hc=trs[x]
          if(hc){
            let rh=hc.getBoundingClientRect()
            if(rh.left-5<=or.left&&rh.right+5>or.right){
              return _getRCValue(rc,hc)
            }
          }else if(x<0){
            return
          }
        }
      }
      function _getRCValue(rc,hc){
        return o.tagName+":RowCol("+$util.getElementText(rc)+"|"+$util.getElementText(hc)+")"
      }
    }

  },
  _isIgnoreClass:function(c){
    return c.match(_cssHandler._ignoreClasses)
  },
  _findForm:function(_root){
    _root=_root||document.body
    let wr=document.body.getBoundingClientRect();
    let w=wr.width*0.8,t=wr.height*0.4
    let p=$(_root).find("*").toArray().reverse().find(x=>{
      if(x.tagName=="BODY"){
        return 1
      }else if(x.tagName=="DIV"){
        let r=x.getBoundingClientRect();
        if(r.width>=w&&r.top<=t&&r.height>100){
          return _cssHandler._findAllInputs(x).length
        }
      }
    })
    if(!p){
      return _root
    }

    return _cssHandler._getBetterParent(p)

  },
  _getBetterParent:function(p){
    if(p.tagName=="BODY"||_cssHandler._isFixedAbsoluteElement(p)){
      return p
    }
    let r=p.getBoundingClientRect(),
        pr=p
    while(1){
      let pp=p.parentElement
      if(pp){
        let ppr=pp.getBoundingClientRect()
        if(ppr.width-r.width<=40){
          return _cssHandler._getBetterParent(p.parentElement)
        }
      }
      pr=pr.previousElementSibling
      if(!pr){
        return _cssHandler._getBetterParent(p.parentElement)
      }else if(!_Util._isHidden(pr)){
        let rr=pr.getBoundingClientRect()
        if(rr.width>r.width){
          if(rr.width==window.innerWidth){
            return p
          }
        }else if(rr.left<r.left||rr.left>r.right-10){
          return p
        }
      }
    }
  },
  _isFixedAbsoluteElement:function(o){
    return ["fixed","absolute"].includes($(o).css("position"))
  },
  _findCellElement:function(e,_root){
    if(["INPUT","TEXTAREA","SELECT","A","BUTTON","DIV","SPAN"].includes(e.tagName)){
      return e;
    }
    if(e.tagName=="SPAN"){
      return _Util._getParentElementByCss("button,a",e)||e
    }
    try{
      if($(e).is(_IDE._data._curVersion.setting.content.clickableElements)){
        return e
      }
    }catch(ee){}
    var es=$(_root||e.ownerDocument).find("SVG,[contenteditable=true],A,SELECT,"+_cssHandler._keyMap.button._css);
    if(es.is(e)){
      if(e.tagName=="svg"){
        if(!$("button,A").find(e).length){
          return e
        }
        while(!["A","BUTTON"].includes(e.tagName)){
          e=e.parentElement
        }
        return e
      }
      return e
    }else{
      es=es.filter(function(m,ee){
        var r=ee.getBoundingClientRect()
        if(!r.width || !r.height){
          return
        }
        if($(ee).find(e).length){
          if(["SVG","SELECT"].includes(ee.tagName.toUpperCase()) || (ee.innerText && ee.innerText.trim())){
            return ee;
          }else{
            return e;
          }
        }
      });
      if(es.length){
        return es[0]
      }
    }
    return e;
  },
  _isPriorityElementItem:function(v){
    if(v[0]=="["){
      v=v.split("=")[0]
    }
    var os=_cssHandler._priorityItems
    if(!os.length){
      os=_cssHandler._priorityItems=_IDE._data._curVersion.setting.content.priorityElementItems.replace(/[,; ]/g,",").split(",")
      os.forEach((a,i)=>{
        os[i]="^"+a.replace(/\./g,"").replace(/[*]/g,".+")+"$"
      })
    }
    return os.find(o=>{
      return v.match(new RegExp(o))
    })
  },
  //Sing element path description
  _checkDescPath:function(_data,_simple){
    _cssHandler._findAttributes(_data);
    var o=_data._result,e=_data.e;

    //Clean text when the text to short and appear in multiple elements
    if(e.tagName!="CANVAS"){
      o._text=_Util._toTrimSign(o._text)
    }
    if(o._text && o._text.length==1 && e!=_data.oe && $(e.ownerDocument).find(":endEqual("+o._text+")").length>1){
      if(_data._label==o._text){
        _data._label=""
      }else if(_data._headers.length && _data._headers[_data._headers.length-1]._text==o._text){
        _data._headers.pop()
      }
      o._text="";
    }

    var _priorityItems=o._priorityItems||"", p=_cssHandler._cssToDesc(o._main);
    var cp=[],_css=[],_tag=_cssHandler._nameMap[p[0]];
    if(_tag){
      _tag=_tag._css
    }
    for(var i=1;i<p.length;i++){
      var v=p[i]
      if(v[0]!="{"){
        cp.push({_type:"element",_value:v,_css:_cssHandler._nameMap[v]._css});
      }else{
        v=v.substring(1,v.length-1)
        if(_cssHandler._isPriorityElementItem(v)){
          _priorityItems+=v;
        }else if(!v.match(/[0-9]+/)){
          _css.push({_type:"element",_css:[v]})
        }
      }
    }
    //give an empty value for loop
    _css.unshift(0);
    var _best,pps=[];
    for(var i=0;i<_css.length;i++){
      var c=_css[i];
      
      var _hasText=0;
      if(c){
        pps=pps.concat(cp.concat([]))
        if(_data.ee==1 || (c._css && _data.ee && _data.ee.length>1 && $(c._css[0]).find(_data.ee).length<_data.ee.length)){
          pps.unshift(c)
        }else{
          continue;
        }
      }

      if(!pps.length && !_data.ps.length || _tag){
        pps.push({_type:"element",_value:p[0],_css:_tag||[p[0].substring(1,p[0].length-1)]});
        if(o._text&&_simple!=4){
          _hasText=1;
          pps.unshift({_type:"text",_value:o._text});
        }
      }else if(o._text&&_simple!=4){
        _hasText=1;
        pps.unshift({_type:"text",_value:o._text});
      }
      if(_priorityItems){
        pps.push({_type:"element",_css:[_priorityItems]})
        _priorityItems=0
      }
      if(!pps.length){
        continue;
      }
      if(_data.ee && _data.ee.bzTmp && _data.ee.bzTmp.toString().endsWith(",0")){
        if(!_hasText){
          continue;
        }else{
          if(o._text.match(/^\[.+\|.+\]$/)){
            _data.ee.bzTmp.splice(1,0,_data.e.tagName+":RowCol("+o._text+")");
          }else{
            _data.ee.bzTmp.splice(1,0,_data.e.tagName+":Contains("+o._text+")");
          }
          break;
        }
      }
      pps=pps.concat(_data.ps);
      if(_css.length>1&&!i&&(!o._text||o._text.length<3||$.isNumeric(o._text))){
        continue
      }
      if(_doIt()){
        break
      }
    }
    _doFinal()
    if(_simple!=4&&_data.oe!=_data.ee&&o._text&&_data.oe.tagName!="CANVAS"&&!_cssHandler._isInShadowDom(_data.oe)){
      if(!pps.find(x=>{return x._type=="text"})){
        pps.unshift({_type:"text",_value:o._text});
      }
      _doIt()
      _doFinal()
    }
    if(_data.e.tagName!="BODY"){
      _data.e=_data.e.parentNode;
    }
    
    function _doIt(){
      _descAnalysis._clearTmpPath();
      let _root=_cssHandler._getRoot(e)
      if(!_root.bzTmp){
        _root.bzTmp=_cssHandler._getDocPath(_root);
      }
      var ee=_descAnalysis._findElement(pps,_root,0,_cssHandler._isCheckboxOrRadio(_data.oe),_data.oe);

      if(_data.oe.tagName=="BODY"){
        ee=_data.oe;
        ee.bzTmp=[_data.oe.bzTmp[0],"BODY",0]
      }
      if(ee && ee.bzTmp && ee!==_data.oe){
      }else if(ee && !ee.bzTmp && ((ee.is && !ee.is(_data.oe))||(ee.includes && !ee.includes(_data.oe)))){
      }else if(ee && (ee.bzTmp || (ee.length && (!_best || _best.es.length>ee.length)))){
        _best={es:ee,pp:pps};
        if(_best.es.bzTmp){
          if(_cssHandler._inTag(_data.e,"TR")){
            _best.es=[_best.es];
          }
          return 1;
        }
      }
    }
    
    function _doFinal(){
      if(_best && _best.es && (_data.ee==1 || _best.es.bzTmp || _data.ee.length>_best.es.length || (_data.ee.length==_best.es.length && o._text && (o._text==_data._label||(_data._headers.length && o._text==_data._headers[_data._headers.length-1]._text))))){
        _data.ps=_best.pp;
        _data.ee=_best.es;
      }
    }
  },
  _inTag:function(e,t){
    return e && e.parentNode && e.tagName!=="BODY" && (e.parentNode.tagName==t || _cssHandler._inTag(e.parentNode,t))
  },
  _getDocPath:function(_doc){
    if(_doc==BZ.TW.document){
      return "BZ.TW.document"
    }else if(_doc.host&&_doc.host.constructor!=String){//shadow dom
      let ps="";
      if(_doc.host.bzTmp){
        ps=_doc.host.bzTmp
        if(ps.constructor==String){
          ps=ps.split("\n")
        }
      }else{
        ps=_cssHandler._findPath(_doc.host);
      }
      let id=ps.pop();
      if(!$.isNumeric(id)){
        ps.push(id)
        if(ps.length==1){
          let r=_Util._getElementRoot(_doc.host);
          if(r.bzTmp&&r.bzTmp.constructor==String){
            r.bzTmp=r.bzTmp.split("\n")
          }
          var v=_Util._clone(r.bzTmp);
          v.push(ps[0])
          ps=v
        }
        let os=_Util._findDoms(ps)
        id=os.indexOf(_doc.host)
      }
      let r=ps.shift();
      
      return "BZ.TW.document\n"+ps.join("\n").trim()+":eq("+(id||0)+")"+"\nshadowRoot"
    }
    var fs=$(BZ.TW.document).find('IFRAME');
    for(var i=0;i<fs.length;i++){
      if(fs[i]==_doc.defaultView.frameElement){
        var c=""
        if(!fs[i].src.startsWith("http")){
          c=".body";
        }
        return "$(BZ.TW.document"+c+").find('IFRAME:eq("+i+")')[0].contentDocument";
      }
    }
  },
  /*
    To find element all features.
    e: current element
    ie: ignore element, last element parent
    oe: orignal element
  */
  _findAttributes:function(_data){
    var e=_data.e||_data.oe,oe=_data.oe,fs=0,ho=0,_noLabel=!_data._label,_headerLevel=_data._headers.length;
    
    if(oe!=e){
      fs=parseInt($(oe.ownerDocument.body).css("font-size"))
    }else{
      fs=_cssHandler._getFontSize(e,oe);
    }
    
    var g={_text:""};
    _cssHandler._findCss(e,g)
    if(oe==e){
      //Old button (input button)
      if(_data._stopLabel){
      }else if(e.tagName=="CANVAS"){
        if(e.bzTxtElement){
          g._text=e.bzTxtElement.t
        }
      }else if(_Util._isInputButton(e)){
        g._text=e.value;
      }else{
        if(!_Util._isInputObj(e)){
          _setHeader(_data,fs,g)
          if(!g._text){
            if(_data.e.tagName=="TD"){
              g._text=_cssHandler._getRowColDesc(_data.e);
            }
          }
          
          if(!g._text){
            g._text=_cssHandler._filterText(_cssHandler._findInnerWords(_data.e,1)||_cssHandler._findInnerWords(_data.e))
          }
        }
        if(!g._text){
          g._text=_cssHandler._findTitleAttribute(e)
        }
      }
      if(!_data._headers.length && !_Util._isInputObj(e)){
        _data._label=g._text;
      }else if(g._text && oe.placeholder==g._text){
        if(_cssHandler._isInPlaceholderForm(oe)){
          _data._label=g._text
        }
      }

    }else if(!_data._label && !_data._stopLabel){
      var p=_cssHandler._getParentSelect(e);
      if(!p){
        _setLabel(_data,g);
        if(_data._stopLabel && !g._text){
          if(_data._stopLabel){
            _data._label=_cssHandler._findTitleAttribute(_data.oe)
          }
          _setHeader(_data,fs)
          if(_data._headers[0] && _data._headers[0]._text==_data._label){
            _data._headers.pop()
          }
        }
        if(_data._label && _data.oe.placeholder && _data.oe.placeholder.length<_data._label.length){
          _data._label=_data.oe.placeholder;
          g._text=""
          _data._stopLabel=1
          _data.lCss=0
        }
      }
      _setHeader(_data,fs)
    }else if(e.tagName=="BODY"){
    }else if(_data.e.tagName=="TR" && _data._label && _data._label.match(/^(.+)\|(.+)$/)){
    }else{
      if(_data.e.tagName=="TD"){
        g._text=_cssHandler._getRowColDesc(_data.e);
//        if(!_data._label && g._text){
      }
      if(g._text){
        _data._label=g._text.match(/^\[(.+)\|(.+)\]$/);
        if(_data._label){
          _data._label=_data._label[1]+"|"+_data._label[2]
        }else{
          _data._label=g._text
        }
        _data._stopHeader=1
      }else{
        if(!_Util._isInputObj(oe)){
          _setHeader(_data,fs,g)
        }
        if(!g._text){
          _setHeader(_data,["TR","TD","TH","LI"].includes(_data.e.tagName) || _data.oe.tagName=="IMG"?0:fs,g)
        }
      }
    }
    _data.ie=e;
    _data._result=g;

    if(_data.oe==_data.e){
      
    }else if(_noLabel && _data._label){
    }else if(_data._stopHeader){
    }else if(_data._headers.length==_headerLevel && _data.e.tagName!="BODY"){
      if(_data.e.parentElement){
        _data.e=_data.e.parentNode;
        return _cssHandler._findAttributes(_data)
      }
    }
    function _setLabel(_data,g){
      var l=_cssHandler._findLabel(_data);
      if(l){
        _data._label=g._text=l.w;
        _data.lCss=_cssHandler._getElementCss(l.e)
      }
    }

    function _setHeader(_data,fs,g){
      if(_data._stopHeader||(_data._headers&&_data._headers.length)){
        return
      }
      var ho=_cssHandler._findHeader(_data,fs);
      if(ho && ho.t){
        var _css=_cssHandler._getHeaderCss(ho.e[0]||ho.e),_diff;
        
        if(_data._headers.length){
          var _last=_data._headers[_data._headers.length-1];
          for(var k in _last._css){
            if(_css[k]!=_last._css[k] && (!_css[k]||!_last._css[k]||(_last._css[k].toString()!=_css[k].toString()))){
              _diff=1
              break
            }
          }
          if(!_diff){
            for(var k in _css){
              if(_css[k]!=_last._css[k] && (!_css[k]||!_last._css[k]||(_last._css[k].toString()!=_css[k].toString()))){
                _diff=1
                break
              }
            }
          }
          if(!_diff){
            return
          }
        }
        if(g){
          g._text=ho.t;
        }
        _data._headers.push({_text:ho.t,e:ho.e,_css:_css});
      }
    }
  },
  _isInPlaceholderForm:function(e){
    
    e=e.parentNode;
    var os=$(e).find("INPUT")
    if(os.length>1){
      var n=0
      for(var i=0;i<os.length;i++){
        var o=os[i]
        if(!o.placeholder && !["button","image","submit","checkbox","radio","reset"].includes(o.type)){
          return 
        }else if(o.placeholder){
          n++
        }
      }
      if(n>1){
        return 1
      }
    }
    if(!e||e.tagName=="BODY"){
      return
    }
    return _cssHandler._isInPlaceholderForm(e)
  },
  _findInnerWords:function(e,_ignoreIconWord){
    if(_ignoreIconWord){
      if(_cssHandler._isIcon(e)){
        return ""
      }
    }
    if(["SVG","TEXTAREA","SELECT","IMG"].includes(e.tagName.toUpperCase())){
      return ""
    }
    var es=e.childNodes,w=""
    for(var i=0;i<es.length;i++){
      e=es[i];
      if(e.nodeType==1){
        if(!_Util._isHidden(e)){
          var ww=_cssHandler._findInnerWords(e,_ignoreIconWord);
          if(ww.trim()){
            w=ww.trim()
            break
          }
        }
      }else if(e.nodeType==3){
        var t=_Util._pickTextFromNode(es,i)
        i=t.i;
        if(t.t.length>w.length){
          w=t.t
        }
      }
    }

    
    return w
  },
  _isList:function(c,_forField){
    var _last,_hasMenu;
    if(c.tagName=="SELECT" || !c.children || !c.children.length){
      return;
    }else if(c.children.length<2){
      return _cssHandler._isList(c.children[0])
    }
    
    if(c.className && c.className.constructor==String){
      var vs=_glossaryHandler._splitWord(c.className);
      if(vs.includes("menu")){
        _hasMenu= 1;
      }
    }
    let dd=new Set(),os=[];
    for(let o of c.children){
      if(_Util._isHidden(o)){
        continue;
      }
      if(!_forField&&["TR","TD"].includes(o.tagName)){
        return;
      }
      var r=o.getBoundingClientRect();
      if("HR"==o.tagName || (r.height<=5 && _hasMenu)){
        continue;
      }
      var cc=[]
      if(o.className && o.className.constructor==String){
        cc=o.className.split(" ").filter(x=>x);
      }
      let w=$(o).find(":endEqual(/.+/)").toArray()
      w=w.map(x=>{
        return {x:x,s:parseInt($(x).css("fontSize"))}
      })
      w.sort((a,b)=>a.s-b.s)
      w=w.pop()
      if(!w){
        return
      }
      if(_last){
        if(_last.t!=o.tagName){
          return;
        }else if(_last.r.left==r.left && Math.abs(_last.r.bottom-r.top)>20){
          return;
        }else if(_last.r.top==r.top && Math.abs(_last.r.right-r.left)>20){
          return;
        }else{
          if(_last.c.length && cc.length){
            var d=_Util._getDiffArray(_last.c,cc);
            d.forEach(x=>{
              dd.add(x)
            })
            if(dd.size>2){
              return;
            }
          }
        }
      }
      _last={r:r,c:cc,t:o.tagName,s:w.s,o:w.x};
      os.push(_last)
    }
    if(os.length>1){
      return os.map(x=>x.o)
    }
  },
  //e: element, oe: org element
  _getFontSize:function(e,oe){
    if(["A","BUTTON","INPUT","LABEL"].includes(e.tagName) && e==oe){
      return 0
    }else if(_cssHandler._isIcon(e)){
      return 0;
    }
    if(e.textContent.trim()){
      var w1=parseInt($(e.ownerDocument.body).css("font-weight"));
      var w2=parseInt($(e).css("font-weight"));
      var w3=parseInt($(oe).css("font-weight"));
      var c1=_Util._getBackgroundColor(e);
      var c2=_Util._getBackgroundColor(oe);
      return parseInt($(e).css("font-size"))+(w2>w1 && (w2>w3||c2!=c1)?0.5:0);
    }
    return 0;
  },
  /*
    pe: element,
    fs: min font size
    ie: ignore element
    _bRight: check element right words (checkbox and radio is 1)
  */
  _findHeader:function(_data,fs,_passInput){
    if(_data.e==_data.oe){
      return {}
    }

    let e=_data.ie||_data.oe
    let oer=e.getBoundingClientRect()
    
    for(let o of _data.e.children){
      if(o==e){
        return {}
      }else if(!_Util._isHidden(o)){
        let t=$util.getElementText(o)
        if(t&&t.length<100){
          let r=o.getBoundingClientRect()
          if(r.top<oer.top&&r.left<oer.left){
            return {e:o,t:t}
          }
        }
      }
    }
  },
  _isIcon:function(e){
    return $(e).css("font-family").includes("Material Icons")
  },
  _findLabel:function(_data){
    var e=_data.e,_label,_labelE,_labelElement;
    var r=_data.oe.getBoundingClientRect();
    
    if(_data.oe.id&&!_data.oe.id.match(/[^a-zA-Z0-9:]/)){
      var t=$("[for="+_data.oe.id.replace(/:/g,"\\:")+"]")[0]
      if(t && $(e).find(t).length){
        var w=$(t).text().trim()||_cssHandler._findTitleAttribute(t);
        if(w){
          _data._stopLabel=1
          return {w:w,e:t}
        }
      }else if(t){
        return
      }
    }
    var _bRight=["checkbox","radio"].includes(_data.oe.type);
    if(e.innerText && e.innerText.trim()){
      var _bStart=!_bRight;
      for(var i=0;i<e.childNodes.length;i++){
        var c=e.childNodes[i];
        if(c.nodeType==1 && !$(c).is(":visible")){
          continue
        }
        if(c==_data.ie){
          if(_bStart){
            return _label||_cssHandler._getRightLabel(c)
          }
          _bStart=1
        }else if(_bStart){
          var v="";
          var o=e.childNodes[i-1];
          if(c.nodeType==1 && _Util._isHidden(c)){
            continue;
          }
          _labelE=0
          if(c.nodeType==1 && c.innerText && c.innerText.trim()){
            v=_cssHandler._handleContainText(_cssHandler._findLabelText(c,_bRight,_data.oe));
            _labelE=c
          }else if(c.nodeType==3){
            var t=_Util._pickTextFromNode(e.childNodes,i);
            i=t.i
            v=_cssHandler._handleContainText(t.t);
            _labelE=e
          }
          v=_Util._removeEndSign(v);
          var cc=_cssHandler._hasInput(c);
          if(!_bRight){
            if(cc){
              _label="";
              _data._stopLabel=1
            }else if(v){
              if(_cssHandler._isLabel(_data.oe,c,_bRight)){
                if(c.nodeType==1&&_data.oe.type!="file"){
                  var rr=c.getBoundingClientRect();
                  if(_label && rr.top<r.top && rr.bottom-rr.height/2<r.top && rr.left-30>r.left){
                    continue
                  }
                }
                _label={w:v,e:_labelE};
              }else{
                _data._stopLabel=1;
              }
            }
          }else{
            if(!cc){
              if(_cssHandler._isLabel(_data.oe,c,_bRight)){
                _label={w:v,e:_labelE};
              }else{
                _data._stopLabel=1;
              }
            }
            break;
          }
        }
      }
    }
    return _label;
  },
  _getRightLabel:function(c){
    let p=c.parentElement
    let o=c.nextElementSibling
    if(p.children.length==2&&o&&_cssHandler._isTextElement(o)){
      let t=_Util._pickTextFromNode([o],0);
      return {w:t.t,e:o}
    }
  },
  _isTextElement:function(c){
    if(!c.children.length){
      return 1
    }else if(c.children.length==1){
      return _cssHandler._isTextElement(c.children[0])
    }
  },
  _isLabel:function(o,c,_bRight){
    if(c.nodeType==1){
      if($(c).find(o).length||o.type=="file"){
        return 1;
      }
      var p=_cssHandler._getParentSelect(o);
      if(p){
        o=p;
      }
      var r1=o.getBoundingClientRect(),r2=c.getBoundingClientRect();

      if(_bRight){
        return r2.left>r1.right && r2.top<r1.bottom && r2.bottom>r1.top
      }else if(r2.right<=r1.left){
        //label left and input right
        return r2.top<r1.bottom && r2.bottom>r1.top;
      }else if(r2.bottom-r1.top<5 && r1.top-r2.bottom<15){
        //label up and input down
        r2=r2.bottom-parseInt($(c).css("padding-bottom"))
        return r1.top-r2<25;
      }else if(r1.left>=r2.left&&r1.right<=r2.right&&r1.top>=r2.top&&r1.bottom<=r2.bottom){
        return 1
      }else{
        return;
      }
    }
    return 1;
  },
  _hasInput:function(e){
    if(e.nodeType==1){
      return _cssHandler._findAllInputs(e).length;
    }
  },
  _getInputCss:function(){
    var c=_cssHandler._inputCss;
    if(!c){
      _IDE._data._curVersion.setting.objectLib.element.forEach(function(v){
        if(v.key=="input"){
          c=_cssHandler._inputCss=v.css
        }
      })
    }

    return c
  },
  _retrieveFontInfo:function(e){
    return {
      size:$(e).css("font-size"),
      weight:$(e).css("font-weight"),
      color:$(e).css("color"),
      family:$(e).css("font-family"),
    }
  },
  _getUniqueClass:function(e){
    let cs=[],_primary=[]
    for(var i=0;i<e.classList.length;i++){
      var m=e.classList[i]
      if(_cssHandler._isPriorityElementItem(m)){
        _primary.push(m)
        cs=0
      }else if(!_primary.length){
        var mc=m.match(/[^a-zA-Z-_]/)
        if(!m.match(/[^a-z-_\$]/i)&&!_cssHandler._isIgnoreClass(m)){
          cs.push(m)
        }
      }
    };
    cs=cs||_primary
    cs.sort((a,b)=>{
      return b.length-a.length
    })
    let _best,_bestClass;
    cs.find(x=>{
      let v=$("."+x).length
      if(!_best||_best>v){
        _best=v
        _bestClass=x
      }
      if(v==1){
        return 1
      }
    })
    return _bestClass
  },
  _findCss:function(e,g){
    g._priorityItems=""
    var _list=[e.tagName];
    if("BODY"!=e.tagName){
      if(e.classList){
        let cs=_cssHandler._getUniqueClass(e)
        if(cs){
          _list.push("."+cs);
        }
      }
      if(e.id && e.id.match && !e.id.match(/[0-9]/)){
        _list.push("#"+e.id.replace(/([^a-zA-Z0-9_-])/g,"\\$1"))
      }
      if(_Util._isStdInputElement(e) && e.tagName!="SELECT" && e.type){
        _list.push("[type="+e.type+"]")
      }else if(_Util._isInContentEditable(e)){
        _list.push("[contenteditable=true]")
      }
      
    }
    g._main=_list;
  },
  _findTitleAttribute:function(e){
    var t="";
    for(var i=0;i<e.attributes.length;i++){
      var a=e.attributes[i];
      var _name=a.name;
      var v=a.value.trim();
      if(!v||v=="null"|| _Util._isDynamicValue(v)){
        continue
      }
      if("placeholder"==_name){
        t=v;
        if(_cssHandler._isInPlaceholderForm(e)){
          break
        }
      }else if(_name.match(/title|label/)){
        t=v;
        break
      }else if("alt"==_name){
        t=v;
        if(e.tagName=="IMG"){
          break
        }
      }else if("name"==_name && !t && v && !v.match(/[0-9]/)){
        t=v;
      }else{
        continue;
      }
    }
    
    return t;
  },
  _handleContainText:function(v){
    v=v.trim().split(/[\n\t\r\*$]/);
    var m="";
    for(var i=0;i<v.length;i++){
      var vv=v[i].trim();
      if(vv.length>m.length){
        m=vv;
      }
    }
    
    return m;
  },
  _findLabelText:function(nd,_first,oe){
    var t="";
    if(!_first){
      var ro=oe.getBoundingClientRect();
      var rn=nd.getBoundingClientRect();
      if(rn.bottom<ro.top){
        _first=true;
      }
    }
    
    for(var i=0;i<nd.childNodes.length;i++){
      var n=nd.childNodes[i];
      if(n.nodeType==3){
        var tt=_Util._pickTextFromNode(nd.childNodes,i)
        i=tt.i
        t=_cssHandler._filterText(tt.t)||t;
      }else if(n.nodeType==1 && n.innerText && n.innerText.trim()){
        if(!_cssHandler._isButton(n)){
          t=_cssHandler._findLabelText(n,_first,oe)||t
        }
      }else{
        continue;
      }
      if(_first && t){
        return t;
      }
    }
    return t;
  },
  _filterText:function(v){
    var vs=(v||"").trim().split(/[\*\n\[\]\,\(\)\}\{\:\|]/),_max="";
    for(var i=0;i<vs.length;i++){
      v=vs[i].trim()
      if(v.length>_max.length){
        if(v.length>=5){
          return v
        }
        _max=v
      }
    }
    return _max;
  },
  _isButton:function(e){
    var es=$(e.ownerDocument).find(_cssHandler._keyMap.button._css);
    return es.is(e);
  },
  //frame,form,editor,data,dataForm
  _getTableType:function(e){
    let v=_cssHandler._findDefinitedElement(e,"table");
    if(v&&v[0]==e){
      return _cssHandler._hasInput(e)?"editorTable":"dataTable"
    }

    var _buttonCss=_cssHandler._keyMap.button._css,_hasHeader;
    if(!e||!e.tagName=="TABLE"){
      return;
    }
    var _tableRect=e.getBoundingClientRect();
    var _bodyHeight=e.ownerDocument.body.scrollHeight
    if(e.ownerDocument.body.scrollHeight-_tableRect.height<20 && e.ownerDocument.body.scrollWidth-_tableRect.width<20){
      return "frame";
    }
    
    var _form=_data=_editor=0,trs=$(e).find("tr");
    var _lastTr="";
    
    for(var i=0;i<trs.length;i++){
      var tr=trs[i];
      var tds=tr.children;
      var _curTr="";

      if($(tr).text().trim()){
        for(var m=0;m<tds.length;m++){
          var td=tds[m];
          if($(td).find(_buttonCss).length){
            if(_Util._findInputs(td).length){
              _curTr+="i"
            }else{
              _curTr+="b"
            }
          }else if(_Util._findInputs(td).length){
            _curTr+="i"
          }else if(td.tagName=="TH"){
            _curTr+="h"
          }else{
            _curTr+=$(td).text().trim()?"t":"o";
          }
        }
        if(_curTr.length>1){
          var t=_curTr.replace(/h|t/g,"");
          if(!t){
            var hs=_curTr.match(/h/g);
            if(hs && hs.length>2){
              _hasHeader=1
            }
            _data++;
          }else if(_curTr.endsWith("b")){
            var is=_curTr.match(/i/g);
            is=is?is.length:0;
            if(is>1 || (is==1 && !$(tr).find("input[type=check]").length)){
              _editor++;
            }else{
              _data++;
            }
          }else if(_curTr.match(/ht|tt|hh|th/g)){
            _data++;
          }else if(_curTr.match(/^ii+|^hii+|^tii+/)){
            _data++;
            _form++;
          }else if(["hi","ti"].includes(_curTr.substring(0,2))){
            _form++;
          }else if(_curTr.includes("b")){
            if(_curTr!=_lastTr){
              _form++;
            }
          }else if(_lastTr.length!=_curTr.length){
            _form++;
          }
        }
      }else if($(tr).find("input").length>0){
        _form++;
      }
      
      _lastTr=_curTr;
    }
    if(_form>_data){
      return _form>_editor && !_hasHeader?"form":"editorTable"
    }else{
      if(_form>_editor && _data-_form<3){
        return "dataForm"
      }
      return _data>_editor?"dataTable":"editorTable"
    }
  },
  _getEnableTDs:function(tr){
    var tds=[]
    _Util._filterOutHidden(tr.children,tds)
    return tds;
  },
  _getRowColDesc:function(e){
    try{
      var r=e.parentElement;//tr
      var t=r.parentElement.parentElement; //table
      var tt=_cssHandler._getTableType(t);
      if(!["dataTable","dataForm","editorTable"].includes(tt)){
        return;
      }
      var hs=$(t).find("tr:eq(0) th");
      r=th_cssHandleris._getEnableTDs(r)
      if(hs.length<2){
        hs=_cssHandler._findTableOuterHeader(t,r);
        if(!hs){
          hs=_cssHandler._getEnableTDs($(t).find("tr:eq(0)")[0]);
        }
      }else{
        hs=_cssHandler._getEnableTDs(hs[0].parentElement);
      }
      if(hs.length!=r.length){
        if(_cssHandler._getColCountWidth(hs)!=_cssHandler._getColCountWidth(r)){
          return
        }
      }
      var h=hs[r.indexOf(e)]
      if($(h).text() && (h.tagName!=e.tagName || parseInt($(h).css("font-size"))>parseInt($(e).css("font-size")) || $(h).css("font-weight")!=$(e).css("font-weight"))){
        var m=0,_best;
        for(var i=0;i<r.length;i++){
          var c=r[i];
          if(c!=e){
            var tx=_cssHandler._filterText($util.getElementText(c));
            if(!tx){
              continue;
            }
            var n=$(t).find(c.tagName+":Contains("+tx+")").length
            if(n && (!m || n<m)){
              _best=tx;
              m=n;
            }
          }else{
            break
          }
        }
        if(_best){
          return "["+_best.trim().replace(/\|/g,"\\|")+"|"+$util.getElementText(h)+"]"
        }
      }
    }catch(ex){}
  },
  _getColCountWidth:function(cs){
    var n=0;
    for(var i=0;i<cs.length;i++){
      var c=cs[i];
      if(c.colspan){
        n+=parseInt(c.colspan)||1
      }else{
        n++;
      }
    }
    return n
  },
  _findTableOuterHeader:function(t,r){
    if(t.parentElement.children.length>1){
      return
    }
    var tp=t.parentElement.getBoundingClientRect()
    var hs=[],_diff=0;
    for(var i=0;i<r.length;i++){
      var d=r[i];
      var dp=d.getBoundingClientRect()
      var h=t.ownerDocument.elementFromPoint((dp.left+dp.right)/2,tp.top-20)
      var hp=h.getBoundingClientRect();
      if(hp.width-dp.width>30){
        return
      }else{
        while(dp.width-hp.width>30){
          h=h.parentElement;
          hp=h.getBoundingClientRect()
        }
        if(hp.tagName=="TD" && hp.parentElement.parentElement.children.length>1){
          return;
        }
        if(Math.abs(dp.width-hp.width)>10){
          _diff++;
        }
        hs.push(h)
      }
    }
    return hs
  },
  _isInput:function(e){
    var b=["INPUT","TEXTAREA","SELECT"].includes(e.tagName) && !["image","button","reset","submit"].includes(e.type)
    return b
  },
  _isElementReady:function(ts,_fun){
    if(!window.extensionContent){
      bzComm.postToAppExtension({
        fun:"_isElementReady",
        scope:"_cssHandler",
        ps:[ts],
        insertCallFun:1,
        return:_fun
      });
      return
    }
    var rs=[],_withElement=ts._withElement
    ts=ts.ts
    ts.forEach(t=>{
      var s="",_element=t

      t=$util.findDom(t)
      if(!t||_Util._isOpacity(t)){
        t=0
      }else if(t&&t.tagName=="INPUT"){
        if(!["text","number","date"].includes(t.type)||!t.value){
          s="empty"
        }
      }else if(t&&t.tagName=="TEXTAREA"&&!t.value){
        s="empty"
      }else if(t&&t.tagName=="SELECT"){
        s="empty"
      }
      t=t&&!t.disabled&&!$(t).attr("readonly")&&!_Util._isHidden(t)?"enable":!t||_Util._isHidden(t)?"":"disable"
      if(_withElement){
        rs.push({
          _withElement:_withElement,
          _value:t+s
        })
      }else{
        rs.push(t+s)
      }
    })
    _fun(t) 
  },
  _findAllInputs:function(e,_noReadonly,_includeHidden){
    let _body=document.body
    
    e=e||_body
    var cs=_cssHandler._getInputCss();
    
    var vs=_Util._findInputs(e),os=[];
    for(var i=0;i<vs.length;i++){
      var v=vs[i];
      if(($(v).attr("disabled")||$(v).attr("readonly"))&&_noReadonly){
        continue
      }
      if(!_Util._isHidden(v)||(_includeHidden&&["checkbox","radio"].includes(v.type))){
        os.push(v);
      }
    }
    if(!os.length){
      os=$(e).find(cs).toArray()
    }
    if(!os.length){
      if($(e).is(cs)){
        os.push(e)
      }
    }
    return os
  },
  _getParentSelect:function(e){
    var _css=_cssHandler._keyMap.dropdownList._css.split(",");
    for(var i=0;i<_css.length;i++){
      var o=$(BZ.TW.document).find(_css[i]);
      if(o.is(e).length ){
        return e;
      }else if(o.find(e).length){
        for(var n=0;n<o.length;n++){
          if($(o[n]).find(e).length){
            return o[n]
          }
        }
      }
    }
  },
  _isCheckboxOrRadio:function(e){
    if(e.tagName=="INPUT" && ["checkbox","radio"].includes(e.type)){
      return 1;
    }
  },
  _getElementScope:function(e,_style){
    if($(e).is(_style)){
      return e
    }
    let r=e.getBoundingClientRect(),p=e,_txt=(e.innerText||"").trim(),pp=e
    while(p=p.parentElement){
      if(["BODY"].includes(p.tagName)){
        return pp
      }
      pp=p
      if(_style){
        if(!$(p).is(_style)){
          e=p
        }else{
          return p
        }
      }else{
        if((p.innerText||"").trim()==_txt||!_txt){
          for(var i=0;i<p.children.length;i++){
            let c=p.children[i]
            if(c!=e){
              c=c.getBoundingClientRect()
              if(c.width&&c.height&&(Math.abs(c.top-r.top)>20||Math.abs(c.bottom-r.bottom)>20)){
                return e
              }
            }
          }
          e=p
          if(!_txt){
            _txt=(p.innerText||"").trim()
          }
        }else{
          break
        }
      }
    }
    return _style?0:e
  },
  //////////////////////////////////////////
  //
  // analysis element css
  //
  //////////////////////////////////////////
  _getElementCss:function(e,_pickSubElement){
    if(!e){
      return
    }
    var c=e.className && e.className.constructor==String?e.className:"";
    c=new Set(c.match(/[^ ]+/g));
    if(e.id && !_Util._isDynamicValue(e.id)){
      c.add("#"+e.id)
    }
    if(!_pickSubElement){
      var cs=[...c];
      c={
        css:_filter(cs),
        eType:_cssHandler._getElementType(e)
      }
      if(!c.eType){
        c.tag=e.tagName
      }
      if(e.children.length==1 || ["A","BUTTON","LABEL","SPAN"].includes(e.tagName) || $(e).is(_IDE._data._curVersion.setting.content.clickableElements)){
        var ss=new Set();
        for(var i=0;i<e.children.length;i++){
          var v=_cssHandler._getElementCss(e.children[i],1);
          ss=new Set([...ss,...v])
        }
        if(ss.size){
          c.subCss=_filter([...ss])
        }
      }
    }else if(e.children.length==1 || ["SPAN","I"].includes(e.tagName)){
      for(var i=0;i<e.children.length;i++){
        var v=_cssHandler._getElementCss(e.children[i],1);
        c=new Set([...c,...v])
      }
    }
    if(c.css){
      _Util._spliceAll(c.css,x=>{
        return _cssHandler._isIgnoreClass(x)
      })
      c.css.sort(function(a,b){
        return b.length-a.length
      })
    }
    return c
    
    function _filter(cs){
      var cc=[]
      for(var i=0;i<cs.length;i++){
        if(cs[i][0]=="#"){
          cc.push(cs[i])
        }else if(!_Util._isDynamicValue(cs[i])){
          cc.push("."+cs[i])
        }
      }
      return cc
    }
  },
  _getElementTitle:function(e){
    var ws=new Set()
    for(var i=0;i<e.attributes.length;i++){
      var a=e.attributes[i]
      
//      if(a.name.toLowerCase().match(/(^|_|-)(title|label|placeholder|alt|name)($|_|-)/)){
      if(a.name.toLowerCase().match(new RegExp("(^|_|-)("+_IDE._data._setting.content.contentAttribute+")($|_|-)"))){
        var v=(a.value||"").trim()
        if(v && !_Util._isDynamicValue(v)){
          ws.add(a.value)
        }
      }
    }
    if(ws.size){
      ws=[...ws]
      ws.sort(function(a,b){return a.length>b.length?1:-1})
      return ws[0]
    }
    return ""
  },
  _getHeaderCss:function(oe){
    var e=oe,ts=[oe.tagName],f=_cssHandler._getFontSize(oe,oe);
    
    while(e.parentElement && (e.parentElement.tagName.match(/h[0-9]/) || e.parentElement.children.length==1)){
      e=e.parentElement
      if(!ts.includes(e.tagName)){
        ts.unshift(e.tagName)
      }
    }
    while(!e.className && e!=oe){
      e=e.children[0]
    }
    e=_cssHandler._getElementCss(e)
//    e.tag=ts
    e.fontSize=f;
    return e
  },
  _findDefinitedElement:function(e,t){
    var es=_IDE._data._curVersion.setting.objectLib.element
    for(var i=es.length-1;i>=0;i--){
      var ee=es[i];
      if(!t||t==ee.key||(ee.data&&ee.data.type==t)){
        if($(e).is(ee.css)){
          if(t){
            return [e]
          }else{
            return {_elements:[e],_define:ee}
          }
        }else{
          var os=$(e).find(ee.css).toArray();
          for(var n=0;n<os.length;n++){
            if(_Util._isHidden(os[n])){
              os.splice(n,1)
            }
          }
          if(os.length){
            if(t){
              return os
            }else{
              return {_elements:os,_define:ee}
            }
          }
        }
      }
    }
  },
  _getElementDefinition:function(e,t){
    var es=_IDE._data._curVersion.setting.objectLib.element
    for(var i=es.length-1;i>=0;i--){
      if((!t||es[i].data.type==t)&&$(e).is(es[i].css)){
        return es[i]
      }
    }
  },
  _getElementType:function(e){
    e=_cssHandler._getElementDefinition(e)
    return e?e.key:""
  },
  _getInputTypeFromElementPath:function(ps){
    if(ps){
      for(var i=ps.length-1;i>0;i--){
        var p=(ps[i]+"").toLowerCase().replace(/"/g,"'");
        if(p.startsWith("input") && p.includes("[type=checkbox]")){
          return "checkbox"
        }else if(p.startsWith("input") && p.includes("[type=radio]")){
          return "radio"
        }
      }
    }
  },
  _isPanel:function(e){
    let r=e.getBoundingClientRect()
    if(r.width>200&&r.height>=150){
      return e.innerText
    }
  }
};
var _descAnalysis={
  _syntaxMap:0,
  _syntaxKey:0,
  _syntaxList:0,
  _syntaxGroup:0,
  /*
  _contentKey={
    "new":{
      //use _value link with _cssHandler._nameMap
      _value:"new",
      _type:"element",
      _key:"add", 
    }
  }
  */
  _contentKey:0,
  _contentList:0,
  _contentGroup:0,
  _elementMap:0,
  _setting:0,
  _keyboardMap:{
    enter:13,tab:9,space:32,f1:112,f2:113,f3:114,f4:115,f5:116,f6:117,f7:118,f8:119,f9:120,f10:121,f11:122,f12:123,home:36,end:35,pageup:33,pagedown:34,arrowleft:37,arrowup:38,arrowright:39,arrowdown:40,capslock:20,esc:27,escape:27,insert:45,"delete":46
  },
  _getCurLanguageElement:function(e){
    if(BZ._data._uiSwitch._curAppLanguage){
      let ee=[],
          wi=_IDE._data._setting.appLanguages.indexOf(BZ._data._uiSwitch._curAppLanguage)-1
      
      e.forEach((v,i)=>{
        if(v&&v.constructor==String){
          let w=_descAnalysis._retrieveTextForElementPathItem(v)
          let ww=_appWordHandler._wordMap[w]
          if(ww&&ww[wi]){
            ee.push(_descAnalysis._replaceElementWord(v,w,ww[wi]))
          }else{
            ee.push(v)
          }
        }else{
          ee.push(v)
        }
      })
      return ee
    }
    return e
  },
  //v:element path
  //w:old word
  //ww:new word
  _replaceElementWord:function(v,w,ww){
    let vv=v.split(w)
    if(vv.length>2){
      for(var i=0;i<vv.length-1;i++){
        let t=""
        vv.forEach((x,j)=>{
          t+=x
          if(j==i){
            t+=ww
          }else{
            t+=w
          }
        })
        t+=vv[vv.length-1]
        if(_descAnalysis._retrieveTextForElementPathItem(t)==ww){
          return t
        }
      }
    }else{
      return v.replace(w,ww)
    }
  },
  _init:function(){
    var es=_bzMessage._syntax;
    if(!_descAnalysis._syntaxList||!_descAnalysis._syntaxList.length){
      _descAnalysis._syntaxList=[];
      _descAnalysis._syntaxKey={};
      _descAnalysis._syntaxGroup={};
      _descAnalysis._syntaxMap={};
      for(var k in es){
        _descAnalysis._syntaxGroup[k]=[]
        _descAnalysis._syntaxMap[k]={}
        for(var kk in es[k]){
          var t=es[k][kk];
          _descAnalysis._addKey(t,kk,k,_descAnalysis._syntaxKey,_descAnalysis._syntaxList,_descAnalysis._syntaxGroup,_descAnalysis._syntaxMap);
        }
      }
      _descAnalysis._syntaxList.sort(function(a,b){
        return a.length<b.length;
      });

      es=_bzMessage._syntaxOption;
      _descAnalysis._syntaxOptionKey={};
      _descAnalysis._syntaxOptionList=[];
      _descAnalysis._syntaxOptionGroup={};
      _descAnalysis._syntaxOptionMap={};
      for(var k in es){
        _descAnalysis._syntaxOptionGroup[k]=[]
        _descAnalysis._syntaxOptionMap[k]={}
        for(var kk in es[k]){
          var t=es[k][kk];
          _descAnalysis._addKey(t,kk,k,_descAnalysis._syntaxOptionKey,_descAnalysis._syntaxOptionList,_descAnalysis._syntaxOptionGroup,_descAnalysis._syntaxOptionMap);
        }
      }
      _descAnalysis._syntaxOptionList.sort(function(a,b){
        return a.length<b.length;
      });
      
    }
    
    _descAnalysis._contentKey={
      "$project":{_value:"$project",_type:"data"},
      "$module":{_value:"$module",_type:"data"},
      "$test":{_value:"$test",_type:"data"},
      "$loop":{_value:"$loop",_type:"data"},
      "$parameter":{_value:"$parameter",_type:"data"},
      "$data":{_value:"$data",_type:"data"},
    };
    _descAnalysis._contentList=["$project","$module","$test","$loop","$parameter","$data"];
    _descAnalysis._contentGroup={data:["$project","$module","$test","$loop","$parameter","$data"]}
    _descAnalysis._contentMap={data:{"$project":["$project"],"$module":["$module"],"$test":["$test"],"$loop":["$loop"],"$parameter":["$parameter"],"$data":["$data"]}}
    es=_bzMessage._syntaxExtra;
    for(var k in es){
      _descAnalysis._contentGroup[k]=[];
      _descAnalysis._contentMap[k]={}
      for(var kk in es[k]){
        var t=es[k][kk];
        _descAnalysis._addKey(t,kk,k,_descAnalysis._contentKey,_descAnalysis._contentList,_descAnalysis._contentGroup,_descAnalysis._contentMap);
      }
    }
    var os=_IDE._data._curVersion.setting.objectLib;
    _descAnalysis._elementMap={};
    _descAnalysis._contentGroup.element=[];
    _descAnalysis._contentMap.element={}
    for(var k in os){
      es=os[k];
      for(var i=0;i<es.length;i++){
        var e=es[i];
        _descAnalysis._elementMap[e.key]=e;
        v=(e.value||_bzMessage._setting._objectLib._options[k][e.key]||"").toLowerCase();
        _descAnalysis._addKey(v,e.key,"element",_descAnalysis._contentKey,_descAnalysis._contentList,_descAnalysis._contentGroup,_descAnalysis._contentMap)
      }
    }

    _descAnalysis._contentList.sort(function(a,b){
      return a.length<b.length;
    });
    
    return 1;
  },
  _clearTmpPath:function(_includeShortCut){
    $(document).find("*").toArray().filter(function(e){
      e.bzTmp=e.bzParent=0;
      
      if(_includeShortCut){
        delete e.bzShortCut;
        delete e.bzQuick
      }
    });
  },
  _addKey:function(v,k,t,_kMap,_kList,_kGroup,_map){
    if(!v){
      return
    }
    var vs=v.split("/");
    _map[t][k]=vs;
    for(var i=0;i<vs.length;i++){
      v=vs[i];
      if(_kMap[v]){
        return 0
      }else{
        _kMap[v]={_value:v,_type:t,_key:k};
        _kGroup[t].push(v);
        
        _kList.push(v);
      }
    }
    return 1;
  },
  _mergeExpr:function(es){
    for(var i=0;i<es.length;i++){
      e=es[i];
      if(e._type=="element" && e._css && e._css[0] && e._css[0][0]==":"){
        for(var n=i+1;n<es.length;n++){
          var ee=es[n];
          if(ee._type=="element"){
            ee._css=_descAnalysis._mergePath(e._css,ee._css);
            es.splice(i--,1);
            break;
          }
        }
      }
    }
  },
  _mergePath:function(ps1,ps2){
    var ps=[];
    for(var i=0;i<ps1.length;i++){
      var p1=ps1[i];
      for(var ii=0;ii<ps2.length;ii++){
        var p2=ps2[ii];
        if(":.#[".includes(p1[0])){
          ps.push(p2+p1)
        }else if(":.#[".includes(p2[0])){
          ps.push(p1+p2);
        }else{
          ps.push(p2);
        }
      }
    }
    return ps;
  },
  _findFinalElement:function(cs,_root){
    if(!cs._element){
      return;
    }
    var e=_descAnalysis._findElement(cs._element,_root,["typing","check","set","uncheck"].includes(cs._action._key),cs._action._key.includes("check")),_first,ee;
    if(e && !e.bzTmp){
      for(var i=0;i<e.length;i++){
        if(!_Util._isHidden(e[i])){
          ee=_descAnalysis._findElementIdx(e[i]);
          if(!cs._action || cs._action._key!="click" || $(ee).css("cursor")=="pointer"){
            return ee;
          }
          if(!_first){
            _first=ee;
          }
        }
      }
      if(_first){
        return _first;
      }
    }
    return e;
  },
  _getAICssData:function(e,_path,_label){
    var d={HH:[]},_tag,_css;
    for(var i=_path.length-1;i>=1;i--){
      var p=_path[i]
      
      if(!$.isNumeric(p)){
        var t=_descAnalysis._retrieveTextForElementPathItem(p);
        if(!e){
          _tag=p.split(/[\:\.\#]/)[0];
          _css=p.split(":")[0].match(/[\.\#][^\.\#]+/g)
          if(_css){
            _css.sort(function(a,b){return b.length-a.length})
          }
        }
        if(_label && _label==t && d.LL){
          d.LL.id=i
        }
        if(!d.LL){
          if(t){
            d.LL={}
          }
          if(d.LL){
            d.LL.id=i;
            if(e){
              d.LL.C=_cssHandler._getElementCss(e)
            }else{
              d.LL.C={
                tag:_tag,
                css:_css
              }
            }
          }
        }else{
          if(t){
            if(e){
              var os=$(":endEqual("+t+")");
              if(os.length==1){
                os=os[0];
                os=_cssHandler._getHeaderCss(os)
                delete os.fontSize
                os.id=i
                d.HH.push(os)
              }
            }else{
              d.HH.push({
                tag:_tag,
                css:_css,
                id:i
              })
            }
          }
        }
      }
    }
    return d;
  },
  /*
  es:element path
  _root: like: BZ.TW.document or iframe
  _bSet: The search is for a set value on an input
  _bLeft: a label is at left of an input
  */
  _findElement:function(es,_root,_bSet,_bLeft,_orgElement){
    var e,_cssIdx,_reTry;
    for(var i=0;i<es.length;i++){
      e=es[i];
      if(!e._type){
        es.splice(i--,1);
      }else if(e._css&&e._css.length>1){
        e._css.forEach(function(v,j){
          es.splice(i,j?0:1,{_type:"element",_css:[v]})
        })
      }
    }
    for(var i=0;i<es.length;i++){
      e=es[i];
      if(e._type=="element" && e._css && e._css[0] && e._css[0].match(/^[0-9]+$/)){
        _cssIdx=parseInt(e._css[0]);
        es.splice(i,1);
      }else if(e._type=="text"){
        e._code=e._value
        e._value=window._JSHandler?_JSHandler._prepareData(e._value):e._value
      }
    }
    
    if(_bSet){
      var _bInput=0;
      for(var i=0;i<es.length;i++){
        e=es[i];
        if(e._type=="element" && ["input","textarea","select","dropdownList","checkbox","radio"].includes(e._key)){
          _bInput=1;
        }
      }
      if(!_bInput){
        _reTry=1
        es.push({_type:"element",_css:["INPUT","SELECT","TEXTAREA","[contenteditable=true]"]})
      }
    }
    
    _descAnalysis._mergeExpr(es);
    var _result={
      _path:[],
      _bLeft:_bLeft,
      _root:_root
    }
    var _limit={
      _path:[],
      _bLeft:_result._bLeft,
      _init:1
    };
    var e=0;
    //final search
    for(var i=es.length-1;i>=0;i--){
      e=es[i];
      
      var _tmpList=_descAnalysis._findElementInArea(e,_result,0,_orgElement);
      if(!_tmpList){
        continue
      }else if($(_tmpList).is(_orgElement) || !_orgElement){
        _result._endList=_tmpList
      }else{
        es.splice(i,1)
        _descAnalysis._clearTmpPath()
        return _descAnalysis._findElement(es,_root,_bSet,_bLeft,_orgElement)
      }
      if(i==es.length-1){
        _result._endList=_result._endList.not(".BZIgnore *");

        if(_orgElement && !_result._endList.is(_orgElement)){
          _result._endList.push(_orgElement)
        }
      }
      if(_result._endList){
        _descAnalysis._cleanTagName(_result._endList)
        if(i){
          _descAnalysis._cleanRootPath(_result._endList,_result._root)
        }
        if(_limit && _limit._init && ["text","group"].includes(e._type) && _result._endList.length>1 && _result._endList[0]!=_orgElement){
          for(var ii=0;ii<_result._endList.length;ii++){
            _result._endList[ii].bzOldTmp=_result._endList[ii].bzTmp;
            _result._endList[ii].bzTmp=_result._endList[ii].bzTmp.replace(/(\:)(contains|equal)(.+\))/i,"");
          }
          _limit._root=_result._root;
          _limit=_descAnalysis._findElementInArea(e,_limit,1,_orgElement);
          if(_limit){
            if(_limit.length==_result._endList.length){
              var _newList=[]
              for(var ii=0;ii<_result._endList.length;ii++){
                var o=_result._endList[ii];
                
                if(_limit[ii]==_result._endList[ii]){
                  _newList.push(o)
                }else{
                  o.bzTmp=_result._endList[ii].bzOldTmp;
                }
              }
              if(_orgElement && _newList.includes(_orgElement) && _newList.length<_result._endList.length){
                _result._endList=$(_newList)
              }else{
                for(var ii=0;ii<_newList.length;ii++){
                  _newList[ii].bzTmp=_newList[ii].bzOldTmp;
                }
              }
            }else if(i){
              if(_limit.length>_result._endList.length){
                for(var ii=0;ii<_result._endList.length;ii++){
                  _result._endList[ii].bzTmp=_result._endList[ii].bzOldTmp;
                }
              }
              _descAnalysis._cleanRootPath(_limit,_result._root)
            }
            _descAnalysis._cleanTagName(_limit)
          }
        }else if(_limit && _limit._init){
          _limit={_init:1,_endList:[]};
          for(var ii=0;ii<_result._endList.length;ii++){
            _limit._endList.push(_result._endList[ii])
          }
          _limit._endList=$(_limit._endList)
        }
      }else{
        break;
      }
    }
    
    e=_result._endList;
    if(e && e.length==1){
      if(e[0].bzTmp.constructor==String){
        e[0].bzTmp=e[0].bzTmp.split("\n")
      }
      return e[0];//_descAnalysis._findElementIdx(e[0]);
    }else if(e && e.length>1){
      var _list=[]
      if(_limit && !_limit._init){
        if(_limit.is(_orgElement) || !_orgElement){
          for(var i=0;i<e.length;i++){
            if(_limit.is(e[i])){
              _list.push(e[i])
            }
          }
        }
      }
      if(_list.length==1){
        return _descAnalysis._findElementIdx(_list[0]);
      }else if(_list.length){
        e=_list;
      }
      if(_cssIdx!==undefined && e.length>_cssIdx){
        return _descAnalysis._findElementIdx(e[_cssIdx]);
      }else if(_cssIdx!==undefined){
        e=null;
      }
    }else if(!e&&_reTry){
      es.pop()
      return _descAnalysis._findElement(es,_root,0,_bLeft,_orgElement)
    }
    return e;
  },
  _setSecondText:function(o,e,_path){
    var n;
    var s=o.bzTmp.split("\n");
    o.bzTmp=_path+"\n";
    for(n=0;n<s.length;n++){
      if(!s[n].startsWith("BZ.")){
        if(s[n].match(/\:(contains|Contains|textElement|endContains|afterEqual|after|before|endEqual|equal|RowCol|rowcol)\((.+)\)/)){
          
        }else{
          s[n]+=e
        }
        
        break;
      }
    }
    for(n=0;n<s.length;n++){
      o.bzTmp+=s[n];
      if(n<s.length-1){
        o.bzTmp+="\n";
      }
    }
  },
  _cleanTagName:function(_list){
    if(_list){
      for(var n=0;n<_list.length;n++){
        var v=_list[n], w="";
        if(!v.bzTmp.split){
          continue;
        }
        var ss=v.bzTmp.split("\n");
        if(ss.length>1){
          var s=w=ss[1];
          w=ss[0]+"\n"+w;
          for(var i=2;i<ss.length;i++){
            if(ss[i].match(/[:#.]/) || !s.startsWith(ss[i])){
              w+="\n"+ss[i]
            }
            s=ss[i];
          }
          v.bzTmp=w;
        }
      };
    }
  },
  _cleanRootPath:function(_list,_root){
    if(!_root[0] || !_list){
      _root=$(_root);
    }
    
    _list.each(function(i,a){
      if(!_root.is(a)){
        for(var i=0;i<_root.length;i++){
          if(a.bzTmp.startsWith && a.bzTmp.startsWith(_root[0].bzTmp+"\n")){
            a.bzTmp=a.bzTmp.replace(_root[0].bzTmp+"\n","");
            return;
          }
        }
      }
    });
  },
  _findElementIdx:function(ee,_simple){
    var e=ee;
    if(!e.bzTmp || e.bzTmp.constructor!=String){
      return;
    }
    var os,_root,p=e.bzTmp.split("\n");
    
    try{
      if (p && p.length>0) {
        
        if($.isNumeric(p[p.length-1])){
          p.pop()
        }

        var pp=p.pop();
        var ppp=pp
        if(!e.children.length){
          ppp=pp.replace(/\:contains\(/ig,":endContains(")
        }

        os=_search([].concat(p),ppp,e)
        if((!os.os.is(e)||os._solution)&&pp!=ppp){
          os=_search([].concat(p),pp,e)
        }
        
        var i=os.os.index(e);
        if(i>=0){
          if(i&&_simple!=3){//simple==3 is for label only. not try :last
            if(os.os.length==i+1){
              let _last=os.p.pop()
              if(!_last.endsWith(":last")){
                var oo=_Util._clone(os.p)
                oo.push(_last+":last")
                oo.push(0)
                if($util.findDom(oo)==e){
                  _last+=":last"
                  i=0
                }
              }
              os.p.push(_last)
            }
          }
          
          if(!i&&e.tagName=="CANVAS"&&e.bzTxtElement){
            i=TWHandler._getCanvasTextElementIdx(e,e.bzTxtElement)||0
            // delete e.bzTxtElement
          }
          
          os.p.push(i)
          e.bzTmp=os.p
        }else{
          if(e.bzTmp.constructor==String){
            e.bzTmp=[e.bzTmp.split("\n")[0]]
          }else{
            e.bzTmp=[e.bzTmp[0]]
          }
          e.bzTmp.push(_Util._getQuickPath(e))
        }
        ee.bzTmp=e.bzTmp
        return ee;
        
        function _search(p1,exp,e){
          var p2=[].concat(p1),_solution=0;
          p2.push(exp)
          
          var os=$(_Util._findDoms(p2))
          while(!os.is(e)&&p2.length>2){
            p2.splice(p2.length-2,1)
            os=$(_Util._findDoms(p2))
          }
          if(!os.is(e)){
            p2=p1
//            p2.push(exp)
            p2.push(e.tagName)
            os=$(_Util._findDoms(p2))
            while(!os.is(e)&&p2.length>2){
              _solution=1
              p2.splice(p2.length-2,1)
              os=$(_Util._findDoms(p2))
            }
          }
          return {os:os,p:p2,_solution:_solution}
        }
        
      }
    }catch(ex){
    }
  },
  _filterTextInEndList:function(_result,e,_limit,_orgElement){
    var p,pl;

    if(e._type=="text"){
      pl=p=e._value;
    }else{
      pl==eval(_ideDataHandler._parseToExeCode(e._value));
      p="{{"+e._value+"}}";
    }
    
    if(_result._endList && _result._endList[0]){
      var m=_result._endList[0].bzTmp.match(/\"(.)+\"/);
      if(m && m.includes(pl)){
        return;
      }
      
      var f=":equal("+_cssHandler._handleContainText(pl)+")";

      var ff=_Util._getAttrPath("value",_cssHandler._handleContainText(pl));
      var kp=p,kpl=pl
      var _list=$([]),_lastNot,_startBZ=_result._endList[0]
      _list=_result._endList.filter(ff)
      if(!_list.length){
        _list=_result._endList.filter(f)
      }

      if(!_list.length){
        pl=pl.toLowerCase();
        for(var i=0;i<_result._endList.length;i++){
          var e=_result._endList[i];
          var _title=0;
          for(var a=0;e.attributes && a<e.attributes.length;a++){
            var aa=e.attributes[a];
            var n=aa.name.toLowerCase();
            if(n.match(/title|label/)){
              _title=aa;
            }else if(n.includes("alt")){
              _title=aa;
            }else if(n=="placeholder" || n=="name"){
              _title=aa;
            }else if(n=="value" && _Util._isInputButton(e)){
              _title=aa;
            }
            if(_title){
              var tl=_title.value.toLowerCase();
              if(tl && (tl==pl || (!_limit &&!BZ._isRecording() && tl.includes(pl)&& _Util._includesWord(tl,pl)))){
                c=_Util._getAttrPath(_title.name,p)
                if(e.bzTmp && e.bzTmp.startsWith("BZ.")){
                  e.bzTmp+=c;
                }else if(!e.bzTmp.includes(c)){
                  e.bzTmp=_descAnalysis._getRootPath(_result._root,e)+"\n"+e.bzTmp+c;
                }else{
                  e.bzTmp=_descAnalysis._getRootPath(_result._root,e)+"\n"+e.bzTmp;
                }
                _list=_list.add(e);
                break;
              }
              _title=0;
            }
          }
        }
      }
      if(_list.length && (!_orgElement || _list.is(_orgElement))){
        _result._endList=_list;
        return 1;
      }
    }
  },
  _getRootPath:function(_root,e){
    if(_root.bzTmp){
      return _root.bzTmp;
    }
    for(var i=0;i<_root.length;i++){
      var r=_root[i];
      if($(r).find(e) || r==e){
        return r.bzTmp;
      }
    }
  },
  _getTextList:function(_root,e,k,_limit){
    var p,ps,_path,pl;
    if(e._type=="text"){
      pl=p=e._value;
    }else{
      pl=eval(_ideDataHandler._parseToExeCode(e._value));
      p="{{"+e._value+"}}";
    }
    
    var f=":"+k+"("+_cssHandler._handleContainText(pl)+")";
    var cf=e._value==p?f:":"+k+"("+p+")";
    pl=pl.toLowerCase();

    if(!_root[0]){
      _root=[_root];
    }
    //find inner element
    for(var i=0;i<_root.length;i++){
      var pps="",r=_root[i];
      _path=r.bzTmp;
      r=r.body;
      pps=$(r).find(f);
      for(var n=0;n<pps.length;n++){
        _descAnalysis._setBzTmpPath(pps[n],_path,cf,_limit);
      }
      pps=pps.add($(r).find("*").filter(function(m,e){
        if(!pps.is(e)){
          return _descAnalysis._filterAttr(e,_path,p,pl,_limit)
        }
      }));
      if(!ps){
        ps=pps;
      }else{
        ps=ps.add(pps)
      }
    }
    
    //filter self
    if(!ps || !ps.length){
      for(var i=0;i<_root.length;i++){
        _path=_root[i].bzTmp;
        var _body=_root[i].body||_root[i];
        ps=ps.add($(_body).filter(f).filter(function(i,e){
          if(!e.bzTmp){
//            e.bzTmp=e.tagName;
          }
          if(!e.bzTmp.startsWith(_path)){
//            e.bzTmp=_path+"\n"+e.bzTmp;
          }
          
          _descAnalysis._setBzTmpPath(e,_path,cf,_limit);

          return e;
        }));
        
        ps=ps.add($(_body).filter(function(i,e){
          if(!ps.is(e)){
            return _descAnalysis._filterAttr(e,_path,p,pl,_limit)
          }
        }));
      }
    }
    
    if(ps.length){
      var os=[];
      
      for(var i=0;i<ps.length;i++){
        if(ps[i].tagName!="OPTION"){
          os.push(ps[i])
        }
      }
    }
    return $(os);
  },
  _filterAttr:function(e,_path,p,pl,_limit){
    if(e.bzTmp){
      var s;
      if(e.bzTmp.constructor==String){
        s=e.bzTmp.split("\n");
      }else{
        s=e.bzTmp
      }
      s=s[s.length-1];
      if(s.match(/[^a-z-]/i)){
        return;
      }
    }
    var c=_Util._getAttributeCss(e,pl,p)
    if(c){
      _descAnalysis._setBzTmpPath(e,_path,c);
      return e;
    }
  },
  _setBzTmpPath:function(e,_path,c,_limit){
    c=c.replace(/^[a-z0-9-~+ >]+/i,"");
    if(e.bzTmp && e.bzTmp.constructor==Array){
      var s=""
      for(var i=0;i<e.bzTmp.length;i++){
        s+="\n"+e.bzTmp[i];
      }
      e.bzTmp=s.substring(1)
    }
    if(!e.bzTmp || _limit){
      e.bzTmp=_path+"\n"+e.tagName+c;
    }else if(e.bzTmp==_path || e.bzTmp.includes(_path+"\n")){
      if(!e.bzTmp.replace(_path,"").includes(c)){
        e.bzTmp+=c
      }
    }else if(e.bzTmp.startsWith("BZ.")){
      if(c){
        var s=e.bzTmp.split("\n");
        s=s[s.length-1];
        if(!s.includes(c)){
          e.bzTmp+=c;
        }
      }
    }else if(!e.bzTmp.includes(c)){
      var t=c.match(/\((.+)\)/);
      if(t){
        t=t[1];
        var tt=e.bzTmp.match(/\((.+)\)/);
        if(tt){
          tt=tt[1];
          if(tt.toLowerCase().includes(t.toLowerCase())){
            _descAnalysis._setSecondText(e,":Contains("+t+")",_path);
            return
          }
        }
      }
      
      var cc=e.bzTmp.replace(/^[a-z0-9-~+ >]+/i,"");
      c=e.tagName+c;
      if(!c.includes(cc) && (!c.match(/:contains|:end/)||!cc.match(/:contains|:end/))){
        c+=cc;
      }
      e.bzTmp=_path+"\n"+c;
    }
  },
  _addCssIntoBZTmpPath:function(_path,_css,e){
    if(!_css.startsWith(e.tagName)){
      return _path+e.tagName+_css;
    }else{
      return _path+_css;
    }
  },
  _findInCss:function(_root,_css,_findWay){
    var ppp=$([]),_final=[];
    if(!_root[0]){
      _root=[_root];
    }
    for(var i=0;i<_root.length;i++){
      var r=_root[i];
      var _path=r.bzTmp;
      for(var n=0;n<_css.length;n++){
        var c=_css[n]
        var ps=$(r)[_findWay](c).filter(function(i,p){
          if(!ppp.is(p)){
            if(_findWay=="find"){
              _descAnalysis._setBzTmpPath(p,_path,c);
            }
            return p;
          }
        });
        ppp=ppp.add(ps);
      }
    }
    return ppp;
  },
  _retrieveTextForElementPathItem:function(o,_bInput){
    o=o||"";
    if(!o || $.isNumeric(o)){
      return
    }
    var s=o.constructor==String?o.split("\n"):o;
    for(let n=s.length-1;n>=0;n--){
      if(s[n].constructor==String&&!$.isNumeric(s[n])){
        var ss=s[n].match(/(\:|\[)(near|data|contains|input|panel|text|afterEqual|after|before|Contains|textElement|endContains|endEqual|equal|RowCol|rowcol|name|title|placeholder)(\(\[|\(|\"|\*\=|\=|\[)([^\"\'\]]+)(\)|\"|\])/);
        ss=ss||s[n].match(/(\:|\[)(attr)(\(|\"|\*\=|\=)(.+)(\)|\")/);
        ss=ss||s[n].match(/^(\:)([a-z0-9]+)\((.+)\)$/i);//for com

        if(ss){
          var r=ss[4]||ss[3]
          if(ss[2]=="attr"){
            r=r.split("=")
            if(["value","placeholder","name","title"].includes(r[0])||r[0].includes("label")){
              r=r[1];
              r=r.split(/\)\:[a-zA-Z]+\(/)[0]
              return r
            }
          }else{
            return r
          }
        }else if(!s[n].match(/[a-z]+/i)){
        }else if(s[n].match(/^[a-z\-\_]+$/i)){
          continue
        }else if(_bInput||["INPUT","SELECT","TEXTAREA"].includes(s[n].match(/[a-z]+/i)[0])||s[n].includes("contenteditable=true")){
          continue
        }
        return "";
      }
    }
    
  },
  //Work only for setting event action. the element must have label. The function should be update after ai upgrade. TODO:
  _findLabelFromInputElementPath:function(s){
    s=s.constructor==String?s.split("\n"):s;
    for(n=s.length-1;n>=0;n--){
      if(s[n].constructor==String){
        var ss= s[n].match(/(\:|\[)(contains|Contains|afterEqual|after|before|endContains|endEqual|equal|RowCol|rowcol|name\*\=|title\*\=|placeholder\*\=)(\(|\")(.+)(\)|\")/);
        if(ss){
          return _glossaryHandler._getVariableName(ss[4]);
        }
      }
    }
  },
  _findElementInArea:function(e,_result,_limit,_orgElement){
    var p,_type,_text,r=_result._root,_endList=_result._endList;

    if(["group","text","data"].includes(e._type)){
      _text=1;
      
      if(_endList && _endList.length){
        var t=_descAnalysis._retrieveTextForElementPathItem(_endList[0].bzTmp);
        //TODO: parse e._value from data to value
        if(t && t.toLowerCase().includes(e._value.toLowerCase())){
          p=1
        }
      }

      if(!p && _descAnalysis._filterTextInEndList(_result,e,0,_orgElement)){
        return _result._endList;
      }
      if(e._value.match(/^\[.+|.+\]$/)){
        p=_limit?"rowcol":"RowCol"
      }else if((_orgElement && _Util._isInputObj(_orgElement))||_result._endList && _result._endList[0] && _Util._isInputObj(_result._endList[0])){
        var o=(_orgElement||_result._endList[0]).bzTmp||0
        if(o.constructor==Array){
          o=o[o.length-1]
        }
        if(!o.includes||!o.includes(":near")){
          p="near"
        }else{
          p=_limit?"endEqual":"endContains"
        }
      }else{
        p=_limit?"endEqual":"endContains"
      }
      if(_orgElement&&_orgElement.tagName=="CANVAS"){
        p="textElement"
      }
      _type=p
      if(p=="near"){
        if(_result._endList && _result._endList.length){
          p=_descAnalysis._getTextList(_result._endList,e,p,_limit)
        }else{
          p=_descAnalysis._getTextList(r,e,p,_limit)
        }
        if(p.length && (!_orgElement || p.is(_orgElement))){
          for(var i=0;i<p.length;i++){
            if(!p[i].bzTmp.includes(r.bzTmp)){
              p[i].bzTmp=r.bzTmp+"\n"+p[i].bzTmp;
            }
          }
        }else{
          p=_limit?"endEqual":"endContains"
        }
      }
      if(p.constructor==String){
        p=_descAnalysis._getTextList(r,e,p,_limit)
      }
    }else{
      if(e._extraText){
        p=_descAnalysis._findInCss(_descAnalysis._getTextList(r,e._extraText,_limit?"contains":"Contains",_limit),e._css,"filter");
      }else{
        p=_descAnalysis._findInCss(r,e._css,"find");
        if(!p.length){
          p=_descAnalysis._findInCss(r,e._css,"filter");
        }
      }
    }
    if(_endList){
      var pp=$([]);
      //try to find _endList items in result item inner element
      for(var i=0;i<p.length;i++){
        var _path1=p[i];
        var _path2=p[i]
        _path2=_path1;
        var ps=$(p[i]).find(_endList).filter(function(n,e){
          if(!pp.is(e) && e.bzTmp.startsWith){
            if(!e.bzTmp.startsWith("BZ.")){
              if(e.bzParent==p[i]){
                e.bzTmp=p[i].bzTmp+e.bzTmp.replace(/^[a-z-]*/i,"");
              }else{
                e.bzTmp=p[i].bzTmp+"\n"+e.bzTmp;
              }
            }
            e.bzParent=p[i];
            return e;
          }
        });
        pp=pp.add(ps)
      }
      if(pp.length && _orgElement && pp.is(_orgElement)){
        return pp;
      }else if(pp.length && ["endEqual","endContains","textElement"].includes(_type)){
        return pp;
      }else if(!pp.length){
        pp=$([])
      }
      //try to find _endList items in result list
      for(var i=0;i<p.length;i++){
        var _path1=p[i].bzTmp;
        var _path2=_path1
        var ps=$(p[i]).filter(_endList).filter(function(i,e){
          if(!pp.is(e)){
            return e;
          }
        });
        pp=pp.add(ps)
      }
      if(pp.length && (!_orgElement || pp.is(_orgElement))){
        return pp;
      }else{
        pp=$([])
      }
      
      //header path
      pp=[];
      if(["group","text","data"].includes(e._type)){
        for(var i=0;i<p.length;i++){
          if(p[i].bzTmp.match(/endEqual|endContains/) && !["BUTTON","INPUT"].includes(p[i].tagName)){
            pp.push(p[i])
          }
        }
        p=pp;
      }
      pp=$([]);
      
      var po=p,ps=[];
      for(var i=0;i<p.length;i++){
        var p1=p[i].bzTmp.split("\n");
        var p3=p[i].bzTmp.replace(/\n.+$/,"");
        p1=p1[p1.length-1].replace(/^[a-z-0-9~+ >]+/i,"")
        if(p1.match(/:endContains|:endEqual/)){
          ps.push({e:p[i],o:p[i].parentNode,_parent:p3,_textMark:":Contains("+e._value+")"});
        }
      }
      
      var _remove=0;
      for(var i=0;i<ps.length;i++){
        p=ps[i];
        if(p.o){
          var ppp=$(p.o).find(_endList);
          if(!ppp.length || (_orgElement && !ppp.is(_orgElement))){
            if(_endList.filter(p.o)[0]==p.o){
              if(pp.has(p.o).length){
                if(!p.o.bzTmp.includes(p._parent)){
                  p.o.bzTmp=p._parent+"\n"+p.o.bzTmp+":has("+p._textMark+")";
                }
                pp=pp.add([p.o]);
              }
            }
          }else{
            if(_orgElement){
              ppp=[_orgElement];
            }else if(ppp.length>1 && ps.length==1){
              ppp=_descAnalysis._findNextInPos(po[0],ppp,_result._bLeft)
            }
            if(!ppp[0].bzTmp.startsWith){
              continue
            }else if(ppp[0].bzTmp.startsWith("BZ.")){
              
            }else if(p.o.bzTmp){
              if(p.o==ppp[0].bzParent){
                var s=_Util._insertInString(ppp[0].bzTmp,"\n",p._textMark);
                if(!s){
                  s=ppp[0].bzTmp+p._textMark;
                }
                ppp[0].bzTmp=p._parent+"\n"+s;
              }else if(p.o.bzTmp.endsWith(p._textMark)){
                ppp[0].bzTmp=p.o.bzTmp+"\n"+ppp[0].bzTmp
              }else if(p.o.bzTmp.match(/:contains|:end/i)){
                ppp[0].bzTmp=p.o.tagName+p._textMark+"\n"+ppp[0].bzTmp
              }else{
                ppp[0].bzTmp=p.o.bzTmp+p._textMark+"\n"+ppp[0].bzTmp
              }
              if(p._parent && !ppp[0].bzTmp.startsWith(p._parent)){
                ppp[0].bzTmp=p._parent+"\n"+ppp[0].bzTmp
              }
            }else{
              var s=ppp[0].bzTmp.split("\n");
              var ss=s[0].match(/\{\{(.+)\}\}/);
              if(ss){
                var sss=eval(ss[1])
                ss=s[0].replace(ss[0],sss);
              }else{
                ss=s[0]
              }
              if($(p.o).find($(p.o.ownerDocument).find(ss)).length){
                ppp[0].bzTmp=p._parent+"\n"+p.o.tagName+p._textMark+"\n"+ppp[0].bzTmp
              }else{
                ppp[0].bzTmp=p._parent+"\n"+s[0]+"\n"+p.o.tagName+p._textMark+ppp[0].bzTmp.replace(s[0],"")
              }
            }

            pp=pp.add(ppp);
          }
          
          if(p.o.bzTmp && p.o.bzTmp==p._parent){
            p.o=null;
            _remove++;
          }else{
            p.o=p.o.parentNode;
            if(p.o==p.o.ownerDocument.body.parentNode){
              p.o=null;
              _remove++;
            }
          }
        }
        
        if(_remove==ps.length){
          return pp;
        }else if(i==ps.length-1){
          if(pp.length){
            return pp;
          }
          i=-1;
        }
      }
    }else{
      if(_orgElement&&_orgElement.type!='file'&&!_Util._isHidden(_orgElement)){
        p=p.filter(":visible")
      }
      return p;
    }
  },
  _findNextInPos:function(po,ps,_bLeft){
    po=po.getBoundingClientRect();
    var _closer=0,_result="";
    for(var i=0;i<ps.length;i++){
      var p=ps[i].getBoundingClientRect();
      if(!_bLeft){
        if(p.top>po.top+20 || (p.top>po.top-10 && p.left>po.left)){
          if(!_closer || _closer.top<p.top-10 || _closer.top>p.top || (_closer.top==p.top && _closer.left>p.left)){
            _closer=p
            _result=ps[i];
          }
        }else if(!_closer || _closer.top<p.top || (_closer.top==p.top && _closer.left>p.left)){
          _closer=p;
          _result=ps[i];
        }
      }else{
        if(p.top>po.top-10 && p.left<po.left){
          if(!_closer || _closer.left<p.left){
            _closer=p
            _result=ps[i];
          }
        }else if(!_closer || _closer.top<p.top || (_closer.top==p.top && Math.abs(_closer.left-po.left)>Math.abs(p.left-po.left))){
          _closer=p;
          _result=ps[i];
        }
      }
    }
    return [_result]
  }
};
;
/*
class $$module{
  constructor({code,name,type,data,tests}){
    this.name = 'module';
  }
  getName(){
    return this.name;
  }
}
*/;
const _scriptUtil={
  _prepareActions:function(_actions){
    if(_actions){
      if(_actions.constructor==Function){
        let _size=$script.newList.length
        _actions=_actions()
        if(_size<$script.newList.length){
          _actions=$script.newList.splice(_size)
        }
      }
      if(_actions.constructor!=Array){
        _actions=[_actions]
      }
    }
    
    return _actions||[]
  },
  _setGroupActions:function(_group,_actions){
    _actions.forEach(a=>{
      a.inGroup="on";
      a._group=a._group||_group;

      $script.newList.push(a)
    })
  },
  _getValueFromOptions:function(_options,_key,_default){
    let v=(_options||{})[_key]
    if(v===undefined){
      v=_default
    }
    return v
  }
}



const $script={
  newList:[],
  getElement:function(elementPath){
    return new $$element(elementPath)
  },
  exe:function(actions,_fun){
    if(actions.constructor!=Array){
      actions=[actions]
    }
    let a=actions.shift(),
        t=_IDE._data._setting.advanced[_IDE._data._setting.curEnvironment].stepDelay
    if(a){
      setTimeout(function(){
        _domActionTask._exeAction(a,{},function(r){
          if(r&&(r._type>3||(r._type==1&&(a.refOfError||"").match(/s|w/))||(r._type==2&&(a.refOfFailed||"").match(/s|w/)))){
            $script.exe(actions,_fun)
          }else{
            _fun(r)
          }
        })
      },a.min||t)
    }else if(_fun){
      setTimeout(()=>{
        _fun({_type:4})
      },t)
    }
  },
  playInIFrameIdx:function(idx,actions){
    $script.iframeIdx=idx;
    $script.play(actions)
    delete $script.iframeIdx
  },
  playInPanel:function(element,actions){
    $script.panel=_scriptActionHandler._buildElementPath(element)
    $script.play(actions)
    $script.panel=0
  },
  return:function(){
    return $script.ideScript(function(_callBack){
      _ideTask._data._taskQueue=_ideTask._data._taskQueue.filter(x=>x._funKey!==_ideTask._curExeAction._funKey)
      _callBack&&_callBack()
    })
  },
  break:function(){
    return $script.ideScript(function(){
      let v=_ideTask._curExeAction._groupLevel.find(x=>x.match(/(for|loop|while)/)),
          q=_ideTask._data._taskQueue;
      while(v&&q[0]&&(q[0]._groupLevel||[]).includes(v)){
        q.shift()
      }
      return 1
    })
  },
  hasData:function(element,data){
    return new $$validData(element,data)
  },
  hasText:function(element,text){
    return new $$validInnerText(element,text)
  },
  hasValue:function(element,value){
    return new $$validInputValue(element,value)
  },
  //0: validate
  isExist:function(element){
    return new $$validExist(element)
  },
  isUnexist:function(element){
    return new $$validUnexist(element)
  },
  isEnable:function(element){
    return new $$validEnable(element)
  },
  isDisable:function(element){
    return new $$validDisable(element)
  },
  isChecked:function(element){
    return new $$validChecked(element)
  },
  isUnchecked:function(element){
    return new $$validUnchecked(element)
  },
  validateByScriptInApp:function(script,element){
    return new $$validScriptInApp(script,element)
  },
  validateByScriptInIDE:function(script){
    return new $$validScriptInIDE(script)
  },
  api:function(request){
    return new $$API(request)
  },
  //1: mouse event
  click:function(element){
    return new $$click(element)
  },
  rightclick:function(element){
    return new $$rightclick(element)
  },
  dblclick:function(element){
    return new $$dblclick(element)
  },
  dragdrop:function(element,toElement){
    return new $$dragdrop(element,toElement)
  },
  drag:function(element,moveToX,moveToY){
    return new $$drag(element,moveToX,moveToY)
  },
  mousedown:function(element){
    return new $$mousedown(element)
  },
  mouseup:function(element,x,y){
    return new $$mouseup(element,x,y)
  },
  hover:function(element){
    return new $$hover(element)
  },
  //1: keyboard
  set:function(element,value){
    return new $$set(element,value)
  },
  typing:function(element,value){
    return new $$typing(element,value)
  },
  check:function(element){
    return new $$set(element,"on")
  },
  uncheck:function(element){
    return new $$set(element,false)
  },
  //1: Fill form
  fillform:function(data){
    _scriptActionHandler._buildFormActions(data)
  },
  //2:
  get:function(element,storeData){
    return new $$get(element,storeData)
  },
  exeScriptInIDE:function(script){
    return new $$scriptAction(script).enableRunInIDE()
  },
  exeScriptInAPP:function(script,element){
    return new $$scriptAction(script,element)
  },
  //4:
  callTest:function(test,parameter){
    return new $$plugInTestAction(test,parameter)
  },
  //5:
  comment:function(element,comment){
    return new $$commentAction(element,comment)
  },
  //6:
  visitPage:function(url,hostId,options){
    return new $$loadPageAction(url,hostId,options)
  },
  //7:
  group:function(actions){
    return new $$group(actions)
  },
  given:function(actions){
    return new $$given(actions)
  },
  when:function(actions){
    return new $$when(actions)
  },
  then:function(actions){
    return new $$then(actions)
  },
  if:function(condition,actions){
    return new $$if(condition,actions)
  },
  loop:function(actions){
    return new $$loop(actions)
  },
  while:function(actions){
    new $$loop(actions)
  },
  for:function(express,actions){
    return new $$for(express,actions)
  },
  or:function(actions){
    return new $$or(actions)
  },
  and:function(actions){
    return new $$and(actions)
  },
  getTaskQueue:function(){
    return _ideTask._data._taskQueue
  }
};
const _scriptActionHandler={
  _action:{
    ".":"continue",
    "..":"stop",
    "...":"stop-group",
    "....":"stop-all",
    s:"success",
    w:"warning",
    f:"failed",
    e:"error"
  },
  _validationMap:{
    data:"hasData",
    innerText:"hasText",
    exist:"iseExist",
    unexist:"isUnexist",
    value:"hasValue",
    enable:"isEnable",
    disable:"isDisable",
    checked:"isChecked"
  },
  _doTestActionsToText:function(t){
    let as=[];
    if(t.type=="scenario"){
      s=_bzScenario._actionsToDesc(_IDE._data._curTest)
    }else{
      t.actions.forEach(a=>{
        as.push(_scriptActionHandler._actionToText(a))
      })
      s= as.join("\n")
    }
    return BZ._data._uiSwitch._tmpInTextActions=s
  },
  _doTestActionsToJS:function(t){
    let ss=t.actions.map(a=>{
      let aa=$$action.jsonToObject(a)
      let r=aa.mapToScript()
      return r.replace(/\n/g,"\n  ")
    }).join(",\n  ")
    ss=`[\n  ${ss}\n]`
    BZ._data._uiSwitch._tmpInJSActions= ss
  },
  _scriptToAction:function(s,_fun){
    try{
      s=eval(s)
      _fun(s)
    }catch(ex){
      alert(ex.message)
    }
  },
  _actionToText:function(a){
    let _element=_getElementDesc(),
        _action
        
    return (_getMessage()+" "+(_getOption()||"")).trim()
    function _getMessage(){
      _msg=_bzMessage._script._templates[a.type]
      switch(a.type){
        case 0:
          if(a.method==1){
            return _Util._formatMessage(_msg.script,a.script)
          }else{
            return _Util._formatMessage(_msg[a.content.type],a.script||_element,a.expectation)
          }
        case 1:
          if(a.apiReplaceEvent){
            return "/"+"/API"
          }else{
            let c=_ideActionManagement._getComDataFromElement(a)
            if(c){
              return c.$fun+" "+c.$label+" = "+c.$value
            }
            return _Util._formatMessage(_msg[a.event.action]||_msg[a.event.type]||`${a.event.action}: {0}`,[_element,a.event.value||_getElementDesc(a.event.element)])
          }
        case 2:
        case 8:
        case 9:
          return _Util._formatMessage(_msg,_element)
        case 3:
          return _Util._formatMessage(_msg,_Util._getStringBySize((a.script||"").split("\n").map(x=>x.trim()).join(" ")))
        case 4:
          return _Util._formatMessage(_msg,_ideTestManagement._getStdDescription(a.refOfSuccess))
        case 5:
          return _Util._formatMessage(_msg,a.description)
        case 6:
        case 7:
          return _Util._formatMessage(_msg,a.description)
      }
    }
    
    function _getOption(){
      let _msg=_bzMessage._script._options
      let w=""
      if(a.flag){
        w+=", "+_msg._flag+": "+a.flag
      }
      if(a.min){
        w+=", "+_msg._delay+": "+a.min
      }
      if(a.max){
        w+=", "+_msg._timeout+": "+a.max
      }
      if(a.successGoto){
        w+=", "+_msg._successGotoFlag+": "+a.successGoto
      }
      if(a.failedGoto){
        w+=", "+_msg._failedGotoFlag+": "+a.failedGoto
      }
      if(a.errorGoto){
        w+=", "+_msg._errorGotoFlag+": "+a.errorGoto
      }
      let t=_ideTestManagement._getStdDescription(a.refOfSuccess)
      if(t){
        w+=", "+_msg._successGotoTest.split("|")[0]+": "+t
      }
      t=_ideTestManagement._getStdDescription(a.refOfFailed)
      if(t){
        w+=", "+_msg._failedGotoTest.split("|")[0]+": "+t
      }
      t=_ideTestManagement._getStdDescription(a.refOfError)
      if(t){
        w+=", "+_msg._errorGotoTest.split("|")[0]+": "+t
      }
      if(w){
        return "("+w.substring(2)+")"
      }
    }

    function _getElementDesc(){
      let e=_Util._clone(a.element)
      if(!_Util._isEmpty(e)){
        let w=_descAnalysis._retrieveTextForElementPathItem(e)
        if(!w){
          e.reverse()
          w=e.find(x=>{
            if(!$.isNumeric(x)){
              return 1
            }
          })
        }
        return w
      }
    }
  },
  _buildFormActions:function(d,o){
    o=o||{}
    if(!o.labelMap){
      o.labelMap={}
    }
    if(!o.com){
      o.com={}
    }
    o.labelMap=o.labelMap||{}
    o.ignoreFields=o.ignoreFields||[]
    if(d.constructor==Object){
      let ks=o.order||Object.keys(d),
          pk=_getDataPath()
      d=ks.map(k=>{
        if(o.skipOnEmpty&&!d[k]&&d[k]!==0){
          return
        }else if(o.ignoreFields.includes(k)){
          return
        }
        let v= {
          label:o.labelMap[k]||_Util._idToName(k),
          value:pk?`{{${pk}.${k}}}`:d[k]
        }
        if(o.com[k]){
          v.label=":"+o.com[k]+"("+v.label+")"
        }
        return v
      }).filter(x=>x)
    }
    if(o.panel){
      $script.panel=_scriptActionHandler._buildElementPath(o.panel)
    }
    d.forEach(x=>{
      if(o.clickList){
        o.clickList.find(y=>{
          if(y.preField==x.label){
            $script.click(y.button||y.link||y.text)
          }
        })
      }
      $script.set(x.label,x.value)
    })
    if(o.panel){
      $script.panel=0
    }
    
    function _getDataPath(){
      let _key
      if(d==$parameter){
        _key="$parameter"
      }else if(d==$loop){
        _key="$loop"
      }else if(Object.keys($test||{}).find(k=>{
        if(d==$test[k]){
          _key="$test."+k
          return 1
        }
      })){
      }else if(Object.keys($module||{}).find(k=>{
        if(d==$module[k]){
          _key="$module."+k
          return 1
        }
      })){
      }else if(Object.keys($project||{}).find(k=>{
        if(d==$project[k]){
          _key="$project."+k
          return 1
        }
      })){
      }
      return _key
    }
  },
  _buildElementPath:function(x,_type){
    _type=_type||"text"
    if(x){
      let p=_getPanel()
      if(x.constructor==String){
        x=x.split(">")
        while(x.length>1){
          p.push(`:panel(${x.shift().trim()})`)
        }
        x=x[0].trim()
        let xx=_JSHandler._parseCode(x)
        if(xx.constructor==String){
          xx=[{txt:xx}]
        }
        if(x.match(/^\$(parameter|test|loop|project|module|group|action)(\.|\[|$])/)){
          x=`{{${x}}}`
          x=":"+_type+"("+x+")"
        }else if(!xx.find(y=>{
          if(y.txt){
            return y.txt.match(/([\.\#].+|[\[][^\]]+[\]]|\:[^\(]+\([^\)]+\))/)
          }
        })){
          x=":"+_type+"("+x+")"
        }
        x=[...p,x,0]
      }else if(x.constructor==Array){
        if(!x[0].includes("BZ.TW")){
          x=[...p,...x]
        }
      }
      return x
    }else if(x!==undefined){
      return [..._getRoot(),"BODY",0]
    }

    function _getPanel(){
      let p=$script.panel,
          r=_getRoot()
      if(p){
        if(p.constructor==String){
          p=[r,p]
        }else if(!p[0].includes("BZ.TW")){
          p=[r,...p]
        }
        return p.filter(x=>!$.isNumeric(x))
      }else{
        return [r]
      }
    }

    function _getRoot(){
      if($.isNumeric($script.iframeIdx)){
        return "$(BZ.TW.document).findIframe("+$script.iframeIdx+")"
      }else{
        return "BZ.TW.document"
      }
    }
  },
  _joinScript:function(_list,_inGroup){
    // if(!_inGroup){
    //   _list=_list.map(x=>{
    //     return x.replace(/\n/g,"\n  ")
    //   })
    // }
    return _list.join("\n.")
  },
  _toSimplyElement:function(e){
    if(e&&e.constructor==Array){
      e=[...e]
      if(e[0]=="BZ.TW.document"){
        e.shift()
      }
      if(!$util.parseBoolean(e._last())){
        e.pop()
      }
      if(e.length){
        if(e.length==1){
          return e[0]
        }
        return e
      }else{
        return "BODY"
      }
    }
    return e
  },
  _toSimplyElementInString:function(e){
    return JSON.stringify(_scriptActionHandler._toSimplyElement(e))
  },
  _toFullElement:function(e){
    if(e&&e.constructor==Array){
      e=[...e]
      if(e[0]!="BZ.TW.document"){
        e.unshift("BZ.TW.document")
      }
      if(!$.isNumeric(e._last())){
        e.push(0)
      }
      return e
    }else if(e&&e.constructor==String){
      return ["BZ.TW.document",e,0]
    }
  },
  _formatScript:function(s,_expectReturn){
    if(_Util._isFunction(s)){
      return `${_Util._jsonToStr(s)}`
    }else if(s&&s.constructor!=String){
      s=JSON.stringify(s,0,2)
    }
    if(_expectReturn){
      return `\`${s}\``
    }else{
      return `()=>{\n  ${s.replace(/\n/g,"\n  ")}\n}`
    }
  }
};
class $$Test {
  constructor({code,name,data,loopData,defParameter,type,actions}) {
    this.code = code;
    this.name = name;
    this.dataMap = data;
    this.loopData = {loopValue:loopData};
    this.defParameter = defParameter;
    this.type = type;
    this.actions = actions||[];
  }

  exe($parameter){
    _ideTask._addScriptGenerateAction(this)
  }
};
class $$action{
  constructor(action){
    for(let k in action){
      this[k]=action[k]
    }
  }

  mapToScript(list){
    let d=this
    if(d.min){
      list.push(`wait(${d.min})`)
    }
    if(d.max){
      list.push(`timeout(${d.max})`)
    }

    if(d.autoDelay){
      list.push(`enableAutoDelay()`)
    }

    if(d.refOfSuccess=="../f"&&(d.refOfFailed=="./s"||d.refOfFailed=="./w")){
      list.push(`shouldFail("${d.refOfFailed.split("/").pop()}")`)
    }

    if(d.refOfSuccess=="../f"&&(d.refOfError=="./s"||d.refOfError=="./w")){
      list.push(`shouldError("${d.refOfFailed.split("/").pop()}")`)
    }

    if(d.preScript){
      list.push(`setPreScript(${_scriptActionHandler._formatScript(d.preScript)})`)
    }

    if(d.resultscript){
      list.push(`setEndScript(${_scriptActionHandler._formatScript(d.resultscript)})`)
    }

    if(d.loopData){
      list.push(`setRepeatScript(${_scriptActionHandler._formatScript(d.loopData,1)})`)
    }

    let r=(d.refOfFailed||"").match(/^[.]{3}\/([swfe])$/)
    if(r){
      list.push("breakOnFail('"+r[1]+"')")
    }

    r=(d.refOfError||"").match(/^[.]{3}\/([swfe])$/)
    if(r){
      list.push("breakOnError('"+r[1]+"')")
    }

    r=(d.refOfSuccess||"").match(/^[.]{3}\/([swfr])$/)
    if(r){
      list.push("break('"+r[1]+"')")
    }

    r=(d.refOfSuccess||"").match(/^\.\.\/([sw])$/)
    if(r){
      list.push("stopOnSuccess('"+r[1]+"')")
    }

    if(d.flag){
      list.push(`setFlag("${d.flag}")`)
    }
    if(d.monitorUrl){
      list.push(`setMonitorUrl(${_scriptActionHandler._formatScript(d.monitorUrl)})`)
    }

  }

  static jsonToObject(d){
    switch(parseInt(d.type)){
      case 0:
        return $$validAction.jsonToObject(d)
      case 1:
        if(d.apiReplaceEvent){
          return $$API.jsonToObject(d)
        }
        return $$eventAction.jsonToObject(d)
      case 2:
        return $$get.jsonToObject(d)
      case 3:
        return $$scriptAction.jsonToObject(d)
      case 4:
        return $$plugInTestAction.jsonToObject(d)
      case 5:
        return $$commentAction.jsonToObject(d)
      case 6:
        return $$loadPageAction.jsonToObject(d)
      case 7:
        return $$group.jsonToObject(d)
    }
    if(d.element){
      return new $$elementAction(d.element,d)
    }else if(d.type==4){
      return $$plugInTestAction.jsonToObject(d)
    }
  }

  setMonitorUrl(url){
    this.monitorUrl=url
    return this
  }

  /***********************************************/
  //
  // flow control
  //
  /***********************************************/
  shouldFail(r){
    r=r||"s"
    this.refOfFailed="./"+r
    this.refOfSuccess="../f"
    return this
  }

  shouldError(r){
    r=r||"s"
    this.refOfError="./"+r
    this.refOfSuccess="../f"
    return this
  }

  acceptFail(r){
    r=r||"s"
    this.refOfFailed="./"+r

    return this
  }

  acceptError(r){
    r=r||"s"
    this.refOfError="./"+r

    return this
  }

  break(r){
    r=r||"s"
    this.refOfSuccess=".../"+r
    return this
  }

  breakOnFail(r){
    this.refOfFailed=".../"+(r||"w")
    return this
  }

  breakOnError(r){
    this.refOfError=".../"+(r||"w")
    return this
  }

  stopOnSuccess(r){
    r=r||"s"
    this.refOfSuccess="../"+r
    return this
  }

  // onsuccess(actions){
  //   this.successList=actions

  //   return this
  // }

  // onfail(actions){
  //   this.failedList=actions

  //   return this
  // }

  /***********************************************/
  //
  // Attributes
  //
  /***********************************************/
  timeout(time){
    this.max=time

    return this
  }

  wait(time){
    this.min=time

    return this
  }

  enableAutoDelay(){
    this.autoDelay="on"
    return this
  }

  setPreScript(script){
    this.preScript=script

    return this
  }

  setEndScript(script){
    this.resultscript=script
    return this
  }

  setRepeatScript(script){
    this.loopData=script
    return this
  }

  setDisable(r){
    this.disable=r
    return this
  }

  setFlag(f){
    this.flag=f
    return this
  }
};
class $$element{
  constructor(element){
    this.element = element
  }

  get(storeData){
    return new $$get(this.element,storeData)
  }

  click(){
    return new $$click(this.element)
  }

  rightclick(){
    return new $$rightclick(this.element)
  }

  dblclick(){
    return new $$dblclick(this.element)
  }

  dragdrop(toElement){
    return new $$dragdrop(this.element,toElement)
  }

  drag(from,to){
    return new $$drag(this.element,from,to)
  }

  hover(){
    return new $$hover(this.element)
  }

  mousedown(x,y){
    return new $$mousedown(this.element,x,y)
  }

  mouseup(x,y){
    return new $$mouseup(this.element,x,y)
  }

  isExist(){
    return new $$validExist(this.element)
  }

  validByScript(script){
    return new $$validScript(script,this.element)
  }

  hasData(data){
    return new $$validData(this.element,data)
  }

  hasText(text){
    return new $$validInnerText(this.element,text)
  }

  hasValue(value){
    return new $$validInputValue(this.element,value)
  }

  isUnexist(){
    return new $$validUnexist(this.element)
  }

  isEnable(){
    return new $$validEnable(this.element)
  }

  isDisable(){
    return new $$validDisable(this.element)
  }

  isChecked(){
    return new $$validChecked(this.element)
  }

  isUnChecked(){
    return new $$validChecked(this.element,{expectation:"false"})
  } 
};
class $$elementAction extends $$action{
  constructor(element,options){
    super({
      ...options,
      element:_scriptActionHandler._toFullElement(element)
    })
    this.assignSkipActionElement(this.skipActionElement)
    this.assignFailElement(this.failElement)
  }

  assignSkipActionElement(e){
    this.skipActionElement = _scriptActionHandler._toFullElement(e);
    return this
  }

  assignFailElement(e){
    this.failElement = _scriptActionHandler._toFullElement(e);
    return this
  }

  workOnHidden(){
    this.force = "on";
    return this
  }

  hiddenIsUnexist(){
    this.errOnHidden = "on";
    return this
  }

  noRetry(){
    this.failedReaction="on"
    return this
  }

  supportMutipleElement(){
    this.multipleElement = "on";
    return this
  }

  mapToScript(list){
    super.mapToScript(list)
    let d=this
    if(d.skipActionElement){
      list.push(`assignSkipActionElement(${_scriptActionHandler._toSimplyElementInString(d.skipActionElement)})`)
    }

    if(d.failElement){
      list.push(`assignFailElement(${_scriptActionHandler._toSimplyElementInString(d.failElement)})`)
    }

    if(d.force){
      list.push(`workOnHidden()`)
    }

    if(d.errOnHidden){
      list.push(`hiddenIsUnexist()`)
    }

    if(d.failedReaction){
      list.push(`noRetry()`)
    }

    if(d.multipleElement){
      list.push(`supportMutipleElement()`)
    }

  }

};
class $$API extends $$action{
  constructor(request){
    _Util._cleanJson(request)

    super({
      type:1,
      apiReplaceEvent:1,
      requests:[request]
    })
  }

  downloadFile(){
    this.downloadAsFile = 1;
    return this
  }

  mapToScript(){
    let d=this,
        r=d.requests[0]

    if(r){
      ["headers","query","body","joins"].forEach(k=>{
        if(r[k]&&typeof r[k]=="string"){
          try{
            r[k]=JSON.parse(r[k])
          }catch(e){}
        }
      })
    }
    let list=[`$script.api(${_Util._formatJSONToString(r)})`]
    super.mapToScript(list)
    if(d.downloadAsFile){
      list.push(`downloadFile()`)
    }
    return _scriptActionHandler._joinScript(list);
  }

  static jsonToObject(d){
    return new $$API(d.requests[0])
  }

}

class $$loadTestAction extends $$action{
  constructor(requests,rampUp){
    super({
      type:"a",
      apiReplaceEvent:1,
      requests:requests,
      rampUp:rampUp
    })
  }
}

class $$request{
  constructor(host,url,method,headers,query,data){
    this.host=host
    this.url=url
    this.method=method
    this.headers=headers
    this.query=query
    this.body=data
  }
};
class $$plugInTestAction extends $$action{
  constructor(test,parameter,options){
    super({
      ...options,
      type:4,
      refOfSuccess:test,
      successParameter:parameter
    })
  }

  static jsonToObject(d){
    return new $$plugInTestAction(d.refOfSuccess,d.successParameter,d)
  }

  mapToScript(list){
    let d=this
    let p=d.successParameter
    if(p&&p.constructor!=String){
      p=JSON.stringify(p)
    }else if(p){
      p="`"+p+"`"
    }
    if(p){
      return `$script.callTest("${d.refOfSuccess}",${p})`
    }else{
      return `$script.callTest("${d.refOfSuccess}")`
    }
  }
};
class $$commentAction extends $$elementAction{
  constructor(element,comment,options){
    super(element,{
      ...options,
      type:5,
      description:comment
    })
  }

  enableJudge(){
    this.showJudge=true
    return this
  }

  mapToScript(){
    let d=this,list=[`$script.comment(${_scriptActionHandler._toSimplyElementInString(d.element)}, ${JSON.stringify(d.description||"")})`]
    super.mapToScript(list)
    if(d.showJudge){
      list.push(`enableJudge()`)
    }
    return _scriptActionHandler._joinScript(list);
  }

  static jsonToObject(d){
    return new $$commentAction(d.element,d.description,d)
  }

};
class $$eventAction extends $$elementAction{
  constructor(element,event,options){
    super(element,{
      ...options,
      type:1,
      event:options?{...options.event,...event}:event
    })
  }

  triggerAlert(){
    this.triggerPopup="on";
    this.event.popType = "alert";
    return this
  }

  validateAlertInNextAction(){
    this.event.popFollow = "on";
    return this
  }

  triggerConfirm(returnValue){
    this.triggerPopup="on";
    this.event.popType = "confirm";
    this.event.returnValue=returnValue
    return this
  }

  triggerPrompt(returnValue){
    this.triggerPopup="on";
    this.event.popType = "prompt";
    this.event.returnValue=returnValue
    return this
  }

  triggerBeforeUnload(){
    this.triggerPopup="on";
    this.event.popType = "onbeforeunload";
    return this
  }

  withCtrl(){
    this.event.ctrl = "on";
    return this
  }

  withShift(){
    this.event.shift = "on";
    return this
  }

  withAlt(){
    this.event.alt = "on";
    return this
  }

  comboAction(element,type){
    this.event.repElementMethod = type||"on";
    this.event.responseElement = _scriptActionHandler._toFullElement(element);
    return this
  }

  mapToScript(list){
    let d=this;
    super.mapToScript(list)
    if(d.event.ctrl){
      list.push(`withCtrl()`)
    }

    if(d.event.shift){
      list.push(`withShift()`)
    }

    if(d.event.alt){
      list.push(`withAlt()`)
    }

    if(d.event.popType=="alert"){
      list.push(`triggerAlert()`)
    }

    if(d.event.popType=="confirm"){
      list.push(`triggerConfirm("${d.event.returnValue.replace(/"/g,'\\"')}")`)
    }

    if(d.event.popType=="prompt"){
      list.push(`triggerPrompt("${d.event.returnValue.replace(/"/g,'\\"')}")`)
    }

    if(d.event.popFollow){
      list.push(`validateAlertInNextAction()`)
    }

    if(d.event.repElementMethod){
      list.push(`comboAction(${_scriptActionHandler._toSimplyElementInString(d.event.responseElement)}, "${d.event.repElementMethod}")`)
    }

  }

  static jsonToObject(d){
    if(d.event.type=="mouse"){
      return $$mouse.jsonToObject(d)
    }else if(d.event.type=="change"){
      return new $$set(d.element,d.event.value,d)
    }else if(d.event.type=="key"){
      return new $$typing(d.element,d.event.value,d)
    }
  }

}

class $$mouse extends $$eventAction{
  constructor(element,event,options){
    super(element,{
      type:"mouse",
      ...event
    },
    options)
  }

  retryableOnNextActionFailed(){
    this.retryable = 1;
    return this
  }

  setOffset(x){
    this.offset = x;
    return this
  }

  asDownloadAction(){
    this.event.download = 1;
    return this
  }
  
  mapToScript(list){
    let d=this
    super.mapToScript(list)

    if(d.offset){
      list.push(`setOffset(${_Util._formatJSONToString(d.offset)})`)
    }

    if(d.retryable){
      list.push(`retryableOnNextActionFailed()`)
    }

    if(d.event.download){
      list.push(`asDownloadAction()`)
    }



  }

  static jsonToObject(d){
    if(d.event.action=="click"){
      return new $$click(d.element,d)
    }else if(d.event.action=="rightclick"){
      return new $$rightclick(d.element,d)
    }else if(d.event.action=="dblclick"){
      return new $$dblclick(d.element,d)
    }else if(d.event.action=="dragdrop"){
      return new $$dragdrop(d.element,d.event.element,d)
    }else if(d.event.action=="drag"){
      return new $$drag(d.element,d.event.moveToX,d.event.moveToY,d)
    }else if(d.event.action=="hover"){
      return new $$hover(d.element,d)
    }else if(d.event.action=="mousedown"){
      return new $$mousedown(d.element,d.event.x,d.event.y,d)
    }else if(d.event.action=="mouseup"){
      return new $$mouseup(d.element,d.event.x,d.event.y,d)
    }
  }
}

class $$click extends $$mouse{
  constructor(element,options){
    super(element,{
      action:"click"
    },
    options)
  }

  mapToScript(){
    let d=this,list=[`$script.click(${_scriptActionHandler._toSimplyElementInString(d.element)})`]
    super.mapToScript(list)
    return _scriptActionHandler._joinScript(list);
  }
}


class $$rightclick extends $$mouse{
  constructor(element,options){
    super(element,{
      action:"rightclick"
    },
    options)
  }

  mapToScript(){
    let d=this,list=[`$script.rightclick(${_scriptActionHandler._toSimplyElementInString(d.element)})`]
    super.mapToScript(list)
    return _scriptActionHandler._joinScript(list);
  }
}

class $$dblclick extends $$mouse{
  constructor(element,options){
    super(element,{
      action:"dblclick"
    },
    options)
  }

  mapToScript(){
    let d=this,list=[`$script.dblclick(${_scriptActionHandler._toSimplyElementInString(d.element)})`]
    super.mapToScript(list)
    return _scriptActionHandler._joinScript(list);
  }
}

class $$dragdrop extends $$mouse{
  constructor(element,toElement,options){
    super(element,{
      action:"dragdrop",
      element:_scriptActionHandler._toFullElement(toElement)
    },{
      ...options
    })
  }

  mapToScript(){
    let d=this,list=[`$script.dragdrop(${_scriptActionHandler._toSimplyElementInString(d.element)},${_scriptActionHandler._toSimplyElementInString(d.event.element)})`]
    super.mapToScript(list)
    return _scriptActionHandler._joinScript(list);
  }
}

class $$drag extends $$mouse{
  constructor(element,moveToX,moveToY,options){
    super(element,{
      action:"drag",
      moveToX:moveToX,
      moveToY:moveToY
    },options)
  }

  mapToScript(){
    let d=this,list=[`$script.drag(${_scriptActionHandler._toSimplyElementInString(d.element)}, ${d.event.moveToX}, ${d.event.moveToY})`]
    super.mapToScript(list)
    return _scriptActionHandler._joinScript(list);
  }
}

class $$hover extends $$mouse{
  constructor(element,options){
    super(element,{
      action:"hover"
    },
    options)
  }

  mapToScript(){
    let d=this,list=[`$script.hover(${_scriptActionHandler._toSimplyElementInString(d.element)})`]
    super.mapToScript(list)
    return _scriptActionHandler._joinScript(list);
  }
}

class $$mousedown extends $$mouse{
  constructor(element,x,y,options){
    super(element,{
      action:"mousedown",
      x:x,
      y:y
    },
    options)
  }

  mapToScript(){
    let d=this,list=[`$script.mousedown(${_scriptActionHandler._toSimplyElementInString(d.element)},${d.event.x},${d.event.y})`]
    super.mapToScript(list)
    return _scriptActionHandler._joinScript(list);
  }
}

class $$mouseup extends $$mouse{
  constructor(element,x,y,options){
    super(element,{
      action:"mouseup",
      x:x,
      y:y
    },
    options)
  }

  mapToScript(){
    let d=this,list=[`$script.mouseup(${_scriptActionHandler._toSimplyElementInString(d.element)},${d.event.x},${d.event.y})`]
    super.mapToScript(list)
    return _scriptActionHandler._joinScript(list);
  }
}

class $$set extends $$eventAction{
  constructor(element,value,options){
    super(element,{
      autoBlur:"on",
      type:"change",
      value:value,
    },
    options)
  }

  enableSupportReadOnly(){
    this.event.supportReadOnly="on"
    return this
  }

  nonJoinAutoOneActionGroup(){
    this.noLightAction="on"
    return this
  }

  assignDisableAISet(){
    this.disableAISet = "on"
    return this
  }

  assignWithSubmit(){
    this.withSubmit = "on"
    return this
  }

  assignWithEnter(){
    this.withEntry = "on"
    return this
  }

  mapToScript(){
    let d=this,list=[`$script.set(${_scriptActionHandler._toSimplyElementInString(d.element)},${JSON.stringify(d.event.value)})`]
    super.mapToScript(list)
    if(d.disableAISet){
      list.push(`assignDisableAISet()`)
    }

    if(d.withSubmit){
      list.push(`assignWithSubmit()`)
    }

    if(d.withEntry){
      list.push(`assignWithEnter()`)
    }

    if(d.noLightAction){
      list.push("nonJoinAutoOneActionGroup()")
    }

    if(d.event.supportReadOnly){
      list.push("enableSupportReadOnly()")
    }

    return _scriptActionHandler._joinScript(list);
  }
}

class $$typing extends $$eventAction{
  constructor(element,value,options){
    super(element,{
      autoBlur:"on",
      type:"key",
      groupKeys:value,
      action:"group",
    },
    options)
  }

  nonJoinAutoOneActionGroup(){
    this.noLightAction=1
    return this
  }

  mapToScript(){
    let d=this,
        list=[`$script.typing(${_scriptActionHandler._toSimplyElementInString(d.element)},${JSON.stringify(d.event.groupKeys)})`];


    if(d.noLightAction){
      list.push("nonJoinAutoOneActionGroup()")
    }
    
    super.mapToScript(list)
    return _scriptActionHandler._joinScript(list);
  }
};
class $$get extends $$elementAction{
  constructor(element,variableName,options){
    super(element,{
      ...options,
      type:2,
      method:0,
      script:(variableName||"$parameter.extractValue")+" = $util.getElementText($element);"
    })
  }

  static jsonToObject(d){
    return new $$get(d.element,"",d)
  }

  mapToScript(){
    let d=this,list=[`$script.get(${_scriptActionHandler._toSimplyElementInString(d.element)})`]
    super.mapToScript(list)
    return _scriptActionHandler._joinScript(list);
  }
};
class $$group extends $$action{
  constructor(actions,type,options){
    super({
      ...options,
      type:7,
      actions:actions.map(a=>{
        if(a instanceof $$action){
          return a
        }
        return $$action.jsonToObject(a)
      }),
      groupType:type
    })
  }

  mapToScript(){
    let d=this,
        s= `$script.${d.groupType||"group"}([\n  ${(d.actions||[]).map(a=>a.mapToScript().replace(/\n/g,"\n  ")).join(",\n  ")}\n])`,
        list=[]

    if(d.asOneAction){
      list.push(`enableAsOneAction()`)
    }
    super.mapToScript(list)
    list=list.map(x=>x.replace(/\n/g,"\n  "))
    list.unshift(s)
    return _scriptActionHandler._joinScript(list,1)
  }

  enableAsOneAction(){
    this.asOneAction="on"
    return this
  }

  static jsonToObject(d){
    let as=d.actions.map(a=>{
      let b=$$action.jsonToObject(a)
      if(!b){
        debugger
      }
      return b
    }),
        c=d.conditionAction?$$action.jsonToObject(d.conditionAction):null
    switch(d.groupType){
      case "given":
        return new $$given(as,d)
      case "when":
        return new $$when(as,d)
      case "then":
        return new $$then(as,d)
      case "if":
        return new $$if(c,as,d)
      case "else":
        return new $$else(as,d)
      case "else if":
        return new $$if(c,as,"else if",d)
      case "for":
        return new $$for(d.loopData,as,d)
      case "loop":
        return new $$loop(as,d)
      case "and":
        return new $$and(as,d)
      case "or":
        return new $$or(as,d)
      case "try":
        return new $$try(as,d)
      case "catch":
        return new $$catch(as,d)
      case "finally":
        return new $$finally(as,d)
      default:
        return new $$group(as,"",d)
    }
  }
}

class $$scenarioGroup extends $$group{
  constructor(actions,type){
    super(actions,type);
    (actions||[]).forEach(a=>{
      a.stepKey=a.groupKey=type
    })
  }
}

class $$given extends $$scenarioGroup{
  constructor(actions){
    super(actions,"given")
  }
}

class $$when extends $$scenarioGroup{
  constructor(actions){
    super(actions,"when")
  }
}

class $$then extends $$scenarioGroup{
  constructor(actions){
    super(actions,"then")
  }
}

class $$if extends $$group{
  constructor(conditionAction,actions,type){
    super(actions,type||"if")
    this.conditionAction=conditionAction

    _ideActionData._assignIfCondition(conditionAction)
  }

  else(actions){
    this.elseActions=new $$else(actions)
    return this
  }

  elseIf(condition,actions){
    let g=new $$if(condition,actions,"else if")
    g.elseGroup=1
    this.elseIfs=this.elseIfs||[]
    this.elseIfs.push(g)
    return this
  }

  mapToScript(){
    let d=this,
        condition=d.conditionAction.mapToScript(),
        actions=d.actions.map(a=>a.mapToScript().replace(/\n/g,"\n  ")),
        list=[`$script.if(${condition},[\n  ${actions.join(",\n  ")}\n])`];


    if(d.elseIfs){
      d.elseIfs.forEach(x=>{
        let c=x.conditionAction.mapToScript(),
            as=x.actions.map(a=>a.mapToScript())

        list.push(`elseIf(${c},[\n  ${as.map(a=>a.mapToScript()).join("\n  ")}\n])`)
      })
    }

    if(d.elseActions){
      list.push(`else([\n  ${d.elseActions.map(x=>x.mapToScript()).join("\n  ")}\n])`)
    }

    return _scriptActionHandler._joinScript(list,1)

  }
}

class $$else extends $$group{
  constructor(actions){
    super(actions,"else")
    this.elseGroup=1
  }
}

class $$for extends $$group{
  constructor(express,actions){
    super(actions,"for")
    this.loopData=express
  }

  mapToScript(){
    let d=this,
        actions=d.actions.map(a=>a.mapToScript().replace(/\n/g,"\n  ")),
        list=[`$script.for(${_scriptActionHandler._formatScript(d.loopData,1)},[\n  ${actions.join(",\n  ")}\n])`];


    super.mapToScript(list)
    return _scriptActionHandler._joinScript(list,1)

  }
}

class $$loop extends $$group{
  constructor(actions){
    super(actions,"loop")
    this.loopGroup=1
  }
}

class $$and extends $$group{
  constructor(actions){
    super(actions,"and")
  }

  mapToScript(){
    return super.mapToScript()
  }

}

class $$or extends $$group{
  constructor(actions){
    super(actions,"or")
  }

  mapToScript(){
    return super.mapToScript()
  }
}

class $$try extends $$group{
  constructor(actions){
    super(actions,type||"try")
  }

  catch(expression){
    this.catch= new $$catch(expression)
    return this
  }

  finally(actions){
    this.finally= $$finally(actions)
    return this
  }

}

class $$catch extends $$group{
  constructor(expression,actions){
    super(actions,"catch")
    this.catchExpectation=expression
  }

}

class $$finally extends $$group{
  constructor(actions){
    super(actions,"finally")
  }
};
class $$loadPageAction extends $$action{
  constructor(url,hostId,options){
    hostId=hostId||BZ._getHostIdx(url)||"0"
    let _url=_ideVersionManagement._getHostById(hostId)
    super({
      ...options,
      type:6,
      hostId:hostId,
      loadType:(options?options.loadType:"")||"followSameURL",
      loadURL:url.replace(_url,"")
    })
  }

  setRefreshData(ds){
    this.refreshData=ds
    return this
  }

  enableClearCookie(){
    this.clearCookie="on"
    return this
  }

  enableClearLocalStorage(){
    this.clearLocalStorage="on"
    return this
  }

  mapToScript(){
    let d=this;
    let list= [`$script.visitPage("${d.loadURL}"${d.hostId&&d.hostId!="0"?', '+d.hostId:''})`]

    if(d.loadType!="followSameURL"){
      list.push(`setLoadType("${d.loadType}")`)
    }

    if(d.refreshData){
      list.push("setRefreshData("+JSON.stringify(d.refreshData)+")")
    }
    if(d.clearCookie){
      list.push("enableClearCookie()")
    }
    if(d.clearLocalStorage){
      list.push("enableClearLocalStorage()")
    }
    super.mapToScript(list)
    return _scriptActionHandler._joinScript(list)
  }

  static jsonToObject(d){
    return new $$loadPageAction(d.loadURL,d.hostId,d)
  }

};
class $$scriptAction extends $$action{
  constructor(script,element,options){
    super({
      ...options,
      type:3,
      script:script,
      element:_scriptActionHandler._toFullElement(element)
    })
  }

  enableRunInIDE(){
    if(!this.element){
      this.runInIDE=true
    }
    return this
  }

  toRunInAPP(){
    delete this.runInIDE
    return this
  }

  supportMutipleElement(){
    this.multipleElement = 1;
    return this
  }

  mapToScript(){
    let d=this,list

    if(d.runInIDE){
      list=[`$script.exeScriptInIDE(${_scriptActionHandler._formatScript(d.script||"")})`]
    }else{
      let e=this.element||""
      if(e){
        e=', '+_scriptActionHandler._toSimplyElementInString(e)
      }
  
      list=[`$script.exeScriptInAPP(${_scriptActionHandler._formatScript(d.script||"")}${e})`]
    }

    super.mapToScript(list)

    if(d.multipleElement){
      list.push(`supportMutipleElement()`)
    }
    return _scriptActionHandler._joinScript(list);
  }

  static jsonToObject(d){
    return new $$scriptAction(d.script,d.element,d)
  }
};
class $$validAction extends $$action{
  constructor(options){
    super({
      method:0,
      content:{},
      compareMark:"==",
      ...options,
      type:0
    })
  }

  static jsonToObject(d){
    if(d.runInIDE){
      return $$validScriptInIDE.jsonToObject(d)
    }else{
      return $$validActionInAPP.jsonToObject(d)
    }
  }
}

class $$validActionInAPP extends $$elementAction{
  constructor(element,options){
    super(element,{
      content:{},
      compareMark:"==",
      ...options,
      type:0,
      method:0
    })
  }

  static jsonToObject(d){
    if(d.method==1){
      return new $$validScriptInApp(d.script,d.element,d)
    }else if(d.content){
      switch(d.content.type){
        case "data":
          return new $$validData(d.element,d.expectation,d)
        case "innerText":
          return new $$validInnerText(d.element,d.expectation,d)
        case "value":
          return new $$validInputValue(d.element,d.expectation,d)
        case "unexist":
          return new $$validUnexist(d.element,d)
        case "disable":
          return new $$validDisable(d.element,d)
        case "enable":
          return new $$validEnable(d.element,d)
        case "checked":
          return d.expectation=="on"?new $$validChecked(d.element,d):new $$validUnchecked(d.element,d)
        case "exist":
        default:
          d.content.type="exist"
          return new $$validExist(d.element,d)
      }
    }
  }
}

class $$validScriptInApp extends $$validActionInAPP{
  constructor(script,element,options){
    super(element,{
      ...options,
      script:script,
      method:1
    })
  }

  mapToScript(){
    let d=this,e=d.element,
        list=[`$script.validateByScriptInApp(\`${this.script}\`${e?", "+elementAction.toSimplyElementInString(e):""})`]
    super.mapToScript(list)
    return _scriptActionHandler._joinScript(list);
  }
}

class $$validScriptInIDE extends $$validAction{
  constructor(script,options){
    super({
      ...options,
      method:1,
      script:script,
      runInIDE:1
    })
  }

  mapToScript(){
    let list=[`$script.validateByScriptInIDE(${JSON.stringify(this.script)})`]
    super.mapToScript(list)
    return _scriptActionHandler._joinScript(list);
  }

  static jsonToObject(d){
    return new $$validScriptInIDE(d.script,d)
  }
}

class $$validData extends $$validActionInAPP{
  constructor(element,data,options){
    super(element,{
      ...options,
      content:{type:"data"},
      expectation:data
    })
  }

  mapToScript(){
    let list=[`$script.hasData(${_scriptActionHandler._toSimplyElementInString(this.element)},${JSON.stringify(this.expectation)})`]
    super.mapToScript(list)
    return _scriptActionHandler._joinScript(list);
  }
}

class $$validInnerText extends $$validActionInAPP{
  constructor(element,text,options){
    super(element,{
      ...options,
      content:{type:"innerText"},
      expectation:text
    })
  }

  mapToScript(){
    let list=[`$script.hasText(${_scriptActionHandler._toSimplyElementInString(this.element)},${JSON.stringify(this.expectation)})`]
    super.mapToScript(list)
    return _scriptActionHandler._joinScript(list);
  }
}

class $$validInputValue extends $$validActionInAPP{
  constructor(element,value,options){
    super(element,{
      ...options,
      content:{type:"value"},
      expectation:value
    })
  }

  mapToScript(){
    let list=[`$script.hasValue(${_scriptActionHandler._toSimplyElementInString(this.element)},${JSON.stringify(this.expectation)})`]
    super.mapToScript(list)
    return _scriptActionHandler._joinScript(list);
  }
}

class $$validExist extends $$validActionInAPP{
  constructor(element,options){
    super(element,{
      content:{type:"exist"},
      ...options,
    })
  }

  mapToScript(){
    let list=[`$script.isExist(${_scriptActionHandler._toSimplyElementInString(this.element)})`]
    super.mapToScript(list)
    return _scriptActionHandler._joinScript(list);
  }
}

class $$validUnexist extends $$validActionInAPP{
  constructor(element,options){
    super(element,{
      content:{type:"unexist"},
      ...options,
    })
  }

  mapToScript(){
    let list=[`$script.isUnexist(${_scriptActionHandler._toSimplyElementInString(this.element)})`]
    super.mapToScript(list)
    return _scriptActionHandler._joinScript(list);
  }
}

class $$validEnable extends $$validActionInAPP{
  constructor(element,options){
    super(element,{
      ...options,
      content:{type:"enable"},
      expectation:"true"
    })
  }

  mapToScript(){
    let list=[`$script.isEnable(${_scriptActionHandler._toSimplyElementInString(this.element)})`]
    super.mapToScript(list)
    return _scriptActionHandler._joinScript(list);
  }
}

class $$validDisable extends $$validActionInAPP{
  constructor(element,options){
    super(element,{
      ...options,
      content:{type:"disable"},
      expectation:"true"
    })
  }

  mapToScript(){
    let list=[`$script.isDisable(${_scriptActionHandler._toSimplyElementInString(this.element)})`]
    super.mapToScript(list)
    return _scriptActionHandler._joinScript(list);
  }
}

class $$validChecked extends $$validActionInAPP{
  constructor(element,options){
    super(element,{
      ...options,
      content:{type:"checked"},
      expectation:"on"
    })
  }

  mapToScript(){
    let list=[`$script.isChecked(${_scriptActionHandler._toSimplyElementInString(this.element)})`]
    super.mapToScript(list)
    return _scriptActionHandler._joinScript(list);
  }
}

class $$validUnchecked extends $$validActionInAPP{
  constructor(element,options){
    super(element,{
      ...options,
      content:{type:"checked"},
      expectation:""
    })
  }

  mapToScript(){
    let list=[`$script.isUnchecked(${_scriptActionHandler._toSimplyElementInString(this.element)})`]
    super.mapToScript(list)
    return _scriptActionHandler._joinScript(list);
  }
};