#! /usr/bin/env node
// Device Descriptors https://github.com/GoogleChrome/puppeteer/blob/master/DeviceDescriptors.js


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
  "gtimeout": "",
  "notimeout": false,
  "timeout": "",
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
const gtimeout=opts.gtimeout;
const listscenarios=opts.listscenarios;
const listsuite=opts.listsuite;
const notimeout=opts.notimeout;
const timeout= opts.timeout;
const video = opts.video;
let file = opts.file;

if (result.errors || !result.args || result.args.length !== 1) {
  console.log('USAGE: boozang [--token] [--docker] [--gtimeout] [--notimeout] [--verbose] [--userdatadir] [--listscenarios] [--listsuite] [--width] [--height] [--screenshot] [--file=report] [url]');
  process.exit(2);
}

console.log("Running with following args");
console.log(opts);
console.log("Example: Use --verbose for verbose logging (boolean example). Use --width=800 to override default width (value example.)");


  file = (docker ? "/var/boozang/" : "") + opts.file;

  function getDateString(){
    let dNow = new Date();
    SimpleDateFormat ft = new SimpleDateFormat("yyMMddhhmm");
    String datetime = ft.format(dNow);
        System.out.println(datetime);
  }

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
    /** ,
    userDataDir: userdatadir,
     */
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
  //let popup = null;
  function setupPopup(popup) {
    // popup = pages[pages.length-1]; 
    popup.setViewportSize({
      width: parseInt(width),
      height: parseInt(height)
    });

    popup.on("error", appPrintStackTrace);
    popup.on("pageerror", appPrintStackTrace);
    Service.setPopup(popup)
  }

  const page = await browser.newPage();

  page.on('popup', async dialog => {
    setupPopup(dialog)
  })

  // Assign all log listeners
  Service.logMonitor(page,notimeout,gtimeout,timeout,file, browser,video)
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


  let url = result.args[0];
  if ((!opts.screenshot) && (!opts.listscenarios) && typeof (url) == 'string' && !url.endsWith("/run")) {
    if (!url.endsWith("/")) {
        url += "/"
    }
    url += "run"
}
  const response = await page.goto(url);

  page.on("error", idePrintStackTrace);
  page.on("pageerror", idePrintStackTrace);

})()





