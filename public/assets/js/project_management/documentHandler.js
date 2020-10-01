'use strict'

$(document).on('keydown', '.commentInputArea', async function (ev) {
  if (ev.key === 'Enter') {
    let id = $(this).data('id');
    let newCommentValue = $(this).val();
    if (newCommentValue != '') {
      let updateComment = {
        'task_id': id,
        'comment': newCommentValue,
        'user_create': ct.name
      }
      $('.commentInputArea[data-id=' + id + ']').attr('disabled', 'disabled')
      $(this).val('');
      $(this).blur();
      $(this).mouseleave();
      let addComment = await globalAddComment(updateComment);
      $('.commentInputArea[data-id=' + id + ']').removeAttr('disabled');
      if (addComment != 500) {
        console.log('tastas', id, window['dataComment' + id + '']);
        window['dataComment' + id + ''] = JSON.parse(window['dataComment' + id + '']);
        window['dataComment' + id + ''].push(addComment);
        let cardCommentNew = '<div class="card p-3 mb-3 cardForComment" data-id=' + addComment._id + '>' +
          '<div class="dropdown"><div style="text-align:end;"><i class="dropdown-toggle" data-offset="10,20" id="dropdownMenuComment' + addComment._id + '" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" data-feather="chevron-down"></i>' +
          '<div class="dropdown-menu" aria-labelledby="dropdownMenuComment' + addComment._id + '">' +
          '<a class="dropdown-item editComment" data-taskid=' + id + ' data-id=' + addComment._id + ' data-comment="' + addComment.comment + '">Edit Comment</a>' +
          '<a class="dropdown-item deleteComment" data-taskid=' + id + ' data-id=' + addComment._id + ' data-comment="' + addComment.comment + '">Delete Comment</a></div></div></div>' +
          '<blockquote class="blockquote mb-0 card-body" style="border-left:none;">' +
          '<div class="commentBody" data-id=' + addComment._id + '><p data-comment="' + addComment.comment + '">' + addComment.comment + '</p></div>' +
          '<footer class="blockquote-footer">' +
          '<small class="text-muted">' +
          addComment.user_create + '</small>' +
          '</footer>' +
          '</blockquote>';

        let emptyComment = '<div class="replyComment p-3 mb-3" data-id=' + addComment._id + '><div class="row mb-3"><div class="col-lg-2 nameReply"><span class="initialName">' + getInitials(ct.name) + '</span></div><div class="col-lg-10"><textarea data-index="0" data-replyid=' + addComment._id + ' class="form-control txtAreaReply" placeholder="Write a reply here (press enter to submit)"></textarea></div></div></div></div>';

        cardCommentNew += '<hr/>';
        cardCommentNew += emptyComment;

        cardCommentNew += '</div>';

        $('.commentContent[data-id=' + id + ']').prepend(cardCommentNew);
      }
    }
    setTimeout(() => {
      $('.commentInputArea').blur();
    }, 500);

    setTimeout(() => {
      $('.commentInputArea').mouseleave();
    }, 1000);
  }
});



$(document).on('keydown', '.txtAreaEdit', async function (ev) {
  if (ev.key === 'Enter') {
    let replyEditComment = $(this).val();
    let aidi = $(this).data('aidi');
    let id = $(this).data('idonly');
    if (replyEditComment == '') {
      amaranNotifFull('please fill comment reply');
    } else {

      let replyingComment = {
        '_id': aidi,
        'task_id': id,
        'comment': replyEditComment,
        'user_create': ct.name
      }
      $(this).attr('readonly', true);
      await globalUpdateReplyComment('PUT', replyingComment);
      $(this).removeAttr('readonly');
    }

    setTimeout(() => {
      if (replyComment == '') replyComment = $(this).data('name');
      $(this).mouseleave();
      $(this).html(replyComment);
    }, 200);
  }
})

$(document).on('keydown', '.txtAreaReply', async function (ev) {
  if (ev.key === 'Enter') {
    let replyComment = $(this).val();
    if (replyComment == '') {
      amaranNotifFull('please fill comment reply');
    } else {
      let replyingComment = {
        'comment_id': $(this).data('replyid'),
        'comment': replyComment,
        'user_create': ct.name
      }
      console.log('reply atas', replyingComment);
      $(this).attr('readonly', true);
      let res = await globalUpdateReplyComment('POST', replyingComment);
      $(this).removeAttr('readonly');
      if (res != 500) {
        res.data = res.data[0];
        var maxId = Number.MIN_VALUE;
        $('.rowDelete').each(function (item) {
          maxId = Math.max(maxId, $(this).data('index'))
        });
        let indexNew = maxId + 1;
        htmlReply = '<div class="row mb-3 rowDelete" data-index=' + indexNew + '><div class="col-lg-2 nameReply" data-toggle="tooltip" data-placement="bottom" title="' + res.data.comment + '"><span class="initialName">' + getInitials(res.data.user_create) + '</span></div><div class="col-lg-10"><div class="row"><div class="col-lg-10"><textarea data-aidi=' + res.data._id + ' data-index=' + indexNew + ' class="form-control txtAreaEdit" placeholder="Write a reply here (press enter to submit)">' + res.data.comment + '</textarea></div><div class="col-lg-2" style="align-self:center;"><i class="deleteReply" data-own=' + res.data._id + ' data-aidi=' + res.data._id + ' data-index=' + indexNew + ' data-id=' + res.data._id + ' data-feather="trash-2"></i></div></div></div></div></div>';
        $(htmlReply).insertBefore($('.rowDelete').first());
        feather.replace();
        $(this).val('');
      }
    }

    setTimeout(() => {
      if (replyComment == '') replyComment = $(this).data('name');
      $(this).mouseleave();
      $(this).html(replyComment);
    }, 200);
  }
});


$(document).on('click', '.menuRename', function () {
  let renameId = $(this).data('id');
  let renameBoardId = $(this).data('boardid');
  let oldName = $(this).data('name');
  let boardName = $(this).data('boardname');
  let camelized = $(this).data('camelized');
  let boardType = $(this).data('boardtype');
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
      let bodyGroup = {
        '_id': renameId,
        'name': newName,
        'board_id': renameBoardId
      }
      console.log('boaarr', bodyGroup);
      return await editGroupTask(bodyGroup).then(async function (result) {
        let param;
        if (result.responseCode == '200') {
          param = {
            type: 'success',
            text: result.responseMessage
          };
          callNotif(param);
          $('.boardContent').empty();
          $('.boardHeader').empty();
          let gt = await getGroupTask(renameBoardId);
          if (gt.responseCode == '200') {
            gt.data = await groupTaskChecking(gt.data);
            console.log('board id', renameBoardId, gt.data);
            window['groupTask' + renameBoardId + ''] = gt.data;
            $.ajax({
              url: 'projectBoard',
              method: 'GET',
              headers: {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Cache-Control": "no-cache",
              },
              success: function (result) {
                $.getScript(localUrl + ":" + mainLocalPort + "/public/assets/js/project_management/projectContent.js", function (data, textStatus, jqxhr) {})
                $('.boardContent').html(result);
                let pass = {
                  boardName: boardName,
                  camelized: camelized,
                  name: oldName,
                  id: renameBoardId,
                  type: boardType,
                  member: JSON.stringify(window['dataBoardMember' + renameBoardId + ''])
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
        } else {
          param = {
            type: 'error',
            text: result.responseMessage
          };
          callNotif(param);
          return false;
        }
      });
    },
    allowOutsideClick: () => !Swal.isLoading()
  })
})


$(document).on('click', '.menuDelete', function () {
  let deleteId = $(this).data('id');
  let deleteBoardId = $(this).data('boardid');
  let oldName = $(this).data('name');
  let boardName = $(this).data('boardname');
  let camelized = $(this).data('camelized');
  let boardType = $(this).data('boardtype');
  Swal.fire({
    title: 'Are you sure to delete\n' + oldName + "\nGroup Task",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, Delete it!',
    showLoaderOnConfirm: true,
    preConfirm: async () => {
      let bodyGroup = {
        '_id': deleteId,
        'board_id': deleteBoardId
      }
      return await deleteGroupTask(bodyGroup).then(async function (result) {
        let param;
        if (result.responseCode == '200') {
          param = {
            type: 'success',
            text: result.responseMessage
          };
          callNotif(param);
          $('.boardContent').empty();
          $('.boardHeader').empty();
          let gt = await getGroupTask(deleteBoardId);
          if (gt.responseCode == '200') {
            gt.data = await groupTaskChecking(gt.data);
            window['groupTask' + deleteBoardId + ''] = gt.data;
            $.ajax({
              url: 'projectBoard',
              method: 'GET',
              headers: {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Cache-Control": "no-cache",
              },
              success: function (result) {
                $.getScript(localUrl + ":" + mainLocalPort + "/public/assets/js/project_management/projectContent.js", function (data, textStatus, jqxhr) {})
                $('.boardContent').html(result);
                let pass = {
                  boardName: boardName,
                  camelized: camelized,
                  name: oldName,
                  id: deleteBoardId,
                  type: boardType,
                  member: JSON.stringify(window['dataBoardMember' + deleteBoardId + ''])
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
        } else {
          param = {
            type: 'error',
            text: result.responseMessage
          };
          callNotif(param);
          return false;
        }
      });
    },
    allowOutsideClick: () => !Swal.isLoading()
  })
})

$(document).on('click', '.editComment', function () {
  let id = $(this).data('id');
  let commentNow = $(this).data('comment');
  let taskid = $(this).data('taskid');
  let inputType = '<textarea class="form-control editCommentArea" rows="3" data-id=' + id + '>' + commentNow + '</textarea>';
  $('.commentBody[data-id=' + id + ']').html(inputType);
  $('.editCommentArea[data-id=' + id + ']').focusin();

  $(document).on('blur', '.editCommentArea[data-id=' + id + ']', function () {
    let newComment = $(this).data('new');
    let labelP;
    if (newComment) {
      labelP = '<p>' + newComment + '</p>';
    } else {
      labelP = '<p>' + commentNow + '</p>';
    }
    $('.commentBody[data-id=' + id + ']').html(labelP);

  })

  $('.editCommentArea[data-id=' + id + ']').keypress(async function (e) {
    var key = e.which;
    let newCommentEdited = $(this).val();
    if (key == 13) {
      if (newCommentEdited != '') {

        let editedComment = {
          '_id': id,
          'task_id': taskid,
          // 'comment': newCommentEdited,
          // 'user_create': ct.name
          // 'comment_id': id,
          'comment': newCommentEdited,
          'user_create': ct.name
        }
        console.log('edited  comment', editedComment);
        globalUpdateComment('PUT', editedComment);
        window['dataComment' + taskid + ''] = JSON.parse(window['dataComment' + taskid + '']).filter(function (e) {
          if (e._id == id) {
            e.comment = newCommentEdited
          }
          return e;
        });
        window['dataComment' + taskid + ''] = JSON.stringify(window['dataComment' + taskid + '']);

        $('.editCommentArea[data-id=' + id + ']').attr('data-new', newCommentEdited);
        $('.editComment[data-id=' + id + ']').data('comment', newCommentEdited);
        $('.deleteComment[data-id=' + id + ']').data('comment', newCommentEdited);
        $('.editCommentArea[data-id=' + id + ']').blur();
      }
    }
  });
})

$(document).on('click', '.deleteComment', function () {
  let id = $(this).data('id');
  let commentNow = $(this).data('comment');
  let taskid = $(this).data('taskid');

  let deletedComment = {
    '_id': id,
    'task_id': taskid,
    'comment': commentNow,
    'user_create': ct.name
  }
  notifDeleteComment(deletedComment);
})


$(document).on('click', '.deleteReply', function () {
  let indexDelete = $(this).data('index');
  let indexComment = $(this).data('id');
  let taskid = $(this).data('aidi');
  let ownId = $(this).data('own');

  let newData = [];

  Swal.fire({
    title: 'Are you sure to delete this reply?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, Delete it!',
    showLoaderOnConfirm: true,
    preConfirm: async () => {
      window['comment' + indexComment + ''] = JSON.parse(window['comment' + indexComment + '']).filter(function (result) {
        if (result._id != ownId) {
          newData.push(result);
        }
        return newData;
      })
      window['comment' + indexComment + ''] = JSON.stringify(newData);
      let deletingComment = {
        '_id': ownId,
      }

      globalUpdateReplyComment('DELETE', deletingComment);
      $('.rowDelete[data-index=' + indexDelete + ']').remove();
    },
    allowOutsideClick: () => !Swal.isLoading()
  })
})

$(document).on('click', '.commentTask', async function () {
  let taskName = $(this).data('name');
  let id = $(this).data('id');
  let groupid = $(this).data('groupid');
  let available = $('.commentTask[data-id=' + id + ']').data('available');
  $('.commentContent').attr('data-id', id);
  $('.commentTaskMember').empty();
  $('.commentContent[data-id=' + id + ']').empty();
  $('.commentContent[data-id=' + id + ']').append('Getting comment data...');

  if (available == true || available == 'true') {
    let commentData = await getComment(id);
    if (commentData != 500) {
      if (commentData.length > 0) {
        await domComment(commentData, id);
      } else {
        $('.commentContent[data-id=' + id + ']').empty();
      }
    }

    let intervalComment = setInterval(async () => {
      $('.commentContent[data-id=' + id + ']').empty();
      $('.commentContent[data-id=' + id + ']').append('Getting comment data...');
      let commentData = await getComment(id);
      if (commentData != 500) {
        if (commentData.length > 0) {
          $('.commentContent[data-id=' + id + ']').empty('');
          await domComment(commentData, id);
        } else {
          $('.commentContent[data-id=' + id + ']').empty();
        }
      }
    }, 60000);

    $('#commentModal').on('hidden.bs.modal', function (e) {
      clearInterval(intervalComment);
    })
  } else {
    $('.commentContent[data-id=' + id + ']').empty();
  }

  // write task name and member 
  $('.commentTaskName').html(taskName);
  try {
    window['dataCommentTeam' + groupid + ''].forEach(element => {
      let random = Math.floor(Math.random() * 4) + 1;
      $('.commentTaskMember').append('<div data-toggle="tooltip" data-placement="bottom" title="' + element.account_name + '" class="commentLogo' + random + '"><span class="initialPic text-white">' + getInitials(element.account_name) + '</span></div>');
    });
  } catch (e) {
    $('.commentTaskMember').append('<div>No member yet</div>');
  }

  feather.replace();

  $('.commentInputArea').attr('data-id', id);
})



$(document).on('mouseenter', '.commentInputText', function () {
  $(this).addClass('d-none');
  $('.commentInputArea').removeClass('d-none');
});

$(document).on('mouseleave', '.commentInputArea', function () {
  $(this).addClass('d-none');
  $('.commentInputText').removeClass('d-none');
});

$(document).on('focus', '.commentInputText', function () {
  $(this).addClass('d-none');
  $('.commentInputArea').removeClass('d-none');
  $('.commentInputArea').focus();
});


$(document).on('mouseenter', '.pic', function () {
  let id = $(this).data('id');
  let groupid = $(this).data('groupid');
  let name = $(this).data('name');

  $('[data-original-title]').popover('dispose');
  let label = '<div class="row p-2 mb-2"><div class="col-lg-12 text-center">Choose PIC</div></div>';
  let empHtml = '<div class="row p-2 mb-2"><div class="col-lg-12"><select id="employeePic" data-groupid="' + groupid + '" data-name="' + name + '" data-id=' + id + ' class="form-control emploPic"></div></div>';
  let joinHtml = label + empHtml;

  $('.pic[data-id=' + id + ']').attr('tabindex', '0');
  $('.pic[data-id=' + id + ']').attr('data-toggle', 'popover');

  $('.pic[data-id=' + id + ']').popover({
    content: joinHtml,
    placement: "right",
    html: true,
    sanitize: false
  });

  $('.pic[data-id=' + id + ']').on('shown.bs.popover', async function () {
    $('.emploPic[data-id=' + id + ']').empty();
    let boardParent = $('.card[data-parent="parent' + groupid + '"]').data('boardaidi');
    let boardParentType = $('.card[data-parent="parent' + groupid + '"]').data('boardtype');
    switch (boardParentType) {
      case 'Main':
        let htmlEmptyMain = '<option selected>Choose</option>';
        $('.emploPic[data-id=' + id + ']').append(htmlEmptyMain);
        let employee = await getEmployee();
        if (employee != 500) {
          employee.forEach(element => {
            let html = '<option class="opsiPic" data-id=' + id + ' value=' + element.employee_id + '>' + element.employee_name + '</option>';
            $('.emploPic[data-id=' + id + ']').append(html);
          });
        }
        break;
      case 'Private':
        let groupWindow = window['dataBoardMember' + boardParent + ''];
        let htmlEmpty = '<option selected>Choose</option>';
        $('.emploPic[data-id=' + id + ']').append(htmlEmpty);
        groupWindow.forEach(element => {
          let html = '<option class="opsiPic" data-id=' + id + ' value=' + element.account_id + '>' + element.account_name + '</option>';
          $('.emploPic[data-id=' + id + ']').append(html);
        });
        break;
    }


    if (window['picTask' + id + '']) {
      let thisPic = window['picTask' + id + ''];
      console.log('dataPic', thisPic)
      $('.opsiPic').each(function (e) {
        if ($(this).val() == JSON.parse(window['picTask' + id + ''])[0].account_id) {
          $(this).remove();
        }
      })

    }

  })
})

$(document).on('change', '.emploPic', function () {
  let id = $(this).data('id');
  let groupid = $(this).data('groupid');
  let name = $(this).data('name');
  let val = $('select#employeePic[data-id=' + id + ']').val();
  let valName = $('select#employeePic[data-id=' + id + '] :selected').text();

  let updatePic = {
    '_id': id,
    'group_id': groupid,
    'name': name,
    'user_update': ct.name,
    'pic': JSON.stringify([{
      'account_id': val,
      'account_name': valName
    }])
  }
  let rand = (Math.floor(Math.random() * 4) + 1);
  $('.pic[data-id=' + id + ']').html('<div class="memberLogo' + rand + '" data-toggle="tooltip" data-placement="bottom" title="' + valName + '"><span class="initialPic text-white">' + getInitials(valName) + '</span></div>');
  feather.replace();
  globalUpdateTask('pic', updatePic);

})

$(document).on('mouseenter', '.pic', function () {
  let id = $(this).data("id");
  if (!$('.pic[data-id=' + id + ']').children().hasClass('picVal')) {
    $('.icon_user[data-id=' + id + ']').attr('data-feather', 'user-plus');
    feather.replace();
  }

})

$(document).on('mouseleave', '.pic', function () {
  let id = $(this).data("id");
  if (!$('.pic[data-id=' + id + ']').children().hasClass('picVal')) {
    $('.icon_user[data-id=' + id + ']').attr('data-feather', 'user');
    feather.replace();
  }
})


$(document).on('mouseenter', '.team', function () {
  let id = $(this).data("id");
  let groupid = $(this).data('groupid');
  let name = $(this).data('name');
  let haveTeam = $(this).data('team');
  window['dataTeam' + id + ''] = [];

  if (!$('.team[data-id=' + id + ']').children().hasClass('addTeamIcon')) {
    if (haveTeam) {
      $('.addTeamIcon[data-id=' + id + ']').removeClass('d-none');
    } else {
      $('.icon_team[data-id=' + id + ']').attr('data-feather', 'user-plus');
      feather.replace();
    }
  }

  // let crew = $('.taskRow[data-id=' + id + ']').data('member');
  $('[data-original-title]').popover('dispose');

  let labelTeam = '<div class="row p-2 mb-2"><div class="col-lg-12 text-center">Choose Team</div></div>';
  let empHtmlTeam = '<div class="row p-2 mb-2"><div class="col-lg-12"><select id="employeeTeam" data-team=' + haveTeam + ' data-groupid="' + groupid + '" data-name="' + name + '" data-id=' + id + ' class="form-control emploTeam"></select></div></div>';
  let removeAll = '<div class="row p-2 mb-2"><div class="col-lg-12"><button type="button" class="btn btn-danger removeAllTeam" data-groupid="' + groupid + '" data-name="' + name + '" data-id=' + id + ' style="width:100%">Remove All</button></div></div>';
  let submitTeam = '<div class="row p-2 mb-2"><div class="col-lg-12"><button type="button" class="btn btn-success submitTeam" data-groupid="' + groupid + '" data-name="' + name + '" data-id=' + id + ' style="width:100%">Done</button></div></div>';
  let joinHtmlTeam = labelTeam + empHtmlTeam + removeAll + submitTeam;

  $('.team[data-id=' + id + ']').attr('tabindex', '0');
  $('.team[data-id=' + id + ']').attr('data-toggle', 'popover');

  $('.team[data-id=' + id + ']').popover({
    content: joinHtmlTeam,
    placement: "right",
    html: true,
    sanitize: false
  });

  $('.team[data-id=' + id + ']').on('shown.bs.popover', async function () {
    $('.emploTeam[data-id=' + id + ']').empty();
    let boardParent = $('.card[data-parent="parent' + groupid + '"]').data('boardaidi');
    let boardParentType = $('.card[data-parent="parent' + groupid + '"]').data('boardtype');
    switch (boardParentType) {
      case 'Main':
        let htmlEmptyMain = '<option selected>Choose</option>';
        $('.emploPic[data-id=' + id + ']').append(htmlEmptyMain);
        let employee = await getEmployee();
        if (employee != 500) {
          employee.forEach(element => {
            let html = '<option class="opsi" data-id="' + id + '" value=' + element.employee_id + '>' + element.employee_name + '</option>';
            $('.emploTeam[data-id=' + id + ']').append(html);
          });
        }
        break;
      case 'Private':
        let groupWindow = window['dataBoardMember' + boardParent + ''];
        let htmlEmpty = '<option selected>Choose</option>';
        $('.emploTeam[data-id=' + id + ']').append(htmlEmpty);
        groupWindow.forEach(element => {
          let html = '<option class="opsi" data-id="' + id + '" value=' + element.account_id + '>' + element.account_name + '</option>';
          $('.emploTeam[data-id=' + id + ']').append(html);
        });
        break;
    }

    if (window['dataCurrentTeam' + id + ''].length != 0) {
      let thisTeamMember = window['dataCurrentTeam' + id + ''];
      try {
        thisTeamMember.member.forEach(element => {
          $('.opsi').each(function () {
            if ($(this).val() == element.account_id) {
              $(this).remove();
            }
          })
        });
      } catch (e) {
        thisTeamMember = thisTeamMember[0];
        thisTeamMember.member.forEach(element => {
          $('.opsi').each(function () {
            if ($(this).val() == element.account_id) {
              $(this).remove();
            }
          })
        });
      }

    }

  })

})

$(document).on('click', '.removeAllTeam', function () {
  let id = $(this).data('id');
  let groupid = $(this).data('groupid');
  let name = $(this).data('name');

  window['dataTeam' + id + ''] = [];
  let updateTeam = {
    '_id': id,
    'group_id': groupid,
    'name': name,
    'user_update': ct.name,
    'member': JSON.stringify([])
  }
  let htmlRemove = '<div class="colTeam" data-id=' + id + '><i class="icon_team" data-id="' + id + '" data-feather="user"></i></div>';
  $('.team[data-id=' + id + ']').html(htmlRemove);
  feather.replace();
  globalUpdateTask('team', updateTeam);
})

$(document).on('mouseleave', '.team', function () {
  let id = $(this).data("id");
  if (!$('.team[data-id=' + id + ']').children().hasClass('picVal')) {
    $('.icon_team[data-id=' + id + ']').attr('data-feather', 'user');
    feather.replace();
  }

  if (!$('.team[data-id=' + id + ']').children().hasClass('addTeamIcon')) {
    $('.addTeamIcon[data-id=' + id + ']').addClass('d-none');
  }
})



$(document).on('change', '.emploTeam', function () {
  let id = $(this).data('id');
  let groupid = $(this).data('groupid');
  let name = $(this).data('name');
  let haveTeam = $(this).data("team");
  let val = $('select#employeeTeam[data-id=' + id + ']').val();
  let valName = $('select#employeeTeam[data-id=' + id + '] :selected').text();
  let random = Math.floor(Math.random() * 4) + 1;

  if (haveTeam) {
    $('.colTeam[data-id=' + id + ']').append('<div class="memberLogo' + random + '" data-id="' + id + '"><span class="initialPic text-white">' + getInitials(valName) + '</span></div>');
  } else {
    $('.colTeam[data-id=' + id + ']').html('<div class="memberLogo' + random + '" data-id="' + id + '"><span class="initialPic text-white">' + getInitials(valName) + '</span></div>');
    $(this).data('team', 'true');
    $('.colTeam[data-id=' + id + ']').css('display', 'flex');
    $('.colTeam[data-id=' + id + ']').addClass('justify-content-center');
  }

  $('.opsi').each(function () {
    if ($(this).val() == val) {
      $(this).remove();
    }
  })

  window['dataTeam' + id + ''].push({
    'account_id': val,
    'account_name': valName
  })

  console.log('aaa', window['dataCurrentTeam' + id + '']);

  try {
    window['dataCurrentTeam' + id + ''].push({
      'member': window['dataTeam' + id + '']
    });
  } catch (e) {
    console.log('into catch');
    window['dataCurrentTeam' + id + ''].member.push(window['dataTeam' + id + ''][0]);
  }


  console.log('the team after', window['dataTeam' + id + '']);
  console.log('the team current', window['dataCurrentTeam' + id + '']);

  feather.replace();
})

$(document).on('click', '.submitTeam', function () {
  let id = $(this).data('id');
  let groupid = $(this).data('groupid');
  let name = $(this).data('name');

  console.log('mw submit', window['dataCurrentTeam' + id + ''].member);
  let updateTeam = {
    '_id': id,
    'group_id': groupid,
    'name': name,
    'user_update': ct.name,
    'member': JSON.stringify(window['dataCurrentTeam' + id + ''].member)
  }
  globalUpdateTask('team', updateTeam);
})

$(document).on('click', '.duedate', function () {
  let id = $(this).data('id');
  let groupid = $(this).data('groupid');
  let name = $(this).data('name');
  let dateValue = $(this).data('value');

  let html = '<input type="text" data-id="' + id + '" id="datepicker" class="form-control dateDue">';
  $(this).html(html);


  $('.dateDue[data-id=' + id + ']').hover(
    function () {

    },
    function () {
      if ($(this).val() == '' && $('#ui-datepicker-div').css('display') == 'none') {
        $('.duedate[data-id="' + id + '"]').html(dateValue);
      }
    }
  );

  $(".dateDue").datepicker({
    onSelect: function (date) {
      let updateDueDate = {
        '_id': id,
        'group_id': groupid,
        'name': name,
        'user_update': ct.name,
        'due_date': date
      }
      $('.duedate[data-id="' + id + '"]').html(date);
      globalUpdateTask('duedate', updateDueDate);
    },
  });

})

$(document).on('click', '.timeline', function () {
  let id = $(this).data('id');
  let groupid = $(this).data('groupid');
  let name = $(this).data('name');

  let html = '<input type="text" name="datesPicker" data-id="' + id + '" id="date" class="form-control dateTimeline">';
  $(this).html(html);

  $('input[name="datesPicker"][data-id="' + $(this).data('id') + '"]').hover(
    function () {

    },
    function () {
      let valueOri = $('.timeline[data-id=' + id + ']').data('value');
      $('.timeline[data-id=' + id + ']').html(valueOri);
    }
  );

  $('input[name="datesPicker"][data-id="' + $(this).data('id') + '"]').daterangepicker({
    opens: 'left',
    autoUpdateInput: false,
    locale: {
      cancelLabel: 'Clear'
    }
  }, async function (start, end) {
    let startDate = start.format('MM/DD/YYYY');
    let endDate = end.format('MM/DD/YYYY');
    $('.timeline[data-id=' + id + ']').html(startDate + ' - ' + endDate);

    let updateTimeline = {
      '_id': id,
      'group_id': groupid,
      'name': name,
      'user_update': ct.name,
      'timeline': JSON.stringify([startDate, endDate])
    }
    globalUpdateTask('timeline', updateTimeline);
  })
})

$(document).on('mouseenter', '.name', function () {
  let id = $(this).data('id');
  let groupid = $(this).data('groupid');
  let name = $(this).data('name')
  let html = '<input type="text" class="form-control nameTask" data-id="' + id + '" data-groupid=' + groupid + ' data-name="' + name + '" value="' + name + '">';
  $('.name[data-id=' + id + ']').html(html);
  $('.nameTask[data-id="' + id + '"]').keypress(async function (e) {
    var key = e.which;
    let newValue = $('.nameTask[data-id=' + id + ']').val();
    if (key == 13) {
      if (newValue == '') {
        $('.name[data-id=' + id + ']').html(name);
      } else {
        console.log('ww', newValue);

        let updateName = {
          '_id': id,
          'group_id': groupid,
          'name': newValue,
          'user_update': ct.name
        }
        globalUpdateTask('name', updateName);
        $('td.name[data-id=' + id + ']').data('name', newValue);
        $('.name[data-id=' + id + ']').mouseleave();
      }
      setTimeout(() => {
        if (newValue == '') newValue = name;
        $('.name[data-id=' + id + ']').mouseleave();
        $('.name[data-id=' + id + ']').html(newValue);
      }, 200);
    }
  });
})

$(document).on('mouseleave', '.name', function () {
  let id = $(this).data('id');
  let name = $(this).data('name')
  $('.name[data-id=' + id + ']').html(name);
});


$(document).on('click', '.status', function () {
  let id = $(this).data('id');
  let currentStatus = $(this).data('status');
  console.log('cs', id, currentStatus);
  $(this).attr('tabindex', '0');
  $(this).attr('data-toggle', 'popover');
  $(this).attr('data-trigger', 'focus');
  let menuTemplate = '<div class="row p-2"><div class="col-lg-12 rowStat mediumPrio text-white">Working on it</div></div> <div class="row p-2"><div class="col-lg-12 rowStat highPrio text-white">Stuck</div></div> <div class="row p-2"><div class="col-lg-12 rowStat lowPrio text-white">Done</div></div> <div class="row p-2"><div class="col-lg-12 rowStat reviewStat text-white">Waiting for review</div></div>';
  $(this).popover({
    trigger: 'focus',
    content: menuTemplate,
    placement: "right",
    html: true
  });

  $(this).on('shown.bs.popover', function () {
    $('.rowStat').attr('data-id', id);
    $('.rowStat').attr('data-current', currentStatus);
    $('.mediumPrio').attr('data-status', 'Working on it');
    $('.highPrio').attr('data-status', 'Stuck');
    $('.lowPrio').attr('data-status', 'Done');
    $('.reviewStat').attr('data-status', 'Waiting for review');
  })
})

$(document).on('click', '.rowStat', async function () {
  let stat = $(this).data('status');
  let currentStat = $(this).data('current');
  let id = $(this).data('id');
  let groupid = $('.status[data-id=' + id + ']').data('groupid');
  let name = $('.status[data-id=' + id + ']').data('name');

  $('[data-original-title]').popover('dispose');

  $('.status[data-id=' + id + ']').html(stat);
  if ($('.status[data-id=' + id + ']').hasClass('reviewStat')) {
    $('.status[data-id=' + id + ']').removeClass('reviewStat');
  }

  if ($('.status[data-id=' + id + ']').hasClass('highPrio')) {
    $('.status[data-id=' + id + ']').removeClass('highPrio');
  }

  if ($('.status[data-id=' + id + ']').hasClass('mediumPrio')) {
    $('.status[data-id=' + id + ']').removeClass('mediumPrio');
  }

  if ($('.status[data-id=' + id + ']').hasClass('lowPrio')) {
    $('.status[data-id=' + id + ']').removeClass('lowPrio');
  }

  switch (stat) {
    case 'Waiting for review':
      $('.status[data-id=' + id + ']').addClass('reviewStat text-white');
      break;
    case 'Stuck':
      $('.status[data-id=' + id + ']').addClass('highPrio text-white');
      break;
    case 'Working on it':
      $('.status[data-id=' + id + ']').addClass('mediumPrio text-white');
      break;
    case 'Done':
      $('.status[data-id=' + id + ']').addClass('lowPrio text-white');
      break;
  }



  let dataStat = {
    '_id': id,
    'group_id': groupid,
    'status': stat,
    'name': name,
    'user_update': ct.name
  }
  globalUpdateTask('status', dataStat);
  await updateStatusProgressBar(dataStat, currentStat);
})

$(document).on('click', '.priority', function () {
  let id = $(this).data('id');
  let currentPrio = $(this).data('prio');
  $(this).attr('tabindex', '0');
  $(this).attr('data-toggle', 'popover');
  $(this).attr('data-trigger', 'focus');
  let menuTemplate = '<div class="row p-2"><div class="col-lg-12 rowPrio urgentPrio text-white">Urgent</div></div> <div class="row p-2"><div class="col-lg-12 rowPrio highPrio text-white">High</div></div> <div class="row p-2"><div class="col-lg-12 rowPrio mediumPrio text-white">Medium</div></div> <div class="row p-2"><div class="col-lg-12 rowPrio lowPrio text-white">Low</div></div>';
  $(this).popover({
    trigger: 'focus',
    content: menuTemplate,
    placement: "right",
    html: true
  });

  $(this).on('shown.bs.popover', function () {
    $('.rowPrio').attr('data-id', id);
    $('.rowPrio').attr('data-prio', currentPrio);
    $('.urgentPrio').attr('data-priority', 'Urgent');
    $('.highPrio').attr('data-priority', 'High');
    $('.mediumPrio').attr('data-priority', 'Medium');
    $('.lowPrio').attr('data-priority', 'Low');
  })
})

$(document).on('click', '.rowPrio', async function () {
  let prio = $(this).data('priority');
  let id = $(this).data('id');
  let currentPrio = $(this).data('prio');
  let groupid = $('.priority[data-id=' + id + ']').data('groupid');
  let name = $('.priority[data-id=' + id + ']').data('name');

  $('.priority[data-id=' + id + ']').html(prio);
  if ($('.priority[data-id=' + id + ']').hasClass('urgentPrio')) {
    $('.priority[data-id=' + id + ']').removeClass('urgentPrio');
  }

  if ($('.priority[data-id=' + id + ']').hasClass('highPrio')) {
    $('.priority[data-id=' + id + ']').removeClass('highPrio');
  }

  if ($('.priority[data-id=' + id + ']').hasClass('mediumPrio')) {
    $('.priority[data-id=' + id + ']').removeClass('mediumPrio');
  }

  if ($('.priority[data-id=' + id + ']').hasClass('lowPrio')) {
    $('.priority[data-id=' + id + ']').removeClass('lowPrio');
  }

  switch (prio) {
    case 'Urgent':
      $('.priority[data-id=' + id + ']').addClass('urgentPrio text-white');
      break;
    case 'High':
      $('.priority[data-id=' + id + ']').addClass('highPrio text-white');
      break;
    case 'Medium':
      $('.priority[data-id=' + id + ']').addClass('mediumPrio text-white');
      break;
    case 'Low':
      $('.priority[data-id=' + id + ']').addClass('lowPrio text-white');
      break;
  }



  let dataPrio = {
    '_id': id,
    'group_id': groupid,
    'priority': prio,
    'name': name,
    'user_update': ct.name
  }
  globalUpdateTask('priority', dataPrio);
  await updatePriorityProgressBar(dataPrio, currentPrio);
})

$(document).on('click', '.delTask', async function () {
  let delId = $(this).data('id');
  let delName = $(this).data('name');
  let groupId = $(this).data('groupid')
  let status = $('.status[data-id=' + delId + ']').data('status');
  let priority = $('.priority[data-id=' + delId + ']').data('prio');
  let bodyDelete = {
    _id: delId
  };
  let bodyProgress = {
    _id: delId,
    group_id: groupId,
    status: status,
    priority: priority
  }
  await notifDeleteTask(bodyDelete, delName, bodyProgress);
})

$(document).on('click', '.newTask', function () {
  let groupId = $(this).data('id');
  let groupName = $(this).data('name');
  let boardId = $(this).data('boardid');
  let inputHtml = '<input type="text" class="form-control taskTitle' + groupId + '" data-name="' + groupName + '" placeholder="+ Add Task">';
  $(this).html(inputHtml);
  $('.taskTitle' + groupId + '[data-name="' + groupName + '"]').focus();
  $(document).on('focusout', '.taskTitle' + groupId + '[data-name="' + groupName + '"]', async function () {
    $('td.newTask[data-id=' + groupId + ']').html('+ Add Task');
  })

  $('.taskTitle' + groupId + '[data-name="' + groupName + '"]').keypress(async function (e) {
    var key = e.which;
    if (key == 13) // the enter key code
    {
      if ($(this).val() == '') {
        $('td.newTask[data-id=' + groupId + ']').html('+ Add Task');
      } else {
        $('td.newTask[data-id=' + groupId + ']').css('opacity', '0.6');
        await addTask($(this).val(), groupId);
      }
    }
  });
})