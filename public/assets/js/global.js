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

async function logoutNotif(){
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
        logout();
    })
}

async function checkIfServiceIsOpen(port,token){
    return new Promise(async function (resolve, reject) {
        try {
            $.ajax({
                url: 'openService',
                crossDomain: true,
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "*/*",
                    "Cache-Control": "no-cache",
                    "port": port,
                    "token":token
                },
                success: function (callback) {
                    resolve(callback);
                },
            })
        } catch (err) {
            console.log(err);
            reject(callback);
        }
    })
    
}

function diffTime(a, b, time) {
    var result = a.diff(b, time);
    return result;
}

function getDifference(item, time) {
    var thedate = moment(item.date);
    var todayDate = moment();
    var difference = diffTime(todayDate, thedate, time);
    return difference;
}