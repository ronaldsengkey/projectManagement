'use strict'

$(document).on('mousewheel','#legendOnly',scrollHorizontally)

function scrollHorizontally(e) {
  e = window.event || e;
  var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
  document.getElementById('legendOnly').scrollLeft -= (delta*40); // Multiplied by 40
}

async function appendLegend(id){
  let gridTag = '<div class="container-fluid"><div id="legendOnly" class="row flex-row flex-nowrap legendOnly legend'+id+'" style="overflow-x:auto;white-space:nowrap;">';
  
  if(window['dataBoardMember' + id + ''].length > 3){
    let lengthLeft = parseInt(window['dataBoardMember'+id].length) - 3
    window['legendLeft'+id] = objDiff(window['dataBoardMember'+id],window['dataBoardMember'+id].slice(0,3));
    window['dataBoardMember'+id].slice(0,3).forEach(function(e){
      let checkColor = lightOrDark(e.color);
      let colorFont;
      if(checkColor == 'light') colorFont = 'text-dark fontWeight400';
      else colorFont = 'text-white';
      gridTag += '<div class="col-2"><div data-toggle="tooltip" data-placement="bottom" title="' + e.account_name + '" class="picLogo '+colorFont+' mr-0" style="width:40px;background:'+e.color+';">'+getInitials(e.account_name)+'</div></div>';
    })
    gridTag += '<div class="col-2 moreLegend" data-id='+id+'><div data-toggle="tooltip" data-placement="bottom" title="view more" style="width:40px;background:lightgrey;" class="picLogo mr-0 position-relative"><i class="fas fa-ellipsis-h"></i><span class="badge rounded-pill badge-notification bg-danger legendBadge">'+ lengthLeft+'</span></div></div>';
  } else {
    window['dataBoardMember' + id + ''].forEach(function(e){
      let checkColor = lightOrDark(e.color);
      let colorFont;
      if(checkColor == 'light') colorFont = 'text-dark fontWeight400';
      else colorFont = 'text-white';
      // gridTag += '<div class="text-center"><span class="picLogo '+colorFont+' mr-0" style="background:'+e.color+';">'+getInitials(e.account_name)+'</span><div class="align-self-center mt-2">'+e.account_name+'</div></div>';
      gridTag += '<div class="col-2"><div data-toggle="tooltip" data-placement="bottom" title="' + e.account_name + '" class="picLogo '+colorFont+' mr-0" style="width:40px;background:'+e.color+';">'+getInitials(e.account_name)+'</div></div>';
    })
  }
  gridTag += '</div></div>';
  // $(gridTag).insertBefore($('.accordionBoard'))
  $(gridTag).appendTo($('.memberAvatar'+id));
}

function createdByIcon(user,id,boardType,pinned = false){
  if(boardType != 'Private'){
    return '<div class="row"><div class="col-lg-12">Created by '+user+'</div></div>';
  } else {
    if(user == ct.name){
      if(!pinned){
        let html;
        window['dataBoardMember' + id + ''].forEach(element => {
          if(element.account_name == ct.name){
            let checkColor = lightOrDark(element.color);
            let colorFont;
            if(checkColor == 'light') colorFont = 'text-dark fontWeight400';
            else colorFont = 'text-white';
            html = '<div class="row"><div class="col-lg-9 align-self-center">Created By </div><div class="col-lg-3"><div data-toggle="tooltip" data-placement="bottom" title="' + element.account_name + '" class="picLogo '+colorFont+' mr-0" style="width:40px;background:'+element.color+';">'+getInitials(element.account_name)+'</div></div></div>'
          }
        });
        if(html != undefined)
        return html;
        else return '<div class="row"><div class="col-lg-12">Created by '+user+'</div></div>';
      } else {
        let html;
        if(window['picColor'+ct.id_employee] != undefined)
        html = '<div class="row"><div class="col-lg-9 align-self-center">Created By </div><div class="col-lg-3"><div data-toggle="tooltip" data-placement="bottom" title="' + user + '" class="picLogo '+window['picColorClass'+ct.id_employee]+' mr-0" style="width:40px;background:'+window['picColor'+ct.id_employee]+';">'+getInitials(user)+'</div></div></div>'
        else if(window['color'+ct.id_employee] != undefined)
        html = '<div class="row"><div class="col-lg-9 align-self-center">Created By </div><div class="col-lg-3"><div data-toggle="tooltip" data-placement="bottom" title="' + user + '" class="picLogo '+window['colorClass'+ct.id_employee]+' mr-0" style="width:40px;background:'+window['color'+ct.id_employee]+';">'+getInitials(user)+'</div></div></div>'
        else
        html = '<div class="row"><div class="col-lg-9 align-self-center">Created By </div><div class="col-lg-3"><div data-toggle="tooltip" data-placement="bottom" title="' + user + '" class="picLogo text-white mr-0" style="width:40px;background:'+getRandomColor()+';">'+getInitials(user)+'</div></div></div>'
        return html;
      }
    } else {
      return '<div class="row"><div class="col-lg-12">Created by '+user+'</div></div>';
    }
  }
}

async function domBoardContent() {
  let id = $('#addGroupTask').data('id');
  let boardName = $('#addGroupTask').data('boardname');
  let camelizedBoard = $('#addGroupTask').data('concern');
  let boardType = $('#addGroupTask').data('boardtype');
  let boardMember = window['groupTask' + id + ''];
  if(boardType == 'Private') await appendLegend(id);
  try {
    JSON.parse(localStorage.getItem('favList')).forEach(element => {
      window['groupTask' + id + ''].some((item, idx) => 
        item._id == element.id  && 
        window['groupTask' + id + ''].unshift( 
          window['groupTask' + id + ''].splice(idx,1)[0] 
        ) 
      )
    });
  } catch (error) {

  }

  window['groupTask' + id + ''].forEach(element => {
    try{
      if(boardType == 'Private'){
        window['dataBoardMember' + id + ''].forEach(element2 => {
          window['color'+element2.account_id] = element2.color;
          window['colorName'+element2.account_name] = element2.color;
          let colorCheck = lightOrDark(element2.color);
          if(colorCheck == 'light') window['colorClass'+element2.account_id] = 'text-dark fontWeight400';
          else window['colorClass'+element2.account_id] = 'text-white';
        });
      } else {
        window['color'+JSON.parse(element.pic)[0].account_id] = getRandomColor();
        window['colorClass'+JSON.parse(element.pic)[0].account_id] = '';
        let colorCheck = lightOrDark(window['color'+JSON.parse(element.pic)[0].account_id]);
        if(colorCheck == 'light') window['colorClass'+JSON.parse(element.pic)[0].account_id] = 'text-dark fontWeight400';
        else window['colorClass'+JSON.parse(element.pic)[0].account_id] = 'text-white';

      }
    }catch(e){
      console.log('catch color define');
    }

    let involved = JSON.parse(element.involved);
    let pic = JSON.parse(element.pic);
    let showGroupTask = false;
    if(involved.length == 0){
      if(boardType == 'Main') showGroupTask = true;
      else if(boardType == 'Private' &&  (pic[0].account_id == ct.id_employee || element.user_create == ct.name)) showGroupTask = true;
    } else {
      involved.forEach(elements => {
        if(elements.account_id == ct.id_employee || pic[0].account_id == ct.id_employee || element.user_create == ct.name || boardType == 'Main') showGroupTask = true;
      });
    }

    let doneGT;
    if(element.user_create == ct.name ||  pic[0].account_id == ct.id_employee ) doneGT = true;
    else doneGT = false;

    let colorDone;
    let classDone;

    if(element.status == 'false') colorDone = 'black'
    else {
      classDone = 'classDone'
      colorDone = 'green'
    } 

    if(showGroupTask){
      let camelizeBoard = camelize(element.name);
      // let joinBoardAndId = camelize(element.name) + element.board_id;
      let menuTemplate = '<div class="row menuRow menuRename" data-camelized="' + camelizedBoard + '" data-boardname="' + boardName + '" data-name="' + element.name + '" data-boardid=' + element.board_id + ' data-id=' + element._id + '><div class="col-lg-12"><i class="fas fa-edit"></i>&nbsp;Rename Group</div></div> <div class="row menuRow menuDelete" data-camelized="' + camelizedBoard + '" data-boardname="' + boardName + '" data-name="' + element.name + '" data-boardid=' + element.board_id + ' data-id=' + element._id + '><div class="col-lg-12"><i class="fas fa-trash"></i>&nbsp;Delete Group</div></div>';
      let htmlAccordion = '<div class="card mt-3 mb-3 cardGroupTask '+classDone+'" data-name="'+element.name+'"  id="cardGT' + element._id + '" data-boardtype=' + boardType + ' data-parent="parent' + element._id + '" data-boardAidi=' + id + '>' +
        '<div class="card-header" id="' + camelizeBoard + '">' +
        '<div class="row"><div class="col-lg-8">' +
        '<h2 class="mb-0">' +
        '<button class="btn btn-link btn-block text-left toCollapse headerGT" data-id='+element._id+' type="button" data-toggle="collapse" data-target="#kolap' + element._id + '" aria-expanded="true" aria-controls="kolap' + element._id + '">' +
        '<span class="picLogo" style="background:'+window['color'+JSON.parse(element.pic)[0].account_id]+'" data-toggle="tooltip" data-placement="bottom" title="' + JSON.parse(element.pic)[0].account_name + '"><span class="'+window['colorClass'+JSON.parse(element.pic)[0].account_id]+'">' + getInitials(JSON.parse(element.pic)[0].account_name) + '</span></span>' + element.name + 
        '</button>' +
        '</h2>' +
        '</div>'+
        '<div class="col-lg-2 text-right" style="align-self:center;">'+createdByIcon(element.user_create,id,boardType)+'</div>'+
        '<div class="col-lg-2 text-center placeTools" data-id='+element._id+' style="align-self:center;"><a tabindex="0" class="btnMenu" data-owner="'+element.user_create+'" data-pic='+JSON.parse(element.pic)[0].account_id+' data-name="' + element.name + '" data-boardid=' + element.board_id + ' data-id=' + element._id + ' data-camelized="'+camelizedBoard+'" data-boardname="' + boardName + '"><i class="fas fa-bars fa-lg menu" data-board="' + element.board_id + '"></i></a><a tabindex="0" class="btnFavorites ml-4" data-from="general" data-all="'+window.btoa(JSON.stringify(element))+'" data-toggle="tooltip" data-placement="right" data-name="' + element.name + '" data-id=' + element._id + '><i class="fas fa-thumbtack fa-lg favGT" data-id='+element._id+'></i></a></div></div>'+
        
        '<div id="kolap' + element._id + '" class="collapse" data-id="' + element._id + '" aria-labelledby="' + camelizeBoard + '">' +
        '<div class="card-body p-4 cardStatusGT" data-id="' + element._id + '" data-statusGT='+element.status+'>' +
        'Loading...' +
        '</div>'
      '</div>'
      '</div>';
      $('.accordionBoard').append(htmlAccordion);

      try {
        JSON.parse(localStorage.getItem('favList')).forEach(elements => {
          if(elements.id == element._id){
            $('.favGT[data-id='+element._id+']').css('color','orange');
          }
        });
        if($('.favGT[data-id='+element._id+']').css('color') == 'rgb(255, 165, 0)' || $('.favGT[data-id='+element._id+']').css('color') == 'orange'){
          $('.btnFavorites[data-id='+element._id+']').attr('title','Unpin ' + element.name)
        } else {
          $('.btnFavorites[data-id='+element._id+']').attr('title','Pin ' + element.name)
        } 
      } catch (error) {
        
      }

      if(doneGT){
        $('.placeTools[data-id='+element._id+']').prepend('<a tabindex="0" data-boardid=' + element.board_id + ' class="btnDoneGT mr-4" data-status='+element.status+' data-toggle="tooltip" data-placement="right" data-name="' + element.name + '" data-id=' + element._id + '><i class="fas fa-check fa-lg doneGT" style="color:'+colorDone+'"" data-id='+element._id+'></i></a>')
        if(element.status == 'false') $('.btnDoneGT[data-id='+element._id+']').attr('title','Done ' + element.name)
        else $('.btnDoneGT[data-id='+element._id+']').attr('title','Undone ' + element.name)
      }

      $('.collapse[data-id="' + element._id + '"]').on('show.bs.collapse', async function () {
        let idBoard = $(this).data('id');
        $('.card-body[data-id="' + idBoard + '"]').empty();
        $('.card-body[data-id="' + idBoard + '"]').html('Loading...');
        await getTaskData(idBoard, element, boardMember);
      });
    }
  });

  if($('.accordionBoard').children().length > 0){
    let searchTask = '<div class="d-block searchShortcut" style="margin: 0 auto; width: 25%;">'+
      '<div class="md-form input-group mb-5">'+
        '<input type="text" class="form-control searchGT" placeholder="Search Group Task" />'+
        '<div class="input-group-prepend">'+
          '<span class="input-group-text md-addon" id="material-addon1"><i class="fas fa-search" aria-hidden="true"></i></span>'+
        '</div>'+
      '</div>'+
    '</div>';
    $(searchTask).prependTo($('.accordionBoard'))
  }
}

$('#modalOptions').on('hidden.bs.modal', function (e) {
  $('#modalOptions').removeClass('d-flex')
})

function activeModalGroupTask() {
  $('#modalOptions').modal({
      show: true,
  });
  $('#modalOptions').addClass('d-flex')
}

async function domTaskTable(data, id, result, boardMember) {
  let htmlTask;
  let emptyTable = '<div class="row w-100">' +
    '<div class="progressBar col-12 mb-2" data-id="' + id + '" data-name="' + result.name + '" data-boardid="' + result.board_id + '"></div>'+
    '<div class="progressBarPrio col-12 mb-3" data-id="' + id + '" data-name="' + result.name + '" data-boardid="' + result.board_id + '"></div>' +
    '</div>' +
    '<table id="table' + id + '" data-header-style="headerStyle" class="borderless table-borderless" data-toggle="table" data-type="'+result.boardType+'">' +
    '<thead class="text-center">' +
    '<tr>' +
    '<th>Task Name</th>' +
    '<th>PIC</th>' +
    '<th>Team</th>' +
    '<th>Status</th>' +
    '<th>Priority</th>' +
    '<th>Due Date</th>' +
    '<th>Timeline</th>' +
    '<th>Attachment</th>' +
    '<th>Sync</th>' +
    '<th>Action</th>' +
    '</tr>' +
    '</thead>' +
    '<tbody class="dataTask text-center" data-id="'+id+'">' +
    '<tr>' +
    '<td class="newTask" data-id="' + id + '" data-name="' + result.name + '" data-boardid="' + result.board_id + '" colspan="10">+ Add Task</td>' +
    '</tr>' +
    '</tbody>' +
    '</table>';
  $('.card-body[data-id="' + id + '"]').empty();

  if (data.length > 0) {
    $('.card-body[data-id="' + id + '"]').append(emptyTable);
    let progBar = await processProgressBar(data, id);
    let progPrioBar = await processProgressBarPrio(data, id);
    data.forEach(element => {
      let havePriority = element.priority == undefined ||  element.priority.toString() == 'null' ? false : element.priority;

      let priorityClass;

      let haveStatus = element.status == undefined ||  element.status.toString() == 'null' ? false : element.status;
      
      let statusClass;

      let haveTimeline = element.timeline == undefined || element.timeline == '[]' || element.timeline.toString() == 'null'? false : element.timeline;

      let haveFile = element.file == undefined || element.file == '[]' || element.file.toString() == 'null'? false : element.file;

      let haveDuedate = element.due_date == undefined || element.due_date == '[]' || element.due_date.toString() == 'null' ? false : element.due_date;

      let havePic = element.pic == undefined || element.pic == '[]' || element.pic.toString() == 'null' ? false : element.pic;

      let haveTeam = element.member == undefined || element.member == '[]' || element.member.toString() == 'null' ? false : element.member;

      let haveComment = element.comment == undefined || element.comment == '0' ? false : element.comment;

      let haveSync = element.isSync == undefined ||  element.isSync.toString() == 'null' ? false : element.isSync;

      let syncId;
      try {
        syncId =  JSON.parse(element.syncId)
      } catch (error) {
        syncId = element.syncId
      }
      let bools = false;
      let trueSync = syncId.filter(function(e){ 
        if(e == ct.id_employee) {
          bools = true;
        }
        return bools;
      })

      htmlTask = '<tr class="taskRow" data-board="'+id+'" data-id="' + element._id + '" data-member=' + JSON.stringify(boardMember) + '>';

      htmlTask += '<td class="name" data-name="' + htmlEntities(element.name) + '" data-groupid="' + element.group_id + '" data-id="' + element._id + '">' + element.name + '</td>';

      if (havePic) {
        window['picTask' + element._id + ''] = element.pic;
        try {
          let colorCheck = lightOrDark(window['color'+JSON.parse(element.pic)[0].account_id]);
          if(window['color'+JSON.parse(element.pic)[0].account_id] == undefined){
            window['color'+JSON.parse(element.pic)[0].account_id] = getRandomColor()
            colorCheck = lightOrDark(window['color'+JSON.parse(element.pic)[0].account_id]);
          }
          if(colorCheck == 'light') window['colorClass'+JSON.parse(element.pic)[0].account_id] = 'text-dark fontWeight400';
          else window['colorClass'+JSON.parse(element.pic)[0].account_id] = 'text-white';
        } catch (error) {
          window['colorClass'+JSON.parse(element.pic)[0].account_id] = 'text-white';
        }
        htmlTask += '<td class="picPlace"><div class="memberLogo pic" data-name="' + element.name + '" data-groupid="' + element.group_id + '" data-id="' + element._id + '" style="background:'+window['color'+JSON.parse(element.pic)[0].account_id]+'" data-toggle="tooltip" data-placement="bottom" title="' + JSON.parse(element.pic)[0].account_name + '"><span class="initialPic '+window['colorClass'+JSON.parse(element.pic)[0].account_id]+'">' + getInitials(JSON.parse(element.pic)[0].account_name) + '</span></div></td>';
      } else {
        htmlTask += '<td class="picPlace"><i class="icon_user far fa-user fa-lg pic" data-name="' + element.name + '" data-groupid="' + element.group_id + '" data-id="' + element._id + '" data-id="' + element._id + '"></i></td>';
      }

      if (haveTeam) {
        window['dataCurrentTeam' + element._id + ''] = element;
        let htmlTeamDom = processTeamData(window['dataCurrentTeam' + element._id]);
        htmlTask += '<td class="teamTD"><div class="row"><div class="col-lg-12 colTeam justify-content-center" data-id=' + element._id + ' style="display:flex;"><i data-id=' + element._id + ' class="addTeamIcon fas fa-plus fa-lg d-none team" data-team="true" data-name="' + element.name + '" data-groupid="' + element.group_id + '" data-id="' + element._id + '"></i>' + htmlTeamDom + '</div></div></td>';
      } else {
        window['dataCurrentTeam' + element._id + ''] = [];
        htmlTask += '<td class="teamTD"><div class="colTeam"><i class="icon_team far fa-user fa-lg team" data-team="false" data-name="' + element.name + '" data-groupid="' + element.group_id + '" data-id="' + element._id + '"></i></div></td>';
      }

      if (haveStatus) {
        if (haveStatus == 'Working on it') statusClass = 'mediumPrio'
        else if (haveStatus == 'Stuck') statusClass = 'highPrio'
        else if (haveStatus == 'Waiting for review') statusClass = 'reviewStat'
        else if (haveStatus == 'Pending') statusClass = 'pendingPrio'
        else if (haveStatus == 'Need to fix') statusClass = 'fixPrio'
        else statusClass = 'lowPrio';

        let dataPic = 0;
        if(havePic) dataPic = JSON.parse(element.pic)[0].account_id
        htmlTask += '<td class="status"><div data-gtpic='+JSON.parse(result.pic)[0].account_id+' data-pic='+dataPic+' data-identity="stat' + element._id + '" data-status="' + haveStatus + '" data-name="' + element.name + '" data-groupid="' + element.group_id + '" data-id="' + element._id + '" class="statusChild ' + statusClass + ' text-white">' + haveStatus + '</div></td>';
      } else {
        htmlTask += '<td class="status" data-name="' + element.name + '" data-identity="stat' + element._id + '" data-status="No Status" data-groupid="' + element.group_id + '" data-id="' + element._id + '">No Status Yet</td>';
      }

      if (havePriority) {
        if (havePriority == 'Urgent') priorityClass = 'urgentPrio'
        else if (havePriority == 'High') priorityClass = 'highPrio'
        else if (havePriority == 'Medium') priorityClass = 'mediumPrio'
        else priorityClass = 'lowPrio';
        htmlTask += '<td class="priority"><div data-identity="prio' + element._id + '" data-prio="' + havePriority + '" data-name="' + element.name + '" data-groupid="' + element.group_id + '" data-id="' + element._id + '" class="priorityChild ' + priorityClass + ' text-white">' + havePriority + '</div></td>';
      } else {
        htmlTask += '<td class="priority" data-name="' + element.name + '" data-identity="prio' + element._id + '" data-prio="No Priority" data-groupid="' + element.group_id + '" data-id="' + element._id + '">no priority</td>';
      }

      if (haveDuedate) {
        haveDuedate = moment(haveDuedate).format('DD MMM YY');
        htmlTask += '<td class="duedate" data-value="' + haveDuedate + '" data-name="' + element.name + '" data-groupid="' + element.group_id + '" data-id="' + element._id + '">' + haveDuedate + '</td>';
      } else {
        htmlTask += '<td class="duedate" data-value="no due date" data-name="' + element.name + '" data-groupid="' + element.group_id + '" data-id="' + element._id + '">no due date</td>';
      }


      if (haveTimeline) {
        haveTimeline = JSON.parse(haveTimeline);
        haveTimeline[0] = moment(haveTimeline[0]).format('DD MMM YY');
        haveTimeline[1] = moment(haveTimeline[1]).format('DD MMM YY');
        htmlTask += '<td class="timeline" data-value="' + haveTimeline[0] + ' - ' + haveTimeline[1] + '" data-name="' + element.name + '" data-groupid="' + element.group_id + '" data-id="' + element._id + '">' + haveTimeline[0] + ' - ' + haveTimeline[1] + '</td>'
      } else {
        htmlTask += '<td class="timeline" data-value="no timeline" data-name="' + element.name + '" data-groupid="' + element.group_id + '" data-id="' + element._id + '">no timeline</td>';
      }

      if(haveFile){
        let fileCount = JSON.parse(element.file).length
        window['fileAttachment'+element._id] = JSON.parse(element.file);
        htmlTask += '<td class="fileAttachment"><div class="position-relative"><i class="far fa-file-alt fa-lg fileAttach" data-id=' + element._id + ' data-groupid="' + element.group_id + '"></i><span class="badge rounded-pill badge-notification bg-danger badgeAttachment">'+fileCount+'</span></div></td>';
      } else {
        htmlTask += '<td>-</td>';
      }

      if(haveSync && bools){
        htmlTask += '<td><i style="color:green;" class="fas fa-lg fa-check"></i></td>';
      } else {
        htmlTask += '<td><i style="cursor:pointer;" class="fas fa-lg fa-sync syncGoogle" data-groupid="' + element.group_id + '" data-id=' + element._id + '></i></td>';
      }

      if (haveComment) {
        window['dataComment' + element._id + ''] = "[]";
        if (haveTeam) window['dataCommentTeam' + element.group_id + ''] = element.member
        else window['dataCommentTeam' + element.group_id + ''] = [];
        htmlTask += '<td><i style="cursor:pointer;" class="fas fa-lg fa-share shareLink mr-2" data-boardid='+result.board_id+' data-name="'+element.name+'" data-groupid='+element.group_id+' data-id="' + element._id + '"></i><label style="cursor:pointer;" class="lblAttach mr-2" data-id='+element._id+' for="fileAttachData'+element._id+'"><i class="fas fa-lg fa-paperclip" data-groupid='+element.group_id+' data-id="' + element._id + '"></i><input accept=".doc,.docx,application/pdf,.xlsx,.xls,image/x-png,image/jpeg" data-id=' + element._id + ' data-groupid='+element.group_id+' id="fileAttachData'+element._id+'" class="d-none fileAttachData" multiple type="file" /></label><i style="cursor:pointer;color:orange;" class="commentTask far fa-lg fa-comment mr-2" data-available="true" data-groupid=' + element.group_id + ' data-toggle="modal" data-target="#commentModal" data-name="' + element.name + '" data-id=' + element._id + '></i><i style="cursor:pointer;" class="delTask fas fa-trash fa-lg" data-groupid="' + element.group_id + '" data-name="' + element.name + '" data-id=' + element._id + '></i></td></tr>';
      } else {
        window['dataComment' + element._id + ''] = [];
        if (haveTeam) window['dataCommentTeam' + element.group_id + ''] = element.member
        else window['dataCommentTeam' + element.group_id + ''] = [];
        htmlTask += '<td><i style="cursor:pointer;" class="fas fa-lg fa-share shareLink mr-2" data-boardid='+result.board_id+' data-name="'+element.name+'" data-groupid='+element.group_id+' data-id="' + element._id + '"></i><label style="cursor:pointer;" class="lblAttach mr-2" data-id='+element._id+' for="fileAttachData'+element._id+'"><i class="fas fa-lg fa-paperclip" data-groupid='+element.group_id+' data-id="' + element._id + '"></i><input accept=".doc,.docx,application/pdf,.xlsx,.xls,image/x-png,image/jpeg" data-id=' + element._id + ' data-groupid='+element.group_id+' id="fileAttachData'+element._id+'" class="d-none fileAttachData" multiple type="file" /></label><i style="cursor:pointer;" class="commentTask far fa-lg fa-comment mr-2" data-available="false" data-groupid=' + element.group_id + ' data-toggle="modal" data-target="#commentModal" data-name="' + element.name + '" data-id=' + element._id + '></i><i style="cursor:pointer;" class="delTask fas fa-trash fa-lg" data-groupid="' + element.group_id + '" data-name="' + element.name + '" data-id=' + element._id + '></i></td></tr>';
      }

      // if board type is main and pic of group task is not user logged in then everyone can see tasks
      if($('#table'+id).attr('data-type') == 'Main'){
        $('#table' + id + ' > .dataTask').prepend(htmlTask);
      }
      
      //if pic of group task is login user then he / she is allowed to edit tasks
      if(JSON.parse(result.pic)[0].account_id == ct.id_employee && $('#table'+id).attr('data-type') != 'Main'){
        result.condition = true;
        $('#table' + id + ' > .dataTask').prepend(htmlTask);
      } else if(result.user_create == ct.name && $('#table'+id).attr('data-type') != 'Main'){
        $('#table' + id + ' > .dataTask').prepend(htmlTask);
      }

      //if pic of task is login user then he / she is allowed to edit tasks
      if(havePic && JSON.parse(element.pic)[0].account_name == ct.name && result.user_create != ct.name){
        result.condition = true;
        $('#table' + id + ' > .dataTask').prepend(htmlTask);
        // pic only allowed to edit status and priority
        $('.delTask[data-id='+element._id+']').addClass('disableInputInside');
        // $('.lblAttach[data-id='+element._id+']').addClass('disableInputInside');
        $('.taskRow[data-id=' + element._id + ']').children().each((index, element) =>{
          if($(element).attr('class') == 'picPlace' || $(element).attr('class') == 'team') {
            $('td.'+$(element).attr('class')).addClass('disableInputClick')
          }
          else if($(element).attr('class') != 'status' && $(element).attr('class') != 'fileAttachment'){
            $('td.'+$(element).attr('class')).addClass('disableInputInside')
          }
        })
      } 

      //only if login user is part of member that is allowed to see his/her own task
      if(havePic){
        if(haveTeam && JSON.parse(element.pic)[0].account_name != ct.name && JSON.parse(result.pic)[0].account_id != ct.id_employee && result.user_create != ct.name && $('#table'+id).attr('data-type') != 'Main'){
          let member = element.member;
          member.forEach(elements => {
            if(elements.account_id == ct.id_employee){
              result.condition = true;
              $('#table' + id + ' > .dataTask').prepend(htmlTask);
              $('.priority[data-id='+element._id+']').addClass('disableInputInside')
              $('.delTask[data-id='+element._id+']').addClass('disableInputInside');
              // $('.lblAttach[data-id='+element._id+']').addClass('disableInputInside');
              $('.taskRow[data-id=' + element._id + ']').children().each((index, element) =>{
                if($(element).attr('class') == 'picPlace' || $(element).attr('class') == 'teamTD') {
                  $('td.'+$(element).attr('class')).addClass('disableInputClick')
                }
                else if($(element).attr('class') != 'status' && $(element).attr('class') != 'fileAttachment'){
                  $('td.'+$(element).attr('class')).addClass('disableInputInside')
                }
                
              })
            }
          });
        }
      } else {
        if(haveTeam && JSON.parse(result.pic)[0].account_id != ct.id_employee && result.user_create != ct.name && $('#table'+id).attr('data-type') != 'Main'){
          let member = element.member;
          member.forEach(elements => {
            if(elements.account_id == ct.id_employee){
              result.condition = true;
              $('#table' + id + ' > .dataTask').prepend(htmlTask);
              $('.priority[data-id='+element._id+']').addClass('disableInputInside')
              $('.delTask[data-id='+element._id+']').addClass('disableInputInside');
              // $('.lblAttach[data-id='+element._id+']').addClass('disableInputInside');
              $('.taskRow[data-id=' + element._id + ']').children().each((index, element) =>{
                if($(element).attr('class') == 'picPlace' || $(element).attr('class') == 'teamTD') {
                  $('td.'+$(element).attr('class')).addClass('disableInputClick')
                }
                else if($(element).attr('class') != 'status' && $(element).attr('class') != 'fileAttachment'){
                  $('td.'+$(element).attr('class')).addClass('disableInputInside')
                }
                
              })
            }
          });
        }
      }
      
      let dueDateTask = moment(element.due_date);
      let currentDate = moment()
      let diff = dueDateTask.diff(currentDate,'days')
      if(diff <= 0 && diff >= -7 && currentDate.isAfter(dueDateTask) && element.status == 'Pending'){
        $('.taskRow[data-id=' + element._id + ']').addClass('taskRowDueDate')
      }
    });

    $('.progressBar[data-id=' + id + ']').append(progBar);
    $('.progressBarPrio[data-id=' + id + ']').append(progPrioBar);

    // check if board is public and user logged in match with pic of coresponding group task
    if($('#table'+id).attr('data-type') == 'Main' && JSON.parse(result.pic)[0].account_id != ct.id_employee){
      $('table[id=table'+id+']').addClass('disableTable');
    }

    if(result.state  == 'readonly' && (result.condition != undefined && !result.condition)){
      $('table[id=table'+id+']').addClass('disableTable');
    }

    //if maker of group task is user logged in then he can only see its task
    if(result.user_create == ct.name && JSON.parse(result.pic)[0].account_id != ct.id_employee){
      $('table[id=table'+id+']').addClass('disableTable');
    }

    //if pic of group task is not login user then he / she is not allowed to add tasks
    if(JSON.parse(result.pic)[0].account_id != ct.id_employee){
      $('.newTask[data-id='+result._id+']').remove();
    }

  } else {
    $('.card-body[data-id="' + id + '"]').append(emptyTable);

    //if pic of group task is not login user then he / she is not allowed to add tasks
    if(JSON.parse(result.pic)[0].account_id != ct.id_employee){
      $('.newTask[data-id='+result._id+']').remove();
    }
  }

  $('table[id=table' + id + ']').bootstrapTable({
    columns: [{
      field: 'name',
      title: 'Task Name'
    }, {
      field: 'pic',
      title: 'PIC'
    }, {
      field: 'team',
      title: 'Team'
    }, {
      field: 'status',
      title: 'Status'
    }, {
      field: 'priority',
      title: 'Priority'
    }, {
      field: 'due_date',
      title: 'Due Date'
    }, {
      field: 'timeline',
      title: 'Timeline'
    }, 
    {
      field: 'attachment',
      title: 'Attachment'
    }, 
    {
      field: 'sync',
      title: 'Sync'
    }, 
    {
      field: 'action',
      title: 'Action'
    }],
  })

  if(result.status.toString() == "true"){
    $('.cardStatusGT[data-statusGT="true"]').find('.bootstrap-table').css('background-color','white')
  }

  $('table[id=table' + id + ']').removeClass('table-bordered')
}

async function processProgressBar(data, idGroup) {
  let countTotal = data.length;
  let totalWorking = 0;
  let totalStuck = 0;
  let totalDone = 0;
  let totalWaiting = 0;
  let totalNoStatus = 0;
  let totalPending = 0;
  let totalFixing = 0;
  data.forEach(element => {
    if (!element.status) {
      totalNoStatus += 1;
    } else {
      if (element.status == 'Working on it') {
        totalWorking += 1;
      } else if (element.status == 'Stuck') {
        totalStuck += 1;
      } else if (element.status == 'Done') {
        totalDone += 1;
      } else if (element.status == 'Waiting for review') {
        totalWaiting += 1;
      } else if (element.status == 'Pending') {
        totalPending += 1;
      } else if (element.status == 'Need to fix') {
        totalFixing += 1;
      } 
    } 
  });

  let doneWidth = (totalDone / countTotal) * 100;
  let workingWidth = (totalWorking / countTotal) * 100;
  let stuckWidth = (totalStuck / countTotal) * 100;
  let waitingWidth = (totalWaiting / countTotal) * 100;
  let pendingWidth = (totalPending / countTotal) * 100;
  let noStatusWidth = (totalNoStatus / countTotal) * 100;
  let fixWidth = (totalFixing / countTotal) * 100;

  let htmlProgress = '<div class="row"><div class="col-md-2 col-lg-1" style="align-self:center;">Status </div><div class="col-md-10 col-lg-11"><div class="progress" data-id=' + idGroup + ' style="height: 15px;">' +
    '<div data-identity="Done" data-id=' + idGroup + ' data-toggle="tooltip" data-placement="bottom" title="Done ' + totalDone + '/' + countTotal + '" class="progress-bar progressStatus progress-bar-striped progress-bar-animated lowLabel" role="progressbar" style="width: ' + doneWidth + '%" aria-valuenow=' + totalDone + ' aria-valuemin="0" aria-valuemax=' + countTotal + '>' + doneWidth.toFixed(1) + '%</div>' +
    '<div data-identity="Working on it" data-id=' + idGroup + ' data-toggle="tooltip" data-placement="bottom" title="Working on it ' + totalWorking + '/' + countTotal + '" class="progress-bar progressStatus progress-bar-striped progress-bar-animated mediumLabel" role="progressbar" style="width: ' + workingWidth + '%" aria-valuenow=' + totalWorking + ' aria-valuemin="0" aria-valuemax=' + countTotal + '>' + workingWidth.toFixed(1) + '%</div>' +
    '<div data-identity="Stuck" data-id=' + idGroup + ' data-toggle="tooltip" data-placement="bottom" title="Stuck ' + totalStuck + '/' + countTotal + '" class="progress-bar progressStatus progress-bar-striped progress-bar-animated highLabel" role="progressbar" style="width: ' + stuckWidth + '%" aria-valuenow=' + totalStuck + ' aria-valuemin="0" aria-valuemax=' + countTotal + '>' + stuckWidth.toFixed(1) + '%</div>' +
    '<div data-identity="Waiting for review" data-id=' + idGroup + ' data-toggle="tooltip" data-placement="bottom" title="Waiting for review ' + totalWaiting + '/' + countTotal + '" class="progress-bar progressStatus progress-bar-striped progress-bar-animated reviewLabel" role="progressbar" style="width: ' + waitingWidth + '%" aria-valuenow=' + totalWaiting + ' aria-valuemin="0" aria-valuemax=' + countTotal + '>' + waitingWidth.toFixed(1) + '%</div>' +
    '<div data-identity="Pending" data-id=' + idGroup + ' data-toggle="tooltip" data-placement="bottom" title="Pending ' + totalPending + '/' + countTotal + '" class="progress-bar progressStatus progress-bar-striped progress-bar-animated pendingLabel" role="progressbar" style="width: ' + pendingWidth + '%" aria-valuenow=' + totalPending + ' aria-valuemin="0" aria-valuemax=' + countTotal + '>' + pendingWidth.toFixed(1) + '%</div>' +
    '<div data-identity="Fixing" data-id=' + idGroup + ' data-toggle="tooltip" data-placement="bottom" title="Fixing ' + totalFixing + '/' + countTotal + '" class="progress-bar progressStatus progress-bar-striped progress-bar-animated fixLabel" role="progressbar" style="width: ' + fixWidth + '%" aria-valuenow=' + totalFixing + ' aria-valuemin="0" aria-valuemax=' + countTotal + '>' + fixWidth.toFixed(1) + '%</div>' +
    '<div data-identity="No Status" data-id=' + idGroup + ' data-toggle="tooltip" data-placement="bottom" title="No Status ' + totalNoStatus + '/' + countTotal + '" class="progress-bar progressStatus bg-light" role="progressbar" style="width: ' + noStatusWidth + '%" aria-valuenow=' + totalNoStatus + ' aria-valuemin="0" aria-valuemax=' + countTotal + '>' + noStatusWidth.toFixed(1) + '%</div>' +
    '</div></div></div>';
  return htmlProgress;
}

async function updateStatusProgressBar(data, currentStat, create = false, deleted = false) {

  if (create) {
    // Update the new data
    let updateAriaValueNow = $('.progressStatus[data-id=' + data.group_id + '][data-identity="' + data.status + '"]').attr('aria-valuenow');
    let currentArialValueMax = $('.progressStatus[data-id=' + data.group_id + '][data-identity="' + data.status + '"]').attr('aria-valuemax');
    let updatedArialValue = parseInt(updateAriaValueNow) + 1;
    let updateMaxArial = parseInt(currentArialValueMax) + 1;
    $('.progressStatus[data-id=' + data.group_id + '][data-identity="' + data.status + '"]').attr('aria-valuenow', updatedArialValue);
    $('.progressStatus[data-id=' + data.group_id + '][data-identity="' + data.status + '"]').attr('aria-valuemax', updateMaxArial);
    let updatedWidthNew = (updatedArialValue / updateMaxArial) * 100;
    $('.progressStatus[data-id=' + data.group_id + '][data-identity="' + data.status + '"]').html(updatedWidthNew.toFixed(1) + '%');
    $('.progressStatus[data-id=' + data.group_id + '][data-identity="' + data.status + '"]').css('width', updatedWidthNew + '%');
    $('.progressStatus[data-id=' + data.group_id + '][data-identity="' + data.status + '"]').attr('title', data.status + ' ' + updatedArialValue + '/' + updateMaxArial);

    $('.status[data-identity="stat' + data._id + '"]').attr('data-status', data.status);
    $('.status[data-identity="stat' + data._id + '"]').data('status', data.status);

    $('.progressStatus[data-id=' + data.group_id + '][data-identity!="' + data.status + '"]').each(function (e) {

      //update all max value
      let thisArialValueMax = $(this).attr('aria-valuemax');
      let updatedthisArialValueMax = parseInt(thisArialValueMax) + 1;
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

  } else if (deleted) {
    // Update the new data
    let updateAriaValueNow = $('.progressStatus[data-id=' + data.group_id + '][data-identity="' + data.status + '"]').attr('aria-valuenow');
    let currentArialValueMax = $('.progressStatus[data-id=' + data.group_id + '][data-identity="' + data.status + '"]').attr('aria-valuemax');
    let updatedArialValue = parseInt(updateAriaValueNow) - 1;
    let updateMaxArial = parseInt(currentArialValueMax) - 1;
    $('.progressStatus[data-id=' + data.group_id + '][data-identity="' + data.status + '"]').attr('aria-valuenow', updatedArialValue);
    $('.progressStatus[data-id=' + data.group_id + '][data-identity="' + data.status + '"]').attr('aria-valuemax', updateMaxArial);
    let updatedWidthNew = (updatedArialValue / updateMaxArial) * 100;
    $('.progressStatus[data-id=' + data.group_id + '][data-identity="' + data.status + '"]').html(updatedWidthNew.toFixed(1) + '%');
    $('.progressStatus[data-id=' + data.group_id + '][data-identity="' + data.status + '"]').css('width', updatedWidthNew + '%');
    $('.progressStatus[data-id=' + data.group_id + '][data-identity="' + data.status + '"]').attr('title', data.status + ' ' + updatedArialValue + '/' + updateMaxArial);

    $('.status[data-identity="stat' + data._id + '"]').attr('data-status', data.status);
    $('.status[data-identity="stat' + data._id + '"]').data('status', data.status);

    $('.progressStatus[data-id=' + data.group_id + '][data-identity!="' + data.status + '"]').each(function (e) {
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

  } else {
    //Update the old data
    let updateAriaValueNowForOldData = $('.progressStatus[data-id=' + data.group_id + '][data-identity="' + currentStat + '"]').attr('aria-valuenow');
    let currentArialValueMaxForOldData = $('.progressStatus[data-id=' + data.group_id + '][data-identity="' + currentStat + '"]').attr('aria-valuemax');
    let updatedArialValueForOldData = parseInt(updateAriaValueNowForOldData) - 1;
    $('.progressStatus[data-id=' + data.group_id + '][data-identity="' + currentStat + '"]').attr('aria-valuenow', updatedArialValueForOldData);
    let updatedWidthNewForOldData = (updatedArialValueForOldData / currentArialValueMaxForOldData) * 100;
    $('.progressStatus[data-id=' + data.group_id + '][data-identity="' + currentStat + '"]').html(updatedWidthNewForOldData.toFixed(1) + '%');
    $('.progressStatus[data-id=' + data.group_id + '][data-identity="' + currentStat + '"]').css('width', updatedWidthNewForOldData + '%');
    $('.progressStatus[data-id=' + data.group_id + '][data-identity="' + currentStat + '"]').attr('title', currentStat + ' ' + updatedArialValueForOldData + '/' + currentArialValueMaxForOldData);


    // Update the new data
    let updateAriaValueNow = $('.progressStatus[data-id=' + data.group_id + '][data-identity="' + data.status + '"]').attr('aria-valuenow');
    let currentArialValueMax = $('.progressStatus[data-id=' + data.group_id + '][data-identity="' + data.status + '"]').attr('aria-valuemax');
    let updatedArialValue = parseInt(updateAriaValueNow) + 1;
    $('.progressStatus[data-id=' + data.group_id + '][data-identity="' + data.status + '"]').attr('aria-valuenow', updatedArialValue);
    let updatedWidthNew = (updatedArialValue / currentArialValueMax) * 100;
    $('.progressStatus[data-id=' + data.group_id + '][data-identity="' + data.status + '"]').html(updatedWidthNew.toFixed(1) + '%');
    $('.progressStatus[data-id=' + data.group_id + '][data-identity="' + data.status + '"]').css('width', updatedWidthNew + '%');
    $('.progressStatus[data-id=' + data.group_id + '][data-identity="' + data.status + '"]').attr('title', data.status + ' ' + updatedArialValue + '/' + currentArialValueMax);

    $('.status[data-identity="stat' + data._id + '"]').attr('data-status', data.status);
    $('.status[data-identity="stat' + data._id + '"]').data('status', data.status);
  }

}

async function updatePriorityProgressBar(data, currentPrio, create = false, deleted = false) {
  if (create) {

    let updateAriaValueNowPrioCreate = $('.progressPrio[data-id=' + data.group_id + '][data-identityprio="' + data.priority + '"]').attr('aria-valuenow');
    let currentArialValueMaxPrioCreate = $('.progressPrio[data-id=' + data.group_id + '][data-identityprio="' + data.priority + '"]').attr('aria-valuemax');
    let updatedArialValuePrioCreate = parseInt(updateAriaValueNowPrioCreate) + 1;
    let updateMaxArialPrioCreate = parseInt(currentArialValueMaxPrioCreate) + 1;
    $('.progressPrio[data-id=' + data.group_id + '][data-identityprio="' + data.priority + '"]').attr('aria-valuenow', updatedArialValuePrioCreate);
    $('.progressPrio[data-id=' + data.group_id + '][data-identityprio="' + data.priority + '"]').attr('aria-valuemax', updateMaxArialPrioCreate);
    let updatedWidthNewPrio = (updatedArialValuePrioCreate / updateMaxArialPrioCreate) * 100;
    $('.progressPrio[data-id=' + data.group_id + '][data-identityprio="' + data.priority + '"]').html(updatedWidthNewPrio.toFixed(1) + '%');
    $('.progressPrio[data-id=' + data.group_id + '][data-identityprio="' + data.priority + '"]').css('width', updatedWidthNewPrio + '%');
    $('.progressPrio[data-id=' + data.group_id + '][data-identityprio="' + data.priority + '"]').attr('title', data.priority + ' ' + updatedArialValuePrioCreate + '/' + updateMaxArialPrioCreate);

    $('.priority[data-identityprio="prio' + data._id + '"]').attr('data-prio', data.priority);
    $('.priority[data-identityprio="prio' + data._id + '"]').data('prio', data.priority);

    $('.progressPrio[data-id=' + data.group_id + '][data-identityprio!="' + data.priority + '"]').each(function (e) {
      //update all max value
      let thisArialValueMaxPrio = $(this).attr('aria-valuemax');
      let updatedthisArialValueMaxCreatePrio = parseInt(thisArialValueMaxPrio) + 1;
      $(this).attr('aria-valuemax', updatedthisArialValueMaxCreatePrio)

      //update current value if > 0
      let thisArialValueNowForPrioCreate = $(this).attr('aria-valuenow');

      if (parseInt(thisArialValueNowForPrioCreate) > 0) {
        let newWidth = ((parseInt(thisArialValueNowForPrioCreate) / parseInt(updatedthisArialValueMaxCreatePrio)) * 100).toFixed(1);
        $(this).html(newWidth + '%');
        $(this).css('width', newWidth + '%');
        $(this).attr('title', $(this).data('identityprio') + ' ' + thisArialValueNowForPrioCreate + '/' + updatedthisArialValueMaxCreatePrio);
      } else {
        // update label
        $(this).attr('title', $(this).data('identityprio') + ' ' + thisArialValueNowForPrioCreate + '/' + updatedthisArialValueMaxCreatePrio);
      }
    })

  } else if (deleted) {

    let updateAriaValueNowPrioCreate = $('.progressPrio[data-id=' + data.group_id + '][data-identityprio="' + data.priority + '"]').attr('aria-valuenow');
    let currentArialValueMaxPrioCreate = $('.progressPrio[data-id=' + data.group_id + '][data-identityprio="' + data.priority + '"]').attr('aria-valuemax');
    let updatedArialValuePrioCreate = parseInt(updateAriaValueNowPrioCreate) - 1;
    let updateMaxArialPrioCreate = parseInt(currentArialValueMaxPrioCreate) - 1;
    $('.progressPrio[data-id=' + data.group_id + '][data-identityprio="' + data.priority + '"]').attr('aria-valuenow', updatedArialValuePrioCreate);
    $('.progressPrio[data-id=' + data.group_id + '][data-identityprio="' + data.priority + '"]').attr('aria-valuemax', updateMaxArialPrioCreate);
    let updatedWidthNewPrio = (updatedArialValuePrioCreate / updateMaxArialPrioCreate) * 100;
    $('.progressPrio[data-id=' + data.group_id + '][data-identityprio="' + data.priority + '"]').html(updatedWidthNewPrio.toFixed(1) + '%');
    $('.progressPrio[data-id=' + data.group_id + '][data-identityprio="' + data.priority + '"]').css('width', updatedWidthNewPrio + '%');
    $('.progressPrio[data-id=' + data.group_id + '][data-identityprio="' + data.priority + '"]').attr('title', data.priority + ' ' + updatedArialValuePrioCreate + '/' + updateMaxArialPrioCreate);

    $('.priority[data-identityprio="prio' + data._id + '"]').attr('data-prio', data.priority);
    $('.priority[data-identityprio="prio' + data._id + '"]').data('prio', data.priority);

    $('.progressPrio[data-id=' + data.group_id + '][data-identityprio!="' + data.priority + '"]').each(function (e) {
      //update all max value
      let thisArialValueMaxPrio = $(this).attr('aria-valuemax');
      let updatedthisArialValueMaxCreatePrio = parseInt(thisArialValueMaxPrio) - 1;
      $(this).attr('aria-valuemax', updatedthisArialValueMaxCreatePrio)

      //update current value if > 0
      let thisArialValueNowForPrioCreate = $(this).attr('aria-valuenow');

      if (parseInt(thisArialValueNowForPrioCreate) > 0) {
        let newWidth = ((parseInt(thisArialValueNowForPrioCreate) / parseInt(updatedthisArialValueMaxCreatePrio)) * 100).toFixed(1);
        $(this).html(newWidth + '%');
        $(this).css('width', newWidth + '%');
        $(this).attr('title', $(this).data('identityprio') + ' ' + thisArialValueNowForPrioCreate + '/' + updatedthisArialValueMaxCreatePrio);
      } else {
        // update label
        $(this).attr('title', $(this).data('identityprio') + ' ' + thisArialValueNowForPrioCreate + '/' + updatedthisArialValueMaxCreatePrio);
      }
    })

  } else {
    //Update the old data
    let updateAriaValueNowForOldDataPriority = $('.progressPrio[data-id=' + data.group_id + '][data-identityprio="' + currentPrio + '"]').attr('aria-valuenow');
    let currentArialValueMaxForOldDataPriority = $('.progressPrio[data-id=' + data.group_id + '][data-identityprio="' + currentPrio + '"]').attr('aria-valuemax');
    let updatedArialValueForOldDataPriority = parseInt(updateAriaValueNowForOldDataPriority) - 1;
    $('.progressPrio[data-id=' + data.group_id + '][data-identityprio="' + currentPrio + '"]').attr('aria-valuenow', updatedArialValueForOldDataPriority);
    let updatedWidthNewForOldDataPriority = (updatedArialValueForOldDataPriority / currentArialValueMaxForOldDataPriority) * 100;
    $('.progressPrio[data-id=' + data.group_id + '][data-identityprio="' + currentPrio + '"]').html(updatedWidthNewForOldDataPriority.toFixed(1) + '%');
    $('.progressPrio[data-id=' + data.group_id + '][data-identityprio="' + currentPrio + '"]').css('width', updatedWidthNewForOldDataPriority + '%');
    $('.progressPrio[data-id=' + data.group_id + '][data-identityprio="' + currentPrio + '"]').attr('title', currentPrio + ' ' + updatedArialValueForOldDataPriority + '/' + currentArialValueMaxForOldDataPriority);


    // Update the new data
    let updateAriaValueNowPriority = $('.progressPrio[data-id=' + data.group_id + '][data-identityprio="' + data.priority + '"]').attr('aria-valuenow');
    let currentArialValueMaxPriority = $('.progressPrio[data-id=' + data.group_id + '][data-identityprio="' + data.priority + '"]').attr('aria-valuemax');
    let updatedArialValuePriority = parseInt(updateAriaValueNowPriority) + 1;
    $('.progressPrio[data-id=' + data.group_id + '][data-identityprio="' + data.priority + '"]').attr('aria-valuenow', updatedArialValuePriority);
    let updatedWidthNewPriority = (updatedArialValuePriority / currentArialValueMaxPriority) * 100;
    $('.progressPrio[data-id=' + data.group_id + '][data-identityprio="' + data.priority + '"]').html(updatedWidthNewPriority.toFixed(1) + '%');
    $('.progressPrio[data-id=' + data.group_id + '][data-identityprio="' + data.priority + '"]').css('width', updatedWidthNewPriority + '%');
    $('.progressPrio[data-id=' + data.group_id + '][data-identityprio="' + data.priority + '"]').attr('title', data.priority + ' ' + updatedArialValuePriority + '/' + currentArialValueMaxPriority);

    $('.priority[data-identityprio="prio' + data._id + '"]').attr('data-prio', data.priority);
    $('.priority[data-identityprio="prio' + data._id + '"]').data('prio', data.priority);
  }

}

async function processProgressBarPrio(data, idGroup) {
  let countTotal = data.length;
  let totalLow = 0;
  let totalMedium = 0;
  let totalHigh = 0;
  let totalUrgent = 0;
  let totalNoPriority = 0;
  data.forEach(element => {
    if (!element.priority) {
      totalNoPriority += 1;
    } else {
      if (element.priority == 'Low') {
        totalLow += 1;
      } else if (element.priority == 'Medium') {
        totalMedium += 1;
      } else if (element.priority == 'High') {
        totalHigh += 1;
      } else if (element.priority == 'Urgent') {
        totalUrgent += 1;
      }
    }
  });

  let lowWidth = (totalLow / countTotal) * 100;
  let mediumWidth = (totalMedium / countTotal) * 100;
  let highWidth = (totalHigh / countTotal) * 100;
  let urgentWidth = (totalUrgent / countTotal) * 100;
  let noPriorityWidth = (totalNoPriority / countTotal) * 100;

  let htmlProgress = '<div class="row"><div class="col-lg-1 col-md-2" style="align-self:center;">Priority </div><div class="col-md-10 col-lg-11"><div class="progress" data-id=' + idGroup + ' style="height: 15px;">' +
    '<div data-identityprio="Low" data-id=' + idGroup + ' data-toggle="tooltip" data-placement="bottom" title="Low ' + totalLow + '/' + countTotal + '" class="progress-bar progressPrio progress-bar-striped progress-bar-animated lowLabel" role="progressbar" style="width: ' + lowWidth + '%" aria-valuenow=' + totalLow + ' aria-valuemin="0" aria-valuemax=' + countTotal + '>' + lowWidth.toFixed(1) + '%</div>' +
    '<div data-identityprio="Medium" data-id=' + idGroup + ' data-toggle="tooltip" data-placement="bottom" title="Medium ' + totalMedium + '/' + countTotal + '" class="progress-bar progressPrio progress-bar-striped progress-bar-animated mediumLabel" role="progressbar" style="width: ' + mediumWidth + '%" aria-valuenow=' + totalMedium + ' aria-valuemin="0" aria-valuemax=' + countTotal + '>' + mediumWidth.toFixed(1) + '%</div>' +
    '<div data-identityprio="High" data-id=' + idGroup + ' data-toggle="tooltip" data-placement="bottom" title="High ' + totalHigh + '/' + countTotal + '" class="progress-bar progressPrio progress-bar-striped progress-bar-animated highLabel" role="progressbar" style="width: ' + highWidth + '%" aria-valuenow=' + totalHigh + ' aria-valuemin="0" aria-valuemax=' + countTotal + '>' + highWidth.toFixed(1) + '%</div>' +
    '<div data-identityprio="Urgent" data-id=' + idGroup + ' data-toggle="tooltip" data-placement="bottom" title="Urgent ' + totalUrgent + '/' + countTotal + '" class="progress-bar progressPrio progress-bar-striped progress-bar-animated urgentLabel" role="progressbar" style="width: ' + urgentWidth + '%" aria-valuenow=' + totalUrgent + ' aria-valuemin="0" aria-valuemax=' + countTotal + '>' + urgentWidth.toFixed(1) + '%</div>' +
    '<div data-identityprio="No Priority" data-id=' + idGroup + ' data-toggle="tooltip" data-placement="bottom" title="No Priority ' + totalNoPriority + '/' + countTotal + '" class="progress-bar progressPrio bg-light" role="progressbar" style="width: ' + noPriorityWidth + '%" aria-valuenow=' + totalNoPriority + ' aria-valuemin="0" aria-valuemax=' + countTotal + '>' + noPriorityWidth.toFixed(1) + '%</div>' +
    '</div></div></div>';
  return htmlProgress;
}

function notifDeleteComment(bodyDelete,groupId) {
  Swal.fire({
    title: 'Are you sure to delete this comment?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, Delete it!',
    allowOutsideClick: () => !Swal.isLoading()
  }).then((result) => {
    if (result.value) {
      globalUpdateComment('DELETE', bodyDelete);
      $('.cardForComment[data-id=' + bodyDelete._id + ']').remove();
      window['dataComment' + bodyDelete.task_id + ''] = JSON.parse(window['dataComment' + bodyDelete.task_id + '']).filter(function (e) {
        return e._id != bodyDelete._id;
      })
      window['dataComment' + bodyDelete.task_id + ''] = JSON.stringify(window['dataComment' + bodyDelete.task_id + '']);
      if($('.commentContent[data-id='+bodyDelete._id+']').children().length == 0 && $('.commentTask[data-id='+bodyDelete.task_id+']').data('available') == true){
        refreshTableData(groupId);
      }
    }
  })
}

function processReplyData(replyData, replyId, id,groupId) {
  let dataReply = JSON.parse(window['comment' + replyId + '']);
  if (dataReply.length > 0) {
    dataReply = dataReply.reverse()
    dataReply.forEach(function (element, index) {
      let htmlReply;
      let haveFile = element.file == 'null' || element.file == 'undefined' ? false : element.file;
      if (element.user_create != ct.name) {
        let choose;
        if(window['colorName'+element.user_create] == undefined) choose = getRandomColor();
        else choose = window['colorName'+element.user_create];

        try {
          let colorCheck = lightOrDark(window['colorName'+element.user_create]);
          if(colorCheck == 'light') window['colorClass'+element.user_create] = 'text-dark fontWeight400';
          else window['colorClass'+element.user_create] = 'text-white';
        } catch (error) {
          window['colorClass'+element.user_create] = 'text-white';
        }

        if(haveFile){
          htmlReply = '<div class="row mb-3"><div class="col-lg-8"><textarea data-aidi=' + element._id + ' data-index=' + index + ' class="form-control txtAreaEdit" readonly style="background-color:unset;" placeholder="Write a reply here (press enter to submit)">' + element.comment + '</textarea></div><div class="col-lg-2 align-self-center filePrev" data-image="'+element.file+'"><div class="badge badge-pill badge-danger" style="padding:.75rem"><i class="fas fa-lg fa-paperclip mr-2" style="color:white;"></i>1</div></div><div class="col-lg-2 nameReply" style="background:'+choose+'" data-toggle="tooltip" data-placement="bottom" title="' + element.user_create + '"><span class="initialName '+ window['colorClass'+element.user_create]+'">' + getInitials(element.user_create) + '</span></div></div></div>';
        } else {
          htmlReply = '<div class="row mb-3"><div class="col-lg-10"><textarea data-aidi=' + element._id + ' data-index=' + index + ' class="form-control txtAreaEdit" readonly style="background-color:unset;" placeholder="Write a reply here (press enter to submit)">' + element.comment + '</textarea></div><div class="col-lg-2 nameReply" style="background:'+choose+'" data-toggle="tooltip" data-placement="bottom" title="' + element.user_create + '"><span class="initialName '+ window['colorClass'+element.user_create]+'">' + getInitials(element.user_create) + '</span></div></div></div>';
        }
        
      } else {
        let choose;
        if(window['colorName'+element.user_create] == undefined) choose = getRandomColor();
        else choose = window['colorName'+element.user_create];

        try {
          let colorCheck = lightOrDark(window['colorName'+element.user_create]);
          if(colorCheck == 'light') window['colorClass'+element.user_create] = 'text-dark fontWeight400';
          else window['colorClass'+element.user_create] = 'text-white';
        } catch (error) {
          window['colorClass'+element.user_create] = 'text-white';
        }

        if(haveFile){
          htmlReply = '<div class="row mb-3 rowDelete" data-index=' + index + '><div class="col-lg-2 nameReply" style="background:'+choose+'" data-toggle="tooltip" data-placement="bottom" title="' + element.user_create + '"><span class="initialName '+ window['colorClass'+element.user_create]+'">' + getInitials(element.user_create) + '</span></div><div class="col-lg-8"><textarea data-aidi=' + element._id + ' data-index=' + index + ' data-idonly=' + id + ' class="form-control txtAreaEdit" data-replyid='+replyId+' placeholder="Write a reply here (press enter to submit)">' + element.comment + '</textarea><div class="mt-2 placeReply" data-id='+element._id+'><label for="editReplyFile'+element._id+'" id="editFileReplyLabel"><i class="editReplyImage far fa-image fa-lg mr-2" data-own=' + element._id + ' data-aidi=' + id + ' data-index=' + index + ' data-id=' + replyId + '></i><input id="editReplyFile'+element._id+'" class="editReplyFile d-none mb-0" data-id='+element._id+' type="file" /></label><i class="deleteReply far fa-trash-alt fa-lg" data-groupid='+groupId+' data-own=' + element._id + ' data-aidi=' + id + ' data-index=' + index + ' data-id=' + replyId + '></i></div></div><div class="col-lg-2 align-self-center filePrev" data-image="'+element.file+'"><div class="badge badge-pill badge-danger" style="padding:.75rem"><i class="fas fa-lg fa-paperclip mr-2" style="color:white;"></i>1</div></div></div></div>';
        } else {
          htmlReply = '<div class="row mb-3 rowDelete" data-index=' + index + '><div class="col-lg-2 nameReply" style="background:'+choose+'" data-toggle="tooltip" data-placement="bottom" title="' + element.user_create + '"><span class="initialName '+ window['colorClass'+element.user_create]+'">' + getInitials(element.user_create) + '</span></div><div class="col-lg-10"><div class="row"><div class="col-lg-8"><textarea data-aidi=' + element._id + ' data-index=' + index + ' data-idonly=' + id + ' class="form-control txtAreaEdit" data-replyid='+replyId+' placeholder="Write a reply here (press enter to submit)">' + element.comment + '</textarea></div><div class="col-lg-2" style="align-self:center;"><label for="editReplyFile'+element._id+'" id="editFileReplyLabel" class="mb-0"><i class="editReplyImage far fa-image fa-lg" data-own=' + element._id + ' data-aidi=' + id + ' data-index=' + index + ' data-id=' + replyId + '></i><input id="editReplyFile'+element._id+'" class="editReplyFile d-none" type="file" /></label></div><div class="col-lg-2" style="align-self:center;"><i class="deleteReply far fa-trash-alt fa-lg" data-groupid='+groupId+' data-own=' + element._id + ' data-aidi=' + id + ' data-index=' + index + ' data-id=' + replyId + '></i></div></div></div></div></div>';
        }

        

      }

      $('.replyComment[data-id=' + replyId + ']').append(htmlReply);

    });
  }
}

async function domComment(commentData, id) {
  $('.commentContent[data-id=' + id + ']').empty();
  let dataComment = commentData.reverse();
  dataComment.forEach(function (element, index) {
    let haveReply = element.reply ?? false;
    let cardComment = '<div class="card p-3 mb-3 cardForComment" data-id=' + element._id + ' style="border:7px solid #FFD6A2; border-radius:20px;">';
    let bodyComment;

    let haveFile = element.file == 'null' ? false : element.file;

    if (element.user_create == ct.name) {
      let groupIdData = $('.commentTask[data-id='+id+']').data('groupid');
      cardComment += '<div class="dropdown"><div style="text-align:end;"><i class="dropdown-toggle" data-offset="10,20" id="dropdownMenuComment' + element._id + '" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></i>' +
        '<div class="dropdown-menu" aria-labelledby="dropdownMenuComment' + element._id + '">' +
        '<a class="dropdown-item editComment" data-taskid=' + id + ' data-id=' + element._id + ' data-comment="' + element.comment + '">Edit Comment</a>' +
        '<a class="dropdown-item deleteComment" data-groupid='+groupIdData+' data-taskid=' + id + ' data-id=' + element._id + ' data-comment="' + element.comment + '">Delete Comment</a></div></div></div>';
    }

    if(haveFile) {
      bodyComment = '<div class="commentBody mb-3" data-id=' + element._id + '><p data-comment="' + element.comment + '">' + element.comment + '</p><a data-fancybox="gallery" href="'+element.file+'"><img src="'+element.file+'" width="100" height="100" /></a></div>';
    } else {
      bodyComment = '<div class="commentBody" data-id=' + element._id + '><p data-comment="' + element.comment + '">' + element.comment + '</p></div>';
    }

    cardComment += '<blockquote class="blockquote mb-0 card-body" style="border-left:none;">' +
      bodyComment+
      '<footer class="blockquote-footer">' +
      '<small class="text-muted">' + element.user_create + '</small>' +
      '</footer>' +
      '</blockquote>';

      let choose;
      if(window['colorName'+element.user_create] == undefined) choose = getRandomColor();
      else choose = window['colorName'+element.user_create];

      try {
        let colorCheck = lightOrDark(choose);
        if(colorCheck == 'light') window['colorClass'+element.user_create] = 'text-dark fontWeight400';
        else window['colorClass'+element.user_create] = 'text-white';
      } catch (error) {
        window['colorClass'+element.user_create] = 'text-white';
      }

    let emptyComment = '<div class="replyComment p-3 mb-3" data-id=' + element._id + '><div class="row mb-3"><div class="col-lg-2 nameReply" style="background:'+choose+'"><span class="initialName '+window['colorClass'+element.user_create]+'">' + getInitials(ct.name) + '</span></div><div class="col-lg-8 align-self-center"><textarea data-index=' + index + ' data-replyid=' + element._id + ' data-commentid='+id+' class="form-control txtAreaReply" data-groupid='+$('.commentTask[data-id='+id+']').data('groupid')+' placeholder="Write a reply here (press enter to submit)"></textarea></div><div class="col-lg-2 labelCommentEach align-self-center"><label for="commentFile'+element._id+'" id="commentFileLabel"><img src="/proman/public/assets/img/image.svg" width="30" height="30" /></label><input class="commentPictEach" data-id='+element._id+' id="commentFile'+element._id+'" type="file" /></div></div></div></div><hr/>';
    cardComment += emptyComment;
    cardComment += '</div>';

    $('.commentContent[data-id=' + id + ']').append(cardComment);

    if (haveReply) {
      if (JSON.parse(haveReply) != '[]') {
        window['comment' + element._id + ''] = element.reply
        processReplyData(element.reply, element._id, id,$('.commentTask[data-id='+id+']').data('groupid'));
      }
    }

  });
}

function objDiff(array1, array2) {
  var resultArray = []

  array2.forEach(function (destObj) {
      var check = array1.some(function (origObj) {
          if (origObj.account_id == destObj.account_id) return true
      })
      if (!check) {
          resultArray.push(destObj)
      }
  })

  array1.forEach(function (origObj) {
      var check = array2.some(function (destObj) {
          if (origObj.account_id == destObj.account_id) return true
      })
      if (!check) {
          resultArray.push(origObj)
      }
  })

  return resultArray
}

function processTeamData(data) {
  let html = '';
  data.member = JSON.parse(data.member);
  let dataMemberAwal = data.member;
  if(dataMemberAwal.length > 3){
    let splicedData = dataMemberAwal.slice(0,3);
    var newArr = objDiff(splicedData,dataMemberAwal);
    window['dataSpliceLeft'+data._id] = newArr;
    splicedData.forEach(element => {
      let choose;
      if(window['color'+element.account_id] == undefined) choose = getRandomColor();
      else choose = window['color'+element.account_id];
  
      try {
        let colorCheck = lightOrDark(window['color'+element.account_id]);
        if(colorCheck == 'light') window['colorClass'+element.account_id] = 'text-dark fontWeight400';
        else window['colorClass'+element.account_id] = 'text-white';
      } catch (error) {
        window['colorClass'+element.account_id] = 'text-white';
      }
  
      html += '<div class="memberLogo" style="background:'+choose+'"  data-toggle="tooltip" data-placement="bottom" title="' + element.account_name + '"><span class="initialPic '+window['colorClass'+element.account_id]+'">' + getInitials(element.account_name) + '</span></div>';
    });
    /// triple dots
    html += '<div class="memberLogo moreMember" data-id='+data._id+' style="background:lightgrey;"><span><i class="fas fa-ellipsis-h"></i></span></div>';
  } else {
    dataMemberAwal.forEach(element => {
      let choose;
      if(window['color'+element.account_id] == undefined) choose = getRandomColor();
      else choose = window['color'+element.account_id];
  
      try {
        let colorCheck = lightOrDark(window['color'+element.account_id]);
        if(colorCheck == 'light') window['colorClass'+element.account_id] = 'text-dark fontWeight400';
        else window['colorClass'+element.account_id] = 'text-white';
      } catch (error) {
        window['colorClass'+element.account_id] = 'text-white';
      }
  
      html += '<div class="memberLogo" style="background:'+choose+'"  data-toggle="tooltip" data-placement="bottom" title="' + element.account_name + '"><span class="initialPic '+window['colorClass'+element.account_id]+'">' + getInitials(element.account_name) + '</span></div>';
    });
  }
  data.member = dataMemberAwal;
  return html;
}

async function notifDeleteTask(bodyDelete, name, bodyProgress) {
  Swal.fire({
    title: 'Are you sure to delete\n' + name + "\nTask",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, Delete it!',
    showLoaderOnConfirm: true,
    preConfirm: async () => {
      return await deleteTask(bodyDelete).then(async function (result) {
        if (result.responseCode == '200') {
          let param = {
            type: 'success',
            text: result.responseMessage
          };
          callNotif(param);
          // $('.taskRow[data-id=' + bodyDelete._id + ']').remove();
          // await updateStatusProgressBar(bodyProgress, '', false, true);
          // await updatePriorityProgressBar(bodyProgress, '', false, true);
          containerOnLoad('cardGT'+bodyProgress.group_id+'')
          $('.headerGT[data-id='+bodyProgress.group_id+']').click()
          setTimeout(() => {
              $('.headerGT[data-id='+bodyProgress.group_id+']').click()
          }, 500);
          let intervalData = setInterval(() => {
              if($('#table'+bodyProgress.group_id).length > 0){
                  clearInterval(intervalData)
                  containerDone('cardGT'+bodyProgress.group_id+'')
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
      });
    },
    allowOutsideClick: () => !Swal.isLoading()
  })
}

function headerStyle(column) {
  return {
    name: {
      css: {
        width: '15%'
      }
    },
    team: {
      css: {
        width: '15%'
      }
    },
    status: {
      css: {
        width: '15%'
      }
    },
    priority: {
      css: {
        width: '15%'
      }
    },
    status: {
      css: {
        width: '15%'
      }
    },
    due_date: {
      css: {
        width: '15%'
      }
    },
    timeline: {
      css: {
        width: '15%'
      }
    },
    action: {
      css: {
        width: '15%'
      }
    }
  } [column.field]
}