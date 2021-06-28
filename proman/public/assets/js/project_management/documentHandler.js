'use strict'

$(function () {
  $('.settingBeef').beefup({
    selfClose: true
  });
})

function lightOrDark(color) {
  let brightness = tinycolor(color).getBrightness();
  if (brightness >= 140) return 'light';
  else return 'dark;'
}

$(document).on('change', '.fileAttachData', async function () {
  let valid = true;
  let aidi = $(this).data('id');
  let attachmentFile = document.querySelector(`#fileAttachData` + aidi).files;
  let arrFile = [];
  let groupId = $(this).data('groupid');
  const forLoopFile = async _ => {
    for (var i = 0; i < attachmentFile.length; i++) {
      arrFile.push({
        file: await toBase64Comment(attachmentFile[i]),
        name: attachmentFile[i].name,
        type: attachmentFile[i].type
      })
    }
  }

  await forLoopFile()

  arrFile.forEach(element => {
    if (!element.type.includes('msword') && !element.type.includes('png') && !element.type.includes('sheet') && !element.type.includes('jpeg') && !element.type.includes('jpg') && !element.type.includes('pdf')) {
      valid = false;
      return callNotif({
        type: 'error',
        text: element.type + ' file is not supported'
      })
    }
  });

  if (valid) {
    arrFile.forEach(element => {
      delete element.type;
    });
    let formAttachmentFile = new FormData();
    formAttachmentFile.append('file', JSON.stringify(arrFile));
    formAttachmentFile.append('id', aidi);
    loadingActivated();
    let attachFile = await globalAttachFile(formAttachmentFile);
    document.getElementById('fileAttachData' + aidi).value = null;
    loadingDeactivated();
    if (attachFile == '200') {
      refreshTableData(groupId);
    }
  }
})

$(document).on('change', '#commentFile', function (e) {
  // let filename = e.target.files[0].name;
  // $('.commentFileName').html(filename);
  let checkTag = '<i class="fa fa-check position-absolute" style="color:green;""></i>';
  $(this).parent().append(checkTag);
})

$(document).on('change', '.commentPictEach', function (e) {
  // let filename = e.target.files[0].name;
  // let id = $(this).data('id');
  // $('.commentFileName'+id+'').html(filename);

  let checkTag = '<i class="fa fa-check position-absolute" style="color:green;""></i>';
  $(this).parent().append(checkTag);
})

$(document).on('change', '.editReplyFile', function () {
  let checkTag = '<i class="fa fa-check position-absolute" style="color:green; top:95px; left:20px;"></i>';
  $(this).parent().append(checkTag);
})

async function toCompress(file) {
  return new Promise(async function (resolve, reject) {
    new Compressor(file, {
      quality: 0.6,
      success(result) {
        resolve(result);
      },
      error(err) {
        resolve(500);
      },
    });
  })
}

const toBase64Comment = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
});

$(document).on('keydown', '.txtAreaEdit', async function (ev) {
  if (ev.key === 'Enter') {
    let replyEditComment = $(this).val();
    let aidi = $(this).data('aidi');
    let replyId = $(this).data('replyid');
    if (replyEditComment.trim() == '') {
      toastrNotifFull('please fill comment reply', 'info');
    } else {

      let commentFile;
      let base64CommentFile;
      commentFile = document.querySelector(`#editReplyFile` + aidi).files[0];
      if (commentFile) {
        let compressedFile = await toCompress(document.querySelector(`#editReplyFile` + aidi).files[0])
        base64CommentFile = await toBase64Comment(compressedFile);
      }

      let formPutComment = new FormData();

      formPutComment.append('_id', aidi);
      formPutComment.append('comment_id', replyId);
      formPutComment.append('comment_file', base64CommentFile);
      formPutComment.append('comment', replyEditComment);
      formPutComment.append('user_create', ct.name);

      $(this).attr('readonly', true);
      await globalUpdateReplyComment('PUT', formPutComment);
      $(this).removeAttr('readonly');
    }

    setTimeout(() => {
      if (replyEditComment == '') replyEditComment = $(this).data('name');
      $(this).mouseleave();
      $(this).html(replyEditComment);
    }, 200);
  }
})

$(document).on('click', '.shareLink', async function () {
  let groupId = $(this).data('groupid')
  let id = $(this).data('id');
  let boardId = $(this).data('boardid');
  let name = $(this).data('name');
  let linkValue;
  Swal.fire({
    title: name,
    input: 'text',
    inputValidator: (value) => {
      linkValue = value;
    },
    inputPlaceholder: 'URL',
    showCancelButton: true,
    confirmButtonText: 'Copy',
    showLoaderOnConfirm: true,
    onOpen: async () => {
      $('<label class="mb-2 mt-3" style="font-size:1.25em;font-weight:500;">Share URL</label>').insertBefore($('.swal2-input'))
      $('.swal2-input').addClass('mt-2');
      $('.swal2-input').attr('id', 'urlLink')
      $('.swal2-input').val(window.location.origin  + '/proman/employee?boardId=' + boardId + '&groupTaskId=' + groupId + '&taskId=' + id)
      $('.swal2-input').prop('disabled', true);
    },
    preConfirm: async () => {
      var copyText = document.getElementById("urlLink");
      copyText.select();
      copyText.setSelectionRange(0, 99999)
      document.execCommand("copy");
      toastrNotifFull('url has been copied to clipboard');
    },
    allowOutsideClick: () => !Swal.isLoading()
  })
})

$(document).on('input', '.searchGT', function () {
  let valueSearch = $(this).val();
  $('.cardGroupTask').each(function (index, data) {
    let nameGT = $(data).data('name');
    if (nameGT.toUpperCase().indexOf(valueSearch.toUpperCase()) > -1) {
      $(data).animate({
        opacity: 1,
      }, 250, function () {
        $(data).fadeIn('slow');
      });

    } else {
      $(data).animate({
        opacity: 0.25,
        left: "0"
      }, 250, function () {
        $(data).fadeOut('slow');
      });
    }
  })
})

$(document).on('click', '.filePrev', async function () {
  let imageData = $(this).data('image');
  $.fancybox.open('<img src="' + imageData + '"/>');
})

async function refreshTableData(groupId) {
  containerOnLoad('cardGT' + groupId + '')
  $('.headerGT[data-id=' + groupId + ']').click()
  setTimeout(() => {
    $('.headerGT[data-id=' + groupId + ']').click()
  }, 500);
  let intervalData = setInterval(() => {
    if ($('#table' + groupId).length > 0) {
      clearInterval(intervalData)
      containerDone('cardGT' + groupId + '')
    }
  }, 1000);
}

async function refreshComment(commentId, groupId = '') {
  $('.commentContent[data-id=' + commentId + ']').empty();
  $(".commentContent[data-id=" + commentId + "]").append('Getting comment data...');
  try {
    let commentData = await getComment(commentId);
    if (commentData != 500) {
      if (commentData.length > 0) {
        await domComment(commentData, commentId);
        if ($('.commentTask[data-id=' + commentId + ']').data('available') == false && groupId != '') {
          refreshTableData(groupId);
        }
      } else {
        $('.commentContent[data-id=' + commentId + ']').empty();
      }
    }
  } catch (error) {

  }
}

$(document).on('keydown', '.txtAreaReply', async function (ev) {
  if (ev.key === 'Enter') {
    let replyComment = $(this).val();
    let groupid = $(this).data('groupid');
    if (replyComment.trim() == '') {
      toastrNotifFull('please fill comment reply', 'info');
    } else {

      let commentFile;
      let base64CommentFile;
      commentFile = document.querySelector(`.commentPictEach`).files[0];
      if (commentFile) {
        let compressedFile = await toCompress(document.querySelector(`.commentPictEach`).files[0])
        base64CommentFile = await toBase64Comment(compressedFile);
      }

      let formUpdateComment = new FormData();

      formUpdateComment.append('comment_id', $(this).data('replyid'));
      formUpdateComment.append('comment', replyComment);
      formUpdateComment.append('comment_file', base64CommentFile);
      formUpdateComment.append('user_create', ct.name);

      let replyId = $(this).data('replyid');
      let commentId = $(this).data('commentid');

      $(this).attr('readonly', true);
      let res = await globalUpdateReplyComment('POST', formUpdateComment);
      $(this).removeAttr('readonly');
      if (res != 500) {
        await refreshComment(commentId, groupid);
      }
    }

    setTimeout(() => {
      if (replyComment == '') replyComment = $(this).data('name');
      $(this).mouseleave();
      $(this).html(replyComment);
    }, 200);
  }
});


$(document).on('click', '.menuRename', async function () {
  let renameId = $(this).data('id');
  let renameBoardId = $(this).data('boardid');
  let newName;
  newName = $('.renameInput').val()
  let bodyGroup = {
    '_id': renameId,
    'name': newName,
    'board_id': renameBoardId
  }
  console.log('boaarr', bodyGroup);
  loadingActivated();
  return await editGroupTask(bodyGroup).then(async function (result) {
    loadingDeactivated();
    let param;
    if (result.responseCode == '200') {
      $('button.close').click();
      $('a[data-id=' + renameBoardId + ']').click();
      $('#chartSection').addClass('d-none');
      param = {
        type: 'success',
        text: result.responseMessage
      };
      callNotif(param);
      let newProjects = JSON.parse(localStorage.getItem('favList')).map(p =>
        p.id === renameId ? {
          ...p,
          name: newName
        } :
        p
      );
      localStorage.setItem('favList', JSON.stringify(newProjects))
    } else if (result.responseCode == '401') {
      logoutNotif();
    } else {
      param = {
        type: 'error',
        text: result.responseMessage
      };
      callNotif(param);
      return false;
    }
  });
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
          $('button.close').click()
          $('a[data-id=' + deleteBoardId + ']').click();
          $('#chartSection').addClass('d-none');
          param = {
            type: 'success',
            text: result.responseMessage
          };
          callNotif(param);
          let filters = JSON.parse(localStorage.getItem('favList')).filter(function (el) {
            return el.id != deleteId
          });
          localStorage.setItem('favList', JSON.stringify(filters))
        } else if (result.responseCode == '401') {
          logoutNotif();
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
          'comment': newCommentEdited,
          'comment_file': ''
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
  let groupId = $(this).data('groupid');

  let deletedComment = {
    '_id': id,
    'comment': commentNow
  }
  notifDeleteComment(deletedComment, groupId);
})

$(document).on('click', '.deleteReply', async function () {
  let indexDelete = $(this).data('index');
  let indexComment = $(this).data('id');
  let taskid = $(this).data('aidi');
  let ownId = $(this).data('own');
  let groupId = $(this).data('groupid');

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

      let delReply = await globalUpdateReplyComment('DELETE', deletingComment);
      if (delReply != 500) {
        await refreshComment(taskid, groupId);
      }
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
  $('.commentInputArea').attr('data-id', id);
  $('.commentInputArea').attr('data-groupid', groupid);
  $('.commentTaskName').html(taskName);
  $(".commentContent[data-id=" + id + "]").empty();
  $(".commentContent[data-id=" + id + "]").append('Getting comment data...');

  if (available == true || available == 'true') {
    let commentData = await getComment(id);
    if (commentData != 500) {
      if (commentData.length > 0) {
        await domComment(commentData, id);
      } else {
        $('.commentContent[data-id=' + id + ']').empty();
      }
    }


  } else {
    $('.commentContent[data-id=' + id + ']').empty();
    try {
      let commentData = await getComment(id);
      if (commentData != 500) {
        if (commentData.length > 0) {
          await domComment(commentData, id);
        } else {
          $('.commentContent[data-id=' + id + ']').empty();
        }
      }
    } catch (error) {

    }
  }

  let intervalComment = setInterval(async () => {
    if (!$(".txtAreaReply").is(":focus") && !$(".txtAreaEdit").is(":focus")) {
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
    }

  }, 20000);

  $('#commentModal').on('hidden.bs.modal', function (e) {
    clearInterval(intervalComment);
  })


  try {
    window['dataCommentTeam' + groupid + ''].forEach(element => {
      let choose;
      if (window['color' + element.account_id] == undefined) choose = getRandomColor();
      else choose = window['color' + element.account_id];

      try {
        let colorCheck = lightOrDark(choose);
        if (colorCheck == 'light') window['colorClass' + element.user_create] = 'text-dark fontWeight400';
        else window['colorClass' + element.user_create] = 'text-white';
      } catch (error) {
        window['colorClass' + element.user_create] = 'text-white';
      }
    });
  } catch (e) {

  }
  $('.commentInputArea[data-id=' + id + ']').val('');
})

$(document).on('keydown', '.commentInputArea', async function (ev) {
  if (ev.key === 'Enter') {
    let id = $('.commentInputArea').attr('data-id');
    let newCommentValue = $(this).val().trim();
    let groupId = $('.commentInputArea').attr('data-groupid');
    let commentFile;
    let base64CommentFile;
    if (newCommentValue.trim() != '') {
      commentFile = document.querySelector(`#commentFile`).files[0];
      if (commentFile != undefined) {
        let compressedFile = await toCompress(document.querySelector(`#commentFile`).files[0])
        base64CommentFile = await toBase64Comment(compressedFile);
      } else {
        base64CommentFile = '';
      }

      if (newCommentValue != '') {
        let formUpdateComment = new FormData();

        formUpdateComment.append('task_id', id.toString());
        formUpdateComment.append('comment', newCommentValue);
        formUpdateComment.append('comment_file', base64CommentFile);
        formUpdateComment.append('user_create', ct.name);
        formUpdateComment.append('url', window.location.origin  + '/proman/employee')
        $('.commentInputArea[data-id=' + id + ']').attr('disabled', 'disabled')
        $(this).val('');
        $(this).blur();
        $(this).mouseleave();
        let addComment = await globalAddComment(formUpdateComment);
        $('.commentInputArea[data-id=' + id + ']').removeAttr('disabled');
        if (addComment != 500) {
          await refreshComment(id, groupId);
        } else {
          toastrNotifFull('failed to comment', 'error');
        }
      }
      setTimeout(() => {
        $('.commentInputArea').blur();
      }, 500);

      setTimeout(() => {
        $('.commentInputArea').mouseleave();
      }, 1000);
    } else {
      toastrNotifFull('please fill comment', 'info');
    }
  }
});

async function triggerPopoverPIC(id, groupid, name) {
  if ($('.pic[data-id=' + id + ']').data("bs.popover") == undefined) {

    let empHtml = '<div class="row p-2 mb-2"><div class="col-lg-12"><select id="employeePic" data-groupid="' + groupid + '" data-name="' + name + '" data-id=' + id + ' class="form-control emploPic"></div></div>';
    let joinHtml = empHtml;

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
          let htmlEmptyMain = '<option selected>Choose PIC</option>';
          $('.emploPic[data-id=' + id + ']').append(htmlEmptyMain);
          loadingActivated()
          let employee = await getEmployee();
          loadingDeactivated()
          if (employee != 500) {
            employee = await boardEmployeeMainChecking(employee);
            employee.forEach(element => {
              let html = '<option class="opsiPic" data-id=' + id + ' value=' + element.employee_id + '>' + element.employee_name + '</option>';
              $('.emploPic[data-id=' + id + ']').append(html);
            });
          }
          break;
        case 'Private':
          let groupWindow = window['dataBoardMember' + boardParent + ''];
          let htmlEmpty = '<option selected>Choose PIC</option>';
          $('.emploPic[data-id=' + id + ']').append(htmlEmpty);
          groupWindow = await groupTaskGradeCheck(groupWindow)
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
  }
}

async function activateCanvas(url, pdf = false) {
  var canvas = document.querySelector("#canvasPlace");
  var signaturePad = new SignaturePad(canvas);
  $('#backupCanvas').attr('src', url);
  // Returns signature image as data URL (see https://mdn.io/todataurl for the list of possible parameters)
  // signaturePad.toDataURL(); // save image as PNG
  // signaturePad.toDataURL("image/jpeg"); // save image as JPEG
  // signaturePad.toDataURL("image/svg+xml"); // save image as SVG

  // Draws signature image from data URL.
  // NOTE: This method does not populate internal data structure that represents drawn signature. Thus, after using #fromDataURL, #toData won't work properly.
  if (!pdf)
    signaturePad.fromDataURL(url);
  // Returns signature image as an array of point groups
  const data = signaturePad.toData();

  // Draws signature image from an array of point groups
  signaturePad.fromData(data);

  // Returns true if canvas is empty, otherwise returns false
  signaturePad.isEmpty();

  signaturePad.off();

  window['signaturePad'] = signaturePad;
}

function enableCanvas() {
  window['signaturePad'].on();
}

function disableCanvas() {
  window['signaturePad'].off();
  clearCanvas()
}

function clearCanvas() {
  if ($('.currPage').length > 0) {
    let currentPage = parseInt($('.currPage').html());
    renderPage(currentPage)
  } else {
    let backUpCanvas = $('#backupCanvas').attr('src');
    window['signaturePad'].clear();
    window['signaturePad'].fromDataURL(backUpCanvas);
  }
}

$(document).on('click', '.savingCanvas', async function () {
  let idFile = $(this).data("id");
  let idTask = $(this).data("idtask");
  let groupId = $(this).data('groupid');
  let pdf = $(this).data('pdf');
  let multiple = $(this).data('multiple')
  if (pdf && multiple) {
    console.log('current page', parseInt($('.currPage').html()), window['signatureMultiple']);
    window['signatureMultiple'].forEach(element => {
      if (element.id == parseInt($('.currPage').html())) {
        element.image = window['signaturePad'].toDataURL('image/png')
      } else {
        element.image = element.imageBackup
      }
    });
    window['signatureMultiple'].forEach(element => {
      delete element.id;
      delete element.imageBackup
    })
    console.log('awal', window['signatureMultiple'], pdf, multiple);
    await exportCanvas(idFile, idTask, groupId, window['signatureMultiple'], pdf, multiple);
  } else {
    await exportCanvas(idFile, idTask, groupId, window['signaturePad'].toDataURL('image/jpeg'), pdf, multiple);
  }
})

function download() {
  var a = $("<a>")
    .attr("href", $('#backupCanvas').attr('src'))
    .attr("download", "img.png")
    .appendTo("body");

  a[0].click();

  a.remove();
}

$(document).on('click', '.downloadCanvas', function () {
  let pdfFile = $('.enablingCanvas').data('pdf')
  let multiples = $('.enablingCanvas').data('multiple');

  let pageWidth = 700;
  let pageHeight = 1000;
  if (pdfFile && multiples) {
    let dataRawPDF = window['signatureMultiple']
    dataRawPDF.forEach(element => {
      if (element.id == parseInt($('.currPage').html())) {
        element.image = window['signaturePad'].toDataURL('image/png')
      } else {
        element.image = element.imageBackup
      }
    });

    let docDefinitionRaw = {
      pageSize: {
        width: pageWidth,
        height: pageHeight
      },
      pageMargins: [1, 1, 1, 1],
      content: dataRawPDF
    };
    pdfMake.createPdf(docDefinitionRaw).download();
  } else if (pdfFile && !multiples) {
    let contentData = [{
      // in browser is supported loading images via url from reference by name in images
      image: window['signaturePad'].toDataURL('image/jpeg'),
      width: pageWidth,
      height: pageHeight
    }, ]

    let docDefinitionRaw = {
      content: contentData
    };
    pdfMake.createPdf(docDefinitionRaw).download();

  } else if (!pdfFile && !multiples) {
    download()
  }
})

$(document).on('click', '.enablingCanvas', function () {
  enableCanvas()
  $('.savingCanvas').removeClass('d-none');
  $('.enablingCanvas').addClass('d-none');
  $('.clearingCanvas').removeClass('d-none');
  if ($(this).data('pdf') != true && $(this).data('multiple') != true) {
    $('.disableSignature').removeClass('d-none');
  } else {
    $('.clearingCanvas').attr('data-number', 1);
  }
})

$(document).on('click', '.clearingCanvas', function () {
  clearCanvas()
})

async function exportCanvas(fileId, idTask, groupId, file = window['signaturePad'].toDataURL('image/jpeg'), pdf = false, multiple = false) {
  var pageWidth = 700;
  var pageHeight = 1000;
  let contentData;
  if (pdf) {
    if (!multiple) {
      contentData = [{
        // in browser is supported loading images via url from reference by name in images
        image: file,
        width: pageWidth,
        height: pageHeight
      }, ]
    } else {
      contentData = file;
    }
    var docDefinition = {
      pageSize: {
        width: pageWidth,
        height: pageHeight
      },
      pageMargins: [1, 1, 1, 1],
      content: contentData
    };
    console.log('conte', docDefinition);
    // pdfMake.createPdf(docDefinition).download();
    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    let fileDataPdf;
    pdfDocGenerator.getDataUrl(async (dataUrl) => {
      fileDataPdf = dataUrl;
      let formAttachmentFile = new FormData();
      let dataFile = JSON.stringify({
        "fileId": fileId,
        "file": fileDataPdf
      })
      formAttachmentFile.append('file', dataFile);
      formAttachmentFile.append('id', idTask);
      loadingActivated();
      let attachFile = await globalAttachFile(formAttachmentFile, 'PUT');
      loadingDeactivated();
      if (attachFile == '200') {
        disableCanvas();
        refreshTableData(groupId);
        $('#modalAttachmentFile').modal('toggle')
      }
    });
  } else {
    let formAttachmentFile = new FormData();
    let dataFile = JSON.stringify({
      "fileId": fileId,
      "file": file
    })
    formAttachmentFile.append('file', dataFile);
    formAttachmentFile.append('id', idTask);
    loadingActivated();
    let attachFile = await globalAttachFile(formAttachmentFile, 'PUT');
    loadingDeactivated();
    if (attachFile == '200') {
      disableCanvas();
      refreshTableData(groupId);
      $('#modalAttachmentFile').modal('toggle')
    }
  }

}

var numPages = 0;

var pdfDoc = null,
  pageNum = 1,
  pageNumMultiple = 1,
  pageRendering = false,
  pageNumPending = null,
  scale = 1.2,
  canvas = document.getElementById('canvasPlace'),
  ctx = canvas.getContext('2d');

function renderPage(num) {
  pageRendering = true;
  // Using promise to fetch the page
  pdfDoc.getPage(num).then(function (page) {
    var viewport = page.getViewport({
      scale: scale
    });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Render PDF page into canvas context
    var renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };
    var renderTask = page.render(renderContext);

    // Wait for rendering to finish
    renderTask.promise.then(function () {
      pageRendering = false;
      if (pageNumPending !== null) {
        // New page rendering is pending
        renderPage(pageNumPending);
        pageNumPending = null;
      }
    });
  });

  // Update page counters
  $('.currPage').html(num);
}

function queueRenderPage(num) {
  if (pageRendering) {
    pageNumPending = num;
  } else {
    renderPage(num);
  }
}

/**
 * Displays previous page.
 */
function onPrevPage() {
  if (pageNum <= 1) {
    return;
  }
  pageNum--;
  $('.clearingCanvas').attr('data-number', pageNum);
  queueRenderPage(pageNum);
}

function onNextPage() {
  if (pageNum >= pdfDoc.numPages) {
    return;
  }
  pageNum++;
  $('.clearingCanvas').attr('data-number', pageNum);
  queueRenderPage(pageNum);
}

$(document).on('click', '.deleteAttachment', async function () {
  let fileId = $(this).data('id');
  let idTask = $(this).data('idtask');
  let groupId = $(this).data('groupid');

  Swal.fire({
    title: 'Are you sure to delete this attachment?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, Delete it!',
    showLoaderOnConfirm: true,
    preConfirm: async () => {
      let formAttachmentFile = new FormData();
      let dataFile = JSON.stringify({
        "fileId": fileId,
      })
      formAttachmentFile.append('file', dataFile);
      formAttachmentFile.append('id', idTask);
      loadingActivated();
      let attachFile = await globalAttachFile(formAttachmentFile, 'PUT');
      loadingDeactivated();
      if (attachFile == '200') {
        callNotif({
          type: 'success',
          text: attachFile.responseMessage
        })
        refreshTableData(groupId);
      }
    },
    allowOutsideClick: () => !Swal.isLoading()
  })


})

$(document).on('click', '.showAttachment', async function () {
  let fileId = $(this).data('id');
  let idTask = $(this).data('idtask');
  let groupId = $(this).data('groupid');
  loadingActivated();
  let attachShow = await showAttachmentDetails(fileId);
  loadingDeactivated();
  if (attachShow.responseCode == '200') {
    $('[data-original-title]').popover('hide');

    if (attachShow.data.path.includes('pdf')) {
      $('#canvasDoc').attr('src', '').addClass('d-none');
      $('#canvasPlace').removeClass('d-none');
      activeModalAttachmentFile();
      $('.clearingCanvas').addClass('d-none');
      $('.savingCanvas').addClass('d-none');
      $('.enablingCanvas').removeClass('d-none');

      $('.savingCanvas').data('id', fileId);
      $('.savingCanvas').data('idTask', idTask);
      $('.savingCanvas').data('groupid', groupId);
      $('#backupCanvas').attr("src", '');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';
      let url = attachShow.data.source;
      var pdfData = atob(url.split('data:application/pdf;base64,')[1]);
      var loadingTask = pdfjsLib.getDocument({
        data: pdfData
      });
      loadingTask.promise.then(async function (pdf) {
          // Fetch the first page
          var pageNumber = 1;
          //How many pages it has
          numPages = pdf.numPages;
          pdfDoc = pdf;

          if (numPages > 1) {
            $('.savingCanvas').attr('data-pdf', true);
            $('.savingCanvas').attr('data-multiple', true);
            $('.enablingCanvas').attr('data-pdf', true);
            $('.enablingCanvas').attr('data-multiple', true);
            pageNum = 1;
            pageNumMultiple = 1;
            window['signatureMultiple'] = [];
            $('#newPlaces').empty()
            pdf.getPage(pageNumber).then(handlePages)
            // $('#canvasPlace').addClass('d-none');
            if ($('.legendData').length == 0) {
              let legend = '<div class="legendData d-flex align-items-center"><button class="btn btn-warning" id="prev">Previous</button><button class="btn btn-warning" id="next">Next</button></div>'
              $(legend).insertAfter($('#canvasPlace'));
              document.getElementById('prev').addEventListener('click', onPrevPage);
              document.getElementById('next').addEventListener('click', onNextPage);
              $('<span style="margin-left:auto;">Page : <span class="currPage"></span> / ' + numPages + '</span>').appendTo($('.legendData'));
            }

            renderPage(pageNum);
            await activateCanvas(attachShow.data.source, true);
          } else {
            $('.savingCanvas').attr('data-pdf', true);
            $('.savingCanvas').attr('data-multiple', false);
            $('.enablingCanvas').attr('data-pdf', true);
            $('.enablingCanvas').attr('data-multiple', false);
            $('.legendData').remove();
            pdf.getPage(pageNumber).then(function (page) {
              var scale = 1.2;
              var viewport = page.getViewport({
                scale: scale
              });

              // Prepare canvas using PDF page dimensions
              var canvas = document.getElementById('canvasPlace');
              var context = canvas.getContext('2d');
              canvas.height = viewport.height;
              canvas.width = viewport.width;

              canvas.toBlob(function (blob) {
                console.log('blobed', blob);
              }, 'image/jpeg');

              // Render PDF page into canvas context
              var renderContext = {
                canvasContext: context,
                viewport: viewport
              };
              var renderTask = page.render(renderContext);
              renderTask.promise.then(function () {
                console.log('Page rendered');
              });
            });
            await activateCanvas(attachShow.data.source);
          }
        },
        function (reason) {
          // PDF loading error
          console.error(reason);
        });

    } else if (attachShow.data.path.includes('doc') || attachShow.data.path.includes('docx')) {
      activeModalAttachmentFile();
      $('.clearingCanvas').addClass('d-none');
      $('.savingCanvas').addClass('d-none');
      $('.enablingCanvas').addClass('d-none');
      $('#backupCanvas').attr("src", '');
      $('.legendData').remove();

      $('#canvasDoc').attr('src', 'https://view.officeapps.live.com/op/embed.aspx?src=' + attachShow.data.path).removeClass('d-none');
      $('#canvasPlace').addClass('d-none');
      $('.downloadCanvas').remove()
      toastrNotifFull('view only document', 'warning');
    } else {
      $('#canvasDoc').attr('src', '').addClass('d-none');
      $('#canvasPlace').removeClass('d-none');
      activeModalAttachmentFile();

      $('.clearingCanvas').addClass('d-none');
      $('.savingCanvas').addClass('d-none');
      $('.enablingCanvas').removeClass('d-none');

      $('.savingCanvas').attr('data-id', fileId);
      $('.savingCanvas').attr('data-idTask', idTask);
      $('.savingCanvas').attr('data-groupid', groupId);
      $('#backupCanvas').attr("src", '');
      $('.savingCanvas').attr('data-pdf', false);
      $('.savingCanvas').attr('data-multiple', false);
      $('.legendData').remove();
      await activateCanvas(attachShow.data.source);
    }

  }
})

function handlePages(page) {
  //This gives us the page's dimensions at full scale
  var scale = 1.2;
  var viewport = page.getViewport({
    scale: scale
  });

  //We'll create a canvas for each page to draw it on
  var canvas = document.createElement("canvas");
  canvas.setAttribute('id', 'canvasMultiple' + pageNumMultiple)
  var context = canvas.getContext('2d');
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  //Draw it on the canvas
  let paged = page.render({
    canvasContext: context,
    viewport: viewport
  });

  paged.promise.then(function () {
    document.getElementById('newPlaces').appendChild(canvas);
    activateCanvasMultiple(pageNumMultiple)

    //Move to next page

    pageNumMultiple++;
    if (pdfDoc !== null && pageNumMultiple <= numPages) {
      $('#newPlaces').empty()
      pdfDoc.getPage(pageNumMultiple).then(handlePages);
    }
  });

}

async function activateCanvasMultiple(id) {
  let canvasMultiple = document.querySelector("#canvasMultiple" + id);
  var image = new Image();
  image.id = 'img' + id
  image.src = canvasMultiple.toDataURL();
  // document.getElementById('image_for_crop').appendChild(image);
  $(image).insertAfter("#canvasMultiple" + id)
  let signaturePadMultiple = new SignaturePad(canvasMultiple);

  signaturePadMultiple.on();
  // Draws signature image from data URL.
  // Returns signature image as an array of point groups
  const data = signaturePadMultiple.toData();

  // Draws signature image from an array of point groups
  signaturePadMultiple.fromData(data);

  window['signatureMultiple'].push({
    // in browser is supported loading images via url from reference by name in images
    id: id,
    // image: signaturePadMultiple.toDataURL('image/png'),
    imageBackup: $('#img' + id).attr('src'),
    image: canvasMultiple.toDataURL(),
    width: 700,
    height: 1000
  });
}

$(document).on('mouseenter', '.fileAttach', function () {
  let id = $(this).data('id');
  let groupid = $(this).data('groupid');
  let name = $(this).data('name');

  if ($('.popover').length > 0) {
    $(".popover").each(function () {
      $(this).popover("dispose");
    });
  }
  triggerPopoverFileAttachment(id, groupid, name);
})

function activeModalAttachmentFile() {
  $('#modalAttachmentFile').modal({
    show: true,
  });
  $('#modalAttachmentFile').on('hidden.bs.modal', function () {
    window['signaturePad'].off()
  });
}

async function triggerPopoverFileAttachment(id, groupid, name) {
  if ($('.fileAttach[data-id=' + id + ']').data("bs.popover") == undefined) {
    let htmlMember = '';
    window['fileAttachment' + id].forEach(element => {
      htmlMember += '<li class="list-group-item d-flex justify-content-between align-items-center">' + element.name + '<span class="d-flex justify-content-between col-lg-5"><i class="far fa-eye fa-lg showAttachment ml-3" style="cursor:pointer;" data-groupid=' + groupid + ' data-idtask=' + id + ' data-id=' + element.fileId + '></i><i class="far fa-trash-alt fa-lg deleteAttachment ml-3" style="cursor:pointer;" data-groupid=' + groupid + ' data-idtask=' + id + ' data-id=' + element.fileId + '></i></span></li> '
    });
    let empHtmlTeam = '<div class="row p-2 mb-2"><div class="col-lg-12"><ul class="list-group list-group-flush">' + htmlMember + '</ul></div></div>';

    $('.fileAttach[data-id=' + id + ']').attr('tabindex', '0');
    $('.fileAttach[data-id=' + id + ']').attr('data-toggle', 'popover');

    $('.fileAttach[data-id=' + id + ']').popover({
      content: empHtmlTeam,
      placement: "right",
      html: true,
      sanitize: false
    });
  }
}

$(document).on('click', '.btnMenu', function (e) {
  let owner = $(this).data('owner');
  let pic = $(this).data('pic');
  if (ct.name == owner || ct.id_employee == pic) {
    $('.placeBody').empty();
    let renameText = '<input type="text" class="form-control mb-3 renameInput" placeholder="' + $(this).data('name') + '" />'
    $('.placeBody').append(renameText);
    let menuTemplate = '<div class="row"><div class="col-lg-6" style="text-align:center;"><button class="text-white rounded-pill btn btn-warning menuRename">Rename</button></div><div class="col-lg-6" style="text-align:center;"><button class="text-white rounded-pill btn btn-danger menuDelete">Delete</button></div></div></div>';
    $('.placeBody').append(menuTemplate);
    $('.menuRename').attr('data-id', $(this).data('id'));
    $('.menuRename').attr('data-boardid', $(this).data('boardid'));
    $('.menuRename').attr('data-name', $(this).data('name'));
    $('.menuRename').attr('data-boardname', $(this).data('boardname'));
    $('.menuRename').attr('data-camelized', $(this).data('camelized'));
    $('.menuRename').attr('data-boardtype', $(this).data('boardtype'));

    $('.menuDelete').attr('data-id', $(this).data('id'));
    $('.menuDelete').attr('data-name', $(this).data('name'));
    $('.menuDelete').attr('data-boardid', $(this).data('boardid'));
    $('.menuDelete').attr('data-boardname', $(this).data('boardname'));
    $('.menuDelete').attr('data-camelized', $(this).data('camelized'));
    $('.menuDelete').attr('data-boardtype', $(this).data('boardtype'));

    activeModalGroupTask();
  } else {
    e.preventDefault();
    toastrNotifFull('You do not have access', 'error')
  }
})

$(document).on('click', '.btnDoneGT', async function () {
  let idDone = $(this).data('id');
  let renameBoardId = $(this).data('boardid');
  let statusGT = $(this).data('status')
  let bodyGroup = {
    '_id': idDone,
    'board_id': renameBoardId,
    'status': statusGT == false ? '1' : '0'
  }
  console.log('bod',bodyGroup);
  loadingActivated();
  return await editGroupTask(bodyGroup).then(async function (result) {
    loadingDeactivated();
    let param;
    if (result.responseCode == '200') {
      param = {
        type: 'success',
        text: result.responseMessage
      };
      callNotif(param);
      if (localStorage.getItem('favList')) {
        let parsed = JSON.parse(localStorage.getItem('favList'));
        parsed.forEach(element => {
          if (element.id == idDone) {
            let parss = JSON.parse(window.atob(element.data))
            parss.status = !statusGT
            element.data = window.btoa(JSON.stringify(parss))
            return;
          }
        });
        window['favList'] = parsed;
        localStorage.setItem('favList', JSON.stringify(parsed));
      }
      $('.boardList[data-id=' + renameBoardId + ']').click()
    } else if (result.responseCode == '401') {
      logoutNotif();
    } else {
      param = {
        type: 'error',
        text: result.responseMessage
      };
      callNotif(param);
      return false;
    }
  });
})

$(document).on('click', '.toSetting', function () {
  $.ajax({
    url: 'setting',
    method: 'GET',
    headers: {
      "Content-Type": "application/json",
      "Accept": "*/*",
      "Cache-Control": "no-cache",
    },
    success: async function (result) {
      $('#wrapper').empty();
      $('#wrapper').removeClass('d-flex');
      $('#wrapper').html(result);
      $('#modalNav').modal('hide')

      loadingActivated()
      let slackSettings = await getSlackSettings();
      loadingDeactivated()
      if (slackSettings.data[0].slack_notif == 'on') $('.switchSlackStatus').prop('checked', true);

      if(slackSettings.data[0].telegram_notif == 'on') $('.switchTelegramStatus').prop('checked', true);
    }
  })
})

$(document).on('click', '.settingTelegram', function () {
  var collapsed = $(this).attr('aria-expanded');
  if (collapsed == 'true') {
    $('.switchTelegram').css('top','6%')
    globalLoad('settingTelegram', $(this).data('name'), '', true);
    showToggleScopeTele($(this).data('id'), $(this).data('name'));
  } else {
    $('.switchTelegram').css('top','25%')
  }
})

$(document).on('click', '.settingSlack', function () {
  var collapsed = $(this).attr('aria-expanded');
  if (collapsed == 'true') {
    $('.switchSlack').css('top','6%')
    globalLoad('settingSlack', $(this).data('name'), '', true);
    showToggleScope($(this).data('id'), $(this).data('name'));
  } else {
    $('.switchSlack').css('top','25%')
  }
})

async function showToggleScopeTele(id, name) {
  $('#fort' + id).empty();
  console.log('kok toggle', id);
  let telegramSettings = await getSlackSettings();
  var tag = '<ul class="list-group p-3 col selectedChannelDataTelegram">';
    tag += '<li class="list-group-item">' +
      '<div class="row liSelectedTele">' +
      '<div class="col-lg-9 listOfChannelsTelegram" style="text-align:start;align-self:center;">' +
      '<h5 class="labelTele">Selected Channel</h5>' +
      '</div>' +
      // '<div class="col-lg-3" style="text-align:end;"><button class="text-white btn-md rounded-pill btn amber lighten-1" id="addChannelSlack" type="button">Add Channel</button></div>' +
      '</div></li>';
    tag += '</ul>';
    $('#fort' + id).append(tag);

  if (telegramSettings.responseCode == '200') {
    if (telegramSettings.data[0].telegram_channels.length > 0) {
      let dataTelegram = telegramSettings.data[0].telegram_channels;
      window['dataTelegram'] = dataTelegram;
      let tags = '';
      dataTelegram.forEach(element => {
        tags += '<div class="chip waves-effect mr-2" data-id='+element.chatId+'>' + element.name + '<i data-id=' + element.chatId + ' class="removeChannelTelegram fas fa-times fa-xs ml-2 mt-1"></i></div>'
      });
      $('.listOfChannelsTelegram').append(tags);
      $('.liSelectedTele').append('<div class="col-lg-3" style="text-align:end;"><a href="#" class="removeAllChannelTelegram">Remove All</a></div>')
    }
    let channelTelegram = await getChannelTelegram();
    globalUnLoad('settingTelegram', name, '', true);
    if (channelTelegram != 500) {
      let tags = '<ul class="list-group p-3 col availableChannelDataTelegram"><li class="list-group-item"><div class="row liAvailableTelegram"><div class="col-lg-9 listOfAvailableChannelsTelegram" style="text-align:start;align-self:center;"><h5>Available Channel</h5></div>'
      tags += '</div></li></ul>';
      let tagsChip = '';
      if(window['dataTelegram'] != undefined){
        let difference = objDiffTelegram(channelTelegram,window['dataTelegram']);
        window['availTelegram'] = difference;
        if(difference.length > 0){
          difference.forEach(element => {
            tagsChip += '<div class="chip waves-effect mr-2" data-id='+element.chatId+'>' + element.name + '<i data-id=' + element.chatId + ' class="addChannelTagsTelegram fas fa-plus fa-xs ml-2 mt-1"></i></div>'
          });
          $('#fort' + id).append(tags)
        }
      } else {
        window['availTelegram'] = channelTelegram
        channelTelegram.forEach(element => {
          tagsChip += '<div class="chip waves-effect mr-2" data-id='+element.chatId+'>' + element.name + '<i data-id=' + element.chatId + ' class="addChannelTagsTelegram fas fa-plus fa-xs ml-2 mt-1"></i></div>'
        });
        $('#fort' + id).append(tags)
      }
      try {
        if(window['availTelegram'].length > 0){
          $('.liAvailableTelegram').append('<div class="col-lg-3" style="text-align:end;"><a href="#" class="addAllChannelTelegram">Add All</a></div>')
        }
      } catch (error) {
        
      }
      $('.listOfAvailableChannelsTelegram').append(tagsChip)

      if(telegramSettings.data[0].telegram_notif == 'off') {
        $('.selectedChannelDataTelegram').addClass('disableElement');
        $('.availableChannelDataTelegram').addClass('disableElement');
      } 
    }
    
  } else if (telegramSettings.responseCode == '404') {
    globalUnLoad('settingTelegram', name, '', true);
    $('.selectedChannelDataTelegram').addClass('disableElement');
    $('.labelTele').html('')
    $('.labelTele').html('please activate telegram')
  } else {
    globalUnLoad('settingTelegram', name, '', true);
    let param = {
      type: 'error',
      text: telegramSettings.responseMessage
    };
    callNotif(param);
  }
}

async function showToggleScope(id, name) {
  $('#for' + id).empty();
  console.log('kok toggle', id);
  let slackSettings = await getSlackSettings();
  var tag = '<ul class="list-group p-3 col selectedChannelData">';
    tag += '<li class="list-group-item">' +
      '<div class="row liSelected">' +
      '<div class="col-lg-9 listOfChannels" style="text-align:start;align-self:center;">' +
      '<h5 class="labelSlack">Selected Channel</h5>' +
      '</div>' +
      // '<div class="col-lg-3" style="text-align:end;"><button class="text-white btn-md rounded-pill btn amber lighten-1" id="addChannelSlack" type="button">Add Channel</button></div>' +
      '</div></li>';
    tag += '</ul>';
    $('#for' + id).append(tag);

  if (slackSettings.responseCode == '200') {
    if (slackSettings.data[0].slack_channels.length > 0) {
      let dataSlack = slackSettings.data[0].slack_channels;
      window['dataSlack'] = dataSlack;
      let tags = '';
      dataSlack.forEach(element => {
        tags += '<div class="chip waves-effect mr-2" data-id='+element._id+'>' + element.name + '<i data-id=' + element._id + ' class="removeChannel fas fa-times fa-xs ml-2 mt-1"></i></div>'
      });
      $('.listOfChannels').append(tags);
      $('.liSelected').append('<div class="col-lg-3" style="text-align:end;"><a href="#" class="removeAllChannel">Remove All</a></div>')
    }
    let channelSlack = await getChannelSlack();
    globalUnLoad('settingSlack', name, '', true);
    if (channelSlack != 500) {
      let tags = '<ul class="list-group p-3 col availableChannelData"><li class="list-group-item"><div class="row liAvailable"><div class="col-lg-9 listOfAvailableChannels" style="text-align:start;align-self:center;"><h5>Available Channel</h5></div>'
      tags += '</div></li></ul>';
      let tagsChip = '';
      if(window['dataSlack'] != undefined){
        let difference = objDiffSlack(channelSlack,window['dataSlack']);
        window['availSlack'] = difference;
        if(difference.length > 0){
          difference.forEach(element => {
            tagsChip += '<div class="chip waves-effect mr-2" data-id='+element._id+'>' + element.name + '<i data-id=' + element._id + ' class="addChannelTags fas fa-plus fa-xs ml-2 mt-1"></i></div>'
          });
          $('#for' + id).append(tags)
        }
      } else {
        window['availSlack'] = channelSlack
        channelSlack.forEach(element => {
          tagsChip += '<div class="chip waves-effect mr-2" data-id='+element._id+'>' + element.name + '<i data-id=' + element._id + ' class="addChannelTags fas fa-plus fa-xs ml-2 mt-1"></i></div>'
        });
        $('#for' + id).append(tags)
      }
      try {
        if(window['availSlack'].length > 0){
          $('.liAvailable').append('<div class="col-lg-3" style="text-align:end;"><a href="#" class="addAllChannel">Add All</a></div>')
        }
      } catch (error) {
        
      }
      $('.listOfAvailableChannels').append(tagsChip)

      if (slackSettings.data[0].slack_notif == 'off') {
        $('.selectedChannelData').addClass('disableElement');
        $('.availableChannelData').addClass('disableElement');
      } 
    }
    
  } else if (slackSettings.responseCode == '404') {
    globalUnLoad('settingSlack', name, '', true);
    $('.selectedChannelData').addClass('disableElement');
    $('.labelSlack').html('')
    $('.labelSlack').html('please activate slack')
  } else {
    globalUnLoad('settingSlack', name, '', true);
    let param = {
      type: 'error',
      text: slackSettings.responseMessage
    };
    callNotif(param);
  }
}

$(document).on('click','.removeAllChannel',async function(){
  let chooseArray = [];
  loadingActivated();
  let bodyChannel = {
    "slack_channels": JSON.stringify(chooseArray)
  }
  let submitted = await submitChannel(bodyChannel);
  loadingDeactivated()
  if(submitted.responseCode == '200'){
    window['dataSlack'] = [];
    let param = {
      type: 'success',
      text: submitted.responseMessage
    };
    callNotif(param);
    $('.settingSlack').click()
    setTimeout(() => {
      $('.settingSlack').click()
    }, 1250);
  } else {
    let paramSubmitted = {
      type: 'error',
      text: submitted.responseMessage
    };
    callNotif(paramSubmitted);
  }
})

$(document).on('click','.removeAllChannelTelegram',async function(){
  let chooseArray = [];
  loadingActivated();
  let bodyChannel = {
    "telegram_channels": JSON.stringify(chooseArray)
  }
  let submitted = await submitChannel(bodyChannel);
  loadingDeactivated()
  if(submitted.responseCode == '200'){
    window['dataTelegram'] = [];
    let param = {
      type: 'success',
      text: submitted.responseMessage
    };
    callNotif(param);
    $('.settingTelegram').click()
    setTimeout(() => {
      $('.settingTelegram').click()
    }, 1250);
  } else {
    let paramSubmitted = {
      type: 'error',
      text: submitted.responseMessage
    };
    callNotif(paramSubmitted);
  }
})


$(document).on('click','.addAllChannel',async function(){
  let chooseArray = [];
  window['availSlack'].forEach(element => {
    chooseArray.push(element._id);
  });
  if(window['dataSlack'] != undefined){
    chooseArray = window['dataSlack'].concat(chooseArray)
  }
  loadingActivated();
  let bodyChannel = {
    "slack_channels": JSON.stringify(chooseArray)
  }
  let submitted = await submitChannel(bodyChannel);
  loadingDeactivated()
  if(submitted.responseCode == '200'){
    let param = {
      type: 'success',
      text: submitted.responseMessage
    };
    callNotif(param);
    $('.settingSlack').click()
    setTimeout(() => {
      $('.settingSlack').click()
    }, 1250);
    
  } else {
    let paramSubmitted = {
      type: 'error',
      text: submitted.responseMessage
    };
    callNotif(paramSubmitted);
  }
})

$(document).on('click','.addAllChannelTelegram',async function(){
  let chooseArray = [];
  window['availTelegram'].forEach(element => {
    chooseArray.push(element);
  });
  if(window['dataTelegram'] != undefined){
    chooseArray = window['dataTelegram'].concat(chooseArray)
  }
  loadingActivated();
  let bodyChannel = {
    "telegram_channels": JSON.stringify(chooseArray)
  }
  let submitted = await submitChannel(bodyChannel);
  loadingDeactivated()
  if(submitted.responseCode == '200'){
    let param = {
      type: 'success',
      text: submitted.responseMessage
    };
    callNotif(param);
    $('.settingTelegram').click()
    setTimeout(() => {
      $('.settingTelegram').click()
    }, 1250);
  } else {
    let paramSubmitted = {
      type: 'error',
      text: submitted.responseMessage
    };
    callNotif(paramSubmitted);
  }
})

$(document).on('click','.addChannelTagsTelegram',async function(){
  let currentChoose = $(this).data('id');
  let dataAddTelegram = window['availTelegram'].filter(function (e) {
    return e.chatId == currentChoose;
  })
  // let chooseArray = [];
  // chooseArray.push(dataAddTelegram);
  if(window['dataTelegram'] != undefined){
    dataAddTelegram = window['dataTelegram'].concat(dataAddTelegram)
  }
  loadingActivated();
  let bodyChannel = {
    "telegram_channels": JSON.stringify(dataAddTelegram)
  }
  let submitted = await submitChannel(bodyChannel);
  loadingDeactivated()
  if(submitted.responseCode == '200'){
    let param = {
      type: 'success',
      text: submitted.responseMessage
    };
    callNotif(param);
    $('.settingTelegram').click()
    setTimeout(() => {
      $('.settingTelegram').click()
    }, 1250);
    
  } else {
    let paramSubmitted = {
      type: 'error',
      text: submitted.responseMessage
    };
    callNotif(paramSubmitted);
  }
})

$(document).on('click','.addChannelTags',async function(){
  let currentChoose = $(this).data('id');
  let chooseArray = [];
  chooseArray.push(currentChoose);
  if(window['dataSlack'] != undefined){
    chooseArray = window['dataSlack'].concat(chooseArray)
  }
  loadingActivated();
  let bodyChannel = {
    "slack_channels": JSON.stringify(chooseArray)
  }
  let submitted = await submitChannel(bodyChannel);
  loadingDeactivated()
  if(submitted.responseCode == '200'){
    let param = {
      type: 'success',
      text: submitted.responseMessage
    };
    callNotif(param);
    $('.settingSlack').click()
    setTimeout(() => {
      $('.settingSlack').click()
    }, 1250);
    
  } else {
    let paramSubmitted = {
      type: 'error',
      text: submitted.responseMessage
    };
    callNotif(paramSubmitted);
  }
})

$(document).on('click', '.removeChannelTelegram', async function () {
  let idChannel = $(this).data('id');
  let dataRemove = window['dataTelegram'].filter(function (e) {
    return e.chatId != idChannel;
  })
  let bodyChannel = {
    "telegram_channels": JSON.stringify(dataRemove)
  }
  loadingActivated();
  let removeChannel = await submitChannel(bodyChannel,true);
  loadingDeactivated();
  if(removeChannel.responseCode == '200') {
    window['dataTelegram'] = dataRemove;
    let param = {
      type: 'success',
      text: removeChannel.responseMessage
    };
    callNotif(param);
    $('.chip[data-id='+idChannel+']').remove();
    $('.settingTelegram').click()
    setTimeout(() => {
      $('.settingTelegram').click()
    }, 1250);
  } 
  else {
    let param = {
      type: 'error',
      text: removeChannel.responseMessage
    };
    callNotif(param);
  }
  
})

$(document).on('click', '.removeChannel', async function () {
  let idChannel = $(this).data('id');
  let dataRemove = window['dataSlack'].filter(function (e) {
    return e._id != idChannel;
  })
  let bodyChannel = {
    "slack_channels": JSON.stringify(dataRemove)
  }
  loadingActivated();
  let removeChannel = await submitChannel(bodyChannel,true);
  loadingDeactivated();
  if(removeChannel.responseCode == '200') {
    window['dataSlack'] = dataRemove;
    let param = {
      type: 'success',
      text: removeChannel.responseMessage
    };
    callNotif(param);
    $('.chip[data-id='+idChannel+']').remove();
    $('.settingSlack').click()
    setTimeout(() => {
      $('.settingSlack').click()
    }, 1250);
  } 
  else {
    let param = {
      type: 'error',
      text: removeChannel.responseMessage
    };
    callNotif(param);
  }
  
})

$(document).on('click', '.switchSlackStatus', async function () {
  var checkedMethod = $(this).is(':checked');
  let bodySlack;
  if (checkedMethod) {
    bodySlack = {
      "slack_notif": 'on'
    }
  } else {
    bodySlack = {
      "slack_notif": 'off'
    }
  }
  loadingActivated();
  let submitted = await submitActivationSlack(bodySlack);
  loadingDeactivated()
  if (submitted.responseCode == '200') {
    let paramSubmit = {
      type: 'success',
      text: submitted.responseMessage
    };
    callNotif(paramSubmit);
    $('.settingSlack').click()
  } else {
    $('.switchSlackStatus').prop('checked', false);
    let paramSubmitFailed = {
      type: 'success',
      text: submitted.responseMessage
    };
    callNotif(paramSubmitFailed);
  }
})

$(document).on('click', '.switchTelegramStatus', async function () {
  var checkedMethod = $(this).is(':checked');
  let bodyTelegram;
  if (checkedMethod) {
    bodyTelegram = {
      "telegram_notif": 'on'
    }
  } else {
    bodyTelegram = {
      "telegram_notif": 'off'
    }
  }
  loadingActivated();
  let submittedTele = await submitActivationSlack(bodyTelegram);
  loadingDeactivated()
  if (submittedTele.responseCode == '200') {
    let paramSubmit = {
      type: 'success',
      text: submittedTele.responseMessage
    };
    callNotif(paramSubmit);
    $('.settingTelegram').click()
  } else {
    $('.switchTelegramStatus').prop('checked', false);
    let paramSubmitFailed = {
      type: 'success',
      text: submittedTele.responseMessage
    };
    callNotif(paramSubmitFailed);
  }
})

function globalLoad(classContainer, name, idContainer = '', accordion = false) {
  let containLoading = '<div class="loader" data-loader=' + name + '>' +
    '<h4></h4>' +
    '<span></span>' +
    '<span></span>' +
    '<span></span>' +
    '</div>';
  let offsetData;
  if (idContainer != '') {
    offsetData = $('#' + idContainer).offset();
    $('#' + idContainer).css('pointer-events', 'none');
    $('#' + idContainer).css('opacity', '0.4');
  } else {
    offsetData = $('.' + classContainer).offset();
    if (accordion) {
      $('.' + classContainer + '[data-name="' + name + '"]').css('pointer-events', 'none');
      $('.' + classContainer + '[data-name="' + name + '"]').css('opacity', '0.4');
    } else {
      $('.' + classContainer).css('pointer-events', 'none');
      $('.' + classContainer).css('opacity', '0.4');
    }

  }
  $('.loader[data-loader="' + name + '"]').css('margin-top', offsetData.top);
  if ($('.loader[data-loader="' + name + '"]').length == 0) {
    if (idContainer) $(containLoading).insertBefore($('#' + idContainer));
    else $(containLoading).insertBefore($('.' + classContainer));
  }
}

function globalUnLoad(classContainer, name, idContainer = '', accordion = false) {
  $('.loader[data-loader="' + name + '"]').remove();
  if (idContainer != '') {
    $('#' + idContainer).css('pointer-events', 'auto');
    $('#' + idContainer).css('opacity', '1');
  } else {
    if (accordion) {
      $('.' + classContainer + '[data-name="' + name + '"]').css('pointer-events', 'auto');
      $('.' + classContainer + '[data-name="' + name + '"]').css('opacity', '1');
    } else {
      $('.' + classContainer).css('pointer-events', 'auto');
      $('.' + classContainer).css('opacity', '1');
    }
  }


}

function objDiffSlack(array1, array2) {
  var resultArray = []

  array2.forEach(function (destObj) {
      var check = array1.some(function (origObj) {
          if (origObj._id == destObj._id) return true
      })
      if (!check) {
          resultArray.push(destObj)
      }
  })

  array1.forEach(function (origObj) {
      var check = array2.some(function (destObj) {
          if (origObj._id == destObj._id) return true
      })
      if (!check) {
          resultArray.push(origObj)
      }
  })
  return resultArray
}

function objDiffTelegram(array1, array2) {
  var resultArray = []

  array2.forEach(function (destObj) {
      var check = array1.some(function (origObj) {
          if (origObj.chatId == destObj.chatId) return true
      })
      if (!check) {
          resultArray.push(destObj)
      }
  })

  array1.forEach(function (origObj) {
      var check = array2.some(function (destObj) {
          if (origObj.chatId == destObj.chatId) return true
      })
      if (!check) {
          resultArray.push(origObj)
      }
  })
  return resultArray
}


async function submitActivationSlack(bodyEdit) {
  return new Promise(async function (resolve, reject) {
    let genKeyActivationSlack = await getGenerateKey();
    let editSettingsBoard = {
      settings: {
        "async": true,
        "crossDomain": true,
        "url": "/submitActivationSlack",
        "method": "POST",
        "headers": {
          "Content-Type": "application/json",
          "Accept": "*/*",
          "Cache-Control": "no-cache",
          "secretKey": ct.secretKey,
          "token": ct.token,
          "signature": ct.signature,
          "keyencrypt": genKeyActivationSlack
        },
        "processData": false,
        "body": JSON.stringify(iterateObjectNewEncrypt(bodyEdit,genKeyActivationSlack)),
      }
    }
    let result = await ajaxCall({url:'submitActivationSlack',data:JSON.stringify(editSettingsBoard),credentialHeader:true,method:'POST'})
    resolve(result);
  })
}

async function submitChannel(bodyEdit, chip = true) {
  return new Promise(async function (resolve, reject) {
    let genKeySubmitChannel = await getGenerateKey();
    let editSettingsBoard = {
      settings: {
        "async": true,
        "crossDomain": true,
        "url": "/submitChannel",
        "method": "POST",
        "headers": {
          "Content-Type": "application/json",
          "Accept": "*/*",
          "Cache-Control": "no-cache",
          "secretKey": ct.secretKey,
          "token": ct.token,
          "signature": ct.signature,
          "keyencrypt": genKeySubmitChannel
        },
        "processData": false,
        "body": JSON.stringify(iterateObjectNewEncrypt(bodyEdit,genKeySubmitChannel)),
      }
    }
    let result = await ajaxCall({url:'submitChannel',data:JSON.stringify(editSettingsBoard),credentialHeader:true,method:'POST'})
    if (!chip) {
      if (result.responseCode == '200') {
        let param = {
          type: 'success',
          text: result.responseMessage
        };
        callNotif(param);
      } else if (result.responseCode == '401') {
        logoutNotif();
      } else {
        let param = {
          type: 'error',
          text: result.responseMessage
        };
        callNotif(param);
      }
    } else {
      resolve(result);
    }
  })
}

$(document).on('click', '.syncGoogle', async function () {
  let taskid = $(this).data('id');
  let groupId = $(this).data('groupid');
  let emailEmployee = ct.email;
  let idEmployee = ct.id_employee;
  let hostname = window.location.origin  + "/proman"

  let bodySync = {
    "employeeId": idEmployee,
    "taskId": taskid,
    "email": emailEmployee,
    "hostname": hostname
  }

  loadingActivated();
  let syncGoogleData = await syncGoogle(bodySync);
  loadingDeactivated()
  if (syncGoogleData.responseCode == '476') {
    var w = window.innerWidth / 2;
    var h = window.innerHeight / 3 * 2;
    window.open(syncGoogleData.data.url, "", `width=${w},height=${h}`);
  } else if (syncGoogleData.responseCode == '200') {
    callNotif({
      type: 'success',
      text: syncGoogleData.responseMessage
    })
    refreshTableData(groupId);
  } else {
    callNotif({
      type: 'error',
      text: syncGoogleData.responseMessage
    })
  }
})

$(document).on('click', '.btnFavorites', function () {
  let idFav = $(this).data('id');
  let nameFav = $(this).data('name');
  let dataAll = $(this).data('all');
  let from = $(this).data('from');
  let domain = window.location.hostname;
  let dataFav = {
    id: idFav,
    name: nameFav,
    data: dataAll,
    domain: domain
  }
  let parsed;
  let alreadyFav = false;
  if (localStorage.getItem('favList')) {
    parsed = JSON.parse(localStorage.getItem('favList'));
    parsed.forEach(element => {
      if (element.id == idFav) {
        alreadyFav = true;
        return;
      }
    });
  }

  if (!alreadyFav) {
    window['favList'].push(dataFav);
    localStorage.setItem('favList', JSON.stringify(window['favList']));
    toastrNotifFull('success pin group task : ' + nameFav + '');
    $('.favGT[data-id=' + idFav + ']').css('color', 'orange');
    $('#cardGT' + idFav + '').insertAfter($('.searchShortcut'))
    if ($('.pinLength').length > 0) {
      $('.pinLength').html(window['favList'].length + '<i class="fas fa-chevron-right ml-2"></i>')
    } else {
      let pinTag = '<div class="pinnedLabel mt-2 px-2 mb-4" style="font-size: x-large;cursor:pointer;padding:.75rem 1.25rem">Pinned<span class="float-right pinLength">' + window['favList'].length + '<i class="fas fa-chevron-right ml-2"></i></span></div>';
      $(pinTag).insertAfter($('.sidebar-heading'));
    }
  } else {
    window['favList'] = window['favList'].filter(function (el) {
      return el.id != idFav
    });
    localStorage.setItem('favList', JSON.stringify(window['favList']));
    toastrNotifFull('success unpin group task : ' + nameFav + '');
    $('.favGT[data-id=' + idFav + ']').css('color', 'initial');
    if (from == 'pinned') {
      $('#cardGT' + idFav + '').remove();
      if (window['favList'].length != 0)
        $('.pinLength').html(window['favList'].length + '<i class="fas fa-chevron-right ml-2"></i>')
      else
        $('.pinnedLabel').remove();
    } else
      $('#cardGT' + idFav + '').appendTo($('.accordionBoard'))
  }
})

$(document).on('mouseenter', '.teamStatus', function () {
  let name = $(this).data('name');
  let dataFor = $(this).data('for');
  let backupName;
  switch (name) {
    case "pending":
    case "working":
    case "stuck":
    case "review":
    case "done":
      backupName = $('select.chartTaskEmployee :selected').text();
      break;
  }
  switch (dataFor) {
    case 'teal':
      dataFor = 'dataPending'
      break;
    case 'orange':
      dataFor = 'dataWorking'
      break;
    case 'red':
      dataFor = 'dataStuck'
      break;
    case 'cadetblue':
      dataFor = 'dataReview'
      break;
    default:
      dataFor = 'dataDone'
      break;
  }
  triggerPopoverChartLegendTeam(name, dataFor, backupName);
})

async function triggerPopoverChartLegendTeam(name, status, backupName = '') {
  if ($('.teamStatus[data-name="' + name + '"]').data("bs.popover") == undefined) {
    let htmlLegendChart = '';
    window['datacanvasTask'].filter(function (e) {
      if (e.name == name && backupName == '') {
        for (let i = 0; i < e[status].length; i++) {
          htmlLegendChart += '<li class="list-group-item d-flex justify-content-between align-items-center">' + e[status][i].name + '<span style="float:right;cursor:pointer;"><i class="far fa-eye fa-lg ml-3 openTaskTeam" data-for="' + status + '" data-index=' + i + '></i></span></li> '
        }
      } else if (e.name == backupName) {
        for (let i = 0; i < e[status].length; i++) {
          htmlLegendChart += '<li class="list-group-item d-flex justify-content-between align-items-center">' + e[status][i].name + '<span style="float:right;cursor:pointer;"><i class="far fa-eye fa-lg ml-3 openTaskTeam" data-for="' + status + '" data-index=' + i + '></i></span></li> '
        }
      }
    })
    let legendHTML = '<div class="row p-2 mb-2"><div class="col-lg-12"><ul class="list-group list-group-flush">' + htmlLegendChart + '</ul></div></div>';

    $('.teamStatus[data-name="' + name + '"]').attr('tabindex', '0');
    $('.teamStatus[data-name="' + name + '"]').attr('data-toggle', 'popover');

    $('.teamStatus[data-name="' + name + '"]').popover({
      content: legendHTML,
      placement: "right",
      trigger: 'focus',
      html: true,
      sanitize: false
    });
  }
}

$(document).on('mouseenter', '.personalDetail', function () {
  let forType = $(this).data('for');
  triggerPopoverChartLegend(forType, capitalize(forType));
})

$(document).on('click', '.openTask', async function () {
  let idData = window['personalData'][0]['data' + $(this).data('for')][$(this).data('index')];
  loadingActivated();
  let idBoard = await getBoard({
    group_id: idData.group_id
  }, 'boardId');
  let boardid = idBoard[0]._id;
  if (boardid != undefined && boardid != null) {
    await checkGroupTaskRedirect('200', boardid, idData.group_id, idData._id);
    loadingDeactivated();
  } else loadingDeactivated();

})

$(document).on('click', '.openTaskTeam', async function () {
  let idData = window['personalData'][0][$(this).data('for')][$(this).data('index')];
  loadingActivated();
  let idBoard = await getBoard({
    group_id: idData.group_id
  }, 'boardId');
  let boardid = idBoard[0]._id;
  if (boardid != undefined && boardid != null) {
    await checkGroupTaskRedirect('200', boardid, idData.group_id, idData._id);
    loadingDeactivated();
  } else loadingDeactivated();

})

async function triggerPopoverChartLegend(type, capitalType) {
  if ($('.personalDetail[data-for=' + type + ']').data("bs.popover") == undefined) {

    let htmlLegendChart = '';
    for (let i = 0; i < window['data' + capitalType].length; i++) {
      htmlLegendChart += '<li class="list-group-item d-flex justify-content-between align-items-center">' + window['data' + capitalType][i] + '<span style="float:right;cursor:pointer;"><i class="far fa-eye fa-lg ml-3 openTask" data-for="' + capitalType + '" data-index=' + i + '></i></span></li> '
    }
    let legendHTML = '<div class="row p-2 mb-2"><div class="col-lg-12"><ul class="list-group list-group-flush">' + htmlLegendChart + '</ul></div></div>';

    $('.personalDetail[data-for=' + type + ']').attr('tabindex', '0');
    $('.personalDetail[data-for=' + type + ']').attr('data-toggle', 'popover');

    $('.personalDetail[data-for=' + type + ']').popover({
      content: legendHTML,
      placement: "right",
      trigger: 'focus',
      html: true,
      sanitize: false
    });

    // $('.popover-body').css('height','75vh');
    // $('.popover-body').css('overflow','auto');
  }
}

$(document).on('mouseenter', '.pic', function () {
  if (!$(this).hasClass('disableInputClick')) {
    let id = $(this).data('id');
    let groupid = $(this).data('groupid');
    let name = $(this).data('name');

    if ($('.popover').length > 0) {
      $(".popover").each(function () {
        $(this).popover("dispose");
      });
    }

    triggerPopoverPIC(id, groupid, name);
  }

})

$(document).on('change', '.emploPic', async function () {
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
    }]),
    'url': window.location.origin  + '/proman/employee?groupTaskId=' + groupid + '&taskId=' + id
  }
  let rand = (Math.floor(Math.random() * 4) + 1);
  $('.pic[data-id=' + id + ']').html('<div class="memberLogo" style="background:' + window['color' + val] + '" data-toggle="tooltip" data-placement="bottom" title="' + valName + '"><span class="initialPic ' + window['colorClass' + val] + '">' + getInitials(valName) + '</span></div>');
  await globalUpdateTask('pic', updatePic);

})

$(document).on('mouseenter', '.pic', function () {
  let id = $(this).data("id");
  if (!$('.pic[data-id=' + id + ']').children().hasClass('picVal')) {
    if (!$('.icon_user[data-id=' + id + ']').hasClass('fa-user-plus')) {
      $('.icon_user[data-id=' + id + ']').removeClass('far fa-user fa-lg');
      $('.icon_user[data-id=' + id + ']').addClass('fas fa-user-plus fa-lg');
    }

  }

})

$(document).on('mouseleave', '.pic', function () {
  let id = $(this).data("id");
  if (!$('.pic[data-id=' + id + ']').children().hasClass('picVal')) {
    if (!$('.icon_user[data-id=' + id + ']').hasClass('fa-user')) {
      $('.icon_user[data-id=' + id + ']').removeClass('fas fa-user-plus fa-lg');
      $('.icon_user[data-id=' + id + ']').addClass('far fa-user fa-lg');
    }

  }
})

/// for dismiss popover on click outside
$('html').on('click', function (e) {
  var l = $(e.target);
  if (~l[0].className.indexOf("fa-ellipsis-h") || ~l[0].className.indexOf("card-text") || ~l[0].className.indexOf("card-header") || ~l[0].className.indexOf("card-body") || ~l[0].className.indexOf("moreMember") || ~l[0].className.indexOf("list-group-item") || ~l[0].className.indexOf("bodyColor") || ~l[0].className.indexOf("teamBlock") || ~l[0].className.indexOf("popover") || ~l[0].className.indexOf("select2") || ~l[0].className.indexOf("removeAllTeam") || ~l[0].className.indexOf("emploPic") || ~l[0].className.indexOf("initialPic") || ~l[0].className.indexOf('memberLogo') || ~l[0].className.indexOf('modalOptions')) {
    return;
  } else if (typeof $(e.target).data('original-title') == 'undefined') {
    $('[data-original-title]').popover('hide');
  }
});
let popoverLegend = false;
$(document).on('mouseenter', '.moreLegend', function () {
  let id = $(this).data("id");
  if (!popoverLegend)
    triggerPopoverLegend(id);
})

async function triggerPopoverLegend(id) {
  let htmlLegend = '';
  window['legendLeft' + id].forEach(element => {
    htmlLegend += '<li class="list-group-item d-flex justify-content-between align-items-center"><div class="memberLogo mr-3" style="background:' + element.color + '"><span class="text-white">' + getInitials(element.account_name) + '</span></div>' + element.account_name + '</li> '
  });
  let empHtmlTeam = '<div class="row p-2 mb-2"><div class="col-lg-12"><ul class="list-group list-group-flush">' + htmlLegend + '</ul></div></div>';
  if ($('.moreLegend[data-id=' + id + ']').data("bs.popover") == undefined) {
    $('.moreLegend[data-id=' + id + ']').attr('tabindex', '0');
    $('.moreLegend[data-id=' + id + ']').attr('data-toggle', 'popover');

    $('.moreLegend[data-id=' + id + ']').popover({
      content: empHtmlTeam,
      placement: "bottom",
      html: true,
      sanitize: false
    });
  }
}

$(document).on('mouseenter', '.moreMember', function () {
  let id = $(this).data("id");
  if (!popoverTeam)
    triggerPopoverMemberList(id);
})

async function triggerPopoverMemberList(id) {
  let htmlMember = '';
  window['dataSpliceLeft' + id].forEach(element => {
    htmlMember += '<li class="list-group-item d-flex justify-content-between align-items-center"><div class="memberLogo mr-3" style="background:' + window['color' + element.account_id] + '"><span class="initialPic' + window['colorClass' + element.account_id] + ' text-white">' + getInitials(element.account_name) + '</span></div>' + element.account_name + '</li> '
  });
  let empHtmlTeam = '<div class="row p-2 mb-2"><div class="col-lg-12"><ul class="list-group list-group-flush">' + htmlMember + '</ul></div></div>';
  let joinHtmlTeam = empHtmlTeam;
  $('.team[data-id=' + id + ']').popover('dispose');
  if ($('.moreMember[data-id=' + id + ']').data("bs.popover") == undefined) {
    $('.moreMember[data-id=' + id + ']').attr('tabindex', '0');
    $('.moreMember[data-id=' + id + ']').attr('data-toggle', 'popover');

    $('.moreMember[data-id=' + id + ']').popover({
      content: joinHtmlTeam,
      placement: "right",
      html: true,
      sanitize: false
    });
  }
}

$(document).on('mouseleave', '.team', function () {
  let id = $(this).data("id");
  if (!$('.team[data-id=' + id + ']').children().hasClass('picVal')) {
    if (!$('.icon_team[data-id=' + id + ']').hasClass('fa-user')) {
      $('.icon_team[data-id=' + id + ']').removeClass('fas fa-user-plus fa-lg');
      $('.icon_team[data-id=' + id + ']').addClass('far fa-user fa-lg');
    }
  }

  if (!$('.team[data-id=' + id + ']').children().hasClass('addTeamIcon')) {
    $('.addTeamIcon[data-id=' + id + ']').addClass('d-none');
  }
})

$(document).on('mouseenter', '.team', function (e) {
  if (!$(this).hasClass('disableInputClick')) {
    let id = $(this).data("id");
    let groupid = $(this).data('groupid');
    let name = $(this).data('name');
    let haveTeam = $(this).data('team');
    window['dataTeam' + id + ''] = [];
    if (!$('.team[data-id=' + id + ']').children().hasClass('addTeamIcon')) {
      if (haveTeam) {
        $('.addTeamIcon[data-id=' + id + ']').removeClass('d-none');
      } else {
        if (!$('.icon_team[data-id=' + id + ']').hasClass('fa-user-plus')) {
          $('.icon_team[data-id=' + id + ']').removeClass('far fa-user fa-lg');
          $('.icon_team[data-id=' + id + ']').addClass('fas fa-user-plus fa-lg');
        }
      }
    }

    if ($('[data-original-title]').length > 0) {
      $('[data-original-title]').popover('hide')
    }

    triggerPopoverTeam(id, haveTeam, groupid, name);
  }
})
let popoverTeam = false;
async function triggerPopoverTeam(id, haveTeam, groupid, name) {
  let empHtmlTeam = '<div class="row teamBlock p-2 mb-2"><div class="col-lg-12 teamBlock"><select id="employeeTeam" data-team=' + haveTeam + ' data-groupid="' + groupid + '" data-name="' + name + '" data-id=' + id + ' class="form-control emploTeam"></select></div></div>';
  let removeAll = '<div class="row teamBlock p-2 mb-2"><div class="col-lg-12 teamBlock"><button type="button" class="btn btn-danger removeAllTeam" data-groupid="' + groupid + '" data-name="' + name + '" data-id=' + id + ' style="width:100%">Remove All</button></div></div>';
  let submitTeam = '<div class="row teamBlock p-2 mb-2"><div class="col-lg-12 teamBlock"><button type="button" class="btn btn-success submitTeam" data-groupid="' + groupid + '" data-name="' + name + '" data-id=' + id + ' style="width:100%">Done</button></div></div>';
  let joinHtmlTeam = empHtmlTeam + removeAll + submitTeam;

  if ($('.team[data-id=' + id + ']').data("bs.popover") == undefined) {
    $('.team[data-id=' + id + ']').attr('tabindex', '0');
    $('.team[data-id=' + id + ']').attr('data-toggle', 'popover');

    $('.team[data-id=' + id + ']').popover({
      content: joinHtmlTeam,
      placement: "right",
      html: true,
      sanitize: false
    });

    $('.team[data-id=' + id + ']').on('shown.bs.popover', async function () {
      console.log('berapa kali');
      popoverTeam = true;
      $('.emploTeam[data-id=' + id + ']').empty();
      let boardParent = $('.card[data-parent="parent' + groupid + '"]').data('boardaidi');
      let boardParentType = $('.card[data-parent="parent' + groupid + '"]').data('boardtype');
      switch (boardParentType) {
        case 'Main':
          let htmlEmptyMain = '<option selected>Choose Team</option>';
          $('.emploTeam[data-id=' + id + ']').append(htmlEmptyMain);
          loadingActivated()
          let employee = await getEmployee();
          loadingDeactivated()
          if (employee != 500) {
            employee.forEach(element => {
              let html = '<option class="opsi" data-id="' + id + '" value=' + element.employee_id + '>' + element.employee_name + '</option>';
              $('.emploTeam[data-id=' + id + ']').append(html);
            });

            let htmlEmptyMain = '<optgroup label="----------"></optgroup><option value="addTeam">+ Add More</option>';
            $('.emploTeam[data-id=' + id + ']').append(htmlEmptyMain);
          }
          break;
        case 'Private':
          let groupWindow = window['dataBoardMember' + boardParent + ''];
          let htmlEmpty = '<option selected>Choose Team</option>';
          $('.emploTeam[data-id=' + id + ']').append(htmlEmpty);
          groupWindow = await groupTaskGradeCheck(groupWindow);
          groupWindow.forEach(element => {
            let html = '<option class="opsi" data-id="' + id + '" value=' + element.account_id + '>' + element.account_name + '</option>';
            $('.emploTeam[data-id=' + id + ']').append(html);
          });
          let htmlEmptyData = '<optgroup label="----------"></optgroup><option value="addTeam">+ Add More</option>';
          $('.emploTeam[data-id=' + id + ']').append(htmlEmptyData);
          let htmlCrossDepartment = '<option value="addMemberDepartment">+ Add Member from Other Department</option>';
          $('.emploTeam[data-id=' + id + ']').append(htmlCrossDepartment);
          break;
      }
      console.log('current', window['dataCurrentTeam' + id + ''])
      if (window['dataCurrentTeam' + id + ''].length != 0) {
        let thisTeamMember = window['dataCurrentTeam' + id + ''];
        console.log('dalam', thisTeamMember);
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

      $('#employeeTeam[data-id=' + id + ']').select2({
        theme: "bootstrap",
        width: '100%'
      });

    })

    $('.team[data-id=' + id + ']').on('hidden.bs.popover', async function () {
      popoverTeam = false;
    })
  }
}

$(document).on('click', '.removeAllTeam', async function () {
  let id = $(this).data('id');
  let groupid = $(this).data('groupid');
  let name = $(this).data('name');

  let boardParent = $('.card[data-parent="parent' + groupid + '"]').data('boardaidi');
  let groupWindow = window['dataBoardMember' + boardParent + ''];
  let htmlEmptyMain = '<option selected>Choose Team</option>';
  $('.emploTeam[data-id=' + id + ']').empty();
  $('.emploTeam[data-id=' + id + ']').append(htmlEmptyMain);
  groupWindow.forEach(element => {
    let html = '<option class="opsi" data-id="' + id + '" value=' + element.account_id + '>' + element.account_name + '</option>';
    $('.emploTeam[data-id=' + id + ']').append(html);
  });
  let htmlEmptyAdditional = '<optgroup label="----------"></optgroup><option value="addTeam">+ Add More</option>';
  $('.emploTeam[data-id=' + id + ']').append(htmlEmptyAdditional);

  $('.emploTeam[data-groupid=' + groupid + ']').data('team', false)
  window['dataTeam' + id + ''] = [];
  window['dataCurrentTeam' + id] = [];
  let updateTeam = {
    '_id': id,
    'group_id': groupid,
    'name': name,
    'user_update': ct.name,
    'member': JSON.stringify([])
  }

  let htmlRemove = '<div class="colTeam" data-id=' + id + '><i class="far fa-user fa-lg icon_team" data-id="' + id + '"></i></div>';
  $('.team[data-id=' + id + ']').html(htmlRemove);
  $('.team[data-id=' + id + ']').data('team', false)
  await globalUpdateTask('team', updateTeam);
})



$(document).on('change', '.emploTeam', function () {
  let id = $(this).data('id');
  let groupid = $(this).data('groupid');
  let name = $(this).data('name');
  let haveTeam = $(this).data("team");
  let val = $('select#employeeTeam[data-id=' + id + ']').val();
  let valName = $('select#employeeTeam[data-id=' + id + '] :selected').text();
  let random = Math.floor(Math.random() * 4) + 1;

  if (val == 'addTeam') {
    if ($('#addTeam').length > 0) {
      $('#addTeam').attr('data-for', 'own');
      $('#addTeam').click()
    } else
      contactMore()
    return;
  }

  if (val == 'addMemberDepartment') {
    if ($('#addTeam').length > 0) {
      $('#addTeam').attr('data-for', 'department');
      $('#addTeam').click()
      setTimeout(() => {
        $('#addTeam').attr('data-for', 'own');
      }, 100);
    } else contactMore()
    return;
  }

  if (window['color' + val] == undefined) {
    window['color' + val] = getRandomColor();
  }

  if (haveTeam) {
    $('.colTeam[data-id=' + id + ']').append('<div class="memberLogo" style="background:' + window['color' + val] + '" data-id="' + id + '"><span class="initialPic ' + window['colorClass' + val] + '">' + getInitials(valName) + '</span></div>');
  } else {
    $('.colTeam[data-id=' + id + ']').html('<div class="memberLogo" style="background:' + window['color' + val] + '" data-id="' + id + '"><span class="initialPic ' + window['colorClass' + val] + '">' + getInitials(valName) + '</span></div>');
    $(this).data('team', true);
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
})

$(document).on('click', '.submitTeam', async function () {
  let id = $(this).data('id');
  let groupid = $(this).data('groupid');
  let name = $(this).data('name');

  let memberData;
  try {
    memberData = JSON.stringify(window['dataCurrentTeam' + id + ''][0].member)
  } catch (error) {
    memberData = JSON.stringify(window['dataCurrentTeam' + id + ''].member)
  }
  let updateTeam = {
    '_id': id,
    'group_id': groupid,
    'name': name,
    'user_update': ct.name,
    'member': memberData,
    'url': window.location.origin  + '/proman/employee?groupTaskId=' + groupid + '&taskId=' + id
  }
  await globalUpdateTask('team', updateTeam);
  refreshTableData(groupid);
})

$(document).on('click', '.duedate', async function () {
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
    minDate: new Date(),
    onSelect: async function (date) {
      let updateDueDate = {
        '_id': id,
        'group_id': groupid,
        'name': name,
        'user_update': ct.name,
        'due_date': moment(date).format('YYYY-MM-DD')
      }
      $('.duedate[data-id="' + id + '"]').html(date);
      await globalUpdateTask('duedate', updateDueDate);
    },
  });

})

$(document).on('click', '.timeline', async function () {
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

  const picker = new Litepicker({
    element: document.getElementById('date'),
    format: 'DD-MMM-YYYY',
    singleMode: false,
    numberOfColumns: 2,
    numberOfMonths: 2,
    resetButton: true,
    setup: (picker) => {
      picker.on('selected', (date1, date2) => {
        // some action
        let startDate = moment(date1.dateInstance).format('YYYY-MM-DD');
        let endDate = moment(date2.dateInstance).format('YYYY-MM-DD');
        $('.timeline[data-id=' + id + ']').html(startDate + ' - ' + endDate);

        let updateTimeline = {
          '_id': id,
          'group_id': groupid,
          'name': name,
          'user_update': ct.name,
          'timeline': JSON.stringify([startDate, endDate])
        }
        globalUpdateTask('timeline', updateTimeline);
      });
    },
  });
})

$(document).on('mouseenter', '.name', async function () {
  let id = $(this).data('id');
  let groupid = $(this).data('groupid');
  let name = htmlEntities($(this).data('name'))
  let valuenya = $(this).html();
  let html;
  console.log('value',valuenya,valuenya.length)
  if (valuenya.length > 14) {
    html = '<textarea class="form-control nameTask" data-id="' + id + '" data-groupid=' + groupid + ' data-name="' + name + '">' + name + '</textarea>'
  } else {
    html = '<input type="text" class="form-control nameTask" data-id="' + id + '" data-groupid=' + groupid + ' data-name="' + name + '" value="' + name + '">';
  }
  $('.name[data-id=' + id + ']').html(html);
  $('.nameTask[data-id="' + id + '"]').keypress(async function (e) {
    var key = e.which;
    let newValue = $('.nameTask[data-id=' + id + ']').val();
    if (key == 13) {
      if (newValue == '') {
        $('.name[data-id=' + id + ']').html(name);
      } else {
        let updateName = {
          '_id': id,
          'group_id': groupid,
          'name': htmlEntities(newValue),
          'user_update': ct.name
        }
        await globalUpdateTask('name', updateName);
        refreshTableData(groupid);
      }
    }
  });
})

$(document).on('mouseleave', '.name', function () {
  let id = $(this).data('id');
  let name = $(this).data('name');
  $('.name[data-id=' + id + ']').html(htmlEntities(name));
});

$(document).on('mouseenter', '.statusChild', function () {
  let id = $(this).data('id');
  let currentStatus = $(this).data('status');
  let pic = $(this).data('pic')
  let gtPic = $(this).data('gtpic')
  $(this).attr('tabindex', '0');
  $(this).attr('data-toggle', 'popover');
  $(this).attr('data-trigger', 'focus');
  let menuTemplate;
  try {
    if (typeof window['dataCurrentTeam' + id + ''] == "object" && window['dataCurrentTeam' + id + '']._id && gtPic != ct.id_employee) {
      let member = window['dataCurrentTeam' + id + ''].member;
      member.forEach(elements => {
        if (elements.account_id == ct.id_employee) {
          menuTemplate = '<div class="row p-2"><div class="col-lg-12 rowStat mediumPrio text-white">Working on it</div></div> <div class="row p-2"><div class="col-lg-12 rowStat highPrio text-white">Stuck</div></div><div class="row p-2"><div class="col-lg-12 rowStat reviewStat text-white">Waiting for review</div></div>';
        }
      });
    }
  } catch (error) {
    console.log('err', error);
  }
  if (pic == ct.id_employee || gtPic == ct.id_employee) {
    menuTemplate = '<div class="row p-2"><div class="col-lg-12 rowStat pendingPrio text-white">Pending</div></div> <div class="row p-2"><div class="col-lg-12 rowStat mediumPrio text-white">Working on it</div></div> <div class="row p-2"><div class="col-lg-12 rowStat highPrio text-white">Stuck</div></div> <div class="row p-2"><div class="col-lg-12 rowStat lowPrio text-white">Done</div></div> <div class="row p-2"><div class="col-lg-12 rowStat reviewStat text-white">Waiting for review</div></div> <div class="row p-2"><div class="col-lg-12 rowStat fixStat text-white">Need to Fix</div></div>';
  }
  $(this).popover({
    trigger: 'focus',
    content: menuTemplate,
    placement: "right",
    html: true
  });


  $(this).on('shown.bs.popover', function () {
    $('.rowStat').attr('data-id', id);
    $('.rowStat').attr('data-current', currentStatus);
    $('.pendingPrio').attr('data-status', 'Pending');
    $('.mediumPrio').attr('data-status', 'Working on it');
    $('.highPrio').attr('data-status', 'Stuck');
    $('.lowPrio').attr('data-status', 'Done');
    $('.reviewStat').attr('data-status', 'Waiting for review');
    $('.fixStat').attr('data-status', 'Need to fix');
  })

})

$(document).on('click', '.rowStat', async function () {
  let stat = $(this).data('status');
  let currentStat = $(this).data('current');
  let id = $(this).data('id');
  let groupid = $('.statusChild[data-id=' + id + ']').data('groupid');
  let name = $('.statusChild[data-id=' + id + ']').data('name');

  $('[data-original-title]').popover('dispose');

  $('.statusChild[data-id=' + id + ']').html(stat);

  if ($('.statusChild[data-id=' + id + ']').hasClass('reviewStat')) {
    $('.statusChild[data-id=' + id + ']').removeClass('reviewStat');
  }

  if ($('.statusChild[data-id=' + id + ']').hasClass('highPrio')) {
    $('.statusChild[data-id=' + id + ']').removeClass('highPrio');
  }

  if ($('.statusChild[data-id=' + id + ']').hasClass('mediumPrio')) {
    $('.statusChild[data-id=' + id + ']').removeClass('mediumPrio');
  }

  if ($('.statusChild[data-id=' + id + ']').hasClass('lowPrio')) {
    $('.statusChild[data-id=' + id + ']').removeClass('lowPrio');
  }

  if ($('.statusChild[data-id=' + id + ']').hasClass('pendingPrio')) {
    $('.statusChild[data-id=' + id + ']').removeClass('pendingPrio');
  }

  if ($('.statusChild[data-id=' + id + ']').hasClass('fixPrio')) {
    $('.statusChild[data-id=' + id + ']').removeClass('fixPrio');
  }

  switch (stat) {
    case 'Waiting for review':
      $('.statusChild[data-id=' + id + ']').addClass('reviewStat text-white');
      break;
    case 'Stuck':
      $('.statusChild[data-id=' + id + ']').addClass('highPrio text-white');
      break;
    case 'Working on it':
      $('.statusChild[data-id=' + id + ']').addClass('mediumPrio text-white');
      break;
    case 'Done':
      $('.statusChild[data-id=' + id + ']').addClass('lowPrio text-white');
      break;
    case 'Pending':
      $('.statusChild[data-id=' + id + ']').addClass('pendingPrio text-white');
      break;
    case 'Need to fix':
      $('.statusChild[data-id=' + id + ']').addClass('fixPrio text-white');
      break;
  }

  let dataStat = {
    '_id': id,
    'group_id': groupid,
    'status': stat,
    'name': name,
    'user_update': ct.name,
    'url': window.location.origin  + '/proman/employee?groupTaskId=' + groupid + '&taskId=' + id
  }
  await globalUpdateTask('status', dataStat);
  // await updateStatusProgressBar(dataStat, currentStat);
  refreshTableData(groupid);
})

$(document).on('mouseenter', '.priorityChild', function () {
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
  let groupid = $('.priorityChild[data-id=' + id + ']').data('groupid');
  let name = $('.priorityChild[data-id=' + id + ']').data('name');

  $('.priorityChild[data-id=' + id + ']').html(prio);
  if ($('.priorityChild[data-id=' + id + ']').hasClass('urgentPrio')) {
    $('.priorityChild[data-id=' + id + ']').removeClass('urgentPrio');
  }

  if ($('.priorityChild[data-id=' + id + ']').hasClass('highPrio')) {
    $('.priorityChild[data-id=' + id + ']').removeClass('highPrio');
  }

  if ($('.priorityChild[data-id=' + id + ']').hasClass('mediumPrio')) {
    $('.priorityChild[data-id=' + id + ']').removeClass('mediumPrio');
  }

  if ($('.priorityChild[data-id=' + id + ']').hasClass('lowPrio')) {
    $('.priorityChild[data-id=' + id + ']').removeClass('lowPrio');
  }

  switch (prio) {
    case 'Urgent':
      $('.priorityChild[data-id=' + id + ']').addClass('urgentPrio text-white');
      break;
    case 'High':
      $('.priorityChild[data-id=' + id + ']').addClass('highPrio text-white');
      break;
    case 'Medium':
      $('.priorityChild[data-id=' + id + ']').addClass('mediumPrio text-white');
      break;
    case 'Low':
      $('.priorityChild[data-id=' + id + ']').addClass('lowPrio text-white');
      break;
  }



  let dataPrio = {
    '_id': id,
    'group_id': groupid,
    'priority': prio,
    'name': name,
    'user_update': ct.name
  }
  await globalUpdateTask('priority', dataPrio);
  // await updatePriorityProgressBar(dataPrio, currentPrio);
  refreshTableData(groupid);
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
  if ($('.taskTitle' + groupId + '[data-name="' + groupName + '"]').val() == undefined || $('.taskTitle' + groupId + '[data-name="' + groupName + '"]').val() == '') {
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
  }
})