

const options = require('node-options');
const Service = require('./logService').Service;

// Command defaults
const opts = {
  "verbose" : false,
  "file": "report",
  "listscenarios":"",
  "listsuite":"",
  "device" : "",
  "screenshot": false,
  "token":"",
  "userdatadir":"",
  "width":1280,
  "height":1024,
  "docker": false,
  "sleep":0,
  "keepalive": false,
  "video": "none",
  "testreset":false,
  "loglevel": "debug",
  "debugIDE":false,
   proxy:false
}

// Remove the first two arguments, which are the 'node' binary and the name
// of your script.
const result = options.parse(process.argv.slice(2), opts);
console.log("Result: ",result);
const verbose = opts.verbose;
const token = opts.token;
const docker = opts.docker;
let userdatadir = opts.userdatadir;
const width = opts.width;
const height = opts.height;
const listscenarios=opts.listscenarios;
const listsuite=opts.listsuite;

const debugIDE=opts.debugIDE;
const sleep=opts.sleep;
const proxy=opts.proxy;

let keepalive=opts.keepalive;
let testReset=opts.testreset;
let inService;
const file = opts.file;
const logLevel=opts.loglevel;

const video = opts.video;

if (result.errors || !result.args || result.args.length !== 1) {
  console.log('USAGE: boozang [--token] [--docker] [--keepalive] [--testreset] [--verbose] [--userdatadir] [--listscenarios] [--listsuite] [--width] [--height] [--screenshot] [--file=report] [--proxy] [url]');
  process.exit(2);
}

console.log("Running with following args");
console.log(opts);
console.log("Example: Use --verbose for verbose logging (boolean example). Use --width=800 to override default width (value example.)");

let LogLevelArray = ["error","warning","info","debug","log"];
if (logLevel === "error"){
  LogLevelArray = ["error"]
} else if (logLevel === "warning"){
  LogLevelArray = ["error","warning"]
} else if (logLevel === "info"){
  LogLevelArray = ["error","warning","info"]
}

console.log("Setting log levels: ", LogLevelArray);

let browser,page;

Service.setResetButton(function(s){
  start(1)
});
Service.debugIDE=debugIDE;
function start(reset){
  (async () => {
    
    let file = (docker ? "/var/boozang/" : "");
    if (opts.file){
      file += opts.file;
    }

    let userdatadir = "";
    if (opts.userdatadir){
      userdatadir = (docker ? "/var/boozang/userdatadir" : "") + (opts.userdatadir || "");
      console.log("Setting userdatadir: " + userdatadir);
    }

    let url = result.args[0],tests;
    let token=url.match(/[\&\?]token=[^\&]*/)
    if(!token){
      console.log("Missing token in the url: "+url)
      process.exit(2)
      return
    }else if(token[0].length!=63){
      console.log("Bad Token: "+url)
      process.exit(2)
      return
    }
    if ((!opts.screenshot) && (!opts.listscenarios) && typeof (url) == 'string' && !url.endsWith("/run") && url.match(/\/m[0-9]+\/t[0-9]+/)) {
      if (!url.endsWith("/")) {
        url += "/"
      }
      url += "run"
    }
    console.log("Url: ", url, reset);

    if(reset){
      url=url.replace(/\/run$/,"/")
    }else if(url.endsWith("/run")){
      tests=url.match(/\/(m[mt0-9\.,]+)\/run/)
      if(tests){
        tests=tests[1]
        console.log("tests: "+tests)
        url=url.replace(/\/(m[mt0-9\.,]+)\/run/,"")
      }
    }
  
    url=url.replace("#","&docker=1#")
    
    let inService=0;
    console.log("Browser URL: "+url)
    if(url.match(/(\?|\&)key=.+(\&|\#)/)){
      console.log("Running in cooperation!")
      inService=1
    }else{
      console.log("Running in stand alone!")
    }



    //const version = await page.browser().version();
    //console.log("Running Chrome version: " + version);  const response = await page.goto(url);
    console.log("Login by url with TOKEN: ", url);
    Service.logMonitor({testReset,keepalive,file,inService,LogLevelArray,width,height,video,userdatadir});
    Service.startIDE({url:url,tests:tests,listsuite:listsuite,listscenarios:listscenarios})

  })()
}

setTimeout(()=>{
  start()
},sleep*1000)


if(proxy){
  startProxy()
}

function startProxy(){
  const express = require('./proxy/express')
  let port=parseInt(proxy)
  if(!port||port<80){
    port=8080
  }
  express(port);
}
