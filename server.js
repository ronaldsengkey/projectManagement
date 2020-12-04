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
let mainLocalPort;
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
const cryptography = require("./crypto.js");
const myKey = efs.readFileSync("./server.key", 'utf-8');
// const {
//   createStore,
//   applyMiddleware
// } = require("redux");
// // Declare a routen
fastify.register(require('fastify-multipart'));
fastify.register(require('fastify-static'), {
    root: path.join(__dirname, 'public'),
    prefix: '/public/', // optional: default '/'
})

// var Monitor = require('monitor');
let signatureLogin = require("./signature.js");
let mainDBKey = efs.readFileSync('./mainDB.key', 'utf8');
const fs = require('fs');
let redisKey = [];
let returnedConfig = {};



let token;
let port;


fastify.get("/:origin", async function (req, reply) {
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
        reply.redirect("/login");
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
          // console.log("action Get body data => ", body);
          let result = "";
          if (body !== "" && JSON.parse(body).data !== undefined) {
            result = JSON.parse(body);
            if(settings.headers.target == 'trello') result.data = cryptography.decryptMessage(result.data)
            else if(settings.headers.target != 'auth') result.data = iterateObjectDecrypt(result.data);
            else result.data = cryptography.decryptMessage(result.data);
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

fastify.post("/sendEmailReset", async function (req, reply) {
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

fastify.put("/sendNewPassword", async function (req, reply) {
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
      if(obj[key] != 'comment_file') obj[key] = cryptography.encryptMessage(obj[key]);
    }
  });
  return obj;
}

function iterateObjectDecrypt(obj) {
  let temp;
 
  Object.keys(obj).forEach((key) => {
    try{
      if (typeof obj[key] === "object") {
        iterateObjectDecrypt(obj[key]);
      } else {
        temp = obj[key];
        obj[key] = cryptography.decryptMessage(obj[key]);
        if (obj[key] == "") obj[key] = temp;
        if (obj[key].toString().includes("error")) obj[key] = temp;
      }
    }catch(e){
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
    reply.send(a);
  } catch (err) {
    reply.send(err);
  }
});

async function setRedisData(param, data) {
  console.log("getRedisData => " + param + " - ", data);
  redisKey[param] = data;
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
    } catch (err) {
      reject(err);
    }
  });
}

async function getRedisData(
  param
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
      result = rep;
    }
    resolve(result);
  });
}

fastify.get("/trello_management", function (req, reply) {
  reply.sendFile("layouts/trello/trelloManagement.html");
});

fastify.get("/project_management", function (req, reply) {
  reply.sendFile("layouts/projectManagement.html");
});

fastify.get("/projectBoard", function (req, reply) {
  reply.sendFile("layouts/projectBoard.html");
});

fastify.get("/trelloBoardPage", function (req, reply) {
  reply.sendFile("layouts/trello/trelloBoard.html");
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

fastify.get("/goAuth", async function (req, reply) {
  try {
    let token = extToken ? extToken : req.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: hostIPAlt + ":" + await getRedisData(backendPort) + '/dashboard/trello/auth',
        method: "GET",
        headers: {
          Accept: "*/*",
          "Cache-Control": "no-cache",
          "target": 'auth',
          signature:cryptography.aesEncrypt(req.headers.signature),
          secretkey:cryptography.aesEncrypt(
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
    console.log('aaaaauuuutttthhhh',a);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.post("/confirmAuthToken", async function (req, reply) {
  try {
    let token = extToken ? extToken : req.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: hostIPAlt + ":" + await getRedisData(backendPort) + '/dashboard/trello/auth',
        method: "POST",
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
        body: JSON.stringify(iterateObject(req.body))
      },
    };

    console.log("coba post auth", data);
    let a = await actionPost(data);
    console.log('postttt authhhh',a);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});


fastify.get("/trelloBoard", async function (req, reply) {
  try {
    let token = extToken ? extToken : req.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: hostIPAlt + ":" + await getRedisData(backendPort) + '/trello/board',
        // url: 'https://api.trello.com/1/members/me/boards?key=156b809da9559f2d476a308cb0cab8ae&token=847a19083739e0c5403a1ad9160da41d401b4dd65af8e06630e1b17d3d257f29',
        method: "GET",
        headers: {
          Accept: "*/*",
          "Cache-Control": "no-cache",
          "target": 'trello',
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
    let a = await actionGet(data);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.get("/trelloList", async function (req, reply) {
  try {
    let token = extToken ? extToken : req.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: hostIPAlt + ":" + await getRedisData(backendPort) + '/trello/list',
        // url: 'https://api.trello.com/1/boards/'+boardId+'/lists?key=156b809da9559f2d476a308cb0cab8ae&token=847a19083739e0c5403a1ad9160da41d401b4dd65af8e06630e1b17d3d257f29',
        method: "GET",
        headers: {
          Accept: "*/*",
          "Cache-Control": "no-cache",
          "target": 'trello',
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
    let a = await actionGet(data);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.get("/getCardData", async function (req, reply) {
  try {
    let token = extToken ? extToken : req.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: hostIPAlt + ":" + await getRedisData(backendPort) + '/trello/card',
        // url: 'https://api.trello.com/1/lists/'+listId+'/cards?key=156b809da9559f2d476a308cb0cab8ae&token=847a19083739e0c5403a1ad9160da41d401b4dd65af8e06630e1b17d3d257f29',
        method: "GET",
        headers: {
          Accept: "*/*",
          "Cache-Control": "no-cache",
          "target": 'trello',
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
    let a = await actionGet(data);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.delete("/deleteList", async function (req, reply) {
  try {
    let token = extToken ? extToken : req.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: hostIPAlt + ":" + await getRedisData(backendPort) + '/dashboard/trello/list',
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
        body:JSON.stringify(iterateObject(req.body))
      },
    };
    let a = await actionDelete(data);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.put("/renameList", async function (req, reply) {
  try {
    let token = extToken ? extToken : req.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: hostIPAlt + ":" + await getRedisData(backendPort) + '/dashboard/trello/list',
        method: "PUT",
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
        body:JSON.stringify(iterateObject(req.body))
      },
    };
    let a = await actionPut(data);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.put("/putTaskTrello", async function (req, reply) {
  try {
    let token = extToken ? extToken : req.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: hostIPAlt + ":" + await getRedisData(backendPort) + '/dashboard/trello/card',
        method: "PUT",
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
        body: JSON.stringify(iterateObject(req.body))
      },
    };

    console.log("coba put task timeline", data);
    let a = await actionPut(data);
    console.log('put task timelinee',a);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.delete("/deleteTaskTrello", async function (req, reply) {
  try {
    let token = extToken ? extToken : req.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: hostIPAlt + ":" + await getRedisData(backendPort) + '/dashboard/trello/card',
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
        body: JSON.stringify(iterateObject(req.body))
      },
    };

    console.log("coba put task timeline", data);
    let a = await actionDelete(data);
    console.log('put task timelinee',a);
    reply.send(a);
  } catch (err) {
    console.log("Error apa sih", err);
    reply.send(500);
  }
});

fastify.put("/renameBoard", async function (req, reply) {
  try {
    let token = extToken ? extToken : req.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: hostIPAlt + ":" + await getRedisData(backendPort) + '/dashboard/trello/board',
        method: "PUT",
        headers: {
          Accept: "*/*",
          "Cache-Control": "no-cache",
          "Content-Type":'application/json',
          signature:cryptography.aesEncrypt(req.headers.signature),
          secretkey:cryptography.aesEncrypt(
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

fastify.delete("/deleteBoardTrello", async function (req, reply) {
  try {
    let token = extToken ? extToken : req.headers.token;
    let data = {
      settings: {
        async: true,
        crossDomain: true,
        url: hostIPAlt + ":" + await getRedisData(backendPort) + '/dashboard/trello/board',
        method: "DELETE",
        headers: {
          Accept: "*/*",
          "Cache-Control": "no-cache",
          "Content-Type":'application/json',
          signature:cryptography.aesEncrypt(req.headers.signature),
          secretkey:cryptography.aesEncrypt(
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

    // console.log("coba get comment", data);
    let a = await actionGet(data);
    // console.log('komen',a);
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

fastify.post("/commentUpdate", async function (request, reply) {
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
              url: hostIPAlt + ":" + await getRedisData(backendPort) + '/dashboard/task/comment',
              method: "POST",
              headers: {
                Accept: "*/*",
                "Content-Type": "application/json",
                "Cache-Control": "no-cache",
                signature:cryptography.aesEncrypt(request.headers.signature),
                secretkey:cryptography.aesEncrypt(
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
      data.comment_file = data.comment_file;
      data.user_create = cryptography.encryptMessage(data.user_create);
      dataSend.settings.formData = data;
      let a = await actionPost(dataSend);
      console.log('a form data',a);
      reply.send(a);
    }
    function handler (field, file, filename, encoding, mimetype) {
      
    }
  } catch (error) {
    console.log("eroor: ", error);
    reply.send(error);
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

fastify.post("/commentReply", async function (request, reply) {
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
              url: hostIPAlt + ":" + await getRedisData(backendPort) + '/dashboard/task/reply',
              method: "POST",
              headers: {
                Accept: "*/*",
                "Cache-Control": "no-cache",
                signature:cryptography.aesEncrypt(request.headers.signature),
                secretkey:cryptography.aesEncrypt(
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
      console.log('a form data',a);
      reply.send(a);
    }
    function handler (field, file, filename, encoding, mimetype) {
      
    }
  } catch (error) {
    console.log("eroor: ", error);
    reply.send(error);
  }
});

fastify.put("/commentReply", async function (request, reply) {

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
              url: hostIPAlt + ":" + await getRedisData(backendPort) + '/dashboard/task/reply',
              method: "PUT",
              headers: {
                Accept: "*/*",
                "Cache-Control": "no-cache",
                signature:cryptography.aesEncrypt(request.headers.signature),
                secretkey:cryptography.aesEncrypt(
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
      console.log('a form data',a);
      reply.send(a);
    }
    function handler (field, file, filename, encoding, mimetype) {
      
    }
  } catch (error) {
    console.log("eroor: ", error);
    reply.send(error);
  }


  // try {
  //   console.log('req',req.body);
  //   let token = extToken ? extToken : req.body.settings.headers.token;
  //   let data = {
  //     settings: {
  //       async: true,
  //       crossDomain: true,
  //       url: hostIPAlt + ":" + await getRedisData(backendPort) + '/dashboard/task/reply',
  //       method: "PUT",
  //       headers: {
  //         Accept: "*/*",
  //         "Content-Type": "application/json",
  //         "Cache-Control": "no-cache",
  //         signature:cryptography.aesEncrypt(req.body.settings.headers.signature),
  //         secretkey:cryptography.aesEncrypt(
  //           req.body.settings.headers.secretKey
  //         ),
  //         token: cryptography.aesEncrypt(
  //           token
  //         ),
  //       },
  //       body: req.body.settings.body
  //     },
  //   };

  //   data.settings.body = encryptPostBody(data)

  //   console.log("coba reply put comment", data);
  //   let a = await actionPut(data);
  //   console.log('put reply comment',a);
  //   reply.send(a);
  // } catch (err) {
  //   console.log("Error apa sih", err);
  //   reply.send(500);
  // }
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

fastify.post('/updateConfig', async function (request, reply) {
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
  hostIP = returnedConfig.SERVER_SYAFRI;
  hostNameServer = 'SERVER_SYAFRI';
  // hostIP = returnedConfig.AWS_SERVER;
  // hostNameServer = "AWS_SERVER";

  hostIPAlt = returnedConfig.SERVER_SYAFRI;

  // ANCHOR MAIN SERVER PORT NAME AND LINK
  accPort = "8443/account";
  backendPort = "PORT_BACKEND_AWS";
  portAcc = "PORT_ACC_AWS";
  portAuth = "PORT_AUTH_AWS";
  portTrans = "PORT_TRANSACTION_AWS";

  // ANCHOR LOCAL PORT
  employeeLocalPort = "8103";
  csLocalPort = "8105";
}

async function defineLocalConfig(){
  // ANCHOR LOCAL URL
  // localUrl = "http://sandbox.dashboard.ultipay.id";
  localUrl = "http://localhost";

  // ANCHOR LOCAL PORT
  mainLocalPort = '8100'
}

async function updateConfig(data){
  let keys = Object.keys(data);
  for(let key of keys){
    returnedConfig[key] = data[key];
    redisKey[key] = data[key];
  }
  defineConfig();
}

async function checkAndGetConfigFromMainDB(){
  await defineLocalConfig();
  r.get( localUrl+ ':' + mainLocalPort + '/getConfig', {
    "headers": {
        "serverKey": mainDBKey
      }
    }, function (error, response, body) {
      if(body == undefined){
        console.log('failed to connect to main DB');
      } else {
        updateConfig(JSON.parse(body).data)
        console.log('the config',returnedConfig);
      }
    });
  setInterval(() => {
    r.get( localUrl+ ':' + mainLocalPort + '/getConfig', {
    "headers": {
        "serverKey": mainDBKey
      }
    }, function (error, response, body) {
      if(body == undefined){
        console.log('failed to connect to main DB');
      } else {
        updateConfig(JSON.parse(body).data)
      }
    });
  }, 5000);
}


// Run the server!
const start = async () => {
  try {
    await fastify.listen(8110,'0.0.0.0')
    await checkAndGetConfigFromMainDB();
    // fastify.log.info(`server listening on ${fastify.server.address().port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()