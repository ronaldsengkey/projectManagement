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

var userData = JSON.parse(localStorage.getItem('accountProfile'));
if (userData) {
    var token = userData.token;
}

// let pageRequest = localStorage.getItem('pageRequest');
let pageRequest = 'employee';
let btn = document.getElementsByClassName('btn');
// pageRequest = JSON.parse(pageRequest);
if ($(btn).data('target') == 'login') {
    $(btn).attr('data-origin', pageRequest.origin);
}
// localStorage.removeItem('accountProfile');
let accountProfile = localStorage.getItem('accountProfile');

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
    // disableDevTools();
    try {
        // if (accountProfile !== 'undefined' && accountProfile != null) {
        //     let ct = JSON.parse(accountProfile);
        //     // let loginTime = localStorage.getItem('loginTime');
        //     let getUrl = window.location.search;
        //     let getUserId = new URLSearchParams(getUrl).get('use');
        //     if(getUserId == 'project_management'){
        //         await getPage('project_management');
        //     } else {
        //         await getPage('home');
        //         await getPage('project_management');
        //     }
        //     $('#empName').html(ct.fullname);
        //     await initializeServerPort();
        // } else {
        //     Swal.fire({
        //         type: "error",
        //         title: 'Expired session',
        //         text: "Sorry, you don't have any permission access, Please login first!",
        //         icon: 'warning',
        //         showCancelButton: false,
        //         confirmButtonColor: '#d33',
        //         // cancelButtonColor: '#d33',
        //         confirmButtonText: 'Ok',
        //         allowOutsideClick: false
        //     }).then((result) => {
        //         if (result.value) {
        //             logout();
        //         }
        //     })
        // }
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

    } catch (err) {
        console.log("error read document processing", err);
    }
});

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

async function defineShortcut(data) {
    $('.shortCutMenu').empty();
    $('.shortCutMenu').html('');
    data.scopes = JSON.parse(data.scopes);
    data.method = JSON.parse(data.method);
    data.scopes.forEach(shortCutDefine);
    data.method.forEach(defineMenu);
}


function shortCutDefine(data, index) {
    if (data.access_status == 1) {
        if (data.access_name != 'admin') {
            var splitCamelWord = splitCamel(data.access_display);
            var newShortcut = '<div class="col-2"><div class="d-flex p-3 peach-gradient text-white justify-content-center shortcut"' +
                'style="cursor: pointer; border-radius: 7.5px;" data-link="' + data.access_link + '" data-identity="' + data.access_name + '">' +
                '<div class="p-2">';
            if (data.access_name == 'partner') {
                newShortcut += '<i class="fas fa-handshake" style="color: white; font-size: xx-large;"></i></div>';
            } else if (data.access_name == 'customerServices') {
                newShortcut += '<i class="fas fa-user-cog" style="color: white; font-size: xx-large;"></i></div>';
            } else if (data.access_name == 'marketing') {
                newShortcut += '<i class="fas fa-ad" style="color: white; font-size: xx-large;"></i></div>';
            } else if (data.access_name == 'finance') {
                newShortcut += '<i class="fas fa-money-check-alt" style="color: white; font-size: xx-large;"></i></div>';
            } else if (data.access_name == 'employee') {
                newShortcut += '<i class="fas fa-user-tag" style="color: white; font-size: xx-large;"></i></div>';
            } else {
                newShortcut += '<i class="fas fa-users" style="color: white; font-size: xx-large;"></i></div>';
            }
            newShortcut += '</div><div class="p-2 text-center"><strong>' + splitCamelWord + '</strong></div></div>';
            $('.shortCutMenu').append(newShortcut);
        }

    }
}

function defineMenu(data, index) {
    let menuHtml = '';
    let iconMenu = '';
    let targetData = '';
    if (data.name == 'admin' && data.method_name.includes('view') && !data.method_name.includes('ticket') && !data.method_name.includes('ticketing') && !data.method_name.includes('role') && !data.method_name.includes('scope') && !data.method_name.includes('method')) {
        var replacean = data.method_name.replace('view', '').trim();
        if (data.method_id == '64') {
            iconMenu = 'cogs';
            targetData = 'backupDatabase';
        } else if (data.method_id == '47') {
            iconMenu = 'dungeon';
            targetData = 'formBuilder';
        } else if (data.method_id == '63') {
            iconMenu = 'file-word';
            targetData = 'master';
        } else {
            iconMenu = 'cogs';
            targetData = 'key';
        }
        replacean = splitCamel(targetData);
        menuHtml += '<li class="list-group-item pt-2 pb-2 linkAccess" data-id=' + data.method_id + ' data-target="' + targetData + '">' +
            '<i class="fas fa-' + iconMenu + '  mr-4 pr-3"></i>' + replacean + '' +
            '</li>'
    }
    $('.navMenu').append(menuHtml);
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
    let breadcrumbItem
    let target
    let a
    if ($('.active').length > 0) {
        $('li').removeClass('active');
    }
    $(this).addClass('active');
    switch ($(this).data('target')) {
        case "home":
            location.reload();
            break;
        case 'setup':
            $('.navbar-expand-lg').nextAll('div').remove();
            $('#breadCrumb').remove();
            $('#shortcutSection').next('section').remove();
            $('#shortcutSection').remove();
            if ($('iframe').length != 0) {
                $('iframe').remove();
            }
            target = $(this).data('target');
            $(frame).insertAfter($('nav'));
            breadcrumbItem = '<li class="breadcrumb-item" data-target="setup"><a class="black-text" href="javascript:void(0);">setup</a><i class="fas fa-angle-double-right mx-2" aria-hidden="true"></i></li>';
            $(breadcrumb).insertBefore('.f2');
            $(breadcrumbItem).appendTo($('.breadcrumb'));
            $('iframe').remove();
            a = await displaySetup();
            $(a).insertAfter($('#breadCrumb'));
            $('#modalPoll').modal('toggle');
            await checkRoleMethod(accessParam);
            await checkScopeMethod(accessParam);
            await checkMethod(accessParam)
            break;
        case 'master':
            accessMethod = 'view master data';
            await globalScopeCheck(accessParam, accessMethod, async function () {
                $('.navbar-expand-lg').nextAll('div').remove();
                $('#breadCrumb').remove();
                $('#shortcutSection').next('section').remove();
                $('#shortcutSection').remove();
                if ($('iframe').length != 0) {
                    $('iframe').remove();
                }
                target = $(this).data('target');
                $(frame).insertAfter($('nav'));
                breadcrumbItem = '<li class="breadcrumb-item" data-target="master"><a class="black-text" href="javascript:void(0);">master data</a><i class="fas fa-angle-double-right mx-2" aria-hidden="true"></i></li>';
                $(breadcrumb).insertBefore('.f2');
                $(breadcrumbItem).appendTo($('.breadcrumb'));
                $('iframe').remove();
                a = await displayMaster();
                $(a).insertAfter($('#breadCrumb'));
                $('#modalPoll').modal('toggle');
                getMaster();
            })
            break;
        case 'key':
            accessMethod = 'view configuration key';
            await globalScopeCheck(accessParam, accessMethod, async function () {
                $('.navbar-expand-lg').nextAll('div').remove();
                $('#breadCrumb').remove();
                $('#shortcutSection').next('section').remove();
                $('#shortcutSection').remove();
                if ($('iframe').length != 0) {
                    $('iframe').remove();
                }
                target = $(this).data('target');
                $(frame).insertAfter($('nav'));
                breadcrumbItem = '<li class="breadcrumb-item" data-target="key"><a class="black-text" href="javascript:void(0);">key config</a><i class="fas fa-angle-double-right mx-2" aria-hidden="true"></i></li>';
                $(breadcrumb).insertBefore('.f2');
                $(breadcrumbItem).appendTo($('.breadcrumb'));
                $('iframe').remove();
                a = await displayKeyConfig();
                $(a).insertAfter($('#breadCrumb'));
                $('#modalPoll').modal('toggle');

                getKey();
            });
            break;
        case 'formBuilder':
            accessMethod = 'view form builder';
            await globalScopeCheck(accessParam, accessMethod, async function () {
                $('.navbar-expand-lg').nextAll('div').remove();
                $('#breadCrumb').remove();
                $('#shortcutSection').next('section').remove();
                $('#shortcutSection').remove();
                if ($('iframe').length != 0) {
                    $('iframe').remove();
                }
                target = $(this).data('target');
                $(frame).insertAfter($('nav'));
                breadcrumbItem = '<li class="breadcrumb-item" data-target="formBuilder"><a class="black-text" href="javascript:void(0);">Form Builder</a><i class="fas fa-angle-double-right mx-2" aria-hidden="true"></i></li>';
                $(breadcrumb).insertBefore('.f2');
                $(breadcrumbItem).appendTo($('.breadcrumb'));
                $('iframe').remove();
                a = await displayForm();
                $(a).insertAfter($('#breadCrumb'));
                $('#modalPoll').modal('toggle');
                $.getScript(localUrl + ":" + projectManagementLocalPort + "/public/assets/js/form/builder.js", function (data, textStatus, jqxhr) {})
            });
            break;
        case 'backupDatabase':
            $('.navbar-expand-lg').nextAll('div').remove();
            $('#breadCrumb').remove();
            $('#shortcutSection').next('section').remove();
            $('#shortcutSection').remove();
            if ($('iframe').length != 0) {
                $('iframe').remove();
            }
            target = $(this).data('target');
            $(frame).insertAfter($('nav'));
            breadcrumbItem = '<li class="breadcrumb-item" data-target="backupDatabase"><a class="black-text" href="javascript:void(0);">Form Backup</a><i class="fas fa-angle-double-right mx-2" aria-hidden="true"></i></li>';
            $(breadcrumb).insertBefore('.f2');
            $(breadcrumbItem).appendTo($('.breadcrumb'));
            $('iframe').remove();
            a = await displayBackup();
            $(a).insertAfter($('#breadCrumb'));
            $('#modalPoll').modal('toggle');
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

function initShortcut() {
    if (accountProfile !== 'undefined' && accountProfile != null) {
        // let dt = window.atob(accountProfile);
        let ct = JSON.parse(accountProfile);
        $.ajax({
            // url: 'checkToken?token=' + ct.token,
            url: 'checkToken',
            crossDomain: true,
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Cache-Control": "no-cache",
                "token": ct.token
            },
            success: function (callback) {
                if (callback.responseCode == '200') {
                    // getPage('home');
                    window.location = 'employee'
                    setTimeout(() => {
                        defineShortcut(ct);
                    }, 500);
                } else {
                    logout();
                }
            }
        })
    } else {
        logout();
    }
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


let htmlCustData = '';
let htmlCustUserData = '';

function appendCustUserData(data, index) {
    htmlCustUserData +=
        '<div class="form-row row">' +
        '<div class="col-lg-12">' +
        '<div class="row">' +
        '<div class="col-lg-5 col-xs-12">' +
        '<div class="md-form form-group">' +
        '<input type="text" class="form-control" id="email" value="' + data.sensor_email + '">' +
        '<label for="email" class="active">Email</label>' +
        '</div>' +
        '</div>' +
        '<div class="col-lg-3 col-xs-12">' +
        '<div class="md-form form-group">' +
        '<input type="password" class="form-control" id="pin" disabled placeholder="' + data.pin + '">' +
        '<label for="pin" class="active">Pin</label>' +
        '</div>' +
        '</div>' +
        '<div class="col-lg-4 col-xs-12">' +
        '<div class="md-form form-group">' +
        '<input type="password" class="form-control" id="password" value="' + data.password + '">' +
        '<label for="password" class="active">Password</label>' +
        '</div>' +
        '</div>' +
        '</div>' +

        '</div>' +
        '</div>' +
        '</div>';
    $('#accountContent').empty();
    $('#accountContent').html('');
    $('#accountContent').html(htmlCustUserData);
}

function addressSensor(address) {
    var no = "no";
    var arrSensor = [];
    var lengthSensor = 0;
    var sensorSymbol = " ";
    var patternNo = /[1-4]/g;
    if (address.includes(no) && address.match(patternNo)) {
        arrSensor = address.split(no);
        lengthSensor = arrSensor[1].length;
        for (var i = 0; i <= lengthSensor; i++) {
            sensorSymbol += '*';
        }
        address = address.replace(arrSensor[1], sensorSymbol);
        return address;
    } else if (address.match(patternNo)) {
        arrSensor = address.split(patternNo);
        lengthSensor = arrSensor[1].length;
        for (var i = 0; i <= lengthSensor; i++) {
            sensorSymbol += '*';
        }
        address = address.replace(arrSensor[1], sensorSymbol);
        return address;
    }

}

function convertBirthDate(date) {
    var date = moment(date).format("YYYY-MM-DD");
    return date;
}

function getData(param, token) {
    // console.log('getdata => ', param)
    return new Promise(async (resolve, reject) => {
        try {
            let ct = JSON.parse(localStorage.getItem('accountProfile'))
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

function displayMaster() {
    return new Promise(async function (resolve, reject) {
        try {
            let ct = localStorage.getItem('accountProfile')
            $.ajax({
                url: "master",
                crossDomain: true,
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "*/*",
                    "Cache-Control": "no-cache",
                    "token": ct.token
                },
                success: function (callback) {
                    resolve(callback);
                }
            })
        } catch (err) {
            console.log(err);
            reject(500);
        }
    })
}

function displaySetup() {
    return new Promise(async function (resolve, reject) {
        try {
            let ct = localStorage.getItem('accountProfile')
            $.ajax({
                url: "setup",
                crossDomain: true,
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "*/*",
                    "Cache-Control": "no-cache",
                    "token": ct.token
                },
                success: function (callback) {
                    resolve(callback);
                }
            })
        } catch (err) {
            console.log(err);
            reject(500);
        }
    })
}

function displayKeyConfig() {
    return new Promise(async function (resolve, reject) {
        try {
            let ct = localStorage.getItem('accountProfile')
            $.ajax({
                url: "keyConfig",
                crossDomain: true,
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "*/*",
                    "Cache-Control": "no-cache",
                    "token": ct.token
                },
                success: function (callback) {
                    resolve(callback);
                }
            })
        } catch (err) {
            console.log(err);
            reject(500);
        }
    })
}

function displayForm() {
    return new Promise(async function (resolve, reject) {
        try {
            let ct = localStorage.getItem('accountProfile')
            $.ajax({
                url: "formBuilder",
                crossDomain: true,
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "*/*",
                    "Cache-Control": "no-cache",
                    "token": ct.token
                },
                success: function (callback) {
                    resolve(callback);
                }
            })
        } catch (err) {
            console.log(err);
            reject(500);
        }
    })
}

function displayBackup() {
    return new Promise(async function (resolve, reject) {
        try {
            let ct = localStorage.getItem('accountProfile')
            $.ajax({
                url: "formBackup",
                crossDomain: true,
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "*/*",
                    "Cache-Control": "no-cache",
                    "token": ct.token
                },
                success: function (callback) {
                    resolve(callback);
                }
            })
        } catch (err) {
            console.log(err);
            reject(500);
        }
    })
}

// async function displaySetup() {
//     try {
//         $.ajax({
//             url: "setup",
//             crossDomain: true,
//             method: "GET",
//             headers: {
//                 "Content-Type": "application/json",
//                 "Accept": "*/*",
//                 "Cache-Control": "no-cache",
//                 
//                 
//                 
//             },
//             success: function (callback) {
//                 return(callback);
//             }
//         })
//     } catch (err) {
//         console.log(err);
//         return(500);
//     }
// }

function displayOnTable() {
    return new Promise(async (resolve, reject) => {
        try {
            $.ajax({
                url: "displayOnTable",
                crossDomain: true,
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "*/*",
                    "Cache-Control": "no-cache",
                },
                success: function (callback) {
                    resolve(callback);
                }
            })
        } catch (err) {
            console.log(err);
            reject(500);
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
    let a = window.location.pathname.replace(/[^\w\s]/gi, '');
    $.ajax({
        url: 'clearRData',
        crossDomain: true,
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Accept": "*/*",
            "Cache-Control": "no-cache",
            "for": JSON.parse(localStorage.getItem('accountProfile')).id_employee
        }
    }).done(async function (result) {
        console.log("success clear session", result);
    }).fail(async function (err) {
        console.log("error end session", err)
    });
    localStorage.setItem('pageRequest', a);
    localStorage.removeItem('accountProfile');
    localStorage.removeItem('accountLogin');
    // alert('Sory, your session has expired, please login again');
    window.location = "login";
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
            $.getScript(localUrl + ":" + projectManagementLocalPort + "/public/assets/js/project_management/projectManagement.js", function (data, textStatus, jqxhr) {})
            $('#mainContent').append(callback);
        }
    })
}

function callNotif(param) {
    Swal.fire({
        position: 'center',
        type: param.type,
        title: param.text,
        showConfirmButton: false,
        timer: 1500
    })
}

function callNotifDelete(data, name) {
    Swal.fire({
        position: 'center',
        type: 'warning',
        title: 'Are you sure to delete ' + name + ' role ?',
        showLoaderOnConfirm: true,
        showCancelButton: true,
        cancelButtonText: 'No!',
        confirmButtonText: 'Yes!',
        preConfirm: () => {
            return postDeleteRole(data).then(function (result) {
                getRole();
            });
        },
    })
}

async function callNotifDeleteMethod(data, name) {
    Swal.fire({
        position: 'center',
        type: 'warning',
        title: 'Are you sure to delete ' + name + ' method ?',
        showLoaderOnConfirm: true,
        showCancelButton: true,
        cancelButtonText: 'No!',
        confirmButtonText: 'Yes!',
        preConfirm: async () => {
            return await postDeleteMethod(data).then(function (result) {
                getScope();
            });
        },
    })
}

function callNotifDeleteScope(data, name) {
    Swal.fire({
        position: 'center',
        type: 'warning',
        title: 'Are you sure to delete ' + name + ' scope ?',
        showLoaderOnConfirm: true,
        showCancelButton: true,
        cancelButtonText: 'No!',
        confirmButtonText: 'Yes!',
        preConfirm: () => {
            return postDeleteScope(data).then(function (result) {
                getScope();
            });
        },
    })
}

function callNotifDeleteScopeKey(data, name) {
    Swal.fire({
        position: 'center',
        type: 'warning',
        title: 'Are you sure to delete ' + name + ' key ?',
        showLoaderOnConfirm: true,
        showCancelButton: true,
        cancelButtonText: 'No!',
        confirmButtonText: 'Yes!',
        preConfirm: () => {
            return postDeleteKey(data).then(function (result) {
                getKey();
            });
        },
    })
}

async function postDeleteScope(data) {
    let ct = localStorage.getItem('accountProfile')
    $.ajax({
        url: 'postDeleteScope',
        crossDomain: true,
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Accept": "*/*",
            "Cache-Control": "no-cache",
            "signature": ct.signature,
            "secretKey": ct.secretKey,
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
                    break;
            }
        }
    })
}

async function postDeleteMethod(data) {
    let ct = localStorage.getItem('accountProfile')
    $.ajax({
        url: 'postDeleteMethod',
        crossDomain: true,
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Accept": "*/*",
            "Cache-Control": "no-cache",
            "signature": ct.signature,
            "secretKey": ct.secretKey,
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
                    break;
            }
        }
    })
}

async function postDeleteRole(data) {
    let ct = localStorage.getItem('accountProfile')
    $.ajax({
        url: 'postDeleteRole',
        crossDomain: true,
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Accept": "*/*",
            "Cache-Control": "no-cache",
            "signature": ct.signature,
            "secretKey": ct.secretKey,
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
                    break;
            }
        }
    })
}

function postDeleteKey(data) {
    return new Promise(async function (resolve, reject) {
        let ct = localStorage.getItem('accountProfile')
        $.ajax({
            url: 'postDeleteKey',
            crossDomain: true,
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Cache-Control": "no-cache",
                "signature": ct.signature,
                "secretKey": ct.secretKey,
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
                        break;
                }
                resolve(callback)
            }
        })
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
        $(loading).insertBefore('header');
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


// function setRData(_param, _value) {
//     let ct = localStorage.getItem('accountProfile')
//     var data = {
//         param: _param,
//         value: _value
//     };
//     $.ajax({
//         url: "setRData",
//         crossDomain: true,
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//             "Accept": "*/*",
//             "Cache-Control": "no-cache",
//             "token": ct.token
//         },
//         data: JSON.stringify(data),
//         success: function (callback) {
//             // console.log('callback SET RData '+_param+' => '+_value)
//         }
//     })
// }

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