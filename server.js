"use strict";

require('dotenv').config()
let hostIP;
let accPort;
let localUrl;
let mainLocalPort;
let authPortService;
let backendPortService;
let extToken;
let localhostIP;
let serverDomain;
let domainPlaceUS
let cdnLink;
let responseInvalid = {
  responseCode: '406',
  responseMessage: 'unauthorized'
};
let signatureLogin = require("./signature.js");
let returnedConfig = {};

// Require the framework and instantiate it
const fastify = require("fastify")({
  logger: true,
});
const path = require("path");
const r = require("request");
const request = require("request");
const efs = require('fs');
const cryptography = require("./crypto.js");
const myKey = efs.readFileSync("./server.key", 'utf-8');
var redis = require("redis");
const fs = require('fs');
var client = redis.createClient();
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

fastify.register(require('fastify-multipart'));
fastify.register(require('fastify-static'), {
  root: path.join(__dirname, 'proman/public'),
  prefix: '/proman/public/', // optional: default '/'
})

async function getSource(requestTo, concern) {
  return new Promise(async (resolve, reject) => {
    let link = cdnLink + "/source/" + concern + "/" + requestTo.source + "?v=1&flowEntry=" + requestTo.flow;
    console.log('a', link);
    r.get({
        async: true,
        crossDomain: true,
        headers: {
          Accept: "*/*",
          "Cache-Control": "no-cache",
          "Content-type": "plain/text"
        },
        url: link,
        rejectUnauthorized: false
      },
      function (error, response, body) {
        if (error) {
          console.log('gagal', requestTo.source, link);
          resolve(error);
        } else {
          console.log('diterima', requestTo.source, link);
          resolve(body);
        }
      }
    );
  });
}

fastify.get("/proman/:origin", async function (req, reply) {
  let signature = req.headers.signature;
  let secretKey = req.headers.secretkey;
  let paramTemp;
  try {
    switch (req.params.origin) {
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
        reply.redirect("/proman/login");
        break;
      case "reqpassword":
        reply.sendFile("layouts/login.html");
        break;
      case "employee":
        if (req.query.use == 'project_management') {
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
      default:
        reply.sendFile("layouts/notFound.html");
        break;
    }
  } catch (err) {
    console.log(err);
    reply.send(500);
  }
});

fastify.get("/proman", function (req, reply) {
  reply.redirect("/proman/login");
});

fastify.get("/proman/login", function (req, reply) {
  reply.sendFile("layouts/login.html");
});

fastify.get("/proman/home", function (req, reply) {
  reply.sendFile("layouts/home.html");
});
fastify.get("/proman/displayOnTable", async function (req, reply) {
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
      // console.log("head", data.settings);
      // if(data.settings.headers.Host) delete data.settings.headers.Host;

      let settings = data.settings;
      r.get(settings, function (error, response, body) {
        if (error) {
          if (error.toString().includes('TIMEDOUT')) reject(999)
          else reject(process.env.ERRORINTERNAL_RESPONSE);
        } else {
          // console.log("action Get body data => ", body);
          let result = "";
          if (body !== "" && JSON.parse(body).data !== undefined) {
            result = JSON.parse(body);
            if (settings.headers.target == 'trello' || settings.headers.target == 'getEmployee') result.data = cryptography.decryptMessage(result.data)
            else if (settings.headers.target == 'chartAnalytic') result.data = JSON.parse(cryptography.decryptMessage(result.data))
            else if (settings.headers.target == 'slack' || settings.headers.target == 'telegram') result.data = JSON.parse(cryptography.decryptMessage(result.data))
            else if (settings.headers.target != 'auth') result.data = iterateObjectDecrypt(result.data);
            else result.data = cryptography.decryptMessage(result.data);

            if ("encrypt" in settings.headers) {
              let keyss = generateKey();
              result.data = iterateObjectNewEncrypt(result.data, keyss)
              result.cred = keyss;
            }
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

fastify.get('/proman/getSession', async function (req, reply) {
  console.log('sesos');
  let sessionGet = await getSession(req.headers.for);
  reply.send(sessionGet);
})

function getSession(idEmployee) {
  return new Promise(async (resolve, reject) => {
    console.log("get session neh")
    try {
      client.get('projectManagement' + idEmployee, async function (err, result) {
        console.log(result);
        let resultLogin = JSON.parse(result);
        if (resultLogin != null) {
          resolve(result);
        } else reject(404);
      });
    } catch (err) {
      console.log(err);
      reject(500);
    }
  })

}

fastify.post("/proman/sendEmailReset", async function (req, reply) {
  try {
    let data = req.body;
    data.settings.url = hostIP + ":" + accPort + data.settings.url;
    data.settings.body = encryptPostBody(data);
    console.log("coba send email", data);
    let a = await actionPost(data);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.put("/proman/sendNewPassword", async function (req, reply) {
  try {
    let data = req.body;
    data.settings.url = hostIP + ":" + accPort + data.settings.url;
    data.settings.body = encryptPostBody(data);
    console.log("coba send new password", data);
    let a = await actionPut(data);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

function iterateObject(obj) {
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === "object") {
      iterateObject(obj[key]);
    } else {
      if (obj[key] != 'comment_file') obj[key] = cryptography.encryptMessage(obj[key]);
    }
  });
  return obj;
}

function iterateObjectDecrypt(obj) {
  let temp;

  Object.keys(obj).forEach((key) => {
    try {
      if (typeof obj[key] === "object") {
        iterateObjectDecrypt(obj[key]);
      } else {
        temp = obj[key];
        obj[key] = cryptography.decryptMessage(obj[key]);
        if (obj[key] == "") obj[key] = temp;
        if (obj[key].toString().includes("error")) obj[key] = temp;
      }
    } catch (e) {
      obj[key] = false;
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
          if (json) {
            result = JSON.parse(body);
            console.log("action Post sblm decrypt => ", result);
            if (data.settings.url.includes("listTicketing") || data.settings.url.includes('login')) {
              if (result.data) result.data = JSON.parse(cryptography.decryptMessage(result.data));
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
          if (json) {
            result = JSON.parse(body);
          } else {
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
          if (json) {
            result = JSON.parse(body);
          } else {
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

fastify.post("/proman/getData", async function (req, reply) {
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
    if (err == 999) reply.send(999)
    else reply.send(500);
  }
});

fastify.get("/proman/getFile", async function (req, reply) {
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

function iterateObjectDecryptAESLogin(obj) {
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === "object") {
      iterateObjectDecryptAESLogin(obj[key]);
    } else {
      obj[key] = cryptography.aesDecryptClient(obj[key]);
    }
  });
  return obj;
}

fastify.post("/proman/oneSignalInit", async function (request, reply) {
  try {
    let data = request.body;
    if (data.settings.target == "onesignal") {
      data.settings.url = returnedConfig.hostIP + ":" + returnedConfig.backendPortService + data.settings.url
    }
    data.settings.headers.signature = cryptography.aesEncrypt(
      data.settings.headers.signature
    );
    data.settings.headers.secretKey = cryptography.aesEncrypt(
      data.settings.headers.secretKey
    );
    data.settings.headers.token = cryptography.aesEncrypt(
      data.settings.headers.token
    );
    data.settings.body = encryptPostBody(data);
    let a = await actionPost(data);
    console.log('response', a);
    reply.send(a);
  } catch (err) {
    reply.send(err);
  }
});


fastify.post("/proman/postData", async function (request, reply) {
  try {
    let data = request.body;
    data.settings.url = returnedConfig.hostIP + ':' + returnedConfig.authPortService + data.settings.url;
    data.settings.headers.signature = cryptography.aesEncrypt(
      signatureLogin.signatureNew
    );
    if ("keyencrypt" in data.settings.headers && await validateKeyEncrypt(data.settings.headers.keyencrypt)) {
      data.settings.body = JSON.stringify(iterateObjectNewDecrypt(JSON.parse(data.settings.body), data.settings.headers.keyencrypt))
      data.settings.body = encryptPostBody(data);
      let a = await actionPost(data);
      reply.send(a);
    } else {
      reply.send(responseInvalid)
    }
  } catch (err) {
    reply.send(err);
  }
});

function IsJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

fastify.get("/proman/trello_management", function (req, reply) {
  reply.sendFile("layouts/trello/trelloManagement.html");
});

fastify.get("/proman/project_management", function (req, reply) {
  reply.sendFile("layouts/projectManagement.html");
});

fastify.get("/proman/projectBoard", function (req, reply) {
  reply.sendFile("layouts/projectBoard.html");
});

fastify.get("/proman/trelloBoardPage", function (req, reply) {
  reply.sendFile("layouts/trello/trelloBoard.html");
});

fastify.post("/proman/postBoard", async function (req, reply) {
  try {
    let data = req.body;
    let token = extToken ? extToken : data.settings.headers.token;

    if ("keyencrypt" in data.settings.headers && await validateKeyEncrypt(data.settings.headers.keyencrypt)) {
      data.settings.body = JSON.stringify(iterateObjectNewDecrypt(JSON.parse(data.settings.body), data.settings.headers.keyencrypt))
      data.settings.url = returnedConfig.hostIP + ":" + returnedConfig.backendPortService + '/dashboard/board';
      data.settings.headers.signature = cryptography.aesEncrypt(
        data.settings.headers.signature
      );
      data.settings.headers.secretKey = cryptography.aesEncrypt(
        data.settings.headers.secretKey
      );
      data.settings.headers.token = cryptography.aesEncrypt(
        token
      );
      console.log('dataaaaaa', data.settings);
      data.settings.body = encryptPostBody(data);
      console.log("coba send email", data);
      let a = await actionPost(data);
      reply.send(a);
    } else {
      reply.send(responseInvalid)
    }

  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.delete("/proman/board", async function (req, reply) {
  try {
    let data
    try {
      data = JSON.parse(req.body);
    } catch (error) {
      data = req.body;
    }
    console.log('dataa', data);
    let token = extToken ? extToken : data.settings.headers.token;
    if ("keyencrypt" in data.settings.headers && await validateKeyEncrypt(data.settings.headers.keyencrypt)) {
      data.settings.body = JSON.stringify(iterateObjectNewDecrypt(JSON.parse(data.settings.body), data.settings.headers.keyencrypt))
      data.settings.url = returnedConfig.hostIP + ":" + returnedConfig.backendPortService + '/dashboard/board';
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
    } else {
      reply.send(responseInvalid)
    }
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.put("/proman/board", async function (req, reply) {
  try {
    let data = req.body;
    let token = extToken ? extToken : data.settings.headers.token;

    if ("keyencrypt" in data.settings.headers && await validateKeyEncrypt(data.settings.headers.keyencrypt)) {
      data.settings.body = JSON.stringify(iterateObjectNewDecrypt(JSON.parse(data.settings.body), data.settings.headers.keyencrypt))
      data.settings.url = returnedConfig.hostIP + ":" + returnedConfig.backendPortService + '/dashboard/board';

      data.settings.headers.signature = cryptography.aesEncrypt(
        data.settings.headers.signature
      );
      data.settings.headers.secretKey = cryptography.aesEncrypt(
        data.settings.headers.secretKey
      );
      data.settings.headers.token = cryptography.aesEncrypt(
        token
      );
      console.log('before', data.settings.body);
      data.settings.body = encryptPostBody(data);

      console.log("coba put board", data);
      let a = await actionPut(data);
      reply.send(a);
    } else {
      reply.send(responseInvalid)
    }
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.post("/proman/postTask", async function (req, reply) {
  try {
    let data = req.body;
    data.settings.url = returnedConfig.hostIP + ":" + returnedConfig.backendPortService + '/dashboard/task';
    let token = extToken ? extToken : data.settings.headers.token;

    if ("keyencrypt" in data.settings.headers && await validateKeyEncrypt(data.settings.headers.keyencrypt)) {
      data.settings.body = JSON.stringify(iterateObjectNewDecrypt(JSON.parse(data.settings.body), data.settings.headers.keyencrypt))
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
      console.log('post post task', a);
      reply.send(a);
    } else {
      reply.send(responseInvalid)
    }
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.post("/proman/postGroup", async function (req, reply) {
  try {
    let data = req.body;
    data.settings.url = returnedConfig.hostIP + ":" + returnedConfig.backendPortService + '/dashboard/group';
    let token = extToken ? extToken : data.settings.headers.token;
    if ("keyencrypt" in data.settings.headers && await validateKeyEncrypt(data.settings.headers.keyencrypt)) {
      data.settings.body = JSON.stringify(iterateObjectNewDecrypt(JSON.parse(data.settings.body), data.settings.headers.keyencrypt))
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
    } else {
      reply.send(responseInvalid)
    }


  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.get("/proman/board", async function (req, reply) {
  try {
    let token = extToken ? extToken : req.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: returnedConfig.hostIP + ":" + returnedConfig.backendPortService + '/dashboard/board',
        method: "GET",
        headers: {
          Accept: "*/*",
          "Cache-Control": "no-cache",
          target: 'getBoard',
          signature: cryptography.aesEncrypt(req.headers.signature),
          secretkey: cryptography.aesEncrypt(
            req.headers.secretkey
          ),
          token: cryptography.aesEncrypt(
            token
          ),
          param: cryptography.aesEncrypt(
            req.headers.param
          ),
          encrypt: true
        },
      },
    };

    console.log("coba get board", req.headers);
    let a = await actionGet(data);
    console.log('aaaaa', a);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.get("/proman/getChannelTelegram", async function (req, reply) {
  try {
    let token = extToken ? extToken : req.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: returnedConfig.hostIP + ":" + returnedConfig.backendPortService + '/dashboard/telegram/subscriber',
        method: "GET",
        headers: {
          Accept: "*/*",
          "Cache-Control": "no-cache",
          "target": "telegram",
          signature: cryptography.aesEncrypt(req.headers.signature),
          secretkey: cryptography.aesEncrypt(
            req.headers.secretkey
          ),
          token: cryptography.aesEncrypt(
            token
          ),
          encrypt: true
        },
      },
    };

    console.log("coba get telegram", data);
    let a = await actionGet(data);
    console.log('aaaaa telegram', a);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.get("/proman/getChannelSlack", async function (req, reply) {
  try {
    let token = extToken ? extToken : req.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: returnedConfig.hostIP + ":" + returnedConfig.backendPortService + '/dashboard/slack/channel',
        method: "GET",
        headers: {
          Accept: "*/*",
          "Cache-Control": "no-cache",
          "target": "slack",
          signature: cryptography.aesEncrypt(req.headers.signature),
          secretkey: cryptography.aesEncrypt(
            req.headers.secretkey
          ),
          token: cryptography.aesEncrypt(
            token
          )
        },
      },
    };

    console.log("coba get slack", data);
    let a = await actionGet(data);
    console.log('aaaaa slack', a);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.get("/proman/getSlackSettings", async function (req, reply) {
  try {
    let token = extToken ? extToken : req.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: returnedConfig.hostIP + ":" + returnedConfig.backendPortService + '/dashboard/user/setting',
        method: "GET",
        headers: {
          Accept: "*/*",
          "Cache-Control": "no-cache",
          "target": "slack",
          signature: cryptography.aesEncrypt(req.headers.signature),
          secretkey: cryptography.aesEncrypt(
            req.headers.secretkey
          ),
          token: cryptography.aesEncrypt(
            token
          ),
          encrypt: true
        },
      },
    };

    console.log("coba get slack settings", data);
    let a = await actionGet(data);
    console.log('aaaaa slack settings', a);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.post("/proman/submitActivationSlack", async function (req, reply) {
  try {
    let data;
    try {
      data = JSON.parse(req.body);
    } catch (error) {
      data = req.body;
    }
    let token = extToken ? extToken : req.headers.token;
    if ("keyencrypt" in data.settings.headers && await validateKeyEncrypt(data.settings.headers.keyencrypt)) {
      data.settings.body = JSON.stringify(iterateObjectNewDecrypt(JSON.parse(data.settings.body), data.settings.headers.keyencrypt))
      let datas = {
        settings: {
          async: true,
          crossDomain: true,
          url: returnedConfig.hostIP + ":" + returnedConfig.backendPortService + '/dashboard/user/setting',
          method: "POST",
          headers: {
            Accept: "*/*",
            "Cache-Control": "no-cache",
            "Content-Type": 'application/json',
            signature: cryptography.aesEncrypt(req.headers.signature),
            secretkey: cryptography.aesEncrypt(
              req.headers.secretkey
            ),
            token: cryptography.aesEncrypt(
              token
            )
          },
          body: JSON.stringify(iterateObject(JSON.parse(data.settings.body)))
        },
      };

      console.log("coba post activate slack", datas);
      let a = await actionPost(datas);
      console.log('aaaaa activate slack post', a);
      reply.send(a);
    } else {
      reply.send(responseInvalid)
    }
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.post("/proman/submitChannel", async function (req, reply) {
  try {

    let data;
    try {
      data = JSON.parse(req.body);
    } catch (error) {
      data = req.body;
    }
    let token = extToken ? extToken : req.headers.token;
    if ("keyencrypt" in data.settings.headers && await validateKeyEncrypt(data.settings.headers.keyencrypt)) {
      data.settings.body = JSON.stringify(iterateObjectNewDecrypt(JSON.parse(data.settings.body), data.settings.headers.keyencrypt))
      console.log('data', data.settings.body);
      let datas = {
        settings: {
          async: true,
          crossDomain: true,
          url: returnedConfig.hostIP + ":" + returnedConfig.backendPortService + '/dashboard/user/setting',
          method: "POST",
          headers: {
            Accept: "*/*",
            "Cache-Control": "no-cache",
            "Content-Type": 'application/json',
            signature: cryptography.aesEncrypt(req.headers.signature),
            secretkey: cryptography.aesEncrypt(
              req.headers.secretkey
            ),
            token: cryptography.aesEncrypt(
              token
            )
          },
          body: JSON.stringify(iterateObject(JSON.parse(data.settings.body)))
        },
      };

      console.log("coba post channel slack", datas);
      let a = await actionPost(datas);
      console.log('aaaaa slack post', a);
      reply.send(a);
    } else {
      reply.send(responseInvalid)
    }
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});


fastify.get("/proman/getEmployee", async function (req, reply) {
  try {
    let token = extToken ? extToken : req.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: returnedConfig.hostIP + ":" + returnedConfig.backendPortService + '/dashboard/employee',
        method: "GET",
        headers: {
          Accept: "*/*",
          "Cache-Control": "no-cache",
          target: 'getEmployee',
          signature: cryptography.aesEncrypt(req.headers.signature),
          secretkey: cryptography.aesEncrypt(
            req.headers.secretkey
          ),
          token: cryptography.aesEncrypt(
            token
          ),
          param: cryptography.aesEncrypt('all'),
          apiService: cryptography.aesEncrypt('x'),
        },
      },
    };

    console.log("coba get employee", data);
    let a = await actionGet(data);
    console.log('aaaaa employee', a);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.get("/proman/getDivision", async function (req, reply) {
  try {
    let token = extToken ? extToken : req.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: returnedConfig.hostIP + ":" + returnedConfig.backendPortService + '/customerService/list/division',
        method: "GET",
        headers: {
          Accept: "*/*",
          "Cache-Control": "no-cache",
          target: 'getDivision',
          signature: cryptography.aesEncrypt(req.headers.signature),
          secretkey: cryptography.aesEncrypt(
            req.headers.secretkey
          ),
          token: cryptography.aesEncrypt(
            token
          ),
        },
      },
    };

    console.log("coba get division", data);
    let a = await actionGet(data);
    console.log('aaaaa division', a);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.get("/proman/goAuth", async function (req, reply) {
  try {
    let token = extToken ? extToken : req.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: returnedConfig.hostIP + ":" + returnedConfig.backendPortService + '/dashboard/trello/auth',
        method: "GET",
        headers: {
          Accept: "*/*",
          "Cache-Control": "no-cache",
          "target": 'auth',
          signature: cryptography.aesEncrypt(req.headers.signature),
          secretkey: cryptography.aesEncrypt(
            req.headers.secretkey
          ),
          token: cryptography.aesEncrypt(
            token
          ),
        },
      },
    };

    console.log("coba get auth", data);
    let a = await actionGet(data);
    console.log('aaaaauuuutttthhhh', a);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.post("/proman/confirmAuthToken", async function (req, reply) {
  try {
    let token = extToken ? extToken : req.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: returnedConfig.hostIP + ":" + returnedConfig.backendPortService + '/dashboard/trello/auth',
        method: "POST",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          signature: cryptography.aesEncrypt(req.headers.signature),
          secretkey: cryptography.aesEncrypt(
            req.headers.secretkey
          ),
          token: cryptography.aesEncrypt(
            token
          ),
        },
        body: JSON.stringify(iterateObject(req.body))
      },
    };

    console.log("coba post auth", data);
    let a = await actionPost(data);
    console.log('postttt authhhh', a);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});


fastify.get("/proman/trelloBoard", async function (req, reply) {
  try {
    let token = extToken ? extToken : req.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: returnedConfig.hostIP + ":" + returnedConfig.backendPortService + '/trello/board',
        method: "GET",
        headers: {
          Accept: "*/*",
          "Cache-Control": "no-cache",
          "target": 'trello',
          signature: cryptography.aesEncrypt(req.headers.signature),
          secretkey: cryptography.aesEncrypt(
            req.headers.secretkey
          ),
          token: cryptography.aesEncrypt(
            token
          ),
          param: cryptography.aesEncrypt(
            req.headers.param
          ),
        },
      },
    };
    let a = await actionGet(data);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.get("/proman/trelloList", async function (req, reply) {
  try {
    let token = extToken ? extToken : req.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: returnedConfig.hostIP + ":" + returnedConfig.backendPortService + '/trello/list',
        method: "GET",
        headers: {
          Accept: "*/*",
          "Cache-Control": "no-cache",
          "target": 'trello',
          signature: cryptography.aesEncrypt(req.headers.signature),
          secretkey: cryptography.aesEncrypt(
            req.headers.secretkey
          ),
          token: cryptography.aesEncrypt(
            token
          ),
          param: cryptography.aesEncrypt(
            req.headers.param
          ),
        },
      },
    };
    let a = await actionGet(data);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.get("/proman/getCardData", async function (req, reply) {
  try {
    let token = extToken ? extToken : req.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: returnedConfig.hostIP + ":" + returnedConfig.backendPortService + '/trello/card',
        method: "GET",
        headers: {
          Accept: "*/*",
          "Cache-Control": "no-cache",
          "target": 'trello',
          signature: cryptography.aesEncrypt(req.headers.signature),
          secretkey: cryptography.aesEncrypt(
            req.headers.secretkey
          ),
          token: cryptography.aesEncrypt(
            token
          ),
          param: cryptography.aesEncrypt(
            req.headers.param
          ),
        },
      },
    };
    let a = await actionGet(data);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.delete("/proman/deleteList", async function (req, reply) {
  try {
    let token = extToken ? extToken : req.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: returnedConfig.hostIP + ":" + returnedConfig.backendPortService + '/dashboard/trello/list',
        method: "DELETE",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          signature: cryptography.aesEncrypt(req.headers.signature),
          secretkey: cryptography.aesEncrypt(
            req.headers.secretkey
          ),
          token: cryptography.aesEncrypt(
            token
          ),
        },
        body: JSON.stringify(iterateObject(req.body))
      },
    };
    let a = await actionDelete(data);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.put("/proman/renameList", async function (req, reply) {
  try {
    let token = extToken ? extToken : req.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: returnedConfig.hostIP + ":" + returnedConfig.backendPortService + '/dashboard/trello/list',
        method: "PUT",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          signature: cryptography.aesEncrypt(req.headers.signature),
          secretkey: cryptography.aesEncrypt(
            req.headers.secretkey
          ),
          token: cryptography.aesEncrypt(
            token
          ),
        },
        body: JSON.stringify(iterateObject(req.body))
      },
    };
    let a = await actionPut(data);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.put("/proman/putTaskTrello", async function (req, reply) {
  try {
    let token = extToken ? extToken : req.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: returnedConfig.hostIP + ":" + returnedConfig.backendPortService + '/dashboard/trello/card',
        method: "PUT",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          signature: cryptography.aesEncrypt(req.headers.signature),
          secretkey: cryptography.aesEncrypt(
            req.headers.secretkey
          ),
          token: cryptography.aesEncrypt(
            token
          ),
        },
        body: JSON.stringify(iterateObject(req.body))
      },
    };

    console.log("coba put task timeline", data);
    let a = await actionPut(data);
    console.log('put task timelinee', a);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.delete("/proman/deleteTaskTrello", async function (req, reply) {
  try {
    let token = extToken ? extToken : req.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: returnedConfig.hostIP + ":" + returnedConfig.backendPortService + '/dashboard/trello/card',
        method: "DELETE",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          signature: cryptography.aesEncrypt(req.headers.signature),
          secretkey: cryptography.aesEncrypt(
            req.headers.secretkey
          ),
          token: cryptography.aesEncrypt(
            token
          ),
        },
        body: JSON.stringify(iterateObject(req.body))
      },
    };

    console.log("coba put task timeline", data);
    let a = await actionDelete(data);
    console.log('put task timelinee', a);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.put("/proman/renameBoard", async function (req, reply) {
  try {
    let token = extToken ? extToken : req.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: returnedConfig.hostIP + ":" + returnedConfig.backendPortService + '/dashboard/trello/board',
        method: "PUT",
        headers: {
          Accept: "*/*",
          "Cache-Control": "no-cache",
          "Content-Type": 'application/json',
          signature: cryptography.aesEncrypt(req.headers.signature),
          secretkey: cryptography.aesEncrypt(
            req.headers.secretkey
          ),
          token: cryptography.aesEncrypt(
            token
          ),
        },
        body: JSON.stringify(iterateObject(req.body))
      },
    };
    let a = await actionPut(data);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.delete("/proman/deleteBoardTrello", async function (req, reply) {
  try {
    let token = extToken ? extToken : req.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: returnedConfig.hostIP + ":" + returnedConfig.backendPortService + '/dashboard/trello/board',
        method: "DELETE",
        headers: {
          Accept: "*/*",
          "Cache-Control": "no-cache",
          "Content-Type": 'application/json',
          signature: cryptography.aesEncrypt(req.headers.signature),
          secretkey: cryptography.aesEncrypt(
            req.headers.secretkey
          ),
          token: cryptography.aesEncrypt(
            token
          ),
        },
        body: JSON.stringify(iterateObject(req.body))
      },
    };

    let a = await actionDelete(data);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.get("/proman/getChartAnalytic", async function (req, reply) {
  try {
    let token = extToken ? extToken : req.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: returnedConfig.hostIP + ":" + returnedConfig.backendPortService + '/dashboard/summary',
        method: "GET",
        headers: {
          Accept: "*/*",
          "Cache-Control": "no-cache",
          target: 'chartAnalytic',
          signature: cryptography.aesEncrypt(req.headers.signature),
          secretkey: cryptography.aesEncrypt(
            req.headers.secretkey
          ),
          token: cryptography.aesEncrypt(
            token
          ),
          param: cryptography.aesEncrypt(
            req.headers.param
          ),
          encrypt: true
        },
      },
    };

    // console.log("coba get analytical", data);
    let a = await actionGet(data);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});


fastify.get("/proman/summaryBoard", async function (req, reply) {
  try {
    let token = extToken ? extToken : req.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: returnedConfig.hostIP + ":" + returnedConfig.backendPortService + '/dashboard/board',
        method: "GET",
        headers: {
          Accept: "*/*",
          "Cache-Control": "no-cache",
          target: 'getSummaryBoard',
          signature: cryptography.aesEncrypt(req.headers.signature),
          secretkey: cryptography.aesEncrypt(
            req.headers.secretkey
          ),
          token: cryptography.aesEncrypt(
            token
          ),
          param: cryptography.aesEncrypt(
            req.headers.param
          ),
          category: cryptography.aesEncrypt(
            req.headers.category
          ),
          encrypt:true
        },
      },
    };

    // console.log("coba get summaryBoard", data);
    let a = await actionGet(data);
    console.log('aaaaa',a);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.get("/proman/getGroupTask", async function (req, reply) {
  try {
    let token = extToken ? extToken : req.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: returnedConfig.hostIP + ":" + returnedConfig.backendPortService + '/dashboard/group',
        method: "GET",
        headers: {
          Accept: "*/*",
          "Cache-Control": "no-cache",
          target: 'getBoard',
          signature: cryptography.aesEncrypt(req.headers.signature),
          secretkey: cryptography.aesEncrypt(
            req.headers.secretkey
          ),
          token: cryptography.aesEncrypt(
            token
          ),
          param: cryptography.aesEncrypt(
            req.headers.param
          ),
          encrypt: true
        },
      },
    };

    console.log("coba get group task", data);
    let a = await actionGet(data);
    console.log('gerup tasek', a);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.get("/proman/getTaskData", async function (req, reply) {
  try {
    console.log('req', req.headers);
    let token = extToken ? extToken : req.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: returnedConfig.hostIP + ":" + returnedConfig.backendPortService + '/dashboard/task',
        method: "GET",
        headers: {
          Accept: "*/*",
          "Cache-Control": "no-cache",
          target: 'getBoard',
          signature: cryptography.aesEncrypt(req.headers.signature),
          secretkey: cryptography.aesEncrypt(
            req.headers.secretkey
          ),
          token: cryptography.aesEncrypt(
            token
          ),
          param: cryptography.aesEncrypt(
            req.headers.param
          ),
          encrypt: true
        },
      },
    };

    console.log("coba get task", data);
    let a = await actionGet(data);
    console.log('tasek', a);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.get("/proman/comment", async function (req, reply) {
  try {
    let token = extToken ? extToken : req.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: returnedConfig.hostIP + ":" + returnedConfig.backendPortService + '/dashboard/task/comment',
        method: "GET",
        headers: {
          Accept: "*/*",
          "Cache-Control": "no-cache",
          target: 'getBoard',
          signature: cryptography.aesEncrypt(req.headers.signature),
          secretkey: cryptography.aesEncrypt(
            req.headers.secretkey
          ),
          token: cryptography.aesEncrypt(
            token
          ),
          param: cryptography.aesEncrypt(
            req.headers.param
          ),
          encrypt: true
        },
      },
    };

    // console.log("coba get comment", data);
    let a = await actionGet(data);
    // console.log('komen',a);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.get('/proman/google/response', async function (request, reply) {
  reply.type('text/html').send(await getSource({
    source: 'googleResponse',
    flow: 'ultipayDashboard'
  }, 'page'))
})

fastify.post("/proman/google/syncGoogle", async function (req, reply) {
  try {
    let token = extToken ? extToken : req.headers.token;
    console.log('aaa', req.headers);
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: returnedConfig.hostIP + ":" + returnedConfig.backendPortService + '/google/auth',
        method: "POST",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          signature: cryptography.aesEncrypt(req.headers.signature),
          secretkey: cryptography.aesEncrypt(
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
    let a = await actionPost(data);
    console.log('post sync', a);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.post("/proman/syncGoogle", async function (req, reply) {
  try {
    let token = extToken ? extToken : req.headers.token;
    if ("keyencrypt" in req.headers && await validateKeyEncrypt(req.headers.keyencrypt)) {
      req.body = JSON.stringify(iterateObjectNewDecrypt(JSON.parse(req.body), req.headers.keyencrypt))
      let data = {
        settings: {
          async: true,
          crossDomain: true,
          url: returnedConfig.hostIP + ":" + returnedConfig.backendPortService + '/dashboard/task/calendar',
          method: "POST",
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            signature: cryptography.aesEncrypt(req.headers.signature),
            secretkey: cryptography.aesEncrypt(
              req.headers.secretkey
            ),
            token: cryptography.aesEncrypt(
              token
            ),
          },
          body: req.body
        },
      };

      data.settings.body = encryptPostBody(data)

      console.log("coba post sync", data);
      let a = await actionPost(data);
      console.log('post sync', a);
      reply.send(a);
    } else {
      reply.send(responseInvalid)
    }
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.put("/proman/editGroup", async function (req, reply) {
  try {
    let token = extToken ? extToken : req.headers.token;
    if ("keyencrypt" in req.headers && await validateKeyEncrypt(req.headers.keyencrypt)) {
      req.body = JSON.stringify(iterateObjectNewDecrypt(JSON.parse(req.body), req.headers.keyencrypt))
      let data = {
        settings: {
          async: true,
          crossDomain: true,
          url: returnedConfig.hostIP + ":" + returnedConfig.backendPortService + '/dashboard/group',
          method: "PUT",
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            target: 'getBoard',
            signature: cryptography.aesEncrypt(req.headers.signature),
            secretkey: cryptography.aesEncrypt(
              req.headers.secretkey
            ),
            token: cryptography.aesEncrypt(
              token
            ),
          },
          body: req.body
        },
      };

      data.settings.body = encryptPostBody(data)

      console.log("coba edit group task", data);
      let a = await actionPut(data);
      console.log('edit gerup tasek', a);
      reply.send(a);
    } else {
      reply.send(responseInvalid)
    }
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.put("/proman/putTask", async function (req, reply) {
  try {
    // console.log('req put task',JSON.parse(req.body));
    let sett = JSON.parse(req.body);
    let token = extToken ? extToken : sett.settings.headers.token;
    if ("keyencrypt" in sett.settings.headers && await validateKeyEncrypt(sett.settings.headers.keyencrypt)) {
      sett.settings.body = JSON.stringify(iterateObjectNewDecrypt(JSON.parse(sett.settings.body), sett.settings.headers.keyencrypt))
      let data = {
        settings: {
          async: true,
          crossDomain: true,
          url: returnedConfig.hostIP + ":" + returnedConfig.backendPortService + '/dashboard/task',
          method: "PUT",
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            signature: cryptography.aesEncrypt(sett.settings.headers.signature),
            secretkey: cryptography.aesEncrypt(
              sett.settings.headers.secretKey
            ),
            token: cryptography.aesEncrypt(
              token
            ),
          },
          body: sett.settings.body
        },
      };

      data.settings.body = encryptPostBody(data)

      console.log("coba put timeline", data);
      let a = await actionPut(data);
      console.log('put timelinee', a);
      reply.send(a);
    } else {
      reply.send(responseInvalid)
    }
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.put("/proman/attachFile", async function (request, reply) {
  try {
    if (!request.isMultipart()) {
      reply.code(400).send(new Error('Request is not multipart'))
      return
    }
    let data = [];
    const mp = request.multipart(handler, onEnd)

    mp.on('field', function (key, value) {
      data[key] = value;
    })

    async function onEnd(err) {
      let token = extToken ? extToken : request.headers.token;
      data = Object.assign({}, data);
      var dataSend = {
        settings: {
          "async": true,
          "crossDomain": true,
          url: returnedConfig.hostIP + ":" + returnedConfig.backendPortService + '/dashboard/task/file',
          method: "PUT",
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            signature: cryptography.aesEncrypt(request.headers.signature),
            secretkey: cryptography.aesEncrypt(
              request.headers.secretkey
            ),
            token: cryptography.aesEncrypt(
              token
            ),
          },
        }
      };
      data.id = cryptography.encryptMessage(data.id);
      data.file = data.file;
      dataSend.settings.formData = data;
      let a = await actionPut(dataSend);
      console.log('a attachment update', a);
      reply.send(a);
    }

    function handler(field, file, filename, encoding, mimetype) {

    }
  } catch (error) {
    console.log("eroor: ", error);
    reply.send(error);
  }
});

fastify.post("/proman/attachFile", async function (request, reply) {
  try {
    if (!request.isMultipart()) {
      reply.code(400).send(new Error('Request is not multipart'))
      return
    }
    let data = [];
    const mp = request.multipart(handler, onEnd)

    mp.on('field', function (key, value) {
      data[key] = value;
    })

    async function onEnd(err) {
      let token = extToken ? extToken : request.headers.token;
      data = Object.assign({}, data);
      var dataSend = {
        settings: {
          "async": true,
          "crossDomain": true,
          url: returnedConfig.hostIP + ":" + returnedConfig.backendPortService + '/dashboard/task/file',
          method: "POST",
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            signature: cryptography.aesEncrypt(request.headers.signature),
            secretkey: cryptography.aesEncrypt(
              request.headers.secretkey
            ),
            token: cryptography.aesEncrypt(
              token
            ),
          },
        }
      };
      data.id = cryptography.encryptMessage(data.id);
      data.file = data.file;
      dataSend.settings.formData = data;
      let a = await actionPost(dataSend);
      reply.send(a);
    }

    function handler(field, file, filename, encoding, mimetype) {

    }
  } catch (error) {
    console.log("eroor: ", error);
    reply.send(error);
  }
});

fastify.get("/proman/showAttachmentDetails", async function (req, reply) {
  try {
    let token = req.headers.token;
    let signature = req.headers.signature;
    let secretKey = req.headers.secretkey;
    let param = req.headers.param;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: returnedConfig.hostIP + ":" + returnedConfig.backendPortService + "/getFile/" + req.headers.id,
        method: "GET",
        headers: {
          Accept: "*/*",
          "Cache-Control": "no-cache",
          token: cryptography.aesEncrypt(token),
          signature: cryptography.aesEncrypt(signature),
          secretKey: cryptography.aesEncrypt(secretKey),
        },
      },
    };
    let a = await actionGet(data);
    reply.send(a);
  } catch (err) {
    reply.send(500);
  }
});

fastify.post("/proman/commentUpdate", async function (request, reply) {
  try {
    if (!request.isMultipart()) {
      reply.code(400).send(new Error('Request is not multipart'))
      return
    }
    let data = [];
    const mp = request.multipart(handler, onEnd)

    mp.on('field', function (key, value) {
      data[key] = value;
    })

    async function onEnd(err) {
      let token = extToken ? extToken : request.headers.token;
      data = Object.assign({}, data);
      var dataSend = {
        settings: {
          "async": true,
          "crossDomain": true,
          url: returnedConfig.hostIP + ":" + returnedConfig.backendPortService + '/dashboard/task/comment',
          method: "POST",
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            signature: cryptography.aesEncrypt(request.headers.signature),
            secretkey: cryptography.aesEncrypt(
              request.headers.secretkey
            ),
            token: cryptography.aesEncrypt(
              token
            ),
          },
        }
      };
      data.task_id = cryptography.encryptMessage(data.task_id);
      data.comment = cryptography.encryptMessage(data.comment);
      data.url = cryptography.encryptMessage(data.url);
      data.comment_file = data.comment_file;
      data.user_create = cryptography.encryptMessage(data.user_create);
      dataSend.settings.formData = data;
      let a = await actionPost(dataSend);
      console.log('a form data', a);
      reply.send(a);
    }

    function handler(field, file, filename, encoding, mimetype) {

    }
  } catch (error) {
    console.log("eroor: ", error);
    reply.send(error);
  }
});

fastify.delete("/proman/commentUpdate", async function (req, reply) {
  try {
    let settingCommentDelete = JSON.parse(req.body);
    let token = extToken ? extToken : settingCommentDelete.settings.headers.token;
    if ("keyencrypt" in settingCommentDelete.settings.headers && await validateKeyEncrypt(settingCommentDelete.settings.headers.keyencrypt)) {
      settingCommentDelete.settings.body = JSON.stringify(iterateObjectNewDecrypt(JSON.parse(settingCommentDelete.settings.body), settingCommentDelete.settings.headers.keyencrypt))
      let data = {
        settings: {
          async: true,
          crossDomain: true,
          url: returnedConfig.hostIP + ":" + returnedConfig.backendPortService + '/dashboard/task/comment',
          method: "POST",
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            signature: cryptography.aesEncrypt(settingCommentDelete.settings.headers.signature),
            secretkey: cryptography.aesEncrypt(
              settingCommentDelete.settings.headers.secretKey
            ),
            token: cryptography.aesEncrypt(
              token
            ),
          },
          body: settingCommentDelete.settings.body
        },
      };

      data.settings.body = encryptPostBody(data)

      console.log("coba delete comment", data);
      let a = await actionDelete(data);
      console.log('delete comment', a);
      reply.send(a);
    } else {
      reply.send(responseInvalid)
    }
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.post("/proman/commentReply", async function (request, reply) {
  try {
    if (!request.isMultipart()) {
      reply.code(400).send(new Error('Request is not multipart'))
      return
    }
    let data = [];
    const mp = request.multipart(handler, onEnd)

    mp.on('field', function (key, value) {
      data[key] = value;
    })

    async function onEnd(err) {
      let token = extToken ? extToken : request.headers.token;
      data = Object.assign({}, data);
      var dataSend = {
        settings: {
          "async": true,
          "crossDomain": true,
          url: returnedConfig.hostIP + ":" + returnedConfig.backendPortService + '/dashboard/task/reply',
          method: "POST",
          headers: {
            Accept: "*/*",
            "Cache-Control": "no-cache",
            signature: cryptography.aesEncrypt(request.headers.signature),
            secretkey: cryptography.aesEncrypt(
              request.headers.secretkey
            ),
            token: cryptography.aesEncrypt(
              token
            ),
          },
        }
      };
      data.comment_id = cryptography.encryptMessage(data.comment_id);
      data.comment = cryptography.encryptMessage(data.comment);
      data.comment_file = data.comment_file;
      data.user_create = cryptography.encryptMessage(data.user_create);
      dataSend.settings.formData = data;
      let a = await actionPost(dataSend);
      console.log('a form data', a);
      reply.send(a);
    }

    function handler(field, file, filename, encoding, mimetype) {

    }
  } catch (error) {
    console.log("eroor: ", error);
    reply.send(error);
  }
});

fastify.put("/proman/commentReply", async function (request, reply) {

  try {
    if (!request.isMultipart()) {
      reply.code(400).send(new Error('Request is not multipart'))
      return
    }
    let data = [];
    const mp = request.multipart(handler, onEnd)

    mp.on('field', function (key, value) {
      data[key] = value;
    })

    async function onEnd(err) {
      let token = extToken ? extToken : request.headers.token;
      data = Object.assign({}, data);
      var dataSend = {
        settings: {
          "async": true,
          "crossDomain": true,
          url: returnedConfig.hostIP + ":" + returnedConfig.backendPortService + '/dashboard/task/reply',
          method: "PUT",
          headers: {
            Accept: "*/*",
            "Cache-Control": "no-cache",
            signature: cryptography.aesEncrypt(request.headers.signature),
            secretkey: cryptography.aesEncrypt(
              request.headers.secretkey
            ),
            token: cryptography.aesEncrypt(
              token
            ),
          },
        }
      };
      data._id = cryptography.encryptMessage(data._id);
      data.comment_id = cryptography.encryptMessage(data.comment_id);
      data.comment = cryptography.encryptMessage(data.comment);
      data.comment_file = data.comment_file;
      data.user_create = cryptography.encryptMessage(data.user_create);
      dataSend.settings.formData = data;
      let a = await actionPut(dataSend);
      console.log('a form data', a);
      reply.send(a);
    }

    function handler(field, file, filename, encoding, mimetype) {

    }
  } catch (error) {
    console.log("eroor: ", error);
    reply.send(error);
  }
});

fastify.delete("/proman/commentReply", async function (req, reply) {
  try {
    console.log('req', req.body);
    let commentReplySetting = JSON.parse(req.body);
    let token = extToken ? extToken : commentReplySetting.settings.headers.token;
    if ("keyencrypt" in commentReplySetting.settings.headers && await validateKeyEncrypt(commentReplySetting.settings.headers.keyencrypt)) {
      commentReplySetting.settings.body = JSON.stringify(iterateObjectNewDecrypt(JSON.parse(commentReplySetting.settings.body), commentReplySetting.settings.headers.keyencrypt))
      let data = {
        settings: {
          async: true,
          crossDomain: true,
          url: returnedConfig.hostIP + ":" + returnedConfig.backendPortService + '/dashboard/task/reply',
          method: "DELETE",
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            signature: cryptography.aesEncrypt(commentReplySetting.settings.headers.signature),
            secretkey: cryptography.aesEncrypt(
              commentReplySetting.settings.headers.secretKey
            ),
            token: cryptography.aesEncrypt(
              token
            ),
          },
          body: commentReplySetting.settings.body
        },
      };

      data.settings.body = encryptPostBody(data)

      console.log("coba reply delete comment", data);
      let a = await actionDelete(data);
      console.log('delete reply comment', a);
      reply.send(a);
    } else {
      reply.send(responseInvalid)
    }

  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.put("/proman/commentUpdate", async function (req, reply) {
  try {
    console.log('req', req.body);
    let settingComment = JSON.parse(req.body);
    let token = extToken ? extToken : settingComment.settings.headers.token;
    if ("keyencrypt" in settingComment.settings.headers && await validateKeyEncrypt(settingComment.settings.headers.keyencrypt)) {
      settingComment.settings.body = JSON.stringify(iterateObjectNewDecrypt(JSON.parse(settingComment.settings.body), settingComment.settings.headers.keyencrypt));
      let data = {
        settings: {
          async: true,
          crossDomain: true,
          url: returnedConfig.hostIP + ":" + returnedConfig.backendPortService + '/dashboard/task/comment',
          method: "PUT",
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            signature: cryptography.aesEncrypt(settingComment.settings.headers.signature),
            secretkey: cryptography.aesEncrypt(
              settingComment.settings.headers.secretKey
            ),
            token: cryptography.aesEncrypt(
              token
            ),
          },
          body: settingComment.settings.body
        },
      };

      data.settings.body = encryptPostBody(data)

      console.log("coba put comment", data);
      let a = await actionPut(data);
      console.log('put comment', a);
      reply.send(a);
    } else {
      reply.send(responseInvalid)
    }
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.delete("/proman/deleteGroup", async function (req, reply) {
  try {
    console.log('req', req.body);
    let token = extToken ? extToken : req.headers.token;
    if ("keyencrypt" in req.headers && await validateKeyEncrypt(req.headers.keyencrypt)) {
      req.body = JSON.stringify(iterateObjectNewDecrypt(JSON.parse(req.body), req.headers.keyencrypt));
      let data = {
        settings: {
          async: true,
          crossDomain: true,
          url: returnedConfig.hostIP + ":" + returnedConfig.backendPortService + '/dashboard/group',
          method: "DELETE",
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            target: 'getBoard',
            signature: cryptography.aesEncrypt(req.headers.signature),
            secretkey: cryptography.aesEncrypt(
              req.headers.secretkey
            ),
            token: cryptography.aesEncrypt(
              token
            ),
          },
          body: req.body
        },
      };

      data.settings.body = encryptPostBody(data)

      console.log("coba delete group task", data);
      let a = await actionDelete(data);
      console.log('delete gerup tasek', a);
      reply.send(a);
    } else {
      reply.send(responseInvalid)
    }

  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.delete("/proman/deleteTask", async function (req, reply) {
  try {
    console.log('req', req.body);
    let token = extToken ? extToken : req.headers.token;
    if ("keyencrypt" in req.headers && await validateKeyEncrypt(req.headers.keyencrypt)) {
      req.body = JSON.stringify(iterateObjectNewDecrypt(JSON.parse(req.body), req.headers.keyencrypt))
      let data = {
        settings: {
          async: true,
          crossDomain: true,
          url: returnedConfig.hostIP + ":" + returnedConfig.backendPortService + '/dashboard/task',
          method: "DELETE",
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            signature: cryptography.aesEncrypt(req.headers.signature),
            secretkey: cryptography.aesEncrypt(
              req.headers.secretkey
            ),
            token: cryptography.aesEncrypt(
              token
            ),
          },
          body: req.body
        },
      };

      data.settings.body = encryptPostBody(data)

      console.log("coba delete task", data);
      let a = await actionDelete(data);
      console.log('delete tasek', a);
      reply.send(a);
    } else {
      reply.send(responseInvalid)
    }
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.post('/proman/updateConfig', async function (request, reply) {
  try {
    console.log('request: ', request.headers.serverkey);
    let key = request.headers.serverkey;
    console.log('key: ', key);
    console.log('serverKey: ', myKey);
    if (myKey == key) {
      returnedConfig = request.body;
      redisKey = request.body;
      reply.send({
        responseCode: "200",
        responseMessage: "success!!"
      });
    } else {
      reply.send({
        responseCode: "500",
        responseMessage: "fail!!"
      });
    }
  } catch (err) {
    console.log('err: ', err);
    reply.send({
      responseCode: "500",
      responseMessage: "fail!!"
    });
  }
})

fastify.get("/proman/getEmployeeDetail", async function (req, reply) {
  try {
    let idEmployee = req.headers.employeeid;
    let signature = req.headers.signature;
    let secretKey = req.headers.secretkey;
    let token = req.headers.token;
    let dataEmployee = {
      settings: {
        async: true,
        crossDomain: true,
        url: returnedConfig.hostIP + ":" + returnedConfig.backendPortService +
          "/data/employee",
        method: "GET",
        headers: {
          Accept: "*/*",
          "Cache-Control": "no-cache",
          secretKey: cryptography.aesEncrypt(secretKey),
          token: cryptography.aesEncrypt(token),
          param: cryptography.aesEncrypt(
            JSON.stringify({
              employeeId: idEmployee,
            })
          ),
          signature: cryptography.aesEncrypt(signature),
        },
      },
    };
    console.log("data kirim employee", dataEmployee);
    let a = await actionGet(dataEmployee);
    reply.send(a);
  } catch (err) {
    console.log("error apa", err);
    reply.send(500);
  }
});

fastify.get('/proman/employeeDetail', async function (req, reply) {
  reply.sendFile('layouts/profileMember.html');
})

fastify.get('/proman/setting', async function (req, reply) {
  reply.sendFile('layouts/setting.html');
})

fastify.get("/proman/getMethod", async function (req, reply) {
  try {
    let token = req.headers.token;
    let signature = req.headers.signature;
    let secretKey = req.headers.secretkey;
    let param = req.headers.param;
    console.log("token get", req.headers);
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: returnedConfig.hostIP + ":" + returnedConfig.backendPortService + "/master/method",
        method: "GET",
        headers: {
          Accept: "*/*",
          "Cache-Control": "no-cache",
          param: cryptography.aesEncrypt(param),
          token: cryptography.aesEncrypt(token),
          signature: cryptography.aesEncrypt(signature),
          secretKey: cryptography.aesEncrypt(secretKey),
        },
      },
    };
    console.log("ww", data);
    let a = await actionGet(data);
    console.log("reply", a);
    reply.send(a);
  } catch (err) {
    reply.send(500);
  }
});

fastify.get("/proman/getMethodOnly", async function (req, reply) {
  try {
    let token = req.headers.token;
    let signature = req.headers.signature;
    let secretKey = req.headers.secretkey;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: returnedConfig.hostIP + ":" + returnedConfig.backendPortService + "/master/method",
        method: "GET",
        headers: {
          Accept: "*/*",
          "Cache-Control": "no-cache",
          token: cryptography.aesEncrypt(token),
          signature: cryptography.aesEncrypt(signature),
          secretKey: cryptography.aesEncrypt(secretKey),
        },
      },
    };
    let a = await actionGet(data);
    console.log("reply", a);
    reply.send(a);
  } catch (err) {
    reply.send(500);
  }
});

fastify.get("/proman/getMethodParam", async function (req, reply) {
  try {
    let token = req.headers.token;
    let signature = req.headers.signature;
    let secretKey = req.headers.secretkey;
    let empid = req.headers.empid;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: returnedConfig.hostIP + ":" + returnedConfig.backendPortService + "/employee/account/scope",
        method: "GET",
        headers: {
          Accept: "*/*",
          "Cache-Control": "no-cache",
          token: cryptography.aesEncrypt(token),
          // "param" : puaram,
          signature: cryptography.aesEncrypt(signature),
          secretKey: cryptography.aesEncrypt(secretKey),
          param: cryptography.aesEncrypt(
            JSON.stringify({
              employeeId: empid,
            })
          ),
        },
      },
    };
    console.log("kirim param", data);
    let a = await actionGet(data);
    console.log("kembalian paramaa", a);
    reply.send(a);
  } catch (err) {
    reply.send(500);
  }
});

fastify.get("/proman/getScopeEmployee", async function (req, reply) {
  try {
    let token = req.headers.token;
    let signature = req.headers.signature;
    let secretKey = req.headers.secretkey;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: returnedConfig.hostIP + ":" + returnedConfig.backendPortService + "/master/access",
        method: "GET",
        headers: {
          Accept: "*/*",
          "Cache-Control": "no-cache",
          token: cryptography.aesEncrypt(token),
          secretKey: cryptography.aesEncrypt(secretKey),
          signature: cryptography.aesEncrypt(signature),
        },
      },
    };
    let a = await actionGet(data);
    reply.send(a);
  } catch (err) {
    reply.send(500);
  }
});

fastify.post("/proman/deleteEmployeeMethod", async function (req, res) {
  try {
    let data = req.body;
    data.settings.body = encryptPostBody(data);
    data.settings.headers.token = cryptography.aesEncrypt(
      data.settings.headers.token
    );
    data.settings.headers.signature = cryptography.aesEncrypt(
      data.settings.headers.signature
    );
    data.settings.headers.secretKey = cryptography.aesEncrypt(
      data.settings.headers.secretKey
    );
    data.settings.url = returnedConfig.hostIP + ":" + returnedConfig.accPort + data.settings.url;

    console.log("data url", data.settings.url);
    let a = await actionPost(data);
    console.log("woe broku a", a);
    res.send(a);
  } catch (error) {
    console.log("Error gaes", error);
    res.send(500);
  }
});

fastify.put("/proman/updateEmployeeMethod", async function (req, res) {
  try {
    let data = req.body;
    data.settings.body = encryptPostBody(data);
    data.settings.headers.token = cryptography.aesEncrypt(
      data.settings.headers.token
    );
    data.settings.headers.signature = cryptography.aesEncrypt(
      data.settings.headers.signature
    );
    data.settings.headers.secretKey = cryptography.aesEncrypt(
      data.settings.headers.secretKey
    );
    data.settings.url = returnedConfig.hostIP + ":" + returnedConfig.accPort + data.settings.url;

    console.log("settung akhir", data.settings);
    let a = await actionPut(data);
    console.log("muethod", a);
    res.send(a);
  } catch (error) {
    console.log("Error gaes", error);
    res.send(500);
  }
});

fastify.put("/proman/updateEmployeeRole", async function (req, res) {
  try {
    let data = req.body;
    data.settings.body = encryptPostBody(data);
    data.settings.headers.token = cryptography.aesEncrypt(
      data.settings.headers.token
    );
    data.settings.headers.signature = cryptography.aesEncrypt(
      data.settings.headers.signature
    );
    data.settings.headers.secretKey = cryptography.aesEncrypt(
      data.settings.headers.secretKey
    );
    data.settings.url = returnedConfig.hostIP + ":" + returnedConfig.accPort + data.settings.url;

    console.log("settung akhir", data.settings);
    let a = await actionPut(data);
    console.log("muethod", a);
    res.send(a);
  } catch (error) {
    console.log("Error gaes", error);
    res.send(500);
  }
});

fastify.get('/proman/getRole', async function (req, reply) {
  try {
    let signature = req.headers.signature;
    let secretKey = req.headers.secretkey;
    let token = req.headers.token;
    let getRole = {
      settings: {
        async: true,
        crossDomain: true,
        url: returnedConfig.hostIP + ":" + returnedConfig.backendPortService +
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
  } catch (err) {
    console.log("error apa", err);
    reply.send(500);
  }
})

fastify.put("/proman/updateEmployee", async function (req, reply) {
  try {
    let data = req.body;
    data.settings.url =
      returnedConfig.hostIP + ":" + returnedConfig.backendPortService +
      "/account/profile/employee";
    data.settings.body = encryptPostBody(data);
    data.settings.headers.token = cryptography.aesEncrypt(
      data.settings.headers.token
    );
    data.settings.headers.secretKey = cryptography.aesEncrypt(
      data.settings.headers.secretKey
    );
    data.settings.headers.signature = cryptography.aesEncrypt(
      data.settings.headers.signature
    );
    let a = await actionPut(data);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.get('/proman/envConfig', function (req, reply) {
  let dataConfig = {
    hostIP: returnedConfig.hostIP,
    mainLocalPort: returnedConfig.mainLocalPort,
    backendPortService: returnedConfig.backendPortService,
    domainPlaceUS: returnedConfig.domainPlaceUS,
  };
  let keys = generateKey();
  iterateObjectNewEncrypt(dataConfig, keys);
  dataConfig.cred = keys;
  reply.send(dataConfig);
});

fastify.get('/proman/chat', async function (request, reply) {
  r.get({
    "async": true,
    "crossDomain": true,
    "headers": {
      "Cache-Control": "no-cache",
    },
    "url": 'http://' + localUrl + ':8443/main/chat'
  }, function (err, response, body) {
    reply.send(body);
  });
});

fastify.get('/proman/getChatPage', async function (req, reply) {
  console.log('getchat ...');
  // console.log(req.headers);
  try {
    let server = req.headers.server;
    let port = req.headers.port;
    let receiver = req.headers.receiver;
    let last = req.headers.last;
    let limit = req.headers.limit;
    let token = req.headers.token;
    let signature = req.headers.signature;
    let secretKey = req.headers.secretkey;
    let b = {
      "settings": {
        "async": true,
        "crossDomain": true,
        "url": server + ":" + port + "/message/get/page",
        "method": "GET",
        "headers": {
          "Accept": "*/*",
          "Cache-Control": "no-cache",
          "signature": signature,
          "token": token,
          "receiver": receiver,
          "last": last,
          "limit": limit,
          "secretKey": secretKey
        }
      }
    }
    let c = await actionGet(b);
    reply.send(c);
  } catch (error) {
    console.log("error bro: ", error);
    reply.send(500)
  }
});

async function restartEnv() {
  return new Promise(async function (resolve, reject) {
    let data = process.env;
    hostIP = data.MAIN_IP_DESTINATION;
    accPort = data.ACCOUNT_PORT_SERVICE;
    backendPortService = data.BACKEND_PORT_SERVICE;
    authPortService = data.AUTHENTICATION_PORT_SERVICE;
    mainLocalPort = data.MAIN_DASHBOARD_PORT;
    localhostIP = data.LOCALHOST_IP;
    serverDomain = data.SERVER;
    cdnLink = data.CDN_LINK;
    domainPlaceUS = data.SERVER_US_DOMAIN;
    localUrl = data.LOCALHOST_DOMAIN;
    returnedConfig = {
      hostIP: hostIP,
      accPort: accPort,
      authPortService: authPortService,
      backendPortService: backendPortService,
      mainLocalPort: mainLocalPort,
      localhostIP: localhostIP,
      serverDomain: serverDomain,
      cdnLink: cdnLink,
      localUrl: localUrl,
      domainPlaceUS: domainPlaceUS
    }
    resolve(returnedConfig);
  })
}

function generateKey() {
  return (Math.random().toString(36).substring(6));
}

function htmlEncodes(tag) {
  var htmlEncode = require('htmlencode').htmlEncode;
  return htmlEncode(tag);
}

fastify.get("/proman/generateKey", async function (req, reply) {
  let genKey = generateKey();
  client.set("proman_" + genKey, genKey, redis.print);
  reply.send(genKey)
})

async function clearKey(key) {
  return new Promise(async function (resolve, reject) {
    client.DEL("proman_" + key, function (err, succeeded) {
      resolve(succeeded);
    });
  });
}

async function validateKeyEncrypt(key) {
  return new Promise(async function (resolve, reject) {
    client.get('proman_' + key, async function (err, result) {
      if (result == null) resolve(false)
      else {
        await clearKey(key);
        resolve(true);
      }
    });
  })
}

function iterateObjectNewDecrypt(obj, keys) {
  try {
    let temp;
    Object.keys(obj).forEach((key) => {
      if (typeof obj[key] === "object") {
        iterateObjectNewDecrypt(obj[key], keys);
      } else {
        temp = obj[key];
        obj[key] = newDecrypt(obj[key], keys);
        if (key != 'pic' && key != 'timeline' && key != 'member' && key != 'slack_channels' && key != 'telegram_channels') obj[key] = sanitizeHTML(obj[key]);
        if (obj[key] == "" || obj[key] == null || obj[key] == {}) obj[key] = temp;
      }
    });
    return obj;
  } catch (error) {
    return obj;
  }

}

function newDecrypt(strings, key) {
  let result = '';
  var atob = require('atob')
  let string = atob(strings);
  for (let i = 0; i < string.length; i++) {
    let char = string.substr(i, 1);
    let keychar = key.substr((i % key.length) - 1, 1);
    char = String.fromCharCode(char.charCodeAt(0) - keychar.charCodeAt(0));
    result += char;
  }
  return result;
}

function newEncrypt(string, key) {
  let result = '';
  for (let i = 0; i < string.length; i++) {
    let char = string.toString().substr(i, 1);
    let keychar = key.substr((i % key.length) - 1, 1);
    char = String.fromCharCode(char.charCodeAt(0) + keychar.charCodeAt(0));
    result += char;
  }
  var btoa = require('btoa')
  return btoa(result);
}

function iterateObjectNewEncrypt(obj, keys) {
  try {
    let temp;
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'object') {
        iterateObjectNewEncrypt(obj[key], keys)
      } else {
        temp = obj[key];
        if(typeof obj[key] == 'number') obj[key] = obj[key].toString()
        if (obj[key] == true || obj[key] == false) obj[key] = obj[key].toString()
        obj[key] = newEncrypt(obj[key], keys);
        if (obj[key] == '')
          obj[key] = temp;
        if (obj[key].toString().includes('error'))
          obj[key] = temp;
        if (temp == '' && key != 'status') obj[key] = ''
      }
    })
    return obj;
  } catch (error) {
    console.log('errorrrr', error);
    return obj;
  }
}

function sanitizeHTML(text){
  const window = new JSDOM('').window;
  const DOMPurify = createDOMPurify(window);
  const clean = DOMPurify.sanitize(text);
  return clean;
}

let sockets = require("./socket.js");

// Run the server!
const start = async () => {
  try {
    await fastify.listen(8110, '0.0.0.0')
    await restartEnv();
    let conf = {
      domainServer: localUrl,
      fullDomain: localhostIP,
      hostIp: hostIP,
      server: serverDomain,
      port: fastify.server.address().port
    }
    await sockets.openSocket(conf)
    // fastify.log.info(`server listening on ${fastify.server.address().port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()