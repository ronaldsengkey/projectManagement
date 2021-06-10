'use strict'
let mainIpService;
let mainChatService;
const localUrl = window.location.protocol + '//' + window.location.hostname
let mainLocalPort;
let backendPortService;
let domainPlaceUS;

$(async function(){
    // get config from env
    // await getEnvData()
})

async function getEnvData(){
    return new Promise(async function(resolve,reject){
        let callbackData = await ajaxCall({url:'envConfig',method:'GET'})
        iterateObjectNewDecrypt(callbackData,callbackData.cred);
        mainIpService = callbackData.hostIP;
        mainChatService = mainIpService;
        mainLocalPort = callbackData.mainLocalPort;
        backendPortService = callbackData.backendPortService;
        domainPlaceUS = callbackData.domainPlaceUS;
        resolve(callbackData);
    })
    
}