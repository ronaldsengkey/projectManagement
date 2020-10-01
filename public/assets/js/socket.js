async function connectSocket(parameter,data,callbackFunc){
    let backendPort = await getRData(backendPortKey)
    let hostNameGlobal = await getRData(mainIpKey)
    var defaultUrl = hostNameGlobal + ":" + backendPort
    
    var host;
    switch(parameter){
        default:
            host = defaultUrl
            break;
    }
    return new Promise((resolve, reject) => {
        var socket = io.connect(host);
        socket.on('connect', function(result) {
            socket.emit('getRoles');
            socket.emit('ticketingList', data);
        });
        switch(parameter){
            case 'ticketingList':
                socket.on('ticketingList', function (result) {
                    if (callbackFunc != undefined && callbackFunc != null) {
                        resolve(result)
                        callbackFunc(result)
                    }
                });
                break;
            default:
                /* ------------------------- untuk roles ------------------------ */
                socket.on('roles', function(result,error){
                    console.log('ERROR => ',error);
                    console.log('RES => ',result)
                    if(callbackFunc != undefined && callbackFunc != null){
                        resolve(result);
                        callbackFunc(result);
                    }
                });
                break;
        }
    });
}

async function getRData (_param){
    let ct = JSON.parse(accountProfile);

    var data = {
        param : _param,
    };
    return new Promise (function(resolve, reject){
        $.ajax({
            url: "getRData",
            crossDomain: true,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Cache-Control": "no-cache",
                "secretKey":ct.secretKey,
                "signature":ct.signature,
                "token": ct.token,
                "url" : hostNameGlobal + ":" + backendPort + "/master/key"
            },
            data: JSON.stringify(data),
            success: async function (callback) {
                console.log('callback GET RData '+_param+' => '+ JSON.parse(callback))
                // return JSON.parse(callback)
                resolve (JSON.parse(callback))
            }
        })
    })    
}