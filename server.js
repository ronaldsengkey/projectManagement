"use strict";

let hostIP;
let hostIPAlt;
let hostNameServer;
let accPort;
let backendPort;
let portAcc;
let portAuth;
let portTrans;
let localUrl;
let employeeLocalPort;
let csLocalPort;
let extToken;

// Require the framework and instantiate it
const fastify = require("fastify")({
  logger: true,
});
const path = require("path");
const r = require("request");
const request = require("request");
const efs = require('fs');
const fsConfig = efs.readFileSync('./config.json', 'utf-8');
const cryptography = require("./crypto.js");
const partnerKey = efs.readFileSync("./partner.key", 'utf-8');
const marketingKey = efs.readFileSync("./marketing.key", 'utf-8');
const financeKey = efs.readFileSync("./finance.key", 'utf-8');
const employeeKey = efs.readFileSync("./employee.key", 'utf-8');
const csKey = efs.readFileSync("./cs.key", 'utf-8');
const myKey = efs.readFileSync("./server.key", 'utf-8');
var redis = require("redis");
// const {
//   createStore,
//   applyMiddleware
// } = require("redux");
// // Declare a routen

fastify.register(require('fastify-static'), {
    root: path.join(__dirname, 'public'),
    prefix: '/public/', // optional: default '/'
})

// var Monitor = require('monitor');
let signatureLogin = require("./signature.js");
let jsonConfig = require("./config.json");
const fs = require('fs');
var client = redis.createClient();
client.on("error", function (err) {
  console.log("Redis error: " + err);
});
let redisKey = [];
let returnedConfig = {};


async function getConfig() {
  let mainIpKey = "AWS_SERVER";
  let mainIpLocal = "SERVER_JIMBO";
  let mainIpCentos = "SERVER_CENTOS";
  let mainIpLocal2 = "SERVER_SYAFRI";
  let mainIpLocal3 = "SERVER_WAHYU";
  let mainIpLocal4 = "SERVER_EVE";
  let backendPortKey = "PORT_BACKEND_AWS";
  let transactionPortKey = "PORT_TRANSACTION_AWS";
  let withdrawPortKey = "PORT_WITHDRAW_AWS";
  let authPortKey = "PORT_AUTH_AWS";
  let accPortKey = "PORT_ACC_AWS";
  let outletPortKey = "PORT_OUTLET_AWS";
  let walletPortKey = "PORT_ULTIPAY_AWS";
  let analyticPortKey = "PORT_ANALYTICS";
  let allPort = [
    mainIpKey,
    mainIpLocal,
    mainIpCentos,
    mainIpLocal2,
    mainIpLocal3,
    mainIpLocal4,
    backendPortKey,
    transactionPortKey,
    withdrawPortKey,
    authPortKey,
    accPortKey,
    outletPortKey,
    walletPortKey,
    analyticPortKey
  ];

  for (let i = 0; i < jsonConfig.length; i++) {
    if (allPort.includes(jsonConfig[i].field_name_origin)) {
      console.log(jsonConfig[i].field_name_origin, '=>', cryptography.cryptr.decrypt(jsonConfig[i].field_value));
      returnedConfig[jsonConfig[i].field_name_origin] = cryptography.cryptr.decrypt(jsonConfig[i].field_value);
      // setRedisData(jsonConfig[i].field_name_origin,cryptography.cryptr.decrypt(jsonConfig[i].field_value));
    }
  }
}

fastify.get("/getSession", function (req, reply) {
  client.get("originLogin", function (err, result) {
    reply.send(result);
  });
});

let token;
let port;


fastify.get("/:origin", async function (req, reply) {
  let signature = req.headers.signature;
  let secretKey = req.headers.secretkey;
  let paramTemp;
  try {
    switch (req.params.origin) {
      case 'config':
        const fsConfigRaw = efs.readFileSync('./config.json', 'utf-8');
        reply.send(fsConfigRaw);
        break;
      case "getConfig":
        let resp = {};
        if (req.headers.serverkey == myKey) {
          resp.responseCode = '200';
          resp.responseMessage = 'Success';
          resp.data = returnedConfig;
          reply.send(resp);
        } else {
          resp.responseCode = '500';
          resp.responseMessage = 'Error';
          reply.send(resp);
        }
        break;
      case "":
        // reply.type('text/html').send(await getSource());
        reply.redirect("/login");
        break;
      case "register":
        reply.sendFile("layouts/register.html");
        break;
      case "reqpassword":
        reply.sendFile("layouts/login.html");
        break;
      case "openService":
        port = req.headers.port;
        token = req.headers.token;
        request.get({
            async: true,
            crossDomain: true,
            headers: {
              Accept: "*/*",
              "Cache-Control": "no-cache",
              "Content-type": "plain/text",
            },
            url: localUrl + ":" + port + "/dashboard?token=" + token,
          },
          function (err, response, body) {
            reply.send(body);
          }
        );
        break;
      case "employee":
        if(req.query.use == 'project_management'){
          extToken = req.query.token;
        }
        reply.sendFile("layouts/index.html");
        break;
      case "login-auth":
        reply.sendFile("layouts/login-auth.html");
        break;
      case "loginAccess":
        if (req.headers.publickey == publicKey) {
          let a = await generateToken();
          console.log("done");
          reply.send(a);
        }
        break;
      case "checkToken":
        let urlToken = req.headers.url;
        let data = {
          settings: {
            async: true,
            crossDomain: true,
            // "url": hostIP + ":8202/check/" + token,
            url: urlToken,
            method: "GET",
            headers: {
              Accept: "*/*",
              "Cache-Control": "no-cache",
            },
          },
        };
        // console.log('data check token ', data)
        let a = await actionGet(data);
        if (a.responseCode == "401") {
          reply.sendFile("layouts/index.html");
        } else {
          reply.send(a);
        }
        break;
      case "getMethod":
        token = req.headers.token;
        let param = req.headers.param;
        console.log("token", token);
        let getMethodd = {
          settings: {
            async: true,
            crossDomain: true,
            url: (await getRedisData(hostNameServer, token)) +
              ":" +
              (await getRedisData(backendPort, token)) +
              "/master/method",
            method: "GET",
            headers: {
              Accept: "*/*",
              "Cache-Control": "no-cache",
              signature: cryptography.aesEncrypt(signature),
              secretKey: cryptography.aesEncrypt(secretKey),
              token: cryptography.aesEncrypt(token),
              param: cryptography.aesEncrypt(param),
            },
          },
        };
        console.log("tes get token atas", getMethodd);
        let getMethodBack = await actionGet(getMethodd);
        reply.send(getMethodBack);
        break;
      case "getRole":
        token = req.headers.token;
        let getRole = {
          settings: {
            async: true,
            crossDomain: true,
            url: (await getRedisData(hostNameServer, token)) +
              ":" +
              (await getRedisData(backendPort, token)) +
              "/master/role",
            method: "GET",
            headers: {
              Accept: "*/*",
              "Cache-Control": "no-cache",
              signature: cryptography.aesEncrypt(signature),
              secretKey: cryptography.aesEncrypt(secretKey),
              token: cryptography.aesEncrypt(token),
            },
          },
        };
        let getRoleSend = await actionGet(getRole);
        reply.send(getRoleSend);
        break;
      case "getScope":
        token = req.headers.token;
        let getScoped = {
          settings: {
            async: true,
            crossDomain: true,
            url: (await getRedisData(hostNameServer)) +
              ":" +
              (await getRedisData(backendPort)) +
              "/master/access",
            method: "GET",
            timeout: 90000,
            headers: {
              Accept: "*/*",
              "Cache-Control": "no-cache",
              signature: cryptography.aesEncrypt(signature),
              secretKey: cryptography.aesEncrypt(secretKey),
              token: cryptography.aesEncrypt(token),
            },
          },
        };
        let getScopeSend = await actionGet(getScoped);
        reply.send(getScopeSend);
        break;
      case "getKey":
      case "getKeys":
        token = req.headers.token;
        let urlKeys = req.headers.url;
        console.log("sk", req.headers.secretkey);
        console.log("sig", req.headers.signature);
        console.log("parr", req.headers.param);
        if (urlKeys == undefined)
          urlKeys =
          (await getRedisData(hostNameServer)) +
          ":" +
          (await getRedisData(backendPort)) +
          "/master/key";

        let getKey = {
          settings: {
            async: true,
            crossDomain: true,
            // "url": hostIP + ":8203/master/key",
            url: urlKeys,
            method: "GET",
            headers: {
              Accept: "*/*",
              "Cache-Control": "no-cache",
              secretKey: cryptography.aesEncrypt(req.headers.secretkey),
              signature: cryptography.aesEncrypt(req.headers.signature),
              token: cryptography.aesEncrypt(token),
              param: cryptography.aesEncrypt(req.headers.param),
            },
          },
        };
        console.log("getKey ==> ", getKey);
        let getKeySend = await actionGet(getKey);
        // Decrypt the value
        // var decryptedValue = []
        // if(getKeySend.data){
        //   getKeySend.data.forEach(_data => {
        //       decryptedValue.push({
        //           field_name : cryptr.decrypt(_data.field_name),
        //           field_value : cryptr.decrypt(_data.field_value),
        //           field_name_origin : _data.field_name_origin,
        //           field_value_origin : _data.field_value_origin
        //       })
        //   });
        // }
        // getKeySend.data = decryptedValue
        reply.send(getKeySend);
        break;
      case "member":
      case "customer":
      case "partner":
      case "vendor":
      case "getEmployee":
        let paramAcc = req.params.origin;
        token = req.headers.token;
        let _headers;
        if (paramAcc == "member") {
          paramAcc = "customer";
          _headers = {
            Accept: "*/*",
            "Cache-Control": "no-cache",
            secretKey: cryptography.aesEncrypt(secretKey),
            signature: cryptography.aesEncrypt(signature),
            token: cryptography.aesEncrypt(token),
            param: cryptography.aesEncrypt("all"),
          };
        } else {
          _headers = {
            Accept: "*/*",
            "Cache-Control": "no-cache",
            secretKey: cryptography.aesEncrypt(secretKey),
            signature: cryptography.aesEncrypt(signature),
            token: cryptography.aesEncrypt(token),
          };
        }

        if (paramAcc == "partner" || paramAcc == "vendor") {
          _headers = {
            Accept: "*/*",
            "Cache-Control": "no-cache",
            secretKey: cryptography.aesEncrypt(secretKey),
            signature: cryptography.aesEncrypt(signature),
            token: cryptography.aesEncrypt(token),
            param: cryptography.aesEncrypt("all"),
          };
        }

        if (paramAcc == "getEmployee") {
          paramAcc = "employee";
          _headers = {
            Accept: "*/*",
            "Cache-Control": "no-cache",
            secretKey: cryptography.aesEncrypt(secretKey),
            signature: cryptography.aesEncrypt(signature),
            token: cryptography.aesEncrypt(token),
            param: cryptography.aesEncrypt("all"),
          };
        }
        redisKey[hostNameServer] = await getRedisData(hostNameServer, token);
        redisKey["PORT_ACC_AWS"] = await getRedisData("PORT_ACC_AWS", token);

        let b = {
          settings: {
            async: true,
            crossDomain: true,
            url: (await getRedisData(hostNameServer, token)) +
              ":" +
              (await getRedisData(portAcc, token)) +
              "/data/" +
              paramAcc,
            method: "GET",
            headers: _headers,
          },
        };
        console.log("tembak", b);
        let c = await actionGet(b);
        reply.send(c);
        break;
      case "customerDetail":
        request.get({
            async: true,
            crossDomain: true,
            headers: {
              Accept: "*/*",
              "Cache-Control": "no-cache",
              "Content-type": "plain/text",
            },
            url: localUrl + ":" + csLocalPort + "/customerDetail",
          },
          function (err, response, body) {
            reply.send(body);
          }
        );
        break;
      case "employeeDetail":
        request.get({
            async: true,
            crossDomain: true,
            headers: {
              Accept: "*/*",
              "Cache-Control": "no-cache",
              "Content-type": "plain/text",
            },
            url: localUrl + ":" + employeeLocalPort + "/employeeDetail",
          },
          function (err, response, body) {
            reply.send(body);
          }
        );
        break;
      case "ticketingDetail":
        request.get({
            async: true,
            crossDomain: true,
            headers: {
              Accept: "*/*",
              "Cache-Control": "no-cache",
              "Content-type": "plain/text",
            },
            url: localUrl + ":" + csLocalPort + "/ticketingModule",
          },
          function (err, response, body) {
            reply.type('text/html').send(body);
          }
        );
        break;
      case "ticketingDetailEdit":
        console.log("EDITTT");
        request.get({
            async: true,
            crossDomain: true,
            headers: {
              Accept: "*/*",
              "Cache-Control": "no-cache",
              "Content-type": "plain/text",
            },
            url: localUrl + ":" + csLocalPort + "/ticketingDetail",
          },
          function (err, response, body) {
            reply.send(body);
          }
        );
        break;
      case "modalViewTicketDetail":
        console.log("EDITTT");
        request.get({
            async: true,
            crossDomain: true,
            headers: {
              Accept: "*/*",
              "Cache-Control": "no-cache",
              "Content-type": "plain/text",
            },
            url: localUrl + ":" + csLocalPort + "/modalViewTicketDetail",
          },
          function (err, response, body) {
            reply.send(body);
          }
        );
        break;
      case "getBank":
        token = req.headers.token;
        paramTemp = req.headers.param;
        redisKey["PORT_ACC_AWS"] = await getRedisData("PORT_ACC_AWS", token);
        let getBank = {
          settings: {
            async: true,
            crossDomain: true,
            url: (await getRedisData(hostNameServer, token)) +
              ":" +
              (await getRedisData(portAcc, token)) +
              "/bankList",
            method: "GET",
            headers: {
              Accept: "*/*",
              "Cache-Control": "no-cache",
              signature: cryptography.aesEncrypt(signature),
              secretKey: cryptography.aesEncrypt(secretKey),
              token: cryptography.aesEncrypt(token),
              param: cryptography.aesEncrypt(paramTemp),
            },
          },
        };
        let getBankSend = await actionGet(getBank);
        reply.send(getBankSend);
        break;
      case "getPromotion":
        token = req.headers.token;
        paramTemp = req.params.origin;
        paramTemp = paramTemp.substr(3).toLowerCase();
        let getPromo = {
          settings: {
            async: true,
            crossDomain: true,
            url: (await getRedisData(hostNameServer, token)) +
              ":" +
              (await getRedisData(portTrans, token)) +
              "/" +
              paramTemp,
            method: "GET",
            headers: {
              Accept: "*/*",
              "Cache-Control": "no-cache",
              signature: cryptography.aesEncrypt(signature),
              secretKey: cryptography.aesEncrypt(secretKey),
              token: cryptography.aesEncrypt(token),
              param: cryptography.aesEncrypt("all"),
            },
          },
        };
        let getPromoSend = await actionGet(getPromo);
        reply.send(getPromoSend);
        break;
      case "getDivision":
      case "getTopic":
      case "getCategory":
        token = req.headers.token;
        paramTemp = req.params.origin;
        paramTemp = paramTemp.substr(3).toLowerCase();
        let getDTC = {
          settings: {
            async: true,
            crossDomain: true,
            url: (await getRedisData(hostNameServer, token)) +
              ":" +
              (await getRedisData(backendPort, token)) +
              "/customerService/list/" +
              paramTemp,
            method: "GET",
            headers: {
              Accept: "*/*",
              "Cache-Control": "no-cache",
              signature: cryptography.aesEncrypt(signature),
              secretKey: cryptography.aesEncrypt(secretKey),
              token: cryptography.aesEncrypt(token),
            },
          },
        };
        console.log("get dtc", getDTC);
        let getDTCSend = await actionGet(getDTC);
        reply.send(getDTCSend);
        break;
      case "getCity":
      case "getCountry":
      case "getCurrency":
      case "getTenant_category":
      case "getProduct":
      case "getVoucher":
      case "getNotification":
        token = req.headers.token;
        paramTemp = req.params.origin;
        paramTemp = paramTemp.substr(3).toLowerCase();
        let getMasterAll = {
          settings: {
            async: true,
            crossDomain: true,
            url: (await getRedisData(hostNameServer, token)) +
              ":" +
              (await getRedisData(backendPort, token)) +
              "/master/" +
              paramTemp +
              "/all",
            method: "GET",
            headers: {
              Accept: "*/*",
              "Cache-Control": "no-cache",
              signature: cryptography.aesEncrypt(signature),
              secretKey: cryptography.aesEncrypt(secretKey),
              token: cryptography.aesEncrypt(token),
              param: cryptography.aesEncrypt("all"),
            },
          },
        };
        console.log("getMasterAll ", getMasterAll);
        let getMasterAllSend = await actionGet(getMasterAll);
        console.log("get result MasterAll ==> ", getMasterAllSend);
        reply.send(getMasterAllSend);
        break;
      case "getFiles":
        token = req.headers.token;
        paramTemp = req.params.origin;
        paramTemp = paramTemp.substr(3).toLowerCase();
        let getMasterAllFiles = {
          settings: {
            async: true,
            crossDomain: true,
            url: (await getRedisData(hostNameServer, token)) +
              ":" +
              (await getRedisData(backendPort, token)) +
              "/master/" +
              paramTemp +
              "/all",
            method: "GET",
            headers: {
              Accept: "*/*",
              "Cache-Control": "no-cache",
              signature: cryptography.aesEncrypt(signature),
              secretKey: cryptography.aesEncrypt(secretKey),
              token: cryptography.aesEncrypt(token),
              // "param": "all"
            },
          },
        };
        console.log("getMasterAll ", getMasterAllFiles);
        let getMasterAllFilesSend = await actionGet(getMasterAllFiles);
        console.log("get result MasterAll ==> ", getMasterAllFilesSend);
        reply.send(getMasterAllFilesSend);
        break;
      default:
        reply.sendFile("layouts/notFound.html");
        break;
    }
  } catch (err) {
    console.log(err);
    reply.send(500);
  }
});

fastify.get("/login", function (req, reply) {
  reply.sendFile("layouts/login.html");
});
fastify.get("/home", function (req, reply) {
  reply.sendFile("layouts/home.html");
});
fastify.get("/displayOnTable", async function (req, reply) {
  reply.sendFile("layouts/displayOnTable.html");
});

function actionGet(data) {
  return new Promise(async (resolve, reject) => {
    try {
      data.settings.headers.aes = cryptography.rsaEncrypt(
        cryptography.keyAESClient + ":" + cryptography.ivAESClient
      );
      data.settings.headers.clientKey = cryptography.aesEncrypt(
        cryptography.pub
      );
      console.log("head", data.settings);
      // if(data.settings.headers.Host) delete data.settings.headers.Host;

      let settings = data.settings;
      r.get(settings, function (error, response, body) {
        if (error) {
          if(error.toString().includes('TIMEDOUT')) reject(999)
          else reject(process.env.ERRORINTERNAL_RESPONSE);
        } else {
          console.log("action Get body data => ", body);
          let result = "";
          if (body !== "" && JSON.parse(body).data !== undefined) {
            result = JSON.parse(body);
            result.data = iterateObjectDecrypt(result.data);
          } else {
            try {
              result = JSON.parse(body);
            } catch (e) {
              result = body;
            }
          }
          resolve(result);
        }
      });
    } catch (err) {
      console.log("error action get", err);
      reject(process.env.ERRORINTERNAL_RESPONSE);
    }
  });
}

function iterateObject(obj) {
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === "object") {
      iterateObject(obj[key]);
    } else {
      obj[key] = cryptography.encryptMessage(obj[key]);
    }
  });
  return obj;
}

function iterateObjectDecrypt(obj) {
  let temp;
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === "object") {
      iterateObjectDecrypt(obj[key]);
    } else {
      temp = obj[key];
      obj[key] = cryptography.decryptMessage(obj[key]);
      if (obj[key] == "") obj[key] = temp;
      if (obj[key].toString().includes("error")) obj[key] = temp;
    }
  });
  return obj;
}

function encryptPostBody(data) {
  let databody = data.settings.body;
  var encryptedData = iterateObject(JSON.parse(databody));
  data.settings.body = JSON.stringify(encryptedData);
  return data.settings.body;
}

function actionPost(data) {
  return new Promise(async (resolve, reject) => {
    try {
      data.settings.headers.aes = cryptography.rsaEncrypt(
        cryptography.keyAESClient + ":" + cryptography.ivAESClient
      );
      data.settings.headers.clientKey = cryptography.aesEncrypt(
        cryptography.pub
      );
      let settings = data.settings;
      console.log("setting", settings);
      r.post(settings, function (error, response, body) {
        if (error) {
          console.log("err", error);
          if (data.settings.url.includes('updateConfig')) resolve(error);
          else reject(process.env.ERRORINTERNAL_RESPONSE);
        } else {
          let json = IsJsonString(body);
          let result;
          if(json) {
            result = JSON.parse(body);
            console.log("action Post sblm decrypt => ", result);
            if (data.settings.url.includes("listTicketing") || data.settings.url.includes('login')) {
              if(result.data) result.data = JSON.parse(cryptography.decryptMessage(result.data));
            } else {
              try {
                result.data = iterateObjectDecrypt(result.data);
              } catch (e) {
                result = result;
              }
            }
          } else {
            result = body;
          }
          // console.log('action Post result => ', result.data)
          resolve(result);
        }
      });
    } catch (err) {
      console.log("error action post", err);
      reject(process.env.ERRORINTERNAL_RESPONSE);
    }
  });
}

function actionDelete(data) {
  return new Promise(async (resolve, reject) => {
    try {
      data.settings.headers.aes = cryptography.rsaEncrypt(
        cryptography.keyAESClient + ":" + cryptography.ivAESClient
      );
      data.settings.headers.clientKey = cryptography.aesEncrypt(
        cryptography.pub
      );
      let settings = data.settings;
      console.log("setting", settings);
      r.delete(settings, function (error, response, body) {
        if (error) {
          reject(process.env.ERRORINTERNAL_RESPONSE);
        } else {
          let json = IsJsonString(body);
          let result;
          if(json) {
            result = JSON.parse(body);
          }
          else {
            result = body;
          }
          resolve(result);
        }
      });
    } catch (err) {
      console.log("error action delete", err);
      reject(process.env.ERRORINTERNAL_RESPONSE);
    }
  });
}

function actionPut(data) {
  return new Promise(async (resolve, reject) => {
    try {
      data.settings.headers.aes = cryptography.rsaEncrypt(
        cryptography.keyAESClient + ":" + cryptography.ivAESClient
      );
      data.settings.headers.clientKey = cryptography.aesEncrypt(
        cryptography.pub
      );
      let settings = data.settings;
      // let settings = data;
      console.log("setting", settings);
      r.put(settings, function (error, response, body) {
        if (error) {
          reject(process.env.ERRORINTERNAL_RESPONSE);
        } else {
          let json = IsJsonString(body);
          let result;
          if(json) {
            result = JSON.parse(body);
          }
          else {
            result = body;
          }
          resolve(result);
        }
      });
    } catch (err) {
      console.log("error action put", err);
      reject(process.env.ERRORINTERNAL_RESPONSE);
    }
  });
}

async function getRData(_param, _token) {
  return new Promise(async function (resolve, reject) {
    try {
      if (redisKey[_param] && redisKey[_param] !== "null") {
        console.log("ada redis keynya dong => ", redisKey[_param]);
        resolve(redisKey[_param]);
      } else {
        if (_param == 'all') {
          try {
            resolve(JSON.parse(returnedConfig));
          } catch (e) {
            resolve(returnedConfig);
          }
        } else {
          resolve(returnedConfig[_param]);
        }

        // client.get(_param, async function (err, rep) {
        //   if (err) throw err; // reply is null when the key is missing
        //   if (isEmptyResult(rep)) {
        //     let _getKeyResult = await getKey(_param, _token);
        //     // await setRedisData (_param, _getKeyResult)
        //     console.log("_getKeyResult ==> ", _getKeyResult);
        //     resolve(_getKeyResult);
        //   } else {
        //     resolve(JSON.parse(rep));
        //   }
        // });
      }
    } catch (err) {
      console.log("error get key ", err);
      // reply.send(err)
    }
  });
}

function isEmptyResult(val) {
  if (
    !val ||
    val == undefined ||
    val == "undefined" ||
    val == null ||
    val == "null" ||
    val == ""
  ) {
    return true;
  } else {
    return false;
  }
}

function convertURL(data, token) {
  return new Promise(async function (resolve, reject) {
    try {
      let url;
      console.log("data convert url", data);
      if (data.server_url) {
        url = await getRData(data.server_url, token);
        url += ":" + (await getRData(data.port_url, token));
        data.url = url + data.url;
      } else {
        url = await getRData(data.settings.server_url, token);
        url += ":" + (await getRData(data.settings.port_url, token));
        data.settings.url = url + data.settings.url;
        console.log("url nya", url);
      }

      // console.log('data.',data.url);
      // if(data.url != undefined){
      //   data.url = url + data.url
      // } else {
      //   data.url = url + data.settings.url
      // }

      // console.log ('data.url =>> ', data.url)
      resolve(data);
    } catch (err) {
      console.log("Error URL convert", err);
      // reply.send(500);
      // resolve(500)
    }
  });
}

fastify.post("/getData", async function (req, reply) {
  try {
    let data = req.body;
    data.settings.headers.param = cryptography.aesEncrypt(
      JSON.stringify(data.settings.headers.param)
    );
    data.settings.headers.token = cryptography.aesEncrypt(
      data.settings.headers.token
    );
    data.settings.headers.signature = cryptography.aesEncrypt(
      data.settings.headers.signature
    );
    data.settings.headers.secretKey = cryptography.aesEncrypt(
      data.settings.headers.secretKey
    );
    data.settings.timeout = 90000;
    console.log('getData => ', data);
    let a = await actionGet(data);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    if(err == 999) reply.send(999)
    else reply.send(500);
  }
});

fastify.get("/getFile", async function (req, reply) {
  console.log("getFile");
  try {
    let server = req.headers.server;
    let port = req.headers.port;
    let id = req.headers.id;
    let token = req.headers.token;
    let signature = req.headers.signature;
    let b = {
      async: true,
      crossDomain: true,
      url: server + port + "/getFile/" + id,
      method: "GET",
      headers: {
        Accept: "*/*",
        "Cache-Control": "no-cache",
        signature: signature,
        token: token,
      },
    };
    let c = await actionGet(b);
    reply.send(c);
  } catch (error) {
    console.log("error bro: ", error);
    reply.send(500);
  }
});

fastify.post("/postData", async function (request, reply) {
  try {
    let data = request.body;
    if (data.settings.target == "login" || data.settings.target == 'login-auth') {
      data.settings.server_url = hostNameServer;
      data.settings.port_url = portAuth;
      data.settings.url = await convertURLRedis(data.settings);
      data.settings.headers.signature = cryptography.aesEncrypt(
        signatureLogin.signatureNew
      );
    }
    data.settings.body = encryptPostBody(data);

    let a = await actionPost(data);
    // console.log('CHECK POST DATA BODY ==> ', data);
    // console.log('CHECK RESULT ===> ', a);
    if (data.target == "login" && a.responseCode == "200") {
      let b = await setRedisDataLogin(a);
    }
    reply.send(a);
  } catch (err) {
    reply.send(err);
  }
});

async function setRedisDataLogin(data) {
  client.set(
    "originLogin" + data.data.id_employee,
    JSON.stringify(data),
    redis.print
  );
  client.set(
    "loginData" + data.data.id_employee,
    JSON.stringify(data),
    redis.print
  );
}

async function setRedisData(param, data) {
  console.log("getRedisData => " + param + " - ", data);
  redisKey[param] = data;
  client.set(param, JSON.stringify(data), redis.print);
  // client.set(param, data, redis.print);
}

function IsJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

async function getRedisDataRaw(param) {
  return new Promise(async function (resolve, reject) {
    try {
      console.log("PARAM GET REDIS DATA RAW", param);
      if (param == 'all') {
        try {
          resolve(JSON.parse(returnedConfig));
        } catch (e) {
          resolve(returnedConfig);
        }
      } else {
        resolve(returnedConfig[param]);
      }
      // client.get(param, async function (err, rep) {
      //   if (err) throw err; // reply is null when the key is missing
      //   // rep = JSON.parse(rep)
      //   // resolve(rep)
      //   let jString = IsJsonString(rep);
      //   console.log("repnya", rep);
      //   console.log("type", jString);
      //   let result = "";
      //   if (jString == false) {
      //     result = rep;
      //   } else {
      //     result = JSON.parse(rep);
      //   }
      //   resolve(result);
      // });
    } catch (err) {
      reject(err);
    }
  });
}

async function getRedisData(
  param,
  token = "",
  signature = "",
  secretKey = "",
  urlRdata
) {
  return new Promise(async function (resolve, reject) {
    let result = "";
    if (
      redisKey[param] !== undefined &&
      redisKey[param] !== "undefined" &&
      redisKey[param] !== null &&
      redisKey[param] !== "null" &&
      redisKey[param] !== ""
    ) {
      console.log("redisnya ada", redisKey[param]);
      result = redisKey[param];
    } else {
      let rep = await getRedisDataRaw(param);
      console.log("repppp", rep);
      // if (
      //   rep == undefined ||
      //   rep == "undefined" ||
      //   rep == null ||
      //   rep == "null" ||
      //   rep == "" ||
      //   rep.code == "ERR_INVALID_ARG_TYPE"
      // ) {
      //   let _getKeyResult = await getKey(
      //     param,
      //     token,
      //     signature,
      //     secretKey,
      //     urlRdata
      //   );
      //   // console.log('get key result',_getKeyResult);
      //   await setRedisData(param, _getKeyResult);
      //   result = _getKeyResult;
      // } else {
      //   console.log("data alr exist", rep);
      //   result = rep;
      // }
      result = rep;
    }
    // console.log ('result ---> ', result)
    // if(result.indexOf('"') !== -1){
    // result = result.replace(/"/g,'');
    // }
    resolve(result);
  });
}

async function clearRedisData(id = "") {
  return new Promise(async function (resolve, reject) {
    client.DEL("originLogin" + id, function (err, succeeded) {
      // console.log('sukses clear redis data ', succeeded) // will be true if successfull
      resolve(succeeded);
    });
    client.DEL("loginData" + id, function (err, succeeded) {
      // console.log('sukses clear redis data ', succeeded) // will be true if successfull
      resolve(succeeded);
    });
  });
}

fastify.get("/form", function (req, reply) {
  let category = req.query.category;
  let form = "";
  switch (category) {
    case "newTicket":
      // form = 'layouts/modal/newTicket.html';
      request.get({
          async: true,
          crossDomain: true,
          headers: {
            Accept: "*/*",
            "Cache-Control": "no-cache",
            "Content-type": "plain/text",
          },
          url: localUrl + ":" + csLocalPort + "/newTickets",
        },
        function (err, response, body) {
          reply.send(body);
        }
      );
      break;
  }
});

fastify.get("/project_management", function (req, reply) {
  reply.sendFile("layouts/projectManagement.html");
});

fastify.get("/projectBoard", function (req, reply) {
  reply.sendFile("layouts/projectBoard.html");
});

fastify.post("/postBoard", async function (req, reply) {
  try {
    let data = req.body;
    let token = extToken ? extToken : data.settings.headers.token;
    data.settings.url = hostIPAlt + ":" + await getRedisData(backendPort) + '/dashboard/board';

    data.settings.headers.signature = cryptography.aesEncrypt(
      data.settings.headers.signature
    );
    data.settings.headers.secretKey = cryptography.aesEncrypt(
      data.settings.headers.secretKey
    );
    data.settings.headers.token = cryptography.aesEncrypt(
      token
    );

    data.settings.body = encryptPostBody(data);

    console.log("coba send email", data);
    let a = await actionPost(data);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.delete("/board", async function (req, reply) {
  try {
    let data = req.body;
    console.log('dataa',data);
    let token = extToken ? extToken : data.settings.headers.token;
    data.settings.url = hostIPAlt + ":" + await getRedisData(backendPort) + '/dashboard/board';

    data.settings.headers.signature = cryptography.aesEncrypt(
      data.settings.headers.signature
    );
    data.settings.headers.secretKey = cryptography.aesEncrypt(
      data.settings.headers.secretKey
    );
    data.settings.headers.token = cryptography.aesEncrypt(
      token
    );

    data.settings.body = encryptPostBody(data);

    console.log("coba delete board", data);
    let a = await actionDelete(data);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.put("/board", async function (req, reply) {
  try {
    let data = req.body;
    console.log('dataa',data);
    let token = extToken ? extToken : data.settings.headers.token;
    data.settings.url = hostIPAlt + ":" + await getRedisData(backendPort) + '/dashboard/board';

    data.settings.headers.signature = cryptography.aesEncrypt(
      data.settings.headers.signature
    );
    data.settings.headers.secretKey = cryptography.aesEncrypt(
      data.settings.headers.secretKey
    );
    data.settings.headers.token = cryptography.aesEncrypt(
      token
    );

    data.settings.body = encryptPostBody(data);

    console.log("coba put board", data);
    let a = await actionPut(data);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.post("/postTask", async function (req, reply) {
  try {
    let data = req.body;
    data.settings.url = hostIPAlt + ":" + await getRedisData(backendPort) + '/dashboard/task';
    let token = extToken ? extToken : data.settings.headers.token;

    data.settings.headers.signature = cryptography.aesEncrypt(
      data.settings.headers.signature
    );
    data.settings.headers.secretKey = cryptography.aesEncrypt(
      data.settings.headers.secretKey
    );
    data.settings.headers.token = cryptography.aesEncrypt(
      token
    );

    data.settings.body = encryptPostBody(data);

    console.log("coba post task", data);
    let a = await actionPost(data);
    console.log('post post task',a);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.post("/postGroup", async function (req, reply) {
  try {
    let data = req.body;
    data.settings.url = hostIPAlt + ":" + await getRedisData(backendPort) + '/dashboard/group';
    let token = extToken ? extToken : data.settings.headers.token;
    data.settings.headers.signature = cryptography.aesEncrypt(
      data.settings.headers.signature
    );
    data.settings.headers.secretKey = cryptography.aesEncrypt(
      data.settings.headers.secretKey
    );
    data.settings.headers.token = cryptography.aesEncrypt(
      token
    );

    data.settings.body = encryptPostBody(data);

    console.log("coba send group task", data);
    let a = await actionPost(data);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.get("/board", async function (req, reply) {
  try {
    let token = extToken ? extToken : req.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: hostIPAlt + ":" + await getRedisData(backendPort) + '/dashboard/board',
        method: "GET",
        headers: {
          Accept: "*/*",
          "Cache-Control": "no-cache",
          target:'getBoard',
          signature:cryptography.aesEncrypt(req.headers.signature),
          secretkey:cryptography.aesEncrypt(
            req.headers.secretkey
          ),
          token: cryptography.aesEncrypt(
            token
          ),
          param:cryptography.aesEncrypt(
            req.headers.param
          ),
        },
      },
    };

    console.log("coba get board", data);
    let a = await actionGet(data);
    console.log('aaaaa',a);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.get("/summaryBoard", async function (req, reply) {
  try {
    let token = extToken ? extToken : req.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: hostIPAlt + ":" + await getRedisData(backendPort) + '/dashboard/board',
        method: "GET",
        headers: {
          Accept: "*/*",
          "Cache-Control": "no-cache",
          target:'getSummaryBoard',
          signature:cryptography.aesEncrypt(req.headers.signature),
          secretkey:cryptography.aesEncrypt(
            req.headers.secretkey
          ),
          token: cryptography.aesEncrypt(
            token
          ),
          param:cryptography.aesEncrypt(
            req.headers.param
          ),
          category: cryptography.aesEncrypt(
            req.headers.category
          ),
        },
      },
    };

    console.log("coba get summaryBoard", data);
    let a = await actionGet(data);
    // console.log('aaaaa',a);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.get("/getGroupTask", async function (req, reply) {
  try {
    console.log('req',req.headers);
    let token = extToken ? extToken : req.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: hostIPAlt + ":" + await getRedisData(backendPort) + '/dashboard/group',
        method: "GET",
        headers: {
          Accept: "*/*",
          "Cache-Control": "no-cache",
          target:'getBoard',
          signature:cryptography.aesEncrypt(req.headers.signature),
          secretkey:cryptography.aesEncrypt(
            req.headers.secretkey
          ),
          token: cryptography.aesEncrypt(
            token
          ),
          param:cryptography.aesEncrypt(
            req.headers.param
          ),
        },
      },
    };

    console.log("coba get group task", data);
    let a = await actionGet(data);
    console.log('gerup tasek',a);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.get("/getTaskData", async function (req, reply) {
  try {
    console.log('req',req.headers);
    let token = extToken ? extToken : req.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: hostIPAlt + ":" + await getRedisData(backendPort) + '/dashboard/task',
        method: "GET",
        headers: {
          Accept: "*/*",
          "Cache-Control": "no-cache",
          target:'getBoard',
          signature:cryptography.aesEncrypt(req.headers.signature),
          secretkey:cryptography.aesEncrypt(
            req.headers.secretkey
          ),
          token: cryptography.aesEncrypt(
            token
          ),
          param:cryptography.aesEncrypt(
            req.headers.param
          ),
        },
      },
    };

    console.log("coba get task", data);
    let a = await actionGet(data);
    console.log('tasek',a);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.get("/comment", async function (req, reply) {
  try {
    let token = extToken ? extToken : req.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: hostIPAlt + ":" + await getRedisData(backendPort) + '/dashboard/task/comment',
        method: "GET",
        headers: {
          Accept: "*/*",
          "Cache-Control": "no-cache",
          target:'getBoard',
          signature:cryptography.aesEncrypt(req.headers.signature),
          secretkey:cryptography.aesEncrypt(
            req.headers.secretkey
          ),
          token: cryptography.aesEncrypt(
            token
          ),
          param:cryptography.aesEncrypt(
            req.headers.param
          ),
        },
      },
    };

    console.log("coba get comment", data);
    let a = await actionGet(data);
    console.log('komen',a);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.put("/editGroup", async function (req, reply) {
  try {
    console.log('req',req.body);
    let token = extToken ? extToken : req.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: hostIPAlt + ":" + await getRedisData(backendPort) + '/dashboard/group',
        method: "PUT",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          target:'getBoard',
          signature:cryptography.aesEncrypt(req.headers.signature),
          secretkey:cryptography.aesEncrypt(
            req.headers.secretkey
          ),
          token: cryptography.aesEncrypt(
            token
          ),
        },
        body: JSON.stringify(req.body)
      },
    };

    data.settings.body = encryptPostBody(data)

    console.log("coba edit group task", data);
    let a = await actionPut(data);
    console.log('edit gerup tasek',a);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.put("/putTask", async function (req, reply) {
  try {
    console.log('req',req.body);
    let token = extToken ? extToken : req.body.settings.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: hostIPAlt + ":" + await getRedisData(backendPort) + '/dashboard/task',
        method: "PUT",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          signature:cryptography.aesEncrypt(req.body.settings.headers.signature),
          secretkey:cryptography.aesEncrypt(
            req.body.settings.headers.secretKey
          ),
          token: cryptography.aesEncrypt(
            token
          ),
        },
        body: req.body.settings.body
      },
    };

    data.settings.body = encryptPostBody(data)

    console.log("coba put timeline", data);
    let a = await actionPut(data);
    console.log('put timelinee',a);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.post("/commentUpdate", async function (req, reply) {
  try {
    console.log('req',req.body);
    let token = extToken ? extToken : req.body.settings.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: hostIPAlt + ":" + await getRedisData(backendPort) + '/dashboard/task/comment',
        method: "POST",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          signature:cryptography.aesEncrypt(req.body.settings.headers.signature),
          secretkey:cryptography.aesEncrypt(
            req.body.settings.headers.secretKey
          ),
          token: cryptography.aesEncrypt(
            token
          ),
        },
        body: req.body.settings.body
      },
    };

    data.settings.body = encryptPostBody(data)

    console.log("coba post comment", data);
    let a = await actionPost(data);
    console.log('post comment',a);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.delete("/commentUpdate", async function (req, reply) {
  try {
    let token = extToken ? extToken : req.body.settings.headers.token;
    console.log('req',req.body);
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: hostIPAlt + ":" + await getRedisData(backendPort) + '/dashboard/task/comment',
        method: "POST",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          signature:cryptography.aesEncrypt(req.body.settings.headers.signature),
          secretkey:cryptography.aesEncrypt(
            req.body.settings.headers.secretKey
          ),
          token: cryptography.aesEncrypt(
            token
          ),
        },
        body: req.body.settings.body
      },
    };

    data.settings.body = encryptPostBody(data)

    console.log("coba delete comment", data);
    let a = await actionDelete(data);
    console.log('delete comment',a);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.post("/commentReply", async function (req, reply) {
  try {
    console.log('req',req.body);
    let realBody = JSON.parse(req.body.settings.body);
    delete realBody.idComment
    let token = extToken ? extToken : req.body.settings.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: hostIPAlt + ":" + await getRedisData(backendPort) + '/dashboard/task/reply?comment=' + JSON.parse(req.body.settings.body).idComment,
        method: "POST",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          signature:cryptography.aesEncrypt(req.body.settings.headers.signature),
          secretkey:cryptography.aesEncrypt(
            req.body.settings.headers.secretKey
          ),
          token: cryptography.aesEncrypt(
            token
          ),
        },
        body: JSON.stringify(realBody)
      },
    };

    data.settings.body = encryptPostBody(data)

    console.log("coba reply post comment", data);
    let a = await actionPost(data);
    console.log('post reply comment',a);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.put("/commentReply", async function (req, reply) {
  try {
    console.log('req',req.body);
    let token = extToken ? extToken : req.body.settings.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: hostIPAlt + ":" + await getRedisData(backendPort) + '/dashboard/task/reply',
        method: "PUT",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          signature:cryptography.aesEncrypt(req.body.settings.headers.signature),
          secretkey:cryptography.aesEncrypt(
            req.body.settings.headers.secretKey
          ),
          token: cryptography.aesEncrypt(
            token
          ),
        },
        body: req.body.settings.body
      },
    };

    data.settings.body = encryptPostBody(data)

    console.log("coba reply put comment", data);
    let a = await actionPut(data);
    console.log('put reply comment',a);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.delete("/commentReply", async function (req, reply) {
  try {
    console.log('req',req.body);
    let token = extToken ? extToken : req.body.settings.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: hostIPAlt + ":" + await getRedisData(backendPort) + '/dashboard/task/reply',
        method: "DELETE",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          signature:cryptography.aesEncrypt(req.body.settings.headers.signature),
          secretkey:cryptography.aesEncrypt(
            req.body.settings.headers.secretKey
          ),
          token: cryptography.aesEncrypt(
            token
          ),
        },
        body: req.body.settings.body
      },
    };

    data.settings.body = encryptPostBody(data)

    console.log("coba reply delete comment", data);
    let a = await actionDelete(data);
    console.log('delete reply comment',a);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.put("/commentUpdate", async function (req, reply) {
  try {
    console.log('req',req.body);
    let token = extToken ? extToken : req.body.settings.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: hostIPAlt + ":" + await getRedisData(backendPort) + '/dashboard/task/comment',
        method: "PUT",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          signature:cryptography.aesEncrypt(req.body.settings.headers.signature),
          secretkey:cryptography.aesEncrypt(
            req.body.settings.headers.secretKey
          ),
          token: cryptography.aesEncrypt(
            token
          ),
        },
        body: req.body.settings.body
      },
    };

    data.settings.body = encryptPostBody(data)

    console.log("coba put comment", data);
    let a = await actionPut(data);
    console.log('put comment',a);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.delete("/deleteGroup", async function (req, reply) {
  try {
    console.log('req',req.body);
    let token = extToken ? extToken : req.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: hostIPAlt + ":" + await getRedisData(backendPort) + '/dashboard/group',
        method: "DELETE",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          target:'getBoard',
          signature:cryptography.aesEncrypt(req.headers.signature),
          secretkey:cryptography.aesEncrypt(
            req.headers.secretkey
          ),
          token: cryptography.aesEncrypt(
           token
          ),
        },
        body: JSON.stringify(req.body)
      },
    };

    data.settings.body = encryptPostBody(data)

    console.log("coba delete group task", data);
    let a = await actionDelete(data);
    console.log('delete gerup tasek',a);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.delete("/deleteTask", async function (req, reply) {
  try {
    console.log('req',req.body);
    let token = extToken ? extToken : req.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: hostIPAlt + ":" + await getRedisData(backendPort) + '/dashboard/task',
        method: "DELETE",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          signature:cryptography.aesEncrypt(req.headers.signature),
          secretkey:cryptography.aesEncrypt(
            req.headers.secretkey
          ),
          token: cryptography.aesEncrypt(
            token
          ),
        },
        body: JSON.stringify(req.body)
      },
    };

    data.settings.body = encryptPostBody(data)

    console.log("coba delete task", data);
    let a = await actionDelete(data);
    console.log('delete tasek',a);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

async function getKey(
  _param,
  _token,
  signature = "",
  secretKey = "",
  urlRdata
) {
  return new Promise(async function (resolve, reject) {
    try {
      let searchBy;
      if (_param == "all") {
        searchBy = _param;
      } else {
        searchBy = {
          name: _param,
        };
      }

      console.log("sseeerarchh", searchBy);
      let getKey = {
        settings: {
          async: true,
          crossDomain: true,
          // "url": hostIP + ":8203/master/key",
          url: urlRdata,
          method: "GET",
          headers: {
            Accept: "*/*",
            "Cache-Control": "no-cache",
            secretKey: cryptography.aesEncrypt(secretKey),
            signature: cryptography.aesEncrypt(signature),
            token: cryptography.aesEncrypt(_token),
            param: cryptography.aesEncrypt(JSON.stringify(searchBy)),
          },
        },
      };
      // console.log('server getKey ==> ', getKey)
      let getKeySend = await actionGet(getKey);
      console.log("server Received Key ===> ");
      if (getKeySend.responseCode == "200") {
        console.log("paramnyaaa", getKeySend.data[0].field_name_origin);
        if (_param == "all") {
          getKeySend = JSON.stringify(returnedConfig);
        } else {
          getKeySend = cryptography.cryptr.decrypt(
            getKeySend.data[0].field_value
          );
          await setRedisData(_param, getKeySend);
        }
      } else {
        getKeySend = "null";
        await setRedisData(_param, getKeySend);
      }

      // console.log ('getKey '+_param, getKeySend)
      resolve(getKeySend);
    } catch (err) {
      resolve(err);
    }
  });
}

fastify.get("/clearRData", async function (req, reply) {
  try {
    // console.log ('clear redis data')
    let idEmp = req.headers.for;
    let cRD = await clearRedisData(idEmp);
    reply.send(cRD);
  } catch (err) {
    reply.send(err);
  }
});

fastify.post("/getRData", async function (request, reply) {
  try {
    let data = request.body.param;
    let token = request.headers.token;
    let signature = request.headers.signature;
    let secretKey = request.headers.secretkey;
    let urlRdata = request.headers.url;
    console.log("redis data get param ==> ", data);
    let bRD = await getRedisData(data, token, signature, secretKey, urlRdata);
    // console.log ('jwbn brd ==> ', bRD)
    reply.send(bRD);
  } catch (err) {
    reply.send(err);
  }
});

async function convertURLRedis(data) {
  try {
    let url;
    switch (data.server_url) {
      case "SERVER_EVE":
        url = redisKey["SERVER_EVE"];
        break;
      case "SERVER_SYAFRI":
        if (redisKey["SERVER_SYAFRI"] == undefined) {
          redisKey["SERVER_SYAFRI"] = await getRedisData("SERVER_SYAFRI");
        }
        url = redisKey["SERVER_SYAFRI"];
        break;
      case "SERVER_CENTOS":
        if (redisKey["SERVER_CENTOS"] == undefined) {
          redisKey["SERVER_CENTOS"] = await getRedisData("SERVER_CENTOS");
        }
        url = redisKey["SERVER_CENTOS"];
        break;
      case "SERVER_RONALD":
        url = redisKey["SERVER_RONALD"];
        break;
      case "SERVER_WAHYU":
        if (redisKey["SERVER_WAHYU"] == undefined) {
          redisKey["SERVER_WAHYU"] = await getRedisData("SERVER_WAHYU");
        }
        url = redisKey["SERVER_WAHYU"];
        break;
      case "SERVER_JIMBO":
        if (redisKey["SERVER_JIMBO"] == undefined) {
          redisKey["SERVER_JIMBO"] = await getRedisData("SERVER_JIMBO");
        }
        url = redisKey["SERVER_JIMBO"];
        break;
      case "AWS_SERVER":
        if (redisKey["AWS_SERVER"] == undefined) {
          redisKey["AWS_SERVER"] = await getRedisData("AWS_SERVER");
        }
        url = redisKey["AWS_SERVER"];
        break;
      default:
        url = redisKey["SERVER_SYAFRI"];
        break;
    }
    url += ":";

    switch (data.port_url) {
      case "PORT_TRANSACTION":
        url += redisKey["PORT_TRANSACTION"];
        break;
      case "PORT_TRANSACTION_AWS":
        if (redisKey["PORT_TRANSACTION_AWS"] == undefined) {
          redisKey["PORT_TRANSACTION_AWS"] = await getRedisData("PORT_TRANSACTION_AWS", token);
        }
        url += redisKey["PORT_TRANSACTION_AWS"];
        break;
      case "PORT_AUTH":
        url += redisKey["PORT_AUTH"];
        break;
      case "PORT_AUTH_AWS":
        if (redisKey["PORT_AUTH_AWS"] == undefined) {
          redisKey["PORT_AUTH_AWS"] = await getRedisData("PORT_AUTH_AWS", token);
        }
        url += redisKey["PORT_AUTH_AWS"];
        break;
      case "PORT_BACKEND":
        url += redisKey["PORT_BACKEND"];
        break;
      case "PORT_BACKEND_AWS":
        if (redisKey["PORT_BACKEND_AWS"] == undefined) {
          redisKey["PORT_BACKEND_AWS"] = await getRedisData("PORT_BACKEND_AWS", token);
        }
        url += redisKey["PORT_BACKEND_AWS"];
        break;
      case "PORT_WITHDRAW":
        url += redisKey["PORT_WITHDRAW"];
        break;
      case "PORT_WITHDRAW_AWS":
        url += redisKey["PORT_WITHDRAW_AWS"];
        break;
      case "PORT_OUTLET":
        url += redisKey["PORT_OUTLET"];
        break;
      case "PORT_OUTLET_AWS":
        url += redisKey["PORT_OUTLET_AWS"];
        break;
      case "PORT_ACC":
        if (redisKey["PORT_ACC"] == undefined) {
          redisKey["PORT_ACC"] = await getRedisData("PORT_ACC", token);
        }
        url += redisKey["PORT_ACC"];
        break;
      case "PORT_ACC_AWS":
        if (redisKey["PORT_ACC_AWS"] == undefined) {
          redisKey["PORT_ACC_AWS"] = await getRedisData("PORT_ACC_AWS", token);
        }
        url += redisKey["PORT_ACC_AWS"];
        break;
      case "PORT_NOTIF":
        url += redisKey["PORT_NOTIF"];
        break;
      case "PORT_ULTIPAY":
        url += redisKey["PORT_ULTIPAY"];
        break;
      default:
        url += redisKey["PORT_BACKEND"];
        break;
    }

    data.url = url + data.url;
    return data.url;
  } catch (err) {
    console.log("Error URL convert", err);
    reply.send(500);
  }
}

async function defineConfig() {
  // ANCHOR MAIN SERVER IP
  hostIP = returnedConfig.SERVER_WAHYU;
  hostNameServer = 'SERVER_WAHYU';
  // hostIP = returnedConfig.AWS_SERVER;
  // hostNameServer = "AWS_SERVER";

  hostIPAlt = returnedConfig.SERVER_WAHYU;

  // ANCHOR MAIN SERVER PORT NAME AND LINK
  accPort = "8443/account";
  backendPort = "PORT_BACKEND_AWS";
  portAcc = "PORT_ACC_AWS";
  portAuth = "PORT_AUTH_AWS";
  portTrans = "PORT_TRANSACTION_AWS";

  // ANCHOR LOCAL URL
  // localUrl = "http://sandbox.dashboard.ultipay.id";
  localUrl = "http://localhost";

  // ANCHOR LOCAL PORT
  employeeLocalPort = "8103";
  csLocalPort = "8105";
}


// Run the server!
const start = async () => {
  try {
    await fastify.listen(8110,'0.0.0.0')
    await getConfig();
    await defineConfig();
    // fastify.log.info(`server listening on ${fastify.server.address().port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()