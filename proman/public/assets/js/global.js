'use strict'
function unauthorized() {
    let param = { type: "error", text: "unauthorized access" }
    callNotif(param);
}

function loadingActivated() {
    const loading = '<div id="loadingWrap">' +
        '<div class="text-center contentLoadingWrap">' +
        '<div class="lds-ripple"><div></div><div></div></div>' +
        '</div>' +
        '</div>';
    $(loading).insertBefore('head');
    $('#loadingWrap').fadeIn('slow');
}

function loadingDeactivated() {
    $('#loadingWrap').fadeOut('slow', function () {
        $('#loadingWrap').remove();
    });
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

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

$(function(){
    // disableDevTools()
})

function disableDevTools() {
    // disable right click
    $(document).bind("contextmenu", function (e) {
        return false;
    });

    disablePrintScreenAndPrint()

    // disable f12 etc
    $(document).keydown(function (event) {
        if (event.keyCode == 123) { // Prevent F12
            return false;
        } else if (event.ctrlKey && event.shiftKey && event.keyCode == 73) { // Prevent Ctrl+Shift+I        
            return false;
        } else if (event.ctrlKey && event.shiftKey && event.keyCode == 'I'.charCodeAt(0)) {
            return false;
        }
        if (event.ctrlKey && event.shiftKey && event.keyCode == 'C'.charCodeAt(0)) {
            return false;
        }
        if (event.ctrlKey && event.shiftKey && event.keyCode == 'J'.charCodeAt(0)) {
            return false;
        }
        if (event.ctrlKey && event.keyCode == 'U'.charCodeAt(0)) {
            return false;
        }
    });

    // disable devTools
    window.addEventListener('devtoolschange', event => {
        if (event.detail.isOpen) window.location = '/proman/prohibited';
    });
    if (window.devtools.isOpen) window.location = '/proman/prohibited';
}

function onMaintenance(text) {
    let param = { type: "error", text: text  + ' on maintenance, please try again later' }
    callNotif(param);
}

function logout() {
    localStorage.clear()
    sessionStorage.clear();
    window.location = "/proman/login";
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
                url: '/proman/' + url,
                crossDomain: true,
                method: method,
                headers: headers,
                data: JSON.stringify(data)
            }).done(async function (callback) {
                if (!decrypt) resolve(callback);
                else {
                    if (callback.data != undefined) iterateObjectNewDecrypt(callback.data, callback.cred)
                    resolve(callback);
                }

            }).fail(async function (b) {
                resolve(false)
            })
        } else {
            $.ajax({
                type: method,
                contentType: false,
                cache: false,
                url: '/proman/' + url,
                processData: false,
                headers: headers,
                data: data,
            }).done(async function (callback) {
                resolve(callback);
            }).fail(async function (b) {
                console.log('bbb',b);
                resolve(false)
            })
        }

    })
}

function iterateObjectNewEncrypt(obj,keys) {
    try {
        let temp;
        Object.keys(obj).forEach(key => {
            if (typeof obj[key] === 'object') {
                iterateObjectNewEncrypt(obj[key],keys)
            } else {
                temp = obj[key];
                obj[key] = newEncrypt(obj[key],keys);
                if (obj[key] == "" || obj[key] == null || obj[key] == {}) obj[key] = temp;
                if (obj[key].toString().includes("error")) obj[key] = temp;
            }
        })
        return obj;
    } catch (error) {
        return obj;
    }
    
}

function iterateObjectNewDecrypt(obj,keys) {
    try {
        let temp;
        Object.keys(obj).forEach(key => {
            if (typeof obj[key] === 'object') {
                iterateObjectNewDecrypt(obj[key],keys)
            } else {
                temp = obj[key];
                if (key != 'cred') obj[key] = newDecrypt(obj[key],keys);
                if (obj[key] == "") obj[key] = temp;
            }
        })
        return obj;
    } catch (error) {
        console.log('err',error);
        return obj;
    }
    
}

function newEncrypt(string, key){
    let result = ''; 
    for(let i=0; i<string.length; i++) {
        let char = string.toString().substr(i,1);
        let keychar = key.substr((i % key.length)-1,1);
        char = String.fromCharCode(char.charCodeAt(0) + keychar.charCodeAt(0));
        result += char;
    }
    return window.btoa(result); 
}

function newDecrypt(strings,key){
    let result = ''; 
    let string = window.atob(strings); 
    for(let i=0;i<string.length; i++) { 
        let char = string.substr(i, 1); 
        let keychar = key.substr((i % key.length)-1, 1);
        char = String.fromCharCode(char.charCodeAt(0)-keychar.charCodeAt(0));
        result += char; 
    }
    return result; 
}

async function getGenerateKey(){
    return await ajaxCall({url:'generateKey',method:'GET'});
}


// DEVTOOLS

!function(){"use strict";const i={isOpen:!1,orientation:void 0},e=(i,e)=>{window.dispatchEvent(new CustomEvent("devtoolschange",{detail:{isOpen:i,orientation:e}}))},n=({emitEvents:n=!0}={})=>{const o=window.outerWidth-window.innerWidth>160,t=window.outerHeight-window.innerHeight>160,d=o?"vertical":"horizontal";t&&o||!(window.Firebug&&window.Firebug.chrome&&window.Firebug.chrome.isInitialized||o||t)?(i.isOpen&&n&&e(!1,void 0),i.isOpen=!1,i.orientation=void 0):(i.isOpen&&i.orientation===d||!n||e(!0,d),i.isOpen=!0,i.orientation=d)};n({emitEvents:!1}),setInterval(n,500),"undefined"!=typeof module&&module.exports?module.exports=i:window.devtools=i}();