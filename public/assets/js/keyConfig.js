function openKey(){
    $('#formKey').show('slow');
    $('#btnKey').text('Close Form');
    $('#btnKey').attr('onclick','closeKey()');
    $('#btnKey').attr('class','btn btn-sm btn-warning');
}

function closeKey(){
    $('#formKey').hide('slow');
    $('#btnKey').text('Add Key');
    $('#btnKey').attr('onclick','openKey()');
    $('#btnKey').attr('class','btn btn-sm btn-default');
}

async function saveKey(){
    accessMethod = 'add configuration key';
    await globalScopeCheck(accessParam,accessMethod,async function(){
        var titleKey = $('#keyName').val();
        var valueKey = $('#keyValue').val();

        if(titleKey == '' || valueKey == ''){
            param = {
                type: "error",
                text: 'key name or value cannot be empty'
            }
            callNotif(param);
            return;
        }

        let backendPort = await getRData(backendPortKey)
        let hostNameGlobal = await getRData(mainIpKey)

        let ct = JSON.parse(accountProfile);
        var body = {
            "name" : titleKey,
            "value" : valueKey
        }
        var data = {
            settings:{
                "async": true,
                "crossDomain": true,
                "url": hostNameGlobal + ":" + backendPort + "/master/key",
                "method": "POST",
                "headers": {
                "Content-Type": "application/json",
                "secretKey": ct.secretKey,
                "signature" : ct.signature,
                "Accept": "*/*",
                "Cache-Control": "no-cache",
                "token" : ct.token
            },
            "processData": false,
            "body":JSON.stringify(body),
            }
        };

        $.ajax({
            url: "postKey",
            crossDomain: true,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Cache-Control": "no-cache",
                "token" : ct.token,
                "secretKey": "blabla",
            },
            data: JSON.stringify(data),
            success: function (callback) {
                let param = '';
                $('#keyName').val('');
                $('#keyValue').val('');
                switch (callback.responseCode) {
                    case "401":
                        logoutNotif();
                        break;
                    case "404":
                        param = {
                            type: "error",
                            text: callback.responseMessage
                        }
                        callNotif(param);
                        break;
                    case "500":
                        param = {
                            type: "error",
                            text: callback.responseMessage
                        }
                        callNotif(param);
                        break;
                    case "200":
                        param = {
                            type: "success",
                            text: callback.responseMessage
                        }
                        callNotif(param);
                        getKey();
                        $('.keyContain').animate({ scrollTop: 9999 }, 'slow');
                        closeKey()
                        break;
                    default:
                        param = {
                            type: "error",
                            text: callback.responseMessage
                        }
                        callNotif(param);
                        break;
                }
            }
        })
    })
    
}

async function updateKey(_keyId, _el){
    accessMethod = 'edit configuration key';
    await globalScopeCheck(accessParam,accessMethod,async function(){
        let el = _el.parentNode.parentNode
        let keyId = _keyId.toString()
        let titleKey = el.getElementsByClassName('key_name')[0].value
        let valueKey = el.getElementsByClassName('key_value')[0].value
        let originNameKey = el.getElementsByClassName('key_name')[0].getAttribute('data-id')
        let originValueKey = el.getElementsByClassName('key_value')[0].getAttribute('data-id')
        if(!titleKey) titleKey = originNameKey
        let ct = JSON.parse(accountProfile)
        let body = {
            "keyId" : keyId,
            "name" : titleKey,
            "value" : valueKey,
            "valueOrigin" : originValueKey
        }
        console.log ('updateKey body => ', body)
        let backendPort = await getRData(backendPortKey)
        let hostNameGlobal = await getRData(mainIpKey)
        
        let data = {
            settings:{
                "async": true,
                "crossDomain": true,
                "url": hostNameGlobal + ":" + backendPort + "/master/key",
                "method": "PUT",
                "headers": {
                    "Content-Type": "application/json",
                    "secretKey": ct.secretKey,
                    "signature" : ct.signature,
                    "Accept": "*/*",
                    "Cache-Control": "no-cache",
                    "token" : ct.token
                },
                "processData": false,
                "body":JSON.stringify(body),
            }
        };
        console.log ('updateKey data => ', data)
        $.ajax({
            url: "updateKey",
            crossDomain: true,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Cache-Control": "no-cache",
                "token" : ct.token,
                "secretKey": "blabla",
            },
            data: JSON.stringify(data),
            success: function (callback) {
                let param = '';
                switch (callback.responseCode) {
                    case "401":
                        logoutNotif();
                        break;
                    case "404":
                        param = {
                            type: "error",
                            text: callback.responseMessage
                        }
                        callNotif(param);
                        break;
                    case "500":
                        param = {
                            type: "error",
                            text: callback.responseMessage
                        }
                        callNotif(param);
                        break;
                    default:
                        param = {
                            type: "success",
                            text: callback.responseMessage
                        }
                        callNotif(param);
                        getKey()
                        closeKey()
                        break;
                }
            }
        })
    })
    
}

async function getKey(){
    let ct = JSON.parse(accountProfile);
    console.log('mainn',mainIpService);
    console.log('porttt',backendPortService);
    let param = {
        url : 'getKey',
        headers : { 
            "Content-Type": "application/json",
            "Accept": "*/*",
            "Cache-Control": "no-cache",
            "token" : ct.token,
            "secretKey" : ct.secretKey,
            "signature" : ct.signature,
            "param" : "all",
            "url": mainIpService + ":" + backendPortService + "/master/key"
        }
    }
    // param = JSON.stringify(param)
    return new Promise (function(resolve, reject){
        getData(param).then(function(result){
            localStorage.setItem('listKey', JSON.stringify(result.data));
            // if( $('#keyList').length ) {
                $('#keyList').html('');
                $('#keyList').empty();
                console.log("Get KEY RESULT ==> ", result)
                $('#keyList').append('<li class="list-group-item">' +
                    '<div class="row">' +
                        '<div class="col-lg-1">S/N</div>' +
                        '<div class="col-lg-3">Config Key Name</div>' +
                        '<div class="col-lg-6" style="text-align:end">Config Key Value</div>' +
                        '<div class="col-lg-2" style="text-align:end"></div>' +
                    '</div>' +
                '</li>')
                result.data.forEach(appendListDataKey);
            // }
            resolve (result)
        }); 
    })      
}

function appendListDataKey(data,index){
    // setRData (data.field_name_origin, data.field_value)
    if( $('#keyList').length ) {
        var list =  '<li class="list-group-item">' + 
                        '<div class="row">' +
                            '<div class="col-lg-1">'+parseInt(index+1)+'</div>' +
                            '<input type="text" class="form-control col-lg-3 key_name" contenteditable="true" placeholder="'+data.field_name_origin+'" data-id="'+data.field_name_origin+'"></input>' +
                            '<input type="text" class="form-control col-lg-6 key_value" style="text-align:end" contenteditable="true" placeholder="'+data.field_value+'" data-id="'+data.field_value+'"></input>' +
                            '<div class="col-lg-2" style="text-align:end">' +
                                '<i class="fas fa-check" style="cursor:pointer; vertical-align:bottom;" onclick="updateKey('+data.id+','+'this)"></i>' +
                                '&nbsp;' +
                                '<i class="fas fa-times" style="cursor:pointer; vertical-align:bottom;" onclick="deleteKey('+data.id+','+'this)" data-name="'+data.field_name_origin+'"></i>' +
                            '</div>' +
                        '</div>' +
                    '</li>'
        $('#keyList').append(list);
    }
}

async function deleteKey(id,el){
    accessMethod = 'delete configuration key';
    await globalScopeCheck(accessParam,accessMethod,async function(){
        let name = el.getAttribute('data-name')
        let ct = JSON.parse(accountProfile);
        var body = {
            "keyId" : id.toString()
        }
        let backendPort = await getRData(backendPortKey)
        let hostNameGlobal = await getRData(mainIpKey)
        var data = {
            settings:{
                "async": true,
                "crossDomain": true,
                "url": hostNameGlobal + ":" + backendPort + "/master/key",
                "method": "DELETE",
                "headers": {
                "Content-Type": "application/json",
                "secretKey": ct.secretKey,
                "signature" : ct.signature,
                "Accept": "*/*",
                "Cache-Control": "no-cache",
                "token" : ct.token
            },
            "processData": false,
            "body": JSON.stringify(body)
            }
        };
        callNotifDeleteScopeKey(data,name);
    })
}