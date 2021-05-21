'use strict'
function unauthorized() {
    let param = { type: "error", text: "unauthorized access" }
    callNotif(param);
}

const capitalize = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
  }

function camelize(str) {
    return str.replace(/^([A-Z])|\s(\w)/g, function (match, p1, p2, offset) {
        if (p2) return p2.toUpperCase();
        return p1.toLowerCase();
    });
}

function getInitials(string) {
    var initials = string.match(/\b\w/g) || [];
    initials = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
    return initials;
  }

  function disablePrintScreenAndPrint(){
    /** TO DISABLE SCREEN CAPTURE **/
    document.addEventListener('keyup', (e) => {
        if (e.key == 'PrintScreen') {
            navigator.clipboard.writeText('');
            
        }
    });

    /** TO DISABLE PRINTS WHIT CTRL+P **/
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key == 'p') {
            e.cancelBubble = true;
            e.preventDefault();
            e.stopImmediatePropagation();
        }
    });
}

function disableDevTools(){
    // disable right click
    $(document).bind("contextmenu",function(e){
        return false;
    });

    disablePrintScreenAndPrint();
    
    // disable f12 etc
    $(document).keydown(function (event) {
        if (event.keyCode == 123) { // Prevent F12
            return false;
        } else if (event.ctrlKey && event.shiftKey && event.keyCode == 73) { // Prevent Ctrl+Shift+I        
            return false;
        } else if(event.ctrlKey && event.shiftKey && event.keyCode == 'I'.charCodeAt(0)) {
            return false;
         }
         if(event.ctrlKey && event.shiftKey && event.keyCode == 'C'.charCodeAt(0)) {
            return false;
         }
         if(event.ctrlKey && event.shiftKey && event.keyCode == 'J'.charCodeAt(0)) {
            return false;
         }
         if(event.ctrlKey && event.keyCode == 'U'.charCodeAt(0)) {
            return false;
         }
    });

    // disable devTools
    var element = new Image;
    var devtoolsOpen = false;
    setInterval(function() {
        console.log('xx',element);
        element.__defineGetter__("id", function() {
            devtoolsOpen = true;
        });
        if(devtoolsOpen){
            window.location = 'prohibited';
        }
    }, 3000);
}

function onMaintenance(text) {
    let param = { type: "error", text: text  + ' on maintenance, please try again later' }
    callNotif(param);
}

function logout() {
    localStorage.removeItem('accountProfile');
    localStorage.removeItem('accountLogin');
    sessionStorage.clear();
    window.location = "login";
}

function toastrNotifFull(title,type="success"){
    if(type == 'success') toastr.success(title);
    else if(type == 'warning') toastr.warning(title);
    else if(type == 'info') toastr.info(title);
    else toastr.error(title);
}

function callNotif(param) {
    Swal.fire({
        position: 'center',
        type: param.type,
        title: param.text,
        showConfirmButton: false,
        timer: 2000
    })
}

function containerOnLoad(idParam){
    var loader = "<div class='d-flex justify-content-center loader"+idParam+"'>"+
                "<div class='spinner-grow' role='status'>"+
                "<span class='sr-only'>Loading...</span>"+
                "</div>"+
                "</div>";
    $("#"+idParam).addClass("disableInput");
    $('#'+idParam).append(loader);
    $('.loader'+idParam).css({
        'position': 'absolute',
        'top': '50%',
        'left': '50%',
        'transform': 'translateX(-50%)',
    });
}

function containerDone(idParam){
    $(".loader"+idParam).remove();
    $('#'+idParam).removeClass('disableInput');
}

async function logoutNotif(redirect){
    Swal.fire({
        type: "error",
        title: 'Expired session',
        text: "Sorry, your session has expired, please login again!",
        icon: 'warning',
        showCancelButton: false,
        confirmButtonColor: '#d33',
        timer: 10000,
        confirmButtonText: 'OK',
        allowOutsideClick: false,
        allowEscapeKey  : false
    }).then(() => {
        if (redirect != '' && redirect != undefined) {
            redirect();
        } else {
            logout();
        }
    })
}

async function contactMore(){
    Swal.fire({
        type: "error",
        title: 'Restricted Access',
        text: "Please contact employee with higher grade to add more member",
        icon: 'warning',
        showCancelButton: false,
        confirmButtonColor: '#d33',
        timer: 10000,
        confirmButtonText: 'OK',
        allowOutsideClick: false,
        allowEscapeKey  : false
    })
}

async function ajaxCall({
    data,
    url,
    method,
    credentialHeader = false,
    extraHeaders = {},
    headers = {
        "Content-Type": "application/json",
        "Accept": "*/*",
        "Cache-Control": "no-cache",
    },
    formdata = false,
    decrypt = false
}) {
    return new Promise(async function (resolve, reject) {
        let ct;
        if (credentialHeader) {
            try {
                ct = JSON.parse(localStorage.getItem('accountProfile'));
                headers.token = ct.token;
                headers.secretKey = ct.secretKey,
                headers.signature = ct.signature
            } catch (error) {
                console.log('err', error);
                resolve(toastrNotifFull('empty credential'));
            }
        }

        if (extraHeaders) headers = Object.assign(headers, extraHeaders);

        if (!formdata) {
            $.ajax({
                url: url,
                crossDomain: true,
                method: method,
                headers: headers,
                data: JSON.stringify(data)
            }).done(async function (callback) {
                if (!decrypt) resolve(callback);
                else {
                    iterateObjectDecryptAES(callback.data)
                    resolve(callback);
                }

            }).fail(async function (b) {
                resolve(false)
            })
        } else {
            $.ajax({
                type: method,
                crossDomain: true,
                contentType: false,
                cache: false,
                url: url,
                processData: false,
                enctype: 'multipart/form-data',
                headers: headers,
                data: data,
            }).done(async function (callback) {
                resolve(callback);
            }).fail(async function (b) {
                resolve(false)
            })
        }

    })
}


function iterateObjectDecryptAES(obj) {
    try {
        let temp;
        Object.keys(obj).forEach(key => {
            if (typeof obj[key] === 'object') {
                iterateObjectDecryptAES(obj[key])
            } else {
                temp = obj[key];
                obj[key] = aesDecrypt(obj[key]);
                if (obj[key] == "") obj[key] = temp;
                if (obj[key].toString().includes("error")) obj[key] = temp;
            }
        })
        return obj;
    } catch (error) {
        return obj;
    }
}

function aesDecrypt(data) {
    var key = CryptoJS.enc.Utf8.parse(aesKeyDecrypt);
    var iv = CryptoJS.enc.Utf8.parse(ivKeyDecrypt);
    var decryptedWA = CryptoJS.AES.decrypt(data, key, {
        iv: iv
    });
    var decryptedUtf8 = decryptedWA.toString(CryptoJS.enc.Utf8);
    return decryptedUtf8;
}

function iterateObjectEncryptAESGlobal(obj) {
    Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'object') {
            iterateObjectEncryptAESGlobal(obj[key])
        } else {
            obj[key] = aesEncryptGlobal(obj[key]);
        }
    })
    return obj;
}

function aesEncryptGlobal(data) {
    let key = aesKeyDecrypt;
    let iv = ivKeyDecrypt;
    let cipher = CryptoJS.AES.encrypt(data, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Utf8.parse(iv),
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
    });
    return cipher.toString();
}

function iterateObjectValueToString(obj) {
    Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'object') {
            iterateObjectValueToString(obj[key])
        } else {
            obj[key] = obj[key].toString();
        }
    })
    return obj;
}