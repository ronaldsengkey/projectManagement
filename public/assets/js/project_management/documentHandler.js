'use strict'

function lightOrDark(color) {
  let brightness = tinycolor(color).getBrightness();
  if(brightness >= 140) return 'light';
  else return 'dark;'
}

$(document).on('change','.fileAttachData',async function(){
  let valid = true;
  let aidi = $(this).data('id');
  let attachmentFile = document.querySelector(`#fileAttachData`+aidi).files;
  let arrFile = [];
  let groupId = $(this).data('groupid');
  const forLoopFile = async _ => {
    for(var i=0;i<attachmentFile.length;i++){
      arrFile.push({file:await toBase64Comment(attachmentFile[i]),name:attachmentFile[i].name,type:attachmentFile[i].type})
    }
  }

  await forLoopFile()
  
  arrFile.forEach(element => {
      if(!element.type.includes('msword') && !element.type.includes('png') && !element.type.includes('sheet') && !element.type.includes('jpeg') && !element.type.includes('jpg') && !element.type.includes('pdf')){
        valid = false;
        return callNotif({type:'error',text: element.type + ' file is not supported'})
      }
  });
 
  if(valid){
    arrFile.forEach(element => {
      delete element.type;
    });
    let formAttachmentFile = new FormData();
    formAttachmentFile.append('file', JSON.stringify(arrFile));
    formAttachmentFile.append('id',aidi);
    loadingActivated();
    let attachFile =  await globalAttachFile(formAttachmentFile);
    document.getElementById('fileAttachData'+aidi).value= null;
    loadingDeactivated();
    if(attachFile == '200'){
      containerOnLoad('cardGT'+groupId+'')
          $('.headerGT[data-id='+groupId+']').click()
          setTimeout(() => {
              $('.headerGT[data-id='+groupId+']').click()
              
          }, 500);
          let intervalData = setInterval(() => {
              if($('#table'+groupId).length > 0){
                  clearInterval(intervalData)
                  containerDone('cardGT'+groupId+'')
              }
      }, 1000);
    }
  }
})

$(document).on('change','#commentFile',function(e){
    // let filename = e.target.files[0].name;
    // $('.commentFileName').html(filename);
    let checkTag = '<i class="fa fa-check position-absolute" style="color:green;""></i>';
    $(this).parent().append(checkTag);
})

$(document).on('change','.commentPictEach',function(e){
  // let filename = e.target.files[0].name;
  // let id = $(this).data('id');
  // $('.commentFileName'+id+'').html(filename);

  let checkTag = '<i class="fa fa-check position-absolute" style="color:green;""></i>';
  $(this).parent().append(checkTag);
})

$(document).on('change','.editReplyFile',function(){
  let checkTag = '<i class="fa fa-check position-absolute" style="color:green; top:95px; left:20px;"></i>';
  $(this).parent().append(checkTag);
})

$(document).on('keydown', '.commentInputArea', async function (ev) {
  
  if (ev.key === 'Enter') {
    let id = $(this).data('id');
    let newCommentValue = $(this).val();
    let commentFile;
    let base64CommentFile;
    if(newCommentValue.trim() != ''){
      commentFile = document.querySelector(`#commentFile`).files[0];
      if(commentFile != undefined){
          let compressedFile = await toCompress(document.querySelector(`#commentFile`).files[0])
          base64CommentFile = await toBase64Comment(compressedFile);
      } else {
        base64CommentFile = '';
      }

      if (newCommentValue != '') {
        let formUpdateComment = new FormData();
      
        formUpdateComment.append('task_id', id);
        formUpdateComment.append('comment', newCommentValue);
        formUpdateComment.append('comment_file', base64CommentFile);
        formUpdateComment.append('user_create', ct.name);

        $('.commentInputArea[data-id=' + id + ']').attr('disabled', 'disabled')
        $(this).val('');
        $(this).blur();
        $(this).mouseleave();
        let addComment = await globalAddComment(formUpdateComment);
        console.log("addComment::", addComment);
        $('.commentInputArea[data-id=' + id + ']').removeAttr('disabled');
        if (addComment != 500) {
          let groupIdData = $('.commentTask[data-id='+id+']').data('groupid');

          let cardCommentNew = '<div class="card p-3 mb-3 cardForComment" data-id=' + addComment._id + '>' +
            '<div class="dropdown"><div style="text-align:end;"><i class="dropdown-toggle" data-offset="10,20" id="dropdownMenuComment' + addComment._id + '" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" data-feather="chevron-down"></i>' +
            '<div class="dropdown-menu" aria-labelledby="dropdownMenuComment' + addComment._id + '">' +
            '<a class="dropdown-item editComment" data-taskid=' + id + ' data-id=' + addComment._id + ' data-comment="' + addComment.comment + '">Edit Comment</a>' +
            '<a class="dropdown-item deleteComment" data-groupid='+groupIdData+' data-taskid=' + id + ' data-id=' + addComment._id + ' data-comment="' + addComment.comment + '">Delete Comment</a></div></div></div>' +
            '<blockquote class="blockquote mb-0 card-body" style="border-left:none;">' +
            '<div class="commentBody" data-id=' + addComment._id + '><p data-comment="' + addComment.comment + '">' + addComment.comment + '</p></div>' +
            '<footer class="blockquote-footer">' +
            '<small class="text-muted">' +
            addComment.user_create + '</small>' +
            '</footer>' +
            '</blockquote>';

          let emptyComment = '<div class="replyComment p-3 mb-3" data-id=' + addComment._id + '><div class="row mb-3"><div class="col-lg-2 nameReply" style="background:'+window['colorName'+addComment.user_create]+'"><span class="initialName">' + getInitials(ct.name) + '</span></div><div class="col-lg-8 align-self-center"><textarea data-index="0" data-replyid=' + addComment._id + ' class="form-control txtAreaReply" placeholder="Write a reply here (press enter to submit)"></textarea></div><div class="col-lg-2 labelCommentEach align-self-end"><label for="commentFile'+addComment._id+'" id="commentFileLabel"><img src="../public/assets/img/image.svg" width="30" height="30" /><p class="commentFileName'+addComment._id+'"></p></label><input id="commentFile'+addComment._id+'" type="file" /></div></div></div></div>';

          cardCommentNew += '<hr/>';
          cardCommentNew += emptyComment;

          cardCommentNew += '</div>';

          $('.commentContent[data-id=' + id + ']').prepend(cardCommentNew);

          if($('.commentTask[data-id='+id+']').data('available') == 'false' || $('.commentTask[data-id='+id+']').data('available') == false){
            containerOnLoad('cardGT'+groupIdData+'')
            $('.headerGT[data-id='+groupIdData+']').click()
            setTimeout(() => {
                $('.headerGT[data-id='+groupIdData+']').click()
                
            }, 500);
            let intervalData = setInterval(() => {
                if($('#table'+groupIdData).length > 0){
                    clearInterval(intervalData)
                    containerDone('cardGT'+groupIdData+'')
                }
            }, 1000);
          }
        }
      }
      setTimeout(() => {
        $('.commentInputArea').blur();
      }, 500);

      setTimeout(() => {
        $('.commentInputArea').mouseleave();
      }, 1000);
    } else {
      toastrNotifFull('please fill comment','info');
    }
  }
});

async function toCompress(file){
  return new Promise(async function(resolve,reject){
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
      toastrNotifFull('please fill comment reply','info');
    } else {

      let commentFile;
      let base64CommentFile;
      commentFile = document.querySelector(`#editReplyFile`+aidi).files[0];
      if(commentFile){
          let compressedFile = await toCompress(document.querySelector(`#editReplyFile`+aidi).files[0])
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

$(document).on('click','.filePrev',async function(){
  let imageData = $(this).data('image');
  $.fancybox.open('<img src="'+imageData+'"/>');
})

$(document).on('keydown', '.txtAreaReply', async function (ev) {
  if (ev.key === 'Enter') {
    let replyComment = $(this).val();
    if (replyComment.trim() == '') {
      toastrNotifFull('please fill comment reply','info');
    } else {

      let commentFile;
      let base64CommentFile;
      commentFile = document.querySelector(`.commentPictEach`).files[0];
      if(commentFile){
          let compressedFile = await toCompress(document.querySelector(`.commentPictEach`).files[0])
          base64CommentFile = await toBase64Comment(compressedFile);
      }

      let formUpdateComment = new FormData();
    
      formUpdateComment.append('comment_id', $(this).data('replyid'));
      formUpdateComment.append('comment', replyComment);
      formUpdateComment.append('comment_file', base64CommentFile);
      formUpdateComment.append('user_create', ct.name);

      let replyId = $(this).data('replyid');

      // console.log('reply atas', replyingComment);
      $(this).attr('readonly', true);
      let res = await globalUpdateReplyComment('POST', formUpdateComment);
      $(this).removeAttr('readonly');
      if (res != 500) {
        res.data = res.data[0];
        var maxId = Number.MIN_VALUE;
        $('.rowDelete').each(function (item) {
          maxId = Math.max(maxId, $(this).data('index'))
        });
        let indexNew = maxId + 1;
        let htmlReply = '<div class="row mb-3 rowDelete" data-index=' + indexNew + '><div class="col-lg-2 nameReply" style="background:'+window['colorName'+res.data.user_create]+'" data-toggle="tooltip" data-placement="bottom" title="' + res.data.comment + '"><span class="initialName">' + getInitials(res.data.user_create) + '</span></div><div class="col-lg-10"><div class="row"><div class="col-lg-10"><textarea data-aidi=' + res.data._id + ' data-index=' + indexNew + ' class="form-control txtAreaEdit" data-replyid='+replyId+' placeholder="Write a reply here (press enter to submit)">' + res.data.comment + '</textarea></div><div class="col-lg-2" style="align-self:center;"><i class="deleteReply" data-own=' + res.data._id + ' data-aidi=' + res.data._id + ' data-index=' + indexNew + ' data-id=' + res.data._id + ' data-feather="trash-2"></i></div></div></div></div></div>';
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
      param = {
        type: 'success',
        text: result.responseMessage
      };
      callNotif(param);
      $('#modalOptions').modal('toggle');
      $('a[data-id='+renameBoardId+']').click();
      $('#chartSection').remove();
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
          param = {
            type: 'success',
            text: result.responseMessage
          };
          callNotif(param);
          $('#modalOptions').modal('toggle');
          $('a[data-id='+deleteBoardId+']').click();
          $('#chartSection').remove();
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
          'task_id': taskid,
          // 'comment': newCommentEdited,
          // 'user_create': ct.name
          // 'comment_id': id,
          'comment': newCommentEdited,
          'user_create': ct.name,
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
    'task_id': taskid,
    'comment': commentNow,
    'user_create': ct.name
  }
  notifDeleteComment(deletedComment,groupId);
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
  let available = $('.commentTask[data-id='+id+']').data('available');
  $('.commentContent').attr('data-id', id);
  $('.commentInputArea').attr('data-id',id);
  $('.commentTaskName').html(taskName);
  $(".commentContent[data-id="+id+"]").empty();
  $(".commentContent[data-id="+id+"]").append('Getting comment data...');

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
    if(!$(".txtAreaReply").is(":focus")){
      $('.commentContent[data-id='+id+']').empty();
      $('.commentContent[data-id='+id+']').append('Getting comment data...');
      let commentData = await getComment(id);
      if (commentData != 500) {
        if (commentData.length > 0) {
          $('.commentContent[data-id='+id+']').empty('');
          await domComment(commentData, id);
        } else {
          $('.commentContent[data-id='+id+']').empty();
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
      if(window['color'+element.account_id] == undefined) choose = getRandomColor();
      else choose = window['color'+element.account_id];

      try {
        let colorCheck = lightOrDark(choose);
        if(colorCheck == 'light') window['colorClass'+element.user_create] = 'text-dark fontWeight400';
        else window['colorClass'+element.user_create] = 'text-white';
      } catch (error) {
        window['colorClass'+element.user_create] = 'text-white';
      }
    });
  } catch (e) {

  }

  feather.replace();

  $('.commentInputArea').attr('data-id', id);
})

async function triggerPopoverPIC(id,groupid,name){
  if($('.pic[data-id=' + id + ']').data("bs.popover") == undefined){

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

async function activateCanvas(url,pdf = false){
  var canvas = document.querySelector("#canvasPlace");
  var signaturePad = new SignaturePad(canvas);

  $('#backupCanvas').attr('src',url);
  // Returns signature image as data URL (see https://mdn.io/todataurl for the list of possible parameters)
  // signaturePad.toDataURL(); // save image as PNG
  // signaturePad.toDataURL("image/jpeg"); // save image as JPEG
  // signaturePad.toDataURL("image/svg+xml"); // save image as SVG

  // Draws signature image from data URL.
  // NOTE: This method does not populate internal data structure that represents drawn signature. Thus, after using #fromDataURL, #toData won't work properly.
  if(!pdf)
  signaturePad.fromDataURL(url);
  // Returns signature image as an array of point groups
  const data = signaturePad.toData();

  // Draws signature image from an array of point groups
  signaturePad.fromData(data);

  // Returns true if canvas is empty, otherwise returns false
  signaturePad.isEmpty();

  signaturePad.off();

  window['signaturePad']=signaturePad;
}

function enableCanvas(){
  window['signaturePad'].on();
}

function disableCanvas(){
  window['signaturePad'].off();
  clearCanvas()
}

function clearCanvas(){
  let backUpCanvas = $('#backupCanvas').attr('src');
  window['signaturePad'].clear();
  window['signaturePad'].fromDataURL(backUpCanvas);
}

$(document).on('click','.savingCanvas',async function(){
  let idFile = $(this).data("id");
  let idTask = $(this).data("idTask");
  let groupId = $(this).data('groupid');
  let pdf = $(this).data('pdf');
  let multiple = $(this).data('multiple')
  if(pdf && multiple){
    console.log('current page',parseInt($('.currPage').html()),window['signatureMultiple']);
    window['signatureMultiple'].forEach(element => {
      if(element.id == parseInt($('.currPage').html())){
        element.image = window['signaturePad'].toDataURL('image/jpeg')
      }
    });
    window['signatureMultiple'].forEach(element => {
      delete element.id;
    })
    console.log('awal',window['signatureMultiple'],pdf,multiple);
    await exportCanvas(idFile,idTask,groupId,window['signatureMultiple'],pdf,multiple);
  } else {
    await exportCanvas(idFile,idTask,groupId,window['signaturePad'].toDataURL('image/jpeg'),pdf,multiple);
  }
})

$(document).on('click','.enablingCanvas',function(){
  enableCanvas()
  $('.clearingCanvas').removeClass('d-none');
  $('.savingCanvas').removeClass('d-none');
  $('.disableSignature').removeClass('d-none');
  $('.enablingCanvas').addClass('d-none');
})

$(document).on('click','.disableSignature',function(){
  disableCanvas();
  $('.clearingCanvas').addClass('d-none');
  $('.savingCanvas').addClass('d-none');
  $('.disableSignature').addClass('d-none');
  $('.enablingCanvas').removeClass('d-none');
})

$(document).on('click','.clearingCanvas',function(){
  clearCanvas()
})

async function exportCanvas(fileId,idTask,groupId,file = window['signaturePad'].toDataURL('image/jpeg'),pdf = false,multiple = false) {
  var pageWidth = 700;
  var pageHeight = 1000;
  let contentData;
  if(pdf){
    if(!multiple){
      
      contentData = [
        {
          // in browser is supported loading images via url from reference by name in images
          image: file,
          width: pageWidth,
          height: pageHeight
        },
      ]
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
    console.log('conte',docDefinition);
    pdfMake.createPdf(docDefinition).download();
    // const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    // let fileDataPdf;
    // pdfDocGenerator.getDataUrl(async (dataUrl) => {
    //   console.log('data urlll',dataUrl);
    //   fileDataPdf = dataUrl;

    //   console.log('file ',fileDataPdf);
    //   let formAttachmentFile = new FormData();
    //   let dataFile = JSON.stringify({
    //       "fileId": fileId,
    //       "file": fileDataPdf
    //   })
    //   formAttachmentFile.append('file', dataFile);
    //   formAttachmentFile.append('id',idTask);
    //   loadingActivated();
    //   let attachFile =  await globalAttachFile(formAttachmentFile,'PUT');
    //   loadingDeactivated();
    //   if(attachFile == '200'){
    //     disableCanvas();
    //     containerOnLoad('cardGT'+groupId+'')
    //     $('.headerGT[data-id='+groupId+']').click()
    //     setTimeout(() => {
    //         $('.headerGT[data-id='+groupId+']').click()
    //     }, 500);
    //     let intervalData = setInterval(() => {
    //         if($('#table'+groupId).length > 0){
    //             clearInterval(intervalData)
    //             containerDone('cardGT'+groupId+'')
    //         }
    //     }, 1000);
    //     $('#modalAttachmentFile').modal('toggle')
    //   }
    // });
  } else {
    let formAttachmentFile = new FormData();
    let dataFile = JSON.stringify({
        "fileId": fileId,
        "file": file
    })
    formAttachmentFile.append('file', dataFile);
    formAttachmentFile.append('id',idTask);
    loadingActivated();
    let attachFile =  await globalAttachFile(formAttachmentFile,'PUT');
    loadingDeactivated();
    if(attachFile == '200'){
      disableCanvas();
      containerOnLoad('cardGT'+groupId+'')
      $('.headerGT[data-id='+groupId+']').click()
      setTimeout(() => {
          $('.headerGT[data-id='+groupId+']').click()
      }, 500);
      let intervalData = setInterval(() => {
          if($('#table'+groupId).length > 0){
              clearInterval(intervalData)
              containerDone('cardGT'+groupId+'')
          }
      }, 1000);
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
  pdfDoc.getPage(num).then(function(page) {
    var viewport = page.getViewport({scale: scale});
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Render PDF page into canvas context
    var renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };
    var renderTask = page.render(renderContext);

    // Wait for rendering to finish
    renderTask.promise.then(function() {
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
  queueRenderPage(pageNum);
}

function onNextPage() {
  if (pageNum >= pdfDoc.numPages) {
    return;
  }
  pageNum++;
  queueRenderPage(pageNum);
}

$(document).on('click','.showAttachment',async function(){
  let fileId = $(this).data('id');
  let idTask = $(this).data('idtask');
  let groupId = $(this).data('groupid');
  loadingActivated();
  let attachShow = await showAttachmentDetails(fileId);
  loadingDeactivated();
  if(attachShow.responseCode == '200'){
    $('[data-original-title]').popover('hide');
    activeModalAttachmentFile();
    $('.clearingCanvas').addClass('d-none');
    $('.savingCanvas').addClass('d-none');
    $('.disableSignature').addClass('d-none');
    $('.enablingCanvas').removeClass('d-none');

    $('.savingCanvas').data('id',fileId);
    $('.savingCanvas').data('idTask',idTask);
    $('.savingCanvas').data('groupid',groupId);
    $('#backupCanvas').attr("src",'');
    
    if(attachShow.data.path.includes('pdf')){
      // $('#pdfViewer').removeClass('d-none');
      // $('#pdfViewer').attr('src',attachShow.data.source);
      pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';
      let url = attachShow.data.source;
      var pdfData = atob(url.split('data:application/pdf;base64,')[1]);
      var loadingTask = pdfjsLib.getDocument({data: pdfData});
      loadingTask.promise.then(async function(pdf) {
        // Fetch the first page
        var pageNumber = 1;
        //How many pages it has
        numPages = pdf.numPages;
        pdfDoc = pdf;
        
        if(numPages > 1){
          $('.savingCanvas').data('pdf',true);
          $('.savingCanvas').data('multiple',true);
          pageNum = 1;
          pageNumMultiple = 1;
          window['signatureMultiple'] = [];
          pdf.getPage(pageNumber).then(handlePages)
          // $('#canvasPlace').addClass('d-none');
          if($('.legendData').length == 0){
            let legend = '<div class="legendData"><button class="btn btn-warning" id="prev">Previous</button><button class="btn btn-warning" id="next">Next</button></div>'
            $(legend).insertAfter($('#canvasPlace'));
            document.getElementById('prev').addEventListener('click', onPrevPage);
            document.getElementById('next').addEventListener('click', onNextPage);
            $('<span style="float:right;">Page : <span class="currPage"></span> / '+numPages+'</span>').appendTo($('.legendData'));
          }
          
          renderPage(pageNum);
          await activateCanvas(attachShow.data.source,true);
        } else {
          $('.savingCanvas').data('pdf',true);
          $('.savingCanvas').data('multiple',false);
          $('.legendData').remove();
          pdf.getPage(pageNumber).then(function(page) {
            var scale = 1.2;
            var viewport = page.getViewport({scale: scale});
  
            // Prepare canvas using PDF page dimensions
            var canvas = document.getElementById('canvasPlace');
            var context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
  
            canvas.toBlob(function(blob) {
              console.log('blobed',blob);
            },'image/jpeg');
  
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
      }, function (reason) {
        // PDF loading error
        console.error(reason);
      });
      $('#canvasPlace').css('max-width','735px');
    } else {
      $('.savingCanvas').data('pdf',false);
      $('.savingCanvas').data('multiple',false);
      await activateCanvas(attachShow.data.source);
    }
    
  }
})

function handlePages(page)
{
    //This gives us the page's dimensions at full scale
    var scale = 1.2;
    var viewport = page.getViewport({scale: scale});

    //We'll create a canvas for each page to draw it on
    var canvas = document.createElement( "canvas" );
    canvas.setAttribute('id','canvasMultiple'+pageNumMultiple)
    var context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    //Draw it on the canvas
    let paged = page.render({canvasContext: context, viewport: viewport});

    paged.promise.then(function() {
      console.log('promisee');
      document.getElementById('newPlaces').appendChild( canvas );
      activateCanvasMultiple(pageNumMultiple)

        //Move to next page
      
      pageNumMultiple++;
      if ( pdfDoc !== null && pageNumMultiple <= numPages )
      {
          pdfDoc.getPage( pageNumMultiple ).then( handlePages );
      }
    });
    
}

async function activateCanvasMultiple(id){
  let canvasMultiple = document.querySelector("#canvasMultiple"+id);
  let signaturePadMultiple = new SignaturePad(canvasMultiple);

  signaturePadMultiple.on();
  // Draws signature image from data URL.
  // Returns signature image as an array of point groups
  const data = signaturePadMultiple.toData();

  // Draws signature image from an array of point groups
  signaturePadMultiple.fromData(data);

  window['signatureMultiple'].push(
    {
      // in browser is supported loading images via url from reference by name in images
      id: id,
      image: signaturePadMultiple.toDataURL('image/jpeg'),
      width: 700,
      height: 1000
    }
  );
}

$(document).on('mouseenter', '.fileAttach', function () {
  let id = $(this).data('id');
  let groupid = $(this).data('groupid');
  let name = $(this).data('name');

  if($('.popover').length > 0){
    $(".popover").each(function () {
        $(this).popover("dispose");
    });
  }
  triggerPopoverFileAttachment(id,groupid,name);
})

function activeModalAttachmentFile() {
  $('#modalAttachmentFile').modal({
      show: true,
  });
  $('#modalAttachmentFile').on('hidden.bs.modal', function () {
    window['signaturePad'].off()
  });
}

async function triggerPopoverFileAttachment(id,groupid,name){
  if($('.fileAttach[data-id=' + id + ']').data("bs.popover") == undefined){
    let htmlMember = '';
    window['fileAttachment'+id].forEach(element => {
      htmlMember += '<li class="list-group-item d-flex justify-content-between align-items-center">'+element.name+'<span style="float:right;cursor:pointer;"><i data-feather="eye" class="showAttachment ml-3" data-groupid='+groupid+' data-idtask='+id+' data-id='+element.fileId+'></i></span></li> '
    });
    let empHtmlTeam = '<div class="row p-2 mb-2"><div class="col-lg-12"><ul class="list-group list-group-flush">'+htmlMember+'</ul></div></div>';

    $('.fileAttach[data-id=' + id + ']').attr('tabindex', '0');
    $('.fileAttach[data-id=' + id + ']').attr('data-toggle', 'popover');

    $('.fileAttach[data-id=' + id + ']').popover({
      content: empHtmlTeam,
      placement: "right",
      html: true,
      sanitize: false
    });

    $('.fileAttach[data-id=' + id + ']').on('shown.bs.popover', async function () {
      feather.replace();
    })
  }
}

$(document).on('mouseenter', '.pic', function () {
  let id = $(this).data('id');
  let groupid = $(this).data('groupid');
  let name = $(this).data('name');

  if($('.popover').length > 0){
    $(".popover").each(function () {
        $(this).popover("dispose");
    });
  }

  triggerPopoverPIC(id,groupid,name);
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
    }]),
    'url' : localUrl + ':' + projectManagementLocalPort + '/employee?groupTaskId=' + groupid + '&taskId=' + id
  }
  let rand = (Math.floor(Math.random() * 4) + 1);
  $('.pic[data-id=' + id + ']').html('<div class="memberLogo" style="background:'+window['color'+val]+'" data-toggle="tooltip" data-placement="bottom" title="' + valName + '"><span class="initialPic '+window['colorClass'+val]+'">' + getInitials(valName) + '</span></div>');
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

/// for dismiss popover on click outside
$('html').on('click', function(e) {
  var l = $(e.target);
  if (~l[0].className.indexOf("fa-ellipsis-h") || ~l[0].className.indexOf("moreMember") || ~l[0].className.indexOf("list-group-item") || ~l[0].className.indexOf("bodyColor") || ~l[0].className.indexOf("teamBlock") || ~l[0].className.indexOf("popover") || ~l[0].className.indexOf("select2") || ~l[0].className.indexOf("removeAllTeam") || ~l[0].className.indexOf("emploPic") || ~l[0].className.indexOf("initialPic") || ~l[0].className.indexOf('memberLogo') || ~l[0].className.indexOf('modalOptions')) {
    return;
  } else if (typeof $(e.target).data('original-title') == 'undefined') {
    $('[data-original-title]').popover('hide');
  }
});

$(document).on('mouseenter', '.moreMember', function () {
  let id = $(this).data("id");
  if(!popoverTeam)
  triggerPopoverMemberList(id);
})

async function triggerPopoverMemberList(id){
  let htmlMember = '';
  window['dataSpliceLeft'+id].forEach(element => {
    htmlMember += '<li class="list-group-item d-flex justify-content-between align-items-center"><div class="memberLogo mr-3" style="background:'+window['color'+element.account_id]+'"><span class="initialPic'+window['colorClass'+element.account_id]+' text-white">' + getInitials(element.account_name) + '</span></div>'+element.account_name+'</li> '
  });
  let empHtmlTeam = '<div class="row p-2 mb-2"><div class="col-lg-12"><ul class="list-group list-group-flush">'+htmlMember+'</ul></div></div>';
  let joinHtmlTeam =  empHtmlTeam;
  $('.team[data-id=' + id + ']').popover('dispose');
  if($('.moreMember[data-id=' + id + ']').data("bs.popover") == undefined){
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

  if($('[data-original-title]').length > 0){
    $('[data-original-title]').popover('hide')
  }

  triggerPopoverTeam(id,haveTeam,groupid,name);

})
let popoverTeam = false;
async function triggerPopoverTeam(id,haveTeam,groupid,name){
  let empHtmlTeam = '<div class="row teamBlock p-2 mb-2"><div class="col-lg-12 teamBlock"><select id="employeeTeam" data-team=' + haveTeam + ' data-groupid="' + groupid + '" data-name="' + name + '" data-id=' + id + ' class="form-control emploTeam"></select></div></div>';
  let removeAll = '<div class="row teamBlock p-2 mb-2"><div class="col-lg-12 teamBlock"><button type="button" class="btn btn-danger removeAllTeam" data-groupid="' + groupid + '" data-name="' + name + '" data-id=' + id + ' style="width:100%">Remove All</button></div></div>';
  let submitTeam = '<div class="row teamBlock p-2 mb-2"><div class="col-lg-12 teamBlock"><button type="button" class="btn btn-success submitTeam" data-groupid="' + groupid + '" data-name="' + name + '" data-id=' + id + ' style="width:100%">Done</button></div></div>';
  let joinHtmlTeam =  empHtmlTeam + removeAll + submitTeam;

  if($('.team[data-id=' + id + ']').data("bs.popover") == undefined){
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
          break;
      }
      console.log('current',window['dataCurrentTeam' + id + ''])
      if (window['dataCurrentTeam' + id + ''].length != 0) {
        let thisTeamMember = window['dataCurrentTeam' + id + ''];
        console.log('dalam',thisTeamMember);
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

$(document).on('click', '.removeAllTeam', function () {
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
  
  $('.emploTeam[data-groupid=' + groupid + ']').data('team',false)
  window['dataTeam' + id + ''] = [];
  window['dataCurrentTeam'+id] = [];
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

  if(val == 'addTeam'){
    if($('#addTeam').length > 0)
    $('#addTeam').click()
    else 
    contactMore()
    return;
  }

  if(window['color'+val] == undefined){
    window['color'+val] = getRandomColor();
  }
  
  if (haveTeam) {
    $('.colTeam[data-id=' + id + ']').append('<div class="memberLogo" style="background:'+window['color'+val]+'" data-id="' + id + '"><span class="initialPic '+window['colorClass'+val]+'">' + getInitials(valName) + '</span></div>');
  } else {
    $('.colTeam[data-id=' + id + ']').html('<div class="memberLogo" style="background:'+window['color'+val]+'" data-id="' + id + '"><span class="initialPic '+window['colorClass'+val]+'">' + getInitials(valName) + '</span></div>');
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

  feather.replace();
})

$(document).on('click', '.submitTeam', function () {
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
    'url' : localUrl + ':' + projectManagementLocalPort + '/employee?groupTaskId=' + groupid + '&taskId=' + id
  }
  globalUpdateTask('team', updateTeam);
  containerOnLoad('cardGT'+groupid+'')
  $('.headerGT[data-id='+groupid+']').click()
  setTimeout(() => {
      $('.headerGT[data-id='+groupid+']').click()
  }, 500);
  let intervalData = setInterval(() => {
      if($('#table'+groupid).length > 0){
          clearInterval(intervalData)
          containerDone('cardGT'+groupid+'')
      }
  }, 1000);
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
    minDate: new Date(),
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
    opens: 'center',
    autoUpdateInput: false,
    ranges: {
        'Next 7 Days': [moment().add(6, 'days'), moment()],
        'Next 30 Days': [moment().add(29, 'days'), moment()],
        'Rest of this month': [moment(), moment().endOf('month')],
    },
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
  let pic = $(this).data('pic')
  let gtPic = $(this).data('gtpic')
  $(this).attr('tabindex', '0');
  $(this).attr('data-toggle', 'popover');
  $(this).attr('data-trigger', 'focus');
  let menuTemplate;
  try {
    if(typeof window['dataCurrentTeam' + id+ ''] == "object" && window['dataCurrentTeam' + id+ '']._id && gtPic != ct.id_employee){
      let member = window['dataCurrentTeam' + id+ ''].member;
      member.forEach(elements => {
        if(elements.account_id == ct.id_employee){
          menuTemplate = '<div class="row p-2"><div class="col-lg-12 rowStat mediumPrio text-white">Working on it</div></div> <div class="row p-2"><div class="col-lg-12 rowStat highPrio text-white">Stuck</div></div><div class="row p-2"><div class="col-lg-12 rowStat reviewStat text-white">Waiting for review</div></div>';
        }
      });
    }
  } catch (error) {
    console.log('err',error); 
  }
  if(pic == ct.id_employee || gtPic == ct.id_employee){
    menuTemplate = '<div class="row p-2"><div class="col-lg-12 rowStat pendingPrio text-white">Pending</div></div> <div class="row p-2"><div class="col-lg-12 rowStat mediumPrio text-white">Working on it</div></div> <div class="row p-2"><div class="col-lg-12 rowStat highPrio text-white">Stuck</div></div> <div class="row p-2"><div class="col-lg-12 rowStat lowPrio text-white">Done</div></div> <div class="row p-2"><div class="col-lg-12 rowStat reviewStat text-white">Waiting for review</div></div>';
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

  if ($('.status[data-id=' + id + ']').hasClass('pendingPrio')) {
    $('.status[data-id=' + id + ']').removeClass('pendingPrio');
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
    case 'Pending':
      $('.status[data-id=' + id + ']').addClass('pendingPrio text-white');
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
  // await updateStatusProgressBar(dataStat, currentStat);
  containerOnLoad('cardGT'+groupid+'')
  $('.headerGT[data-id='+groupid+']').click()
  setTimeout(() => {
      $('.headerGT[data-id='+groupid+']').click()
      
  }, 500);
  let intervalData = setInterval(() => {
      if($('#table'+groupid).length > 0){
          clearInterval(intervalData)
          containerDone('cardGT'+groupid+'')
      }
  }, 1000);
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
  // await updatePriorityProgressBar(dataPrio, currentPrio);
  containerOnLoad('cardGT'+groupid+'')
      $('.headerGT[data-id='+groupid+']').click()
  setTimeout(() => {
      $('.headerGT[data-id='+groupid+']').click()
      
  }, 500);
  let intervalData = setInterval(() => {
      if($('#table'+groupid).length > 0){
          clearInterval(intervalData)
          containerDone('cardGT'+groupid+'')
      }
  }, 1000);
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
  if($('.taskTitle' + groupId + '[data-name="' + groupName + '"]').val() == undefined || $('.taskTitle' + groupId + '[data-name="' + groupName + '"]').val() == ''){
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