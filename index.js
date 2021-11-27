(async () => {

const { chromium } = require('playwright');
const options = require('node-options');
const { saveVideo } = require('playwright-video');
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
  "userdatadir":"userdata",
  "width":1280,
  "height":1024,
  "docker": false,
  "keepalive": false,
  "video": "none"
}

// Remove the first two arguments, which are the 'node' binary and the name
// of your script.
const result = options.parse(process.argv.slice(2), opts);
const verbose = opts.verbose;
const token = opts.token;
const docker = opts.docker;
let userdatadir = opts.userdatadir;
const width = opts.width;
const height = opts.height;
const listscenarios=opts.listscenarios;
const listsuite=opts.listsuite;
const keepalive=opts.keepalive;
const video = opts.video;
let file = opts.file;

if (result.errors || !result.args || result.args.length !== 1) {
  console.log('USAGE: node index [--token] [--docker] [--keepalive] [--verbose] [--userdatadir] [--listscenarios] [--listsuite] [--width] [--height] [--video] [--file=report] [url]');
  process.exit(2);
}

console.log("Running with following args");
console.log(opts);
console.log("Example: Use --verbose for verbose logging (boolean example). Use --width=800 to override default width (value example.)");


  file = (docker ? "/var/boozang/" : "") + opts.file;
  /** 
  if (!userdatadir) {
    userdatadir = "ud_" + Date.now();
    console.log("Generating unique user-data-dir: ", userdatadir);
  } 
  */

  const launchargs = [
    '--disable-extensions-except=' + __dirname + '/bz-extension',
    '--load-extension=' + __dirname + '/bz-extension',
    '--ignore-certificate-errors',
    '--no-sandbox',
    `--window-size=${width},${height}`,
    '--defaultViewport: null',
    ];

  const browser = await chromium.launchPersistentContext(userdatadir,{
    headless: false,
    args: launchargs,
    launchType: "PERSISTENT"
  });

  function printStackTrace(app,err){
    console.error(
      "\n#######################################\n"
    + app + " error: " + err.message
    + "\n#######################################\n"
    );   
  }

  function appPrintStackTrace(err){
    printStackTrace("app",err);
  }

  function idePrintStackTrace(err){
    printStackTrace("ide",err);
  }



  // Setup popup
  /**let popup = null;
  function setupPopup() {
    popup = pages[pages.length-1]; 
    popup.setViewportSize({
      width: parseInt(width),
      height: parseInt(height)
    });

    
    Service.setPopup(popup)
  }
  */

  const page = await browser.newPage();
  
  let url = result.args[0];
  if ((!opts.screenshot) && (!opts.listscenarios) && typeof (url) == 'string' && !url.endsWith("/run") && url.match(/\/m[0-9]+\/t[0-9]+/)) {
    if (!url.endsWith("/")) {
        url += "/"
    }
    url += "run"
  }
  let inService=0;
  console.log("Browser URL: "+url)
  if(url.match(/(\?|\&)key=.+(\&|\#)/)){
    console.log("Running in cooperation!")
    inService=1
  }else{
    console.log("Running in stand alone!")
  }

  page.on('popup', async popup => {
    popup.on("error", appPrintStackTrace);
    popup.on("pageerror", appPrintStackTrace);
    popup.setViewportSize({ width: width, height: height });
    Service.setPopup(popup);
  })

  // Assign all log listeners
  Service.logMonitor(page,keepalive,file, inService, browser,video, saveVideo);
  if(listsuite||listscenarios){
    Service.setBeginningFun(function(){
      Service.insertFileTask(function(){
        Service.result = 0;
        Service.shutdown()
      })
      if(listsuite){
        page.evaluate((v)=>{
          $util.getTestsBySuite(v)
        }, listsuite);
      }else if(listscenarios){
        page.evaluate((v)=>{
          $util.getScenariosByTag(v)
        }, JSON.parse(listscenarios));
      }
    })
  }

  const response = await page.goto(url);
  Service.setPage(page);


  page.on("error", idePrintStackTrace);
  page.on("pageerror", idePrintStackTrace);

})()





