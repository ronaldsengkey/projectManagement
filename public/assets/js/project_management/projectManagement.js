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
    let getUrl = window.location.search;
    let boardAidi = new URLSearchParams(getUrl).get('boardId');
    if (boardAidi != undefined && boardAidi != '') {
        if (localStorage.getItem('accountProfile') != undefined) {
            let boardDataStatus = await getBoard();
            if(boardDataStatus == '401'){
                logoutNotif(function(){
                    window.location.href = '/login' + window.location.search
                })
                
            } else {
                await chartBoardChecking();
                // appendFilter();
                // appendFilter([filterTimeRanges]);
                if (ct.grade == '4' || ct.grade == '5') appendFilter([filterTimeRanges, filterChart]);
                else appendFilter([filterTimeRanges, filterChartUp]);

                $('.filterChartName').html('Board Type');
                $('.filterTimeName').html('Last 7 Days');

                //check for redirect email
                checkGroupTaskRedirect(boardDataStatus);
            }

        } else
            window.location.href = '/login' + window.location.search
    } else {
        let boardDataStatus = await getBoard();
        if(boardDataStatus == '401'){
            logoutNotif()
        } else {
            await chartBoardChecking();
            // appendFilter();
            // appendFilter([filterTimeRanges]);
            if (ct.grade == '4' || ct.grade == '5') appendFilter([filterTimeRanges, filterChart]);
            else appendFilter([filterTimeRanges, filterChartUp]);

            $('.filterChartName').html('Board Type');
            $('.filterTimeName').html('Last 7 Days');
        }
        
    }

})

function checkGroupTaskRedirect(boardDataStatus) {
    let getUrl = window.location.search;
    let boardAidi = new URLSearchParams(getUrl).get('boardId');
    let groupTaskAidi = new URLSearchParams(getUrl).get('groupTaskId');
    let taskId = new URLSearchParams(getUrl).get('taskId');
    if (boardAidi != undefined && boardAidi != '') {
        if (boardDataStatus == '200') {
            $('.boardList[data-id=' + boardAidi + ']').click();
            let intervCardBorder = setInterval(() => {
                if ($('.accordionBoard').length > 0) {
                    $('#cardGT' + groupTaskAidi).css('border', '4px solid #ff8f00');
                    $('.headerGT[data-id=' + groupTaskAidi + ']').click();
                    $('#cardGT' + groupTaskAidi).hover(
                        function () {
                            $('#cardGT' + groupTaskAidi).css('border', 'none');
                            history.pushState({}, null, 'employee');
                        },
                        function () {

                        }
                    );
                    clearInterval(intervCardBorder);


                }
            }, 1500);

            if (taskId != undefined && taskId != '') {
                let intervTask = setInterval(() => {
                    if ($('.dataTask[data-id=' + groupTaskAidi + ']').length > 0) {
                        $('.taskRow[data-id=' + taskId + ']').addClass('amber lighten-2');
                        $('#cardGT' + groupTaskAidi).hover(
                            function () {
                                $('.taskRow[data-id=' + taskId + ']').removeClass('amber lighten-2');
                            },
                            function () {

                            }
                        );
                        clearInterval(intervTask);
                    }
                }, 1500);
            }
        }

    }
}

function loadingActivated() {
    const loading = '<div id="loadingWrap">' +
        '<div class="text-center contentLoadingWrap">' +
        '<div class="lds-ripple"><div></div><div></div></div>' +
        '</div>' +
        '</div>';
    $(loading).insertBefore('head');
    $('#loadingWrap').fadeIn('slow');
}

function loadingDeactivated() {
    $('#loadingWrap').fadeOut('slow', function () {
        $('#loadingWrap').remove();
    });
}

$(document).on('click', '.removeSidebar', function () {
    if ($('#sidebar-wrapper').hasClass('w767')) {
        $('#sidebar-wrapper').removeClass('w767');
        $('#sidebar-wrapper').addClass('w768');
        $('.removeSidebar').remove();
        $('.boardPlaceHeader').prepend('<span class="removeSidebar mr-2"><i data-feather="arrow-left"></i></span>');
    } else if ($('#sidebar-wrapper').hasClass('w768')) {
        $('#sidebar-wrapper').removeClass('w768');
        $('#sidebar-wrapper').addClass('w767');
        $('.removeSidebar').remove();
        $('.boardPlaceHeader').prepend('<span class="removeSidebar"><i data-feather="arrow-right"></i>&nbsp;</span>');
    }
    feather.replace();
})

async function getBoard() {
    return new Promise(async function (resolve, reject) {
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
                loadingDeactivated();
                if (result.responseCode == '200') {
                    manageBoardData(result.data);
                } else if (result.responseCode == '404') {
                    toastrNotifFull(result.responseMessage, 'error');
                } else if (result.responseCode != '401') {
                    let param = {
                        type: 'error',
                        text: result.responseMessage
                    };
                    callNotif(param);
                }
                resolve(result.responseCode);
            }
        })
    })

}

async function getSummaryBoard(category, param = '') {
    var userData = JSON.parse(localStorage.getItem('accountProfile'));
    var account_id = userData.id_employee;
    var dParam = {
        "account_id": account_id
    }
    var rParam = extend({}, dParam, param);
    // console.log('rParam =>',rParam)
    $.ajax({
        url: 'summaryBoard',
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            "Accept": "*/*",
            "Cache-Control": "no-cache",
            "param": JSON.stringify(rParam),
            // "param": JSON.stringify({
            //     "_id": "",
            //     "type": "",
            //     "name": "",
            //     "account_id": account_id
            // }),
            "category": category,
            "secretKey": ct.secretKey,
            "token": ct.token,
            "signature": ct.signature
        },
        success: function (result) {
            loadingDeactivated();
            console.log('category =>', category, ' =>', result);
            // if(category == 'taskForMeByStatus'){
            // }
            if (ct.grade == '4' || ct.grade == '5') {
                result.category = 'boardTypeForMe';
                result.names = category;
            } else {
                result.category = 'boardType';
                result.names = category;
            }
            // result.category = category;
            if (result.responseCode == '200' || result.responseCode == '404') {
                manageSummaryBoardData(result);
            }
        }
    })
}

async function manageBoardData(data) {
    let boardMain = data.filter(function (e) {
        return e.type.toUpperCase() == 'MAIN'
    });
    let boardPrivate = data.filter(function (e) {
        return e.type.toUpperCase() == 'PRIVATE'
    });


    $('.boardListPlaceMain').empty();
    $('.boardListPlacePrivate').empty();
    let publicBoard = '<div class="publicBoardLabelName text-center mt-2" style="font-size: xx-large;">Public Board</div>';
    let privateBoard = '<div class="privateBoardLabel text-center mt-2" style="font-size: xx-large;">Private Board</div>';
    if ($('.publicBoardLabelName').length == 0) $(publicBoard).insertBefore($('.boardListPlaceMain'));
    if ($('.privateBoardLabel').length == 0) $(privateBoard).insertBefore($('.boardListPlacePrivate'));

    boardMain.forEach(element => {
        window['dataBoardMember' + element._id + ''] = element.member;
        if (element.user_create == ct.name) {
            let htmlMain = '<div class="row"><div class="col-lg-8"><a class="list-group-item list-group-item-action boardList" data-create="' + element.user_create + '" data-member="' + element.member + '" data-id="' + element._id + '" data-type="' + element.type + '" data-name="' + element.name + '"style="border-top:0;">' + element.name + '</a></div><div class="col-lg-4" style="align-self:center;"><i class="editBoard" data-name="' + element.name + '" data-type=' + element.type + ' data-id=' + element._id + ' data-feather="edit"></i><i class="delBoard" data-name="' + element.name + '" data-id=' + element._id + ' data-feather="trash-2"></i></div></div>';
            $('.boardListPlaceMain').append(htmlMain);
        } else {
            let htmlMain = '<a class="list-group-item list-group-item-action boardList" data-create="' + element.user_create + '" data-member="' + element.member + '" data-id="' + element._id + '" data-type="' + element.type + '" data-name="' + element.name + '"style="border-top:0;">' + element.name + '</a>';
            $('.boardListPlaceMain').append(htmlMain);
        }

    });

    boardPrivate.forEach(element => {
        if (element.user_create == ct.name) {
            element.member = JSON.parse(element.member);
            window['dataBoardMember' + element._id + ''] = element.member;
            let htmlPrivate = '<div class="row"><div class="col-lg-8"><a class="list-group-item list-group-item-action boardList" data-create="' + element.user_create + '" data-member="' + element.member + '" data-id="' + element._id + '" data-type="' + element.type + '" data-name="' + element.name + '"style="border-top:0;">' + element.name + '</a></div><div class="col-lg-4" style="align-self:center;"><i class="editBoard" data-name="' + element.name + '" data-type=' + element.type + ' data-id=' + element._id + ' data-feather="edit"></i><i class="delBoard" data-name="' + element.name + '" data-id=' + element._id + ' data-feather="trash-2"></i></div></div>';
            $('.boardListPlacePrivate').append(htmlPrivate);
        } else {
            element.member = JSON.parse(element.member);
            window['dataBoardMember' + element._id + ''] = element.member;
            element.member.forEach(elementMember => {
                if (elementMember.account_id == ct.id_employee) {
                    let htmlPrivate = '<a class="list-group-item list-group-item-action boardList" data-create="' + element.user_create + '" data-member="' + element.member + '" data-id="' + element._id + '" data-type="' + element.type + '" data-name="' + element.name + '"style="border-top:0;">' + element.name + '</a>';
                    $('.boardListPlacePrivate').append(htmlPrivate);
                }
            });
        }
    })

    feather.replace();
}

async function manageSummaryBoardData(data) {

    if (data.data != undefined || data.data != null) {
        var result = JSON.stringify(data.data);
        var divId = data.category;
        var chartName = divId.charAt(0).toUpperCase() + divId.slice(1);
        var chartId = 'chart' + chartName;
        console.log('data summary', data);

        if (data.names == 'taskByDivisionAndStatus') {
            $('#' + divId).empty();
            let html = '<div class="publicBoardLabel text-center mt-2" style="font-size: xx-large;" id="lbl' + chartName + '">' + splitCamel(data.names) + '</div>';
            html += '<canvas id="' + chartId + '" class="p-2"></canvas>';
            $('#' + divId).html(html);
            await getDoubleBarChart(data.names, result);
        } else {
            $('#' + divId).empty();
            let html = '<div class="publicBoardLabel text-center mt-2" style="font-size: xx-large;" id="lbl' + chartName + '">' + splitCamel(data.names) + '</div>';
            html += '<canvas id="' + chartId + '" class="p-2"></canvas>';
            $('#' + divId).html(html);
            await getBarChart(data.names, result);
        }
    } else {
        let names;
        if (ct.grade == '4' || ct.grade == '5') {
            names = 'boardTypeForMe';
        } else {
            names = 'boardType';
        }
        var divId = data.category;
        var chartName = divId.charAt(0).toUpperCase() + divId.slice(1);

        $('#' + names).empty();
        let html = '<div class="publicBoardLabel text-center mt-2" style="font-size: xx-large;" id="lbl' + chartName + '">Chart ' + splitCamel(data.names) + '<p><img class="text-center font-italic" style="opacity:0.7;" src="public/assets/img/emptyProjects.png" width="300px" height="300px"></img></p></div>';
        $('#' + names).html(html);
    }

    // if(data.category == 'type'){
    //     $('#boardChartType').empty();
    //     let html = '<div class="publicBoardLabel text-center mt-2" style="font-size: xx-large;">Board Chart By Type</div>';
    //     html += '<canvas id="chartType" class="p-2"></canvas>';
    //     $('#boardChartType').html(html);
    //     await getBarChart('boardType',result);
    // }else if(data.category == 'boardTypeForMe'){
    //     $('#boardTypeForMe').empty();
    //     let html = '<div class="publicBoardLabel text-center mt-2" style="font-size: xx-large;">Board Chart For Me By Type</div>';
    //     html += '<canvas id="chartTypeForMe" class="p-2"></canvas>';
    //     $('#boardTypeForMe').html(html);
    //     await getBarChart('boardTypeForMe',result);

    // }else if(data.category == 'division'){
    //     $('#boardDivision').empty();
    //     let html = '<div class="publicBoardLabel text-center mt-2" style="font-size: xx-large;">Board Chart By Division</div>';
    //     html += '<canvas id="chartDivision" class="p-2"></canvas>';
    //     $('#boardDivision').html(html);
    //     await getBarChart('boardDivision',result);
    // }else if(data.category == 'boardByMember'){
    //     $('#boardChartMember').empty();
    //     let html = '<div class="publicBoardLabel text-center mt-2" style="font-size: xx-large;">Board Chart By Member</div>';
    //     html += '<canvas id="chartByMember" class="p-2"></canvas>';
    //     $('#boardChartMember').html(html);
    //     await getBarChart('boardByMember',result);
    // }else if(data.category == 'boardTask'){
    //     $('#boardChartTask').empty();
    //     let html = '<div class="publicBoardLabel text-center mt-2" style="font-size: xx-large;">Board Chart By Task</div>';
    //     html += '<canvas id="chartByTask" class="p-2"></canvas>';
    //     $('#boardChartTask').html(html);
    //     await getBarChart('boardTask',result);
    // }else if(data.category == 'taskForMe'){
    //     $('#taskForMe').empty();
    //     let html = '<div class="publicBoardLabel text-center mt-2" style="font-size: xx-large;">Task For Me</div>';
    //     html += '<canvas id="chartTaskForMe" class="p-2"></canvas>';
    //     $('#taskForMe').html(html);
    //     await getBarChart('taskForMe',result);
    // }else if(data.category == 'taskForMeByStatus'){
    //     $('#taskForMeByStatus').empty();
    //     let html = '<div class="publicBoardLabel text-center mt-2" style="font-size: xx-large;">Task For Me By Status</div>';
    //     html += '<canvas id="chartTaskForMeByStatus" class="p-2"></canvas>';
    //     $('#taskForMeByStatus').html(html);
    //     await getBarChart('taskForMeByStatus',result);
    // }else if(data.category == 'taskByDivision'){
    //     $('#taskByDivision').empty();
    //     let html = '<div class="publicBoardLabel text-center mt-2" style="font-size: xx-large;">Task By Division</div>';
    //     html += '<canvas id="chartTaskByDivision" class="p-2"></canvas>';
    //     $('#taskByDivision').html(html);
    //     await getBarChart('taskByDivision',result);
    // }else if(data.category == 'taskByStatus'){
    //     $('#taskByStatus').empty();
    //     let html = '<div class="publicBoardLabel text-center mt-2" style="font-size: xx-large;">Task By Status</div>';
    //     html += '<canvas id="chartTaskByStatus" class="p-2"></canvas>';
    //     $('#taskByStatus').html(html);
    //     await getBarChart('taskByStatus',result);
    // }else if(data.category == 'taskByPriority'){
    //     $('#taskByPriority').empty();
    //     let html = '<div class="publicBoardLabel text-center mt-2" style="font-size: xx-large;">Task By Priority</div>';
    //     html += '<canvas id="chartTaskByPriority" class="p-2"></canvas>';
    //     $('#taskByPriority').html(html);
    //     await getBarChart('taskByPriority',result);
    // }else if(data.category == 'taskByDeadLine'){
    //     $('#taskByDeadLine').empty();
    //     let html = '<div class="publicBoardLabel text-center mt-2" style="font-size: xx-large;">Task By Deadline</div>';
    //     html += '<canvas id="chartTaskByDeadLine" class="p-2"></canvas>';
    //     $('#taskByDeadLine').html(html);
    //     await getBarChart('taskByDeadLine',result);

    // }else if(data.category == 'taskByDivisionAndStatus'){
    //     $('#taskByDivisionAndStatus').empty();
    //     let html = '<div class="publicBoardLabel text-center mt-2" style="font-size: xx-large;">Task By Division And Status</div>';
    //     html += '<canvas id="chartTaskByDivisionAndStatus" class="p-2"></canvas>';
    //     $('#taskByDivisionAndStatus').html(html);
    //     // await getBarChart('taskByDivisionAndStatus',result);
    //     await getDoubleBarChart('taskByDivisionAndStatus',result);


    // }else{

    // }
}

function splitCamel(word) {
    var result = word.replace(/([A-Z])/g, " $1");
    var finalResult = result.charAt(0).toUpperCase() + result.slice(1);
    return finalResult;
}

async function manageNullBoardData(data) {
    var divId = data.category;
    var chartName = divId.charAt(0).toUpperCase() + divId.slice(1);
    var chartId = 'chart' + chartName;
    console.log('chartname', chartName);
    // var node = document.getElementById('lbl'+chartName);
    // let html = node.outerHTML;

    $('#' + divId).empty();
    let html = '<div class="publicBoardLabel text-center mt-2" style="font-size: xx-large;" id=' + labelused + '>Chart ' + splitCamel(chartName) + '<p><img width="300px" height="300px" style="opacity:0.7;" class="text-center font-italic" src="public/assets/img/emptyProjects.png"></img></p></div>';
    $('#' + divId).html(html);

    // if(data.category == 'boardType'){
    //     $('#boardType').empty();
    //     // let html = '<div class="publicBoardLabel text-center mt-2" style="font-size: xx-large;" id="lbl'+chartName+'">Board Chart By Type</div>';
    //     html += '<p class="text-center font-italic">'+data.responseMessage+'</p>';
    //     $('#boardType').html(html);
    // }else if(data.category == 'boardTypeForMe'){
    //     $('#boardTypeForMe').empty();
    //     // let html = '<div class="publicBoardLabel text-center mt-2" style="font-size: xx-large;">Board Chart For Me By Type</div>';
    //     html += '<p class="text-center font-italic">'+data.responseMessage+'</p>';
    //     $('#boardTypeForMe').html(html);
    // }else if(data.category == 'division'){
    //     $('#boardDivision').empty();
    //     // let html = '<div class="publicBoardLabel text-center mt-2" style="font-size: xx-large;">Board Chart By Division</div>';
    //     html += '<p class="text-center font-italic">'+data.responseMessage+'</p>';
    //     $('#boardDivision').html(html);
    // }else if(data.category == 'boardByMember'){
    //     $('#boardChartMember').empty();
    //     // let html = '<div class="publicBoardLabel text-center mt-2" style="font-size: xx-large;">Board Chart By Member</div>';
    //     html += '<p class="text-center font-italic">'+data.responseMessage+'</p>';
    //     $('#boardChartMember').html(html);
    // }else if(data.category == 'boardTask'){
    //     $('#boardChartTask').empty();
    //     // let html = '<div class="publicBoardLabel text-center mt-2" style="font-size: xx-large;">Board Chart By Task</div>';
    //     html += '<p class="text-center font-italic">'+data.responseMessage+'</p>';
    //     $('#boardChartTask').html(html);
    // }else if(data.category == 'taskForMe'){
    //     $('#taskForMe').empty();
    //     // let html = '<div class="publicBoardLabel text-center mt-2" style="font-size: xx-large;">Task For Me</div>';
    //     html += '<p class="text-center font-italic">'+data.responseMessage+'</p>';
    //     $('#taskForMe').html(html);
    // }else if(data.category == 'taskForMeByStatus'){
    //     $('#taskForMeByStatus').empty();
    //     // let html = '<div class="publicBoardLabel text-center mt-2" style="font-size: xx-large;">Task For Me By Status</div>';
    //     html += '<p class="text-center font-italic">'+data.responseMessage+'</p>';
    //     $('#taskForMeByStatus').html(html);
    // }else if(data.category == 'taskByDivision'){
    //     $('#taskByDivision').empty();
    //     // let html = '<div class="publicBoardLabel text-center mt-2" style="font-size: xx-large;">Task By Division</div>';
    //     html += '<p class="text-center font-italic">'+data.responseMessage+'</p>';
    //     $('#taskForMeByStatus').html(html);
    // }else if(data.category == 'taskByStatus'){
    //     $('#taskByStatus').empty();
    //     // let html = '<div class="publicBoardLabel text-center mt-2" style="font-size: xx-large;">Task By Status</div>';
    //     html += '<p class="text-center font-italic">'+data.responseMessage+'</p>';
    //     $('#taskByStatus').html(html);
    // }else if(data.category == 'taskByPriority'){
    //     $('#taskByPriority').empty();
    //     // let html = '<div class="publicBoardLabel text-center mt-2" style="font-size: xx-large;">Task By Priority</div>';
    //     html += '<p class="text-center font-italic">'+data.responseMessage+'</p>';
    //     $('#taskByPriority').html(html);
    // }else if(data.category == 'taskByDeadLine'){
    //     $('#taskByDeadLine').empty();
    //     // let html = '<div class="publicBoardLabel text-center mt-2" style="font-size: xx-large;">Task By Deadline</div>';
    //     html += '<p class="text-center font-italic">'+data.responseMessage+'</p>';
    //     $('#taskByDeadLine').html(html);
    // }else if(data.category == 'taskByDivisionAndStatus'){
    //     $('#taskByDivisionAndStatus').empty();
    //     // let html = '<div class="publicBoardLabel text-center mt-2" style="font-size: xx-large;">Task By Division And Status</div>';
    //     html += '<p class="text-center font-italic">'+data.responseMessage+'</p>';
    //     $('#taskByDivisionAndStatus').html(html);                
    // }else{

    // }
}
$(document).on('click', '.delBoard', async function () {
    let boardId = $(this).data('id');
    let boardName = $(this).data('name');
    let param = {
        '_id': boardId
    };
    Swal.fire({
        title: 'Are you sure to delete\n' + boardName + '\nboard?',
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
            success: async function (result) {
                if (result.responseCode == '200') {
                    let param = {
                        type: 'success',
                        text: result.responseMessage
                    };
                    callNotif(param);
                    boardTeamMember = [];
                    try {
                        loadingActivated();
                        let boardList = await getBoard();
                        if(boardList == '200'){
                            console.log('ss',bodyEdit._id);
                            $('.boardList[data-id='+bodyEdit._id+']').click();
                        }
                    } catch (error) {
                        loadingDeactivated();
                    }

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
            success: async function (result) {
                if (result.responseCode == '200') {
                    let param = {
                        type: 'success',
                        text: result.responseMessage
                    };
                    callNotif(param);
                    try {
                        loadingActivated();
                        await getBoard();
                    } catch (error) {
                        loadingDeactivated();
                    }
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

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function hasDuplicates(values) {
    var valueArr = values.map(function (item) {
        return item.color
    });
    var isDuplicate = valueArr.some(function (item, idx) {
        return valueArr.indexOf(item) != idx
    });
    return isDuplicate;
}

async function distributeColor(id) {
    window['dataBoardMember' + id + ''].forEach(element => {
        element['color'] = getRandomColor()
    });
    // check duplicates
    let checkDupe = hasDuplicates(window['dataBoardMember' + id + ''])
    if (checkDupe) distributeColor(id);
}

$(document).on('click', '.boardList', async function () {
    loadingActivated();
    let boardName = capitalize($(this).data('name'));
    let camelized = camelize($(this).data('name'));
    let type = $(this).data('type');
    let name = $(this).data('name');
    let id = $(this).data('id');
    let boardCreated = $(this).data('create');
    let member = $(this).data('member');
    $('a[class*="boardList"]').removeClass('amber');
    $('a[class*="boardList"]').removeClass('lighten-1');
    $(this).addClass('amber');
    $(this).addClass('lighten-1');
    $('.boardContentData').empty();
    $('.boardContent').empty();
    $('.boardHeader').empty();
    // if ($('.removeSidebar').length > 0) $('.removeSidebar').remove();
    try {
        let groupTask = await getGroupTask(id);
        loadingDeactivated();
        $('#page-content-wrapper').addClass('warp-boundary');
        if (groupTask.responseCode == '200') {
            if (type == 'Private') distributeColor(id)
            // ANCHOR jgn lupa uncomment
            groupTask.data = await groupTaskChecking(groupTask.data, type);
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
                    $.getScript(localUrl + ":" + projectManagementLocalPort + "/public/assets/js/project_management/projectContent.js", function (data, textStatus, jqxhr) {})
                    $('.boardContentData').html(result);
                    let pass = {
                        boardName: boardName,
                        camelized: camelized,
                        name: name,
                        type: type,
                        id: id,
                        member: JSON.stringify(window['dataBoardMember' + id + '']),
                        created: boardCreated,
                        groupTask: window['groupTask' + id]
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
                    $('#chartSection').prev().removeClass('d-none');
                    $('#chartSection').remove();
                    $('.boardContentData').html(result);
                    let pass = {
                        boardName: boardName,
                        camelized: camelized,
                        name: name,
                        type: type,
                        id: id,
                        created: boardCreated,
                        member: JSON.stringify(window['dataBoardMember' + id + '']),
                        groupTask: []
                    };
                    domBoardTools(pass)

                    let appendEmptyImage = '<p><img width="300px" height="300px" class="text-center font-italic" width="300" height="300" src="public/assets/img/emptyProjects.png" style="opacity:0.7;"></p></img>';
                    $('.boardContentData').addClass('h-100');
                    $('#boardAccordion').addClass('d-flex justify-content-center align-items-center text-center');
                    $('#boardAccordion').css({
                        'height': 'inherit',
                        'padding-bottom': '35vh',
                        'opacity': '0.4'
                    });
                    $('#boardAccordion').append(appendEmptyImage);
                }
            })
        } else {
            let param = {
                type: 'error',
                text: groupTask.responseMessage
            };
            callNotif(param);
        }
    } catch (e) {
        loadingDeactivated();
    }
})

function domBoardTools(data) {
    console.log('data board', data);
    let addTeam = false;
    let html = '';
    let tools;
    if (data.groupTask != []) {
        // check apa yang bikin board adalah yang login atau grade nya minimal supervisor ke atas
        if ((data.created == ct.name || ct.grade < 5) && data.type != 'Main') {
            addTeam = true;
        }
    }
    if (addTeam) html = '<button class="text-white rounded-pill btn amber lighten-1" id="addTeam" data-division=' + data.division_id + ' data-grade=' + data.grade + ' data-usercreate="' + data.user_create + '" data-boardtype=' + data.type + ' data-boardname="' + data.boardName + '" data-id="' + data.id + '" data-concern="' + data.camelized + '" type="button">Add Team</button>';
    if (JSON.parse(data.member).length > 0) {
        if (!addTeam) {
            tools = '<div class="row p-3 ml-1 mr-1">' +
                '<div class="col-lg-6" style="align-self: center;">' +
                '<h2 class="boardPlaceHeader"><span class="name">' + data.boardName + '</span> Board</h2>' +
                '</div>' +
                '<div class="col-lg-6" style="text-align: end;">' +
                '<div class="row boardMemberTools"><div class="col-lg-6 align-self-center memberAvatar' + data.id + '">' +
                html +
                '</div><div class="col-lg-6"><button class="text-white rounded-pill btn amber lighten-1" id="addGroupTask" data-created=' + data.created + ' data-boardtype=' + data.type + ' data-member="' + data.member + '" data-boardname="' + data.boardName + '" data-id="' + data.id + '" data-concern="' + data.camelized + '" type="button">Add Group of Task</button>' +
                '</div></div></div>' +
                '</div>';
        } else {
            html = '<button class="text-white btn-md rounded-pill btn amber lighten-1" id="addTeam" data-division=' + data.division_id + ' data-grade=' + data.grade + ' data-usercreate="' + data.user_create + '" data-boardtype=' + data.type + ' data-boardname="' + data.boardName + '" data-id="' + data.id + '" data-concern="' + data.camelized + '" type="button">Add Team</button>';
            tools = '<div class="row p-3 ml-1 mr-1">' +
                '<div class="col-lg-5" style="align-self: center;">' +
                '<h2 class="boardPlaceHeader"><span class="name">' + data.boardName + '</span> Board</h2>' +
                '</div>' +
                '<div class="col-lg-7" style="text-align: end;">' +
                '<div class="row boardMemberTools"><div class="col-lg-6 align-self-center memberAvatar' + data.id + '">' +
                '</div><div class="col-lg-6">' + html + '<button class="text-white btn-md rounded-pill btn amber lighten-1" id="addGroupTask" data-created=' + data.created + ' data-boardtype=' + data.type + ' data-member="' + data.member + '" data-boardname="' + data.boardName + '" data-id="' + data.id + '" data-concern="' + data.camelized + '" type="button">Add Group of Task</button>' +
                '</div></div></div>' +
                '</div>';
        }

    } else {
        tools = '<div class="row p-3 ml-1 mr-1">' +
            '<div class="col-lg-6" style="align-self: center;">' +
            '<h2 class="boardPlaceHeader"><span class="name">' + data.boardName + '</span> Board</h2>' +
            '</div>' +
            '<div class="col-lg-6" style="text-align: end;">' +
            html +
            '<button class="text-white rounded-pill btn amber lighten-1" id="addGroupTask" data-created=' + data.created + ' data-boardtype=' + data.type + ' data-member="' + data.member + '" data-boardname="' + data.boardName + '" data-id="' + data.id + '" data-concern="' + data.camelized + '" type="button">Add Group of Task</button>' +
            '</div>' +
            '</div>';
    }

    $('.boardHeader').append(tools);
    if ($('.removeSidebar').length == 0) $('.boardPlaceHeader').prepend('<span class="removeSidebar mr-2"><i data-feather="arrow-left"></i></span>');
}

$(document).on('click', '#addTeam', function () {
    let boardId = $(this).data('id');
    let boardName = $(this).data('boardname');
    let boardType = $(this).data('boardtype');
    Swal.fire({
        title: 'Please select member list',
        html: '<div class="row rowEmp"><div class="col-lg-9"><select id="memberGroup" multiple class="swal2-input" style="height:auto;"></select></div><div class="col-lg-3" style="align-self:center;"><button type="button" class="btn btn-primary addTeamMember">Add</button></div></div><div class="accordionPlace"></div>',
        onOpen: async () => {
            Swal.showLoading();
            let employee;
            let empDone = false;
            try {
                employee = await getEmployee();
                if (employee != 500) {
                    $('#emptyMember').remove();
                    $('#memberGroup').empty()
                    empDone = !empDone;
                    employee.forEach(element => {
                        if (parseInt(element.division_id) == ct.division_id && parseInt(element.grade) >= parseInt(ct.grade))
                            $('#memberGroup').append('<option value=' + element.employee_id + '>' + element.employee_name + '</option>')
                    });
                    window['dataBoardMember' + boardId + ''].forEach(element => {
                        $('option[value=' + element.account_id + ']').remove();
                    });
                }
                if (empDone) {
                    $('#employeeId').prop('disabled', false);
                }
                Swal.hideLoading()
            } catch (error) {
                toastrNotifFull('failed to get data', 'error');
                Swal.hideLoading();
            }
        },
        showCancelButton: true,
        confirmButtonText: 'Submit',
        showLoaderOnConfirm: true,
        preConfirm: async () => {
            if (boardTeamMember.length == 0) {
                toastrNotifFull('please add team member', 'error');
                return false;
            } else {
                let oldMember = window['dataBoardMember' + boardId + ''];
                oldMember.forEach(element => {
                    delete element.departmen_id;
                    delete element.departmen_name;
                    delete element.color;
                });
                let allMember = boardTeamMember.concat(oldMember);
                let param = {
                    '_id': boardId,
                    'name': boardName,
                    'type': capitalize(boardType),
                    'member': JSON.stringify(allMember)
                };
                await editBoard(param);
            }
        },
        allowOutsideClick: () => !Swal.isLoading()
    }).then(function(result){
        if(result.value){
            
        }else if(result.dismiss == 'cancel'){
            boardTeamMember = [];
        }

    });
})

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
            return await postBoard(bodyBoard).then(async function (result) {
                let param;
                if (result.responseCode == '200') {
                    param = {
                        type: 'success',
                        text: result.responseMessage
                    };
                    try {
                        loadingActivated();
                        await getBoard();
                    } catch (error) {
                        loadingDeactivated();
                    }
                } else if (result.responseCode == '401') {
                    logoutNotif();
                } else {
                    param = {
                        type: 'error',
                        text: result.responseMessage
                    };
                }
                return toastrNotifFull(result.responseMessage);
            });
        },
        allowOutsideClick: () => !Swal.isLoading()
    })
}
let boardTeamMember = [];
$(document).on('click', '.addTeamMember', function () {
    let boardMemberId = $('#memberGroup option:selected').toArray().map(item => item.value);
    let boardMemberName = $('#memberGroup option:selected').toArray().map(item => item.text);

    boardMemberId.forEach(function (e, index) {
        boardTeamMember.push({
            'account_id': e,
            'account_name': boardMemberName[index]
        });
        $('option[value=' + e + ']').remove();
    })
    addTemAccordion(boardTeamMember);
})

function addTemAccordion(boardTeamMember) {
    $('.accordionPlace').empty();
    boardTeamMember.forEach(element => {
        let splitCamelAccName = camelize(element.account_name);
        if ($('.beefup__head').length == 0) {
            let htmlAccordion = '<article class="beefup">' +
                '<h2 class="beefup__head" data-toggle="collapse" data-target="#' + splitCamelAccName + '" aria-expanded="true" aria-controls="' + splitCamelAccName + '" id=' + element.account_id + '>Member List</h2>' +
                '<div id="' + splitCamelAccName + '" class="collapse beefup__body">' +
                '<div id="forMemberList"><div class="row rowData" data-name="' + element.account_name + '"><div class="col-lg-9">' + element.account_name + '</div><div class="col-lg-3"><i class="fa fa-times text-danger close removeDataTeam" data-for="' + splitCamelAccName + '" data-id=' + element.account_id + ' data-name="' + element.account_name + '" style="float:none; cursor:pointer;"></i></div></div></div>' +
                '</div></article>';
            $('.accordionPlace').append(htmlAccordion);
        } else {
            $('#forMemberList').append('<div class="row rowData" data-name="' + element.account_name + '" ><div class="col-lg-9">' + element.account_name + '</div><div class="col-lg-3"><i class="fa fa-times text-danger close removeDataTeam" data-for="' + splitCamelAccName + '" data-id=' + element.account_id + ' data-name="' + element.account_name + '" style="float:none; cursor:pointer;"></i></div></div></div>');
        }
    });
}

$(document).on('click', '.addMember', function () {
    let boardMemberId = $('#employeeId option:selected').toArray().map(item => item.value);
    let boardDivisionName = $('select#divisionId option:selected').text();
    let boardDivision = $('select#divisionId').val();
    let boardMemberName = $('#employeeId option:selected').toArray().map(item => item.text);
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

$(document).on('click', '.removeDataTeam', function () {
    let dataNama = $(this).data("name");
    let empId = $(this).data('id')
    $('.rowData[data-name="' + dataNama + '"]').remove();
    boardTeamMember = boardTeamMember.filter(function (e) {
        return e.account_name != dataNama && e.account_id != empId
    })

    if ($('#forMemberList').children().length == 0) {
        $('.beefup').remove();
    }

    $('#memberGroup').append('<option value=' + empId + '>' + dataNama + '</option>');
})

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
        $('.rowEmp').remove();
        $('#divisionId').remove();
    } else {
        $('#employeeId').removeClass('d-none');
        $('#divisionId').removeClass('d-none');

        if ($('#divisionId').length == 0 && $('#employeeId').length == 0) {
            Swal.showLoading();
            let empHtml = '<div class="row rowEmp"><div class="col-lg-9"><select id="employeeId" multiple class="swal2-input d-none" style="height:auto;"><option id="emptyMember">Please select board member</option></select></div><div class="col-lg-3" style="align-self:center;"><button type="button" class="btn btn-primary addMember">Add</button></div></div>';
            let divHtml = '<select id="divisionId" class="swal2-input d-none"><option id="emptyDivision">Please select board division</option></select>';
            $('.swal2-content').append(divHtml);
            $('.swal2-content').append(empHtml);
            $('.swal2-content').append('<div class="accordionPlace"></div>');
            $('#employeeId').prop('disabled', true);
            $('#divisionId').prop('disabled', true);
            let divisi;
            let employee;

            try {
                divisi = await getDivision();
                employee = await getEmployee();

                let divisiDone = false;
                let empDone = false;
                if (divisi != 500) {
                    $('#emptyDivision').remove();
                    $('#divisionId').empty()
                    divisiDone = !divisiDone
                    let newDivisi = await boardDivisionChecking(divisi);
                    $('#divisionId').append("<option value=''>Choose...</option>");
                    newDivisi.forEach(element => {
                        let html = '<option value=' + element.id + '>' + element.name + '</option>';
                        $('#divisionId').append(html);
                    });
                }

                if (employee != 500) {
                    $('#emptyMember').remove();
                    $('#employeeId').empty()
                    empDone = !empDone;
                    $('#employeeId').attr('data-concern', 'Finance');
                }
                if (divisiDone && empDone) {
                    $('#divisionId').prop('disabled', false);
                    $('#employeeId').prop('disabled', false);
                }
                Swal.hideLoading()
            } catch (error) {
                toastrNotifFull('failed to get data', 'error');
                Swal.hideLoading();
            }

        }
    }
})

$(document).on('change', '#divisionId', async function () {
    let currentVal = $(this).val();
    if (currentVal == '') {
        $('#employeeId').empty();
    } else {
        $('#employeeId').empty();
        let currentDivision = $('select#divisionId option:selected').text()
        $('#employeeId').attr('data-concern', currentDivision);
        let employeeDivision = await boardEmployeeChecking(window['employeeData']);

        if (ct.division_id == currentVal) {
            employeeDivision.forEach(element => {
                let html = '<option value=' + element.employee_id + '>' + element.employee_name + '</option>';
                $('#employeeId').append(html);
            });
        }

        let dataBoard = boardMemberJoin.filter(function (e) {
            return e.departmen_id == currentVal;
        })
        dataBoard.forEach(element => {
            $('option[value=' + element.account_id + ']').remove();
        });
    }
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
        let b = await getData(param);
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

$(document).on('click', '.goTrello', async function () {
    loadingActivated();
    let authRes = await goAuth();
    if (authRes.responseCode == '200') {
        sessionStorage.setItem('meId', JSON.parse(authRes.data).id);
        // $.getScript('http://'+localUrl + ":" + projectManagementLocalPort + "/public/assets/js/project_management/trelloCall.js", function (data, textStatus, jqxhr) {})
        $.getScript(localUrl + ":" + projectManagementLocalPort + "/public/assets/js/project_management/trello.js", function (data, textStatus, jqxhr) {})
    } else if (authRes.responseCode == '476') {
        activeModalConfirmToken()
        window.open(authRes.data, "_blank", "width=750,height=750,top=400,left=900");
    } else {
        let param = {
            type: 'error',
            text: authRes.responseMessage
        };
        callNotif(param)
    }
})

$(document).on('click', '.btnConfirm', async function () {
    let tokenData = $('.tokenPlace').val();
    let confirmRes = await confirmAuthToken(tokenData);
    if (confirmRes.responseCode == '200') {
        let param = {
            type: 'success',
            text: confirmRes.responseMessage
        };
        callNotif(param);
        $('#modalConfirmToken').modal('toggle');
    } else {
        let param = {
            type: 'error',
            text: confirmRes.responseMessage
        };
        callNotif(param);
    }
})

function activeModalConfirmToken() {
    $('#modalConfirmToken').modal({
        show: true,
        backdrop: 'static',
        keyboard: false
    });
}

async function goAuth() {
    return new Promise(async function (resolve, reject) {
        $.ajax({
            url: goAuth.name,
            method: 'GET',
            headers: {
                // "Content-Type": "application/json",
                "Accept": "*/*",
                "Cache-Control": "no-cache",
                "secretKey": ct.secretKey,
                "token": ct.token,
                "signature": ct.signature
            },
            success: async function (result) {
                loadingDeactivated()
                resolve(result);
            }
        })
    });
}

async function confirmAuthToken(tokenAuth) {
    loadingActivated();
    return new Promise(async function (resolve, reject) {
        $.ajax({
            url: confirmAuthToken.name,
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Cache-Control": "no-cache",
                "secretKey": ct.secretKey,
                "token": ct.token,
                "signature": ct.signature
            },
            data: JSON.stringify({
                'token': tokenAuth
            }),
            success: async function (result) {
                loadingDeactivated()
                resolve(result);
            }
        })
    });
}

$(document).on('click', '#addGroupTask', function () {
    let thisId = $(this).data('id');
    let boardName = $(this).data('boardname');
    let camelized = $(this).data('concern');
    let boardType = $(this).data('boardtype');
    let boardCreated = $(this).data('created');
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
                            employee = await boardEmployeeMainChecking(employee);
                            $('#picGroup').empty();
                            employee.forEach(element => {
                                let html = '<option value=' + element.employee_id + '>' + element.employee_name + '</option>';
                                $('#picGroup').append(html);
                            });
                            $('#picGroup').select2({
                                theme: "bootstrap",
                                width: '100%'
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
                    $('#picGroup').select2({
                        theme: "bootstrap",
                        width: '100%'
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
                "user_create": ct.name,
                'url': localUrl + ':' + projectManagementLocalPort + '/employee?boardId=' + thisId
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
                        gt.data = await groupTaskChecking(gt.data, boardType);
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
                                $.getScript(localUrl + ":" + projectManagementLocalPort + "/public/assets/js/project_management/projectContent.js", function (data, textStatus, jqxhr) {})
                                $('.boardContentData').html(result);
                                let pass = {
                                    boardName: boardName,
                                    camelized: camelized,
                                    name: boardName,
                                    id: thisId,
                                    type: boardType,
                                    member: boardMember,
                                    created: boardCreated,
                                    groupTask: window['groupTask' + thisId]
                                };
                                console.log('the pass', pass);
                                domBoardTools(pass)
                            }
                        })
                    } else if (result.responseCode == '401') {
                        logoutNotif();
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

    let chartUsed;
    if (ct.grade == '4' || ct.grade == '5') {
        chartUsed = 'chartBoardTypeForMe';
    } else {
        chartUsed = 'chartBoardType';
    }

    var ctxB = document.getElementById(chartUsed)
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
    var barName = chartName.charAt(0).toUpperCase() + chartName.slice(1);
    var barId = 'chart' + barName
    console.log('barId =>', barId)

    // $('#'+divId).empty();
    var chartType = 'pie';
    if (chartName.toUpperCase() === 'BOARDMEMBER' || chartName.toUpperCase() === 'BOARDTASK') {
        chartType = 'bar';
    }
    // if (chartName === 'boardType') {
    //     $('#lbl'+barName).html('Board Chart By Type');
    // } else if (chartName === 'boardTypeForMe') {
    //     $('#lbl'+barName).html('Board Chart For Me By Type');
    // } else if (chartName === 'boardDivision') {
    //     $('#lbl'+barName).html('Board Chart By Division');
    // } else if (chartName === 'boardByMember') {
    //     $('#lbl'+barName).html('Board Chart By Member');
    // } else if (chartName === 'boardTask') {
    //     $('#lbl'+barName).html('Board Chart By Task');
    // } else if (chartName === 'taskForMe') {
    //     // barId = 'chartTaskForMe';
    //     // labelName = 'Chart Task For Me';
    //     $('#lbl'+barName).html('Chart Task For Me');
    // } else if (chartName === 'taskForMeByStatus') {
    //     // barId = 'chartTaskForMeByStatus';
    //     // labelName = 'Chart Task For Me By Status';
    //     $('#lbl'+barName).html('Chart Task For Me By Status');
    // } else if (chartName === 'taskByDivision') {
    //     // barId = 'chartTaskByDivision';
    //     // labelName = 'Chart Task By Division';
    //     $('#lbl'+barName).html('Chart Task By Division');
    // } else if (chartName === 'taskByStatus') {
    //     // barId = 'chartTaskByStatus';
    //     // labelName = 'Chart Task By Status';
    //     $('#lbl'+barName).html('Chart Task By Status');
    // } else if (chartName === 'taskByPriority') {
    //     // barId = 'chartTaskByPriority';
    //     // labelName = 'Chart Task By Priority';
    //     $('#lbl'+barName).html('Chart Task By Priority');

    // } else if (chartName === 'taskByDeadLine') {
    //     // barId = 'chartTaskByDeadLine';
    //     // labelName = 'Chart Task By Deadline';
    //     $('#lbl'+barName).html('Chart Task By Deadline');

    // }
    let labelused;
    let chartUsed;
    if (ct.grade == '4' || ct.grade == '5') {
        labelused = 'lblBoardTypeForMe';
        chartUsed = 'chartBoardTypeForMe';
    } else {
        labelused = 'lblBoardType';
        chartUsed = 'chartBoardType';
    }

    if (chartName.toUpperCase() === 'BOARDTYPE') {
        $('#' + labelused).html('Board Chart By Type');
    } else if (chartName.toUpperCase() === 'BOARDTYPEFORME') {
        $('#' + labelused).html('Board Chart For Me By Type');
    } else if (chartName.toUpperCase() === 'BOARDDIVISION') {
        $('#' + labelused).html('Board Chart By Division');
    } else if (chartName.toUpperCase() === 'BOAARDBYMEMBER') {
        $('#' + labelused).html('Board Chart By Member');
    } else if (chartName.toUpperCase() === 'BOARDTASK') {
        $('#' + labelused).html('Board Chart By Task');
    } else if (chartName.toUpperCase() === 'TASKFORME') {
        // barId = 'chartTaskForMe';
        // labelName = 'Chart Task For Me';
        $('#' + labelused).html('Chart Task For Me');
    } else if (chartName.toUpperCase() === 'TASKFORMEBYSTATUS') {
        // barId = 'chartTaskForMeByStatus';
        // labelName = 'Chart Task For Me By Status';
        $('#' + labelused).html('Chart Task For Me By Status');
    } else if (chartName.toUpperCase() === 'TASKBYDIVISION') {
        // barId = 'chartTaskByDivision';
        // labelName = 'Chart Task By Division';
        $('#' + labelused).html('Chart Task By Division');
    } else if (chartName.toUpperCase() === 'TASKBYSTATUS') {
        // barId = 'chartTaskByStatus';
        // labelName = 'Chart Task By Status';
        $('#' + labelused).html('Chart Task By Status');
    } else if (chartName.toUpperCase() === 'TASKBYPRIORITY') {
        // barId = 'chartTaskByPriority';
        // labelName = 'Chart Task By Priority';
        $('#' + labelused).html('Chart Task By Priority');

    } else if (chartName.toUpperCase() === 'TASKBYDEADLINE') {
        // barId = 'chartTaskByDeadLine';
        // labelName = 'Chart Task By Deadline';
        $('#' + labelused).html('Chart Task By Deadline');
    }

    if (data !== undefined) {
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

        try {
            var ctxB = document.getElementById(chartUsed).getContext('2d');
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
        } catch (error) {

        }


    } else {

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

function extend(target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function (source) {
        for (var prop in source) {
            target[prop] = source[prop];
        }
    });
    return target;
}