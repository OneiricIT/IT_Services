// Copyright (c) 2019, Oneiric Group Pty Ltd and contributors
// For license information, please see license.txt

cur_frm.calculateTableHeight = function (dataTableLength) {
    var table_height = 1;
    for (var i = 0; i < dataTableLength; i++) {
        table_height += 41;
    }
    return table_height;
};
cur_frm.setRowHeightt = function (dataTableLength, purpose) {


    if (purpose == 'invoice') {
        $('div[class="dt-body"]').css('overflow-x', 'hidden');
        $('div[class="datatable dt-instance-1"]').css('overflow-x', 'hidden');


    }

}
cur_frm.initializeDataTableForITInvoiceProcessed = function (new_data) {

    var data = [];

    if (!new_data) {
        if (cur_frm.doc.list_of_invoices) {
            for (var i = 0; i < cur_frm.doc.list_of_invoices.length; i++) {
                data.push([cur_frm.doc.list_of_invoices[i].customer, cur_frm.doc.list_of_invoices[i].contact, cur_frm.doc.list_of_invoices[i].email_address, roundNumber((cur_frm.doc.list_of_invoices[i].grand_total), 2), cur_frm.doc.list_of_invoices[i].link, cur_frm.doc.list_of_invoices[i].send_email])
            }
        }
    } else {
        if (new_data.length) {
            for (var i = 0; i < new_data.length; i++) {

                data.push([new_data[i][0], new_data[i][1], new_data[i][2], roundNumber((new_data[i][3]), 2), new_data[i][4]])
            }

        } else {
            if (cur_frm.doc.list_of_invoices) {
                for (var i = 0; i < cur_frm.doc.list_of_invoices.length; i++) {
                    data.push([cur_frm.doc.list_of_invoices[i].customer, cur_frm.doc.list_of_invoices[i].contact, cur_frm.doc.list_of_invoices[i].email_address, roundNumber((cur_frm.doc.list_of_invoices[i].grand_total), 2), cur_frm.doc.list_of_invoices[i].link, cur_frm.doc.list_of_invoices[i].send_email])
                }

            }
        }

    }


    frappe.require(["/assets/it_services/js/frappe-datatable.js", "/assets/it_services/css/it-invoice-processing.min.css"], function () {


        var table_height = cur_frm.calculateTableHeight(data.length);
        cur_frm.newDataTableForITInvoiceProcessed(data, table_height);
    })

}

cur_frm.newDataTableForITInvoiceProcessed = function (data, table_height) {

    cur_frm.datatable = new DataTable('div[data-fieldname="invoice_processed_datatable"]', {
        columns: ["Customer", "Contact", "Email Address", "Grand Total", "Sales Invoice", ""],
        data: data
    });


    var init = setInterval(function () {

        $('div[class="dt-scrollable"]').css("height", table_height.toString() + "px");
        cur_frm.setRowHeightt(data.length, 'invoice');
        frappe.call({
            method: 'it_services.it_services.doctype.it_invoice_processing.it_invoice_processing.get_currency_symbol',
            callback: function (r) {
                if (r.message) {

                    for (var i = 0; i < $('div[class="dt-cell__content dt-cell__content--col-4"]').length; i++) {
                        for (var ii = 0; ii < data.length; ii++) {
                            if ($('div[class="dt-cell__content dt-cell__content--col-4"]')[i].innerText == data[ii][3]) {
                                $('div[class="dt-cell__content dt-cell__content--col-4"]')[i].innerText = r.message + " " + data[ii][3];

                            }
                        }
                    }
                }
                for (var i = 0; i < $('div[class="dt-cell__content dt-cell__content--col-5"]').length; i++) {
                    for (var ii = 0; ii < data.length; ii++) {
                        if ($('div[class="dt-cell__content dt-cell__content--col-5"]')[i].innerText == data[ii][4]) {
                            $('div[class="dt-cell__content dt-cell__content--col-5"]')[i].innerHTML = "<a href='" + window.location.origin + "/desk#Form/Sales%20Invoice/" + data[ii][4] + "'>" + data[ii][4] + "</a>";


                        }
                    }

                }

            }

        })
        cur_frm.data = data;
        $('div[class="dt-scrollable"]').css('margin-top', '28px');
        $('div[data-fieldname="invoice_processed_datatable"]').css("display", "");
        if (!$('div[class="dt-cell__content dt-cell__content--header-6"]')[0].children.length) {
            $('div[class="dt-cell__content dt-cell__content--header-6"]')[0].innerHTML += "<input type='checkbox'  />";
            $('div[class="dt-cell__content dt-cell__content--header-6"]')[0].children[0].onchange = function () {
                for (var row = 0; row < cur_frm.data.length; row++) {
                    if ($('div[class="dt-cell__content dt-cell__content--header-6"]')[0].children[0].checked) {
                        $('div[class="dt-cell__content dt-cell__content--col-6"]')[row].children[0].checked = true;

                    } else {
                        $('div[class="dt-cell__content dt-cell__content--col-6"]')[row].children[0].checked = false;

                    }
                }
            };
        }
        for (var row = 0; row < cur_frm.data.length; row++) {
            if (parseInt(cur_frm.data[row][5]) == 1) {
                $('div[class="dt-cell__content dt-cell__content--col-6"]')[row].innerHTML = "<input type='checkbox' >";
                $('div[class="dt-cell__content dt-cell__content--col-6"]')[row].children[0].checked = true;

            } else {
                $('div[class="dt-cell__content dt-cell__content--col-6"]')[row].innerHTML = "<input type='checkbox' >";

            }

        }
        clearInterval(init);


    }, 100);

    var check = setInterval(function () {
        if ($('div[class="dt-cell__content dt-cell__content--col-0"]')[3]) {
            if ($('div[class="dt-cell__content dt-cell__content--col-0"]')[3].innerText == '1') {
                clearInterval(check);
                window.location.reload();
            }
        }
    }, 100)
};