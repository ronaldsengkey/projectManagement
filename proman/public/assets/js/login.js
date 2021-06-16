'use strict'
var accountProfile
var accountLogin

$(async function () {
    await getEnvData();
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
                window.location = "/proman/login";
            }
        }
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
                    'password': $('#password').val(),
                    'continue': window.location.origin
                }
            };
            let genKeyLogin = await getGenerateKey();
            // p = iterateObjectEncryptAESLogin(p);
            p = iterateObjectNewEncrypt(p,genKeyLogin);
            data = {
                target: target,
                origin: 'employee',
                settings: {
                    "async": true,
                    "crossDomain": true,
                    "target":"login",
                    "url":"/login/"+'employee',
                    "method": "POST",
                    "headers": {
                        "Content-Type": "application/json",
                        "Accept": "*/*",
                        "Cache-Control": "no-cache",
                        "keyencrypt": genKeyLogin
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
            let genKeyLoginAuth = await getGenerateKey();
            p = iterateObjectNewEncrypt(p,genKeyLoginAuth);
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
                        "keyencrypt": genKeyLoginAuth
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
        url: '/proman/' + param,
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

async function postData(data) {
    let callback = await ajaxCall({url: 'postData',data:data,method:'POST',decrypt:true})
    let param = '';
    switch (callback.responseCode) {
        case "401":
            logoutNotif();
            break;
        case "406":
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
                    console.log('login type => ', callback.data)
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
                            localStorage.setItem("userData", JSON.stringify(callback.data));
                            let today = new Date();
                            // let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                            let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                            localStorage.setItem("loginTime", time);
                            let getUrl = window.location.search;
                            let boardAidi = new URLSearchParams(getUrl).get('boardId');
                            if (boardAidi != undefined && boardAidi != '') {
                                window.location = 'employee' + window.location.search
                            } else 
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
                    localStorage.setItem("userData", JSON.stringify(callback.data));
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
}