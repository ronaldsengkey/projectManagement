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
    $.ajax({
        url: 'trelloBoard',
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            "Accept": "*/*",
            "Cache-Control": "no-cache",
            "secretKey": ctProf.secretKey,
            "token": ctProf.token,
            "signature": ctProf.signature
        },
        success: async function (result) {
            loadingDeactivated();
            await manageTrelloBoard(result);
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
                "board_id": id,
                "signature": ctProf.signature
            },
            success: function (result) {
                resolve(result);
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

async function getCardData(id, data, boardMember) {
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
                'list_id': id,
                "signature": ctProf.signature
            },
            success: async function (result) {
                // resolve(result);
                let newRes = await selectedTask(result);
                await domCardData(newRes, id, data, boardMember);
                // if (result.responseCode == '200') {
                //     await domTaskTable(result.data, id, data, boardMember);
                // } else if (result.responseCode == '404') {
                //     await domTaskTable([], id, data);
                // } else {
                //     let param = {
                //         type: 'error',
                //         text: result.responseMessage
                //     };
                //     callNotif(param);
                // }
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
                amaranNotifFull('update ' + concern + ' success')
            } else {
                amaranNotifFull('update ' + concern + ' failed')
            }
        }
    })
}