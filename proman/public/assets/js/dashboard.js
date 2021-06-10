var userData;
var token;
let accountProfile;

function toTitleCase(str) {
    return str.replace(/(?:^|\s)\w/g, function (match) {
        return match.toUpperCase();
    });
}
$(document).on('click', '.profilePict', function () {
    location.reload();
})
$(async function () {
    loadingActivated();
    await getEnvData();
    getChatContainer();
    try {
        let getUrl = window.location.search;
        let getUserFrom = new URLSearchParams(getUrl).get('from');
        let getUserId = new URLSearchParams(getUrl).get('idEmployee');
        if(getUserFrom=="other")
        {
            $.ajax({
                url: '/proman/getSession',
                crossDomain: true,
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "*/*",
                    "Cache-Control": "no-cache",
                    "for": getUserId
                },
                tryCount : 0,
                retryLimit : 3,
                timeout : 6000,
                success: async function(callback){
                    var callback = JSON.parse(callback);
                    console.log("callback::", callback);
                    localStorage.setItem("accountProfile", JSON.stringify(callback));
                    userData = JSON.parse(localStorage.getItem('accountProfile'));
                    if (userData) {
                        token = userData.token;
                    }
                    accountProfile = localStorage.getItem('accountProfile');
                    let ct = JSON.parse(accountProfile);
                    // let loginTime = localStorage.getItem('loginTime');
                    let getUrl = window.location.search;
                    let getUserId = new URLSearchParams(getUrl).get('use');
                    $('#navHeaderPM').remove();
                    $('#empName').html(ct.fullname);
                    if(getUserId == 'project_management'){
                        getPage('project_management');
                    } else {
                        getPage('home');
                        getPage('project_management');
                    }
                    await subscribeOneSignal();
                    openProfile()
                },
                error: function(callback,timeout){
                    if(timeout === 'timeout'){
                        this.tryCount++;
                        if (this.tryCount <= this.retryLimit) {
                            //try again
                            $.ajax(this);
                            return;
                        }            
                        return;
                    }
                }
            });
        }
        else
        {
            userData = JSON.parse(localStorage.getItem('accountProfile'));
            if (userData) {
                token = userData.token;
            }
            accountProfile = localStorage.getItem('accountProfile');
            await setTimeout(function () {
            Swal.fire({
                type: "error",
                title: 'Expired session',
                text: "Sorry, your session has expired, please login again!",
                icon: 'warning',
                showCancelButton: false,
                confirmButtonColor: '#d33',
                // cancelButtonColor: '#d33',
                confirmButtonText: 'OK',
                allowOutsideClick: false
            }).then((result) => {
                if (result.value) {
                    logout();
                }
            })

        }, 1000 * 60 * 60);
        let ct = JSON.parse(accountProfile);
        // let loginTime = localStorage.getItem('loginTime');
        let getUrl = window.location.search;
        let getUserId = new URLSearchParams(getUrl).get('use');
        if(getUserId == 'project_management'){
            await getPage('project_management');
        } else {
            await getPage('home');
            await getPage('project_management');
        }
        $('#empName').html(ct.fullname);
        await subscribeOneSignal();
        openProfile()
    }

    } catch (err) {
        console.log("error read document processing", err);
    }
});

async function subscribeOneSignal(){
    $.ajax({
        url: domainPlaceUS + ":" + mainLocalPort + "/public/assets/js/global/onesignal.js",
        dataType: "script",
        error: function(){
            $.getScript("/public/assets/js/global/onesignal.js", function (data, textStatus, jqxhr){})
        }
    });
}

async function openProfile(){
    if($('.toProfile').length > 0){
        $.getScript(domainPlaceUS + ":" + mainLocalPort + "/public/assets/js/global/profile.js", function (data, textStatus, jqxhr) {})
        $.getScript(domainPlaceUS + ":" + mainLocalPort + "/public/assets/js/global/updateScope.js", function (data, textStatus, jqxhr) {})
    }
}

function splitCamel(word) {
    var result = word.replace(/([A-Z])/g, " $1");
    var finalResult = result.charAt(0).toUpperCase() + result.slice(1);
    return finalResult;
}

function splitCamelNoUppercase(word) {
    var result = word.replace(/([A-Z])/g, " $1");
    var finalResult = result.charAt(0) + result.slice(1).toLowerCase();
    return finalResult;
}

async function checkAvailableMethod(parameter, action) {
    let ct = JSON.parse(localStorage.getItem('accountProfile'))
    var allow = "unauthorized";
    ct.method.forEach(element => {
        if (element.name == parameter) {
            if (action == element.method_name) {
                allow = "allow";
                if (element.method_status == 0) {
                    allow = "maintenance";
                }
            }
        }
    });
    return allow;
}

function unauthorized() {
    param = {
        type: "error",
        text: "unauthorized access"
    }
    callNotif(param);
}

function onMaintenance(text) {
    param = {
        type: "error",
        text: text.split('view')[1] ? text.split('view')[1] + ' on maintenance, please try again later' : text + ' on maintenance, please try again later'
    }
    callNotif(param);
}

$(document).on('click', '.linkAccess', async function () {
    if ($('.active').length > 0) {
        $('li').removeClass('active');
    }
    $(this).addClass('active');
    switch ($(this).data('target')) {
        case "home":
            location.reload();
            break;
    }
});

async function activeModalForm(content) {
    $('#modalLRForm').modal({
        show: true,
    });
    if (content != '') {
        $('.modal-body').empty();
        $('.modal-body').html('');
        $('.modal-body').html(content);
    }
}

function activeModalMembercontent(content) {
    $('#modalLRFormMember').modal({
        show: true,
    });
    if (content != '') {
        $('.modal-body').empty();
        $('.modal-body').html('');
        $('.modal-body').html(content);
    }
}

async function checkAvailableMethod(parameter, action) {
    let ct = JSON.parse(accountProfile);
    ct.method = JSON.parse(ct.method);
    var allow = "unauthorized";
    ct.method.forEach(element => {
        if (element.name == parameter) {
            if (action == element.method_name) {
                allow = "allow";
                if (element.method_status == 0) {
                    allow = "maintenance";
                }
            }
        }
    });
    return allow;
}

$(document).on('click', '.closePopup', function () {
    $('#popup').remove();
})

async function getPageHtml(param, callbackFunc) {
    $.ajax({
        url: '/proman/' + param,
        crossDomain: true,
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Accept": "*/*",
            "Cache-Control": "no-cache",
        },
        success: function (callback) {
            if (callbackFunc != undefined || callbackFunc != '') {
                callbackFunc(callback);
            }
            return callback;
        }
    })
}

async function getAjax(url, token) {
    return new Promise((resolve, reject) => {
        let ct = JSON.parse(localStorage.getItem('accountProfile'));

        if (url == 'getMethodParam') {
            token = JSON.parse(token);
            $.ajax({
                url: '/proman/'+ url,
                crossDomain: true,
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "*/*",
                    "Cache-Control": "no-cache",
                    "empId": token.empId,
                    "token": token.token,
                    "secretKey": ct.secretKey,
                    "signature": ct.signature,
                },
                success: function (callback) {
                    console.log('galo', callback);
                    switch (callback.responseCode) {
                        case "200":
                            resolve(callback);
                            break;
                        case "401":
                            logoutNotif();
                            break;
                        default:
                            reject(500)
                            break;
                    }
                }
            });
        } else {
            console.log('masuk else', url);
            $.ajax({
                url: '/proman/' + url,
                crossDomain: true,
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "*/*",
                    "Cache-Control": "no-cache",
                    "token": ct.token,
                    "secretKey": ct.secretKey,
                    "signature": ct.signature,
                },
                success: function (callback) {
                    switch (callback.responseCode) {
                        case "200":
                            resolve(callback);
                            break;
                        case "401":
                            logoutNotif();
                            break;
                        default:
                            console.log('a', callback);
                            reject(500)
                            break;
                    }
                }
            });
        }
    });
}

async function getData(param, token) {
    // console.log('getdata => ', param)
    let genKeyEncrypt = await getGenerateKey();
    if(ct == undefined) ct = JSON.parse(localStorage.getItem('accountProfile'));
    return new Promise(async (resolve, reject) => {
        try {
            let _url = param
            let _headers = {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Cache-Control": "no-cache",
                "secretKey": ct.secretKey,
                "token": ct.token,
                "signature": ct.signature,
                "keyencrypt": genKeyEncrypt
            }
            if (param.headers) {
                _headers = param.headers
            }
            if (param.url) {
                _url = param.url
                if (_url == 'getCustomerDetail') {
                    _headers = {
                        "Content-Type": "application/json",
                        "Accept": "*/*",
                        "Cache-Control": "no-cache",
                        "secretKey": ct.secretKey,
                        "customerId": _headers,
                        "token": ct.token,
                        "signature": ct.signature,
                        "keyencrypt": genKeyEncrypt
                    }
                } else if (_url == 'getEmployeeDetail') {
                    _headers = {
                        "Content-Type": "application/json",
                        "Accept": "*/*",
                        "Cache-Control": "no-cache",
                        "secretKey": ct.secretKey,
                        "employeeId": _headers,
                        "token": ct.token,
                        "signature": ct.signature,
                        "keyencrypt": genKeyEncrypt
                    }
                } else if (_url == 'getTicketingService') {

                    _headers = {
                        "Content-Type": "application/json",
                        "Accept": "*/*",
                        "Cache-Control": "no-cache",
                        "all": JSON.stringify({'id':param.id,'auth':param.auth,'division':param.division}),
                        "param": _headers,
                        "token": token,
                        "secretKey": ct.secretKey,
                        "signature": ct.signature,
                        "keyencrypt": genKeyEncrypt
                    }
                }
            }

            let result = await ajaxCall({url:_url,headers:_headers,method:'GET',decrypt:true})
            resolve(result)
        } catch (err) {
            console.log(err);
            reject(404);
        }
    })
}

$(document).on('click', '.breadcrumb-item', function () {
    let target = $(this).data('target');
    switch (target) {
        case "home":
            getPage(target);
            break;
    }
})

function logout() {
    localStorage.removeItem('accountProfile');
    localStorage.removeItem('accountLogin');
    sessionStorage.clear();
    window.location = "/proman/login";
};
$(document).on('click', '#logout', function () {
    logout();
});

let containerExpand = '<div class="row ml-0 mr-0 mt-5">' +
    '<div class="col mb-5" id="contentPath">' +
    '</div>' +
    '</div>';
$(document).on('click', '.closeExpand', function () {
    $('#contentPath').closest('.row').remove();
    let target = $(this).data('origin');
    $.ajax({
        url: '/proman/' + target,
        crossDomain: true,
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Accept": "*/*",
            "Cache-Control": "no-cache",
        },
        success: function (callback) {
            $('#' + target).empty();
            $('#' + target).html('');
            $('#' + target).html(callback);
        }
    })
});
$(document).on('click', '.expand', function () {
    let target = $(this).closest('.sectionCard').attr('id');
    let ct = localStorage.getItem('accountProfile')
    if ($('#contentPath').length == 0) {
        $(containerExpand).insertAfter($('#shortcutSection'));
        $('#' + target).empty();
        $('#' + target).html('');
        $.ajax({
            url: '/proman/' + target,
            crossDomain: true,
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Cache-Control": "no-cache",
                "token": ct.token
            },
            success: function (callback) {
                $('#contentPath').empty();
                $('#contentPath').html('');
                $('#contentPath').html(callback);
                $('#contentPath').find('.fa-expand').addClass('fa-times').removeClass('fa-expand');
                $('#contentPath').find('.expand').addClass('closeExpand text-danger').attr('data-origin', target).removeClass('expand');
            }
        })
    } else {
        let elementBefore = $('#contentPath').find('.closeExpand').data('origin');
        $('#' + target).empty();
        $('#' + target).html('');
        $.ajax({
            url: '/proman/' + target,
            crossDomain: true,
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Cache-Control": "no-cache",
                "token": ct.token
            },
            success: function (callback) {
                $('#contentPath').empty();
                $('#contentPath').html('');
                $('#contentPath').html(callback);
                $('#contentPath').find('.fa-expand').addClass('fa-times').removeClass('fa-expand');
                $('#contentPath').find('.expand').addClass('closeExpand text-danger').attr('data-origin', target).removeClass('expand');
            }
        })
        $.ajax({
            url: '/proman/' + elementBefore,
            crossDomain: true,
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Cache-Control": "no-cache",
                "token": ct.token
            },
            success: function (callback) {
                $('#' + elementBefore).empty();
                $('#' + elementBefore).html('');
                $('#' + elementBefore).html(callback);
            }
        })
    }
});

$(document).on('keyup', '.search', function () {
    $(this).addClass('text-dark')
    var searchString = $(this).val();
    switch ($(this).data('origin')) {
        case "shortcut":
            $(".shortcut").each(function (index, value) {
                currentName = $(value).data('identity');
                if (currentName.toUpperCase().indexOf(searchString.toUpperCase()) > -1) {
                    $(this).parent().show('slow');
                } else {
                    $(this).parent().hide('slow');
                }
            });
            break;
    }
});

function getPage(param) {
    if(param == 'project_management'){
        getProjectManagement();
    } else {
        return new Promise(async function (resolve, reject) {
            $.ajax({
                url: '/proman/' + param,
                crossDomain: true,
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "*/*",
                    "Cache-Control": "no-cache",
                }
            }).done(async function (callback) {
                $('body').removeClass('themeDefault');
                $('body').addClass('bodyColor')
                $('#mainContent').empty();
                $('#mainContent').html('');
                $('#mainContent').html(callback);
                loadingDeactivated();
                resolve(callback)
            }).fail(async function () {
    
            })
        })
    }
}

function getProjectManagement(){
    $.ajax({
        url: '/proman/project_management',
        crossDomain: true,
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Accept": "*/*",
            "Cache-Control": "no-cache"
        },
        success: function (callback) {
            $.getScript("/proman/public/assets/js/project_management/ajaxCall.js", function (data, textStatus, jqxhr) {})
            $.getScript("/proman/public/assets/js/project_management/documentHandler.js", function (data, textStatus, jqxhr) {})
            $.getScript("/proman/public/assets/js/project_management/authChecking.js", function (data, textStatus, jqxhr) {})
            $.getScript("/proman/public/assets/js/project_management/page-filter.js", function (data, textStatus, jqxhr) {})
            $.getScript("/proman/public/assets/js/project_management/projectManagement.js", function (data, textStatus, jqxhr) {})
            $('#mainContent').append(callback);
        }
    })
}

function callNotif(param) {
    console.log("callNotif::", param);
    Swal.fire({
        position: 'center',
        type: param.type,
        title: param.text,
        showConfirmButton: false,
        timer: 1500
    })
}


function globalLoad(classContainer,name,idContainer= '',accordion = false) {
    let containLoading = '<div class="loader" data-loader='+name+'>' +
        '<h4></h4>' +
        '<span></span>' +
        '<span></span>' +
        '<span></span>' +
        '</div>';
    let offsetData;
    if(idContainer != ''){
        offsetData = $('#'+idContainer).offset();
        $('#'+idContainer).css('pointer-events','none');
        $('#'+idContainer).css('opacity','0.4');
    } else {
        offsetData = $('.'+classContainer).offset();
        if(accordion){
            $('.'+classContainer+'[data-name="'+name+'"]').css('pointer-events','none');
            $('.'+classContainer+'[data-name="'+name+'"]').css('opacity','0.4');
        } else {
            $('.'+classContainer).css('pointer-events','none');
            $('.'+classContainer).css('opacity','0.4');
        }
        
    }
    $('.loader[data-loader="'+name+'"]').css('margin-top',offsetData.top);
    if ($('.loader[data-loader="'+name+'"]').length == 0) {
        if(idContainer) $(containLoading).insertBefore($('#'+idContainer));
        else $(containLoading).insertBefore($('.'+classContainer));
    }
}

function globalUnLoad(classContainer,name,idContainer = '',accordion = false) {
    $('.loader[data-loader="'+name+'"]').remove();
    if(idContainer != ''){
        $('#'+idContainer).css('pointer-events','auto');
        $('#'+idContainer).css('opacity','1');
    } else {
        if(accordion){
            $('.'+classContainer+'[data-name="'+name+'"]').css('pointer-events','auto');
            $('.'+classContainer+'[data-name="'+name+'"]').css('opacity','1');
        } else {
            $('.'+classContainer).css('pointer-events','auto');
            $('.'+classContainer).css('opacity','1');
        }
    }

    
}

function loadingContainer(idContainer,name) {
    let containLoading = '<div class="loader" data-loader='+name+'>' +
        '<h4></h4>' +
        '<span></span>' +
        '<span></span>' +
        '<span></span>' +
        '</div>';
    let offsetData = $('.masterData[data-name="'+name+'"]').offset();
    $('.masterData[data-name="'+name+'"]').css('pointer-events','none');
    $('.masterData[data-name="'+name+'"]').children().not('.loader[data-loader="'+name+'"]').css('opacity','0.4');
    $('.masterData[data-name="'+name+'"]').children().not('.loader[data-loader="'+name+'"]').css('pointer-events','none');
    $('.loader[data-loader="'+name+'"]').css('margin-top',offsetData.top);
    if ($('.loader[data-loader="'+name+'"]').length == 0) {
        $(containLoading).insertBefore(idContainer);
    }
}

function unloadContainer(name) {
    $('.loader[data-loader="'+name+'List"]').remove();
    $('.masterData[data-name="'+name+'"]').css('pointer-events','auto');
    $('.masterData[data-name="'+name+'List"]').children().not('.loader[data-loader="'+name+'"]').css('opacity','1');
    $('.masterData[data-name="'+name+'List"]').children().not('.loader[data-loader="'+name+'"]').css('pointer-events','auto');
}

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function checkIfNull(text, changeTo = '') {
    if (text == 'null' || text == null) {
        return changeTo
    } else {
        return text
    }
}

function getChatContainer(){
    const chatJsUrl = domainPlaceUS + ":" + mainLocalPort + "/public/assets/js/chat.js";
    console.log("getChatContainer::", chatJsUrl);
    $.getScript(chatJsUrl, function (data, textStatus, jqxhr) {})
}