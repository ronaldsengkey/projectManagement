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
    window['favList'] = [];
    let parsed;
    if (localStorage.getItem('favList')) {
        parsed = JSON.parse(localStorage.getItem('favList'));
        parsed.forEach(element => {
            if(element.domain == window.location.hostname) window['favList'].push(element);
        });
    }

    let getUrl = window.location.search;
    let boardAidi = new URLSearchParams(getUrl).get('boardId');
    if (boardAidi != undefined && boardAidi != '') {
        if (localStorage.getItem('accountProfile') != undefined) {
            let boardDataStatus = await getBoard();
            if (boardDataStatus == '401') {
                logoutNotif(function () {
                    window.location.href = '/proman/login' + window.location.search
                })

            } else {
                await chartBoardChecking();
                // appendFilter();
                // appendFilter([filterTimeRanges]);
                if (parseInt(ct.grade) <= 5) appendFilter([filterAllChartPersonal, filterChartTypePersonal]);
                else appendFilter([filterAllChartPersonal, filterChartTypePersonal]);

                $('.filterChartName').html('Board Type');
                $('.filterTimeName').html('Last 7 Days');

                await checkPinnedTask(window['favList']);

                //check for redirect email
                await checkGroupTaskRedirect(boardDataStatus);
            }

        } else
            window.location.href = '/proman/login' + window.location.search
    } else {
        let boardDataStatus = await getBoard();
        if (boardDataStatus == '401') {
            logoutNotif()
        } else {
            // await chartBoardChecking();
            // appendFilter();
            // appendFilter([filterTimeRanges]);
            // if (ct.grade == '4' || ct.grade == '5') appendFilter([filterTimeRanges, filterChart]);
            // else appendFilter([filterTimeRanges, filterChartUp]);

            // $('.analyticList[data-for="personal"]').addClass('amber lighten-1')

            await checkPinnedTask(window['favList']);

            $('.analyticList[data-for="personal"]').click();

            $('.filterChartName').html('Board Type');
            $('.filterTimeName').html('Last 7 Days');
        }

    }

})

async function checkPinnedTask(favList) {
    favList = favList.filter(function (e) {
        return e.data != undefined || e.data != null
    })
    if (favList.length > 0) {
        let pinTag = '<div class="pinnedLabel mt-2 px-2 mb-4" style="font-size: x-large;cursor:pointer;padding:.75rem 1.25rem">Pinned<span class="float-right pinLength">' + favList.length + '<i class="fas fa-chevron-right ml-2"></i></span></div>';
        $(pinTag).insertAfter($('.sidebar-heading'));
    }
}

$(document).on('click', '.pinnedLabel', async function () {
    if ($('.boardHeader').length == 0) {
        let headeerBoard = '<div class="boardHeader" style="border-bottom:1px solid #dee2e6;"></div>';
        $(headeerBoard).insertBefore($('.boardContentData'))
    }
    $('a[class*="boardList"]').removeClass('amber');
    $('a[class*="boardList"]').removeClass('lighten-1');
    $('a[class*="analyticList"]').removeClass('amber');
    $('a[class*="analyticList"]').removeClass('lighten-1');
    $(this).addClass('amber');
    $(this).addClass('lighten-1');
    $('.boardContentData').empty();
    $('.boardHeader').empty();
    $('#page-content-wrapper').addClass('warp-boundary');
    $.ajax({
        url: 'projectBoard',
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            "Accept": "*/*",
            "Cache-Control": "no-cache",
        },
        success: async function (result) {
            $.getScript(window.location.origin + "/proman/public/assets/js/project_management/projectContent.js", async function (data, textStatus, jqxhr) {
                $('#chartSection').prev().removeClass('d-none');
                $('#chartSection').addClass('d-none');
                await domBoardPinned(window['favList'].filter(function (e) {
                    return e.data != undefined || e.data != null
                }))
            })
            let publicCount = 0;
            let privateCount = 0;
            window['favList'].forEach(element => {
                let board = JSON.parse(window.atob(element.data)).boardType
                if(board == 'Private'){
                    privateCount += 1;
                } else {
                    publicCount += 1;
                }
            });
            $('.boardContentData').html(result);
            let tools = '<div class="row p-3 ml-1 mr-1">' +
                '<div class="col-lg-8" style="align-self: center;">' +
                '<h2 class="boardPlaceHeader"><span class="name">Pinned Group Task</span></h2>' +
                '</div>' +
                '<div class="col-lg-4" style="text-align:end;">' +
                '<h2><span class="stat">'+publicCount+' Public Board, '+privateCount+' Private Board</span></h2>' +
                '</div>' +
                '</div>';
            $('.boardHeader').append(tools);
            if ($('.removeSidebar').length == 0) $('.boardPlaceHeader').prepend('<span class="removeSidebar mr-2"><i class="fas fa-arrow-left"></i></span>');
        }
    })

})

async function domBoardPinned(data) {
    distributeColor(1,true)
    let picColorPool = window['picColor'];
    picColorPool.forEach(element => {
        window['picColor'+element.id] = getRandomColor();
        let colorCheck = lightOrDark(window['picColor'+element.id]);
        if (colorCheck == 'light') window['picColorClass' + element.id] = 'text-dark fontWeight400';
        else window['picColorClass' + element.id] = 'text-white';
    });
    data.forEach(element => {
        let dataCredent = JSON.parse(window.atob(element.data))
        try {
            if (dataCredent.boardType == 'Private') {
                let memberCredent = element.memberColor;
                memberCredent.forEach(element2 => {
                    window['color' + element2.account_id] = element2.colorData;
                    window['colorName' + element2.account_name] = element2.colorData;
                    let colorCheck = lightOrDark(element2.colorData);
                    if (colorCheck == 'light') window['colorClass' + element2.account_id] = 'text-dark fontWeight400';
                    else window['colorClass' + element2.account_id] = 'text-white';
                });
            } else {
                window['color' + JSON.parse(dataCredent.pic)[0].account_id] = getRandomColor();
                window['colorClass' + JSON.parse(dataCredent.pic)[0].account_id] = '';
                let colorCheck = lightOrDark(window['color' + JSON.parse(dataCredent.pic)[0].account_id]);
                if (colorCheck == 'light') window['colorClass' + JSON.parse(dataCredent.pic)[0].account_id] = 'text-dark fontWeight400';
                else window['colorClass' + JSON.parse(dataCredent.pic)[0].account_id] = 'text-white';

            }
        } catch (e) {
            console.log('catch color define',e);
        }

        let doneGT;
        if(element.user_create == ct.name ||  JSON.parse(dataCredent.pic)[0].account_id == ct.id_employee ) doneGT = true;
        else doneGT = false;

        let colorDone;

        if(dataCredent.status == false) colorDone = 'black'
        else colorDone = 'green'

        let camelizeBoard = camelize(element.name);
        let boardNaming = dataCredent.boardType == 'Main' ? 'Public' : dataCredent.boardType;
        let htmlAccordion = '<div class="card mt-3 mb-3" id="cardGT' + element.id + '"  data-boardAidi=' + dataCredent.board_id + ' data-boardtype=' + dataCredent.boardType + '  data-parent="parent' + element.id + '">' +
            '<div class="card-header" id="' + camelizeBoard + '">' +
            '<div class="row"><div class="col-lg-8">' +
            '<h2 class="mb-0">' +
            '<button class="btn btn-link btn-block text-left toCollapse headerGT" data-id=' + element.id + ' type="button" data-toggle="collapse" data-target="#kolap' + element.id + '" aria-expanded="true" aria-controls="kolap' + element.id + '">' +
            '<span class="picLogo" style="background:' + window['picColor' + JSON.parse(dataCredent.pic)[0].account_id] + '" data-toggle="tooltip" data-placement="bottom" title="' + JSON.parse(dataCredent.pic)[0].account_name + '"><span class="' + window['picColorClass' + JSON.parse(dataCredent.pic)[0].account_id] + '">' + getInitials(JSON.parse(dataCredent.pic)[0].account_name) + '</span></span>' + element.name + ' (' + boardNaming +')' +
            '</button>' +
            '</h2>' +
            '</div>' +
            '<div class="col-lg-2 text-right" style="align-self:center;">' + createdByIcon(dataCredent.user_create, dataCredent.board_id, dataCredent.boardType,true) + '</div>' +
            '<div class="col-lg-2 text-center placeTools" data-id='+element.id+' style="align-self:center;"><a tabindex="0" class="btnMenu" data-owner="' + dataCredent.user_create + '" data-pic=' + JSON.parse(dataCredent.pic)[0].account_id + ' data-boardid=' + dataCredent.board_id + ' data-name="' + element.name + '" data-id=' + element.id + ' data-camelized="' + camelizeBoard + '"><i class="fas fa-bars fa-lg menu" data-board="' + dataCredent.board_id + '"></i></a><a tabindex="0" class="btnFavorites ml-4" data-all="' + window.btoa(JSON.stringify(dataCredent)) + '" data-from="pinned" data-toggle="tooltip" data-placement="right" data-name="' + element.name + '" data-id=' + element.id + '><i class="fas fa-thumbtack fa-lg favGT" data-id=' + element.id + '></i></a></div></div>' +

            '<div id="kolap' + element.id + '" class="collapse" data-id="' + element.id + '" aria-labelledby="' + camelizeBoard + '">' +
            '<div class="card-body p-4" data-id="' + element.id + '">' +
            'Loading...' +
            '</div>'
        '</div>'
        '</div>';
        $('.accordionBoard').append(htmlAccordion);


        try {
            JSON.parse(localStorage.getItem('favList')).forEach(elements => {
                if (elements.id == element.id) {
                    $('.favGT[data-id=' + element.id + ']').css('color', 'orange');
                }
            });
            if ($('.favGT[data-id=' + element.id + ']').css('color') == 'rgb(255, 165, 0)' || $('.favGT[data-id=' + element.id + ']').css('color') == 'orange') {
                $('.btnFavorites[data-id=' + element.id + ']').attr('title', 'Unpin ' + element.name)
            } else {
                $('.btnFavorites[data-id=' + element.id + ']').attr('title', 'Pin ' + element.name)
            }
            
            if(doneGT){
                $('.placeTools[data-id='+element.id+']').prepend('<a tabindex="0" data-boardid=' + dataCredent.board_id + ' class="btnDoneGT mr-4" data-status='+dataCredent.status+' data-toggle="tooltip" data-placement="right" data-name="' + element.name + '" data-id=' + element.id + '><i class="fas fa-check fa-lg doneGT" style="color:'+colorDone+'"" data-id='+element.id+'></i></a>')
                if(!dataCredent.status) $('.btnDoneGT[data-id='+element.id+']').attr('title','Done ' + element.name)
                else $('.btnDoneGT[data-id='+element.id+']').attr('title','Undone ' + element.name)
            }
        } catch (error) {

        }



        $('.collapse[data-id="' + element.id + '"]').on('show.bs.collapse', async function () {
            let idBoard = $(this).data('id');
            $('.card-body[data-id="' + idBoard + '"]').empty();
            $('.card-body[data-id="' + idBoard + '"]').html('Loading...');
            await getTaskData(idBoard, dataCredent, JSON.stringify(data));
        });
    });
}

function checkGroupTaskRedirect(boardDataStatus, boardId = '', groupTaskId = '', taskIdUrl = '', commentIdUrl = '') {
    return new Promise(async function (resolve, reject) {
        let getUrl = window.location.search;
        let boardAidi = boardId == '' ? new URLSearchParams(getUrl).get('boardId') : boardId;
        let groupTaskAidi = groupTaskId == '' ? new URLSearchParams(getUrl).get('groupTaskId') : groupTaskId;
        let taskId = taskIdUrl == '' ? new URLSearchParams(getUrl).get('taskId') : taskIdUrl;
        let commentId = commentIdUrl == '' ? new URLSearchParams(getUrl).get('commentId') : commentIdUrl;
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
                                history.pushState({}, null, '/proman/employee');
                            },
                            function () {

                            }
                        );
                        resolve(clearInterval(intervCardBorder));


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
                            resolve(clearInterval(intervTask));
                        }
                    }, 1500);
                }

                if (commentId != undefined && commentId != '') {
                    let intervComment = setInterval(() => {
                        if ($('.commentTask[data-id=' + taskId + ']').length > 0) {
                            $('.commentTask[data-id=' + taskId + ']').click();
                            resolve(clearInterval(intervComment));
                        }
                    }, 1500);
                }
            }

        }
    })
}

$(document).on('click', '.removeSidebar', function () {
    if ($('#sidebar-wrapper').hasClass('w767')) {
        $('#sidebar-wrapper').removeClass('w767');
        $('#sidebar-wrapper').addClass('w768');
        $('.removeSidebar').remove();
        $('.boardPlaceHeader').prepend('<span class="removeSidebar mr-2"><i class="fas fa-arrow-left"></i></span>');
    } else if ($('#sidebar-wrapper').hasClass('w768')) {
        $('#sidebar-wrapper').removeClass('w768');
        $('#sidebar-wrapper').addClass('w767');
        $('.removeSidebar').remove();
        $('.boardPlaceHeader').prepend('<span class="removeSidebar"><i class="fas fa-arrow-right"></i>&nbsp;</span>');
    }
})

async function getBoard(param = {}, cases = '') {
    return new Promise(async function(resolve,reject){
        let result = await ajaxCall({url:'board',method:'GET',credentialHeader:true,extraHeaders:{"param":JSON.stringify(param)},decrypt:true})
        if (cases == 'boardId') {
            if (result.responseCode == '200') {
                resolve(result.data);
            } else if (result.responseCode == '404') {
                resolve(toastrNotifFull(result.responseMessage, 'error'));
                loadingDeactivated();
            } else if (result.responseCode != '401') {
                let param = {
                    type: 'error',
                    text: result.responseMessage
                };
                resolve(callNotif(param));
                loadingDeactivated();
            } else {
                logoutNotif();
                loadingDeactivated();
            }
        } else {
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
}

async function getChartAnalytic(param = {}) {
    return new Promise(async function (resolve) {
        let headers = {
            "Content-Type": "application/json",
            "Accept": "*/*",
            "Cache-Control": "no-cache",
            "secretKey": ct.secretKey,
            "param": JSON.stringify(param),
            "token": ct.token,
            "signature": ct.signature
        };
        // console.log('rParam =>',rParam)
        let result = await ajaxCall({url:'getChartAnalytic',method:'GET',headers:headers,decrypt:true})
        loadingDeactivated()
        resolve(result);
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
    return new Promise(async function (resolve) {
        let result = await ajaxCall({url:'summaryBoard',headers:{
            "Content-Type": "application/json",
            "Accept": "*/*",
            "Cache-Control": "no-cache",
            "param": JSON.stringify(rParam),
            "category": category,
            "secretKey": ct.secretKey,
            "token": ct.token,
            "signature": ct.signature
        },method:'GET',decrypt:true})

        console.log('category =>', category, ' =>', result);
        if (category == 'boardTypeForMe' || category == 'myTaskStatus' || category == 'boardDivision' || category == 'boardMember' || category == 'boardTask' || category == 'taskByDivision' || category == 'taskByStatus' || category == 'taskByPriority' || category == 'taskByDivisionAndStatus' || category == 'taskByDeadLine') {
            resolve(result);
        } else {
            if (parseInt(ct.grade) <= 5) {
                result.category = 'boardTypeForMe';
                result.names = category;
            } else {
                result.category = 'boardType';
                result.names = category;
            }
            if (category == 'taskForMe') {
                result.category = category;
            }
            // // result.category = category;
            if (result.responseCode == '200') {
                resolve(manageSummaryBoardData(result));
            } else if (result.responseCode == '404' && category == 'taskForMe') {
                loadingDeactivated()
                resolve(manageSummaryBoardData([], 'chartTaskForMe', true))
                // callNotif({
                //     type: 'error',
                //     text: result.responseMessage
                // })
            } else {
                loadingDeactivated();
                callNotif({
                    type: 'error',
                    text: result.responseMessage
                })
            }
        }

        // $.ajax({
        //     url: 'summaryBoard',
        //     method: 'GET',
        //     headers: {
        //         "Content-Type": "application/json",
        //         "Accept": "*/*",
        //         "Cache-Control": "no-cache",
        //         "param": JSON.stringify(rParam),
        //         "category": category,
        //         "secretKey": ct.secretKey,
        //         "token": ct.token,
        //         "signature": ct.signature
        //     },
        //     success: function (result) {
        //         // loadingDeactivated();
        //         console.log('category =>', category, ' =>', result);
        //         if (category == 'boardTypeForMe' || category == 'myTaskStatus' || category == 'boardDivision' || category == 'boardMember' || category == 'boardTask' || category == 'taskByDivision' || category == 'taskByStatus' || category == 'taskByPriority' || category == 'taskByDivisionAndStatus' || category == 'taskByDeadLine') {
        //             resolve(result);
        //         } else {
        //             if (parseInt(ct.grade) <= 5) {
        //                 result.category = 'boardTypeForMe';
        //                 result.names = category;
        //             } else {
        //                 result.category = 'boardType';
        //                 result.names = category;
        //             }
        //             if (category == 'taskForMe') {
        //                 result.category = category;
        //             }
        //             // // result.category = category;
        //             if (result.responseCode == '200') {
        //                 resolve(manageSummaryBoardData(result));
        //             } else if (result.responseCode == '404' && category == 'taskForMe') {
        //                 loadingDeactivated()
        //                 resolve(manageSummaryBoardData([], 'chartTaskForMe', true))
        //                 callNotif({
        //                     type: 'error',
        //                     text: result.responseMessage
        //                 })
        //             } else {
        //                 loadingDeactivated();
        //                 callNotif({
        //                     type: 'error',
        //                     text: result.responseMessage
        //                 })
        //             }
        //         }

        //         // if(category == 'taskForMeByStatus'){
        //         // }

        //     }
        // })
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
    $('.boardAnalytical').empty();
    let publicBoard = '<div class="publicBoardLabelName text-center mt-2" style="font-size: xx-large;">Public Board</div>';
    let privateBoard = '<div class="privateBoardLabel text-center mt-2" style="font-size: xx-large;">Private Board</div>';
    let analyticBoard = '<div class="analyticalBoard text-center mt-5" style="font-size: x-large;">Analytic Board</div>';
    if ($('.publicBoardLabelName').length == 0) $(publicBoard).insertBefore($('.boardListPlaceMain'));
    if ($('.privateBoardLabel').length == 0) $(privateBoard).insertBefore($('.boardListPlacePrivate'));
    if ($('.analyticalBoard').length == 0) $(analyticBoard).insertBefore($('.boardAnalytical'));

    // staff and below cannot see team board 
    if (parseInt(ct.grade) > 4) {
        $('.colTeams').remove();
        $('.colPersonal').removeClass('col-lg-6').addClass('col-lg-12');
    }
    // manager and below cannot see project board
    if (parseInt(ct.grade) >= 3) {
        $('.colProjects').remove();
    }
    // super admin, ceo, cto not allowed to see team board
    if (parseInt(ct.grade) < 3) {
        $('.colTeams').remove();
    }


    let analyticHTML = '<a class="list-group-item list-group-item-action analyticList" data-for="personal" style="border-top:0;">Chart Statistic</a>';
    $('.boardAnalytical').append(analyticHTML);

    boardMain.forEach(element => {
        window['dataBoardMember' + element._id + ''] = element.member;
        if("user_create_id" in element && element.user_create_id == ct.id_employee){
            let htmlMain = '<div class="row"><div class="col-lg-8"><a class="list-group-item list-group-item-action boardList" data-create="' + element.user_create + '" data-member="' + element.member + '" data-id="' + element._id + '" data-type="' + element.type + '" data-name="' + element.name + '"style="border-top:0;">' + element.name + '</a></div><div class="col-lg-4" style="align-self:center;"><i class="editBoard fas fa-edit fa-lg mr-1" data-name="' + element.name + '" data-type=' + element.type + ' data-id=' + element._id + '></i><i class="delBoard far fa-trash-alt fa-lg" data-name="' + element.name + '" data-id=' + element._id + '></i></div></div>';
            $('.boardListPlaceMain').append(htmlMain);
        } else {
            if (element.user_create == ct.name) {
                let htmlMain = '<div class="row"><div class="col-lg-8"><a class="list-group-item list-group-item-action boardList" data-create="' + element.user_create + '" data-member="' + element.member + '" data-id="' + element._id + '" data-type="' + element.type + '" data-name="' + element.name + '"style="border-top:0;">' + element.name + '</a></div><div class="col-lg-4" style="align-self:center;"><i class="editBoard fas fa-edit fa-lg mr-1" data-name="' + element.name + '" data-type=' + element.type + ' data-id=' + element._id + '></i><i class="delBoard far fa-trash-alt fa-lg" data-name="' + element.name + '" data-id=' + element._id + '></i></div></div>';
                $('.boardListPlaceMain').append(htmlMain);
            } else {
                let htmlMain = '<a class="list-group-item list-group-item-action boardList" data-create="' + element.user_create + '" data-member="' + element.member + '" data-id="' + element._id + '" data-type="' + element.type + '" data-name="' + element.name + '"style="border-top:0;">' + element.name + '</a>';
                $('.boardListPlaceMain').append(htmlMain);
            }
        }

    });

    boardPrivate.forEach(element => {
        if("user_create_id" in element && element.user_create_id == ct.id_employee){
            element.member = JSON.parse(element.member);
            window['dataBoardMember' + element._id + ''] = element.member;
            let htmlPrivate = '<div class="row"><div class="col-lg-8"><a class="list-group-item list-group-item-action boardList" data-create="' + element.user_create + '" data-member="' + element.member + '" data-id="' + element._id + '" data-type="' + element.type + '" data-name="' + element.name + '"style="border-top:0;">' + element.name + '</a></div><div class="col-lg-4" style="align-self:center;"><i class="editBoard fas fa-edit fa-lg mr-1" data-name="' + element.name + '" data-type=' + element.type + ' data-id=' + element._id + '></i><i class="delBoard far fa-trash-alt fa-lg" data-name="' + element.name + '" data-id=' + element._id + '></i></div></div>';
            $('.boardListPlacePrivate').append(htmlPrivate);
        }
        else {
            if (element.user_create == ct.name) {
                element.member = JSON.parse(element.member);
                window['dataBoardMember' + element._id + ''] = element.member;
                let htmlPrivate = '<div class="row"><div class="col-lg-8"><a class="list-group-item list-group-item-action boardList" data-create="' + element.user_create + '" data-member="' + element.member + '" data-id="' + element._id + '" data-type="' + element.type + '" data-name="' + element.name + '"style="border-top:0;">' + element.name + '</a></div><div class="col-lg-4" style="align-self:center;"><i class="editBoard fas fa-edit fa-lg mr-1" data-name="' + element.name + '" data-type=' + element.type + ' data-id=' + element._id + '></i><i class="delBoard far fa-trash-alt fa-lg" data-name="' + element.name + '" data-id=' + element._id + '></i></div></div>';
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
        }
    })
}

$(document).on('click', '.timelineRange', async function () {
    let startDate;
    let endDate;
    switch ($(this).data('value')) {
        case 'Last 7 days':
            startDate = moment().subtract(6, 'days').format('YYYY-MM-DD');
            endDate = moment().format('YYYY-MM-DD')
            break;
        case 'Last 30 days':
            startDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
            endDate = moment().format('YYYY-MM-DD')
            break;
        case 'Last 365 days':
            startDate = moment().subtract(365, 'days').format('YYYY-MM-DD');
            endDate = moment().format('YYYY-MM-DD')
            break;
        default:
            startDate = '';
            endDate = '';
            break;
    }
    $('.filterTimeName').html($(this).data('value'));
    loadingActivated();
    let chartRangeFilter;
    let taskValue = $("select.chartTaskPersonal").val();
    chartRangeFilter = await getChartAnalytic({
        startDate: startDate,
        endDate: endDate,
        name: ct.name,
        category: $("select.chartTaskPersonal").val(),
        type: 'personal'
    });
    loadingDeactivated();
    if (chartRangeFilter.responseCode == '200') {
        $('input[name="datePickerRangeFilterPersonal"]').val(startDate + ' - ' + endDate)
        if (myBarChart != null) myBarChart.destroy();
        $("select.chartTaskPersonal").val(taskValue);
        $("select.chartLabelPersonal").val("all");
        $('#datepickerFilterPersonal').val('').attr('placeholder', 'all')
        await processTaskCanvas(chartRangeFilter.data, 'chartTaskForMe', 'personal')
    } else if (chartRangeFilter.responseCode == '401') {
        logoutNotif();
    } else if (chartRangeFilter.responseCode == '404') {
        callNotif({
            type: 'error',
            text: chartRangeFilter.responseMessage
        })
        if (myBarChart != null) myBarChart.destroy();
    } else {
        callNotif({
            type: 'error',
            text: chAnalytic.responseMessage
        })
    }
})

async function fireMyTask() {
    loadingActivated();
    let chAnalytic = await getChartAnalytic({
        category: 'assign',
        name: ct.name,
        type: 'personal'
    })
    loadingDeactivated();
    if (chAnalytic.responseCode == '200') {
        if (myBarChart != null) myBarChart.destroy();
        $('.chartLabelPersonal').children().not(':first-child').remove();
        statArray.forEach(element => {
            $('.chartLabelPersonal').append('<option value="' + element + '">' + element + '</option>')
        });
        $('.publicBoardLabel').html('Personal Board');

        const picker = new Litepicker({ 
            element: document.getElementsByName('datePickerRangeFilterPersonal')[0],
            format: 'DD-MMM-YYYY',
            minDate: moment(),
            singleMode :false,
            numberOfColumns : 2,
            numberOfMonths: 2,
            resetButton: true,
            resetButton: () => {
                let btn = document.createElement('button');
                btn.innerText = 'Clear';
                btn.addEventListener('click', async (evt) => {
                  if (myBarChart != null) myBarChart.destroy();
                  $("select.chartTaskPersonal").val("mytask");
                  $("select.chartLabelPersonal").val("all");
                  $('#datepickerFilterPersonal').val('').attr('placeholder', 'all')
                  $('input[name="datePickerRangeFilterPersonal"]').val('').attr('placeholder', 'all');
                  await processTaskCanvas(chAnalytic.data, 'chartTaskForMe', 'personal');
                });
             
                return btn;
             },
            setup: (picker) => {
              picker.on('selected', async (date1, date2) => {
                let startDate = moment(date1.dateInstance).format('YYYY-MM-DD');
                let endDate = moment(date2.dateInstance).format('YYYY-MM-DD');
                let chartRangeFilter;
                loadingActivated();
                chartRangeFilter = await getChartAnalytic({
                    startDate: startDate,
                    endDate: endDate,
                    name: ct.name,
                    category: $("select.chartTaskPersonal").val(),
                    type: 'personal'
                });
                loadingDeactivated();
                if (chartRangeFilter.responseCode == '200') {
                    $('input[name="datePickerRangeFilterPersonal"]').val(startDate + ' - ' + endDate)
                    if (myBarChart != null) myBarChart.destroy();
                    $("select.chartTaskPersonal").val("mytask");
                    $("select.chartLabelPersonal").val("all");
                    $('#datepickerFilterPersonal').val('').attr('placeholder', 'all')
                    await processTaskCanvas(chartRangeFilter.data, 'chartTaskForMe', 'personal')
                } else if (chartRangeFilter.responseCode == '401') {
                    logoutNotif();
                } else if (chartRangeFilter.responseCode == '404') {
                    callNotif({
                        type: 'error',
                        text: chartRangeFilter.responseMessage
                    })
                    if (myBarChart != null) myBarChart.destroy();
                } else {
                    callNotif({
                        type: 'error',
                        text: chartRangeFilter.responseMessage
                    })
                }

              });
            },
        });
          

        $(".dateDueFilterPersonal").datepicker({
            showButtonPanel: true,
            closeText: 'Clear',
            onClose: async function (dateText, inst) {
                if ($(window.event.srcElement).hasClass('ui-datepicker-close')) {
                    document.getElementById(this.id).value = '';
                    if (myBarChart != null) myBarChart.destroy();
                    $("select.chartTaskPersonal").val("mytask");
                    $("select.chartLabelPersonal").val("all");
                    $('input[name="datePickerRangeFilterPersonal"]').val('').attr('placeholder', 'all');
                    await processTaskCanvas(chAnalytic.data, 'chartTaskForMe', 'personal');
                }
            },
            onSelect: async function (date) {
                let dateUsed = moment(date).format('YYYY-MM-DD')
                loadingActivated();
                $("select.chartLabelPersonal").val('all')
                let chartFiltered;
                chartFiltered = await getChartAnalytic({
                    dueDate: dateUsed,
                    name: ct.name,
                    category: $("select.chartTaskPersonal").val(),
                    type: 'personal'
                });
                loadingDeactivated();
                if (chartFiltered.responseCode == '200') {
                    if (myBarChart != null) myBarChart.destroy();
                    await processTaskCanvas(chartFiltered.data, 'chartTaskForMe', 'personal')
                } else if (chartFiltered.responseCode == '401') {
                    logoutNotif();
                } else if (chartFiltered.responseCode == '404') {
                    callNotif({
                        type: 'error',
                        text: chartFiltered.responseMessage
                    })
                    if (myBarChart != null) myBarChart.destroy();
                } else {
                    callNotif({
                        type: 'error',
                        text: chartFiltered.responseMessage
                    })
                }
            },
        });
        await processTaskCanvas(chAnalytic.data, 'chartTaskForMe', 'personal')
    } else if (chAnalytic.responseCode == '401') {
        logoutNotif();
    } else if (chAnalytic.responseCode == '404') {
        callNotif({
            type: 'error',
            text: chAnalytic.responseMessage
        })
        if (myBarChart != null) myBarChart.destroy();
    } else {
        callNotif({
            type: 'error',
            text: chAnalytic.responseMessage
        })
    }
}
async function manageSummaryBoardData(data, idCanvas = 'chartTaskForMe', specialCase = false) {
    let pageFilterr = '<div id="pageFilter" class="d-flex align-items-center justify-content-end p-3"></div>';
    if (specialCase) {
        $('#taskForMe').empty();
        let html = '<div class="row"><div class="col-lg-4 publicBoardLabel align-self-center text-start mt-2" style="font-size: x-large;" id="lblTaskForMe">Personal Board</div><div class="col-lg-8 filterPlace"></div></div>';
        if (idCanvas == 'chartTaskForMe')
            html += '<div class="row" style="gap:3.5em;"><div class="col-lg-12"><canvas id="' + idCanvas + '" class="p-2 d-none"></canvas><img id="chartTaskForMeBackup" src="/proman/public/assets/img/emptyProjects.svg" class="p-2"></img></div><div class="col-lg-12 placeForTeam gridLayout3" id="legendPlacePersonal"></div></div>';
        else
            html += '<div class="row" style="gap:3.5em;"><div class="col-lg-12"><img id="' + idCanvas + '" src="/proman/public/assets/img/emptyProjects.svg" class="p-2"></img></div><div class="col-lg-12 placeForTeam gridLayout3" id="legendPlaceProject"></div></div>';
        $('#taskForMe').html(html);

        // if(idCanvas == 'chartTaskForMe'){
        //     $(pageFilterr).appendTo($('.filterPlace'))
        //     appendFilter([filterAllChartPersonal,filterChartTypePersonal,filterTimeRanges],false,'personal');
        //     $('.forFilter').append(personalGrade);

        //     $('.filterChartPersonalAll').css('font-size','initial')
        //     $('.filterChartTypePersonal').css('font-size','initial')
        //     $('.filterChartName').html('Board Type');
        //     $('.filterTimeName').html('All');
        //     $('#chartTaskForMe').css('display','block').css('width','772px').css('height','386px')
        // } else {
        //     $(pageFilterr).appendTo($('.filterPlace'))
        //     appendFilter([filterAllChartPersonalProject,filterChartTypeProject],false,'project');
        //     $('.forFilter').append(personalGrade);
        //     $('#canvasTaskProject').css('display','block').css('width','772px').css('height','386px')
        // }
        $(pageFilterr).appendTo($('.filterPlace'))
        appendFilter([filterAllChartPersonal, filterChartTypePersonal, filterTimeRanges], false, 'personal');
        $('.forFilter').append(personalGrade);

        $('.filterChartPersonalAll').css('font-size', 'initial')
        $('.filterChartTypePersonal').css('font-size', 'initial')
        $('.filterChartName').html('Board Type');
        $('.filterTimeName').html('All');
        $('#chartTaskForMeBackup').css('display', 'block').css('width', '772px').css('height', '386px')
        return;
    }
    if (data.data != undefined || data.data != null) {
        var result = JSON.stringify(data.data);
        var divId = data.category;
        var chartName = divId.charAt(0).toUpperCase() + divId.slice(1);
        var chartId = 'chart' + chartName;
        console.log('data summary', data, data.category, data.names, chartId);
        if ($('#legendPlacePersonal').length > 0 && idCanvas == 'chartTaskForMe') $('#legendPlacePersonal').empty();
        if ($('#legendPlaceProject').length > 0 && idCanvas != 'chartTaskForMe') $('#legendPlaceProject').empty();

        // if (data.names == 'taskByDivisionAndStatus') {
        //     // if($('.publicBoardLabel').length == 0){
        //     //     $('#' + divId).empty();
        //     //     let html = '<div class="row"><div class="col-lg-4 publicBoardLabel text-start align-self-center mt-2" style="font-size: x-large;" id="lbl' + chartName + '">Personal Board</div><div class="col-lg-8 filterPlace"></div></div>';
        //     //     html += '<div class="row"><div class="col-lg-12"><canvas id="' + chartId + '" class="p-2"></canvas></div><div class="col-lg-12 placeForTeam"></div></div>';
        //     //     $('#' + divId).html(html);

        //     //     $(pageFilterr).appendTo($('.filterPlace'))
        //     //     appendFilter([filterAllChartPersonal,filterChartTypePersonal],false,'personal');
        //     //     // if (parseInt(ct.grade) > 4) {
        //     //     //     $('.forFilter').append(grade5andAbove)
        //     //     // } 
        //     //     // else {
        //     //     //     $('.forFilter').append(grade4andDown)
        //     //     // }
        //     //     $('.forFilter').append(personalGrade);

        //     //     $('.filterChartPersonalAll').css('font-size','initial')
        //     //     $('.filterChartTypePersonal').css('font-size','initial')
        //     //     $('.filterChartName').html('Board Type');
        //     //     $('.filterTimeName').html('All');

        //     // }


        //     // // if (ct.grade == '4' || ct.grade == '5') appendFilter([filterTimeRanges, filterAllChartPersonal,filterChartTypePersonal]);
        //     // // else appendFilter([filterTimeRanges, filterChartUp]);


        //     // if(data.category == 'boardTypeForMe'){
        //     //     await getDoubleBarChart(data.names, result);
        //     // }

        // } else {


        // }

        if ($('.publicBoardLabel').length == 0) {
            $('#' + divId).empty();
            let html = '<div class="row"><div class="col-lg-4 publicBoardLabel align-self-center text-start mt-2" style="font-size: x-large;" id="lbl' + chartName + '">Personal Board</div><div class="col-lg-8 filterPlace"></div></div>';
            if (idCanvas == 'chartTaskForMe')
                html += '<div class="row" style="gap:3.5em;"><div class="col-lg-12"><canvas id="' + chartId + '" class="p-2"></canvas></div><div class="col-lg-12 placeForTeam gridLayout3" id="legendPlacePersonal"></div></div>';
            else
                html += '<div class="row" style="gap:3.5em;"><div class="col-lg-12"><canvas id="' + chartId + '" class="p-2"></canvas></div><div class="col-lg-12 placeForTeam gridLayout3" id="legendPlaceProject"></div></div>';
            $('#' + divId).html(html);

            $(pageFilterr).appendTo($('.filterPlace'))
            appendFilter([filterAllChartPersonal, filterChartTypePersonal, filterTimeRanges], false, 'personal');
            $('.forFilter').append(personalGrade);

            $('.filterChartPersonalAll').css('font-size', 'initial')
            $('.filterChartTypePersonal').css('font-size', 'initial')
            $('.filterChartName').html('Board Type');
            $('.filterTimeName').html('All');
        }

        if (data.category == 'boardTypeForMe') {
            await getBarChart(data.names, result, data.realCategory, idCanvas);
        }
        if (data.category != 'boardTypeForMe') fireMyTask()
    } else {
        let names;
        if (parseInt(ct.grade) <= 5) {
            names = 'boardTypeForMe';
        } else {
            names = 'boardType';
        }
        var divId = data.category;
        var chartName = divId.charAt(0).toUpperCase() + divId.slice(1);

        $('#' + names).empty();
        let html = '<div class="publicBoardLabel text-center mt-2" style="font-size: xx-large;" id="lbl' + chartName + '">Chart ' + splitCamel(data.names) + '<p><img class="text-center font-italic" style="opacity:0.7;" src="/proman/public/assets/img/emptyProjects.svg" width="300px" height="300px"></img></p></div>';
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
    let html = '<div class="row"><div class="col-lg-6 publicBoardLabel text-start mt-2" style="font-size: x-large;" id=' + labelused + '>Chart ' + splitCamel(chartName) + '<p><img width="300px" height="300px" style="opacity:0.7;" class="text-center font-italic" src="/proman/public/assets/img/emptyProjects.svg"></img></p></div><div class="col-lg-6 filterPlace"></div></div>';
    $('#' + divId).html(html);

    $(pageFilterr).appendTo($('.filterPlace'))
    if (parseInt(ct.grade) <= 5) appendFilter([filterTimeRanges, filterChart]);
    else appendFilter([filterTimeRanges, filterChartUp]);

    $('.filterChartName').html('Board Type');
    $('.filterTimeName').html('Last 7 Days');

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

$(document).on('change', '.chartTaskProject, .chartTypeProject', async function () {
    let dropValue = $('select.chartTaskProject option:selected').val();
    loadingActivated();
    if (dropValue == 'boardTypeMe') dropValue = 'boardTypeForMe';
    let summaryBoard = await getSummaryBoard(dropValue);
    loadingDeactivated();
    if (summaryBoard.responseCode == '200') {
        $('.filterChartTypeProjectText').html($('select.chartTypeProject option:selected').text())
        if (ct.grade == '4' || ct.grade == '5') {
            summaryBoard.category = 'boardTypeForMe';
            summaryBoard.names = summaryBoard.category;
            summaryBoard.realCategory = dropValue
        } else {
            summaryBoard.category = 'boardTypeForMe';
            summaryBoard.names = summaryBoard.category;
            summaryBoard.realCategory = dropValue
        }
        if (myProjectChart != null) myProjectChart.destroy();
        $('#canvasTaskProjectBackup').remove();
        $('#canvasTaskProject').removeClass('d-none');
        manageSummaryBoardData(summaryBoard, 'canvasTaskProject');
    } else if (summaryBoard.responseCode == '404') {
        if (myProjectChart != null) myProjectChart.destroy();
        $('#legendPlaceProject').empty();
        $('<img id="canvasTaskProjectBackup" src="/proman/public/assets/img/emptyProjects.svg" class="p-2"></img>').insertAfter($('#canvasTaskProject'));
        $('#canvasTaskProjectBackup').css('display', 'block').css('width', '772px').css('height', '386px')
        $('#canvasTaskProject').addClass('d-none');
    } else if (summaryBoard.responseCode == '404') {
        if (myProjectChart != null) myProjectChart.destroy();
        $('#legendPlaceProject').empty();
    }
})

$(document).on('change', '.chartTaskPersonal, .chartTypePersonal', async function () {
    let dropValue = $('select.chartTaskPersonal option:selected').val();
    loadingActivated();
    let chAnalytic = await getChartAnalytic({
        category: dropValue,
        name: ct.name,
        type: 'personal'
    })
    loadingDeactivated();
    $('#filterChartTypePersonal').removeClass('d-none');
    $('.ownProperty').removeClass('d-none');
    if (chAnalytic.responseCode == '200') {
        if (myBarChart != null) myBarChart.destroy();
        $('.chartLabelPersonal').val('all');
        $('#chartTaskForMe').removeClass('d-none');
        $('#chartTaskForMeBackup').remove();
        if (chAnalytic.data.length == 0) {
            manageSummaryBoardData([], 'chartTaskForMe', true)
        } else {
            await processTaskCanvas(chAnalytic.data, 'chartTaskForMe', 'personal')
        }
    } else if (chAnalytic.responseCode == '401') {
        logoutNotif();
    } else if (chAnalytic.responseCode == '404') {
        callNotif({
            type: 'error',
            text: chAnalytic.responseMessage
        })
        if (myBarChart != null) myBarChart.destroy();
        manageSummaryBoardData([], 'chartTaskForMe', true)
    } else {
        callNotif({
            type: 'error',
            text: chAnalytic.responseMessage
        })
    }
    $('.filterChartTypePersonalText').html($('select.chartTypePersonal option:selected').text())
})

async function appendLegendEtc(idCanvas){
    let pageFilterr = '<div id="pageFilter" class="d-flex align-items-center justify-content-end p-3"></div>';
    $('#taskForMe').empty();
    let html = '<div class="row"><div class="col-lg-4 publicBoardLabel align-self-center text-start mt-2" style="font-size: x-large;" id="lblTaskForMe">Personal Board</div><div class="col-lg-8 filterPlace"></div></div>';
    if (idCanvas == 'chartTaskForMe')
        html += '<div class="row" style="gap:3.5em;"><div class="col-lg-12"><canvas id="' + idCanvas + '" class="p-2 d-none"></canvas><img id="chartTaskForMeBackup" src="/proman/public/assets/img/emptyProjects.svg" class="p-2"></img></div><div class="col-lg-12 placeForTeam gridLayout3" id="legendPlacePersonal"></div></div>';
    else
        html += '<div class="row" style="gap:3.5em;"><div class="col-lg-12"><img id="' + idCanvas + '" src="/proman/public/assets/img/emptyProjects.svg" class="p-2"></img></div><div class="col-lg-12 placeForTeam gridLayout3" id="legendPlaceProject"></div></div>';
    $('#taskForMe').html(html);
    $(pageFilterr).appendTo($('.filterPlace'))
    appendFilter([filterAllChartPersonal, filterChartTypePersonal, filterTimeRanges], false, 'personal');
    $('.forFilter').append(personalGrade);

    $('.filterChartPersonalAll').css('font-size', 'initial')
    $('.filterChartTypePersonal').css('font-size', 'initial')
    $('.filterChartName').html('Board Type');
    $('.filterTimeName').html('All');
    $('#chartTaskForMeBackup').css('display', 'block').css('width', '772px').css('height', '386px')
}

async function changeFireMyTask(){
    // let dropValue = $('select.chartTaskPersonal option:selected').val();
    loadingActivated();
    let chAnalytic = await getChartAnalytic({
        category: 'assign',
        name: ct.name,
        type: 'personal'
    })
    loadingDeactivated();
    $('#filterChartTypePersonal').removeClass('d-none');
    $('.ownProperty').removeClass('d-none');
    if (chAnalytic.responseCode == '200') {
        if (myBarChart != null) myBarChart.destroy();
        $('.chartLabelPersonal').val('all');
        if($('#chartTaskForMe').length == 0){
            await appendLegendEtc('chartTaskForMe');
        }
        $('#chartTaskForMe').removeClass('d-none');
        $('#chartTaskForMeBackup').remove();
        if (chAnalytic.data.length == 0) {
            manageSummaryBoardData([], 'chartTaskForMe', true)
        } else {
            await processTaskCanvas(chAnalytic.data, 'chartTaskForMe', 'personal')
        }
    } else if (chAnalytic.responseCode == '401') {
        logoutNotif();
    } else if (chAnalytic.responseCode == '404') {
        callNotif({
            type: 'error',
            text: chAnalytic.responseMessage
        })
        if (myBarChart != null) myBarChart.destroy();
        manageSummaryBoardData([], 'chartTaskForMe', true)
    } else {
        callNotif({
            type: 'error',
            text: chAnalytic.responseMessage
        })
    }
    $('.filterChartTypePersonalText').html($('select.chartTypePersonal option:selected').text())
}

$(document).on('click', '.analyticList', async function () {
    $('.boardHeader').remove();
    $('.boardContentData').empty();
    // $('.allChart').empty();
    $('#chartSection').removeClass('d-none');
    $('a[class*="boardList"]').removeClass('amber');
    $('a[class*="boardList"]').removeClass('lighten-1');
    $('a[class*="analyticList"]').removeClass('amber');
    $('a[class*="analyticList"]').removeClass('lighten-1');
    $('div[class*="pinnedLabel"]').removeClass('amber').removeClass('lighten-1');
    $(this).addClass('amber');
    $(this).addClass('lighten-1');
    $('.boardContentData').removeClass('h-100');
    switch ($(this).data('for')) {
        case 'global':
            break;
        default:
            if ($('.colTeam').length > 0) {
                loadingActivated();
                let chartsAnalytic = await getChartAnalytic({
                    // division_id: ct.division_id
                    category: 'manager'
                });
                loadingDeactivated();
                if (chartsAnalytic.responseCode == '200') {
                    $('.colTeam').empty();
                    let charts = '<div class="row" style="gap:3.5em;" id="boardTaskData"></div';
                    $('.colTeam').append(charts);
                    $('#boardTaskData').empty();
                    let html = '<div class="row"><div class="col-lg-4 text-start mt-2 align-self-center" style="font-size: x-large;">Team Board</div><div class="col-lg-8 placeForFilter"></div></div>';
                    $(html).insertBefore($('#boardTaskData'));
                    let html2 = '<div class="col-lg-12"><canvas id="canvasTask"></canvas></div></div><div class="col-lg-12 legend gridLayout3" id="legendPlace"></div>'
                    $('#boardTaskData').append(html2);
                    $('#pageFilter').empty();
                    let pageFilterr = '<div id="pageFilterTeam" class="d-flex align-items-center justify-content-end p-3"></div>';
                    $(pageFilterr).appendTo($('.placeForFilter'));
                    appendFilter([filterAllChart, filterChartType], false, 'team');

                    const picker = new Litepicker({ 
                        element: document.getElementsByName('datePickerRangeFilter')[0],
                        format: 'DD-MMM-YYYY',
                        minDate: moment(),
                        singleMode :false,
                        numberOfColumns : 2,
                        numberOfMonths: 2,
                        resetButton: true,
                        resetButton: () => {
                            let btn = document.createElement('button');
                            btn.innerText = 'Clear';
                            btn.addEventListener('click', async (evt) => {
                              if (charted != null) charted.destroy();
                              $("select.chartTaskEmployee").val("all");
                              $("select.chartLabelName").val("all");
                              $('#datepickerFilter').val('').attr('placeholder', 'all')
                              $('input[name="datePickerRangeFilter"]').val('').attr('placeholder', 'all');
                              await processTaskCanvas(chartsAnalytic.data, 'canvasTask');
                              // some custom action
                            });
                         
                            return btn;
                         },
                        setup: (picker) => {
                          picker.on('selected', async (date1, date2) => {
                            // some action
                            let startDate = moment(date1.dateInstance).format('YYYY-MM-DD');
                            let endDate = moment(date2.dateInstance).format('YYYY-MM-DD');
                            let chartRangeFilter;
                            loadingActivated();
                            chartRangeFilter = await getChartAnalytic({
                                startDate: startDate,
                                endDate: endDate,
                                category:'manager'
                            });
                            loadingDeactivated();
                            if (chartRangeFilter.responseCode == '200') {
                                $('input[name="datePickerRangeFilter"]').val(startDate + ' - ' + endDate)
                                if (charted != null) charted.destroy();
                                $("select.chartTaskEmployee").val("all");
                                $("select.chartLabelName").val("all");
                                $('#datepickerFilter').val('').attr('placeholder', 'all')
                                await processTaskCanvas(chartRangeFilter.data, 'canvasTask')
                            } else if (chartRangeFilter.responseCode == '401') {
                                logoutNotif();
                            } else if (chartRangeFilter.responseCode == '404') {
                                callNotif({
                                    type: 'error',
                                    text: chartRangeFilter.responseMessage
                                })
                                if (charted != null) charted.destroy();
                            } else {
                                callNotif({
                                    type: 'error',
                                    text: chartRangeFilter.responseMessage
                                })
                            }
            
                          });
                        },
                    });

                    $(".dateDueFilter").datepicker({
                        showButtonPanel: true,
                        closeText: 'Clear',
                        onClose: async function (dateText, inst) {
                            if ($(window.event.srcElement).hasClass('ui-datepicker-close')) {
                                document.getElementById(this.id).value = '';
                                if (charted != null) charted.destroy();
                                $("select.chartTaskEmployee").val("all");
                                $("select.chartLabelName").val("all");
                                $('input[name="datePickerRangeFilter"]').val('').attr('placeholder', 'all');
                                await processTaskCanvas(chartsAnalytic.data, 'canvasTask');
                            }
                        },
                        onSelect: async function (date) {
                            let dateUsed = moment(date).format('YYYY-MM-DD')
                            loadingActivated();
                            $("select.chartLabelName").val('all')
                            let chartFiltered;
                            chartFiltered = await getChartAnalytic({
                                dueDate: dateUsed,
                                category:'manager'
                            });
                            loadingDeactivated();
                            if (chartFiltered.responseCode == '200') {
                                if (charted != null) charted.destroy();
                                await processTaskCanvas(chartFiltered.data, 'canvasTask')
                            } else if (chartFiltered.responseCode == '401') {
                                logoutNotif();
                            } else if (chartFiltered.responseCode == '404') {
                                callNotif({
                                    type: 'error',
                                    text: chartFiltered.responseMessage
                                })
                                if (charted != null) charted.destroy();
                            } else {
                                callNotif({
                                    type: 'error',
                                    text: chartFiltered.responseMessage
                                })
                            }
                        },
                    });
                    await processTaskCanvas(chartsAnalytic.data, 'canvasTask');
                    $('.chartLabelName').val("pending").change()
                } else if (chartsAnalytic.responseCode == '401') {
                    logoutNotif()
                } else {
                    toastrNotifFull(chartsAnalytic.responseMessage, 'error')
                }
            }

            $('.allChart').empty();
            let charts = '<div class="row"><div class="col-lg-12" id="taskForMe"></div></div><div class="row"><div class="col-lg-12" id="boardType"></div></div>';
            $('.allChart').append(charts);
            loadingActivated();
            $('#taskForMe').empty()
            await chartBoardChecking();

            if ($('.colProject').length > 0) {

                $('.colProject').empty();
                let charts = '<div class="row" style="gap:3.5em;" id="projectTaskData"></div';
                $('.colProject').append(charts);
                $('#projectTaskData').empty();
                let html = '<div class="row"><div class="col-lg-4 text-start mt-2 align-self-center" style="font-size: x-large;">Project Board</div><div class="col-lg-8 placeForFilterProject"></div></div>';
                $(html).insertBefore($('#projectTaskData'));
                let html2 = '<div class="col-lg-12"><canvas id="canvasTaskProject"></canvas></div></div><div class="col-lg-12 gridLayout3" id="legendPlaceProject"></div>'
                $('#projectTaskData').append(html2);
                $('#pageFilterProject').empty();
                let pageFilterrProject = '<div id="pageFilterProject" class="d-flex align-items-center justify-content-end p-3"></div>';
                $(pageFilterrProject).appendTo($('.placeForFilterProject'));
                appendFilter([filterAllChartPersonalProject, filterChartTypeProject], true, 'project');
                $('.forFilterProject').append(grade4AndBelow);
                loadingActivated()
                let summaryBoard = await getSummaryBoard('boardTypeForMe');
                loadingDeactivated();
                if (summaryBoard.responseCode == '200') {
                    if (ct.grade == '4' || ct.grade == '5') {
                        summaryBoard.category = 'boardTypeForMe';
                        summaryBoard.names = summaryBoard.category;
                        summaryBoard.realCategory = 'boardTypeForMe'
                    } else {
                        summaryBoard.category = 'boardTypeForMe';
                        summaryBoard.names = summaryBoard.category;
                        summaryBoard.realCategory = 'boardTypeForMe'
                    }
                    if (myProjectChart != null) myProjectChart.destroy();

                    manageSummaryBoardData(summaryBoard, 'canvasTaskProject');
                } else if (summaryBoard.responseCode == '404') {
                    if (myProjectChart != null) myProjectChart.destroy();
                    $('#legendPlaceProject').empty();
                    $('<img id="canvasTaskProjectBackup" src="/proman/public/assets/img/emptyProjects.svg" class="p-2"></img>').insertAfter($('#canvasTaskProject'));
                    $('#canvasTaskProjectBackup').css('display', 'block').css('width', '772px').css('height', '386px')
                    $('#canvasTaskProject').addClass('d-none');
                } else {
                    if (myProjectChart != null) myProjectChart.destroy();
                    $('#legendPlaceProject').empty();
                }
            }
            break;
    }
})

var charted = null;

async function distributeColorChart(data) {
    data.forEach(element => {
        element['color'] = getRandomColor()
    });
    // check duplicates
    let checkDupe = hasDuplicates(data)
    if (checkDupe) distributeColorChart(id);
}

$(document).on('change', '.chartLabelPersonal', async function () {
    let data = window['data' + $(this).data('id')];
    var ctxP = document.getElementById($(this).data('id')).getContext('2d');
    await distributeColorChart(data)
    let name = [];
    let count = [];
    let background = [];
    let dataDone = [];
    let dataWorking = [];
    let dataStuck = [];
    let dataPending = [];
    let dataReview = [];
    let dataFixing = [];
    window['personalData'] = data;
    window['dataDone'] = [];
    window['dataWorking'] = [];
    window['dataStuck'] = [];
    window['dataPending'] = [];
    window['dataReview'] = [];
    window['dataFixing'] = [];
    let status = $('select.chartLabelPersonal option:selected').text();
    let colorStatus = [{
            status: 'all',
            color: 'lightgrey'
        },
        {
            status: 'pending',
            color: 'teal'
        },
        {
            status: 'working',
            color: 'orange'
        },
        {
            status: 'stuck',
            color: 'red'
        },
        {
            status: 'review',
            color: 'cadetblue'
        },
        {
            status: 'done',
            color: 'limegreen'
        },
        {
            status: 'fixing',
            color: 'sienna'
        },
    ]

    data.forEach(element => {
        for (let [key, value] of Object.entries(element)) {
            if (status != 'all') {
                if (key != 'id' && key != 'name' && key != 'total' && key != 'color' && key != 'dataDone' && key != 'dataPending' && key != 'dataReview' && key != 'dataStuck' && key != 'dataWorking' && key != 'dataFixing' && key == status) {
                    name.push(key);
                    count.push(value);
                    background.push(colorStatus.filter((e) => {
                        return e.status == key
                    })[0].color)
                } else if (key == 'dataDone') {
                    dataDone.push(value);
                } else if (key == 'dataWorking') {
                    dataWorking.push(value);
                } else if (key == 'dataStuck') {
                    dataStuck.push(value);
                } else if (key == 'dataPending') {
                    dataPending.push(value);
                } else if (key == 'dataReview') {
                    dataReview.push(value);
                } else if (key == 'dataFixing') {
                    dataFixing.push(value);
                }
            } else {
                if (key != 'id' && key != 'name' && key != 'total' && key != 'dataDone' && key != 'dataPending' && key != 'dataReview' && key != 'dataStuck' && key != 'dataWorking' && key != 'dataFixing' && key != 'color') {
                    name.push(key);
                    count.push(value);
                    background.push(colorStatus.filter((e) => {
                        return e.status == key
                    })[0].color)
                } else if (key == 'dataDone') {
                    dataDone.push(value);
                } else if (key == 'dataWorking') {
                    dataWorking.push(value);
                } else if (key == 'dataStuck') {
                    dataStuck.push(value);
                } else if (key == 'dataPending') {
                    dataPending.push(value);
                } else if (key == 'dataReview') {
                    dataReview.push(value);
                } else if (key == 'dataFixing') {
                    dataFixing.push(value);
                }
            }
        }
    });

    if (myBarChart != null) myBarChart.destroy();
    myBarChart = new Chart(ctxP, {
        type: $('select.chartTypePersonal option:selected').val(),
        data: {
            labels: name,
            datasets: [{
                label: 'personal board',
                data: count,
                backgroundColor: background,
            }]
        },
        options: {
            responsive: true,
            scaleBeginAtZero: true,
            legendCallback: function (chart) {
                let htmls = '';
                for (var i = 0; i < chart.data.datasets[0].data.length; i++) {
                    let colorCheck = lightOrDark(chart.data.datasets[0].backgroundColor[i]);
                    let colorFont;
                    let plural = parseInt(chart.data.datasets[0].data[i]) > 1 ? 'tasks' : 'task'
                    if (colorCheck == 'light') colorFont = 'text-dark';
                    else colorFont = 'text-white';

                    if (chart.data.labels[i] == 'working') {
                        dataWorking[0].forEach(element => {
                            window['dataWorking'].push(element.name)
                        });
                    }
                    if (chart.data.labels[i] == 'done') {
                        dataDone[0].forEach(element => {
                            window['dataDone'].push(element.name)
                        });
                    }
                    if (chart.data.labels[i] == 'stuck') {
                        dataStuck[0].forEach(element => {
                            window['dataStuck'].push(element.name)
                        });
                    }
                    if (chart.data.labels[i] == 'review') {
                        dataReview[0].forEach(element => {
                            window['dataReview'].push(element.name)
                        });
                    }
                    if (chart.data.labels[i] == 'pending') {
                        dataPending[0].forEach(element => {
                            window['dataPending'].push(element.name)
                        });
                    }
                    if (chart.data.labels[i] == 'fixing') {
                        dataFixing[0].forEach(element => {
                            window['dataFixing'].push(element.name)
                        });
                    }

                    htmls += '<div class="card text-white mb-3 personalDetail" data-for=' + chart.data.labels[i] + ' style="cursor:pointer;background:' + chart.data.datasets[0].backgroundColor[i] + '"">' +
                        '<div class="card-header ' + colorFont + '" style="border-bottom:none;background:unset;font-size:1.2rem;">' + chart.data.labels[i] + ' :</div>' +
                        '<div class="card-body text-center pb-3">' +
                        '<p class="card-text ' + colorFont + '" style="font-size:1.0rem;">' + chart.data.datasets[0].data[i] + ' ' + plural + ' </p>' +
                        '</div>' +
                        '</div>';
                }
                return htmls;
            },
            legend: {
                display: false
            },
        }
    });
    $("#legendPlacePersonal").html(myBarChart.generateLegend());
})

$(document).on('change', '.chartTaskEmployee, .chartLabelName, .chartType', async function () {
    let data = window['data' + $(this).data('id')];
    $('.filterChartType').html($('select.chartType option:selected').text());
    if ($('#datepickerFilter').val() != '') {
        let dates = moment($('#datepickerFilter').val()).format('YYYY-MM-DD');
        let employeeName = $('select.chartTaskEmployee option:selected').text()
        if (employeeName != 'all') {
            loadingActivated();
            let filteredData = await getChartAnalytic({
                'dueDate': dates,
                'member': employeeName,
                'category': "manager"
            })
            loadingDeactivated();
            if (filteredData.responseCode == '200') {
                data = filteredData.data;
            } else if (filteredData.responseCode == '401') {
                logoutNotif();
                return;
            } else if (filteredData.responseCode == '404') {
                callNotif({
                    type: 'error',
                    text: filteredData.responseMessage
                })
                if (charted != null) charted.destroy();
                return;
            } else {
                callNotif({
                    type: 'error',
                    text: filteredData.responseMessage
                })
                return;
            }
        }

    }
    var ctxB = document.getElementById($(this).data('id')).getContext('2d');
    await distributeColorChart(data)
    let name = [];
    let count = [];
    let background = [];
    let status = $('select.chartLabelName option:selected').text();

    data = data.filter(function (e) {
        if ($('select.chartTaskEmployee option:selected').text() != 'all')
            return e.name == $('select.chartTaskEmployee option:selected').text()
        else return e;
    })

    let colorStatus = [{
            status: 'all',
            color: 'lightgrey'
        },
        {
            status: 'pending',
            color: 'teal'
        },
        {
            status: 'working',
            color: 'orange'
        },
        {
            status: 'stuck',
            color: 'red'
        },
        {
            status: 'review',
            color: 'cadetblue'
        },
        {
            status: 'done',
            color: 'limegreen'
        },
        {
            status: 'fixing',
            color: 'sienna'
        },
    ]

    if ($('select.chartTaskEmployee option:selected').text() == 'all') {
        data.forEach(element => {
            if (status == 'all') {
                name.push(element.name);
                count.push(element.total)
                background.push(element.color);
            } else {
                for (let [key, value] of Object.entries(element)) {
                    if (key == status) {
                        name.push(element.name);
                        count.push(value);
                        background.push(colorStatus.filter((e) => {
                            return e.status == key
                        })[0].color)
                    }
                }
            }
        });
    } else {
        data.forEach(element => {
            for (let [key, value] of Object.entries(element)) {
                if (status != 'all') {
                    if (key != 'id' && key != 'name' && key != 'total' && key != 'color' && key != 'dataDone' && key != 'dataPending' && key != 'dataReview' && key != 'dataStuck' && key != 'dataWorking' && key != 'dataFixing' && key == status) {
                        name.push(key);
                        count.push(value);
                        background.push(colorStatus.filter((e) => {
                            return e.status == key
                        })[0].color)
                    }
                } else {
                    if (key != 'id' && key != 'name' && key != 'total' && key != 'dataDone' && key != 'dataPending' && key != 'dataReview' && key != 'dataStuck' && key != 'dataWorking' && key != 'dataFixing' && key != 'color') {
                        name.push(key);
                        count.push(value);
                        background.push(colorStatus.filter((e) => {
                            return e.status == key
                        })[0].color)
                    }
                }
            }
        });
    }
    window['dataChart' + $(this).data('id')] = data;
    console.log('data', name, count, background);
    if (charted != null) charted.destroy();
    charted = new Chart(ctxB, {
        type: $('select.chartType option:selected').text(),
        data: {
            labels: name,
            datasets: [{
                label: 'team board',
                data: count,
                backgroundColor: background,
            }]
        },
        options: {
            responsive: true,
            scaleBeginAtZero: true,
            legendCallback: function (chart) {
                let htmls = '';
                for (var i = 0; i < chart.data.datasets[0].data.length; i++) {
                    let colorCheck = lightOrDark(chart.data.datasets[0].backgroundColor[i]);
                    let colorFont;
                    let plural = parseInt(chart.data.datasets[0].data[i]) > 1 ? 'tasks' : 'task'
                    if (colorCheck == 'light') colorFont = 'text-dark';
                    else colorFont = 'text-white';
                    htmls += '<div class="card text-white mb-3 teamStatus" data-name="'+chart.data.labels[i]+'" data-for="'+ chart.data.datasets[0].backgroundColor[i] +'" style="background:' + chart.data.datasets[0].backgroundColor[i] + '"">' +
                        '<div class="card-header ' + colorFont + '" style="border-bottom:none;background:unset;font-size:1.2rem;">' + chart.data.labels[i] + '</div>' +
                        '<div class="card-body text-center pb-3">' +
                        '<p class="card-text ' + colorFont + '" style="font-size:1.0rem;">' + chart.data.datasets[0].data[i] + ' ' + plural + ' </p>' +
                        '</div>' +
                        '</div>';
                }
                return htmls;
            },
            legend: {
                display: false
            },
        }
    });
    $("#legendPlace").html(charted.generateLegend());
    $('.filterChartName').html($('select.chartTaskEmployee option:selected').text());
})

async function processTaskCanvas(data, idCanvas, category = 'team') {
    window['data' + idCanvas] = data;
    window['dataChart' + idCanvas] = [];
    var ctxB = document.getElementById(idCanvas).getContext('2d');
    await distributeColorChart(data)
    let name = [];
    let count = [];
    let idEmployee = [];
    let background = [];
    let dataDone = [];
    let dataWorking = [];
    let dataStuck = [];
    let dataPending = [];
    let dataReview = [];
    let dataFixing = [];
    window['personalData'] = data;
    window['dataDone'] = [];
    window['dataWorking'] = [];
    window['dataStuck'] = [];
    window['dataPending'] = [];
    window['dataReview'] = [];
    window['dataFixing'] = [];
    if (category == 'personal') {
        let colorStatus = [{
                status: 'all',
                color: 'lightgrey'
            },
            {
                status: 'pending',
                color: 'teal'
            },
            {
                status: 'working',
                color: 'orange'
            },
            {
                status: 'stuck',
                color: 'red'
            },
            {
                status: 'review',
                color: 'cadetblue'
            },
            {
                status: 'done',
                color: 'limegreen'
            },
            {
                status: 'fixing',
                color: 'sienna'
            },
        ]

        let status = $('select.chartLabelPersonal option:selected').text();

        data.forEach(element => {
            for (let [key, value] of Object.entries(element)) {
                if (status != 'all') {
                    if (key != 'id' && key != 'name' && key != 'total' && key != 'color' && key != 'dataDone' && key != 'dataPending' && key != 'dataReview' && key != 'dataStuck' && key != 'dataFixing' && key != 'dataWorking' && key == status) {
                        name.push(key);
                        count.push(value);
                        background.push(colorStatus.filter((e) => {
                            return e.status == key
                        })[0].color)
                    } else if (key == 'dataDone') {
                        dataDone.push(value);
                    } else if (key == 'dataWorking') {
                        dataWorking.push(value);
                    } else if (key == 'dataStuck') {
                        dataStuck.push(value);
                    } else if (key == 'dataPending') {
                        dataPending.push(value);
                    } else if (key == 'dataReview') {
                        dataReview.push(value);
                    } else if (key == 'dataFixing') {
                        dataFixing.push(value);
                    }
                } else {
                    if (key != 'id' && key != 'name' && key != 'total' && key != 'dataDone' && key != 'dataPending' && key != 'dataReview' && key != 'dataStuck' && key != 'dataWorking' && key != 'dataFixing' && key != 'color') {
                        name.push(key);
                        count.push(value);
                        background.push(colorStatus.filter((e) => {
                            return e.status == key
                        })[0].color)
                    } else if (key == 'dataDone') {
                        dataDone.push(value);
                    } else if (key == 'dataWorking') {
                        dataWorking.push(value);
                    } else if (key == 'dataStuck') {
                        dataStuck.push(value);
                    } else if (key == 'dataPending') {
                        dataPending.push(value);
                    } else if (key == 'dataReview') {
                        dataReview.push(value);
                    } else if (key == 'dataFixing') {
                        dataFixing.push(value);
                    }
                }
            }
        });
        $('.chartLabelPersonal').attr('data-id', idCanvas)
        myBarChart = new Chart(ctxB, {
            type: $('select.chartTypePersonal option:selected').val(),
            data: {
                labels: name,
                datasets: [{
                    label: 'personal board',
                    data: count,
                    backgroundColor: background,
                }]
            },
            options: {
                responsive: true,
                scaleBeginAtZero: true,
                legendCallback: function (chart) {
                    let htmls = '';
                    for (var i = 0; i < chart.data.datasets[0].data.length; i++) {
                        let colorCheck = lightOrDark(chart.data.datasets[0].backgroundColor[i]);
                        let colorFont;
                        let plural = parseInt(chart.data.datasets[0].data[i]) > 1 ? 'tasks' : 'task'
                        if (colorCheck == 'light') colorFont = 'text-dark';
                        else colorFont = 'text-white';

                        if (chart.data.labels[i] == 'working') {
                            dataWorking[0].forEach(element => {
                                window['dataWorking'].push(element.name)
                            });
                        }
                        if (chart.data.labels[i] == 'done') {
                            dataDone[0].forEach(element => {
                                window['dataDone'].push(element.name)
                            });
                        }
                        if (chart.data.labels[i] == 'stuck') {
                            dataStuck[0].forEach(element => {
                                window['dataStuck'].push(element.name)
                            });
                        }
                        if (chart.data.labels[i] == 'review') {
                            dataReview[0].forEach(element => {
                                window['dataReview'].push(element.name)
                            });
                        }
                        if (chart.data.labels[i] == 'pending') {
                            dataPending[0].forEach(element => {
                                window['dataPending'].push(element.name)
                            });
                        }
                        if (chart.data.labels[i] == 'fixing') {
                            dataFixing[0].forEach(element => {
                                window['dataFixing'].push(element.name)
                            });
                        }

                        htmls += '<div class="card text-white mb-3 personalDetail" data-for=' + chart.data.labels[i] + ' style="cursor:pointer;background:' + chart.data.datasets[0].backgroundColor[i] + '"">' +
                            '<div class="card-header ' + colorFont + '" style="border-bottom:none;background:unset;font-size:1.2rem;">' + chart.data.labels[i] + ' :</div>' +
                            '<div class="card-body text-center pb-3">' +
                            '<p class="card-text ' + colorFont + '" style="font-size:1.0rem;">' + chart.data.datasets[0].data[i] + ' ' + plural + ' </p>' +
                            '</div>' +
                            '</div>';
                    }
                    return htmls;
                },
                legend: {
                    display: false
                },
            }
        });
        $("#legendPlacePersonal").html(myBarChart.generateLegend());
    } else {
        data.forEach(element => {
            name.push(element.name);
            count.push(element.total)
            background.push(element.color);
            idEmployee.push(element.id);
        });
        $('.chartTaskEmployee').children().not(':first-child').remove();
        name.forEach(element => {
            $('.chartTaskEmployee').append('<option value="' + element + '">' + element + '</option>')
        });
        $('.chartLabelName').children().not(':first-child').remove();
        statArray.forEach(element => {
            $('.chartLabelName').append('<option value="' + element + '">' + element + '</option>')
        });
        $('.chartTaskEmployee').attr('data-id', idCanvas);
        $('.chartLabelName').attr('data-id', idCanvas);
        $('.chartType').attr('data-id', idCanvas);

        charted = new Chart(ctxB, {
            type: $('select.chartType option:selected').text(),
            data: {
                labels: name,
                datasets: [{
                    label: 'team board',
                    data: count,
                    backgroundColor: background,
                    id: idEmployee
                }]
            },
            options: {
                responsive: true,
                scaleBeginAtZero: true,
                legendCallback: function (chart) {
                    let htmls = '';
                    for (var i = 0; i < chart.data.datasets[0].data.length; i++) {
                        let colorCheck = lightOrDark(chart.data.datasets[0].backgroundColor[i]);
                        let colorFont;
                        let plural = parseInt(chart.data.datasets[0].data[i]) > 1 ? 'tasks' : 'task'
                        if (colorCheck == 'light') colorFont = 'text-dark';
                        else colorFont = 'text-white';
                        htmls += '<div class="card text-white mb-3 legendTeamTask" data-id='+chart.data.datasets[0].id[i]+' style="background:' + chart.data.datasets[0].backgroundColor[i] + '"">' +
                            '<div class="card-header ' + colorFont + '" style="border-bottom:none;background:unset;font-size:1.2rem;">' + chart.data.labels[i] + ' :</div>' +
                            '<div class="card-body text-center pb-3">' +
                            '<p class="card-text ' + colorFont + '" style="font-size:1.0rem;">' + chart.data.datasets[0].data[i] + ' ' + plural + ' </p>' +
                            '</div>' +
                            '</div>';
                    }
                    return htmls;
                },
                legend: {
                    display: false
                },
            }
        });
        $("#legendPlace").html(charted.generateLegend());
    }
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
        let genKeyEdit = await getGenerateKey();
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
                    "signature": ct.signature,
                    "keyencrypt": genKeyEdit
                },
                "processData": false,
                "body": JSON.stringify(iterateObjectNewEncrypt(bodyEdit,genKeyEdit)),
            }
        }

        let result = await ajaxCall({url:'board',data:editSettingsBoard,method:'PUT',credentialHeader:true})
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
                if (boardList == '200') {
                    console.log('ss', bodyEdit._id);
                    $('.boardList[data-id=' + bodyEdit._id + ']').click();
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
        // $.ajax({
        //     url: 'board',
        //     method: 'PUT',
        //     headers: {
        //         "Content-Type": "application/json",
        //         "Accept": "*/*",
        //         "Cache-Control": "no-cache",
        //         "secretKey": ct.secretKey,
        //         "token": ct.token,
        //         "signature": ct.signature
        //     },
        //     data: JSON.stringify(editSettingsBoard),
        //     success: async function (result) {
        //         if (result.responseCode == '200') {
        //             let param = {
        //                 type: 'success',
        //                 text: result.responseMessage
        //             };
        //             callNotif(param);
        //             boardTeamMember = [];
        //             try {
        //                 loadingActivated();
        //                 let boardList = await getBoard();
        //                 if (boardList == '200') {
        //                     console.log('ss', bodyEdit._id);
        //                     $('.boardList[data-id=' + bodyEdit._id + ']').click();
        //                 }
        //             } catch (error) {
        //                 loadingDeactivated();
        //             }

        //         } else if (result.responseCode == '401') {
        //             logoutNotif();
        //         } else {
        //             let param = {
        //                 type: 'error',
        //                 text: result.responseMessage
        //             };
        //             callNotif(param);
        //         }
        //     }
        // })
    })
}

async function deleteBoard(bodyDelete) {
    return new Promise(async function (resolve, reject) {
        let genKeyDeleteBoard = await getGenerateKey();
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
                    "signature": ct.signature,
                    'keyencrypt': genKeyDeleteBoard
                },
                "processData": false,
                "body": JSON.stringify(iterateObjectNewEncrypt(bodyDelete,genKeyDeleteBoard)),
            }
        }
        let result = await ajaxCall({url:'board',data:JSON.stringify(deleteSettingsBoard),method:'DELETE'})
        if (result.responseCode == '200') {
            let param = {
                type: 'success',
                text: result.responseMessage
            };
            callNotif(param);
            return location.reload();
        } else if (result.responseCode == '401') {
            logoutNotif();
        } else {
            let param = {
                type: 'error',
                text: result.responseMessage
            };
            callNotif(param);
            return false;
        }
    })
}

async function getGroupTask(id) {
    return new Promise(async function (resolve, reject) {
        let result = await ajaxCall({url:'getGroupTask',method:'GET',credentialHeader:true,extraHeaders:{"param":JSON.stringify({
            'board_id': id
        })},decrypt:true})
        console.log('tes',result);
        resolve(result);
        // $.ajax({
        //     url: 'getGroupTask',
        //     method: 'GET',
        //     headers: {
        //         "Content-Type": "application/json",
        //         "Accept": "*/*",
        //         "Cache-Control": "no-cache",
        //         "secretKey": ct.secretKey,
        //         "token": ct.token,
        //         "param": JSON.stringify({
        //             'board_id': id
        //         }),
        //         "signature": ct.signature
        //     },
        //     success: function (result) {
        //         resolve(result);
        //     }
        // })
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

async function distributeColor(id,pinned = false) {
    if(!pinned){
        window['dataBoardMember' + id + ''].forEach(element => {
            element['color'] = getRandomColor()
        });
        // check duplicates
        let checkDupe = hasDuplicates(window['dataBoardMember' + id + ''])
        if (checkDupe) distributeColor(id);
    } else {
        let filtered = window['favList'].filter(function (e) {
            return e.data != undefined || e.data != null
        })
        window['picColor'] = [];
        filtered.forEach(element => {
            let dataCredent = JSON.parse(window.atob(element.data))
            picColor.push({
                id: JSON.parse(dataCredent.pic)[0].account_id,
                name : JSON.parse(dataCredent.pic)[0].account_name
            })
        });
        window['picColor'] = window['picColor'].filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i)
        filtered.forEach(element => {
            let dataCredent = JSON.parse(window.atob(element.data))
            element['memberColor'] = JSON.parse(dataCredent.member);
        });
        filtered.forEach(element => {
            element.memberColor.forEach(elementss => {
                elementss['colorData'] = getRandomColor();
            });
        });
    }
    
}

$(document).on('click', '.boardList', async function () {
    loadingActivated();
    if ($('.boardHeader').length == 0) {
        let headeerBoard = '<div class="boardHeader" style="border-bottom:1px solid #dee2e6;"></div>';
        $(headeerBoard).insertBefore($('.boardContentData'))
    }
    let boardName = capitalize($(this).data('name'));
    let camelized = camelize($(this).data('name'));
    let type = $(this).data('type');
    let name = $(this).data('name');
    let id = $(this).data('id');
    let boardCreated = $(this).data('create');
    let member = $(this).data('member');
    $('a[class*="boardList"]').removeClass('amber');
    $('a[class*="boardList"]').removeClass('lighten-1');
    $('a[class*="analyticList"]').removeClass('amber');
    $('a[class*="analyticList"]').removeClass('lighten-1');
    $('div[class*="pinnedLabel"]').removeClass('amber').removeClass('lighten-1');
    $(this).addClass('amber');
    $(this).addClass('lighten-1');
    $('.boardContentData').empty();
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
            window['groupTask' + id] = groupTask.data;
            $.ajax({
                url: 'projectBoard',
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "*/*",
                    "Cache-Control": "no-cache",
                },
                success: function (result) {
                    $.getScript(window.location.origin + "/proman/public/assets/js/project_management/projectContent.js", async function (data, textStatus, jqxhr) {
                        $('#chartSection').prev().removeClass('d-none');
                        $('#chartSection').addClass('d-none');
                        await domBoardContent();
                    })
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
                    $('#chartSection').addClass('d-none');
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

                    let appendEmptyImage = '<p><img width="300px" height="300px" class="text-center font-italic" width="300" height="300" src="/proman/public/assets/img/emptyProjects.svg" style="opacity:0.7;"></p></img>';
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
    if (addTeam) html = '<button class="text-white rounded-pill btn amber lighten-1" id="addTeam" data-division=' + data.division_id + ' data-grade=' + data.grade + ' data-usercreate="' + data.user_create + '" data-boardtype=' + data.type + ' data-boardname="' + data.boardName + '" data-id="' + data.id + '" data-concern="' + data.camelized + '" type="button">Organize Team</button>';
    if (JSON.parse(data.member).length > 0) {
        if (!addTeam) {
            tools = '<div class="row p-3 ml-1 mr-1">' +
                '<div class="col-lg-6" style="align-self: center;">' +
                '<h2 class="boardPlaceHeader"><span class="name">' + data.boardName + '</span> Board</h2>' +
                '</div>' +
                '<div class="col-lg-6" style="text-align: end;">' +
                '<div class="row boardMemberTools"><div class="col-lg-6 align-self-center memberAvatar' + data.id + '">' +
                html +
                '</div><div class="col-lg-6"><button class="text-white rounded-pill btn amber lighten-1" id="addGroupTask" data-created=' + data.created + ' data-boardtype=' + data.type + ' data-member="' + data.member + '" data-boardname="' + data.boardName + '" data-id="' + data.id + '" data-concern="' + data.camelized + '" type="button">Add Group Task</button>' +
                '</div></div></div>' +
                '</div>';
        } else {
            html = '<button class="text-white btn-md rounded-pill btn amber lighten-1" id="addTeam" data-division=' + data.division_id + ' data-grade=' + data.grade + ' data-usercreate="' + data.user_create + '" data-boardtype=' + data.type + ' data-boardname="' + data.boardName + '" data-id="' + data.id + '" data-concern="' + data.camelized + '" type="button">Organize Team</button>';
            tools = '<div class="row p-3 ml-1 mr-1">' +
                '<div class="col-lg-5" style="align-self: center;">' +
                '<h2 class="boardPlaceHeader"><span class="name">' + data.boardName + '</span> Board</h2>' +
                '</div>' +
                '<div class="col-lg-7" style="text-align: end;">' +
                '<div class="row boardMemberTools"><div class="col-lg-6 align-self-center memberAvatar' + data.id + '">' +
                '</div><div class="col-lg-6">' + html + '<button class="text-white btn-md rounded-pill btn amber lighten-1" id="addGroupTask" data-created=' + data.created + ' data-boardtype=' + data.type + ' data-member="' + data.member + '" data-boardname="' + data.boardName + '" data-id="' + data.id + '" data-concern="' + data.camelized + '" type="button">Add Group Task</button>' +
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
            '<button class="text-white rounded-pill btn amber lighten-1" id="addGroupTask" data-created=' + data.created + ' data-boardtype=' + data.type + ' data-member="' + data.member + '" data-boardname="' + data.boardName + '" data-id="' + data.id + '" data-concern="' + data.camelized + '" type="button">Add Group Task</button>' +
            '</div>' +
            '</div>';
    }

    $('.boardHeader').append(tools);
    if ($('.removeSidebar').length == 0) $('.boardPlaceHeader').prepend('<span class="removeSidebar mr-2"><i class="fas fa-arrow-left"></i></span>');
}

$(document).on('click', '#addTeam', function () {
    let boardId = $(this).data('id');
    let boardName = $(this).data('boardname');
    let boardType = $(this).data('boardtype');
    let concern = $(this).attr('data-for');
    Swal.fire({
        title: 'Please select team',
        html: '<div class="row rowEmp"><div class="col-lg-9"><select id="memberGroup" multiple class="swal2-input" style="height:auto;"></select></div><div class="col-lg-3" style="align-self:center;"><button type="button" data-id=' + boardId + ' class="btn btn-primary addTeamMember">Add</button></div></div><div class="accordionPlace"></div>',
        onOpen: async () => {
            Swal.showLoading();
            let employee;
            let empDone = false;
            try {
                employee = await getEmployee();
                if (employee != 500) {
                    console.log('data awal', window['dataBoardMember' + boardId + '']);
                    $('#emptyMember').remove();
                    $('#memberGroup').empty()
                    empDone = !empDone;
                    if(concern != 'department') employee = await boardEmployeeChecking(employee);
                    employee.forEach(element => {
                        if(concern != 'department'){
                            if (parseInt(element.division_id) == ct.division_id && parseInt(element.company_id) == ct.company_id  && parseInt(element.grade) >= parseInt(ct.grade))
                            $('#memberGroup').append('<option data-grade=' + element.grade + ' data-name="'+element.employee_name+'" value=' + element.employee_id + '>' + element.employee_name + '</option>')
                        } else {
                            if (parseInt(element.company_id) == ct.company_id  && parseInt(element.grade) == parseInt(ct.grade))
                            $('#memberGroup').append('<option data-grade=' + element.grade + ' data-name="'+element.employee_name+'" value=' + element.employee_id + '>' + element.employee_name + '</option>')
                        }
                    });
                    window['dataBoardMember' + boardId + ''].forEach(element => {
                        $('option[value=' + element.account_id + ']').remove();
                    });
                    addTemAccordion(window['dataBoardMember' + boardId + ''], boardId);
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
            if (window['dataBoardMember' + boardId + ''].length == 0) {
                toastrNotifFull('please add team member', 'error');
                return false;
            } else {
                let oldMember = window['dataBoardMember' + boardId + ''];
                oldMember.forEach(element => {
                    delete element.departmen_id;
                    delete element.departmen_name;
                    delete element.color;
                });
                // let allMember = boardTeamMember.concat(oldMember);
                let param = {
                    '_id': boardId,
                    'name': boardName,
                    'type': capitalize(boardType),
                    'member': JSON.stringify(oldMember)
                };
                await editBoard(param);
            }
        },
        allowOutsideClick: () => !Swal.isLoading()
    }).then(function (result) {
        if (result.value) {

        } else if (result.dismiss == 'cancel') {
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
            if (boardName == '') {
                toastrNotifFull('please fill board name', 'error');
                return false;
            }
            if (boardType == 'private' && boardMemberJoin.length == 0) {
                toastrNotifFull('please add your team', 'error');
                return false;
            }
            let bodyBoard = {
                'name': boardName,
                'type': capitalize(boardType),
                'member': JSON.stringify(boardMemberJoin)
            }
            return await postBoard(bodyBoard).then(async function (result) {
                let param;
                if (result.responseCode == '200') {
                    param = {
                        type: 'success',
                        text: result.responseMessage
                    };
                    try {
                        loadingActivated();
                        boardMemberJoin = [];
                        await getBoard();
                    } catch (error) {
                        loadingDeactivated();
                    }
                    return toastrNotifFull(result.responseMessage);
                } else if (result.responseCode == '401') {
                    logoutNotif();
                } else {
                    param = {
                        type: 'error',
                        text: result.responseMessage
                    };
                    toastrNotifFull(result.responseMessage, 'error');
                    return false;
                }

            });
        },
        allowOutsideClick: () => !Swal.isLoading()
    }).then(function (result) {
        if (result.value) {

        } else if (result.dismiss == 'cancel') {
            boardMemberJoin = [];
        }

    });
}
let boardTeamMember = [];
$(document).on('click', '.addTeamMember', function () {
    let boardId = $(this).data('id');
    let boardMemberId = $('#memberGroup option:selected').toArray().map(item => item.value);
    let boardMemberName = $('#memberGroup option:selected').toArray().map(item => item.text);
    let boardMemberGrade = $('#memberGroup option:selected').toArray().map(item => item.getAttribute('data-grade'));

    boardMemberId.forEach(function (e, index) {
        boardTeamMember.push({
            'account_id': e,
            'account_name': boardMemberName[index],
            'account_grade': boardMemberGrade[index]
        });
        window['dataBoardMember' + boardId + ''].push({
            'account_id': e,
            'account_name': boardMemberName[index],
            'account_grade': boardMemberGrade[index]
        });
        $('option[value=' + e + ']').remove();
    })
    addTemAccordion(window['dataBoardMember' + boardId + ''], boardId);
})

function addTemAccordion(boardTeamMemberNew, boardId) {
    boardTeamMemberNew.forEach(element => {
        let splitCamelAccName = camelize(element.account_name);
        if ($('.beefup__head').length == 0) {
            $('.accordionPlace').empty();
            let htmlAccordion = '<article class="beefup">' +
                '<h2 class="beefup__head" data-toggle="collapse" data-target="#' + splitCamelAccName + '" aria-expanded="true" aria-controls="' + splitCamelAccName + '" id=' + element.account_id + '>Team List</h2>' +
                '<div id="' + splitCamelAccName + '" class="collapse beefup__body show">' +
                '<div id="forMemberList"><div class="row rowData teamData" data-id=' + element.account_id + ' data-name="' + element.account_name + '"><div class="col-lg-9">' + element.account_name + '</div><div class="col-lg-3"><i class="fa fa-times text-danger close removeDataTeam" data-boardid=' + boardId + ' data-for="' + splitCamelAccName + '" data-id=' + element.account_id + ' data-name="' + element.account_name + '" style="float:none; cursor:pointer;"></i></div></div></div>' +
                '</div></article>';
            $('.accordionPlace').append(htmlAccordion);
        } else {
            if ($('.teamData[data-id=' + element.account_id + ']').length > 0) $('.teamData[data-id=' + element.account_id + ']').remove();
            $('#forMemberList').append('<div class="row rowData teamData" data-id=' + element.account_id + ' data-name="' + element.account_name + '" ><div class="col-lg-9">' + element.account_name + '</div><div class="col-lg-3"><i class="fa fa-times text-danger close removeDataTeam" data-boardid=' + boardId + ' data-for="' + splitCamelAccName + '" data-id=' + element.account_id + ' data-name="' + element.account_name + '" style="float:none; cursor:pointer;"></i></div></div></div>');
        }
    });
}

$(document).on('click', '.addMember', function () {
    let boardMemberId = $('#employeeId option:selected').toArray().map(item => item.value);
    let boardDivisionName = $('select#divisionId option:selected').text();
    let boardDivision = $('select#divisionId').val();
    let boardMemberName = $('#employeeId option:selected').toArray().map(item => item.text);
    let boardMemberGrade = $('#employeeId option:selected').toArray().map(item => item.getAttribute('data-grade'));
    boardMemberId.forEach(function (e, index) {
        boardMemberJoin.push({
            'departmen_id': boardDivision,
            'departmen_name': boardDivisionName,
            'account_id': e,
            'account_name': boardMemberName[index],
            'account_grade': boardMemberGrade[index]
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
    let boardid = $(this).data('boardid');
    $('.rowData[data-name="' + dataNama + '"]').remove();
    boardTeamMember = boardTeamMember.filter(function (e) {
        return e.account_name != dataNama && e.account_id != empId
    })

    window['dataBoardMember' + boardid + ''] = window['dataBoardMember' + boardid + ''].filter(function (e) {
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
        let genKey = await getGenerateKey();
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
                    "signature": ct.signature,
                    "keyencrypt": genKey
                },
                "processData": false,
                "body": JSON.stringify(iterateObjectNewEncrypt(body,genKey)),
            }
        }
        let result = await ajaxCall({url:'postBoard',data:settingsBoard,method:'POST',credentialHeader:true,decrypt:true})
        resolve(result);
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
                let html = '<option data-grade=' + element.grade + ' value=' + element.employee_id + '>' + element.employee_name + '</option>';
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
            window['employeeData'] = JSON.parse(b.data);
            resolve(JSON.parse(b.data));
        } else {
            reject(500);
        }
    });
}

async function getChannelSlack() {
    return new Promise(async function (resolve, reject) {
        let param = {
            url: 'getChannelSlack',
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

async function getSlackSettings() {
    return new Promise(async function (resolve, reject) {

        let param = {
            url: 'getSlackSettings',
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
        resolve(b);
    });
}

async function getChannelTelegram() {
    return new Promise(async function (resolve, reject) {
        let param = {
            url: 'getChannelTelegram',
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

async function getTelegramSettings() {
    return new Promise(async function (resolve, reject) {
        let param = {
            url: 'getTelegramSettings',
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
        resolve(b);
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
        $.getScript(window.location.origin + "/proman/public/assets/js/project_management/trello.js", function (data, textStatus, jqxhr) {})
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
                    boardMember = await groupTaskGradeCheck(boardMember);
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
                "account_id": $('select#picGroup').val(),
                "account_name": $('select#picGroup :selected').text()
            }]

            let bodyGroup = {
                'board_id': thisId,
                'name': taskValue,
                'pic': JSON.stringify(pic),
                'url': '/proman/employee?boardId=' + thisId
            }
            return await postGroupTask(bodyGroup).then(async function (result) {
                let param;
                if (result.responseCode == '200') {
                    param = {
                        type: 'success',
                        text: result.responseMessage
                    };
                    callNotif(param);
                    let gt = await getGroupTask(thisId);
                    if (gt.responseCode == '200') {
                        $('.boardList[data-id=' + thisId + ']').click();
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
        let genKeyTask = await getGenerateKey();
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
                    "signature": ct.signature,
                    "keyencrypt": genKeyTask
                },
                "processData": false,
                "body": JSON.stringify(iterateObjectNewEncrypt(body,genKeyTask)),
            }
        }
        let result = await ajaxCall({url:'postGroup',data:settingsGroup,method:'POST',credentialHeader:true,decrypt:true})
        resolve(result);
    });
}

var myBarChart;
var myProjectChart;

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
    if (parseInt(ct.grade) <= 5) {
        chartUsed = 'chartBoardTypeForMe';
    } else {
        chartUsed = 'chartBoardType';
    }

    var ctxB = document.getElementById(chartUsed)
        .getContext('2d');
    myBarChart = new Chart(ctxB, {
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

async function getBarChart(chartName, data, category, idCanvas) {
    var nameArray = new Array();
    var totalArray = new Array();
    var backgroundArray = new Array();
    var borderArray = new Array();
    var labelArray = new Array();
    var barId, labelName;
    var barName = chartName.charAt(0).toUpperCase() + chartName.slice(1);
    var barId = 'chart' + barName
    console.log('barId =>', barId, category)

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
    if (parseInt(ct.grade) <= 5) {
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
            if (idCanvas == 'chartTaskForMe') {
                var ctxB = document.getElementById('chartTaskForMe').getContext('2d');
                myBarChart = new Chart(ctxB, {
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
                        responsive: true,
                        scaleBeginAtZero: true,
                        legendCallback: function (chart) {
                            let htmls = '';
                            for (var i = 0; i < chart.data.datasets[0].data.length; i++) {
                                let colorCheck = lightOrDark(chart.data.datasets[0].backgroundColor[i]);
                                let colorFont;
                                let boardTask = ~category.indexOf('board')
                                let plural;
                                if (boardTask) {
                                    plural = parseInt(chart.data.datasets[0].data[i]) > 1 ? 'boards' : 'board'
                                } else {
                                    plural = parseInt(chart.data.datasets[0].data[i]) > 1 ? 'tasks' : 'task'
                                }
                                if (colorCheck == 'light') colorFont = 'text-dark';
                                else colorFont = 'text-white';
                                htmls += '<div class="card text-white mb-3" style="background:' + chart.data.datasets[0].backgroundColor[i] + '"">' +
                                    '<div class="card-header ' + colorFont + '" style="border-bottom:none;background:unset;font-size:1.0rem;">' + chart.data.labels[i] + '</div>' +
                                    '<div class="card-body text-center pb-3">' +
                                    '<p class="card-text ' + colorFont + '" style="font-size:1.0rem;">' + chart.data.datasets[0].data[i] + ' ' + plural + ' </p>' +
                                    '</div>' +
                                    '</div>';
                            }
                            return htmls;
                        },
                        legend: {
                            display: false
                        },
                    },
                });
                $("#legendPlacePersonal").html(myBarChart.generateLegend());
            } else {
                var ctxB = document.getElementById(idCanvas).getContext('2d');
                myProjectChart = new Chart(ctxB, {
                    type: $('select.chartTypeProject option:selected').val(),
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
                        responsive: true,
                        scaleBeginAtZero: true,
                        legendCallback: function (chart) {
                            let htmls = '';
                            for (var i = 0; i < chart.data.datasets[0].data.length; i++) {
                                let colorCheck = lightOrDark(chart.data.datasets[0].backgroundColor[i]);
                                let colorFont;
                                let boardTask = ~category.indexOf('board')
                                let plural;
                                if (boardTask) {
                                    if (category != 'boardTask')
                                        plural = parseInt(chart.data.datasets[0].data[i]) > 1 ? 'boards' : 'board'
                                    else
                                        plural = parseInt(chart.data.datasets[0].data[i]) > 1 ? 'tasks' : 'task'
                                } else {
                                    plural = parseInt(chart.data.datasets[0].data[i]) > 1 ? 'tasks' : 'task'
                                }
                                if (colorCheck == 'light') colorFont = 'text-dark';
                                else colorFont = 'text-white';
                                htmls += '<div class="card text-white mb-3" style="background:' + chart.data.datasets[0].backgroundColor[i] + '"">' +
                                    '<div class="card-header ' + colorFont + '" style="border-bottom:none;background:unset;font-size:1.0rem;">' + chart.data.labels[i] + '</div>' +
                                    '<div class="card-body text-center pb-3">' +
                                    '<p class="card-text ' + colorFont + '" style="font-size:1.0rem;">' + chart.data.datasets[0].data[i] + ' ' + plural + ' </p>' +
                                    '</div>' +
                                    '</div>';
                            }
                            return htmls;
                        },
                        legend: {
                            display: false
                        },
                    },
                });
                $("#legendPlaceProject").html(myProjectChart.generateLegend());
            }

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