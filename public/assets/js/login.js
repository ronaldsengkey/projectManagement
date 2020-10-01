'use strict'
var mainIP = mainIpService;
var authServicePort = authPortService;

let pageRequest = localStorage.getItem('pageRequest');
let btn = document.getElementsByClassName('btn');
if ($(btn).data('target') == 'login') {
    $(btn).attr('data-origin', pageRequest);
}

const loading = '<div id="loadingWrap">' +
    '<div class="text-center contentLoadingWrap">' +
    '<div class="lds-ripple"><div></div><div></div></div>' +
    '</div>' +
    '</div>';

var accountProfile
var accountLogin

function loadingActivated() {
    $(loading).insertBefore('section');
    $('#loadingWrap').fadeIn('slow');
}

function loadingDeactivated() {
    $('#loadingWrap').fadeOut('slow', function () {
        $('#loadingWrap').remove();
    });
}

loadingDeactivated();

$(function () {
    // disableDevTools();
    accountLogin = localStorage.getItem('accountLogin');
    accountProfile = localStorage.getItem('accountProfile');
    let path = window.location.pathname
    if (path.indexOf("login-auth") != -1) {
        if (accountLogin !== 'undefined' && accountLogin !== null && accountLogin !== '') {
            console.log('acccount Login data => ', JSON.parse(accountLogin))
            $('#title_login_' + JSON.parse(accountLogin).type).show()
            $('#login_img').attr('src', JSON.parse(accountLogin).qrcode)
        } else {
            if (accountProfile == 'undefined' || accountProfile == null) {
                window.location = "login";
            }
        }
    }
    loadingDeactivated();

    if (accountProfile !== 'undefined' && accountProfile !== null) {
        let ct = JSON.parse(accountProfile);
        $.ajax({
            // url: 'checkToken?token='+ct.token,
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
                    window.location = callback.data.accountCategory
                } else {
                    logout();
                }
            }
        })
    }
});

$(document).on('keypress', 'input', function (e) {
    switch (e.keyCode) {
        case 13:
            if ($(this).attr('id') == 'email' || $(this).attr('id') == 'password') {
                $('button').click();
            }
            break;
    }
})

$(document).on('click', 'button', async function () {
    let target = $(this).data('target');
    let origin = $(this).data('origin') == undefined ? 'employee' : $(this).data('origin');
    let data = '';
    let p = ''
    switch (target) {
        case "login":
            loadingActivated();
            p = {
                params: {
                    'email': $('#email').val(),
                    'password': $('#password').val()
                }
            };
            data = {
                target: target,
                origin: origin,
                settings: {
                    "async": true,
                    "crossDomain": true,
                    // "url": mainIP + ":" + authServicePort + "/login/" + origin
                    "target":"login",
                    "url":"/login/"+origin,
                    "method": "POST",
                    "headers": {
                        "Content-Type": "application/json",
                        "Accept": "*/*",
                        "Cache-Control": "no-cache",
                    },
                    "processData": false,
                    "body": JSON.stringify(p)
                }
            };
            postData(data);
            break;
        case "login-auth":
            loadingActivated();
            accountLogin = JSON.parse(localStorage.getItem("accountLogin"));
            console.log('account Login => ', accountLogin)
            p = {
                params: {
                    'secret': accountLogin.secret,
                    'token': $('#login_otp').val()
                }
            };
            data = {
                target: target,
                origin: origin,
                settings: {
                    "async": true,
                    "crossDomain": true,
                    "target":"login-auth",
                    "url": "/verifyOtp/" + accountLogin.type,
                    "method": "POST",
                    "headers": {
                        "Content-Type": "application/json",
                        "Accept": "*/*",
                        "Cache-Control": "no-cache",
                    },
                    "processData": false,
                    "body": JSON.stringify(p)
                }
            };
            postData(data);
            break;
        default:
            break;
    }
});

function getPage(param) {
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
            $('body').removeClass('themeDefault');
            $('body').addClass('bodyColor')
            $('#mainContent').empty();
            $('#mainContent').html('');
            $('#mainContent').html(callback);
            loadingDeactivated();
        }
    })
}

function postData(data) {
    $.ajax({
        url: "postData",
        crossDomain: true,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "*/*",
            "Cache-Control": "no-cache",
        },
        data: JSON.stringify(data)
    }).done(async function (callback) {
        try {
            let param = '';
            switch (callback.responseCode) {
                case "401":
                    logoutNotif();
                    break;
                case "404":
                    param = {
                        type: "error",
                        text: callback.responseMessage
                    }
                    callNotif(param);
                    loadingDeactivated();
                    break;
                case "500":
                    param = {
                        type: "error",
                        text: callback.responseMessage
                    }
                    callNotif(param);
                    loadingDeactivated();
                    break;
                case "200":
                    switch (data.target) {
                        case 'login':
                            loadingDeactivated();
                            console.log('login type => ', callback.data.type)
                            param = {
                                type: "success",
                                text: callback.responseMessage
                            }
                            callNotif(param);
                            switch (callback.data.type) {
                                case 'sms':
                                    localStorage.setItem("accountLogin", JSON.stringify(callback.data));
                                    window.location = "login-auth";
                                    break;
                                case 'email':
                                    localStorage.setItem("accountLogin", JSON.stringify(callback.data));
                                    window.location = "login-auth";
                                    break;
                                case 'authenticator':
                                    localStorage.setItem("accountLogin", JSON.stringify(callback.data));
                                    window.location = "login-auth";
                                    break;
                                default:
                                    localStorage.setItem("accountProfile", JSON.stringify(callback.data));
                                    let today = new Date();
                                    // let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                                    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                                    localStorage.setItem("loginTime", time);
                                    window.location = "employee";
                                    break;
                            }
                            break;
                        case 'login-auth':
                            param = {
                                type: "success",
                                text: callback.responseMessage
                            }
                            callNotif(param);
                            localStorage.setItem("accountProfile", JSON.stringify(callback.data));
                            window.location = "employee";
                            break;
                        default:
                            break;
                    }
                    break;
                default:
                    param = {
                        type: "error",
                        text: "Can't connect to service, please try again later !"
                    }
                    callNotif(param);
                    loadingDeactivated();
                    break;
            }
        } catch (err) {
            alert("ooops sory you have an error");
            console.log(err);
            return;
        }
    }).fail(async function (b) {
        alert("error", b);
    })
}