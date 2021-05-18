async function sendGoogleCode() {
    const urlParams = new URLSearchParams(window.location.search);
    const userData = parseUserData()
    ct = parseUserData()
    const code = urlParams.get('code');
    const employeeId = userData.id_employee;
    let hostname = window.location.href;
    let path = window.location.pathname;
    hostname = hostname.split(path)[0];
    let body = {
        "employeeId": employeeId,
        "code": code,
        "hostname": hostname
    }
    console.log("body::", body);
    let result = await syncGoogle(body)
    if (result.responseCode == '200') {
        $('#myDiv').html(`<h2>Success!!</h2>
        <p>${result.responseMessage}</p>
        <button id="close" class="btn btn-success rounded-circle"><i class="fas fa-check"></i></button>`)
    }
    else {
        $('#myDiv').html(`<h2>Failed!!</h2>
        <p>${result.responseMessage ? result.responseMessage : 'Something were wrong! Please try again'}</p>
        <button id="retry" class="btn btn-warning rounded-circle"><i class="fas fa-redo-alt"></i></button>`)
    }
    $('#loader').hide()
    $('#myDiv').show()
}

$(document).on('click', '#close', function(){
    window.close()
})

$(document).on('click', '#retry', function(){
    $('#loader').show()
    $('#myDiv').hide()
    sendGoogleCode();
})