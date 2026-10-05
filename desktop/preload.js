'use strict';
const {contextBridge,ipcRenderer}=require('electron');
const call=(name,...args)=>ipcRenderer.invoke('studio:'+name,...args);
contextBridge.exposeInMainWorld('studio',Object.freeze({
  discover:()=>call('discover'), chooseSteam:()=>call('chooseSteam'), capture:(account,install)=>call('capture',account,install),confirm:kind=>call('confirm',kind),
  importProfile:()=>call('importProfile'), importSources:()=>call('importSources'), saveProfile:p=>call('saveProfile',p),
  describe:p=>call('describe',p), exportBundle:p=>call('exportBundle',p), preview:p=>call('preview',p),
  plan:(p,a,i,m,d)=>call('plan',p,a,i,m,d), install:id=>call('install',id), rollback:()=>call('rollback'),
  serverData:()=>call('serverData'), serverPreview:(k,v)=>call('serverPreview',k,v), serverExport:(k,v)=>call('serverExport',k,v),openDocs:()=>call('openDocs')
}));
