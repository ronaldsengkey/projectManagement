'use strict'

$(async function () {
    await domTrelloList()
})

async function domTrelloList() {
    let id = $('.boardPlaceHeaderTrello').data('id');
    let boardName = $('.boardPlaceHeaderTrello').data('name');
    let boardData = window['trelloListTask' + id + ''];
    boardData.forEach(element => {
        let camelizeBoard = camelize(element.name);
        let camelizedBoard = camelize(element.name);
        let joinBoardAndId = camelize(element.name) + element.idBoard;
        let menuTemplate = '<div class="row menuRow menuRenameTrello" data-camelized="' + camelizedBoard + '" data-boardname="' + boardName + '" data-name="' + element.name + '" data-boardid=' + element.idBoard + ' data-id=' + element.id + '><div class="col-lg-12"><i class="fas fa-edit"></i>&nbsp;Rename Group</div></div> <div class="row menuRow menuDeleteTrello" data-camelized="' + camelizedBoard + '" data-boardname="' + boardName + '" data-name="' + element.name + '" data-boardid=' + element.idBoard + ' data-id=' + element.id + '><div class="col-lg-12"><i class="fas fa-trash"></i>&nbsp;Delete Group</div></div>';
        let htmlAccordion = '<div class="card mt-3 mb-3" data-parent="parent' + element.id + '" data-boardAidi=' + id + '>' +
            '<div class="card-header" id="' + camelizeBoard + '">' +
            '<div class="row"><div class="col-lg-10">' +
            '<h2 class="mb-0">' +
            '<button class="btn btn-link btn-block text-left toCollapse" type="button" data-toggle="collapse" data-target="#' + joinBoardAndId.replace(/[_\W]+/g, "-").replace(/\s/g, '') + '" aria-expanded="true" aria-controls="' + joinBoardAndId.replace(/[_\W]+/g, "-").replace(/\s/g, '') + '">' +
            element.name + '</button>' +
            '</h2>' +
            '</div><div class="col-lg-2 text-center" style="align-self:center;"><a tabindex="0" class="btnMenu" data-id=' + element.id + ' data-trigger="focus" data-toggle="popover"><i class="menu" data-board="' + element.idBoard + '" data-feather="menu"></i></a></div></div>' +

            '<div id="' + joinBoardAndId.replace(/[_\W]+/g, "-").replace(/\s/g, '') + '" class="collapse" data-id="' + element.id + '" aria-labelledby="' + camelizeBoard + '">' +
            '<div class="card-body p-4" data-id="' + element.id + '">' +
            'Loading...' +
            '</div>'
        '</div>'
        '</div>';
        $('.accordionBoard').append(htmlAccordion);

        $('.btnMenu[data-id=' + element.id + ']').popover({
            trigger: 'focus',
            content: menuTemplate,
            placement: "right",
            html: true
        });

        $('.btnMenu[data-id=' + element.id + ']').on('shown.bs.popover', function () {
            $('.menuRenameTrello').attr('data-id', element.id);
            $('.menuRenameTrello').attr('data-boardid', element.idBoard);
            $('.menuRenameTrello').attr('data-name', element.name);
            $('.menuRenameTrello').attr('data-boardname', boardName);
            $('.menuRenameTrello').attr('data-camelized', camelizedBoard);

            $('.menuDeleteTrello').attr('data-id', element.id);
            $('.menuDeleteTrello').attr('data-name', element.name);
            $('.menuDeleteTrello').attr('data-boardid', element.idBoard);
            $('.menuDeleteTrello').attr('data-boardname', boardName);
            $('.menuDeleteTrello').attr('data-camelized', camelizedBoard);
        })

        $('.collapse[data-id="' + element.id + '"]').on('show.bs.collapse', async function () {
            let idBoard = $(this).data('id');
            $('.card-body[data-id="' + idBoard + '"]').empty();
            $('.card-body[data-id="' + idBoard + '"]').html('Loading...');
            await getCardData(idBoard, element, '');
        });
    });

    feather.replace();
}

async function domCardData(data, id, result) {
    let htmlTask;
    let emptyTable = '<div class="row w-100">' +
        '<div class="progressBar col-12 mb-2" data-id="' + id + '" data-name="' + result.name + '" data-boardid="' + result.idBoard + '"></div>' +
        '</div>' +
        '<table id="table' + id + '" data-header-style="headerStyle" class="borderless table-borderless" data-toggle="table">' +
        '<thead class="text-center">' +
        '<tr>' +
        '<th>Task Name</th>' +
        '<th>Due Date</th>' +
        '<th>Status</th>' +
        '<th>Action</th>' +
        '</tr>' +
        '</thead>' +
        '<tbody class="dataCardTask text-center">' +
        '<tr>' +
        '</tr>' +
        '</tbody>' +
        '</table>';

    $('.card-body[data-id="' + id + '"]').empty();
    if (data.length > 0) {
        $('.card-body[data-id="' + id + '"]').append(emptyTable);
        let progBar = await processStatusBar(data, id);
        let statusClass;
        let textStatus;
        data.forEach(element => {
            let haveStatus;
            if (element.dueComplete == undefined || element.dueComplete == null) haveStatus = 'empty';
            else if (element.dueComplete == false) haveStatus = false;
            else haveStatus = true;

            let haveDuedate = element.due == undefined || element.due == '[]' || element.due.toString() == 'null' ? false : element.due;

            htmlTask = '<tr class="taskRow" data-id="' + element.id + '">';

            htmlTask += '<td class="nameTrello" data-name="' + element.name + '" data-id="' + element.id + '">' + element.name + '</td>';

            if (haveDuedate) {
                haveDuedate = moment(haveDuedate).format('DD MMM YY');
                htmlTask += '<td class="duedateTrello" data-value="' + haveDuedate + '" data-name="' + element.name + '" data-id="' + element.id + '">' + haveDuedate + '</td>';
            } else {
                htmlTask += '<td class="duedateTrello" data-value="no due date" data-name="' + element.name + '" data-id="' + element.id + '">no due date</td>';
            }

            if (!haveDuedate && !haveStatus) {
                htmlTask += '<td class="statusTrello" data-ori="'+element.name+'" data-name="' + element.name.replace(/[_\W]+/g, "-").replace(/\s/g, '') + '" data-groupid="' + element.idList + '" data-identity="stat' + element.id + '" data-status="No Status" data-id="' + element.id + '">No Status Yet</td>';
            } else if (haveStatus != 'empty') {
                if (haveStatus == false) statusClass = 'highPrio', textStatus = 'Not Done';
                else statusClass = 'lowPrio', textStatus = 'Done';
                htmlTask += '<td class="statusTrello ' + statusClass + ' text-white" data-ori="'+element.name+'" data-groupid="' + element.idList + '" data-identity="stat' + element.id + '" data-status="' + textStatus + '" data-name="' + element.name.replace(/[_\W]+/g, "-").replace(/\s/g, '') + '" data-id="' + element.id + '">' + textStatus + '</td>';
            }

            htmlTask += '<td><i class="delTaskTrello" data-status="' + textStatus + '" data-listid="' + element.idList + '" data-name="' + element.name + '" data-feather="trash-2" data-id=' + element.id + '></i></td></tr>';

            $('#table' + id + ' > .dataCardTask').prepend(htmlTask);

            feather.replace();
        });
        $('.progressBar[data-id=' + id + ']').append(progBar);
        feather.replace();
    } else {
        $('.card-body[data-id="' + id + '"]').append(emptyTable);
    }

    $('table[id=table' + id + ']').bootstrapTable({
        columns: [{
            field: 'name',
            title: 'Task Name'
        }, {
            field: 'due_date',
            title: 'Due Date'
        }, {
            field: 'status',
            title: 'Status'
        }, {
            field: 'action',
            title: 'Action'
        }],
    })


    $('table[id=table' + id + ']').removeClass('table-bordered')
}

$(document).on('click', '.menuRenameTrello', function () {
    let renameId = $(this).data('id');
    let renameBoardId = $(this).data('boardid');
    let oldName = $(this).data('name');
    let newName;
    Swal.fire({
        title: 'Change Group Task Name to',
        input: 'text',
        inputValidator: (value) => {
            if (!value) {
                return 'You need to fill the input!'
            } else {
                newName = value;
            }
        },
        inputPlaceholder: oldName,
        showCancelButton: true,
        confirmButtonText: 'Submit',
        showLoaderOnConfirm: true,
        preConfirm: async () => {
            return await renameList(renameId, newName).then(async function (result) {
                if (result.responseCode == '200') {
                    amaranNotifFull(result.responseMessage);
                    $('a[data-id=' + renameBoardId + ']').click();
                    $('#chartSection').remove();
                } else {
                    let param = {
                        type: 'error',
                        text: result.responseMessage
                    };
                    callNotif(param);
                }
            });
        },
        allowOutsideClick: () => !Swal.isLoading()
    })
})

$(document).on('click', '.menuDeleteTrello', function () {
    let deleteId = $(this).data('id');
    let oldName = $(this).data('name');
    let deleteBoardId = $(this).data('boardid');
    Swal.fire({
        title: 'Are you sure to delete\n' + oldName + "\nGroup Task",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Delete it!',
        showLoaderOnConfirm: true,
        preConfirm: async () => {
            return await deleteList(deleteId).then(async function (result) {
                if (result.responseCode == '200') {
                    amaranNotifFull(result.responseMessage);
                    $('a[data-id=' + deleteBoardId + ']').click();
                    $('#chartSection').remove();
                } else {
                    let param = {
                        type: 'error',
                        text: result.responseMessage
                    };
                    callNotif(param);
                }
            });

        },
        allowOutsideClick: () => !Swal.isLoading()
    })
})

$(document).on('click', '.statusTrello', function () {
    let id = $(this).data('id');
    let currentStatus = $(this).data('status');
    let idList = $(this).data('groupid');
    $(this).attr('tabindex', '0');
    $(this).attr('data-toggle', 'popover');
    $(this).attr('data-trigger', 'focus');
    let menuTemplateData = '<div class="row p-2"><div class="col-lg-12 rowStatTrello highPrio text-white">Not Done</div></div> <div class="row p-2"><div class="col-lg-12 rowStatTrello lowPrio text-white">Done</div></div>';
    $(this).popover({
        trigger: 'focus',
        content: menuTemplateData,
        placement: "right",
        html: true
    });

    $(this).on('shown.bs.popover', function () {
        $('.rowStatTrello').attr('data-id', id);
        $('.rowStatTrello').attr('data-current', currentStatus);
        $('.rowStatTrello').attr('data-listid', idList);
        $('.highPrio').attr('data-status', 'Stuck');
        $('.lowPrio').attr('data-status', 'Done');
    })
})

$(document).on('click', '.rowStatTrello', async function () {
    let stat = $(this).data('status');
    let id = $(this).data('id');
    let currentStat = $(this).data('current');
    let listId = $(this).data('listid');
    let name = $('.statusTrello[data-id=' + id + ']').data('ori');

    $('[data-original-title]').popover('dispose');

    $('.statusTrello[data-id=' + id + ']').html(stat);

    if ($('.statusTrello[data-id=' + id + ']').hasClass('highPrio')) {
        $('.statusTrello[data-id=' + id + ']').removeClass('highPrio');
    }

    if ($('.statusTrello[data-id=' + id + ']').hasClass('lowPrio')) {
        $('.statusTrello[data-id=' + id + ']').removeClass('lowPrio');
    }

    switch (stat) {
        case 'Stuck':
            $('.statusTrello[data-id=' + id + ']').addClass('highPrio text-white');
            break;
        case 'Done':
            $('.statusTrello[data-id=' + id + ']').addClass('lowPrio text-white');
            break;
    }
    let dataStat = {
        'cardId': id,
        'dueComplete': stat == 'Done' ? 'true' : 'false',
        'name': name,
    }
    globalUpdateTaskTrello('status', dataStat);
    dataStat['status'] = stat;
    dataStat['listId'] = listId;
    await updateStatusProgressBarTrello(dataStat, currentStat, true);
})

$(document).on('click', '.delTaskTrello', async function () {
    let delId = $(this).data('id');
    let delName = $(this).data('name');
    let listId = $(this).data('listid');
    let currentStat = $(this).data('status')
    let status = $('.statusTrello[data-id=' + delId + ']').data('status');
    // let priority = $('.priority[data-id=' + delId + ']').data('prio');
    let bodyDelete = {
        cardId: delId
    };
    // let bodyProgress = {
    //   _id: delId,
    //   group_id: groupId,
    //   status: status,
    //   priority: priority
    // }
    await notifDeleteTaskTrello(bodyDelete, delName, status, listId, currentStat);
})

async function notifDeleteTaskTrello(bodyDelete, name, status, listId, currentStat) {
    Swal.fire({
        title: 'Are you sure to delete\n' + name + "\nTask",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Delete it!',
        showLoaderOnConfirm: true,
        preConfirm: async () => {
            return await deleteTaskTrello(bodyDelete).then(async function (result) {
                if (result.responseCode == '200') {
                    let param = {
                        type: 'success',
                        text: result.responseMessage
                    };
                    callNotif(param);
                    $('.taskRow[data-id=' + bodyDelete.cardId + ']').remove();
                    bodyDelete['status'] = status;
                    bodyDelete['listId'] = listId;
                    await updateStatusProgressBarTrello(bodyDelete, currentStat, false, true);
                } else {
                    let param = {
                        type: 'error',
                        text: result.responseMessage
                    };
                    callNotif(param);
                }
            });
        },
        allowOutsideClick: () => !Swal.isLoading()
    })
}

async function processStatusBar(data, idGroup) {
    let countTotal = data.length;
    let totalStuck = 0;
    let totalDone = 0;
    let totalNoStatus = 0;
    data.forEach(element => {
        let haveStatus;
        if (element.dueComplete == undefined || element.dueComplete == null) haveStatus = 'empty';
        else if (element.dueComplete == false) haveStatus = false;
        else haveStatus = true;

        let haveDuedate = element.due == undefined || element.due == '[]' || element.due.toString() == 'null' ? false : element.due;

        if (!haveDuedate && !haveStatus || haveStatus == 'empty') {
            totalNoStatus += 1;
        } else if (!haveStatus) {
            totalStuck += 1;
        } else {
            totalDone += 1;
        }
    });

    let doneWidth = (totalDone / countTotal) * 100;
    let stuckWidth = (totalStuck / countTotal) * 100;
    let noStatusWidth = (totalNoStatus / countTotal) * 100;

    let htmlProgress =
        '<div class="row"><div class="col-md-2 col-lg-1" style="align-self:center;">Status </div><div class="col-md-10 col-lg-11"><div class="progress" data-id=' + idGroup + ' style="height: 15px;">' +
        '<div data-identity="Done" data-id=' + idGroup + ' data-toggle="tooltip" data-placement="bottom" title="Done ' + totalDone + '/' + countTotal + '" class="progress-bar progressStatusTrello progress-bar-striped progress-bar-animated lowLabel" role="progressbar" style="width: ' + doneWidth + '%" aria-valuenow=' + totalDone + ' aria-valuemin="0" aria-valuemax=' + countTotal + '>' + doneWidth.toFixed(1) + '%</div>' +
        '<div data-identity="Stuck" data-id=' + idGroup + ' data-toggle="tooltip" data-placement="bottom" title="Stuck ' + totalStuck + '/' + countTotal + '" class="progress-bar progressStatusTrello progress-bar-striped progress-bar-animated highLabel" role="progressbar" style="width: ' + stuckWidth + '%" aria-valuenow=' + totalStuck + ' aria-valuemin="0" aria-valuemax=' + countTotal + '>' + stuckWidth.toFixed(1) + '%</div>' +
        '<div data-identity="No Status" data-id=' + idGroup + ' data-toggle="tooltip" data-placement="bottom" title="No Status ' + totalNoStatus + '/' + countTotal + '" class="progress-bar progressStatusTrello progress-bar-striped progress-bar-animated bg-light" role="progressbar" style="width: ' + noStatusWidth + '%" aria-valuenow=' + totalNoStatus + ' aria-valuemin="0" aria-valuemax=' + countTotal + '>' + noStatusWidth.toFixed(1) + '%</div>' +
        '</div></div></div>';
    return htmlProgress;
}





async function updateStatusProgressBarTrello(data, currentStat, edit = false, deleted = false) {
    if (deleted) {
        // Update the new data
        let updateAriaValueNow = $('.progressStatusTrello[data-id=' + data.listId + '][data-identity="' + data.status + '"]').attr('aria-valuenow');
        let currentArialValueMax = $('.progressStatusTrello[data-id=' + data.listId + '][data-identity="' + data.status + '"]').attr('aria-valuemax');
        let updatedArialValue = parseInt(updateAriaValueNow) - 1;
        let updateMaxArial = parseInt(currentArialValueMax) - 1;
        $('.progressStatusTrello[data-id=' + data.listId + '][data-identity="' + data.status + '"]').attr('aria-valuenow', updatedArialValue);
        $('.progressStatusTrello[data-id=' + data.listId + '][data-identity="' + data.status + '"]').attr('aria-valuemax', updateMaxArial);
        let updatedWidthNew = (updatedArialValue / updateMaxArial) * 100;
        $('.progressStatusTrello[data-id=' + data.listId + '][data-identity="' + data.status + '"]').html(updatedWidthNew.toFixed(1) + '%');
        $('.progressStatusTrello[data-id=' + data.listId + '][data-identity="' + data.status + '"]').css('width', updatedWidthNew + '%');
        $('.progressStatusTrello[data-id=' + data.listId + '][data-identity="' + data.status + '"]').attr('title', data.status + ' ' + updatedArialValue + '/' + updateMaxArial);

        $('.status[data-identity="stat' + data._id + '"]').attr('data-status', data.status);
        $('.status[data-identity="stat' + data._id + '"]').data('status', data.status);

        $('.progressStatusTrello[data-id=' + data.listId + '][data-identity!="' + data.status + '"]').each(function (e) {
            //update all max value
            let thisArialValueMax = $(this).attr('aria-valuemax');
            let updatedthisArialValueMax = parseInt(thisArialValueMax) - 1;
            $(this).attr('aria-valuemax', updatedthisArialValueMax)

            //update current value if > 0
            let thisArialValueNow = $(this).attr('aria-valuenow');

            if (parseInt(thisArialValueNow) > 0) {
                let newWidth = ((parseInt(thisArialValueNow) / parseInt(updatedthisArialValueMax)) * 100).toFixed(1);
                $(this).html(newWidth + '%');
                $(this).css('width', newWidth + '%');
                $(this).attr('title', $(this).data('identity') + ' ' + thisArialValueNow + '/' + updatedthisArialValueMax);
            } else {
                // update label
                $(this).attr('title', $(this).data('identity') + ' ' + thisArialValueNow + '/' + updatedthisArialValueMax);
            }

        })

    } else if (edit) {
        if(currentStat == 'Not Done') currentStat = 'Stuck';
        //Update the old data
        let updateAriaValueNowForOldData = $('.progressStatusTrello[data-id=' + data.listId + '][data-identity="' + currentStat + '"]').attr('aria-valuenow');
        let currentArialValueMaxForOldData = $('.progressStatusTrello[data-id=' + data.listId + '][data-identity="' + currentStat + '"]').attr('aria-valuemax');
        let updatedArialValueForOldData = parseInt(updateAriaValueNowForOldData) - 1;
        $('.progressStatusTrello[data-id=' + data.listId + '][data-identity="' + currentStat + '"]').attr('aria-valuenow', updatedArialValueForOldData);
        let updatedWidthNewForOldData = (updatedArialValueForOldData / currentArialValueMaxForOldData) * 100;
        $('.progressStatusTrello[data-id=' + data.listId + '][data-identity="' + currentStat + '"]').html(updatedWidthNewForOldData.toFixed(1) + '%');
        $('.progressStatusTrello[data-id=' + data.listId + '][data-identity="' + currentStat + '"]').css('width', updatedWidthNewForOldData + '%');
        $('.progressStatusTrello[data-id=' + data.listId + '][data-identity="' + currentStat + '"]').attr('title', currentStat + ' ' + updatedArialValueForOldData + '/' + currentArialValueMaxForOldData);


        // Update the new data
        let updateAriaValueNow = $('.progressStatusTrello[data-id=' + data.listId + '][data-identity="' + data.status + '"]').attr('aria-valuenow');
        let currentArialValueMax = $('.progressStatusTrello[data-id=' + data.listId + '][data-identity="' + data.status + '"]').attr('aria-valuemax');
        let updatedArialValue = parseInt(updateAriaValueNow) + 1;
        $('.progressStatusTrello[data-id=' + data.listId + '][data-identity="' + data.status + '"]').attr('aria-valuenow', updatedArialValue);
        let updatedWidthNew = (updatedArialValue / currentArialValueMax) * 100;
        $('.progressStatusTrello[data-id=' + data.listId + '][data-identity="' + data.status + '"]').html(updatedWidthNew.toFixed(1) + '%');
        $('.progressStatusTrello[data-id=' + data.listId + '][data-identity="' + data.status + '"]').css('width', updatedWidthNew + '%');
        $('.progressStatusTrello[data-id=' + data.listId + '][data-identity="' + data.status + '"]').attr('title', data.status + ' ' + updatedArialValue + '/' + currentArialValueMax);

        $('.statusTrello[data-identity="stat' + data.cardId + '"]').attr('data-status', data.status);
        $('.statusTrello[data-identity="stat' + data.cardId + '"]').data('status', data.status);

        if (data.status == 'Stuck') $('.statusTrello[data-identity="stat' + data.cardId + '"]').html('Not Done');
    }

}