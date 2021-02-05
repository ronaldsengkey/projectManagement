'use strict'
// ANCHOR MAIN IP CONFIG
const mainIpService = "http://192.168.0.96";
const mainChatService = "http://192.168.0.96";
// const mainChatService = "http://192.168.0.28";
// const localUrl = "http://sandbox.dashboard.ultipay.id";
// const mainIpService = "https://sandbox.api.ultipay.id";
// const mainChatService = "https://sandbox.api.ultipay.id";
const localUrl = "http://localhost";

// ANCHOR MAIN IP NAME AND PORT
const mainIpKey = "SERVER_JIMBO";
// const mainIpKey = "AWS_SERVER";
const backendPortKey = "PORT_BACKEND_AWS";
const transactionPortKey = "PORT_TRANSACTION_AWS";
const withdrawPortKey = "PORT_WITHDRAW_AWS";
const authPortKey = "PORT_AUTH_AWS";
const accPortKey = "PORT_ACC_AWS";

// ANCHOR LOCAL DASHBOARD PORT
const mainLocalPort = "8100";
const marketingLocalPort = "8101";
const financeLocalPort = "8102";
const employeeLocalPort = "8103";
const csLocalPort = "8105";
const partnerLocalPort = "8111";
const projectManagementLocalPort = "8110";

// ANCHOR MAIN PORT LINK AWS
const backendPortService = "8443/backend";
const transactionPortService = "8443/transaction";
const authPortService = "8443/authentication";