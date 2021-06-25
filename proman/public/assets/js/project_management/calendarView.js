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
        height: window.innerHeight - 300,
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
    // loadingActivated();
    // let boardData = await getBoard({
    //     group_id: info.event.groupId
    //   }, 'boardId');
    //   console.log('boaa',boardData);
    // loadingDeactivated();
    $('.bodyDetail').empty()
    $('#modalDetailTask').modal({
        show: true
    });
    $('.titleDetail').html(infoData.name);
    $('.modal-header').css('background-color', checkColor(infoData.status))
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
        <label for="priority">Priority</label>
        <input type="text" class="form-control" value="` + infoData.priority + `" readonly>
    </div>
    <div class="form-group">
        <label for="duedate">Due Date</label>
        <input type="text" class="form-control" value=` + infoData.due_date + ` readonly>
    </div>
    <div class="form-group">
        <div class="row">
            <div class="col-lg-6">
                <label for="timelineStart">Start</label>
                <input type="text" class="form-control" value="` + JSON.parse(infoData.timeline)[0] + `" readonly>
            </div>
            <div class="col-lg-6">
                <label for="timelineEnd">End</label>
                <input type="text" class="form-control" value="` + JSON.parse(infoData.timeline)[1] + `" readonly>
            </div>
        </div>
    </div>
    <div class="form-group">
        <label for="status">Status</label>
        <input type="text" class="form-control" value="` + infoData.status + `" readonly>
    </div>
    <div class="form-group">
        <label for="pic">PIC</label>
        <input type="text" class="form-control" value="` + JSON.parse(infoData.pic)[0].account_name + `" readonly>
    </div>
    <div class="form-group">
        <label for="member">Member</label>
        <input type="text" class="form-control" value="` + member + `" readonly>
    </div>`;
    $('.bodyDetail').append(form)
}

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