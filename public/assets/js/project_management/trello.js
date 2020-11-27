$(async function(){
    await getTrelloPage();
    await getTrelloBoard();
    await checkSessionSettings();
})

async function checkSessionSettings(){
    let preference = sessionStorage.getItem('prefTask');
    if(preference == null) sessionStorage.setItem('prefTask','all');
}

async function getTrelloPage(){
    $.ajax({
        url: 'trello_management',
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            "Accept": "*/*",
            "Cache-Control": "no-cache",
        },
        success: async function (result) {
            $('#wrapper').first().remove();
            $(result).insertAfter($('#shortcutSection'));
            $('.beefup').beefup();
            feather.replace();
        }
    })
}

async function manageTrelloBoard(data){
    let boardPublic = data.filter(function (e) {
        return e.prefs.permissionLevel == 'public';
        return e.type == 'public' && e.idTrello != undefined
    });

    let boardPrivate = data.filter(function (e) {
        return e.prefs.permissionLevel == 'private' || e.prefs.permissionLevel == "org"
        // return (e.type == 'private' || e.type == 'org') && e.idTrello != undefined
    });

    $('.trelloMain').empty();
    $('.trelloPrivate').empty();

    let publicBoard = '<div class="trelloPublicLabel text-center mt-2" style="font-size: xx-large;">Public Board</div>';
    let privateBoard = '<div class="trelloPrivateLabel text-center mt-2" style="font-size: xx-large;">Private Board</div>';
    if ($('.trelloPublicLabel').length == 0) $(publicBoard).insertBefore($('.trelloMain'));
    if ($('.trelloPrivateLabel').length == 0) $(privateBoard).insertBefore($('.trelloPrivate'));

    boardPublic.forEach(element => {
        let htmlMain = '<a class="list-group-item list-group-item-action trelloBoardList" data-creator='+element.idMemberCreator+' data-id="' + element.id + '" data-name="' + element.name + '"style="border-top:0;">' + element.name + '</a>';
        $('.trelloMain').append(htmlMain);
    });

    boardPrivate.forEach(element => {
        let htmlPrivate = '<a class="list-group-item list-group-item-action trelloBoardList" data-creator='+element.idMemberCreator+' data-id="' + element.id + '" data-name="' + element.name + '"style="border-top:0;">' + element.name + '</a>';
        $('.trelloPrivate').append(htmlPrivate);
    })

    loadingDeactivated();

    feather.replace();
}

$(document).on('click', '.trelloBoardList', async function () {
    loadingActivated();
    let boardName = capitalize($(this).data('name'));
    let camelized = camelize($(this).data('name'));
    let name = $(this).data('name');
    let id = $(this).data('id');
    let idCreator = $(this).data('creator');
    $('a[class*="trelloBoardList"]').removeClass('amber');
    $('a[class*="trelloBoardList"]').removeClass('lighten-1');
    $(this).addClass('amber');
    $(this).addClass('lighten-1');
    $('.boardContentData').empty();
    $('.boardContent').empty();
    $('.boardHeaderTrello').empty();
    $('.trelloContentData').empty();
    // if ($('.removeSidebar').length > 0) $('.removeSidebar').remove();
    try {
        let trelloList = await getTrelloList(id);
        loadingDeactivated();
        $('#page-content-wrapper').addClass('warp-boundary');
        window['trelloListTask' + id + ''] = trelloList;
        $.ajax({
            url: 'trelloBoardPage',
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Cache-Control": "no-cache",
            },
            success: function (result) {
                $.getScript('http://'+localUrl + ":" + projectManagementLocalPort + "/public/assets/js/project_management/trelloContent.js", function (data, textStatus, jqxhr) {})
                $('.trelloContentData').html(result);
                let pass = {
                    boardName: boardName,
                    camelized: camelized,
                    name: name,
                    id: id,
                    idCreator:idCreator
                };
                domTrelloTools(pass)
            }
        })
    }catch(e){
        loadingDeactivated();
    }
})

function domTrelloTools(data) {
    let checkOwner = sessionStorage.getItem('meId') == data.idCreator;
    let tools;
    let pref = sessionStorage.getItem('prefTask');
    if(checkOwner){
        tools = '<div class="row p-3 ml-1 mr-1">' +
        '<div class="col-lg-4" style="align-self: center;">' +
        '<h2 class="boardPlaceHeaderTrello" data-name="'+data.name+'" data-id='+data.id+'><span class="name">' + data.boardName + '</span> Board</h2>' +
        '</div>' +
        '<div class="col-lg-2 align-self-center">' +
        '<label class="switch row"><input type="checkbox" class="switchTaskPref">' +
        '<div class="slider round">' +
        '<span class="on">My Task</span>' +
        '<span class="off">All Task</span>' +
        '</div>'+
        '</label>'+
        '</div>'+
        '<div class="col-lg-3" style="text-align: end;">' +
        '<button class="text-white rounded-pill btn amber lighten-1 renameBoard" data-boardname="' + data.boardName + '" data-id=' + data.id + ' type="button">Rename Board</button>' +
        '</div>' +
        '<div class="col-lg-3" style="text-align: center;">' +
        '<button class="text-white rounded-pill btn red lighten-1 deleteBoard" data-boardname="' + data.boardName + '" data-id=' + data.id + ' type="button">Delete Board</button>' +
        '</div>' +
        '</div>';
    } else {
        tools = '<div class="row p-3 ml-1 mr-1">' +
        '<div class="col-lg-6" style="align-self: center;">' +
        '<h2 class="boardPlaceHeaderTrello" data-name="'+data.name+'" data-id='+data.id+'><span class="name">' + data.boardName + '</span> Board</h2>' +
        '</div>' +
        '<div class="col-lg-6 align-self-center text-center">' +
        '<label class="switch row"><input type="checkbox" class="switchTaskPref">' +
        '<div class="slider round">' +
        '<span class="on">My Task</span>' +
        '<span class="off">All Task</span>' +
        '</div>'+
        '</label>'+
        '</div>'+
        '</div>';
    }
    
    $('.boardHeaderTrello').append(tools);
    if(pref != 'all') $('.switchTaskPref').prop('checked',true);
    if ($('.removeSidebarTrello').length == 0) $('.boardPlaceHeaderTrello').prepend('<span class="removeSidebarTrello mr-2"><i data-feather="arrow-left"></i></span>');

    feather.replace();
}

$(document).on('click','.switchTaskPref',function(){
    let taskPref = $(this).is(':checked');
    if(taskPref == true){
        sessionStorage.setItem('prefTask','spesific')
    } else {
        sessionStorage.setItem('prefTask','all');
    }
    
})

$(document).on('click', '.renameBoard', function () {
    let renameId = $(this).data('id');
    let oldBoardName = $(this).data('boardname');
    let newName;
    Swal.fire({
        title: 'Change Board Name to',
        input: 'text',
        inputValidator: (value) => {
            if (!value) {
                return 'You need to fill the input!'
            } else {
                newName = value;
            }
        },
        inputPlaceholder: oldBoardName,
        showCancelButton: true,
        confirmButtonText: 'Submit',
        showLoaderOnConfirm: true,
        preConfirm: async () => {
            return await renameBoard(renameId,newName).then(async function (result) {
                if(result.responseCode == '200'){
                    amaranNotifFull(result.responseMessage);
                    await getTrelloPage();
                    await getTrelloBoard();
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

$(document).on('click', '.deleteBoard', function () {
    let deleteId = $(this).data('id');
    let oldName = $(this).data('boardname');
    Swal.fire({
        title: 'Are you sure to delete\n' + oldName + "\nBoard",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Delete it!',
        showLoaderOnConfirm: true,
        preConfirm: async () => {
            return await deleteBoardTrello(deleteId).then(async function (result) {
                if(result.responseCode == '200'){
                    amaranNotifFull(result.responseMessage);
                    await getTrelloPage();
                    await getTrelloBoard();
                    
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

$(document).on('click', '.removeSidebarTrello', function () {
    if ($('#sidebar-wrapper').hasClass('w767')) {
        $('#sidebar-wrapper').removeClass('w767');
        $('#sidebar-wrapper').addClass('w768');
        $('.removeSidebarTrello').remove();
        $('.boardPlaceHeaderTrello').prepend('<span class="removeSidebarTrello mr-2"><i data-feather="arrow-left"></i></span>');
    } else if ($('#sidebar-wrapper').hasClass('w768')) {
        $('#sidebar-wrapper').removeClass('w768');
        $('#sidebar-wrapper').addClass('w767');
        $('.removeSidebarTrello').remove();
        $('.boardPlaceHeaderTrello').prepend('<span class="removeSidebarTrello"><i data-feather="arrow-right"></i>&nbsp;</span>');
    }
    feather.replace();
})