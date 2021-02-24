let ctProf;

$(function(){
    ctProf = JSON.parse(localStorage.getItem('accountProfile'));
})

async function renameBoard(id,newName) {
    return new Promise(async function (resolve, reject) {
        $.ajax({
            url: renameBoard.name,
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Cache-Control": "no-cache",
                "secretKey": ctProf.secretKey,
                "token": ctProf.token,
                "signature": ctProf.signature
            },
            data: JSON.stringify({'name': newName,'boardId':id}),
            success: async function (result) {
                resolve(result);
            }
        })
    });
}

async function getTrelloBoard(){
    loadingActivated();
    $.ajax({
        url: 'trelloBoard',
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            "Accept": "*/*",
            "Cache-Control": "no-cache",
            "param": JSON.stringify({
                "_id": "",
                "type": "",
                "name": "",
                "account_id": ""
            }),
            "secretKey": ctProf.secretKey,
            "token": ctProf.token,
            "signature": ctProf.signature
        },
        success: async function (result) {
            if(result.responseCode == '200'){
                await manageTrelloBoard(JSON.parse(result.data));
            } else if (result.responseCode == '401') {
                logoutNotif();
            } else {
                loadingDeactivated();
                let param = {
                    type: 'error',
                    text: result.responseMessage
                };
                callNotif(param);
            }
        }
    })
}

async function getTrelloList(id) {
    return new Promise(async function (resolve, reject) {
        $.ajax({
            url: 'trelloList',
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Cache-Control": "no-cache",
                "secretKey": ctProf.secretKey,
                "token": ctProf.token,
                "param": JSON.stringify({
                    'board_id': id
                }),
                "signature": ctProf.signature
            },
            success: function (result) {
                if(result.responseCode == '200'){
                    resolve(JSON.parse(result.data));
                } else if (result.responseCode == '401') {
                    logoutNotif();
                } else {
                    loadingDeactivated();
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

async function deleteBoardTrello(id) {
    return new Promise(async function (resolve, reject) {
        $.ajax({
            url: deleteBoardTrello.name,
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Cache-Control": "no-cache",
                "secretKey": ctProf.secretKey,
                "token": ctProf.token,
                "signature": ctProf.signature
            },
            data: JSON.stringify({'boardId':id}),
            success: async function (result) {
                resolve(result);
            }
        })
    });
}

async function deleteList(id) {
    return new Promise(async function (resolve, reject) {
        $.ajax({
            url: deleteList.name,
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Cache-Control": "no-cache",
                "secretKey": ctProf.secretKey,
                "token": ctProf.token,
                "signature": ctProf.signature
            },
            data:JSON.stringify({'listId':id}),
            success: async function (result) {
                resolve(result);
            }
        })
    });
}

async function renameList(id,newName) {
    return new Promise(async function (resolve, reject) {
        $.ajax({
            url: renameList.name,
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Cache-Control": "no-cache",
                "secretKey": ctProf.secretKey,
                "token": ctProf.token,
                "signature": ctProf.signature
            },
            data: JSON.stringify({'listId':id,'name':newName}),
            success: async function (result) {
                resolve(result);
            }
        })
    });
}

async function deleteTaskTrello(body) {
    return new Promise(async function (resolve, reject) {
        $.ajax({
            url: deleteTaskTrello.name,
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Cache-Control": "no-cache",
                "secretKey": ctProf.secretKey,
                "token": ctProf.token,
                "signature": ctProf.signature
            },
            data: JSON.stringify(body),
            success: async function (result) {
                resolve(result);
            }
        })
    });
}

async function getCardData(id, data) {
    return new Promise(async function (resolve, reject) {
        $.ajax({
            url: getCardData.name,
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Cache-Control": "no-cache",
                "secretKey": ctProf.secretKey,
                "token": ctProf.token,
                "param": JSON.stringify({
                    'list_id': id
                }),
                "signature": ctProf.signature
            },
            success: async function (result) {
                console.log('res card',JSON.parse(result.data));
                if(result.responseCode == '200'){
                    let newRes = await selectedTask(JSON.parse(result.data));
                    await domCardData(newRes, id, data);
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

async function selectedTask(data){
    let myId = sessionStorage.getItem('meId');
    let pref = sessionStorage.getItem('prefTask');
    if(pref != 'all'){
        let newData = data.filter(function(e){
            if(e.idMembers.includes(myId)) return e;
        })
        return newData;
    } else {
        return data;
    }
    
}

function globalUpdateTaskTrello(concern, data) {
    $.ajax({
        url: 'putTaskTrello',
        method: 'PUT',
        headers: {
            "Content-Type": "application/json",
            "Accept": "*/*",
            "Cache-Control": "no-cache",
            "secretKey": ctProf.secretKey,
            "token": ctProf.token,
            "signature": ctProf.signature
        },
        data: JSON.stringify(data),
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