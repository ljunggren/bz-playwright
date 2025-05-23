var bzFormat;
let defaultCode={
  identifyWorker:`function(){
  let k=location.href.match(/[\/]([0-9]+)[\/]/)[1];
  return [2,3].map(x=>{
    return location.href.replace(k+"/consoleFull","ws/out_"+k+"_"+x+".log")
  })
}`,
  lineClear:`function(line){
  return (line||"").replace(/^[0-9]{4}-[^ ]+ /,"");
}`
}
$("#home").click(()=>{
  chrome.tabs.create({url: "https://boozang.com"});
})
$("#ide").click(()=>{
  let p=bzFormat.account.project,
      v=bzFormat.account.version;
  
  chrome.tabs.create({url: getServerUrl()+`/extension?id=${p}#${p}/${v}/`})
})
$("#formatPage").click(()=>{
  bzFormat.gotoOrg=0
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    bzFormat.forceFormat=tabs[0].url
    updateSetting(()=>{
      chrome.tabs.reload(tabs[0].id);
    })
  });
});
$("#orgPage").click(()=>{
  chrome.tabs.query({active: true, currentWindow: true}, function(v){
    bzFormat.gotoOrg=1
    bzFormat.forceFormat=0
    updateSetting(()=>{
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.reload(tabs[0].id);
      });
    })
  });
})
$(".bz-tab").click(function(){
  $(".bz-panel").hide()
  if(this.id=="infoTab"){
    $("#info-panel").show()
  }else if(this.id=="logTab"){
    $("#log-panel").show()
  }else if(this.id=="ciTab"){
    $("#ci-panel").show()
  }
  $(".bz-tab").removeClass("bz-active")
  $(this).addClass("bz-active")
  
  bzFormat.defTab=this.id.replace("Tab","")
  updateSetting()
});
$(".bz-refresh-code").click(function(e){
  resetCode(this.attributes['code'].value)
})
// function getPageInfo(){
//   chrome.tabs.query({active: true, currentWindow: true}, function(v){
//     chrome.runtime.sendMessage({ pop:1,fun:"getPageInfo",data:v[0].id},(v)=>{
//       console.log(v)
//     });
    
//   });
// }

function init(){
  debugger
  // var image = document.createElement("img");
  // image.src = chrome.runtime.getURL("img/boozang128.png");
  // document.getElementsByTagName("body")[0].appendChild(image);
  var version = "4.0.0";
  $("#version").text("Version: "+ version);
  chrome.storage.sync.get("bz-log-format",function(d){
    console.log("data:")
    console.log(JSON.stringify(d))
    if(!d||!Object.keys(d).length){
      bzFormat={
        account:{},
        defTab:"info",
        scenarioTime:180,
        testTime:60,
        actionTime:3,
        declareTime:6,
        initTime:2,
        autoFormat:false,
        lineClearChk:false,
        withToken:false,
        retrieveWorkerLog:false
      }
    }
    if(d["bz-log-format"]){
      bzFormat=JSON.parse(d["bz-log-format"])
    }

bzFormat.identifyWorker=bzFormat.identifyWorker||defaultCode.identifyWorker
bzFormat.lineClear=bzFormat.lineClear||defaultCode.lineClear


    if(!bzFormat.scenarioTime){
      bzFormat.scenarioTime=180
      if(bzFormat.testTime==180){
        bzFormat.testTime=60
      }
    }
    $("#autoFormat").attr("checked",bzFormat.autoFormat);
    $("#lineClearChk").attr("checked",bzFormat.lineClearChk);
    $("#withToken").attr("checked",bzFormat.withToken);
    
    $("#retrieveWorkerLog").attr("checked",bzFormat.retrieveWorkerLog);
    
    $("#lineClear").val(bzFormat.lineClear)
    $("#identifyWorker").val(bzFormat.identifyWorker)
    $("#scenarioTime").val(bzFormat.scenarioTime);
    $("#testTime").val(bzFormat.testTime);
    $("#declareTime").val(bzFormat.declareTime);
    $("#initTime").val(bzFormat.initTime);
    $("#actionTime").val(bzFormat.actionTime)
    bzFormat.account=bzFormat.account||{}
    updateSetting()
    $("#scenarioTime,#testTime,#declareTime,#initTime,#actionTime,#lineClear,#identifyWorker").blur(function(){
      updateSetting()
    })
    $("#autoFormat,#retrieveWorkerLog,#lineClearChk,#withToken").click(function(){
      updateSetting()
    })
    $("#login").click(function(){
      let v=bzFormat.account.server
      if(v=="oth"){
        v=bzFormat.account.othServer
      }
      chrome.tabs.create({url: (v.replace(/[\/]$/,"")+"/?force=1")});
    })
    if(bzFormat.defTab=="log"){
      $("#logTab").click()
    }else if(bzFormat.defTab=="ci"){
      $("#ciTab").click()
    }else{
      $("#infoTab").click()
    }

    if(!bzFormat.account){
      bzFormat.account={}
    }
    initAccount()
  })


  $("#server").change(function(){
    $("#oth-server").hide()
    $("#oth-server").val("")

    if(!this.selectedIndex){
      $("#login").hide()
      $("#projects-box").hide()
      $("#versions-box").hide()
    }else if(this.value=="oth"){
      $("#oth-server").show()
    }
    bzFormat.account.server=this.value
    initAccount()
  })

  $("#oth-server").change(function(){
    bzFormat.account.othServer=this.value
    initAccount()
  })

  $("#projects").change(function(){
    bzFormat.account.project=this.value
    if(this.value){
      $("#versions-box")[0].style.display="flex"
      loadBranch()
    }else{
      $("#versions-box").hide()
    }
    bzFormat.account.version=""
    updateSetting()
  })
  
  $("#versions").change(function(){
    bzFormat.account.version=this.value
    refreshTags()
    updateSetting()
  })

  $("#xray").change(function(){
    bzFormat.account.xray=this.value
    updateSetting()
  })

  $("#jk").change(function(){
    bzFormat.account.jk=this.value
    updateSetting()
  })
  $("#jkJob").change(function(){
    bzFormat.account.jkJob=this.value
    updateSetting()
  })
  
  $("#tags").click(function(){
    refreshTags()
  })

}

function joinUrl(){
  let vs=Object.values(arguments)
  if(vs.find(x=>!x)===undefined){
    return vs.map(x=>x.replace(/\/$/,"")).join("/")
  }
}

function refreshTags(){
  let url=joinUrl(getServerUrl(),"api/projects",bzFormat.account.project,"versions",bzFormat.account.version,"tags")
  if(!url){
    return
  }
  $.ajax({
    url:url,
    method:"GET",
    success:function(vs){
      bzFormat.account.tags=vs
      updateSetting()
      showTags()
    },
    error:function(){
      bzFormat.account.tags=[]
      updateSetting()
      $("#tags").hide()
    }
  })
}
function showTags(){
  let vs=bzFormat.account.tags||{}
  $("#tags").text(Object.keys(vs).length+" tags")
  $("#tags").show()
}
function getServerUrl(){
  let url=bzFormat.account.server
  if(url=="oth"){
    url=bzFormat.account.othServer
    $("#oth-server").show()
  }
  if(url){
    url=url.replace(/[\/]$/,"")
  }
  return url
}

function initAccount(){
  let url=getServerUrl()
  $("#server").val(bzFormat.account.server)
  $("#oth-server").val(bzFormat.account.othServer)
  $("#projects").val(bzFormat.account.project)
  $("#versions").val(bzFormat.account.version)
  $("#xray").val(bzFormat.account.xray)
  $("#jk").val(bzFormat.account.jk)
  $("#jkJob").val(bzFormat.account.jkJob)
  if(url){
    url+="/api/projects"
    $.ajax({
      url:url,
      method:"GET",
      success:function(ps){
        if(!ps||ps.constructor!=Array){
          return this.error()
        }
        $("#login").hide()
        $("#projects").html(`<option value="" class='bz-empty-option'>[select ...]</option>${ps.map(x=>`<option value='${x.code}' ${x.code==bzFormat.account.project?'selected':''}>${x.name}</option>`).join("")}`)
        $("#projects-box")[0].style.display="flex"
        $("#projects").val(bzFormat.account.project)
        if(bzFormat.account.project){
          loadBranch()
        }
      },
      error:function(){
        bzFormat.account.projects=0
        $("#login").show()
        $("#projects-box").hide()
        $("#versions-box").hide()
      }
    });
  }else{
    $("#login").hide()
    $("#projects-box").hide()
    $("#versions-box").hide()
  }
  
  if(bzFormat.account.version){
    $("#ide").show()
    showTags()
  }else{
    $("#ide").hide()
    $("#tags").hide()
  }

  updateSetting()
}

function loadBranch(){
  let url=getServerUrl()+"/api/projects/"+bzFormat.account.project+"/versions"
  $.ajax({
    url:url,
    method:"GET",
    success:function(vs){
      vs=vs.filter(x=>!x.code.match(/-auto-[0-9]+$/));
      $("#versions").html(`<option value="" class='bz-empty-option'>[select ...]</option>${vs.map(x=>`<option value='${x.code}' ${x.code==bzFormat.account.version?'selected':''}>${x.code}</option>`).join("")}`);
      $("#versions-box")[0].style.display="flex"
    },
    error:function(){
      $("#versions-box").hide()
      alert("Retrive branch failed!")
    }
  })
}

function resetCode(k){
  bzFormat[k]=defaultCode[k]
  $("#"+k).val(bzFormat[k])
  updateSetting()
}

function updateSetting(_fun){
  bzFormat.autoFormat=$("#autoFormat")[0].checked
  bzFormat.lineClearChk=$("#lineClearChk")[0].checked
  bzFormat.withToken=$("#withToken")[0].checked
  
  bzFormat.lineClear=$("#lineClear").val()
  if(bzFormat.autoFormat){
    $("#pageScriptPanel").show()
  }else{
    $("#pageScriptPanel").hide()
  }
  if(bzFormat.lineClearChk){
    $("#lineClearScriptPanel").show()
  }else{
    $("#lineClearScriptPanel").hide()
  }

  bzFormat.retrieveWorkerLog=$("#retrieveWorkerLog")[0].checked
  bzFormat.identifyWorker=$("#identifyWorker").val()
  if(bzFormat.retrieveWorkerLog){
    $("#workerScriptPanel").show()
  }else{
    $("#workerScriptPanel").hide()
  }
  bzFormat.scenarioTime=$("#scenarioTime").val()
  bzFormat.testTime=$("#testTime").val()
  bzFormat.declareTime=$("#declareTime").val()
  bzFormat.initTime=$("#initTime").val()
  bzFormat.actionTime=$("#actionTime").val()
  chrome.storage.sync.set({"bz-log-format":JSON.stringify(bzFormat)})

  if(bzFormat.account.version){
    $("#ide").show()
  }else{
    $("#ide").hide()
  }
  setTimeout(()=>{
    _fun&&_fun()
  },100)
}
init();
// getPageInfo();
