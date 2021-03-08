'use strict'
// ANCHOR MAIN IP CONFIG
// const mainIpService = "http://192.168.0.96";
// const mainChatService = "http://192.168.0.96";
// // const mainChatService = "http://192.168.0.28";
// // const localUrl = "http://sandbox.dashboard.ultipay.id";
// // const mainIpService = "https://sandbox.api.ultipay.id";
// // const mainChatService = "https://sandbox.api.ultipay.id";
// const localUrl = "http://localhost";

// // ANCHOR MAIN IP NAME AND PORT
// const mainIpKey = "SERVER_JIMBO";
// // const mainIpKey = "AWS_SERVER";
// const backendPortKey = "PORT_BACKEND_AWS";
// const transactionPortKey = "PORT_TRANSACTION_AWS";
// const withdrawPortKey = "PORT_WITHDRAW_AWS";
// const authPortKey = "PORT_AUTH_AWS";
// const accPortKey = "PORT_ACC_AWS";

// // ANCHOR LOCAL DASHBOARD PORT
// const mainLocalPort = "8100";
// const marketingLocalPort = "8101";
// const financeLocalPort = "8102";
// const employeeLocalPort = "8103";
// const csLocalPort = "8105";
// const partnerLocalPort = "8111";
// const projectManagementLocalPort = "8110";

// // ANCHOR MAIN PORT LINK AWS
// const backendPortService = "8443/backend";
// const transactionPortService = "8443/transaction";
// const authPortService = "8443/authentication";


let mainIpService;
let mainChatService;
const localUrl = window.location.protocol + '//' + window.location.hostname
let mainIpKey;
let backendPortKey;
let transactionPortKey;
let withdrawPortKey;
let authPortKey;
let accPortKey;
let mainLocalPort;
let marketingLocalPort;
let financeLocalPort;
let employeeLocalPort;
let csLocalPort;
let partnerLocalPort;
let projectManagementLocalPort;
let backendPortService;
let transactionPortService;
let authPortService;
let domainPlaceUS;
let domainPlaceSG;

$(async function(){
    // get config from env
    await getEnvData()
})

async function getEnvData(){
    return new Promise(async function(resolve,reject){
        $.ajax({
            url: 'envConfig',
            crossDomain: true,
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Cache-Control": "no-cache"
            },
            success: function (callback) {
                let callbackData = JSON.parse(callback);
                mainIpService = callbackData.MAIN_IP_DESTINATION;
                mainChatService = mainIpService;
                mainIpKey = callbackData.MAIN_SERVER_KEY;
                backendPortKey = callbackData.BACKEND_SERVER_KEY;
                transactionPortKey = callbackData.TRANSACTION_SERVER_KEY;
                withdrawPortKey = callbackData.WITHDRAW_SERVER_KEY;
                authPortKey = callbackData.AUTH_SERVER_KEY;
                accPortKey = callbackData.ACC_SERVER_KEY;
                mainLocalPort = callbackData.MAIN_DASHBOARD_PORT;
                marketingLocalPort = callbackData.MARKETING_DASHBOARD_PORT;
                financeLocalPort = callbackData.FINANCE_DASHBOARD_PORT;
                employeeLocalPort = callbackData.EMPLOYEE_DASHBOARD_PORT;
                csLocalPort = callbackData.CS_DASHBOARD_PORT;
                partnerLocalPort = callbackData.PARTNER_DASHBOARD_PORT;
                projectManagementLocalPort = callbackData.PM_DASHBOARD_PORT;
                backendPortService = callbackData.BACKEND_PORT_SERVICE;
                transactionPortService = callbackData.TRANSACTION_PORT_SERVICE;
                authPortService = callbackData.AUTHENTICATION_PORT_SERVICE;
                domainPlaceSG = callbackData.SERVER_SG_DOMAIN;
                domainPlaceUS = callbackData.SERVER_US_DOMAIN;
                resolve(callbackData);
            }
        })
    })
    
}