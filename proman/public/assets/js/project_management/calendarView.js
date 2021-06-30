var calendar;
$(async function () {
    $('#wrapper').empty();
    $('#wrapper').removeClass('d-flex');
    $('#wrapper').append(await ajaxCall({
        url: 'calendarView',
        method: 'GET'
    }));
    var calendarEl = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        plugins: ['interaction', 'dayGrid'],
        defaultView: 'dayGridMonth',
        header: {
            left: 'prev',
            center: 'title',
            right: 'next'
        },
        contentHeight: window.innerHeight - 250,
        height: window.innerHeight - 250,
        eventClick: async function (info) {
            activeModalDetailTask(info)
        }
    });
    calendar.render();
    await getCalendarTask();
    $('.filterCalendarLabel').html('Assign to Me')
})

$(document).on('mousewheel', ".fc-scroller:nth-child(1)", function (e) {
    var delta = e.originalEvent.deltaY;

    if (delta > 0) $('button[aria-label="next"]').click(); // going down
    else $('button[aria-label="prev"]').click() // going up

    return false;
});

$(document).on('click', '.goHome', async function () {
    window.location.reload()
})

$(document).on('change', '.filterCalendar', async function () {
    let filters = $('select.filterCalendar option:selected').val();
    calendar.removeAllEvents();
    await getCalendarTask(filters,$('select.filterCalendarStatus option:selected').val())
    $('.filterCalendarLabel').html($('select.filterCalendar option:selected').text())
})

$(document).on('change','.filterCalendarStatus',async function(){
    let filterStatus = $('select.filterCalendarStatus option:selected').val();
    $('.filterCalendarLabelStatus').html($('select.filterCalendarStatus option:selected').text())
    calendar.removeAllEvents();
    await getCalendarTask($('select.filterCalendar option:selected').val(),filterStatus)
})

async function getCalendarTask(category = 'assign',status = 'all') {
    loadingActivated();
    let chAnalytic = await getChartAnalytic({
        category: category,
        name: ct.name,
        type: 'personal'
    })
    loadingDeactivated();
    if (chAnalytic.responseCode == '200') {
        let totalTask = [];
        if(status == 'all') {
            totalTask.push(chAnalytic.data[0].dataPending)
            totalTask.push(chAnalytic.data[0].dataDone)
            totalTask.push(chAnalytic.data[0].dataFixing)
            totalTask.push(chAnalytic.data[0].dataWorking)
            totalTask.push(chAnalytic.data[0].dataStuck)
            totalTask.push(chAnalytic.data[0].dataReview)
        } else if(status == 'Done') totalTask.push(chAnalytic.data[0].dataDone)
        else if(status == 'Pending') totalTask.push(chAnalytic.data[0].dataPending)
        else if(status == 'Working on it') totalTask.push(chAnalytic.data[0].dataWorking)
        else if(status == 'Need to fix') totalTask.push(chAnalytic.data[0].dataFixing)
        else if(status == 'Stuck') totalTask.push(chAnalytic.data[0].dataStuck)
        else if(status == 'Waiting for review') totalTask.push(chAnalytic.data[0].dataReview)

        let merged = [].concat.apply([], totalTask);
        merged.forEach(element => {
            let color = checkColor(element.status);
            calendar.addEvent({
                "id": element._id,
                "title": element.name,
                "groupId": JSON.stringify(element),
                "start": moment(JSON.parse(element.timeline)[0]).format('YYYY-MM-DD'),
                "end": moment(JSON.parse(element.timeline)[1]).format('YYYY-MM-DD'),
                "backgroundColor": color
            });
        });

    } else {
        let param = {
            type: "error",
            text: chAnalytic.responseMessage
        }
        callNotif(param);
    }
}

async function activeModalDetailTask(info) {
    let infoData = JSON.parse(info.event.groupId);
    let groupTaskName;
    let boardName;
    loadingActivated();
    let result = await ajaxCall({url:'getTaskData',method:'GET',credentialHeader:true,extraHeaders:{"param":JSON.stringify({
        '_id': info.event.id,
        'group_id': infoData.group_id
    })},decrypt:true})
    if(result.responseCode == '200') {
        groupTaskName = result.data[0].groupName;
        boardName = result.data[0].boardName;
    } else {
        toastrNotifFull(result.responseMessage,'error')
    }
    loadingDeactivated();
    $('.bodyDetail').empty()
    $('#modalDetailTask').modal({
        show: true
    });
    $('.titleDetail').html(infoData.name);
    $('.modal-header').css('background-color', checkColor(infoData.status))
    $('.updateStatusCalendar ').css('background-color', checkColor(infoData.status))
    let member = '';
    try {
        let parsedMember = JSON.parse(infoData.member)
        for (let i = 0; i < parsedMember.length; i++) {
            if (i == parsedMember.length - 1) member += parsedMember[i].account_name
            else member += parsedMember[i].account_name + ', '
        }
    } catch (error) {

    }
    console.log('infoo', infoData);
    
    let form = `<div class="form-group">
        <label for="board">Board Name</label>
        <input type="text" class="form-control" value="` + boardName + `" readonly>
    </div>
    <div class="form-group">
        <label for="groupName">Group Task Name</label>
        <input type="text" class="form-control" value="` + groupTaskName + `" readonly>
    </div>
    <div class="form-group formPriorityTask">
        <label for="priority">Priority</label>
    </div>
    <div class="form-group formDueDateTask">
        <label for="duedate">Due Date</label>
    </div>
    <div class="form-group">
        <div class="row">
            <div class="col-lg-6 formStartDateTask">
                <label for="timelineStart">Start</label>
                
            </div>
            <div class="col-lg-6 formEndDateTask">
                <label for="timelineEnd">End</label>
            </div>
        </div>
    </div>
    <div class="form-group formStatusTask">
        <label for="status">Status</label>
    </div>
    <div class="form-group">
        <label for="pic">PIC</label>
        <input type="text" class="form-control" value="` + JSON.parse(infoData.pic)[0].account_name + `" readonly>
    </div>
    <div class="form-group">
        <label for="member">Member</label>
        <input type="text" class="form-control" value="` + member + `" readonly>
        <input type="hidden" class="idTask" value=`+infoData._id+` />
        <input type="hidden" class="groupIdTask" value=`+infoData.group_id+` />
    </div>
    <div class="form-group">
        <label for="lastUpdate">Last Updated By</label>
        <input type="text" class="form-control" value="` + infoData.user_update + `" readonly>
    </div>`;
    $('.bodyDetail').append(form)
    if(await checkPic(infoData.user_create_id)){
        $('.formPriorityTask').append(`<select id="priorityTask" class="form-control">
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
        </select>`)
        $("select#priorityTask").val(infoData.priority).change();
        $('.formDueDateTask').append('<input type="date" class="form-control formDueDate" value=' + infoData.due_date + '>');
        $('.formStartDateTask').append('<input type="date" class="form-control formStartDate" value="' + JSON.parse(infoData.timeline)[0] + '">');
        $('.formEndDateTask').append('<input type="date" class="form-control formEndDate" value="' + JSON.parse(infoData.timeline)[1] + '">');
    } else {
        $('.formPriorityTask').append('<input type="text" class="form-control formStatus" value="' + infoData.priority + '" readonly>');
        $('.formDueDateTask').append('<input type="text" class="form-control formDueDate" value=' + infoData.due_date + ' readonly>');
        $('.formStartDateTask').append('<input type="text" class="form-control formStartDate" value="' + JSON.parse(infoData.timeline)[0] + '" readonly>');
        $('.formEndDateTask').append('<input type="text" class="form-control formEndDate" value="' + JSON.parse(infoData.timeline)[1] + '" readonly>');
    }
    if(await checkPic(JSON.parse(infoData.pic)[0].account_id)) {
        $('.formStatusTask').append(`<select id="statusTask" class="form-control">
            <option value="Done">Done</option>
            <option value="Pending">Pending</option>
            <option value="Need to fix">Need to fix</option>
            <option value="Waiting for review">Waiting for review</option>
            <option value="Stuck">Stuck</option>
            <option value="Working on it">Working on it</option>
        </select>`)
    } else {
        $('.formStatusTask').append(`<select id="statusTask" class="form-control">
            <option value="Done" disabled>Done</option>
            <option value="Pending" disabled>Pending</option>
            <option value="Need to fix" disabled>Need to fix</option>
            <option value="Waiting for review">Waiting for review</option>
            <option value="Stuck">Stuck</option>
            <option value="Working on it">Working on it</option>
        </select>`)
    }
    $("select#statusTask").val(infoData.status).change();
}

async function checkPic(accountId){
    if(accountId == ct.id_employee) return true;
    else return false;
}

$(document).on('click','.updateStatusCalendar',async function(){
    let val = $("select#statusTask").val();
    let dueDate = $('.formDueDate').val()
    let dateStart = $('.formStartDate').val();
    let dateEnd = $('.formEndDate').val();
    let priority;
    if($("select#priorityTask").length > 0) {
        priority = $("select#priorityTask").val()
    } else priority = $('.formStatus').val() 
    let dataStat = {
        '_id': $('.idTask').val(),
        'group_id': $('.groupIdTask').val(),
        'status': val,
        'priority': priority,
        'due_date': moment(dueDate).format('YYYY-MM-DD'),
        'name': $('.titleDetail').html(),
        'timeline' : JSON.stringify([moment(dateStart).format('YYYY-MM-DD'), moment(dateEnd).format('YYYY-MM-DD')]),
        'user_update': ct.name,
        'url' : '/proman/employee?groupTaskId=' + $('.groupIdTask').val() + '&taskId=' + $('.idTask').val()
    }
    console.log('aaa',dataStat);
    loadingActivated()
    let res = await globalUpdateTask('status', dataStat);
    if(res.responseCode == '200') {
        $('#modalDetailTask').modal('hide');
        calendar.removeAllEvents();
        await getCalendarTask($('select.filterCalendar option:selected').val(),$('select.filterCalendarStatus option:selected').val())
        loadingDeactivated();
    } else loadingDeactivated();
})

function checkColor(status) {
    let color;
    if (status == 'Done') {
        color = 'limegreen'
    } else if (status == 'Pending') {
        color = 'teal'
    } else if (status == 'Waiting for review') {
        color = 'cadetblue'
    } else if (status == 'Stuck') {
        color = 'red';
    } else if (status == 'Working on it') {
        color = 'orange'
    } else {
        color = 'sienna'
    }
    return color;
}