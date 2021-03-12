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
        $.ajax({
            url: 'getTaskData',
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Cache-Control": "no-cache",
                "secretKey": ct.secretKey,
                "token": ct.token,
                "param": JSON.stringify({
                    'group_id': id
                }),
                "signature": ct.signature
            },
            success: async function (result) {
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
            }
        })
    });
}

async function editGroupTask(body) {
    return new Promise(async function (resolve, reject) {
        $.ajax({
            url: 'editGroup',
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Cache-Control": "no-cache",
                "secretKey": ct.secretKey,
                "token": ct.token,
                "signature": ct.signature,
            },
            data: JSON.stringify(body),
            success: function (result) {
                resolve(result);
            }
        })
    });
}

async function deleteGroupTask(body) {
    return new Promise(async function (resolve, reject) {
        $.ajax({
            url: 'deleteGroup',
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Cache-Control": "no-cache",
                "secretKey": ct.secretKey,
                "token": ct.token,
                "signature": ct.signature,
            },
            data: JSON.stringify(body),
            success: function (result) {
                resolve(result);
            }
        })
    });
}

async function getComment(taskId) {
    return new Promise(async function (resolve, reject) {
        $.ajax({
            url: 'comment',
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Cache-Control": "no-cache",
                "param": JSON.stringify({
                    'task_id': taskId
                }),
                "secretKey": ct.secretKey,
                "token": ct.token,
                "signature": ct.signature
            },
            success: function (result) {
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
            }
        })
    })
}

async function deleteTask(body) {
    return new Promise(async function (resolve, reject) {
        $.ajax({
            url: 'deleteTask',
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Cache-Control": "no-cache",
                "secretKey": ct.secretKey,
                "token": ct.token,
                "signature": ct.signature,
            },
            data: JSON.stringify(body),
            success: function (result) {
                resolve(result);
            }
        })
    });
}

async function addTask(value, groupId) {
    return new Promise(async function (resolve, reject) {
        let bodyTask = {
            'group_id': groupId,
            'name': value,
            'user_create': ct.name,
            'status': "Pending",
            'priority': "High",
            'due_date': moment().format("YYYY/MM/DD"),
            'timeline': JSON.stringify([moment().format("YYYY/MM/DD"), moment(moment(), 'YYYY/MM/DD').add(7, 'days').format('YYYY/MM/DD')])
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
                    "signature": ct.signature
                },
                "processData": false,
                "body": JSON.stringify(bodyTask),
            }
        }
        $.ajax({
            url: 'postTask',
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Cache-Control": "no-cache",
            },
            data: JSON.stringify(settingsTask),
            timeout: 30000,
            success: async function (result) {
                if (result.responseCode == '200') {
                    toastrNotifFull('success add task');
                    containerOnLoad('cardGT'+groupId+'')
                    $('.headerGT[data-id='+groupId+']').click()
                    setTimeout(() => {
                        $('.headerGT[data-id='+groupId+']').click()
                        
                    }, 500);
                    let intervalData = setInterval(() => {
                        if($('#table'+groupId).length > 0){
                            clearInterval(intervalData)
                            containerDone('cardGT'+groupId+'')
                        }
                    }, 1000);

                } else if (result.responseCode == '401') {
                    logoutNotif();
                } else {
                    let param = {
                        type: 'error',
                        text: result.responseMessage
                    };
                    callNotif(param);
                }
            }
        })
    });
}

function globalUpdateTask(concern, data) {
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
                "signature": ct.signature
            },
            "processData": false,
            "body": JSON.stringify(data),
        }
    }
    $.ajax({
        url: 'putTask',
        method: 'PUT',
        headers: {
            "Content-Type": "application/json",
            "Accept": "*/*",
            "Cache-Control": "no-cache",
        },
        data: JSON.stringify(settingUpdate),
        success: function (result) {
            if (result.responseCode == '200') {
                toastrNotifFull('update ' + concern + ' success')
            } else if (result.responseCode == '401') {
                logoutNotif();
            } else {
                toastrNotifFull('update ' + concern + ' failed','error')
            }
        }
    })
}

async function globalAttachFile(data,method = 'POST') {
    return new Promise(async function (resolve, reject) {
        $.ajax({
            url: 'attachFile',
            method: method,
            headers: {
                "Accept": "*/*",
                "Cache-Control": "no-cache",
                "secretKey": ct.secretKey,
                "token": ct.token,
                "signature": ct.signature
            },
            processData: false,
            contentType: false,
            data: data,
            success: async function (result) {
                if (result.responseCode == '200') {
                    toastrNotifFull('file(s) has been updated');
                    resolve(result.responseCode);
                } else if (result.responseCode == '401') {
                    logoutNotif();
                } else {
                    resolve(toastrNotifFull(result.responseMessage,'error'));
                }
            }
        })
    });
}

async function showAttachmentDetails(id) {
    return new Promise(async function (resolve, reject) {
        $.ajax({
            url: 'showAttachmentDetails',
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
        // let settingComment = {
        //     settings: {
        //         "async": true,
        //         "crossDomain": true,
        //         "url": "/commentUpdate",
        //         "method": 'POST',
        //         "headers": {
        //             "Content-Type": "application/json",
        //             "Accept": "*/*",
        //             "Cache-Control": "no-cache",
        //             "secretKey": ct.secretKey,
        //             "token": ct.token,
        //             "signature": ct.signature
        //         },
        //         "processData": false,
        //         "contentType": false,
        //         "data": data
        //     }
        // }
        $.ajax({
            url: 'commentUpdate',
            method: 'POST',
            headers: {
                "Accept": "*/*",
                "Cache-Control": "no-cache",
                "secretKey": ct.secretKey,
                "token": ct.token,
                "signature": ct.signature
            },
            processData: false,
            contentType: false,
            data: data,
            success: async function (result) {
                if (result.responseCode == '200') {
                    toastrNotifFull('commenting success')
                    resolve(result.data[0]);
                } else if (result.responseCode == '401') {
                    logoutNotif();
                } else {
                    toastrNotifFull('commenting failed','error')
                    resolve(500);
                }
            }
        })
    });
}

function globalUpdateComment(method, data) {
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
                "signature": ct.signature
            },
            "processData": false,
            "body": JSON.stringify(data),
        }
    }
    $.ajax({
        url: 'commentUpdate',
        method: method,
        headers: {
            "Content-Type": "application/json",
            "Accept": "*/*",
            "Cache-Control": "no-cache",
        },
        data: JSON.stringify(settingComment),
        success: function (result) {
            if (result.responseCode == '200') {
                toastrNotifFull('commenting success')
            } else if (result.responseCode == '401') {
                logoutNotif();
            } else {
                toastrNotifFull('commenting failed','error')
            }
        }
    })
}

async function globalUpdateReplyComment(method, data) {
    return new Promise(function (resolve, reject) {
        if(method == 'DELETE' || method == 'delete'){
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
                        "signature": ct.signature
                    },
                    "processData": false,
                    "body": JSON.stringify(data),
                }
            }
            $.ajax({
                url: 'commentReply',
                method: method,
                headers: {
                    "Accept": "*/*",
                    "Content-Type": "application/json",
                    "Cache-Control": "no-cache",
                    "secretKey": ct.secretKey,
                    "token": ct.token,
                    "signature": ct.signature
                },
                data: JSON.stringify(settingComment),
                success: function (result) {
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
        } else {
            $.ajax({
                url: 'commentReply',
                method: method,
                headers: {
                    "Accept": "*/*",
                    "Cache-Control": "no-cache",
                    "secretKey": ct.secretKey,
                    "token": ct.token,
                    "signature": ct.signature
                },
                processData: false,
                contentType: false,
                data: data,
                success: function (result) {
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
        
    })

}