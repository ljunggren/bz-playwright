window.extensionContent=1;
if((window.name||"").includes("bz-master")){
  document.documentElement.setAttribute('bz-id',chrome.runtime.id)
}
console.log("BZ-LOG: Extension version: "+chrome.runtime.getManifest().version)
