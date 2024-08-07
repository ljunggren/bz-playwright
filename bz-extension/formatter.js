var formatter={
  idx:0,
  cameraList:[],
  chking:30,
  startUrl:"",
  logMap:{},
  insertCss:function(_try){
    if(!document.body){
      _try=_try||0
      if(_try>10){
        return
      }
      return setTimeout(()=>formatter.insertCss(_try+1),1000)
    }

    let s=document.createElement("link")
    s.setAttribute("rel","stylesheet")
    s.setAttribute("href","//ai.boozang.com/formatter/formatter.css")
    document.body.append(s)
  },
  updateFormatLogSetting:function(setting){
    try{
      localStorage.setItem("bz-log-format",JSON.stringify(setting))
    }catch(e){}
  },
  exeFormag:function(setting,auto){
    formatter.startTime=formatter.startTime||Date.now()
    console.log("start:"+formatter.startTime)
    if(!document.body){
      return setTimeout(()=>formatter.exeFormag(setting,auto),1000)
    }
    formatter.insertCss()
    if(setting.gotoOrg){
      setting.ignore= 1
      delete setting.gotoOrg
      formatter.updateFormatLogSetting(setting)
      location.reload()
    }else if(setting.ignore){
      delete setting.ignore
      formatter.updateFormatLogSetting(setting)
      return
    }

    if(!document.body.innerHTML.includes("Boozang runner")&&!document.getElementsByTagName("iframe")[0]&&parent==window){
      if(!auto){
        alert("There is no boozang test log")
      }else{
        let _clicked
        for(let o of document.getElementsByTagName("A")){
          if(o.innerHTML=="Full Log"){
            _clicked=1
            o.click()
          }
        }
        if(Date.now()-auto>30000){
          return
        }else{
          return setTimeout(()=>{
            formatter.exeFormag(setting,auto)
          },_clicked?1000:1000)
        }
      }
      formatter.removeDoingInfo()
      return
    }
    formatter.showDoing("Loading log ...")
    let ps=document.getElementsByTagName("pre")
    for(let p of ps){
      p.style.display="none"
    }

    if(!window.$){
      return setTimeout(()=>{
        formatter.exeFormag(setting,auto)
      },1000)
    }
    formatter.updateFormatLogSetting(setting)

    let o=$(".console-output")[0]||$(document.body).find("pre")[0]
    if(o){
      if(location.href.endsWith("/console")){
        if(auto){
          location.href+="Full"
        }else{
          if(confirm("Not in full-log, do you want to format full-log to get better result?")){
            location.href+="Full"
            return
          }
        }
      }
    }else{
      formatter.removeDoingInfo()
      return
    }

    if(!formatter.data){
      document.documentElement.scrollTop=0
      if(!document.title){
        let title=location.href.match(/\/([^\/]+\.log)$/)
        if(title){
          document.title=title[1]
        }
      }
      formatter.data={
        errHashMap:{},
        moduleMap:{},
        setting:setting,
        totalActions:0,
        totalTests:0,
        totalScenarios:0,
        successScenarios:0,
        failedScenarios:0,
        project:{
          init:{},
          end:{}
        },
        scenarioMap:{},
        scenarioAnaMap:{},
        testMap:{},
        workerMap:[],
        waitingListMap:{},
        runningTestMap:{},
        curWorker:"master"
      }
      
      let p=$("<div class='bz-log-box'></div>")

      $(o.parentElement).append(p)
      

      $(o).hide()

      formatter.element=formatter.buildLayout(p)
      formatter.definitEvent()

      doIt(o)
    }else{
      formatter.data.setting=setting
      location.reload()
    }
    
    function doIt(o){
      if(o.innerText){
        formatter.showDoing("Formatting Boozang Log ...")
        setTimeout(()=>{
          formatter.format(o,0)
        })
      }else{
        setTimeout(()=>{
          doIt(o)
        },500)
      }
    }
  },
  buildRunningTests:function(){
    let ls=Object.values(formatter.data.runningTestMap)
    if(formatter.lastRunningList){
      if(ls.length==formatter.lastRunningList.length){
        if(!ls.find(x=>{
          if(!formatter.lastRunningList.find(y=>y.code==x.code)){
            return 1
          }
        })){
          return 
        }
      }
    }
    
    doRefresh()
    formatter.assignFinalResult()
    function doRefresh(){
      formatter.lastRunningList=ls
      formatter.element.exePanel.html(ls.map(x=>formatter.getGroupElement(x)).join(""));
      if(ls.length){
        formatter.element.exePanel.show()
        $(".bz-result-header").css({top:(67+ls.length*32.3333)+"px"})
      }else{
        formatter.element.exePanel.hide()
        $(".bz-result-header").css({top:"67px"})
      }
    }
    
  },
  assignFinalResult:function(){
    let r=$("svg[tooltip=Failed]")[0]
    if(r){
      let o=$("<span class='bz-failed-large'></span>")[0]
      r.replaceWith(o)
    }else{
      r=$("svg[tooltip=Success]")[0]
      if(r){
        let o=$("<span class='bz-success-large'></span>")[0]
        r.replaceWith(o)
      }  
    }
  },
  openLastAction:function(k){
    let o=formatter.data.scenarioMap[k]||formatter.data.runningTestMap[k]
    formatter.initScenario(k);
    o=o.element.find(".bz-level-test").toArray().pop();
    if(o){
      formatter.openItem(o)
      o=$(o).find(".bz-switch")[0]
      $(o).click()
    }
  },
  cleanWaitingList:function(){
    let map=Object.keys(formatter.data.waitingListMap)
    
    formatter.element.waitingList.html(map.map(x=>{
      return `<div class="bz-content"><div class="bz-title"><button class="bz-icon bz-switch bz-hide"></button><span class="bz-scenario bz-icon"></span><div class="bz-title-text">${x}</div></div></div>`
    }).join(""))
    if(map.length){
      formatter.element.waitingList.show()
    }else{
      formatter.element.waitingList.hide()
    }
  },
  definitEvent:function(){
    let fa=formatter.data,fe=formatter.element;
    
    // $(window).scroll(function(){
      // let r=$(".bz-log-box")[0].getBoundingClientRect(),
          // o=$(".bz-header");
      // if(r.top<30&&document.documentElement.scrollTop>50){
        // o.addClass("bz-top-bar")
        // o.css({
          // left:r.left+"px",
          // right:window.innerWidth-17-r.right+"px"
        // })
      // }else{
        // o.removeClass("bz-top-bar")
      // }
    // })

    $(document.body).click(function(e){
      let o=$(e.target)
      if(!o.hasClass("bz-tmp-screenshot")){
        hideBackScreenshot()
      }
      if(o[0].id=="failedOnly"){
        formatter.data.failedOnly=o[0].checked
        setTimeout(()=>{
          formatter.showFailedOnlyResult()
          formatter.chkReplay()
        },10)
      }else if(o.hasClass("bz-search-content")){
        formatter.search(o.text())
      }else if(o.hasClass("bz-json-validation")){
        return formatter.checkJsonValidation(e.target)
      }else if(o.hasClass("bz-switch2")){
        return
      }else if(o.hasClass("bz-close")){
        formatter.closeScenario(o)
      }else if(o.hasClass("bz-switch")){
        switchPanel(o)
      }else if(o.hasClass("bz-tmp-screenshot")){
        hideBackScreenshot()
      }else if(o.hasClass("bz-input-cross")){
        $(".bz-search-input").val("")
        formatter.search()
      }else if(o.hasClass("bz-cross")){ //close init,declare panel and pop-panel
        let k=o.attr("key")
        if(k){
          o.removeClass("bz-open")
          $("#"+k).addClass("bz-hide")
        }else if(o.parent().hasClass("bz-pop-panel")){
          o.parent().hide()
        }
      }else if(o.hasClass("bz-init-btn")){
        switchContent(o,"init")
      }else if(o.hasClass("bz-declare-btn")){
        switchContent(o,"declare")
      }else if(o.hasClass("bz-camera")){
        if(o.attr("path")){
          let oo=$(o).find(".bz-tmp-screenshot")
          oo[0]._parent=o
          $(document.body).append(oo[0])
          oo.show()
        }else{
          formatter.showCameraPanel()
        }
      }else if(o.hasClass("bz-pin-off")){
        o.removeClass("bz-pin-off")
        o.addClass("bz-pin-on")
        o.parent().parent().css({
          position:"sticky",
          top:"100px",
          "z-index":10000
        })
      }else if(o.hasClass("bz-pin-on")){
        o.removeClass("bz-pin-on")
        o.addClass("bz-pin-off")
        o.parent().parent().css({
          position:"",
          "z-index":0,
        })
      }else if(o.hasClass("bz-log-item")){
        openLog(o)
      }else if(o.hasClass("bz-search")){
        formatter.search($(".bz-header input.bz-search-input").val())
      }else if(o.hasClass("bz-analyze")){
        analyzer.doAnalysis()
      }else if(o.hasClass("bz-download")){
        formatter.download()
      }else if(o.hasClass("bz-ab")){
        formatter.showCompare()
      }else if(o.hasClass("bz-bug")||o.hasClass("bz-new-bug")||o.hasClass("bz-failed-hash")){ //bug button
        let url=o.attr("path")||o.attr("hash")
        if(url.match(/^[0-9A-F]+$/)){
          formatter.openIDE("rootCause/"+url)
        }else{
          formatter.openWindow(url,"bz-bug")
        }
      }else if(o.hasClass("bz-failed")&&o.hasClass("bz-result")){
        o.parent().find(".bz-pin-off").click()
        gotoHash(o)
      }else if(o.css("cursor")=="pointer"&&(o.hasClass("bz-title-text")||o.hasClass("bz-line"))){
        openTest(o)
      }else if($(".bz-info-box").find(o)[0]){
        openTest($(".bz-info-box"))
      }else if(o.is(".bz-sort-bar button")){
        formatter.sort(o)
      }else if(o.is(".bz-copy")){
        formatter.copyText(o.parent().parent()[0])
      }else if(o.is("#bz-chk-replay-all")){
        formatter.chkReplay(o)
      }else if(o.is(".bz-chk-replay")){
        formatter.chkReplay(o)
      }else if(o.is(".bz-play")){
        formatter.doPlay()
      }
    });

    $(document.body).contextmenu(function(e){
      let o=$(e.target)
      if(o.hasClass("bz-tmp-screenshot")){
        formatter.openWindow(formatter.getCameraPath(e.target._parent.attr("path")),"_blank")

        return false
      }
    })

    $(document.body).on("mousemove",".bz-scope .bz-title-text,.bz-scope .bz-line,fieldset",function(e){
      let _this=this
      if(!$(this).find(".bz-copy")[0]){
        $(".bz-copy").remove()
        if(this.tagName!="FIELDSET"||!$(this).is(".bz-pop-panel *")){
          $("<span style='position:absolute;'><button class='bz-copy bz-mini-icon bz-icon'></button></span>").appendTo(this)
        }
      }
    })

    $(document.body).on("mousemove",".bz-title-text,.bz-line,.bz-camera",function(e){
      let o=e.target,path=$(o).attr("bz")
      if($(o).hasClass("bz-camera")){
        insertScreenshot(o)
        return
      }
      
      if(!path){
        path=o.innerText.match(/m[0-9]+[\.\/\-]t[0-9]+([\.\/][0-9]+)?/)||o.innerText.match(/https?:\/\/.+/)
        if(!path){
          return
        }
        path=path[0]
      }

      if(!o.posRight){
        let s=o.innerHTML
        o.innerHTML=`<span>${s}</span>`
        let r=o.children[0].getBoundingClientRect()
        o.posRight=r.right
        o.innerHTML=s
      }
      if(e.clientX<o.posRight){
        o.style.cursor="pointer"
        $(o).addClass("bz-clickable")
        if(path.includes("http")){
          o.title="Click to open page("+path+")"
        }else{
          o.title="Click to open test case("+path+") in IDE"
        }
      }else{
        $(o).removeClass("bz-clickable")
        o.style.cursor="default"
      }
    });


    $(document.body).on("mouseover",".bz-hash-msg",function(e){
      let t=e.target.innerText.trim()
      $(".bz-hash-msg").removeClass("bz-highlight-msg")
      $(".bz-hash-msg").toArray().forEach(x=>{
        if(x.innerText==t){
          $(x).addClass("bz-highlight-msg")
        }
      })
    })
    document.body.onkeydown=function(e){
      hideBackScreenshot()
      if(e.keyCode==27){
        e=$(":focus")[0]
        if(!e||!["INPUT","TEXTAREA"].includes(e.tagName)){
          $(".bz-esc-click").click()
          return false
        }
      }
    }

    function hideBackScreenshot(){
      let o=$(".bz-tmp-screenshot").toArray()
      o.forEach(x=>{
        if(x._parent){
          x._parent.append(x)
          $(x).hide()
        }
      })
    }

    function insertScreenshot(o){
      let path=$(o).attr("path")
      if(path&&!$(o).find("img")[0]){
        $(o).append("<img src='"+formatter.getCameraPath(path)+"' class='bz-tmp-screenshot'>")
      }
    }

    function gotoHash(o){
      o=o[0]
      while(o.parentElement&&!$(o.parentElement).hasClass("bz-scope")){
        o=o.parentElement
      }
      let switcher=$(o).find(".bz-switch")[0]
      formatter.initScenario(switcher.attributes.key.value)
      let oo=$(o).find(".bz-level-action .bz-failed-title")[0]
      if(oo){
        formatter.openItem(oo)
        oo=$(oo).find(".bz-switch")
        if(!oo.hasClass("bz-open")){
          oo.click()
        }
      }
      oo=$(o).find(".bz-failed-hash")[0]
      if(oo){
        formatter.openItem(oo)
        oo.focus()
      }
    }
    
    function openLog(o){
      let n=o.text().match(/[0-9]+/)
      if(n&&formatter.data.wrongLog){
        return
      }
      if(n){
        n=formatter.getLogList()[n[0]-2]
      }else{
        n=location.href
      }

      formatter.data.setting.gotoOrg=1
      formatter.updateFormatLogSetting(formatter.data.setting)
      formatter.data.setting.gotoOrg=0
      formatter.openWindow(n)
    }
    function openTest(o){
      let v=o.attr("bz"),k=o.attr("worker")
      if(!v){
        v=o.text().match(/(m[0-9]+)[\.\/-](t[0-9]+)([ \.\/\-]?\(?([0-9]+)\)?)?/)
        if(v){
          let vv=v[1]+"/"+v[2]
          if(v[4]){
            vv+="/"+v[4]
          }
          v=vv
        }else{
          v=o.text().match(/https?:\/\/[^ ]+$/)
          if(v){
            formatter.openWindow(v[0])
          }
        }
      }
      if(v){
        formatter.openIDE(v,k)
      }
    }
    function getCloserElementInContent(o,c){
      while(o[0]){
        if(o.is(c)){
          return o[0]
        }
        let v=o.find(c)
        if(v[0]){
          return v[0]
        }
        if(o.hasClass("bz-content")){
          return 
        }
        o=o.parent()
      }
    }
    
    function switchPanel(o,force){
      let k=o.attr("key"),c="bz-open",switcher,panel

      panel=$(".bz-panel."+k)

      switcher=o
      if(k[0]=="m"){
        let s=formatter.initScenario(k)
        switcher=s.switcher
      }else if(k[0]=="p"){
        if(!formatter.data.project.init.element){
          formatter.data.project.init.element=panel
          panel.html(formatter.strToHtml(formatter.data.project.init.org))
        }
      }
      if(switcher.hasClass(c)){
        if(force=="open"){
          return
        }
        switcher.removeClass(c)
        panel.hide()
        if(formatter.data.runningTestMap[k]){
          formatter.cleanScenarioPanel(k)
        }
      }else{
        if(force=="close"){
          return
        }
        switcher.addClass(c)
        panel.show()
        panel.find(".bz-line,.bz-level-action").show()
        if(formatter.data.runningTestMap[k]){
          formatter.data.runningTestMap[k].openning=1
        }
      }
    }
    
    function switchContent(o,k){
      let id=o.attr("key"),e,closer;
      if(id[0]=="t"){
        e=$("#"+id+"-"+k)
        closer=e.find(".bz-cross")
      }else{
        s=formatter.initScenario(id)
        e=s[k].element
        closer=s[k].closer
      }
      if(closer[0].getBoundingClientRect().width){
        closer.removeClass("bz-open")
        e.addClass("bz-hide")
      }else{
        closer.addClass("bz-open")
        e.removeClass("bz-hide")
        switchPanel(o,"open")
      }
    }
    
  },
  chkReplay:function(o){
    setTimeout(()=>{
      if(o&&o.is("#bz-chk-replay-all")){
        $(".bz-chk-replay").toArray().filter(x=>x.getBoundingClientRect().width).forEach(x=>x.checked=o[0].checked)
      }else{
        $("#bz-chk-replay-all")[0].checked=!$(".bz-chk-replay").toArray().filter(x=>x.getBoundingClientRect().width).find(x=>!x.checked)
      }

      $(".bz-play").attr({disabled:!$(".bz-chk-replay").toArray().find(x=>x.getBoundingClientRect().width&&x.checked)})
    },10)
  },
  closeScenario:function(o){
    while(!o.hasClass("bz-level-scenario")){
      o=o.parent()
    }
    o=o.find(".bz-switch.bz-open")
    o.click()
    o.focus()
  },
  openWindow:function(url,name,size){
    let w=window.open(url,name,size)
    if(!w){
      chrome.runtime.sendMessage({bz:1,bg:1,fun:"openWindow",data:{url:url,name:name}});
    }
  },
  cleanScenarioPanel:function(k){
    let s=formatter.data.scenarioMap[k]
    delete s.element
  },
  getWorkInfo:function(o){
    if(o.worker!==undefined){
      o=o.worker
      if(o!="master"){
        o="worker-"+(parseInt(o)+2)
      }else{
        o="worker-1"
      }
      return `[${o}]`
    }else{
      debugger
    }
  },
  getGroupElement:function(o){
    let level=o.level,ctrl="",exPanel="",endPanel="";
    if(level=="scenario"||level=="test"){
      ctrl=`<button key="${o.code}" class="bz-icon bz-init-btn bz-init">(${o.init.time||"0s"})</button>`
    }
    if(level=="scenario"){
      ctrl=`
        ${ctrl}
        <button key="${o.code}" class="bz-icon bz-declare-btn bz-declare">(${o.declare.time||""})</button>
        <button title='${o.bug&&o.bug.msg&&o.bug.msg.replace(/[<]/g,"&lt;").replace(/[>]/g,"&gt;")}' class="bz-icon bz${o.bug?o.bug.type:""}-bug ${!o.bug&&'bz-hide'}" hash="${o.bug&&o.bug.hash}" path="${o.bug&&o.bug.path}"></button>
      `;
      [...(new Set(o.camera||[]))].forEach(x=>{
        ctrl+=`<button class="bz-icon bz-camera" path="${x}"></button>`
      })
      ctrl+=`<button class="bz-icon bz-pin-off" title=""></button>`
    }
    if(ctrl){
      ctrl=`<div class="bz-ctrl-box">${ctrl}</div>`
    }
    
    if(level=="scenario"){
      exPanel = formatter.getGroupElement({name:"Declare",level:"declare",type:"declare",code:o.code+"-declare",worker:o.worker,close:"cross",css:"bz-hide"})
              + formatter.getGroupElement({name:"Initial",level:"init",type:"init",code:o.code+"-init",worker:o.worker,close:"cross",css:"bz-hide"})
      endPanel=`<div class='bz-end ${o.code}-end'></div>`
    }else if(level=="test"){
      exPanel = formatter.getGroupElement({name:"Initial",level:"init",type:"init",code:o.code+"-init",worker:o.worker,close:"cross",css:"bz-hide",details:o.init.details})
      delete o.init.details
    }
    
    let html= `
    <div id="${o.code}" class="bz-content bz-close-panel bz-level-${level} ${o.ckey||""} ${o.css||""}">
      <div class="bz-title bz-${o.result}-title">
        <button key="${o.code}" style="background-size:${o.close?12:8}px;visibility:${o.details!==undefined&&!o.details?'hidden':'unset'}" class="bz-icon bz-${o.close||"switch"}"></button>
        <div class="bz-icon bz-${o.type}"></div>
        <div class="bz-title-text" bz="${o.bz||""}" worker="${o.worker||""}">${o.title||o.name} ${formatter.getWorkInfo(o)}</div>
        ${ctrl}
        <div class="bz-time">${o.time||""}</div>
        ${o.result?`<div class="bz-result bz-icon bz-${o.result}"></div>`:""}
        ${o.type=='scenario'?'<input class="bz-chk-replay" type="checkbox"/>':''}
      </div>
      <pre class="bz-panel ${o.code}" ${o.close?'':'style="display:none;"'}>
        ${exPanel}
        <div class='bz-details ${o.code}-details'>${o.details&&o.details.constructor==String?o.details:""}</div>
        ${endPanel}
      </pre>
    </div>`
    return html
  },
  showFailedOnlyResult:function(){
    for(let k in formatter.data.scenarioMap){
      let o=formatter.data.scenarioMap[k]
      if(o.result=="success"&&formatter.data.failedOnly){
        formatter.hideScenario(o)
      }else{
        $("#"+o.code).show()
      }
    }
  },
  getLogList:function(masterUrl){
    let v;
    try{
      eval("v="+formatter.data.setting.identifyWorker)
      v= v(masterUrl)
      if(!v||v.constructor!=Array||v.includes(masterUrl)){
        v=[]
      }
    }catch(ex){
      v=0
    }
    return v||[]
  },
  buildLayout:function(p,setting){
    let fd=formatter.data;

    let o={
      header:$(`<div class="bz-row bz-header">
        <div class='bz-icon-letter bz-timer'></div>
        <label class='bz-show-failed-only'><input type="checkbox" id="failedOnly"/>Only show Failed</label>
        <div class="bz-log-bar bz-nowrap">
          <label style="margin-left:5px;color:#000;font-weight:bold;">Org-Log: </label>
          <a class='bz-master-log bz-log-item'>master,</a>
          ${formatter.getLogList().map((a,i)=>"<a class='bz-log-item'>"+(i+2)+",</a>").join("").replace(/,<\/a>$/,"</a>")}
        </div>
        <div class="bz-sort-bar bz-nowrap">
          <label style="margin-left:5px;color:#000;font-weight:bold;">Sort: </label>
          ${[{n:"Completion",k:"idx",c:"bz-a-z"},{n:"Id",k:"code"},{n:"Name",k:"name"},{n:"Result",k:"result"},{n:"Performance",k:"time"},{n:"Worker",k:"worker"}]
          .map(x=>`<button id="sort-${x.k}" class="bz-icon-letter ${x.c||""}">${x.n}</button>`).join("")}
        </div>
        <div class="bz-input-cross-box">
          <input class='bz-search-input' type="text"/>
          <button class="bz-cross bz-icon bz-input-cross"></button>
        </div>
        <button class="bz-icon bz-search"></button>
        <button class='bz-icon bz-download' title='Download log'></button>
        <button class='bz-icon bz-analyze' title='Show test case execution summary' disabled='true'></button>
        <button class='bz-icon bz-ab' title='Compare with other log to see the diffences'></button>
        <button class='bz-icon bz-camera' title='Show screenshot list' disabled='true'></button>
        <button class='bz-icon bz-play' title='Re-Play checked scenarios' disabled='true'></button>
        <div class='bz-pop-panel bz-close-panel bz-hide'><button class="bz-mini-icon bz-cross" style="position:absolute;"></button><div class='bz-box'></div></div>
      </div>`).appendTo(p),
      init:$(formatter.getGroupElement({name:"Initial",code:"project-init",level:"project",type:"init"})).appendTo(p),
      exePanel:$("<div class='bz-scope bz-exe-scope' bz-name='Executing list'></div>").appendTo(p),
      resultPanel:$("<div class='bz-result-header'><span id='bz-result-content'></span><input type='checkbox' id='bz-chk-replay-all'/></div>").appendTo(p),
      panel:$("<div class='bz-scope bz-hide-scope-header'></div>").appendTo(p),
      waitingList:$("<div class='bz-scope bz-hide' bz-name='Waiting list'></div>").appendTo(p),
      end:$("<pre class='bz-scope bz-end'></pre>").appendTo(p)
    };
    if(!o.init){
      debugger
    }
    let popPanel=$(".bz-pop-panel");
    popPanel.mousedown(function(e) {
      if(["BUTTON","TEXTAREA","INPUT","SELECT"].includes(e.target.tagName)){
        return
      }
      this.isDown = true;
      let r=this.getBoundingClientRect()
      this.org={
        left:r.left,
        top:r.top,
        x:e.clientX,
        y:e.clientY
      }
      popPanel.css({
        position:"fixed",
        "margin-top":0,
        top:this.org.top+"px",
        left:this.org.left+"px",
        right:"unset",
        "z-index":2000000000000000000
      })
      $(document.body).addClass("disable-select")
    });

    popPanel.mouseup(function() {
      this.isDown = false;
      $(document.body).removeClass("disable-select")
    });

    popPanel.mousemove(function(e) {
      if (this.isDown) {
        e.preventDefault();
        popPanel.css({
          top:this.org.top+(e.clientY - this.org.y)+"px",
          left:this.org.left+(e.clientX - this.org.x)+"px",
          right:"unset"
        })
      }
    });
    popPanel.mouseout(function(){
      this.isDown=0
      $(document.body).removeClass("disable-select")
    })

    o.header.find("input.bz-search-input").change(function(e){
      formatter.search(this.value)
    })

    if(!formatter.isMasterPage(formatter.data.setting)){
      $(".bz-log-bar").hide()
    }
    return o
  },
  format:function(o,chkTime){
    formatter.doingWorker="master"
    let idx=0,ws=o.innerText
    o.innerHTML=""
    if(!location.host&&!ws.length){
      formatter.data.completed=1
      formatter.element.waitingList.hide()
    }
    
    formatter.buildScenarioList(ws,function(){
      if(!formatter.endTime){
        formatter.endTime=Date.now()
        console.log("End: "+(formatter.endTime-formatter.startTime))
      }
      formatter.keepLogMap("master")

      if(formatter.chking>=30){
        formatter.chking=0
        formatter.formatWorkers()
      }else{
        formatter.doingWorker=""
      }
      if(!chkTime){
        formatter.chkTime=setInterval(()=>{
          if(formatter.data.completed){
            doEnd()
            return clearInterval(formatter.chkTime)
          }

          if(!formatter.doingWorker){
            formatter.chking++

            formatter.takeLogMap("master")
            formatter.format(o,1)
          }
        },1000)
      }
    })
    
    function doEnd(){
      if(!formatter.doingWorker){
        formatter.takeLogMap("master")
        formatter.data.project.end.org=formatter.data.curEnd
        formatter.element.end.html(formatter.strToHtml(formatter.data.curEnd))
        formatter.element.exePanel.hide()
        $(".bz-result-header").css({top:"67px"})
        $(".bz-chk-replay,#bz-chk-replay-all").show()
        formatter.assignFinalResult()
      }else{
        setTimeout(()=>{
          doEnd()
        },1000)
      }
    }
  },
  formatWorkers:function(){
    formatter.doingWorker="workers"
    
    let v=formatter.data.setting.retrieveWorkerLog&&formatter.isMasterPage(formatter.data.setting)?formatter.getLogList():[]
    doIt(v,0)

    
    function doIt(vs,i){
      let s=vs[i]
      if(s&&!formatter.data.wrongLog){
        $.ajax({
          url:s,
          method:"GET",
          complete:function(c){
            c=c.responseText.split("\n")
            if(c.length){
              while(c.length&&!c.pop()){}
              if(c.length>3){
                c.pop()
              }
              formatter.takeLogMap(i)
              formatter.logMap[i].size=formatter.logMap[i].size||0
              c=c.splice(formatter.logMap[i].size)
              formatter.logMap[i].size+=c.length
              if(c.length>3000){
                formatter.showDoing("Formatting worker("+(i+2)+") Log ...")
              }
              
              formatter.buildScenarioList(c.join("\n"),function(){
                formatter.keepLogMap(i)

                doIt(vs,i+1)
              })
            }
          }
        })
      }else{
        formatter.doingWorker=0
        formatter.removeDoingInfo()
      }
    }
  },
  checkJsonValidation:function(o){
    let v=o.nextElementSibling.innerHTML
    v=v.split("-- Validation --").map(x=>x.trim())
    let vv=v[0].split("-- Data --").map(x=>x.trim())
    v[0]=vv[1]
    vv=vv[0].substring(4).trim()
    vv+="/showValid"
    chrome.runtime.sendMessage({bg:1,fun:"setValidJsonData",data:{data:v[0],valid:v[1],url:vv}});
  },
  buildScenarioList:function(v,bkFun){
    let fd=formatter.data,
        fe=formatter.element,
        parsingScenario;
    if(!v){
      return bkFun&&bkFun()
    }
    if(formatter.data.setting.lineClear){
      v=v.split("\n").map(x=>formatter.lineClear(x.trim())).join("\n")
    }
    v=(fd.curEnd||"")+v

    let ss=v.match(/\n[0-9]+\: BZ-Result\:(Success|Failed|Stop)$/gm)||[],
        list=[],
        remoteList=v.match(/\n[0-9]+\: \.{4} .+ Remote \[m[0-9].+\] .+Completed in (.+) Tasks:[ 0-9\/\.]+$/gm)||[]
    ss.forEach(x=>{
      let ei=v.indexOf(x)
      
      let sv=v.substring(0,ei+x.length)
      v=v.substring(sv.length).trim()
      if(x.includes("BZ-Result:Stop")){
        return
      }
      handleItem(sv,x)
    })
    
    fd.curEnd=v

    if(!fd.waitingListSize){
      fd.totalScenarios+=ss.length
    }

    let ls=list=list.filter(x=>!fd.failedOnly||x.result=="failed")
    if(ls.length){
      fe.panel[0].innerHTML+=ls.map(x=>formatter.getGroupElement(x)).join("")
      formatter.element.header.find(".bz-analyze").attr({disabled:false})
      formatter.cleanWaitingList()
    }

    assignWoker()
    handleRealTimeInfo()
    if(!handleTaskEnd(v)){
      handleRunningTest(fd.curEnd)
    }

    bkFun()
    
    function handleRunningTest(x){
      v=x
      try{
        handleItem(x)
      }catch(ex){
        
      }
      try{
        if(parsingScenario&&parsingScenario.code){
          fd.runningTestMap[parsingScenario.code]=parsingScenario
          formatter.buildRunningTests()
        }
      }catch(e){
      }
    }
    
    function handleItem(sv,x){
      sv=handleJsonValidation(sv)
      let s={
        idx:parseInt(x?x.match(/[0-9]+/)[0]:0),
        result:x?x.includes("Success")?"success":"failed":"running",
        org:sv,
        type:"scenario",
        level:"scenario",
        declare:{},
        init:{},
        details:{
          tests:[]
        },
        end:{}
      }
      parsingScenario=s
      list.push(s)
      if(x){
        handleSummaryInfo(s)
      }
      handleStartTime(s)
      handleDeclare(s)
      handleInit(s)

      handleFailedScenario(s)
      handleEnd(s)
      // if(fd.curLastScenario){
        // fd.curLastScenario.time=formatter.getSpendTime(fd.curLastScenario.start,s.start,"scenarioTime")
        // fd.curLastScenario.endTime=s.start
      // }
      fd.curLastScenario=s
    }
    
    function handleSummaryInfo(s){
      if(s.result=="success"){
        fd.successScenarios++
      }else{
        fd.failedScenarios++
      }
      let ts=s.org.match(/\n[0-9]+: +>{4} Loading .*Test \[m[0-9].+$/gm)
      if(ts){
        fd.totalTests+=ts.length
        ts=s.org.match(/\n[0-9]+: ##Action.+$/gm)
        if(ts){
          fd.totalActions+=ts.length
        }
      }
    }
    
    function handleStartTime(s){
      let sv=s.org,w
      if(!fd.curLastScenario){
        let declare=sv.match(/\n[0-9]+\: BZ-LOG: declare on \[m[0-9]+\.t[0-9]+[ \(\]][^\n]+\n/gm)
        
        if(declare){
          w=formatter.splitByWord(sv,declare[1]||declare[0])
          s.org=w[1]
        }
      }

      s.start=formatter.retrieveTimeFromLog(s.org)

      if(!fd.project.init.org){
        fd.project.init.org=w[0]
        fd.project.init.time=formatter.getSpendTime(0,s.start)
        handleWaitingList(w[0])
        handleSetting(w[0])
      }
    }

    function handleDeclare(s){
      let sv=s.org
      let w=sv.match(/\n([0-9]+)\: +\>+ Loading Scenario \[((m[0-9]+\.t[0-9]+)(\(([0-9]+)\))?)\] - (.+) \(([0-9:]+)\) \>+$/m);
      if(!w){
        s.declare.org=sv
        s.org=""
        return
      }

      let k=w[2].replace(/[^tm0-9]/g,"-").replace(/-$/,"")
      
      s.ckey="module-"+k,
      s.code=k+"-"+fd.curWorker
      s.worker=fd.curWorker

      s.name=w[6]
      s.bz=w[3]
      s.start=w[7]
      s.title="["+w[2]+"] "+w[6]
      s.dataIdx=w[5]
      fd.scenarioMap[s.code]=s
      w=formatter.splitByWord(s.org,w[0]);
      s.declare.org=w[0]
      s.org=w[1]
      s.init.start=s.start
      s.declare.start=formatter.retrieveTimeFromLog(s.declare.org)
      s.declare.time=formatter.getSpendTime(s.declare.start,s.init.start,"declareTime")

      delete fd.waitingListMap[k]
      if(s.result!="running"){
        delete fd.runningTestMap[s.code]
      }
    }
    
    function handleInit(s){
      if(s.org){
        let w=formatter.splitByWord(s.org,/\n[0-9]+\: ##Action.+/);
        if(!w){
          s.init.org=s.org
          delete s.org
          return
        }
        s.init.org=w[0]
        s.org=w[1]
        s.details.start=formatter.retrieveTimeFromLog(w[1])
        s.init.time=formatter.getSpendTime(s.init.start,s.details.start,"initTime")||"0"
      }
    }
    
    function handleEnd(s){
      if(s.org){
        let mk=/[0-9]+\: +<+ [^\[]+Feature - Scenario \[m[0-9][^\]]+\] ([0-9\:]+) [^<]+<<<</ms;
        let time=s.org.match(/\[ [0-9\:]+ .+\]/g)||[]

        if(time.length>1){
          time=[time.shift(),time.pop()].map(x=>x.match(/[0-9\:]+/)[0].split(":"))
          let t1=new Date()
          t1.setHours(parseInt(time[0][0]))
          t1.setMinutes(parseInt(time[0][1]))
          t1.setSeconds(parseInt(time[0][2]))
          let t2=new Date()
          t2.setHours(parseInt(time[1][0]))
          t2.setMinutes(parseInt(time[1][1]))
          t2.setSeconds(parseInt(time[1][2]))
          time=(t2.getTime()-t1.getTime())/1000+"s"
          s.time=time
        }

        let w=formatter.splitByWord(s.org,mk);
        if(!w){
          s.details.org=s.org
        }else{
          mk=w[1].match(mk)
          if(mk){
            s.endTime=mk[1]
            s.time=formatter.getSpendTime(s.start,s.endTime)
          }
          s.details.org=w[0]
          delete s.org
          s.end.org=w[1]
        }
      }
    }

    function handleSetting(v){
      let x=v.match(/(http.+[\/].+)\/extension.*[?&]token\=.+#.+/gm);

      if(x){
        x=x.find(y=>y.match(/\/run/))||x[0]
        fd.center=x.split("localized=")[1]
        if(fd.center){
          fd.center=fd.center.split(/[\&\#]/)[0]
        }
        fd.center=fd.center||"Boozang"
        fd.token=x.match(/token=([^&]+)/)[1]
        x=x.match(/(http.+[\/].+)\/extension.*[?&]token\=.+#([^\/]+)[\/]([^\/]+)([\/](m[0-9]+[\/]t[0-9]+)[\/]run)?/);

        fd.startUrl=x[0].split("#")[0].replace(/token=[^&#]+/,"id="+x[2]).replace(/&(self|group)=[^&#]*/g,"")+"#"+x[2]+"/"+x[3]+"/"
        fd.host=x[1]
        fd.project.code=x[2]
        fd.version=x[3]
        fd.rootTest=(x[5]||"").replace("/",".")

        if(x[5]){
          fd.environment=v.split("&env=")[1].split("&")[0]
        }
      }
      x=v.match(/[0-9]+\: IDE version\: ([0-9\.]+)/m);
      if(x){
        fd.ideVersion=x[1]
      }
      x=v.match(/Running Boozang runner version\: ([0-9\.]+)/m);
      if(x){
        if(x[1]=="."){
          x[1]="Beta"
        }
        fd.containerVersion=x[1]
      }

      x=v.match(/Extension version\: ([0-9\.]+)/);
      if(x){
        fd.extensionVersion=x[1]
      }
      
      x=v.match(/[0-9]+\: ([0-9-]+ )([0-9 -]+)$/m)
      if(x){
        fd.startTime=x[1]+x[2].replace(/-/g,":")
      }
      formatter.data.testreset=(v.match(/testreset\: ([0-9]+)/)||[])[1]

      fe.init.find(".bz-title-text").html(`
        <span style='margin-right:20px;'>Initial: </span>
        <div><label>Start time: </label><span>${fd.startTime}</span></div>
        <div><label>Version: </label><span>${fd.version}</span></div>
        <div><label>Root test: </label><span>${fd.rootTest}</span></div>
        <div><label>Environment: </label><span>${fd.environment}</span></div>
        <div><label>Container: </label><span>${fd.containerVersion}</span></div>
        <div><label>IDE: </label><span>${fd.ideVersion}</span></div>
        <div><label>Extension: </label><span>${fd.extensionVersion}</span></div>
        <div><label>Communication center: </label><span>${fd.center}</span></div>
      `);
      fe.init.find(".bz-title-text").addClass("bz-info-box")
      fe.init.find(".bz-time").text(fd.project.init.time)
    }

    function handleWaitingList(v){
      v=v.match(/[0-9]+: Split task\([^\)]+\): [^\n]+\n/gm)
      if(v){
        let map={}
        v.forEach(x=>{
          x=x.match(/(m[0-9]+.t[0-9]+)+\(?([0-9]+)?/)
          let k=x[1].replace(".","-")
          if(!x[2]){
            if(map[k+"-0"]){
              return
            }
          }else{
            delete map[k]
            k+="-"+x[2]
          }
          map[k]=1
        })

        fd.waitingListSize=fd.totalScenarios=Object.keys(map).length
        fd.waitingListMap=map
      }
    }

    function handleRealTimeInfo(){
      $(".bz-result-header span").html(`<span>Completed list [Scenarios: ${fd.totalScenarios} </span>( <span class='bz-success'> ${fd.successScenarios}</span><span class='${fd.failedScenarios?'':'bz-hide'}'>,</span> <span class='bz-failed ${fd.failedScenarios?'':'bz-hide'}'> ${fd.failedScenarios}</span> )  Tests: ${fd.totalTests}  Actions: ${fd.totalActions}]`)
    }

    function handleFailedScenario(s){
      if(s.result=="failed"){
        handleCamera(s,1)
        handleBug(s)
      }else if(s.org){
        handleCamera(s)
      }
    }

    function handleCamera(s,_failed){
      let w=s.org.match(/\n[0-9]+\: Screenshot\:([0-9a-f]{32})/ig);
      if(w){
        w=w.map(x=>x.match(/Screenshot\:([0-9a-f]{32})/i)[1])
        s.camera=w
        formatter.cameraList.push(w)
        formatter.element.header.find(".bz-camera").attr({disabled:false})
      }else if(_failed){
        s.cameraMsg="There is no screenshot for API test case. Or got an error on loading page."
      }
    }

    function handleBug(s){
      let w=s.org.match(/\[Error Hash\: ([0-9A-F]+)\] \((.+)\)/)
      if(w){
        s.bug={hash:"",path:"",type:""}
        let msg=(s.org.match(/[0-9]+: ERROR MESSAGE: .*Failed on Action: m[0-9]+[^\n]+\n/ms)||[])[0]+"\n"+w[0]
        if(w[2]=="new"){
          s.bug.hash=w[1]
          s.bug.type="-new"
        }else{
          let link=s.org.match(/Root cause link: ?([^\n]+)\n/)
          if(link){
            msg+="\n\n"+link[0]
          }
          s.bug.path=(link||w)[1]
        }

        s.bug.msg=msg
        
      }
    }
    
    function handleTaskEnd(v){
      if(fd.curWorker=="master"){
        let w=v.match(/\n[0-9]+\: (task-done|stopped by container)/)
        if(w){
          w=w[0]
          if(w.includes("stopped")){
            k="🛑"
          }else{
            k="🚩"
          }
          fd.curEnd=v.replace(w,w+k)
          fd.completed=1
          return 1
        }
      }
    }
    
    function handleJsonValidation(v){
      v=v.replace(/BZ-Start-Validating:/g,"<span><a style='cursor:pointer'  class='bz-json-validation'>Check JSON Validation</a><div style='display:none'>")
      return v.replace(/BZ-End-Validating/g,"</div></span>")
    }

    function assignWoker(){
      remoteList.forEach(x=>{
        x=x.match(/\[(m[0-9]+\.t[0-9]+(\([0-9]+)?)\)?\] .+Completed in (.+) Tasks:[ 0-9\/\.]+$/)
        if(x){
          x={
            k:"module-"+x[1].replace(/[\.\(]/g,"-"),
            w:x[3]
          }
          let w=fd.workerMap[x.k]
          if(!w){
            fd.workerMap[x.k]=x
          }else if(w.w!=x.w){
            w.warning=1
            w.w+=", "+x.w
            w.done=0
          }
        }
      })
      for(let k in fd.workerMap){
        let w=fd.workerMap[k]

        if(w.done){
          continue
        }
        let os=$("."+w.k)
        let t=os.find(".bz-title-text");
        if(t.length){
          w.n=w.n||t[0].innerText
          let v=w.n+" ("+w.w+")"
          if(w.warning){
            v+=" ⚠️"
            t.attr({title:"Duplicate execution"})
          }
          t.text(v)
          os.toArray().forEach(x=>{
            fd.scenarioMap[x.id].worker=w.w
          })
          w.done=1
        }
      }
    }
  },
  loadModuleInfo:function(v){
    let ms=v.match(/[0-9]+: Module info: \[m[0-9]+\] .+/gm)||[]
    ms.forEach(x=>{
      x=x.split(/\[|\] /);
      let c=x[1],n=x[2]
      let m=formatter.data.moduleMap[c]
      if(!m){
        m=formatter.data.moduleMap[c]={testMap:{}}
      }
      m.code=c
      m.name=n
    })
  },
  strToHtml:function(v,mark){
    v=v||""
    if(v.constructor==String){
      v=v.split("\n")
    }

    v=v.map(x=>{
      let xx=x.match(/([0-9]+: Screenshot:([0-9a-f]{32}))/i)
      if(xx){
        return `<img src='${formatter.getCameraPath(xx[2])}'/>`
      }else{
        return `<div class="bz-line">${x}</div>`
      }
    }).join("")

    // v=v.map(x=>`<div class="bz-line">${x}</div>`).join("")
    // if(mark=="screenshot"){
    //   let k=v.match(/([0-9]+: Screenshot:([0-9a-f]{32}))/i)
    //   if(k){
    //     formatter.lastImg="<img src='"+formatter.getCameraPath(k[2])+"'/>"
    //   }
    // }

    if(mark=="declare"){
      v=v.replace(/(bz-line)(">[0-9]+: BZ-LOG: declare on \[m[0-9])/g,"$1 bz-declare$2")
    }

    v=v.replace(/(bz-line)(">[0-9]+: <---- Join worker)/g,"$1 bz-join$2")
    v=v.replace(/(bz-line)(\">[0-9]+: Remove worker )/g,`$1 bz-leave$2`)
    if(mark=="failed"){
      let img=formatter.lastImg||""
      formatter.lastImg=""
      v=v.replace(/<div class="bz-line">(\[Error Hash: ([A-F0-9]+)\][^<]*)<\/div>/,'<div><button title="Open the Root Cause in IDE" class="bz-failed-title bz-failed-hash" hash="$2">$1</button><button class="bz-icon bz-close bz-esc-click" title="Close current scenario">✖ close</button>'+img+'</div>')
      v=v.replace(/<div class="bz-line">([0-9]+\: ERROR MESSAGE: )([^<]+<\/div>)/,"<fieldset class='bz-err-msg-box'><legend>$1</legend><div class='bz-line'>$2");
      v=v.replace(/<\/div><div><button/,"</div></fieldset><div><button")
    }
    return v
  },
  buildAllDetails:function(os){
    (os||Object.keys(formatter.data.scenarioMap)).forEach(x=>formatter.initScenario(x))
  },
  initScenario:function(k){
    let fd=formatter.data
    let s=fd.scenarioMap[k]||fd.runningTestMap[k];
    if(!s.element&&(!fd.failedOnly||s.result=="failed")){
      s.element=$("#"+k)
      s.switcher=$(s.element.find(".bz-switch")[0])
      s.init.element=$("#"+k+"-init.bz-level-init")
      s.init.panel=s.init.element.find(".bz-panel>div")[0]
      s.init.closer=s.init.element.find(".bz-cross")

      s.declare.element=$("#"+k+"-declare.bz-level-declare")
      s.declare.panel=s.declare.element.find(".bz-panel>div")[0]
      s.declare.closer=s.declare.element.find(".bz-cross")
      
      s.details.element=s.element.find("."+k+"-details")
      
      s.end.element=s.element.find("."+k+"-end")
      
      buildSimpleContent(s.init.element.find(".bz-panel"),s.init.org)
      buildSimpleContent(s.declare.element.find(".bz-panel"),s.declare.org,"declare")
      if(s.details.org){
        s.details.element.html(buildTests(s.details.org,1,s.details.start,s.endTime,s.bz,0,s.worker))
      }
      buildSimpleContent(s.end.element,s.end.org,s.result)
    }
    return s
    
    function buildTests(v,level,startTime,endTime,bz,test,worker){
      let html=""
      let ts=analyzer.getTestTreeByLevel(v,level),curTest,tt,lastTest;
      
      ts.forEach((t,i)=>{
        if(i%2==0){
          tt=formatter.splitByWord(v,t)
          v=tt[1]
          curTest=retrieveTestData(t)
          curTest.start=formatter.retrieveTimeFromLog(v)
          html+=buildActions(tt[0],startTime,curTest.start,bz,!i&&test,0,worker)
          
          fd.testMap[curTest.code]=curTest
        }else{
          if(t.match(/\<+ Failed /)){
            curTest.result="failed"
          }
          tt=formatter.splitByWord(v,t,1)
          startTime=formatter.retrieveTimeFromLog(tt[1])||endTime
          curTest.time=formatter.getSpendTime(curTest.start,startTime,"testTime")
          curTest.worker=worker
          curTest.details=buildTests(tt[0],level+1,curTest.start,startTime,curTest.bz,curTest,worker)
          html+=formatter.getGroupElement(curTest)
          delete curTest.details
          v=tt[1]
          lastTest=curTest
        }
      })
      return html+buildActions(v,startTime,endTime,bz,!ts.length&&test,test&&test.result=="failed",worker)
      
    }
    
    function retrieveTestData(v){
      let x=v.match(/^([0-9]+)\: +\>+ Loading (.*Test) \[(m[0-9]+\.t[0-9]+)(\(([0-9]+)\))?\] - (.+) \([0-9:]+\) \>+$/);
      if(x){
        return {
          code:"test"+formatter.getIdx(),
          type:"test",
          name:"["+x[3]+"] "+x[6],
          idx:parseInt(x[1]),
          result:"success",
          tests:[],
          level:"test",
          bz:x[3],
          init:{
            time:"0s"
          }
        }
      }
    }
    
    function buildActions(v,startTime,endTime,bz,test,inFailed,worker){
      if(!v.includes("bz-json-validation")){
        v=(v||"").replace(/</g,"&lt;").replace(/>/g,"&gt;")
      }
      let as=(v||"".trim()).match(/(\n|^)[0-9]+\: ##Action.+$/gm),lastAction;
      if(!inFailed&&v.match(/[0-9]+: (failed test|Load page error): /)){
        inFailed=1
      }
      if(as){
        as=as.map((a,j)=>{
          a=a.trim()
          if(j){
            if(a.replace(/^[0-9]+:/,"")==as[j-1].trim().replace(/^[0-9]+:/,"")){
              return
            }
          }
          return {k:a}
        }).filter(x=>x)
        as.forEach(a=>{
          let wa=formatter.splitByWord(v,a.k)
          v=a.c=wa[1].trim()
          if(lastAction){
            lastAction.c=wa[0].trim()
          }else if(test){
            test.init.details=formatter.strToHtml(wa[0])
            startTime=formatter.retrieveTimeFromLog(v)
            test.init.time=formatter.getSpendTime(test.start,startTime,"initTime")
          }
          lastAction=a
        })
        as=as.map(a=>retrieveActionData(a.k,a.c,bz))
        as.forEach((a,i)=>{
          a.worker=worker
          a.details=a.details.split("\n").filter(x=>x&&!isIgnoreContent(x))
          a.details.shift()
          
          if(a.details.length==1&&formatter.retrieveTimeFromLog(a.details[0])){
            a.details=""
          }else{
            if(i==as.length-1&&inFailed){
              a.result="failed"
            }
            a.details=formatter.strToHtml(a.details,inFailed&&i==as.length-1&&"screenshot")
          }
          if(i){
            as[i-1].time=formatter.getSpendTime(as[i-1].start,a.start,"actionTime")
            a.start=a.start||as[i-1].start
          }else{
            a.start=startTime||a.start
          }
        })
        as[as.length-1].time=formatter.getSpendTime(as[as.length-1].start,endTime,"actionTime")
        let r=as.map(a=>formatter.getGroupElement(a)).join("")
        as.forEach(a=>{
          delete a.details
        })
        return r
      }
      return ""
    }
    
    function getTimeout(v){
      v=v.match(/[0-9]+: (timeout in ms:([0-9]+))/)||""
      if(v&&v[2]!="0"){
        v=" (⏱ "+v[1]+")"
      }else{
        v=""
      }
      return v
    }

    function isIgnoreContent(x){
      return x.match(/[0-9]+: (timeout in ms:[0-9]+| +>+| +<+|.+\/api\/coop\/.+|End time\:|Start time\: [0-9\:\- ]+)$/)
    }

    function retrieveActionData(v,p,testbz){
      let x=v.match(/^([0-9]+)\: \#\#Action.*\#\# \(([0-9\/mt\-c]+|tmp)\)\, *(.*)/)

      let name=x[3],type,flash,screenshot;
      if(name.match(/^(Set |Typing |Check )/)){
        type="keyboard"
      }else{
        type=name.split(/[ :]/)[0].toLowerCase()
        if(type.match(/validate/)){
          type="validate"
        }else if(type=="group"||["given","when","then"].includes(name.toLowerCase())){
          type="group"
          if(v.includes("Auto-one-action-group")){
            flash=1
          }
        }else if(type=="script"){
          if(v.includes("attachScreenshotToReport")){
            screenshot=1
          }
        }else if(type.match(/^(double|click|extract|refresh|call|load|hover|mousedown|mouseup|mousemove|drag|dragdrop)( |$)/)){
          
        }else if(type.match(/execute api/)){
          type="api"
        }else if(type.match(/Re-Initialize/i)){
          type="refresh"
        }else{
          type="call"
        }
        if(v.includes("in Single action group")){
          flash=1
        }
      }
      
      let idx=x[2].split("/").pop(),
          timeout=getTimeout(p)
      return {
        code:"action-"+formatter.getIdx(),
        name:`(${idx}) ${name}`+timeout,
        type:type,
        result:"success",
        start:formatter.retrieveTimeFromLog(p),
        details:p,
        level:"action",
        bz:testbz+"/"+idx
      }
    }
    
    function buildSimpleContent(e,v,mark){
      e.html(formatter.strToHtml(v,mark))
    }
  },
  getSpendTime:function(st,et,ckKey){
    if(!et){
      return 0
    }
    et=formatter.strToTime(et)-formatter.strToTime(st)
    if(et<0){
      et= 0
    }
    if(ckKey&&et>formatter.data.setting[ckKey]){
      et+="s <span class='bz-mini-letter'>⚠️</span>"
    }else{
      et+="s"
    }
      
    return et
  },
  retrieveTimeFromLog:function(v){
    v=v.match(/\[ ([0-9\:]+) (\(([0-9\:]+), ([0-9]+)s\) \++) *\]/)||[]
    let fd=formatter.data,t=fd.exeTime||""
    v=v[3]||""
    
    if(v.length>t.length||(v.length==t.length&&v>t)){
      fd.exeTime=v
    }
    formatter.element.header.find(".bz-timer").text(fd.exeTime+` (${parseInt((fd.successScenarios+fd.failedScenarios)/(fd.totalScenarios||(fd.successScenarios+fd.failedScenarios))*100)}%)`)
    return v
  },
  splitByWord:function(v,k,keepKeyInFirst){
    if(k.constructor!=String){
      k=v.match(k)
      if(k){
        k=k[0]
      }else{
        return
      }
    }
    let s=k.length
    k=v.indexOf(k)
    if(keepKeyInFirst){
      k+=s
    }
    return [v.substring(0,k).trim(),v.substring(k).trim()]
  },
  strToTime:function(s){
    s=s||"0"
    let v=0,p=[3600,60,1]
    s=s.split(":")
    while(s.length){
      v+=s.pop()*p.pop()
    }
    return v
  },
  openIDE:function(v,k){
    let fd=formatter.data,url=fd.startUrl
    if(k&&k!="master"){
      k=parseInt(k)+2
      url=url.replace(/key=1/,"key="+k)
    }

    formatter.openWindow(url+v.replace(".","/"),"bz-master",`width=${screen.availWidth/2},height=${screen.availHeight}`)
  },
  getPageInfo:function(x,sendResponse){
    let c=$("a[href=consoleFull]")[0]
    let o=$(".console-output")[0]
    sendResponse({
      full:c&&1,
      log:o&&1,
      pop:1
    })
  },
  removeDoingInfo:function(){
    let o=document.getElementsByClassName("bz-loading-info")[0]
    if(o){
      o.remove()
    }
  },
  showDoing:function(v){
    let o=document.getElementsByClassName("bz-doing-text")[0]
    if(o){
      o.innerText=v
      return
    }
    o=document.createElement("div");
    o.className="bz-loading-info"
    o.style.position="fixed";
    o.style.top="30px";
    o.style.right="15px";
    o.style.zIndex=100000;
    o.style.backgroundColor="#FFF"
    o.style.border="5px solid #00F"
    o.style.borderRadius="10px";
    o.style.padding="20px 30px";
    o.style.fontSize="25px";
    o.style.display="flex";

    o.innerHTML=`
        <div class="bz-icon bz-running-large"></div>
        <div class="bz-doing-text" style="line-height:45px;">${v}</div>
    `;
    formatter.loadingInfo=o
    document.body.append(o)
    return 1
  },
  getSetting:function(){
    let v;
    try{
      v=localStorage.getItem("bz-log-format");
      if(v){
        v=JSON.parse(v)
      }
    }catch(e){}
    v=v||{}
    if(!v.scenarioTime){
      v.scenarioTime=180
      v.testTime=60
    }
    
    v.account=v.account||{}
    return v
  },
  attachQuickLogClick:function(){
    setTimeout(()=>{
      if(!$(".duration").length){
        return formatter.attachQuickLogClick()
      }
      let cancelClick
      $("body").on("click",function(e){
        if(cancelClick){
          return
        }
        setTimeout(()=>{
          if($(".stage-logs").length){
            cancelClick=1
            $(".stage-logs").click()
            setTimeout(()=>{
              $(".glyphicon-collapse-down:eq(1)").click()
              finalClick()
            },1000)
          }
        },1000)
      })
    },1000)

    function finalClick(){
      setTimeout(()=>{
        let url=$(".model-link--float:last").attr("href")
        if(url){
          location.href=url+`consoleFull`
        }else{
          finalClick()
        }
      },1000)
    }
  },
  autoLoading:function(){
    let v=formatter.getSetting();
    if(v.autoFormat){
      if(formatter.isMasterPage(v)){
        return formatter.exeFormag(v,Date.now())
      }else if(location.href.match(/\/jenkins[.]/)){
        formatter.insertCss()
        if(location.href.match(/jenkins[.].+\/job[\/]/)){
          if(!location.href.match(/\/[0-9]+[\/]/)){
            formatter.attachQuickLogClick()
          }
        }
      }
    }
    formatter.chkXray(v);
    setTimeout(()=>{
      formatter.exeCITests()
    },1000)
  },
  chkXray:function(v){
    v=v||formatter.getSetting();
    if(v&&v.account&&v.account.xray&&location.href.includes(v.account.xray)){
      let vv=location.href.match(/(\/browse[\/]|\&selectedIssue=|\&issueKey=)([^&\/]+)/)
      if(vv){
        vv=vv[2]
        vv=vv.replace("/","")
        if((v.account.tags||{})[vv]){
          formatter.formatXray(v.account.tags[vv])
        }
      }
    }
  },
  formatXray:function(k,ok){
    setTimeout(()=>{
      if($("#bz-play")[0]){
        return
      }
      let d=formatter.getSetting().account;
      let host=d.server
      if(host=="oth"){
        host=d.othServer
      }
      if(window.$){
        if(!ok){
          return formatter.formatXray(k,1)
        }
        let o=$("[data-testid=xray-test-type-select]")[0]
        if(!o){
          return
        }
        o=o.parentElement.parentElement.parentElement
        o=$(`
        <span style="position: absolute;right: 0;z-index: 100000000000;margin-top:25px;">
          <button id='bz-play' title='Execute the scenario in Jenkins' style='${d.jk?'':'display:none;'}background-image: url(${host}/ci/jk.ico);height: 20px;width: 20px;background-size: 15px;border: 0;background-repeat: no-repeat;background-position: center;background-color: transparent;float: right;margin: 3px;color:red;font-size: 10px;padding-top: 5px;padding-left: 23px;'>▶</button>
          <button id='bz-ide' title='Open the scenario in Boozang IDE' style='background-image: url(${host}/favicon.ico);height: 20px;width: 20px;background-size: 15px;border: 0;background-repeat: no-repeat;background-position: center;background-color: transparent;float: right;margin: 5px;'></button>
        </span><div class='bz-pop-panel' style='display:none;position: absolute;margin-top: 50px;right: 0;background-color: rgb(0, 0, 0);padding: 20px 5px 5px;border-radius: 5px;border: 1px solid rgb(153, 153, 153);z-index: 10;box-shadow: rgb(0 0 0 / 40%) 2px 2px 9px;background-position: right 5px top 5px;background-size: 11px;z-index: 1111111111;'><div class='bz-box'></div></div>`).insertAfter(o.parentElement)
        let url=formatter.joinUrl(host,"extension?id="+d.project+"#"+d.project,d.version,k)
        o.find("#bz-play").click(function(e){
          e.stopPropagation()
          
          formatter.doJKPlay([k],d.version,d.jk,d.jkJob,60)
        })
        o.find("#bz-ide").click(function(e){
          e.stopPropagation()
          formatter.openWindow(url)
        })
        o.find("#bz-ide,#bz-play").focus(function(){
          $(this).blur()
        })
      }else{
        formatter.formatXray(k,ok)
      }
    },1000)
  },
  joinUrl:function(){
    return Object.values(arguments).map(x=>x.replace(/\/$/,"")).join("/")
  },
  isMasterPage:function(v){
    if(v.identifyMaster){
      try{
        let f;
        eval("f="+v.identifyMaster)
        return f()
      }catch(ex){
        alert("Identify page script issue: "+ex.message)
      }
    }
  },
  lineClear:function(v){
    let f=formatter.data.setting.lineClear
    if(f){
      if(f.constructor==String){
        eval("f="+f)
        formatter.data.setting.lineClear=f
      }
      return f(v)
    }
    return v
  },
  copyText:function(w){
    let el =$("<textarea readonly style='position:absolute;left:-9999px'></textarea>").appendTo(document.body);
    let v=(w.innerText||"").trim().replace(/^[0-9]+\: /,"")
    if(v.includes("==>")){
      v=v.split("==>")[1]
    }
    if(v.includes(" = ")){
      v=v.split(" = ")[1]
    }

    let vv=v.match(/https?:\/\/.+/)
    v=vv?vv[0]:v
    el.val(v)
    el.select();
    document.execCommand('copy');
    el.remove();


    let _range = new Range(),
        _sel = w.ownerDocument.defaultView.getSelection();
        _sel.removeAllRanges();
        _range.collapse(true);
    _range.setStart(w, 0);
    _range.setEnd(w, 1);
    _sel.addRange(_range);
    setTimeout(()=>{
      _sel.removeAllRanges();
    },100)
  },
  download:function(){
    let os=Object.values(formatter.data.scenarioMap)
    os=os.filter(x=>$("#"+x.code).css("display")!="none").sort((a,b)=>{
      return a.idx-b.idx
    })
    let w=os.map(x=>{
      return x.declare.org.trim()+"\n"+x.init.org.trim()+"\n"+x.details.org.trim()+"\n"+x.end.org.trim()
    }).join("\n")
    w=formatter.data.project.init.org.trim()+"\n"+w+"\n"+formatter.data.project.end.org
    w=`<!DOCTYPE html>
       <html>
       <head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8'></head>
       <body>
       <pre>${w}</pre>
       </body>
       </html>`;
    var a=$("<a></a>");
    $(document.body).append(a[0]);
    a.attr("download","Boozang-log.html").attr("href","data:application/octet-stream," + encodeURIComponent(w))[0].click();
    a.remove();
  },
  loadTextFromFiles:function(_files,_fun){
    let _reader = new FileReader(),
        rs=[];
    

    function _readFile(i) {
      if( i >= _files.length ) {
        return _fun(rs);
      }
      var _file = _files[i];
      _reader.onload = function(e) {  
        rs.push(e.target.result);
        _readFile(i+1)
      }
      _reader.readAsText(_file);
    }
    _readFile(0);

    _reader.onerror = function() {
      alert(_bzMessage._system._error._importFileError,_reader.error);
    };
  },
  getCameraPath:function(v){
    let fd=formatter.data
    return location.protocol+fd.host.replace(/^https?:/,"")+"/screenshot/"+fd.project.code+"/"+v+".jpg?token="+fd.token
  },
  showCompare:function(){
    let o=$(".bz-pop-panel");
    if(o.attr("type")=="compare"){
      return o.show()
    }else{
      o.attr({type:"compare"})
    }
    o.find("div.bz-box").html(`
      <div class="bz-row-high">
        <label><input checked type="radio" value="net-scope" name="load"/>Load log files from network</label>
      </div>
      <div class="bz-row-high load-option" id="net-scope">
        <label style="margin-left:20px;">Log URL/No.<input type="text" id="net-log" placeholder="Split by comma to compare multiple logs"/></label>
      </div>
      <div class="bz-row-high">
        <label><input type="radio" name="load" value="file-scope"/>Load log files from local</label>
      </div>
      <div class="bz-row-high load-option" id="file-scope" style="display:none">
        <input type="file" id="file-log" multiple/>
      </div>
      <div class="bz-row-high" style="margin-top:10px;text-align:center;">
        <button id="compare-btn" class="std">Compare</button>
      </div>`)
    setTimeout(()=>{
      $("input#net-log").focus()
    },100)
    $("#net-log").keydown(function(e){
      if(e.keyCode==13){
        doCompare()
      }
    })
    $("input[type=file]").change(function(){
      let idx=1
      formatter.data.errHashMap={}
      formatter.loadTextFromFiles(this.files,function(fs){
        if(fs){
          analyzeLogs([{
            key:idx++,
            list:fs
          }])
        }
      })
    })
    $("#compare-btn").click(()=>{
      doCompare()
    })
    $("[name=load]").click(function(){
      $(".load-option").hide()
      $("#"+this.value).show()
    })
    o.show()
    function doCompare(){
      if($("[name=load]:checked").val()=="net-scope"){
        loadFromNet()
      }else{
        compare()
      }
    }
    
    function compare(vs){
      analyzer.doAnalysis(vs)
    }
    
    function mergeModuledata(vs){
      
    }

    function loadFromNet(){
      let vs=$("#net-log").val().split(",")
      vs=vs.map(x=>{
        if($.isNumeric(x)){
          return {
            key:x,
            list:[]
          }
        }else{
          return {
            key:1,
            url:x,
            list:[]
          }
        }
      })
      loadLogs(vs,0,function(){
        formatter.data.errHashMap={}
        analyzeLogs(vs)
      })
    }
    
    function loadLogs(vs,i,fun){
      let v=vs[i]
      if(v){
        let masterUrl=v.url||location.href.replace(/\/[0-9]+[\/]/,"/"+v.key+"/")
        loadLogByUrl(masterUrl,function(vv){
          if(!vv){
            return alert("Load log failed! Please be sure the url/no. is correct.")
          }
          v.list.push(vv)
          if(!v.url){
            vv=formatter.getLogList(masterUrl)
            loadPages(vv,0,function(vvv){
              v.list.push(...vvv)
              loadLogs(vs,i+1,fun)
            })
          }else{
            fun(vs)
          }
        })
      }else{
        fun(vs)
      }
    }
    
    function loadPages(vs,i,fun){
      let v=vs[i]
      if(v){
        loadLogByUrl(v,function(r){
          vs[i]=r;
          loadPages(vs,i+1,fun)
        })
      }else{
        fun(vs)
      }
    }
    
    function loadLogByUrl(v,fun){
      formatter.showDoing("Loading log ...")
      $.ajax({
        method:"GET",
        url:v,
        success:function(r){
          fun(r)
          formatter.removeDoingInfo()
        }
      })
    }
    
    function analyzeLogs(vs){
      try{
        vs.forEach(x=>{
          let v=x.list.join("\n")
          x.list={}
          Object.values(formatter.data.errHashMap).forEach(y=>{
            delete y[x.key]
          })
          
          let ts=analyzer.getTestTreeByLevel(v,0)
          ts=ts.map((y,i)=>{
            if(i%2){
              return {start:ts[i-1],end:ts[i]}
            }
          }).filter(x=>x).forEach(y=>{
            let s=y.end.match(/<+ ([^ ]+) [^\[]+(\[((m[0-9]+).(t[0-9]+))\(?([0-9]+)?\)?\] )([0-9:]+) ([^<]+) Tasks:/)
            s={
              result:s[1].toLowerCase(),
              title:s[2]+" "+s[8],
              code:s[3],
              m:s[4],
              t:s[5],
              idx:parseInt(s[6]||0),
              name:s[8],
              start:y.start.match(/\(([0-9:]+)\) >>>>$/)[1],
              end:s[7]
            }
            s.time=parseInt(formatter.getSpendTime(s.start,s.end))
            y=v.split(y.end)
            v=y[1]
            if(s.result!="stopped"){
              analyzer.addAnalyzeData(x.list,s,formatter.data.scenarioAnaMap,x.key);
              // formatter.data.scenarioAnaMap[s.code].nodes[s.idx].term[x.key]=s
              
              analyzer.retrieveAnalyzeData(x.key,x.list,y[0],1,s)
              if(s.result=="failed"){
                analyzer.retrieveErrHash(x.key,y[1])
              }
            }
          })
        })
        compare(vs)
      }catch(ex){
        console.log(ex.stack)
        alert(ex.message)
      }
    }
  },
  showCameraPanel:function(){
    let o=$(".bz-pop-panel")
    if(o.attr("type")=="camera"){
      return o.show()
    }else{
      o.attr({type:"camera"})
    }
    let w=""
    formatter.cameraList.forEach(x=>{
      w+=`<div class='bz-row bz-title-text' style='margin:5px 0'><img class='bz-mini-img' src='${formatter.getCameraPath(x)}'/> ${x}</div>`
    })
    o.find("div.bz-box").html(`<div style='overflow:auto;max-height:${window.innerHeight-250}px;padding:5px;background-color:#111;'>${w}<div>`)
    o.find("img").click(function(){
      formatter.openWindow(this.src,"_blank")
    })
    o.show()
  },
  sort:function(o){
    let k=o[0].id.split("-").pop(),w=1
    if(o.hasClass("bz-z-a")){
      o.removeClass("bz-z-a")
      o.addClass("bz-a-z")
    }else if(o.hasClass("bz-a-z")){
      o.removeClass("bz-a-z")
      o.addClass("bz-z-a")
      w=-1
    }else{
      let os=$(".bz-sort-bar button")
      os.removeClass("bz-a-z")
      os.removeClass("bz-z-a")
      o.addClass("bz-a-z")
    }
    

    let os=formatter.element.panel.children().sort((a,b)=>{
      a=formatter.data.scenarioMap[a.id]
      b=formatter.data.scenarioMap[b.id]

      if(k=="idx"||k=="time"){
        return parseInt(a[k]||0)>parseInt(b[k]||0)?w:0-w
      }else{
        return a[k]>b[k]?w:0-w
      }
    })
    formatter.element.panel.append(os)
    document.documentElement.scrollTop=0
  },
  getWorkerSize:function(os){
    try{
      let ws=new Set(os.map(x=>{
        return x.code.split("-").pop()
      }))
      return [...ws].length
    }catch(ex){
    }
    return 1
  },
  doPlay:function(){
    let os=[];
    $(".bz-chk-replay:checked").toArray().filter(x=>x.getBoundingClientRect().width).forEach(x=>{
      while(!$(x).hasClass("bz-level-scenario")&&x.tagName!="BODY"){
        x=x.parentElement
      }
      x=formatter.data.scenarioMap[x.id]
      os.push(x)
    })
    formatter.doJKPlay(os,formatter.data.version,"//"+location.host,location.pathname.split("/")[2],formatter.data.testreset)
  },
  exeCITests:function(){
    let v=localStorage.getItem("ciTests")
    if(v){
      v=JSON.parse(v)
      if(v.href!=location.href){
        return
      }
      localStorage.removeItem("ciTests");
      
      for(let i in document.forms[1].name){
        if((i+"").match(/^[0-9]+$/)){
          let n=document.forms[1].name[i]
          if(v[n.value]){
            document.forms[1].value[i].value=v[n.value]
          }
        }
      }
      document.getElementsByClassName("jenkins-button--primary")[0].click()
      
    }
  },
  doJKPlay:function(os,version,host,p,testreset){
    let o=$(".bz-pop-panel"),
        tn=decodeURI(p),
        ws=formatter.getWorkerSize(os)
    o.attr({type:"play"})
    let dd={};
    formatter.data.startUrl.split("?")[1].split("&").forEach(x=>{
      x=x.split("=")
      dd[x[0]]=x[1]
    })
    let d={
      task:tn,
      branch:version,
      workers:ws,
      number:dd.number,
      test:os.map(x=>{
        x=(x.code||x).split("-")
        while(x.length>2){
          x.pop()
        }
        return x.join(".")
      }).join(","),
      href:location.protocol+host+"/job/"+encodeURI(tn)+"/build?delay=0sec"
    }

    let template=localStorage.getItem("ciTemplate")
    if(template){
      template=JSON.parse(template)
      d.href=template.href||d.href
    }

    o.find(".bz-box").html(`
      <div style="padding:0 10px;${os[0].constructor==String?'display:none':''}">Do you want to play the below selected scenarios?</div>
      <fieldset style="margin:5px 5px 10px 5px;${os[0].constructor==String?'display:none':''}">
        <legend>Scenario list</legend>
        <div class='bz-play-list'>
          <div>${os.map(x=>x.title).join("</div><div>")}</div>
        </div>
      </fieldset>
      <div class="bz-form" style='margin:5px'>
        <textarea id="parameters" style="width:100%;height:150px;">${JSON.stringify(d,0,2)}</textarea>
      </div>
      <div style="text-align: center;margin: 15px 0 10px 0;">
        <button class='bz-play-btn std' style='border-radius: 10px;background-color:transparent;border: 1px solid #33F;padding: 2px 15px;line-height: 20px;cursor: pointer;'>Start</button>
        <button class='bz-cancel' style='border-radius: 10px;background-color:transparent;border: 1px solid #33F;padding: 2px 15px;line-height: 20px;cursor: pointer;'>Cancel</button>
      </div>
    `)
    o.show()
    o.mousedown(function(e){
      e.stopPropagation()
    })
    
    $(".bz-cancel").click(function(){
      $(".bz-pop-panel").hide()
    })
    
    $(".bz-play-btn").click(function(){
      try{
        let v=$("#parameters").val()
        let parameters=JSON.parse(v)
        
        localStorage.setItem("ciTests",v)
        localStorage.setItem("ciTemplate",v)
        location.href=parameters.href
      }catch(ex){
        alert(ex.message)
      }
      return
    })
    function startWorks(d,pn){
      o.find(".bz-box").html(`<form method="post" target="_blank" name="parameters" action='${host}/job/${pn}/build?delay=0sec'>
      ${d.parameters.map(x=>`<div name="parameter"><input name='name' type='hidden' value="${x.name}"/><input name='value' type='hidden' value="${x.value}"/></div>`)}
      <input name='statusCode' type='hidden' value="303"/>
      <input name='redirectTo' type='hidden' value="."/>
      <input type="hidden" name="json" value="init"/>
      <span name="name">
        <button type="button">Build</button>
      </span>
      </form>`)
      $(".bz-box input[name=json]").val(JSON.stringify(d))
      $(".bz-box form").submit()
      o.find(".bz-box").html("")
      o.hide()
    }
  },
  search:function(v,scope){
    $(".bz-search-input").val(v)
    let fd=formatter.data
    if(formatter.searching){
      return
    }
    formatter.searching=1
    formatter.showFailedOnlyResult()
    if(!v){
      formatter.searching=0
      formatter.removeAllHighlight()
      return formatter.closeAll()
    }
    formatter.showDoing("Searching ...")
    document.documentElement.scrollTop=0

    return setTimeout(()=>{
      doSearch(v,scope)
    })
    
    
    function doSearch(){
      try{
        if(v[0]!='"'&&v[0]!="'"){
          if(v.match(/^[\/].+[\/][i]?$/)){
            v=eval(v)
          }else{
            v=v.toLowerCase().split(",")
          }
        }else{
          v=JSON.parse(v).toLowerCase()
        }
      }catch(ex){
        v=v.toLowerCase().split(",")
        alert("This is not a correct regular expression!")
      }
      preFilter(v)

      if(v&&v.constructor==Array&&v.length==1&&v[0].constructor==String){
        if(v[0].match(/^[a-f0-9]{32}$/)){
          formatter.removeDoingInfo()
          formatter.searching=0
          $(".bz-result.bz-failed").toArray().find(x=>{
            if(x.getBoundingClientRect().width){
              $(x).click()
              return 1
            }
          })
          formatter.chkReplay()
          return
        }
      }
      formatter.removeAllHighlight()
      if(!scope){
        scope=[formatter.element.init,...formatter.element.panel.find(".bz-level-scenario").toArray().filter(x=>$(x).css("display")!="none"),formatter.element.end]
      }
      let vs=[],inModuleFilter,mf=[];
      
      if(v.constructor==Array&&v[0].match(/^m[0-9]+([\.\/]t[0-9])?$/)){
        scope.forEach(x=>{
          x=$(x).find(".bz-line,.bz-title-text").toArray()
          x.forEach(y=>{
            let pos=y.innerHTML.indexOf(v[0])
            if(pos>=0){
              mf.push({pos:pos,w:v[0],element:y})
              vs.push(y)
            }
          })
        })
        v.shift()
        scope=[]
        vs.forEach(x=>{
          if($(x).hasClass("bz-title-text")){
            scope.push(...$(x.parentElement.nextElementSibling).find(".bz-line,.bz-title-text,.bz-time,button").toArray())
          }
        })
        inModuleFilter=1
      }
      
      scope.forEach(x=>{
        if(inModuleFilter){
          x=[x]
        }else{
          x=$(x).find(".bz-line,.bz-title-text,.bz-time,button").toArray()
        }
        x.forEach(y=>{
          if(v.constructor==Array){
            let fs=[]
            mf.find((q,qi)=>{
              if(q.element==y){
                fs.push(q)
                mf.splice(qi,1)
                return 1
              }
            })
            v.forEach((z,j)=>{
              let zz=z.split(" "),fz=[]
              if(!zz.find(zi=>{
                if(!zi){
                  return
                }

                let pos=y.innerHTML.toLowerCase().indexOf(zi)
                if(pos>=0){
                  fz.push({pos:pos,w:zi})
                }else{
                  return 1
                }
              })){
                fs.push(...fz)
              }
            })
            if(fs.length){
              fs.sort((a,b)=>{
                return b.pos-a.pos
              })
              fs.forEach(z=>{
                formatter.highlight(y,z.w,z.pos)
              })
              vs.push(y)
            }
          }else if(v.constructor==String){
            let pos=y.innerHTML.toLowerCase().indexOf(v)
            if(pos>=0){
              formatter.highlight(y,v,pos)
              vs.push(y)
            }
          }else{
            let w=y.innerHTML.match(v)
            if(w){
              w=w[0]
              let pos=y.innerHTML.indexOf(w)
              formatter.highlight(y,w,pos)
              vs.push(y)
            }
          }
        })
      })
      mf.forEach(x=>{
        formatter.highlight(x.element,x.w,x.pos)
      })
      formatter.closeAll()
      vs.forEach(x=>{
        formatter.openItem(x)
      })
      vs=$(".bz-line,.bz-level-action").toArray()
      vs.forEach(x=>{
        if(!$(x).find(".bz-search-highlight")[0]){
          $(x).hide()
        }
      })

      formatter.element.panel.children().toArray().forEach(x=>{
        if(!$(x).find(".bz-search-highlight").length){
          $(x).hide()
        }
      })

      formatter.removeDoingInfo()
      formatter.searching=0
      formatter.chkReplay()
    }
    
    function preFilter(v){
      let os=Object.values(fd.scenarioMap).filter(x=>x.result=="failed"||!fd.failedOnly)

      if(v.constructor==Array){
        v=v.map((x,i)=>{
          let xx;
          if(!i){
            xx=x.match(/(scenario|test) (.+)/)
            if(xx){
              v[i]=xx[1]
              xx="Loading .+ ("+xx[1].replace(/ /g,"|")+")"
            }else{
              xx=x.match(/(m[0-9]+[\.\/]t[0-9]+)(.*)/)
              if(xx){
                v[i]=xx[1]
                let xxx=(xx[2]||"").trim()
                xx="Loading .+ \\["+xx[1]
                if(xxx){
                  v.splice(i+1,0,xxx)
                }
              }
            }
            if(xx){
              eval("xx=/"+xx+"/i")
              os=os.filter(x=>{
                if(!foundTxt(x,xx)){
                  formatter.hideScenario(x)
                }else{
                  return 1
                }
              })
            }else{
              xx=x.match(/action[: ](.+)/)
              if(xx){
                v[i]=xx[1]
                xx=xx[1].split(" ").sort((a,b)=>a.length-b.length).pop()
                xx="##Action[^#]*## .*"+xx

                eval("xx=/"+xx+"/i")
                os=os.filter(x=>{
                  if(!x.details.org.match(xx)){
                    formatter.hideScenario(x)
                  }else{
                    return 1
                  }
                })
              }
            }
          }
          if(!xx){
            x=x.split(" ")
            x.sort((a,b)=>b.length-a.length)
            return x[0].replace(/([^a-z0-9])/gi,"\\$1")
          }
        }).filter(x=>x).join("|")
        if(v){
          eval("v=/"+v+"/i")
        }
      }else if(v.constructor==String){
        os=os.filter(x=>{
          if(includeTxt(x,v)){
            return 1
          }else{
            formatter.hideScenario(x)
          }
        })
        v=0
      }
      if(v){
        os=os.filter(x=>{
          if(!foundTxt(x,v)){
            formatter.hideScenario(x)
          }else{
            return 1
          }
        })
      }
      formatter.buildAllDetails(os.map(x=>x.code))
    }
    
    function foundTxt(x,f){
      if(x.title.match(f)){
        return 1
      }
      if(x.init.org){
        if(x.init.org.match(f)){
          return 1
        }
      }
      if(x.declare.org){
        if(x.declare.org.match(f)){
          return 1
        }
      }
      if(x.details.org){
        if(x.details.org.match(f)){
          return 1
        }
      }
      if(x.end.org){
        if(x.end.org.match(f)){
          return 1
        }
      }else if(x.org){
        return x.org.match(f)
      }
    }

    function includeTxt(x,f){
      if(x.title.toLowerCase().includes(f)){
        return 1
      }
      if((x.init.org||"").toLowerCase().includes(f)){
        return 1
      }
      if((x.declare.org||"").toLowerCase().includes(f)){
        return 1
      }
      if((x.details.org||"").toLowerCase().includes(f)){
        return 1
      }
      if(x.end.org){
        if(x.end.org.toLowerCase().includes(f)){
          return 1
        }
      }else if(x.org){
        return x.org.toLowerCase().includes(f)
      }
    }
  },
  hideScenario:function(o){
    if(o.element){
      o.details.element.html("");
      o.init.panel.innerHTML=""
      o.declare.panel.innerHTML=""
      o.end.element.html("")
      o.switcher.removeClass("bz-open")
      $(o.element.find(".bz-panel")[0]).hide()
      o.element.find(".bz-level-init,.bz-level-declare").addClass("bz-hide")
      o.element=0
    }
    $("#"+o.code).hide()
  },
  removeAllHighlight:function(){
    let os=$(".bz-search-highlight").toArray()
    os.forEach(x=>{
      if(x.parentElement){
        x.parentElement.innerHTML=x.parentElement.innerHTML=x.parentElement.innerText
      }
    })
  },
  highlight:function(o,v,pos){
    let w=$(o).html()
    v=w.substring(pos,pos+v.length)
    w=w.replace(v,`<span class='bz-search-highlight'>${v}</span>`)
    $(o).html(w)
  },
  closeAll:function(){
    $(".bz-scope .bz-switch.bz-open,.bz-scope .bz-cross.bz-open").click()
  },
  openItem:function(v){
    try{
      while(!$(v).hasClass("bz-level-scenario")){
        if($(v).hasClass("bz-hide")){
          $(v).removeClass("bz-hide")
        }else if($(v).css("display")=="none"){
          $(v).show()
        }
        if($(v).hasClass("bz-panel")){
          $(v.previousElementSibling).find(".bz-switch").addClass("bz-open")
        }
        v=v.parentElement
      }
    }catch(e){}
  },
  keepLogMap:function(k){
    formatter.logMap[k]=formatter.logMap[k]||{}
    formatter.logMap[k].curLastScenario=formatter.data.curLastScenario
    formatter.logMap[k].curEnd=formatter.data.curEnd
  },
  takeLogMap:function(k){
    formatter.logMap[k]=formatter.logMap[k]||{}
    formatter.data.curLastScenario=formatter.logMap[k].curLastScenario
    formatter.data.curEnd=formatter.logMap[k].curEnd
    formatter.data.curWorker=k
  },
  getIdx:function(){
    return formatter.idx++
  }
};

var analyzer={
  setting:{
    percentage:0.1,
    second:5,
    missTest:1,
    diffResult:1,
    diffScenario:1,
    tab:"scenario"
  },
  //mp: module map, ap: analysis map, ct: scenario/test
  addAnalyzeData:function(mp,ct,ap,key){
    let d=createNode(mp,ct.m,{testMap:{}})
    d=createNode(d.testMap,ct.t,{list:[]})
    if(ct.scenario){
      d.list.unshift(ct)
    }else{
      d.list.push(ct)
    }

    if(ap){
      let d=createNode(ap,ct.code,{
        name:ct.name,
        code:ct.code,
        type:"scenario",
        nodes:[]
      })
      d=createNode(d.nodes,ct.idx,{code:ct.idx,term:{},nodes:[]})
      d.term[key]={
        result:ct.result,
        time:parseInt(ct.time)
      }
    }
    
    function createNode(p,k,o){
      p[k]=p[k]||o
      return p[k]
    }
  },
  retrieveAnalyzeData:function(term,mp,log,level,scenario){
    //last level list
    let lls,cls
    while(1){
      let ts=analyzer.getTestTreeByLevel(log,level++),ct,lt,lts=0
      if(!ts.length){
        break
      }
      lls=cls
      cls=[]
      for(let i=0;i<ts.length;i++){
        let t=ts[i]
        if(!ct){
          let c=t.match(/([0-9]+)[^\[]+\[(m[0-9]+)\.(t[0-9]+).*\] - (.+) \(([0-9:]+)\) >>>>$/)
          if(!c){
            return alert("Analyze data failed! Please report the issue to Boozang customer support. Thanks!")
          }
          ct={
            startLine:parseInt(c[1]),
            m:c[2],
            t:c[3],
            code:c[2]+"."+c[3],
            name:c[4],
            start:c[5],
            from:scenario.code,
            scenario:!level
          }
        }else{
          let c=t.match(/([0-9]+): +<<<< ([^ ]+) [^\]]+\] ([0-9:]+) [^<]+ <<<</s),
              m=ct.m
          if(!c){
            i--
            ct.stop=1
            ct=0
            continue
          }
          ct.endLine=parseInt(c[1]),
          ct.end=c[3]
          ct.result=c[2].toLowerCase()
          
          ct.time=parseInt(formatter.getSpendTime(ct.start,ct.end))
          
          if(ct.time>formatter.data.setting.testTime){
            ct.slow=scenario.key
          }
          //check repeat
          if(lt&&lt.code==ct.code&&lt.from==ct.from){
            lts++
            if(lts>5){
              ct.repeat=scenario.key
            }
          }else{
            lts=0
            lt=ct
          }
          
          let ns

          if(lls&&lls.length){
            while(lls[0].endLine<ct.startLine){
              lls.shift()
              if(!lls.length){
                return
              }
            }
            if(lls[0].startLine<ct.startLine){
              ns=lls[0].nodes
            }
          }else{
            ns=formatter.data.scenarioAnaMap[scenario.code].nodes[scenario.idx].nodes
          }
          let d={code:ct.code,name:ct.name,nodes:[],term:{}};
          d.term[term]={
            result:ct.result,
            time:parseInt(ct.time)
          }

          if(!ns.find(x=>{
            if(!x.term[term]&&x.code==ct.code){
              x.term[term]=d.term[term]
              ct.nodes=x.nodes
              return 1
            }
          })){
            if(!ns.find((x,j)=>{
              if(!x.term[term]){
                ns.splice(j,0,d)
                return 1
              }
            })){
              ns.push(d)
            }
            ct.nodes=d.nodes
          }

          cls.push(ct)
          analyzer.addAnalyzeData(mp,ct)

          ct=0
        }
      }
    }
    return 1
  },
  doAnalysis:function(compare){
    let fd=formatter.data,
        o=$(".bz-pop-panel")
        
    if(o.attr("type")=="analyze"){
      if(compare){
        o.attr({type:"compare"})
      }else{
        return o.show()
      }
    }else if(!compare){
      o.attr({type:"analyze"})
    }
    if(!compare){
      fd.scenarioAnaMap={}
    }
    analyzer.moduleData={}
    analyzer.buildMasterAnalysisData()
    analyzer.buildModuleData("master",fd.moduleMap);
    if(compare){
      compare.forEach(x=>{
        analyzer.buildModuleData(x.key,x.list)
      })
      analyzer.curCompareTabs=compare.map(x=>x.key)
      analyzer.curCompareTabs.unshift("master")
      
      
    }else{
      analyzer.curCompareTabs=0
    }
    
    analyzer.showAnalyzePanel(compare&&"diff")
  },
  identifyDiffData:function(compare){
    let tabs=[],as=analyzer.setting
    tabs.push(...analyzer.curCompareTabs)
    tabs.shift()

    for(let k in analyzer.moduleData){
      let m=analyzer.moduleData[k]
      isDiffOnMissing(m)
      m.ts.forEach(x=>{
        isDiffOnMissing(x)
        if(!x.diff){
          isDiffItem(x,m)
        }
      })
    }
    analyzer.initAnaTopData()

    for(let k in formatter.data.scenarioAnaMap){
      setDiffInNodes(formatter.data.scenarioAnaMap[k])
    }
    
    function setDiffInNodes(m,p){
      if(m.nodes&&m.nodes.length){
        m.nodes.forEach(x=>{
          setDiffInNodes(x,m)
          if(m.diff&&m.diff.constructor==Array){
            if(m.term){
              m.diff.forEach(y=>{
                if(p){
                  p.diff=m.diff
                }
              })
            }
          }else if(p){
            if(p.term){
              for(let k in m.term){
                if(m.term[k].diff){
                  p.term[k].diff=p.term[k].diff||new Set()
                  let xx=[]
                  xx.push(...m.term[k].diff)
                  xx.forEach(y=>p.term[k].diff.add(y))
                }
              }
            }else if(m.diff){
            }
          }
        })
      }
      m.hide=0
      if(m.term){
        let master=m.term.master
        if(!master){
          if(analyzer.setting.missTest){
            for(let k in m.term){
              m.diff=1
              m.term[k].diff=1
            }
            if(p){
              p.diff=Object.keys(m.term)
            }
          }
        }else{
          if(!tabs.find(x=>{
            if(!m.term[x]){
              if(analyzer.setting.missTest){
                master.diff=1
                if(p){
                  p.diff=["master"]
                }
              }
              return 1
            }
          })){
            if(!isDiffItem(m,p)&&p&&p.type=="scenario"&&analyzer.setting.diffScenario){
              if(!analyzer.setting.showAll){
                m.hide=1
              }else{
                m.hide=0
              }
            }
          }
        }
      }
    }
    
    
    function isDiffItem(m,p){
      let mm=m.term.master,hasDiff;
      tabs.forEach(x=>{
        let t=m.term[x]
        if(as.diffResult){
          if(t.success!=mm.success){
            setDiff(t,"success")
            hasDiff=1
          }
          if(t.failed!=mm.failed){
            setDiff(t,"failed")
            hasDiff=1
          }
          if(t.result!=mm.result){
            setDiff(t,t.result)
            hasDiff=1
          }
        }
        if(t.average){
          if(isDiffTime(t.average,mm.average)){
            setDiff(t,"time")
            hasDiff=1
          }
        }else{
          if(isDiffTime(t.time,mm.time)){
            setDiff(t,"time")
            hasDiff=1
          }
        }
        if(t.diff&&p&&p.term){
          if(!hasDiff&&p&&p.type=="scenario"&&analyzer.setting.diffScenario){
            delete t.diff
          }else{
            if(!p.term[x].diff||p.term[x].diff.constructor!=Set){
              p.term[x].diff=new Set();
            }
            t=[...t.diff]

            t.forEach(y=>p.term[x].diff.add(y))
          }
        }
      })
      return hasDiff
    }
    
    function setDiff(x,v){
      x.diff=x.diff||new Set()
      x.diff.add(v)
    }

    function isDiffOnMissing(m){
      if(!m.term.master){
        m.diff=1
        for(let k in m.term){
          m.term[k].diff=1
        }
      }else{
        tabs.forEach(x=>{
          if(!m.term[x]){
            m.diff=1
            m.term.master.diff=1
          }
        })
      }
    }
    function isDiffTime(a,b){
      let v=Math.abs(a-b)
      let p=Math.max(v/a,v/b)
      if(v>as.second&&p>as.percentage){
        return 1
      }
    }
  },
  showDiffSetting:function(){
    let as=analyzer.setting,
        o=$(".bz-pop-panel")
    o.attr({type:""})
    o.find("div.bz-box").html(`
      <div style="margin:10px 20px">
        <h3 style="margin-left:5px;">Diff tool config</h3>
        <label style="margin-left:5px;">Show differences when</label> 
        <br/><br/>
        <label style="margin-left:5px;">Execution time differs more than <input type="number" id="percentage"> percent (%)</label>
        <br/><br/>
        <label style="margin-left:5px;">Ignore execution time differences up to <input type="number" id="second"> seconds (s)</label>
        <br/><br/>
        <label><input type="checkbox" id="diffScenario">Compare on scenario-level only</label>
        <br/><br/>
        <label><input type="checkbox" id="diffResult">Test result changes (Pass <-> Fail)</label>
        <br/><br/>
        <label><input type="checkbox" id="missTest">Missing test case</label>
      </div>
      <div style="text-align: center;margin: 15px 0 10px 0;"><button class="std">Run diff</button></div>
    `)
    
    $("#diffResult").attr({checked:!!as.diffResult})
    $("#missTest").attr({checked:!!as.missTest})
    $("#diffScenario").attr({checked:!!as.diffScenario})
    $("#second").val(as.second)
    $("#percentage").val(as.percentage*100)

    $("#diffResult").click(function(){
      as.diffResult=this.checked
    })
    $("#missTest").click(function(){
      as.missTest=this.checked
    })
    $("#diffScenario").click(function(){
      as.diffScenario=this.checked
    })
    $("#second").change(function(){
      as.second=this.value
    })
    $("#percentage").change(function(){
      as.percentage=this.value/100
    })
    $(".std").click(function(){
      analyzer.showAnalyzePanel("diff")
    })
  },
  clearDiff:function(d){
    for(let k in d){
      let m=d[k]
      m.diff=0
      clearTerm(m)

      if(m.ts){
        m.ts.forEach(x=>{
          clearTerm(x)
        })
      }
    }
    function clearTerm(m){
      for(let k in m.term){
        m.term[k].diff=0
      }
      if(m.nodes){
        m.nodes.forEach(x=>{
          clearTerm(x)
        })
      }
    }
    for(let k in formatter.data.scenarioMap){
      let s=formatter.data.scenarioMap[k]
      s.analyzed=0
    }
  },
  initAnaTopData:function(){
    for(let k in formatter.data.scenarioAnaMap){
      let m=formatter.data.scenarioAnaMap[k]
      
      m.nodes.forEach(y=>{
        for(let k in y.term){
          if(y.term[k].result=="success"){
            m.term[k].success++
          }else{
            m.term[k].failed++
          }
          m.term[k].time+=y.term[k].time
        }
      })
      for(let k in m.term){
        m.term[k].average=parseInt(m.term[k].time/(m.term[k].success+m.term[k].failed))
      }
    }
  },
  showAnalyzePanel:function(compare){
    let fd=formatter.data,
        o=$(".bz-pop-panel"), 
        compareScope="",
        compareTerm="",
        tabs=["master"]
    if(compare){
      tabs=[...analyzer.curCompareTabs]
    }
    analyzer.clearDiff(analyzer.moduleData);
    analyzer.clearDiff(formatter.data.scenarioAnaMap)
    for(let k in fd.scenarioAnaMap){
      let m=fd.scenarioAnaMap[k]
      m.term={}
      tabs.forEach(x=>{
        m.term[x]={success:0,failed:0,time:0}
      })
    }

    if(compare){
      analyzer.identifyDiffData(compare)
      let ks=analyzer.curCompareTabs
      compareScope=`
        <div>
          <label style='line-height: 40px;margin-right: 20px'><input type="checkbox" id="showAll" ${analyzer.setting.showAll&&"checked"}/> Show all</label>
        </div>
        <div style="margin:8px ​10p;">
          <button class="bz-icon bz-setting"></button>
        </div>`;
      compareTerm=`
        <div class="bz-term-bar ${analyzer.setting.tab!='hash'?'':'bz-in-hash'}">
          <div style="flex:1;"></div>
          ${ks.map(x=>`<div class="bz-term-title">${x}</div>`).join("")}
        </div>
      `
    }else{
      analyzer.initAnaTopData()
    }
    let md=analyzer.moduleData
    o.find("div.bz-box").html(`
      <div class="bz-tab-bar">
        <a class="bz-tab ${analyzer.setting.tab=='scenario'&&'bz-active'}" id="tab-scenario">Scenarios</a>
        <a class="bz-tab ${analyzer.setting.tab=='feature'&&'bz-active'}" id="tab-feature">Features</a>
        <a class="bz-tab ${analyzer.setting.tab=='module'&&'bz-active'}" id="tab-module">Modules</a>
        <a class="bz-tab ${analyzer.setting.tab=='hash'&&'bz-active'}" id="tab-hash">Error Hash</a>
        <div style="flex:1;"></div>
        ${compareScope}
      </div>
      ${compareTerm}
      <div class="bz-tab-panel bz-panel-tab-module" style='max-height:${window.innerHeight-250}px;${analyzer.setting.tab!='module'&&'display:none;'}'>
        ${getModuleResult(md,"test")}
      </div>
      <div class="bz-tab-panel bz-panel-tab-feature" style='max-height:${window.innerHeight-250}px;${analyzer.setting.tab!='feature'&&'display:none;'}'>
        ${getModuleResult(md,"scenario")}
      </div>
      <div class="bz-tab-panel bz-panel-tab-scenario" style='max-height:${window.innerHeight-250}px;${analyzer.setting.tab!='scenario'&&'display:none;'}'>
        ${getScenarioResult()}
      </div>
      <div class="bz-tab-panel bz-panel-tab-hash" style='max-height:${window.innerHeight-250}px;${analyzer.setting.tab!='hash'&&'display:none;'}'>
        ${getHashList()}
      </div>`)
    o.find(".bz-switch2").click(function(e){
      let pp=$(this.parentElement.nextElementSibling)
      if($(this).hasClass("bz-open")){
        $(this).removeClass("bz-open")
        pp.hide()
      }else{
        $(this).addClass("bz-open")
        pp.show()
      }
    })
    $("#showAll").click(function(){
      analyzer.setting.showAll=this.checked
      analyzer.showAnalyzePanel("diff")
    })
    $(".bz-tab").click(function(){
      $(".bz-tab").removeClass("bz-active")
      $(this).addClass("bz-active")
      $(".bz-tab-panel").hide()
      $(".bz-panel-"+this.id).show()
      analyzer.setting.tab=this.id.split("-").pop()
      if(this.id=="tab-hash"){
        $(".bz-term-bar").addClass("bz-in-hash")
      }else{
        $(".bz-term-bar").removeClass("bz-in-hash")
      }
    })
    o.show()

    $(".bz-setting").click(function(){
      analyzer.showDiffSetting()
    })
    
    function getHashList(){
      let headers=[]
      if(!compare){
        Object.keys(formatter.data.errHashMap).filter(x=>formatter.data.errHashMap[x].master).forEach(x=>{
          let d=formatter.data.errHashMap[x]
          formatter.data.errHashMap[x]={
            master:d.master,
            msg:d.msg
          }
        })
      }else{
        headers=new Set()
        Object.values(formatter.data.errHashMap).forEach(x=>Object.keys(x).filter(x=>$.isNumeric(x)).forEach(y=>headers.add(parseInt(y))))
        headers=[...headers]
        headers.sort()
      }
      
      let os= Object.keys(formatter.data.errHashMap);
      os.sort((a,b)=>{
        return formatter.data.errHashMap[a].msg>formatter.data.errHashMap[b].msg?1:-1
      })
      return os.map(k=>{
        let d=formatter.data.errHashMap[k]
        let ds=headers.map(x=>`<div class="bz-hash-val">${d[x]||""}</div>`).join("")
        return `
          <div class="bz-row" style="border-bottom:1px solid #CCC;padding:2px;">
            <div style="flex:1;"><span class="bz-hash-title bz-search-content">${k}</span><br/><span class="bz-hash-msg bz-line">${d.msg}</span></div>
            <div class="bz-hash-val">${d.master||""}</div>
            ${ds}
          </div>`
      }).join("")
    }
    
    function getModuleResult(md,type){
      let vs=Object.values(md)
      let w=vs.filter(x=>x.ts.find(y=>y.type==type)).map(x=>{
        return `
          <div class="${getSameClass(x)}">
            <div class='bz-row'>
              <button class='bz-mini-icon bz-switch bz-switch2'></button>
              <div class="bz-title-text" style="line-height:25px;">
                [${x.code}] ${x.name||""} (Tests: ${x.ts.length})
              </div>
              ${sortTerm(x).map((z,i)=>{
                return `
                  <span class='bz-icon bz-icon-col bz-mini-icon-letter bz-timer2 ${getDiffClass(x,z,i,"time")}' style='width:100px;'>${z.time}s</span>
                  <span class='bz-icon bz-icon-col bz-mini-icon-letter ${z.success?"bz-success":""} ${getDiffClass(x,z,i,"success")}'>${z.success||""}</span>
                  <span class='bz-icon bz-icon-col bz-mini-icon-letter ${z.failed?"bz-failed":""} ${getDiffClass(x,z,i,"failed")}'>${z.failed||""}${z.warn}</span>
                `
              }).join("")}
            </div>
            <div class='bz-panel bz-hide'>
              ${x.ts.map(x=>getTestResult(x,type)).join("")}
            </div>
            <hr class="${getSameClass(x)}"/>
          </div>
        `
      }).join("")
      return w
    }
    
    function getSameClass(x){
      if(compare&&!analyzer.setting.showAll){
        for(let k in x.term){
          if(x.term[k].diff){
            return ""
          }
        }
        return "bz-same-item"
      }
      return ""
    }

    function getTestResult(x,type){
      return `
        <div class="bz-row ${getSameClass(x)}">
          <div class='bz-title-text' style='margin-left:20px;'>
            <div class="bz-mini-icon bz-${type}"></div> [${x.code}] ${x.name}
          </div>
          ${sortTerm(x).map((z,i)=>{
            return `
              <span class='bz-icon bz-icon-col bz-mini-icon-letter bz-timer2 ${getDiffClass(x,z,i,"time")}2' style='width:100px;'>${z.time}s / ${z.average}s</span>
              <span class='bz-icon bz-icon-col bz-mini-icon-letter ${z.success?"bz-success":""} ${getDiffClass(x,z,i,"success")}2'>${z.success||""}</span>
              <span class='bz-icon bz-icon-col bz-mini-icon-letter ${z.failed?"bz-failed":""} ${getDiffClass(x,z,i,"failed")}2'>${z.failed||""}${z.warn}</span>
            `
          }).join("")}
        </div>
      `
    }
    
    function getDiffClass(s,m,i,kk){
      if(compare){
        let c="",//"bz-diff-item",
            c1="bz-diff-item1"
            
        for(let k in s.term){
          let x=s.term[k]
          if(x.diff){
            if(x.diff.constructor==Set){
              if(x.diff.has(kk)){
                let vs=[]
                for(let j in s.term){
                  vs.push(s.term[j][kk])
                }
                vs.sort((a,b)=>{
                  if(a>b){
                    return 1
                  }else{
                    return -1
                  }
                })

                if(kk=="success"){
                  vs.reverse()
                  if(vs[0]==m[kk]){
                    return c1
                  }
                }else if(kk=="failed"){
                  if(vs[0]==m[kk]){
                    return c1
                  }
                }else if(kk=="result"){
                  if(m[kk]=="success"){
                    return c1
                  }
                }else if(kk=="time"){
                  if(vs[0]==m[kk]){
                    return c1
                  }else{
                    m.persentage=parseInt((m[kk]-vs[0])/vs[0]*100)+"%"
                  }
                }
              }
            }else{
              return "bz-diff-item"
            }
            return ""
          }
        }
      }
      return ""
    }
    
    function sortTerm(o){
      return Object.keys(o.term).sort((a,b)=>{
        if(a=="master"){
          return -1
        }else if(b=="master"){
          return 1
        }else{
          return a>b?1:-1
        }
      }).map(x=>o.term[x])
    }
    
    function getScenarioResult(){
      return Object.values(fd.scenarioAnaMap).filter(x=>x).map(x=>{
        let ns=x.nodes.filter(u=>!u.hide)
        if(ns.length){
          let xx=Object.assign({},x)
          xx.nodes=ns
          return xx
        }
      }).filter(x=>x).map(x=>getNodeView(x,compare?0:"master")+`<hr class="${getSameClass(x)}"/>`).join("")
    }
    
    function getNodeView(s,k){
      return `
        <div class='bz-node ${getSameClass(s)}'>
          <div class="bz-row bz-node-title-bar">
            <button class="bz-mini-icon bz-switch bz-switch2 ${s.nodes.length?'':'bz-none'}"></button>
            <div class="bz-mini-icon bz-${s.name?s.type||"test":"hide"}"></div>
            <div class="bz-title-text">${s.name?"["+s.code+"] ":""}${s.name||s.code}</div>
            ${sortTerm(s).map((x,i)=>{
              if(s.type=="scenario"){
                return `<div style="width:100px;" class="${getDiffClass(s,x,i,"time")}2 bz-icon bz-icon-col bz-mini-icon-letter bz-icon-col bz-timer2">${x.time?x.time+"s / "+x.average+"s":""}</div>
                        <div class="${getDiffClass(s,x,i,"success")}2 bz-mini-icon-letter bz-icon-col bz-${x.success?'success':''}">${x.success||""}</div>
                        <div class="${getDiffClass(s,x,i,"failed")}2 bz-mini-icon-letter bz-icon-col bz-${x.failed?'failed':''}">${x.failed||""}</div>`
              }else{
                return `<div style="width:100px;" class="${getDiffClass(s,x,i,"time")}2 bz-icon bz-icon-col bz-mini-icon-letter bz-icon-col bz-timer2">${x.time}s${x.persentage?' ('+x.persentage+')':''}</div>
                        <div class="${getDiffClass(s,x,i,"success")}2 bz-mini-icon-letter bz-icon-col bz-success ${x.result=="success"?'':'bz-none'}"></div>
                        <div class="${getDiffClass(s,x,i,"failed")}2 bz-mini-icon-letter bz-icon-col bz-failed ${x.result=="success"?'bz-none':''}"></div>`
              }
            }).join("")}
          </div>
          <div class="bz-node-panel bz-hide">
            ${s.nodes.map(x=>getNodeView(x,k)).join("")}
          </div>
        </div>${!s.name?`<hr class="${getSameClass(s)}"/>`:""}`
        
    }
  },
  buildModuleData:function(key,map){
    analyzer.moduleData=analyzer.moduleData||{}
    let fd=formatter.data,ad=analyzer.moduleData;
    for(let m in map){
      let mm=map[m]
      let tm=mm.testMap
      let ts=Object.values(tm)
      
      ad[m]=ad[m]||{
        code:m,
        name:mm.name,
        ts:[],
        term:{}
      }
      let rm=ad[m]
      let tts=rm.ts
      
      rm=rm.term[key]=rm.term[key]||{
        success:0,
        failed:0,
        total:0,
        time:0,
        warn:""
      }
      

      ts.forEach(x=>{
        rm.total+=x.list.length
        let t={
          term:{}
        },slow=new Set(),repeat=new Set()
        
        t.term[key]={
          success:0,
          failed:0,
          time:0,
          average:0,
          warn:"",
          slow:"",
          repeat:""
        }
        let tt=t.term[key]
        x.list.forEach(y=>{
          if(!t.type){
            if(y.scenario){
              t.type="scenario"
            }else{
              t.type="test"
            }
            t.name=y.name
            t.code=y.code
          }
          if(y.result!="failed"){
            tt.success++
          }else{
            tt.failed++
          }
          tt.time+=parseInt(y.time)
          if(y.slow){
            slow.add(y.slow)
          }
          if(y.repeat){
            repeat.push(y.repeat)
          }
        })
        tt.average=parseInt(tt.time/(tt.success+tt.failed))
        slow=[...slow]
        repeat=[...repeat]
        if(slow.length){
          slow=slow.map(x=>getScenarioTitle(x))
          tt.slow="Slow in scenarios:\n"+slow.join("\n")
        }
        if(repeat.length){
          repeat=repeat.map(x=>getScenarioTitle(x))
          tt.repeat="Too many repeat in scenarios:\n"+repeat.join("\n")
        }
        tt.msg=(tt.slow+"\n\n"+tt.repeat).trim()

        if(tt.msg){
          tt.warn=`<span class='bz-mini-letter' title='${tt.msg}'>⚠️</span>`
          rm.warn="<span class='bz-mini-letter'>⚠️</span>"
        }
        
        if(!tts.find(y=>{
          if(y.code==x.list[0].code){
            y.term[key]=t.term[key]
            return 1
          }
        })){
          tts.push(t)
        }
        rm.success+=tt.success
        rm.failed+=tt.failed
        rm.time+=tt.time
      })
    }
    
    function getScenarioTitle(x){
      let o=fd.scenarioMap[x]
      if(o){
        return o.title
      }else{
        return x
      }
    }
  },
  buildMasterAnalysisData:function(){
    let fd=formatter.data;
    let mp=fd.moduleMap

    for(let k in fd.scenarioMap){
      let s=fd.scenarioMap[k]
      if(!s.analyzed){
        if(!s.time){
          s.time=formatter.getSpendTime(s.start,s.endTime)
        }
        let sc=s.code.split("-")
        let cs={
          m:sc[0],
          t:sc[1],
          w:sc.pop(),
          code:`${sc[0]}.${sc[1]}`,
          name:s.name,
          idx:parseInt(sc[2]||0),
          title:s.title,
          time:parseInt(s.time),
          slow:parseInt(s.time)>parseInt(fd.setting.scenarioTime)?s.code:0,
          scenario:1,
          result:s.result
        }
        
        analyzer.addAnalyzeData(mp,cs,fd.scenarioAnaMap,"master")
        formatter.loadModuleInfo(s.init.org);
        formatter.loadModuleInfo(s.details.org);

        s.analyzed=analyzer.retrieveAnalyzeData("master",mp,s.details.org,1,cs)
        
        s.bug&&analyzer.retrieveErrHash("master",s.bug)
      }
    }
  },
  getTestTreeByLevel:function(v,level){
    let r;
    if(level){
      r=`/[0-9]+: {${level*6+3}}(>+ Loading |<+ )[^\[]*Test \\[m[0-9]+\\.t[0-9]+[^><]+(>|<)+/gms`
    }else{
      r=`/[0-9]+: +(>+ Loading |<+ [^\[]+ Feature - )Scenario \\[m[0-9]+\\.t[0-9]+[^><]+(>|<)+/gms`
    }
    r=eval(r)
    return v.match(r)||[]
  },
  retrieveErrHash:function(k,v){
    let h,msg;
    if(v.constructor==Object){
      h=v.hash
      msg=v.msg.match(/Failed on Action: m[0-9]+.+$/m)||[""]
    }else{
      h=v.match(/\[Error Hash\: ([0-9A-F]+)\] \((.+)\)/)
      if(h){
        h=h[1]
      }
      msg=v.match(/Failed on Action: m[0-9]+.+$/m)||[""]
    }

    msg=msg[0]

    formatter.data.errHashMap[h]=formatter.data.errHashMap[h]||{msg:msg}
    formatter.data.errHashMap[h][k]=formatter.data.errHashMap[h][k]||0
    formatter.data.errHashMap[h][k]+=1
  }
}

setTimeout(()=>{
  formatter.autoLoading()
  window.onresize=function(){
    formatter.chkXray()
  }
},100)

let lastUrl = location.href; 
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    formatter.autoLoading()
  }
}).observe(document, {subtree: true, childList: true});