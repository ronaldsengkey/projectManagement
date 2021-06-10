'use strict'

let ct;
// let userData;
$(function () {
    try{
        let getUrl = window.location.search;
        let getUserId = new URLSearchParams(getUrl).get('info');
        ct = JSON.parse(getUserId);
        if(ct == null) throw 'z';
    }catch(e){
        ct = parseUserData()
    }
})

function parseUserData() {
    if (checkLocalStorage(localStorage.getItem('userData'))) {
        try {
            userData = window.atob(localStorage.getItem('userData'));
        } catch (e) {
            // something failed
            if (e.code === 5) {
                userData = JSON.parse(localStorage.getItem('userData'));
            }
        }
    } else if (checkLocalStorage(localStorage.getItem('originLogin'))) {
        userData = JSON.parse(localStorage.getItem('originLogin'));
    } else {
        try {
            userData = window.atob(localStorage.getItem('accountProfile'));
        } catch (e) {
            // something failed
            if (e.code === 5) {
                userData = JSON.parse(localStorage.getItem('accountProfile'));
            }
        }
    }
    if (!checkLocalStorage(userData.token)) {
        userData = JSON.parse(userData)
    }
    return userData
}

function checkLocalStorage(varLocal) {
    if (varLocal == 'null' || varLocal == null || varLocal == undefined || varLocal == "undefined" || varLocal == '') {
        return false
    } else {
        return true
    }
}


async function getTaskData(id, data, boardMember) {
    return new Promise(async function (resolve, reject) {
        let result = await ajaxCall({url:'getTaskData',method:'GET',credentialHeader:true,extraHeaders:{"param":JSON.stringify({
            'group_id': id
        })},decrypt:true})
        if (result.responseCode == '200') {
            await domTaskTable(result.data, id, data, boardMember);
        } else if (result.responseCode == '404') {
            await domTaskTable([], id, data);
        } else if (result.responseCode == '401') {
            logoutNotif();
        } else {
            let param = {
                type: 'error',
                text: result.responseMessage
            };
            callNotif(param);
        }
        
    });
}

async function editGroupTask(body) {
    return new Promise(async function (resolve, reject) {
        let genKeyGroupEdit = await getGenerateKey();
        let result = await ajaxCall({url:'editGroup',data:JSON.stringify(iterateObjectNewEncrypt(body,genKeyGroupEdit)),extraHeaders:{keyencrypt:genKeyGroupEdit},method:'PUT',credentialHeader:true})
        resolve(result);
    });
}

async function deleteGroupTask(body) {
    return new Promise(async function (resolve, reject) {
        let genKeyGroupDelete = await getGenerateKey();
        let result = await ajaxCall({url:'deleteGroup',data:JSON.stringify(iterateObjectNewEncrypt(body,genKeyGroupDelete)),extraHeaders:{keyencrypt:genKeyGroupDelete},method:'DELETE',credentialHeader:true})
        resolve(result);
    });
}

async function getComment(taskId) {
    return new Promise(async function (resolve, reject) {
        let result = await ajaxCall({url:'comment',headers:{
            "Content-Type": "application/json",
            "Accept": "*/*",
            "Cache-Control": "no-cache",
            "param": JSON.stringify({
                'task_id': taskId
            }),
            "secretKey": ct.secretKey,
            "token": ct.token,
            "signature": ct.signature
        },method:'GET',decrypt:true})
        if (result.responseCode == '200') {
            resolve(result.data);
        } else if (result.responseCode == '404') {
            $('.commentContent[data-id=' + taskId + ']').empty();
        } else if (result.responseCode == '401') {
            logoutNotif();
        } else {
            let param = {
                type: 'error',
                text: result.responseMessage
            };
            callNotif(param);
            reject(500);
        }
    })
}

async function deleteTask(body) {
    return new Promise(async function (resolve, reject) {
        let genKeyTaskDelete = await getGenerateKey();
        let result = await ajaxCall({url:'deleteTask',data:JSON.stringify(iterateObjectNewEncrypt(body,genKeyTaskDelete)),extraHeaders:{keyencrypt:genKeyTaskDelete},method:'DELETE',credentialHeader:true})
        resolve(result);
    });
}

async function syncGoogle(body) {
    return new Promise(async function (resolve, reject) {
        let genKeyTaskGoogle = await getGenerateKey();
        let result = await ajaxCall({url:'syncGoogle',data:JSON.stringify(iterateObjectNewEncrypt(body,genKeyTaskGoogle)),extraHeaders:{keyencrypt:genKeyTaskGoogle},method:'POST',credentialHeader:true})
        resolve(result);
    });
}

async function addTask(value, groupId) {
    return new Promise(async function (resolve, reject) {
        let genKeyTaskOnly = await getGenerateKey();
        let bodyTask = {
            'group_id': groupId,
            'name': value,
            'user_create': ct.name,
            'status': "Pending",
            'priority': "High",
            'user_create_id': ct.id_employee,
            'due_date': moment(moment(), 'YYYY-MM-DD').add(7, 'days').format('YYYY-MM-DD'),
            'timeline': JSON.stringify([moment().format("YYYY-MM-DD"), moment(moment(), 'YYYY-MM-DD').add(7, 'days').format('YYYY-MM-DD')])
        }
        let settingsTask = {
            settings: {
                "async": true,
                "crossDomain": true,
                "url": "/postTask",
                "method": "POST",
                "headers": {
                    "Content-Type": "application/json",
                    "Accept": "*/*",
                    "Cache-Control": "no-cache",
                    "secretKey": ct.secretKey,
                    "token": ct.token,
                    "keyencrypt": genKeyTaskOnly,
                    "signature": ct.signature
                },
                "processData": false,
                "body": JSON.stringify(iterateObjectNewEncrypt(bodyTask,genKeyTaskOnly)),
            }
        }
        let result = await ajaxCall({url:'postTask',data:settingsTask,method:'POST',credentialHeader:true,decrypt:true})
        if (result.responseCode == '200') {
            toastrNotifFull('success add task');
            refreshTableData(groupId)
        } else if (result.responseCode == '401') {
            logoutNotif();
        } else {
            let param = {
                type: 'error',
                text: result.responseMessage
            };
            callNotif(param);
        }
    });
}

async function globalUpdateTask(concern, data) {
    let genKeyUpdate = await getGenerateKey();
    let settingUpdate = {
        settings: {
            "async": true,
            "crossDomain": true,
            "url": "/putTask",
            "method": "PUT",
            "headers": {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Cache-Control": "no-cache",
                "secretKey": ct.secretKey,
                "token": ct.token,
                "signature": ct.signature,
                "keyencrypt": genKeyUpdate
            },
            "processData": false,
            "body": JSON.stringify(iterateObjectNewEncrypt(data,genKeyUpdate)),
        }
    }
    let result = await ajaxCall({url:'putTask',method:'PUT',data:JSON.stringify(settingUpdate)})
    if (result.responseCode == '200') {
        toastrNotifFull('update ' + concern + ' success')
    } else if (result.responseCode == '401') {
        logoutNotif();
    } else {
        toastrNotifFull('update ' + concern + ' failed','error')
    }
}

async function globalAttachFile(data,method = 'POST') {
    return new Promise(async function (resolve, reject) {
        let result = await ajaxCall({url:'attachFile',data:data,method:method,formdata:true,headers:{
            "Accept": "*/*",
            "Cache-Control": "no-cache",
            "secretKey": ct.secretKey,
            "token": ct.token,
            "signature": ct.signature
        }})
        if (result.responseCode == '200') {
            toastrNotifFull('file(s) has been updated');
            resolve(result.responseCode);
        } else if (result.responseCode == '401') {
            logoutNotif();
        } else {
            resolve(toastrNotifFull(result.responseMessage,'error'));
        }
    });
}

async function showAttachmentDetails(id) {
    return new Promise(async function (resolve, reject) {
        $.ajax({
            url: '/proman/showAttachmentDetails',
            method: 'GET',
            headers: {
                "Accept": "*/*",
                "Cache-Control": "no-cache",
                "secretKey": ct.secretKey,
                "token": ct.token,
                "signature": ct.signature,
                'id': id
            },
            success: async function (result) {;
                if (result.responseCode == '200') {
                    resolve(result);
                } else if (result.responseCode == '401') {
                    logoutNotif();
                } else {
                    resolve(toastrNotifFull(result.responseMessage,'error'));
                }
            }
        })
    });
}

async function globalAddComment(data) {
    return new Promise(async function (resolve, reject) {
        let result = await ajaxCall({url:'commentUpdate',data:data,formdata:true,method:'POST',headers:{
            "Accept": "*/*",
            "Cache-Control": "no-cache",
            "secretKey": ct.secretKey,
            "token": ct.token,
            "signature": ct.signature
        }})
        if (result.responseCode == '200') {
            toastrNotifFull('commenting success')
            resolve(result.responseCode);
        } else if (result.responseCode == '401') {
            logoutNotif();
        } else {
            toastrNotifFull('commenting failed','error')
            resolve(500);
        }
    });
}

async function globalUpdateComment(method, data) {
    let genKeyUpdateComment = await getGenerateKey();
    let settingComment = {
        settings: {
            "async": true,
            "crossDomain": true,
            "url": "/commentUpdate",
            "method": method,
            "headers": {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Cache-Control": "no-cache",
                "secretKey": ct.secretKey,
                "token": ct.token,
                "signature": ct.signature,
                "keyencrypt": genKeyUpdateComment
            },
            "processData": false,
            "body": JSON.stringify(iterateObjectNewEncrypt(data,genKeyUpdateComment)),
        }
    }
    let result = await ajaxCall({url:'commentUpdate',data:JSON.stringify(settingComment),method:method})
    if (result.responseCode == '200') {
        toastrNotifFull(result.responseMessage)
    } else if (result.responseCode == '401') {
        logoutNotif();
    } else {
        toastrNotifFull('commenting failed','error')
    }
}

async function globalUpdateReplyComment(method, data) {
    return new Promise(async function (resolve, reject) {
        if(method == 'DELETE' || method == 'delete'){
            let genKeyDeleteReply = await getGenerateKey();
            let settingComment = {
                settings: {
                    "async": true,
                    "crossDomain": true,
                    "url": "/commentReply",
                    "method": method,
                    "headers": {
                        "Content-Type": "application/json",
                        "Accept": "*/*",
                        "Cache-Control": "no-cache",
                        "secretKey": ct.secretKey,
                        "token": ct.token,
                        "signature": ct.signature,
                        "keyencrypt":genKeyDeleteReply
                    },
                    "processData": false,
                    "body": JSON.stringify(iterateObjectNewEncrypt(data,genKeyDeleteReply)),
                }
            }
            let result = await ajaxCall({url:'commentReply',data:JSON.stringify(settingComment),method:'DELETE',credentialHeader:true})
            if (result.responseCode == '200') {
                resolve(result);
                toastrNotifFull('commenting success')
            } else if (result.responseCode == '401') {
                logoutNotif();
            } else {
                reject(500);
                toastrNotifFull('commenting failed','error')
            }
        } else {
            let result = await ajaxCall({url:'commentReply',data:data,method:method,formdata:true,headers:{
                "Accept": "*/*",
                "Cache-Control": "no-cache",
                "secretKey": ct.secretKey,
                "token": ct.token,
                "signature": ct.signature
            }})
            if (result.responseCode == '200') {
                resolve(result);
                toastrNotifFull('commenting success')
            } else if (result.responseCode == '401') {
                logoutNotif();
            } else {
                reject(500);
                toastrNotifFull('commenting failed','error')
            }
        }
        
    })

}