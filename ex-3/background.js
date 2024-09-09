importScripts('background/bgUtil.js');
importScripts('background/tabManagement.js');
importScripts('background/apiListener.js');
importScripts('background/bgComm.js');

chrome.action.setBadgeText({text:"AI"});
chrome.runtime.onInstalled.addListener(addPageScript);

async function addPageScript(a,b,c) {
  console.log("installed ....")
  const scripts = [{
    id: 'override',
    js: ['page/pageCode.js','page/insertScript.js','page/pageExtra.js'],
    matches: ['<all_urls>'],
    runAt: 'document_start',
    world: 'MAIN',
    allFrames:true
  }];
  const ids = scripts.map(s => s.id);
  await chrome.scripting.unregisterContentScripts({ ids }).catch(() => {});
  await chrome.scripting.registerContentScripts(scripts);

}

chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.query({ }, (tabs) => {
    tabs.forEach((tab) => {
      tab=new BZTab(tab,1)
      if(tab.ide){
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function:()=>{
            location.reload()
          }
        });
      }
    });
  });
});