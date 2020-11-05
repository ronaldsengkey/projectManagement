'use strict'

var arrBackground = ["rgba(105, 0, 132, .2)", "rgba(0, 137, 132, .2)", "rgba(255, 99, 132, 0.2)", "rgba(255, 159, 64, 0.2)", "rgba(255, 205, 86, 0.2)", "rgba(75, 192, 192, 0.2)", "rgba(54, 162, 235, 0.2)", "rgba(153, 102, 255, 0.2)", "rgba(201, 203, 207, 0.2)"];
var arrBackground2 = ["rgba(54, 162, 235, 0.2)", "rgba(153, 102, 255, 0.2)", "rgba(201, 203, 207, 0.2)", "rgba(105, 0, 132, .2)", "rgba(0, 137, 132, .2)", "rgba(255, 99, 132, 0.2)", "rgba(255, 159, 64, 0.2)", "rgba(255, 205, 86, 0.2)", "rgba(75, 192, 192, 0.2)"];
var arrbBorder = ["rgba(200, 99, 132, .7)", "rgba(0, 10, 130, .7)", "rgb(255, 99, 132)", "rgb(255, 159, 64)", "rgb(255, 205, 86)", "rgb(75, 192, 192)", "rgb(54, 162, 235)", "rgb(153, 102, 255)", "rgb(201, 203, 207)"];
var arrbBorder2 = ["rgb(54, 162, 235)", "rgb(153, 102, 255)", "rgb(201, 203, 207)", "rgba(200, 99, 132, .7)", "rgba(0, 10, 130, .7)", "rgb(255, 99, 132)", "rgb(255, 159, 64)", "rgb(255, 205, 86)", "rgb(75, 192, 192)"];
var arrLabels = ["Red", "Orange", "Yellow", "Green", "Blue", "Purple", "Grey"];

$(async function () {
    feather.replace();
    $('.beefup').beefup();
    $('#chartSection').prev().addClass('d-none');
    await getBoard();
    
    // await getSummaryBoard('type');
    // await getSummaryBoard('typeForMe');
    // await getSummaryBoard('division');
    // await getSummaryBoard('boardByMember');
    // await getSummaryBoard('boardByTask');
    // await getSummaryBoard('taskForMe');
    // await getSummaryBoard('taskForMeByStatus');
    // await getSummaryBoard('taskByDivision');
    // await getSummaryBoard('taskByStatus');
    // await getSummaryBoard('taskByPriority');
    await getSummaryBoard('taskByDivisionAndStatus');    

})

$(document).on('click', '.removeSidebar', function () {
    if ($('#sidebar-wrapper').hasClass('w767')) {
        $('#sidebar-wrapper').removeClass('w767');
        $('#sidebar-wrapper').addClass('w768');
        $('.removeSidebar').remove();
        $('.headerWrapper').append('<div class="removeSidebar"><i data-feather="arrow-left"></i></div>');
    } else if ($('#sidebar-wrapper').hasClass('w768')) {
        $('#sidebar-wrapper').removeClass('w768');
        $('#sidebar-wrapper').addClass('w767');
        $('.boardPlaceHeader').prepend('<span class="removeSidebar"><i data-feather="arrow-right"></i>&nbsp;</span>');
    }
    feather.replace();
})

async function getBoard() {
    $.ajax({
        url: 'board',
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
            "secretKey": ct.secretKey,
            "token": ct.token,
            "signature": ct.signature
        },
        success: function (result) {
            if (result.responseCode == '200') {
                manageBoardData(result.data);
            } else if (result.responseCode == '404') {
                amaranNotifFull(result.responseMessage);
            } else {
                let param = {
                    type: 'error',
                    text: result.responseMessage
                };
                callNotif(param);
            }
        }
    })
}

async function getSummaryBoard(category) {
    var userData = JSON.parse(localStorage.getItem('accountProfile'));
    var member = userData.name;
    var account_id = userData.id_employee;
    $.ajax({
        url: 'summaryBoard',
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            "Accept": "*/*",
            "Cache-Control": "no-cache",
            "param": JSON.stringify({
                "_id": "",
                "type": "",
                "name": "",
                "account_id": account_id,
                "member": member
            }),
            "category": category,
            "secretKey": ct.secretKey,
            "token": ct.token,
            "signature": ct.signature
        },
        success: function (result) {
            if(category == 'boardByTask'){
                console.log('result boardByTask ==>',result);
            }
            if (result.responseCode == '200') {
                result.category=category;
                manageSummaryBoardData(result);
            } else if (result.responseCode == '404') {
                amaranNotifFull(result.responseMessage);
            } else {
                let param = {
                    type: 'error',
                    text: result.responseMessage
                };
                callNotif(param);
            }
        }
    })
}

async function manageBoardData(data) {
    let boardMain = data.filter(function (e) {
        return e.type == 'Main'
    });
    let boardPrivate = data.filter(function (e) {
        return e.type == 'Private'
    });


    $('.boardListPlaceMain').empty();
    $('.boardListPlacePrivate').empty();
    let publicBoard = '<div class="publicBoardLabel text-center mt-2" style="font-size: xx-large;">Public Board</div>';
    let privateBoard = '<div class="privateBoardLabel text-center mt-2" style="font-size: xx-large;">Private Board</div>';
    if ($('.publicBoardLabel').length == 0) $(publicBoard).insertBefore($('.boardListPlaceMain'));
    if ($('.privateBoardLabel').length == 0) $(privateBoard).insertBefore($('.boardListPlacePrivate'));

    boardMain.forEach(element => {
        window['dataBoardMember' + element._id + ''] = element.member;
        if (element.user_create == ct.name) {
            let htmlMain = '<div class="row"><div class="col-lg-8"><a class="list-group-item list-group-item-action boardList" data-member="' + element.member + '" data-id="' + element._id + '" data-type="' + element.type + '" data-name="' + element.name + '"style="border-top:0;">' + element.name + '</a></div><div class="col-lg-4" style="align-self:center;"><i class="editBoard" data-name="' + element.name + '" data-type=' + element.type + ' data-id=' + element._id + ' data-feather="edit"></i><i class="delBoard" data-id=' + element._id + ' data-feather="trash-2"></i></div></div>';
            $('.boardListPlaceMain').append(htmlMain);
        } else {
            let htmlMain = '<a class="list-group-item list-group-item-action boardList" data-member="' + element.member + '" data-id="' + element._id + '" data-type="' + element.type + '" data-name="' + element.name + '"style="border-top:0;">' + element.name + '</a>';
            $('.boardListPlaceMain').append(htmlMain);
        }

    });

    boardPrivate.forEach(element => {
        if (element.user_create == ct.name) {
            let htmlPrivate = '<div class="row"><div class="col-lg-8"><a class="list-group-item list-group-item-action boardList" data-member="' + element.member + '" data-id="' + element._id + '" data-type="' + element.type + '" data-name="' + element.name + '"style="border-top:0;">' + element.name + '</a></div><div class="col-lg-4" style="align-self:center;"><i class="editBoard" data-name="' + element.name + '" data-type=' + element.type + ' data-id=' + element._id + ' data-feather="edit"></i><i class="delBoard" data-id=' + element._id + ' data-feather="trash-2"></i></div></div>';
            $('.boardListPlacePrivate').append(htmlPrivate);
        }
        element.member = JSON.parse(element.member);
        window['dataBoardMember' + element._id + ''] = element.member;
        element.member.forEach(elementMember => {
            if (elementMember.account_id == ct.id_employee) {
                let htmlPrivate = '<a class="list-group-item list-group-item-action boardList" data-member="' + element.member + '" data-id="' + element._id + '" data-type="' + element.type + '" data-name="' + element.name + '"style="border-top:0;">' + element.name + '</a>';
                $('.boardListPlacePrivate').append(htmlPrivate);
            }
        });
    })

    feather.replace();
}

async function manageSummaryBoardData(data) {
    var result = JSON.stringify(data.data);
    if(data.category == 'type'){
        $('#boardChartType').empty();
        let html = '<div class="publicBoardLabel text-center mt-2" style="font-size: xx-large;">Board Chart By Type</div>';
        html += '<canvas id="chartType" class="p-2"></canvas>';
        $('#boardChartType').html(html);
        await getBarChart('boardType',result);
    }else if(data.category == 'typeForMe'){
        // console.log('result =>',result);
        $('#boardChartTypeForMe').empty();
        let html = '<div class="publicBoardLabel text-center mt-2" style="font-size: xx-large;">Board Chart For Me By Type</div>';
        html += '<canvas id="chartTypeForMe" class="p-2"></canvas>';
        $('#boardChartTypeForMe').html(html);
        await getBarChart('boardTypeForMe',result);

    }else if(data.category == 'division'){
        $('#boardChartDivision').empty();
        let html = '<div class="publicBoardLabel text-center mt-2" style="font-size: xx-large;">Board Chart By Division</div>';
        html += '<canvas id="chartDivision" class="p-2"></canvas>';
        $('#boardChartDivision').html(html);
        await getBarChart('boardDivision',result);
    }else if(data.category == 'boardByMember'){
        $('#boardChartMember').empty();
        let html = '<div class="publicBoardLabel text-center mt-2" style="font-size: xx-large;">Board Chart By Member</div>';
        html += '<canvas id="chartByMember" class="p-2"></canvas>';
        $('#boardChartMember').html(html);
        await getBarChart('boardByMember',result);
    }else if(data.category == 'boardByTask'){
        $('#boardChartTask').empty();
        let html = '<div class="publicBoardLabel text-center mt-2" style="font-size: xx-large;">Board Chart By Task</div>';
        html += '<canvas id="chartByTask" class="p-2"></canvas>';
        $('#boardChartTask').html(html);
        await getBarChart('boardByTask',result);
    }else if(data.category == 'taskForMe'){
        $('#taskForMe').empty();
        let html = '<div class="publicBoardLabel text-center mt-2" style="font-size: xx-large;">Task For Me</div>';
        html += '<canvas id="chartTaskForMe" class="p-2"></canvas>';
        $('#taskForMe').html(html);
        await getBarChart('taskForMe',result);
    }else if(data.category == 'taskForMeByStatus'){
        $('#taskForMeByStatus').empty();
        let html = '<div class="publicBoardLabel text-center mt-2" style="font-size: xx-large;">Task For Me By Status</div>';
        html += '<canvas id="chartTaskForMeByStatus" class="p-2"></canvas>';
        $('#taskForMeByStatus').html(html);
        await getBarChart('taskForMeByStatus',result);
    }else if(data.category == 'taskByDivision'){
        $('#taskByDivision').empty();
        let html = '<div class="publicBoardLabel text-center mt-2" style="font-size: xx-large;">Task By Division</div>';
        html += '<canvas id="chartTaskByDivision" class="p-2"></canvas>';
        $('#taskByDivision').html(html);
        await getBarChart('taskByDivision',result);
    }else if(data.category == 'taskByStatus'){
        $('#taskByStatus').empty();
        let html = '<div class="publicBoardLabel text-center mt-2" style="font-size: xx-large;">Task By Status</div>';
        html += '<canvas id="chartTaskByStatus" class="p-2"></canvas>';
        $('#taskByStatus').html(html);
        await getBarChart('taskByStatus',result);
    }else if(data.category == 'taskByPriority'){
        $('#taskByPriority').empty();
        let html = '<div class="publicBoardLabel text-center mt-2" style="font-size: xx-large;">Task By Priority</div>';
        html += '<canvas id="chartTaskByPriority" class="p-2"></canvas>';
        $('#taskByPriority').html(html);
        await getBarChart('taskByPriority',result);

        
    }else if(data.category == 'taskByDivisionAndStatus'){
        $('#taskByDivisionAndStatus').empty();
        let html = '<div class="publicBoardLabel text-center mt-2" style="font-size: xx-large;">Task By Division And Status</div>';
        html += '<canvas id="chartTaskByDivisionAndStatus" class="p-2"></canvas>';
        $('#taskByDivisionAndStatus').html(html);
        // await getBarChart('taskByDivisionAndStatus',result);
        await getDoubleBarChart('taskByDivisionAndStatus',result);

                
    }else{

    }
}
$(document).on('click', '.delBoard', async function () {
    let boardId = $(this).data('id');
    let param = {
        '_id': boardId
    };
    Swal.fire({
        title: 'Are you sure to delete this board?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Delete it!',
        showLoaderOnConfirm: true,
        preConfirm: async () => {
            await deleteBoard(param);
        },
        allowOutsideClick: () => !Swal.isLoading()
    })
})

$(document).on('click', '.editBoard', async function () {
    let boardId = $(this).data('id');
    let boardType = $(this).data('type');
    let boardName = $(this).data('name');

    let taskValue;
    Swal.fire({
        title: 'Rename board to',
        icon: 'warning',
        input: 'text',
        inputValidator: (value) => {
            if (!value) {
                return 'You need to fill board name!'
            } else {
                taskValue = value;
            }
        },
        inputPlaceholder: boardName,
        showCancelButton: true,
        confirmButtonText: 'Submit',
        showLoaderOnConfirm: true,
        preConfirm: async () => {
            let param = {
                '_id': boardId,
                'name': taskValue,
                'type': capitalize(boardType),
                'division_id': ct.division_id,
                'grade': ct.grade,
                'user_create': ct.name
            };
            await editBoard(param);
        },
        allowOutsideClick: () => !Swal.isLoading()
    })

})

async function editBoard(bodyEdit) {
    return new Promise(async function (resolve, reject) {

        let editSettingsBoard = {
            settings: {
                "async": true,
                "crossDomain": true,
                "url": "/board",
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
                "body": JSON.stringify(bodyEdit),
            }
        }

        $.ajax({
            url: 'board',
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Cache-Control": "no-cache",
                "secretKey": ct.secretKey,
                "token": ct.token,
                "signature": ct.signature
            },
            data: JSON.stringify(editSettingsBoard),
            success: function (result) {
                if (result.responseCode == '200') {
                    let param = {
                        type: 'success',
                        text: result.responseMessage
                    };
                    callNotif(param);
                    getBoard();
                } else {
                    let param = {
                        type: 'error',
                        text: result.responseMessage
                    };
                    callNotif(param);
                }
            }
        })
    })
}

async function deleteBoard(bodyDelete) {
    return new Promise(async function (resolve, reject) {

        let deleteSettingsBoard = {
            settings: {
                "async": true,
                "crossDomain": true,
                "url": "/board",
                "method": "DELETE",
                "headers": {
                    "Content-Type": "application/json",
                    "Accept": "*/*",
                    "Cache-Control": "no-cache",
                    "secretKey": ct.secretKey,
                    "token": ct.token,
                    "signature": ct.signature
                },
                "processData": false,
                "body": JSON.stringify(bodyDelete),
            }
        }

        $.ajax({
            url: 'board',
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Cache-Control": "no-cache",
                "secretKey": ct.secretKey,
                "token": ct.token,
                "signature": ct.signature
            },
            data: JSON.stringify(deleteSettingsBoard),
            success: function (result) {
                if (result.responseCode == '200') {
                    let param = {
                        type: 'success',
                        text: result.responseMessage
                    };
                    callNotif(param);
                    getBoard();
                } else {
                    let param = {
                        type: 'error',
                        text: result.responseMessage
                    };
                    callNotif(param);
                }
            }
        })
    })
}

async function getGroupTask(id) {
    return new Promise(async function (resolve, reject) {

        $.ajax({
            url: 'getGroupTask',
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Cache-Control": "no-cache",
                "secretKey": ct.secretKey,
                "token": ct.token,
                "param": JSON.stringify({
                    'board_id': id
                }),
                "signature": ct.signature
            },
            success: function (result) {
                resolve(result);
            }
        })
    });
}

$(document).on('click', '.boardList', async function () {
    let boardName = capitalize($(this).data('name'));
    let camelized = camelize($(this).data('name'));
    let type = $(this).data('type');
    let name = $(this).data('name');
    let id = $(this).data('id');
    let member = $(this).data('member');
    $('a[class*="boardList"]').removeClass('amber');
    $('a[class*="boardList"]').removeClass('lighten-1');
    $(this).addClass('amber');
    $(this).addClass('lighten-1');
    $('.boardContentData').empty();
    $('.boardContent').empty();
    $('.boardHeader').empty();
    if ($('.removeSidebar').length > 0) $('.removeSidebar').remove();
    let groupTask = await getGroupTask(id);
    if (groupTask.responseCode == '200') {
        // ANCHOR jgn lupa uncomment
        groupTask.data = await groupTaskChecking(groupTask.data);
        window['groupTask' + id + ''] = groupTask.data;
        $.ajax({
            url: 'projectBoard',
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Cache-Control": "no-cache",
            },
            success: function (result) {
                $.getScript('http://'+localUrl + ":" + projectManagementLocalPort + "/public/assets/js/project_management/projectContent.js", function (data, textStatus, jqxhr) {})
                $('.boardContentData').html(result);
                let pass = {
                    boardName: boardName,
                    camelized: camelized,
                    name: name,
                    type: type,
                    id: id,
                    member: JSON.stringify(window['dataBoardMember' + id + ''])
                };
                domBoardTools(pass)
            }
        })
    } else if (groupTask.responseCode == '404') {
        $.ajax({
            url: 'projectBoard',
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Cache-Control": "no-cache",
            },
            success: function (result) {
                $('.boardContentData').html(result);
                let pass = {
                    boardName: boardName,
                    camelized: camelized,
                    name: name,
                    type: type,
                    id: id,
                    member: JSON.stringify(window['dataBoardMember' + id + ''])
                };
                domBoardTools(pass)
            }
        })
    } else {
        let param = {
            type: 'error',
            text: groupTask.responseMessage
        };
        callNotif(param);
    }
})

function domBoardTools(data) {
    let tools = '<div class="row p-3 ml-1 mr-1">' +
        '<div class="col-lg-6" style="align-self: center;">' +
        '<h2 class="boardPlaceHeader"><span class="name">' + data.boardName + '</span> Board</h2>' +
        '</div>' +
        '<div class="col-lg-6" style="text-align: end;">' +
        '<button class="text-white rounded-pill btn amber lighten-1" id="addGroupTask" data-boardtype=' + data.type + ' data-member="' + data.member + '" data-boardname="' + data.boardName + '" data-id="' + data.id + '" data-concern="' + data.camelized + '" type="button">Add Group of Task</button>' +
        '</div>' +
        '</div>';
    $('.boardHeader').append(tools);
    if ($('.removeSidebar').length == 0) $('.headerWrapper').append('<div class="removeSidebar"><i data-feather="arrow-left"></i></div>');
}

let boardMemberJoin = [];

function callNotifBoard(title) {
    const inputOptions = {
        'main': 'Public',
        'private': 'Private',
    }

    let boardName;
    let boardType;

    Swal.fire({
        title: title,
        html: '<input id="swal-input1" class="swal2-input" placeholder="Board Name" autocomplete="off">',
        input: 'radio',
        inputOptions: inputOptions,
        inputValidator: (value) => {
            if (!value) {
                return 'You need to choose something!'
            } else {
                boardType = value;
            }
        },
        onOpen: async () => {
            $('input[value="main"]').attr('checked', 'checked');
        },
        showCancelButton: true,
        confirmButtonText: 'Submit',
        showLoaderOnConfirm: true,
        preConfirm: async () => {
            boardName = document.getElementById('swal-input1').value;

            let bodyBoard = {
                'name': boardName,
                'type': capitalize(boardType),
                'member': JSON.stringify(boardMemberJoin),
                'division_id': ct.division_id,
                'grade': ct.grade,
                'user_create': ct.name
            }
            console.log('boaarr', bodyBoard);
            return await postBoard(bodyBoard).then(function (result) {
                let param;
                if (result.responseCode == '200') {
                    param = {
                        type: 'success',
                        text: result.responseMessage
                    };
                    console.log('the post board');
                    getBoard();
                } else {
                    param = {
                        type: 'error',
                        text: result.responseMessage
                    };
                }
                callNotif(param);
            });
        },
        allowOutsideClick: () => !Swal.isLoading()
    })
}

$(document).on('click', '.addMember', function () {
    boardMemberId = $('#employeeId option:selected').toArray().map(item => item.value);
    boardDivisionName = $('select#divisionId option:selected').text();
    boardDivision = $('select#divisionId').val();
    boardMemberName = $('#employeeId option:selected').toArray().map(item => item.text);
    boardMemberId.forEach(function (e, index) {
        boardMemberJoin.push({
            'departmen_id': boardDivision,
            'departmen_name': boardDivisionName,
            'account_id': e,
            'account_name': boardMemberName[index]
        });
        $('option[value=' + e + ']').remove();
    })
    addAccordion(boardMemberJoin);
})

function addAccordion(boardMemberJoin) {
    $('.accordionPlace').empty();
    console.log('boaaa', boardMemberJoin);
    boardMemberJoin.forEach(element => {
        let camelizeDepartment = camelize(element.departmen_name);
        let splitCamelAccName = camelize(element.account_name);
        if ($('.beefup__head[data-concern="' + camelizeDepartment + '"]').length == 0) {
            let htmlAccordion = '<article class="beefup" data-department="' + camelizeDepartment + '">' +
                '<h2 class="beefup__head" data-toggle="collapse" data-concern="' + camelizeDepartment + '" data-target="#' + splitCamelAccName + '" aria-expanded="true" aria-controls="' + splitCamelAccName + '" id=' + element.account_id + '>' + element.departmen_name + '</h2>' +
                '<div id="' + splitCamelAccName + '" class="collapse beefup__body" data-name="' + camelizeDepartment + '" aria-labelledby=' + camelizeDepartment + '>' +
                '<div id="for' + camelizeDepartment + '"><div class="row rowData" data-name="' + element.account_name + '" data-from="' + element.departmen_name + '"><div class="col-lg-9">' + element.account_name + '</div><div class="col-lg-3"><i class="fa fa-times text-danger close removeData" data-for="' + camelizeDepartment + '" data-id=' + element.account_id + ' data-name="' + element.account_name + '" data-from="' + element.departmen_name + '" style="float:none; cursor:pointer;"></i></div></div></div>' +
                '</div></article>';
            $('.accordionPlace').append(htmlAccordion);
        } else {
            $('#for' + camelizeDepartment).append('<div class="row rowData" data-name="' + element.account_name + '" data-from="' + element.departmen_name + '"><div class="col-lg-9">' + element.account_name + '</div><div class="col-lg-3"><i class="fa fa-times text-danger close removeData" data-for="' + camelizeDepartment + '" data-id=' + element.account_id + ' data-name="' + element.account_name + '" data-from="' + element.departmen_name + '" style="float:none; cursor:pointer;"></i></div></div></div>');
        }

    });

}

$(document).on('click', '.removeData', function () {
    let dataNama = $(this).data("name");
    let dataDepartment = $(this).data("from");
    let empId = $(this).data('id')
    let thisFor = $(this).data('for');
    console.log('daaa', dataNama, dataDepartment);
    $('.rowData[data-name="' + dataNama + '"][data-from="' + dataDepartment + '"]').remove();
    boardMemberJoin = boardMemberJoin.filter(function (e) {
        return e.account_name != dataNama && e.account_id != empId
    })

    if ($('#for' + thisFor).children().length == 0) {
        $('.beefup[data-department="' + thisFor + '"]').remove();
    }

    $('#employeeId[data-concern="' + dataDepartment + '"]').append('<option value=' + empId + '>' + dataNama + '</option>');
})

async function postBoard(body) {
    return new Promise(async function (resolve, reject) {

        let settingsBoard = {
            settings: {
                "async": true,
                "crossDomain": true,
                "url": "/postBoard",
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
                "body": JSON.stringify(body),
            }
        }
        $.ajax({
            url: 'postBoard',
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Cache-Control": "no-cache",
            },
            data: JSON.stringify(settingsBoard),
            success: function (result) {
                resolve(result);
            }
        })
    });
}

$(document).on('click change', 'input[name="swal2-radio"]', async function () {
    if ($(this).val() == 'main') {
        $('#employeeId').addClass('d-none');
        $('#divisionId').addClass('d-none');
    } else {
        $('#employeeId').removeClass('d-none');
        $('#divisionId').removeClass('d-none');

        if ($('#divisionId').length == 0 && $('#employeeId').length == 0) {
            Swal.showLoading();
            let empHtml = '<div class="row"><div class="col-lg-9"><select id="employeeId" multiple class="swal2-input d-none" style="height:auto;"><option id="emptyMember">Please select board member</option></select></div><div class="col-lg-3" style="align-self:center;"><button type="button" class="btn btn-primary addMember">Add</button></div></div>';
            let divHtml = '<select id="divisionId" class="swal2-input d-none"><option id="emptyDivision">Please select board division</option></select>';
            $('.swal2-content').append(divHtml);
            $('.swal2-content').append(empHtml);
            $('.swal2-content').append('<div class="accordionPlace"></div>');
            $('#employeeId').prop('disabled', true);
            $('#divisionId').prop('disabled', true);
            let divisi = await getDivision();
            if (divisi != 500) {
                $('#emptyDivision').remove();
                $('#divisionId').prop('disabled', false);
                let newDivisi = await boardDivisionChecking(divisi);
                newDivisi.forEach(element => {
                    let html = '<option value=' + element.id + '>' + element.name + '</option>';
                    $('#divisionId').append(html);
                });
            }
            let employee = await getEmployee();
            if (employee != 500) {
                $('#emptyMember').remove();
                $('#employeeId').prop('disabled', false);
                $('#employeeId').attr('data-concern', 'Finance');
                let newEmployee = await boardEmployeeChecking(employee);
                newEmployee.forEach(element => {
                    let html = '<option value=' + element.employee_id + ' data-toggle="tooltip" data-placement="left" title="' + element.auth_name + '">' + element.employee_name + '</option>';
                    $('#employeeId').append(html);
                });
            }
            Swal.hideLoading()
        }
    }
})

$(document).on('change', '#divisionId', function () {
    let currentVal = $(this).val();
    $('#employeeId').empty();
    let currentDivision = $('select#divisionId option:selected').text()
    $('#employeeId').attr('data-concern', currentDivision);
    let employeeDivision = window['employeeData'].filter(function (e) {
        return e.division_id == currentVal
    })
    employeeDivision.forEach(element => {
        let html = '<option value=' + element.employee_id + '>' + element.employee_name + '</option>';
        $('#employeeId').append(html);
    });

    let dataBoard = boardMemberJoin.filter(function (e) {
        return e.departmen_id == currentVal;
    })
    dataBoard.forEach(element => {
        $('option[value=' + element.account_id + ']').remove();
    });

})

async function getEmployee() {
    return new Promise(async function (resolve, reject) {

        let param = {
            url: 'getEmployee',
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Cache-Control": "no-cache",
                "token": ct.token,
                "secretKey": ct.secretKey,
                "param": "all",
                "signature": ct.signature
            }
        }

        let b = await getData(param);
        if (b.responseCode == '200') {
            window['employeeData'] = b.data;
            resolve(b.data);
        } else {
            reject(500);
        }
    });

}

async function getDivision() {
    return new Promise(async function (resolve, reject) {

        let param = {
            url: 'getDivision',
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Cache-Control": "no-cache",
                "token": ct.token,
                "secretKey": ct.secretKey,
                "signature": ct.signature
            }
        }
        b = await getData(param);
        if (b.responseCode == '200') {
            resolve(b.data);
        } else {
            reject(500);
        }
    });
}

$(document).on('click', '.addBoard', async function () {
    callNotifBoard('Add Board');
})

$(document).on('click', '#addGroupTask', function () {
    let thisId = $(this).data('id');
    let boardName = $(this).data('boardname');
    let camelized = $(this).data('concern');
    let boardType = $(this).data('boardtype');
    let boardMember = window['dataBoardMember' + thisId + ''];
    let taskValue;

    Swal.fire({
        title: 'Please select PIC and group task name',
        input: 'text',
        inputValidator: (value) => {
            if (!value) {
                return 'You need to fill group task name!'
            } else {
                taskValue = value;
            }
        },
        inputPlaceholder: 'Group task name',
        html: '<select id="picGroup" class="swal2-input"><option selected>Loading...</option></select>',
        onOpen: async () => {
            Swal.showLoading();
            switch (boardType) {
                case 'Main':
                    try {
                        let employee = await getEmployee();
                        if (employee != 500) {
                            $('#picGroup').empty();
                            employee.forEach(element => {
                                let html = '<option value=' + element.employee_id + '>' + element.employee_name + '</option>';
                                $('#picGroup').append(html);
                            });
                        }
                        Swal.hideLoading()
                    } catch (e) {
                        Swal.hideLoading()
                    }
                    break;
                case 'Private':
                    $('#picGroup').empty();
                    boardMember.forEach(element => {
                        let htmlPrivate = '<option value=' + element.account_id + '>' + element.account_name + '</option>';
                        $('#picGroup').append(htmlPrivate);
                    });
                    Swal.hideLoading()
                    break;
            }

        },
        showCancelButton: true,
        confirmButtonText: 'Submit',
        showLoaderOnConfirm: true,
        preConfirm: async () => {
            let pic = [{
                'account_id': $('select#picGroup').val(),
                'account_name': $('select#picGroup :selected').text()
            }]

            let bodyGroup = {
                'board_id': thisId,
                'name': taskValue,
                'pic': JSON.stringify(pic),
                "division_id": ct.division_id,
                "grade": ct.grade,
                "user_create": ct.name
            }
            return await postGroupTask(bodyGroup).then(async function (result) {
                let param;
                if (result.responseCode == '200') {
                    param = {
                        type: 'success',
                        text: result.responseMessage
                    };
                    callNotif(param);
                    $('.boardContentData').empty();
                    $('.boardContent').empty();
                    $('.boardHeader').empty();
                    let gt = await getGroupTask(thisId);
                    if (gt.responseCode == '200') {
                        gt.data = await groupTaskChecking(gt.data);
                        window['groupTask' + thisId + ''] = gt.data;
                        $.ajax({
                            url: 'projectBoard',
                            method: 'GET',
                            headers: {
                                "Content-Type": "application/json",
                                "Accept": "*/*",
                                "Cache-Control": "no-cache",
                            },
                            success: function (result) {
                                $.getScript('http://'+localUrl + ":" + projectManagementLocalPort + "/public/assets/js/project_management/projectContent.js", function (data, textStatus, jqxhr) {})
                                $('.boardContentData').html(result);
                                let pass = {
                                    boardName: boardName,
                                    camelized: camelized,
                                    name: boardName,
                                    id: thisId,
                                    type: boardType,
                                    member: boardMember,
                                };
                                console.log('the pass', pass);
                                domBoardTools(pass)
                            }
                        })
                    } else {
                        param = {
                            type: 'error',
                            text: result.responseMessage
                        };
                        callNotif(param);
                    }
                }
            })
        },
        allowOutsideClick: () => !Swal.isLoading()
    })
})

async function postGroupTask(body) {
    return new Promise(async function (resolve, reject) {

        let settingsGroup = {
            settings: {
                "async": true,
                "crossDomain": true,
                "url": "/postGroup",
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
                "body": JSON.stringify(body),
            }
        }
        $.ajax({
            url: 'postGroup',
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Cache-Control": "no-cache",
            },
            data: JSON.stringify(settingsGroup),
            success: function (result) {
                resolve(result);
            }
        })
    });
}

async function getDoubleBarChart(chartName, data) {
    var nameArray = new Array();
    var workingOnItArray = new Array();
    var stuckArray = new Array();
    var doneArray = new Array();
    var waitingForReviewArray = new Array();

    var tmp = JSON.parse(data)
    tmp.forEach(function (item, index) {
        nameArray[index] = item._id;
        stuckArray[index] = item.stuck;
        workingOnItArray[index] = item.working_on_it;
        doneArray[index] = item.done;
        waitingForReviewArray[index] = item.waiting_for_review;        
    });

    var ctxB = document.getElementById('chartTaskByDivisionAndStatus')
        .getContext('2d');
    var myBarChart = new Chart(ctxB, {
        type: 'bar',
        data: {
            labels: nameArray,
            datasets: [{
                    label: '# of Working on it',
                    data: workingOnItArray,
                    backgroundColor: arrBackground[0],
                    borderColor: arrbBorder[0],
                    borderWidth: 1
                },
                {
                    label: '# of stuck',
                    data: stuckArray,
                    backgroundColor: arrBackground[1],
                    borderColor: arrbBorder[1],
                    borderWidth: 1
                },
                {
                    label: '# of done',
                    data: doneArray,
                    backgroundColor: arrBackground[2],
                    borderColor: arrbBorder[2],
                    borderWidth: 1
                },
                {
                    label: '# of Waiting for review',
                    data: waitingForReviewArray,
                    backgroundColor: arrBackground[3],
                    borderColor: arrbBorder[3],
                    borderWidth: 1
                },

            ]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}
async function getBarChart(chartName, data) {
    
    var nameArray = new Array();
    var totalArray = new Array();
    var backgroundArray = new Array();
    var borderArray = new Array();
    var labelArray = new Array();
    var barId, labelName;

    var chartType = 'pie';
    if (chartName === 'boardType') {
        barId = 'chartType';
        labelName = 'Board Chart By Type';
    } else if (chartName === 'boardTypeForMe') {
        barId = 'chartTypeForMe';
        labelName = 'Board Chart For Me By Type';
    } else if (chartName === 'boardDivision') {
        barId = 'chartDivision';
        labelName = 'Board Chart By Division';
    } else if (chartName === 'boardByMember') {
        barId = 'chartByMember';
        labelName = 'Board Chart By Member';
        chartType = 'bar';
    } else if (chartName === 'boardByTask') {
        console.log('Board Chart By Task')
        barId = 'chartByTask';
        labelName = 'Board Chart By Task';
        chartType = 'bar';
    } else if (chartName === 'taskForMe') {
        barId = 'chartTaskForMe';
        labelName = 'Chart Task For Me';
    } else if (chartName === 'taskForMeByStatus') {
        barId = 'chartTaskForMeByStatus';
        labelName = 'Chart Task For Me By Status';
    } else if (chartName === 'taskByDivision') {
        barId = 'chartTaskByDivision';
        labelName = 'Chart Task By Division';
    } else if (chartName === 'taskByStatus') {
        barId = 'chartTaskByStatus';
        labelName = 'Chart Task By Status';
    } else if (chartName === 'taskByPriority') {
        barId = 'chartTaskByPriority';
        labelName = 'Chart Task By Priority';        
    }

    if(data !== undefined) {
        var tmp = JSON.parse(data);
        if (tmp) {
            var i = 0;
            tmp.forEach(function (item) {
                nameArray[i] = item._id;
                totalArray[i] = item.count;
                labelArray[i] = arrLabels[i];
                backgroundArray[i] = arrBackground[i];
                borderArray[i] = arrbBorder[i];
                i++;
            });
        }

        var ctxB = document.getElementById(barId).getContext('2d');
        var myBarChart = new Chart(ctxB, {
            type: chartType,
            data: {
                labels: nameArray,
                datasets: [{
                    label: labelName,
                    data: totalArray,
                    backgroundColor: backgroundArray,
                    borderColor: borderArray,
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });

    }else{

    }    

    // var ctx = document.getElementById('chartType').getContext('2d');
    // var myChart = new Chart(ctx, {
    //     type: 'pie',
    //     data: {
    //         labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
    //         datasets: [{
    //             label: '# of Votes',
    //             data: [12, 19, 3, 5, 2, 3],
    //             backgroundColor: [
    //                 'rgba(255, 99, 132, 0.2)',
    //                 'rgba(54, 162, 235, 0.2)',
    //                 'rgba(255, 206, 86, 0.2)',
    //                 'rgba(75, 192, 192, 0.2)',
    //                 'rgba(153, 102, 255, 0.2)',
    //                 'rgba(255, 159, 64, 0.2)'
    //             ],
    //             borderColor: [
    //                 'rgba(255, 99, 132, 1)',
    //                 'rgba(54, 162, 235, 1)',
    //                 'rgba(255, 206, 86, 1)',
    //                 'rgba(75, 192, 192, 1)',
    //                 'rgba(153, 102, 255, 1)',
    //                 'rgba(255, 159, 64, 1)'
    //             ],
    //             borderWidth: 1
    //         }]
    //     },
    //     options: {
    //         scales: {
    //             yAxes: [{
    //                 ticks: {
    //                     beginAtZero: true
    //                 }
    //             }]
    //         }
    //     }
    // });
}