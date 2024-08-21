window.extensionContent=1;
if((window.name||"").includes("bz-master")){
  document.documentElement.setAttribute('bz-id',chrome.runtime.id)
}
console.log("loading content.js")