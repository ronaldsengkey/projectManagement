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
                console.log('masuk acc Profile tapi fail')
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
            'status': "Working on it",
            'priority': "High",
            'due_date': moment().format("YYYY/MM/DD"),
            'timeline': JSON.stringify([moment().format("YYYY/MM/DD"), moment(moment(), 'YYYY/MM/DD').add('days', '7').format('YYYY/MM/DD')])
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
            success: async function (result) {
                if (result.responseCode == '200') {
                    amaranNotifFull('success add task');
                    result.data = result.data[0];
                    let htmlTaskTag =
                        '<tr><td class="name" data-name="' + result.data.name + '" data-groupid="' + result.data.group_id + '" data-id="' + result.data._id + '">' + value + '</td>' +
                        '<td class="pic" data-name="' + result.data.name + '" data-groupid="' + result.data.group_id + '" data-id="' + result.data._id + '"><i class="icon_user" data-id="' + result.data._id + '" data-feather="user"></i></td>' +
                        '<td class="team" data-team="false" data-name="' + result.data.name + '" data-groupid="' + result.data.group_id + '" data-id="' + result.data._id + '"><i class="icon_team" data-id="' + result.data._id + '" data-feather="user"></i></td>' +
                        '<td class="status mediumPrio text-white" data-name="' + result.data.name + '" data-groupid="' + result.data.group_id + '" data-id="' + result.data._id + '">Working on it</td>' +
                        '<td class="priority highPrio text-white" data-name="' + result.data.name + '" data-groupid="' + result.data.group_id + '" data-id="' + result.data._id + '">High</td>' +
                        '<td class="duedate" data-value="no due date" data-name="' + result.data.name + '" data-groupid="' + result.data.group_id + '" data-id="' + result.data._id + '">no due date</td>' +
                        '<td class="timeline" data-value="no timeline" data-name="' + result.data.name + '" data-groupid="' + result.data.group_id + '" data-id="' + result.data._id + '">no timeline</td>' +
                        '<td><i class="commentTask" data-available="false" data-toggle="modal" data-target="#commentModal" data-name="' + result.data.name + '" data-groupid="' + result.data.group_id + '" data-feather="message-circle" data-id=' + result.data._id + '></i><i class="delTask" data-groupid="' + result.data.group_id + '"  data-name="' + result.data.name + '" data-feather="trash-2" data-id=' + result.data._id + '></i></td>' +
                        '</tr>';
                    $('.dataTask').prepend(htmlTaskTag);
                    feather.replace();
                    $('td.newTask[data-id=' + groupId + ']').css('opacity', '1');
                    $('td.newTask[data-id=' + groupId + ']').html('+ Add Task');
                    await updateStatusProgressBar(result.data, 'No Status', true);
                    await updatePriorityProgressBar(result.data, 'High', true)
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
                amaranNotifFull('update ' + concern + ' success')
            } else {
                amaranNotifFull('update ' + concern + ' failed')
            }
        }
    })
}

async function globalAddComment(data) {
    return new Promise(async function (resolve, reject) {
        let settingComment = {
            settings: {
                "async": true,
                "crossDomain": true,
                "url": "/commentUpdate",
                "method": 'POST',
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
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Cache-Control": "no-cache",
            },
            data: JSON.stringify(settingComment),
            success: async function (result) {
                if (result.responseCode == '200') {
                    amaranNotifFull('commenting success')
                    resolve(result.data[0]);
                } else {
                    reject(500);
                    amaranNotifFull('commenting failed')
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
                amaranNotifFull('commenting success')
            } else {
                amaranNotifFull('commenting failed')
            }
        }
    })
}

async function globalUpdateReplyComment(method, data) {
    return new Promise(function (resolve, reject) {
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
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Cache-Control": "no-cache",
            },
            data: JSON.stringify(settingComment),
            success: function (result) {
                if (result.responseCode == '200') {
                    resolve(result);
                    amaranNotifFull('commenting success')
                } else {
                    reject(500);
                    amaranNotifFull('commenting failed')
                }
            }
        })
    })

}