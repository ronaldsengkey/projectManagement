const filterTimeRanges = `<div id="filterTimeRanges" class="dropdown mx-1">
        <a class="btn btn-lg btn-trigger z-depth-0 m-0 py-2 px-3 text-capitalize" href="#">
            <i class="far mr-2 fa-calendar-alt"></i>
            Time Ranges <span id="onFilter" class="text-success"><i class="fas fa-check-circle"></i></span>
            <i class="fas ml-2 fa-chevron-down"></i>
        </a>
        <div class="dropdown-menu dropdown-menu-right">
            <form onsubmit="return false">
                <div class="form-group px-3">
                    <label>Date Picker</label>
                    <input type="text" class="form-control form-control-sm border-0" id="filterDatePicker" readonly />
                    <input type="hidden" id="filterStartDate" />
                    <input type="hidden" id="filterEndDate" />
                </div>
            </form>
            <div class="dropdown-divider"></div>
            <label class="px-3">Range</label>
            <a class="dropdown-item px-3 active" href="#" data-selected="1" onclick="filterPage(this)">Last 7 days</a>
            <a class="dropdown-item px-3" href="#" data-selected="2" onclick="filterPage(this)">Last 30 days</a>
            <a class="dropdown-item px-3" href="#" data-selected="3" onclick="filterPage(this)">Last 365 days</a>
        </div>
    </div>`

const filterCustomerId = `<div id="filterCustomerId" class="dropdown mx-1">
        <a href="#" class="btn btn-lg z-depth-0 m-0 py-2 px-3 text-capitalize" type="button" data-toggle="dropdown" aria-haspopup="true"
        aria-expanded="false">
            <i class="fas mr-2 fa-user"></i>
            Customer ID <span id="onFilter" class="text-success"></span>
            <i class="fas ml-2 fa-chevron-down"></i>
        </a>
        <div id="formCustomerID" class="dropdown-menu dropdown-menu-right px-3">
            <form onsubmit="return false">
                <div class="form-group m-0">
                    <label>Customer ID</label>
                    <input type="text" class="form-control form-control-sm" placeholder="e.g 29" id="valCustomerId" autocomplete="off" />
                </div>
            </form>
            <button type="button" class="btn btn-sm btn-primary btn-block m-0 mb-1 mt-2" onclick="filterPage(this)"><i class="fas fa-filter mr-1"></i> Apply</button>
        </div>
    </div>`

const filterMount = `<div id="filterAmount" class="dropdown mx-1">
        <a href="#" class="btn btn-lg z-depth-0 m-0 py-2 px-3 text-capitalize" type="button" data-toggle="dropdown" aria-haspopup="true"
        aria-expanded="false">
            <i class="fas mr-2 fa-user"></i>
            Amount <span id="onFilter" class="text-success"></span>
            <i class="fas ml-2 fa-chevron-down"></i>
        </a>
        <div id="formAmount" class="dropdown-menu dropdown-menu-right px-3">
            <form onsubmit="return false">
                <div class="form-group m-0">
                    <label>Amount</label>
                    <div class="input-group">
                        <input type="text" class="form-control form-control-sm" placeholder="Min" id="filterMin" />
                        <input type="text" class="form-control form-control-sm" placeholder="Max" id="filterMax" />
                    </div>
                </div>
            </form>
            <button type="button" class="btn btn-sm btn-primary btn-block m-0 mb-1 mt-2" onclick="filterPage(this)"><i class="fas fa-filter mr-1"></i> Apply</button>
        </div>
    </div>`

const filterTransactionIn = `<div id="filterTransactionIn" class="dropdown mx-1">
        <a href="#" class="btn btn-lg z-depth-0 m-0 py-2 px-3 text-capitalize" type="button" data-toggle="dropdown" aria-haspopup="true"
        aria-expanded="false">
            <i class="fas mr-2 fa-user"></i>
            TransactionIn <span id="onFilter" class="text-success"></span>
            <i class="fas ml-2 fa-chevron-down"></i>
        </a>
        <div id="formTransactionIn" class="dropdown-menu dropdown-menu-right px-3">
            <form onsubmit="return false">
                <div class="form-group m-0">
                    <label>TransactionIn</label>
                    <div class="input-group">
                        <input type="text" class="form-control form-control-sm" placeholder="Min" id="filterMinTransactionIn" />
                        <input type="text" class="form-control form-control-sm" placeholder="Max" id="filterMaxTransactionIn" />
                    </div>
                </div>
            </form>
            <button type="button" class="btn btn-sm btn-primary btn-block m-0 mb-1 mt-2" onclick="filterPage(this)"><i class="fas fa-filter mr-1"></i> Apply</button>
        </div>
    </div>`

const filterTransactionOut = `<div id="filterTransactionOut" class="dropdown mx-1">
        <a href="#" class="btn btn-lg z-depth-0 m-0 py-2 px-3 text-capitalize" type="button" data-toggle="dropdown" aria-haspopup="true"
        aria-expanded="false">
            <i class="fas mr-2 fa-user"></i>
            TransactionOut <span id="onFilter" class="text-success"></span>
            <i class="fas ml-2 fa-chevron-down"></i>
        </a>
        <div id="formTransactionOut" class="dropdown-menu dropdown-menu-right px-3">
            <form onsubmit="return false">
                <div class="form-group m-0">
                    <label>TransactionOut</label>
                    <div class="input-group">
                        <input type="text" class="form-control form-control-sm" placeholder="Min" id="filterMinTransactionOut" />
                        <input type="text" class="form-control form-control-sm" placeholder="Max" id="filterMaxTransactionOut" />
                    </div>
                </div>
            </form>
            <button type="button" class="btn btn-sm btn-primary btn-block m-0 mb-1 mt-2" onclick="filterPage(this)"><i class="fas fa-filter mr-1"></i> Apply</button>
        </div>
    </div>`

const filterMonth = `<div id="filterMonth" class="dropdown mx-1">
        <a href="#" class="btn btn-lg z-depth-0 m-0 py-2 px-3 text-capitalize" type="button" data-toggle="dropdown" aria-haspopup="true"
        aria-expanded="false">
            <i class="fas mr-2 fa-user"></i>
            Month <span id="onFilter" class="text-success"></span>
            <i class="fas ml-2 fa-chevron-down"></i>
        </a>
        <div id="formMonth" class="dropdown-menu dropdown-menu-right px-3">
            <form onsubmit="return false">
                <div class="form-group m-0">
                    <label>Month</label>
                    <div class="input-group">
                        <input type="text" class="form-control form-control-sm" placeholder="e.g 12" id="filterMonth" />
                        <input type="text" class="form-control form-control-sm" placeholder="e.g 2020" id="filterYear" />
                    </div>
                </div>
            </form>
            <button type="button" class="btn btn-sm btn-primary btn-block m-0 mb-1 mt-2" onclick="filterPage(this)"><i class="fas fa-filter mr-1"></i> Apply</button>
        </div>
    </div>`


const filterPartnerId = `<div id="filterPartnerId" class="dropdown mx-1">
        <a href="#" class="btn btn-lg z-depth-0 m-0 py-2 px-3 text-capitalize" type="button" data-toggle="dropdown" aria-haspopup="true"
        aria-expanded="false">
            <i class="fas mr-2 fa-user"></i>
            Partner ID <span id="onFilter" class="text-success"></span>
            <i class="fas ml-2 fa-chevron-down"></i>
        </a>
        <div id="formPartnerID" class="dropdown-menu dropdown-menu-right px-3">
            <form onsubmit="return false">
                <div class="form-group m-0">
                    <label>Partner ID</label>
                    <input type="text" class="form-control form-control-sm" placeholder="e.g 29" id="valPartnerId" autocomplete="off" />
                </div>
            </form>
            <button type="button" class="btn btn-sm btn-primary btn-block m-0 mb-1 mt-2" onclick="filterPage(this)"><i class="fas fa-filter mr-1"></i> Apply</button>
        </div>
    </div>`

function appendFilter(filters = '') {
    $('#pageFilter').empty();

    const lengthFilters = filters.length;
    if (lengthFilters > 0) {
        $.each(filters, function (key, value) {
            $('#pageFilter').append(value);
        })
        
        openFilterTimeRanges()
        filterDatePicker()
        dropdownSelected()
    }
}

async function filterPage(current = '_') {
    loadingActivated();
    const currentParentId = current === '_' ? '_' : $(current).parent().parent().attr('id');
    const setFilterTimeRanges = currentParentId === 'filterTimeRanges' ? current : currentParentId === '_' ? '_' : $('#filterTimeRanges .dropdown-menu a.active');

    // console.log('currentParentId', currentParentId);
    // console.log('setFilterTimeRanges', setFilterTimeRanges);

    if (setFilterTimeRanges === '_') {
        var startDate = moment(new Date($('#filterStartDate').val())).format('YYYY-MM-DD');
        var endDate = moment(new Date($('#filterEndDate').val())).format('YYYY-MM-DD');
        $('#filterTimeRanges .dropdown-menu a').removeClass('active');
    } else {
        const selected = $(setFilterTimeRanges).data('selected');
        // console.log('dropdown selected', selected);
        if (selected == '1') {
            var startDate = moment().subtract(7,'d').format('YYYY-MM-DD');
            var endDate = moment().format('YYYY-MM-DD');
        } else if (selected == '2') {
            var startDate = moment().subtract(30,'d').format('YYYY-MM-DD');
            var endDate = moment().format('YYYY-MM-DD');
        } else if (selected == '3') {
            var startDate = moment().subtract(365,'d').format('YYYY-MM-DD');
            var endDate = moment().format('YYYY-MM-DD');
        } else {
            var startDate = moment(new Date($('#filterStartDate').val())).format('YYYY-MM-DD');
            var endDate = moment(new Date($('#filterEndDate').val())).format('YYYY-MM-DD');
            console.log('else true', startDate +'-'+ endDate);
        }
    }

    $(setFilterTimeRanges).parent().parent().find('a.btn-trigger').removeClass('show');
    $(setFilterTimeRanges).parent().removeClass('show');

    const findChart = $('#chartSection').length; // homepage

    if (findChart > 0) { // homepage
        var param = {
            "start_date" : startDate,
            "end_date" : endDate
        };
        await chartBoardChecking(param);
    }


}

function filterDatePicker() {
    // $('#filterDatePicker').daterangepicker({
    //     showDropdowns: true,
    //     opens: 'left',
    //     locale: {
    //         format: 'DD/MM/YYYY'
    //     }
    // })

    // $('#filterDatePicker').on('apply.daterangepicker', function(ev, picker) {
    //     $('#filterStartDate').val(picker.startDate.format('YYYY-MM-DD'));
    //     $('#filterEndDate').val(picker.endDate.format('YYYY-MM-DD'));
    //     $('#filterTimeRanges a.btn-trigger, #filterTimeRanges .dropdown-menu').removeClass('show');
    //     filterPage('_');
    // });
}

function openFilterTimeRanges() {
    $('#filterTimeRanges a.btn-trigger').click(function (event) {
        event.preventDefault();
        if ($(this).hasClass('show')) {
            $(this).removeClass('show');
            $(this).parent().find('.dropdown-menu').removeClass('show');
        } else {
            $(this).addClass('show');
            $(this).parent().find('.dropdown-menu').addClass('show');
        }
    })

    // $('body').click(function (event) {
    //     event.preventDefault();
    //     if ($(event.target).closest('#filterTimeRanges').length === 0) {
    //         $('#filterTimeRanges a.btn-trigger').removeClass('show');
    //         $('#filterTimeRanges a.btn-trigger').parent().find('.dropdown-menu').removeClass('show');
    //     }
    // })
}

function dropdownSelected() {
    $('.dropdown a.dropdown-item').click(function(event) {
        event.preventDefault();
        $(this).addClass('active');
        $(this).siblings().removeClass('active');

        const buttonId = $(this).closest('.dropdown').attr('id');
        const selectedText = $(this).data('selected');
        if (buttonId === 'filterStatusIncome') {
            $('#'+ buttonId).find('span.badge').html(selectedText);
        }
    })
}

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}