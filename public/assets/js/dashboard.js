let defaultImg = 'data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9JzMwMHB4JyB3aWR0aD0nMzAwcHgnICBmaWxsPSIjMDAwMDAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMTEwIDExMCIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMTEwIDExMCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik04NC41ODUsMjcuNDk3aDAuMDY3bC0yLjk2NywyLjk2N2gtMC4wNjdMNjguNzg1LDQzLjI5NyAgYzAuMDEsMC4wMTIsMC4wMTksMC4wMjUsMC4wMywwLjAzOEw2Ni43LDQ1LjQ0OGMtMC4wMS0wLjAxMi0wLjAxOS0wLjAyNi0wLjAyOS0wLjAzOEw0My40NDQsNjguNjM4ICBjMC4wMTIsMC4wMSwwLjAyNiwwLjAxOSwwLjAzOCwwLjAyOWwtMi4xNjEsMi4xNjFjLTAuMDEyLTAuMDEtMC4wMjYtMC4wMTktMC4wMzgtMC4wMjlMMzAuNjExLDgxLjQ3aDAuMDY3bC0zLjAxNCwzLjAxNGgtMC4wNjcgIEwxNC40OTQsOTcuNTg3Yy0wLjI4MiwwLjI4Mi0wLjczOSwwLjI4Mi0xLjAyLDBsLTEuMDYxLTEuMDYxYy0wLjI4Mi0wLjI4Mi0wLjI4Mi0wLjczOSwwLTEuMDJsMTEuMDIyLTExLjAyMkgyMy4yNyAgYy0yLjg5NiwwLTUuMjQ0LTIuMzQ4LTUuMjQ0LTUuMjQ0di00Ni41YzAtMi44OTYsMi4zNDgtNS4yNDQsNS4yNDQtNS4yNDRoMTEuMjU2VjI2Ljc0YzAtMi44OTYsMi4zNDctNS4yNDQsNS4yNDQtNS4yNDRoMjguNDczICBjMi44OTYsMCw1LjI0NCwyLjM0OCw1LjI0NCw1LjI0NHYwLjc1Nmg2LjkzNmwxNS4wODQtMTUuMDg0YzAuMjgyLTAuMjgyLDAuNzM5LTAuMjgyLDEuMDIsMGwxLjA2MSwxLjA2ICBjMC4yODIsMC4yODIsMC4yODIsMC43MzksMCwxLjAyMUw4NC41ODUsMjcuNDk3eiBNNDEuMzYyLDY2LjU1N2wyMy4yMjktMjMuMjI5Yy0yLjg2NS0yLjM5OS02LjU1My0zLjg0OC0xMC41ODItMy44NDggIGMtOS4xMSwwLTE2LjQ5NSw3LjM4NS0xNi40OTUsMTYuNDk1QzM3LjUxMyw2MC4wMDUsMzguOTYyLDYzLjY5Myw0MS4zNjIsNjYuNTU3eiBNNzAuNTI1LDMwLjQ2NFYyNi42NyAgYzAtMS4yMTktMC45ODgtMi4yMDYtMi4yMDYtMi4yMDZIMzkuNjkzYy0xLjIxOCwwLTIuMjA2LDAuOTg3LTIuMjA2LDIuMjA2djMuNzk0SDIzLjE5M2MtMS4yMTksMC0yLjIwNiwwLjk4Ny0yLjIwNiwyLjIwNnY0Ni41OTQgIGMwLDEuMjE4LDAuOTg3LDIuMjA2LDIuMjA2LDIuMjA2aDMuMjU2bDEyLjc1My0xMi43NTNjLTIuOTM5LTMuNDE2LTQuNzI3LTcuODUxLTQuNzI3LTEyLjcxMmMwLTEwLjc3OSw4LjczOC0xOS41MTcsMTkuNTE3LTE5LjUxNyAgYzQuODYxLDAsOS4yOTYsMS43ODgsMTIuNzEyLDQuNzI3bDEwLjc1MS0xMC43NTFINzAuNTI1eiBNNzAuNTY3LDQ1Ljc0M2MxLjg1NSwyLjk4MiwyLjk0Miw2LjQ5MSwyLjk0MiwxMC4yNjIgIGMwLDEwLjc3OS04LjczOCwxOS41MTYtMTkuNTE3LDE5LjUxNmMtMy43NzEsMC03LjI3OS0xLjA4Ni0xMC4yNjItMi45NDFsMi4yMjItMi4yMjJjMi4zODMsMS4zNCw1LjEyOCwyLjExMiw4LjA1NywyLjExMiAgYzkuMTEsMCwxNi40OTUtNy4zODUsMTYuNDk1LTE2LjQ5NWMwLTIuOTI5LTAuNzcyLTUuNjc0LTIuMTEyLTguMDU3TDcwLjU2Nyw0NS43NDN6IE0zNC44NCw4MS40N2g0OS45NzkgIGMxLjIxOCwwLDIuMjA2LTAuOTg4LDIuMjA2LTIuMjA2VjMyLjY3YzAtMC45MTUtMC41NTctMS43LTEuMzUxLTIuMDM0bDIuMTM0LTIuMTM0YzEuMzE0LDAuOTUzLDIuMTc4LDIuNDksMi4xNzgsNC4yMzh2NDYuNSAgYzAsMi44OTYtMi4zNDgsNS4yNDQtNS4yNDMsNS4yNDRIMzEuODI2TDM0Ljg0LDgxLjQ3eiI+PC9wYXRoPjwvc3ZnPg=='

var hostName
var transactionPort
var withdrawPort
var authPort
var accountPort
var backendPort
var hostNameGlobal
var accessParam = 'admin';
var accessMethod;

async function globalScopeCheck(parameter, method, callbackFunc, onErrorCallback) {
    var allow = await checkAvailableMethod(parameter, method);
    if (allow == 'allow') {
        callbackFunc();
    } else if (allow == 'unauthorized') {
        unauthorized();
        if (onErrorCallback != '' && onErrorCallback != undefined) {
            onErrorCallback();
        }
    } else {
        onMaintenance(method);
        if (onErrorCallback != '' && onErrorCallback != undefined) {
            onErrorCallback();
        }
    }
}

var userData;
var token;
let accountProfile;
var fromOther=false;


// let pageRequest = localStorage.getItem('pageRequest');
let pageRequest = 'employee';
let btn = document.getElementsByClassName('btn');
// pageRequest = JSON.parse(pageRequest);
if ($(btn).data('target') == 'login') {
    $(btn).attr('data-origin', pageRequest.origin);
}
// localStorage.removeItem('accountProfile');


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
            fromOther=true;
            $.ajax({
                url: 'getSession',
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
                    await initializeServerPort();
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
        await initializeServerPort();
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
            $.getScript(localUrl + ":" + mainLocalPort + "/public/assets/js/global/onesignal.js", function (data, textStatus, jqxhr){})
        }
    });
}

async function openProfile(){
    if($('.toProfile').length > 0){
        $.getScript(domainPlaceUS + ":" + mainLocalPort + "/public/assets/js/global/profile.js", function (data, textStatus, jqxhr) {})
        $.getScript(domainPlaceUS + ":" + mainLocalPort + "/public/assets/js/global/updateScope.js", function (data, textStatus, jqxhr) {})
    }
}

async function initializeServerPort() {
    return new Promise(async function (resolve, reject) {
        try {
            let ct = JSON.parse(accountProfile);
            let allConfig = await getRDataDashboard('all', ct);
            hostName = allConfig[mainIpKey];
            hostNameGlobal = allConfig[mainIpKey];
            transactionPort = allConfig.PORT_TRANSACTION_AWS;
            withdrawPort = allConfig.PORT_WITHDRAW_AWS;
            authPort = allConfig.PORT_AUTH_AWS;
            accountPort = allConfig.PORT_ACC_AWS;
            backendPort = allConfig.PORT_BACKEND_AWS;
            resolve(hostName);
        } catch (err) {
            reject(err)
        }
    })
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

function formOnLoad() {
    $('#popup').css('pointer-events', 'none');
    $('#popup').css('opacity', '0.3');
}

function formDoneLoad() {
    $('#popup').css('pointer-events', '');
    $('#popup').css('opacity', '1');
}

async function getPageHtml(param, callbackFunc) {
    $.ajax({
        url: param,
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
                url: url,
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
                url: url,
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

function getData(param, token) {
    // console.log('getdata => ', param)
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
                    }
                }
            }
            $.ajax({
                url: _url,
                crossDomain: true,
                method: "GET",
                headers: _headers,
                success: function (callback) {
                    resolve(callback)
                },
                error: function (err) {
                    reject(404);
                }
            })
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
    // localStorage.removeItem('accountProfile');
    // localStorage.removeItem('accountLogin');
    // sessionStorage.clear();
    // window.location = "login";
    return new Promise(async function(resolve){
        let ct = JSON.parse(localStorage.getItem('accountProfile'))
        let _headers = {
            "Accept": "*/*",
            "Cache-Control": "no-cache",
            "secretKey": ct.secretKey,
            "signature": ct.signature,
            "token": ct.token,
            version:1,
            flowEntry:'ultipayDashboard',
            continue:localUrl
        };

        $.ajax({
            url: 'logoutNew',
            crossDomain: true,
            method: "POST",
            headers: _headers,
            success: function (callback) {
                localStorage.clear();
                sessionStorage.clear();
                resolve(true);
                window.location = "login";
            }
        })
    })
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
        url: target,
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
            url: target,
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
            url: target,
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
            url: elementBefore,
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
async function postData(data) {
    let ct = localStorage.getItem('accountProfile')
    $.ajax({
        url: "postData",
        crossDomain: true,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "*/*",
            "Cache-Control": "no-cache",
            "token": ct.token
        },
        data: JSON.stringify(data),
        success: function (callback) {
            let param = '';
            switch (callback.responseCode) {
                case "401":
                    logoutNotif();
                    break;
                case "404":
                case "500":
                default:
                    param = {
                        type: "error",
                        text: callback.responseMessage
                    }
                    callNotif(param);
                    break;
                case "200":
                    param = {
                        type: "success",
                        text: callback.responseMessage
                    }
                    callNotif(param);
                    // let ap = window.btoa(JSON.stringify(callback.data));
                    localStorage.setItem("accountProfile", JSON.stringify(callback.data));
                    getPage("home");
                    break;
            }
        }
    })
}

function getPage(param) {
    if(param == 'project_management'){
        getProjectManagement();
    } else {
        return new Promise(async function (resolve, reject) {
            $.ajax({
                url: param,
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
        url: 'project_management',
        crossDomain: true,
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Accept": "*/*",
            "Cache-Control": "no-cache"
        },
        success: function (callback) {
            $.getScript(localUrl + ":" + projectManagementLocalPort + "/public/assets/js/project_management/ajaxCall.js", function (data, textStatus, jqxhr) {})
            $.getScript(localUrl + ":" + projectManagementLocalPort + "/public/assets/js/project_management/documentHandler.js", function (data, textStatus, jqxhr) {})
            $.getScript(localUrl + ":" + projectManagementLocalPort + "/public/assets/js/project_management/authChecking.js", function (data, textStatus, jqxhr) {})
            $.getScript(localUrl + ":" + projectManagementLocalPort + "/public/assets/js/project_management/page-filter.js", function (data, textStatus, jqxhr) {})
            $.getScript(localUrl + ":" + projectManagementLocalPort + "/public/assets/js/project_management/projectManagement.js", function (data, textStatus, jqxhr) {})
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

async function loadingActivated(element) {
    const loading = '<div id="loadingWrap">' +
        '<div class="text-center contentLoadingWrap">' +
        '<div class="lds-ripple"><div></div><div></div></div>' +
        '</div>' +
        '</div>';
    if (element != '' && element != undefined)
        $(loading).insertBefore(element);
    else
        $(loading).insertBefore('head');
    $('#loadingWrap').fadeIn('slow');
}

function loadingDeactivated() {
    $('#loadingWrap').fadeOut('slow', function () {
        $('#loadingWrap').remove();
    });
}

function postDataAll(data, param) {
    return new Promise(async (resolve, reject) => {
        try {
            let ct = localStorage.getItem('accountProfile')
            $.ajax({
                url: param,
                crossDomain: true,
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "*/*",
                    "Cache-Control": "no-cache",
                    "token": ct.token
                },
                data: JSON.stringify(data),
                success: function (callback) {
                    let param = '';
                    switch (callback.responseCode) {
                        case "401":
                            logoutNotif();
                            break;
                        case 404:
                        case "404":
                            param = {
                                type: "error",
                                text: callback.responseMessage
                            }
                            callNotif(param);
                            resolve(callback);
                            break;
                        case 500:
                        case "500":
                            param = {
                                type: "error",
                                text: callback.responseMessage
                            }
                            callNotif(param);
                            resolve(callback);
                            break;
                        case 200:
                        case "200":
                            param = {
                                type: "success",
                                text: callback.responseMessage
                            }
                            callNotif(param);
                            resolve(callback);
                            break;
                        default:
                            param = {
                                type: "error",
                                text: callback.responseMessage
                            }
                            callNotif(param);
                            resolve(callback);
                            break;
                    }
                }
            });
        } catch (err) {
            console.log(err);
            reject(500);
        }
    })
}

async function getRDataDashboard(_param, ct) {
    var data = {
        param: _param,
    };
    // console.log('sblm get data', data);
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: "getRData",
            crossDomain: true,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Cache-Control": "no-cache",
                "token": ct.token,
                "secretKey": ct.secretKey,
                "signature": ct.signature,
                // "url" : hostNameGlobal + ":" + backendPort + "/master/key"
                "url": mainIpService + ":" + backendPortService + "/master/key"
            },
            data: JSON.stringify(data)
        }).done(async function (callback) {
            let jsonCheck = IsJsonString(callback)
            if (jsonCheck)
                resolve(JSON.parse(callback))
            else
                resolve(callback);
        }).fail(async function (err) {
            alert("EROOR getRdata");
            console.log("error GRD >>>>>>", err.statusCode);
        });
    })
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
    $.getScript(chatJsUrl, function (data, textStatus, jqxhr) {
        // console.log("Data::", data);
        // console.log("textStatus::", textStatus);
        // console.log("jqxhr::", jqxhr);
    })
}