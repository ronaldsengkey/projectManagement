async function globalGradeChecking(concern,data,type = ''){
    let ct = JSON.parse(accountProfile);
    let processedData;
    switch(concern){
        case 'addBoardDivision':
            // Super Admin Ultipay, CEO, CTO
            if(ct.grade == '0' || ct.grade == '1' || ct.grade == '2'){
                processedData = data;
                return processedData;
            } 
            // Manager, Supervisor, Staff, Part Timer
            else {
                let staffDivision = ct.division_id;
                processedData = data.filter(function(e){
                    return e.id == staffDivision
                })
                return processedData;
            }
            break;
        case 'groupTask':
            // Super Admin Ultipay, CEO, CTO
            if(ct.grade == '0' || ct.grade == '1' || ct.grade == '2'){
                processedData = data;
                return processedData;
            } 
            // Manager
            else if(ct.grade == '3') {
                let managerDivision = ct.division_id;
                processedData = data.filter(function(e){
                    return e.division_id == managerDivision && e.grade >= ct.grade && e.company_id == ct.company_id
                })
                return processedData;
            }
            // Supervisor
            else if(ct.grade == '4') {
                let spvDivision = ct.division_id;
                processedData = data.filter(function(e){
                    if(type == 'Private'){
                        let accepted = window['dataBoardMember'+e.board_id+''].filter(function(f){
                            if(f.account_id == ct.id_employee){
                                return true;
                            }
                        })
                        if(accepted.length > 0) return e;
                    } else
                    return e.division_id == spvDivision && e.grade >= ct.grade && e.company_id == ct.company_id
                })
                return processedData;
            }
            // Staff
            else if(ct.grade == '5') {
                let staffDivision = ct.division_id;
                processedData = data.filter(function(e){
                    if(type == 'Private'){
                        let accepted = window['dataBoardMember'+e.board_id+''].filter(function(f){
                            if(f.account_id == ct.id_employee){
                                return true;
                            }
                        })
                        if(accepted.length > 0) return e;
                    } else
                    return e.division_id == staffDivision && e.grade >= ct.grade && e.company_id == ct.company_id
                })
                return processedData;
            }
            // Part Timer
            else if(ct.grade == '6') {
                let partTimerDivision = ct.division_id;
                processedData = data.filter(function(e){
                    if(type == 'Private'){
                        let accepted = window['dataBoardMember'+e.board_id+''].filter(function(f){
                            if(f.account_id == ct.id_employee){
                                return true;
                            }
                        })
                        if(accepted.length > 0) return e;
                    } else
                    return e.division_id == partTimerDivision && e.grade >= ct.grade && e.company_id == ct.company_id
                })
                return processedData;
            }
            break;
        case 'addBoardEmployee':
            // Super Admin Ultipay, CEO, CTO
            if(ct.grade == '0' || ct.grade == '1' || ct.grade == '2'){
                processedData = data;
                return processedData;
            } 
            // Manager
            else if(ct.grade == '3') {
                let managerDivision = ct.division_id;
                processedData = data.filter(function(e){
                    return e.division_id == managerDivision && parseInt(e.grade) == (parseInt(ct.grade)+1) && e.company_id == ct.company_id
                })
                return processedData;
            }
            // Supervisor
            else if(ct.grade == '4') {
                let spvDivision = ct.division_id;
                processedData = data.filter(function(e){
                    return e.division_id == spvDivision && parseInt(e.grade) == (parseInt(ct.grade)+1) && e.company_id == ct.company_id
                })
                return processedData;
            }
            // Staff
            else if(ct.grade == '5') {
                let staffDivision = ct.division_id;
                processedData = data.filter(function(e){
                    return e.division_id == staffDivision && parseInt(e.grade) == (parseInt(ct.grade)+1) && e.company_id == ct.company_id
                })
                return processedData;
            }
            // Part Timer
            else if(ct.grade == '6') {
                let partTimerDivision = ct.division_id;
                processedData = data.filter(function(e){
                    return e.division_id == partTimerDivision && e.grade == ct.grade && e.company_id == ct.company_id 
                })
                return processedData;
            }
            break;
    }
    
}

async function boardDivisionChecking(data){
    // post board division checking
    return await globalGradeChecking('addBoardDivision',data)
}

async function boardEmployeeChecking(data){
    // post board employee checking
    return await globalGradeChecking('addBoardEmployee',data)
}

async function groupTaskChecking(data,type){
    // get group task checking
    return await globalGradeChecking('groupTask',data,type)
}