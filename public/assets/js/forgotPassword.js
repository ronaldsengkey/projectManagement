$(function(){
    let path = window.location.pathname
    let ori = window.location.search
    if(path.indexOf('reqpassword') > -1){
        handleReqPassword(ori)
    }
})
let getEmailParam = '';
function handleReqPassword(ori){
    let searchSubStr = ori.substring(0, 1);
    let replaceStr = '';
    let decode64 = '';
    let getURLparam = '';
    if(searchSubStr == '?'){
        //replace ? with empty string
        replaceStr = ori.replace('?','');
        //decode base64
        decode64 = window.atob(replaceStr);
        // ? mark combine with decode result
        decode64 = searchSubStr + decode64;
        // split email param
        getURLparam = decode64.split('email=')[1];
    }

    let formField = '<div class="row">'+
    '<div class="col-12">'+
        // '<div class="md-form form-sm">'+
        //   '<i class="fas fa-lock prefix"></i>'+
        //   '<input type="password" id="oldPassword" class="form-control form-control-sm">'+
        //   '<label for="oldPassword" class="">Old Password</label>'+
        // '</div>'+
        passwordField+
        confirmPasswordField+
    '<div class="text-center mt-4 mb-2">'+
            '<input type="hidden" id="emailParam" value="'+getURLparam+'"><button class="btn orange darken-1 text-white waves-effect waves-light" type="button" data-target="resetPassword" id="confirmForgotPassword">Submit'+
            '<i class="fas fa-send ml-2"></i>'+
            '</button>'+
            '</div>'+
        '</div>'+
    '</div>';
    activeModal(formField,true);

    $('#newPasswordReset').togglePassword();
    $('#newConfirmPassword').togglePassword();
}

let emailField = '<form id="sendEmailForm"><div class="md-form form-sm">'+
'<i class="fas fa-envelope prefix"></i>'+
'<input type="email" id="emailReset" class="form-control form-control-sm" placeholder="Your Email" required>'+
// '<label for="email" class="">Your email</label>'+
'</div>';
let passwordField = '<form id="sendEmailForm"><div class="md-form form-sm">'+
'<i class="fas fa-lock prefix"></i>'+
'<input type="password" id="newPasswordReset" name="newPasswordReset" placeholder="New Password" class="form-control form-control-sm" required>'+
// '<label for="newPassword" class="">New Password</label>'+
'</div>';

let confirmPasswordField = '<div class="md-form form-sm">'+
'<i class="fas fa-lock prefix"></i>'+
'<input type="password" id="newConfirmPassword" name="newConfirmPassword" placeholder="Confirm Password" class="form-control form-control-sm" required>'+
// '<label for="newConfirmPassword" class="">Confirm Password</label>'+
'</div>';


$(document).on('click','.click', function(){
    let target = $(this).data('target');
    let origin = $(this).data('origin');
    let content = '';
    switch (target){
        case "modal":
            switch (origin){
                case "forgotPassword":
                    content = '<div class="row"><div class="col-12">'+
                    emailField+
                  '<div class="text-center mt-4 mb-2">'+
                      '<button class="btn btn-danger waves-effect waves-light" type="button" data-target="sendEmailReset" id="getFieldPassword">Submit'+
                        '<i class="fas fa-send ml-2"></i>'+
                      '</button>'+
                    '</div>'+
                '</div></div></form>';
                    break;
            }
            activeModal(content);
            break;
    }
});

$(document).on('click', '#getFieldEmail', function () {
    let html = emailField + '<div class="text-center mt-4 mb-2">' +
        '<button class="btn btn-danger waves-effect waves-light" type="button" data-target="sendEmailReset" id="getFieldPassword">Submit' +
        '<i class="fas fa-send ml-2"></i>' +
        '</button>' +
        '</div>';
    $('.modal-body').empty();
    $('.modal-body').html('');
    $('.modal-body').html(html);
});

function activeModal(content,mandatory = false){
    if(!mandatory){
        $('#modalBottomRight').modal({
            show: true
        });
    } else {
        $('.closeFP').remove();
        $('#modalBottomRight').modal({
            show: true,
            backdrop: 'static', 
            keyboard: false
        });
    }
    if(content != ''){
        $('.modal-body').empty();
        $('.modal-body').html('');
        $('.modal-body').html(content);
    }
}

$(document).on('click','button', function(){
    let target = $(this).data('target');
    let origin = $(this).data('origin') == undefined?'employee':$(this).data('origin');
    console.log('origin yeee =>',origin)
    switch(target){
        case "resetPassword":
            $("#sendEmailForm").validate({
                errorClass: "error active text-danger",
                rules: {
                    newConfirmPassword: {
                        equalTo: "#newPasswordReset"
                    }
                },
                messages: {
                    newPasswordReset: " Enter Password",
                    newConfirmPassword: " Confirm Password must be same as Password"
                }
            });
            if($('#sendEmailForm').valid()){
                containerOnLoad();
                var newPassword = $('#newPasswordReset').val();
                var emailPassword = $('#emailParam').val();
                var sendNewPass = {
                    "email": emailPassword,
                    "password":newPassword
                }
                var dataSendNewPassword = {
                    settings:{
                        "async": true,
                        "crossDomain": true,
                        "url": "/forgot/password/employee",
                        "method": "PUT",
                        "headers": {
                        "Content-Type": "application/json",
                    },
                    "processData": false,
                    "body":JSON.stringify(sendNewPass),
                    }
                };
                $.ajax({
                    url: 'sendNewPassword',
                    crossDomain: true,
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "*/*",
                        "Cache-Control": "no-cache"
                    },
                    data: JSON.stringify(dataSendNewPassword),
                    success: function(callback){
                        containerDone();
                        if(callback.responseCode == '200'){
                            $('#modalBottomRight').modal('toggle');
                            param = {type:"success",text:callback.responseMessage}
                            callNotif(param);
                            setTimeout(() => {
                                window.location.href = 'login';
                            }, 1000);
                        } else if(callback.responseCode == '401'){
                            logoutNotif();
                        } else{
                            param = {type:"error",text:callback.responseMessage}
                            callNotif(param);
                        }
                    },
                    error:function(){
                        containerDone();
                    }
                })
            }
            break;
        case "sendEmailReset":
            $('#sendEmailForm').validate({
                errorClass: "error active text-danger"
            });
            if($('#sendEmailForm').valid()){
                containerOnLoad();
                var resetEmail = $('#emailReset').val();
                var send = {
                    "email":resetEmail,
                    "link": localUrl + ":" + projectManagementLocalPort + '/reqpassword'
                }
                var dataSendEmail = {
                    settings:{
                        "async": true,
                        "crossDomain": true,
                        "url": "/forgot/password/employee",
                        "method": "POST",
                        "headers": {
                        "Content-Type": "application/json",
                    },
                    "processData": false,
                    "body":JSON.stringify(send),
                    }
                };
                $.ajax({
                    url: 'sendEmailReset',
                    crossDomain: true,
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "*/*",
                        "Cache-Control": "no-cache"
                    },
                    data: JSON.stringify(dataSendEmail),
                    success: function(callback){
                        containerDone();
                        if(callback.responseCode == '200'){
                            $('#modalBottomRight').modal('toggle');
                            param = {type:"success",text:callback.responseMessage + '\n please check your email to confirm'}
                            callNotif(param);
                        } else if(callback.responseCode == '401'){
                            logoutNotif();
                        } else{
                            param = {type:"error",text:callback.responseMessage}
                            callNotif(param);
                        }
                    },
                    error:function(){
                        containerDone();
                    }
                })
            }
            break;
        default:
            break;
    }
});


(($) => {

    class Toggle {
  
      constructor(element, options) {
  
        this.defaults = {
          icon: 'fa-eye'
        };
  
        this.options = this.assignOptions(options);
  
        this.$element = element;
        this.$button = $(`<button class="btn-toggle-pass" type="button"><i class="fa ${this.options.icon}"></i></button>`);
  
        this.init();
      };
  
      assignOptions(options) {
  
        return $.extend({}, this.defaults, options);
      }
  
      init() {
  
        this._appendButton();
        this.bindEvents();
      }
  
      _appendButton() {
        this.$element.after(this.$button);
      }
  
      bindEvents() {
  
        this.$button.on('click touchstart', this.handleClick.bind(this));
      }
  
      handleClick() {
  
        let type = this.$element.attr('type');
  
        type = type === 'password' ? 'text' : 'password';
  
        this.$element.attr('type', type);
        this.$button.toggleClass('active');
      }
    }
  
    $.fn.togglePassword = function (options) {
      return this.each(function () {
        new Toggle($(this), options);
      });
    }
  
  })(jQuery);
  

function containerOnLoad(idParam = 'modalContainer'){
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

function containerDone(idParam = 'modalContainer'){
    $(".loader"+idParam).remove();
    $('#'+idParam).removeClass('disableInput');
}