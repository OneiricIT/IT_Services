// Copyright (c) 2019, Oneiric Group Pty Ltd and contributors
// For license information, please see license.txt
if (cur_frm.doctype == "IT Ticket") {
    cur_frm.getBillableTime = function () {
        if (cur_dialog.fields_dict.billable_time.input.value < cur_frm.billable_time || !cur_dialog.fields_dict.billable_time.input.value) {
            cur_dialog.fields_dict.billable_time.input.value = cur_frm.billable_time;

        }

        if (cur_frm.doc.contract && cur_dialog.fields_dict.billable_time.input.value && cur_dialog.fields_dict.item_code.input.value) {
            frappe.call({
                method: 'it_services.it_services.doctype.it_ticket.it_ticket.get_billable_time',
                args: {
                    'contract': cur_frm.doc.contract,
                    'billable_time': cur_dialog.fields_dict.billable_time.input.value,
                    'item_code': cur_dialog.fields_dict.item_code.input.value
                },
                callback: function (r) {


                    if (r.message) {
                        cur_frm.rounding_value = r.message;
                        cur_frm.rounded_values = [];
                        var loop = 0;
                        for (var i = 0; i < (24 / r.message); i++) {
                            loop += cur_frm.rounding_value;
                            cur_frm.rounded_values.push(loop);
                        }

                    }
                }
            })

        } else if (cur_dialog.fields_dict.billable_time.input.value && cur_dialog.fields_dict.item_code.input.value) {
            frappe.call({
                method: 'it_services.it_services.doctype.it_ticket.it_ticket.get_global_overrides',
                args: {
                    'billable_time': cur_dialog.fields_dict.billable_time.input.value,
                    'item_code': cur_dialog.fields_dict.item_code.input.value
                },
                callback: function (r) {
                    cur_frm.rounding_value = r.message;
                    cur_frm.rounded_values = [];
                    var loop = 0;
                    for (var i = 0; i < (24 / r.message); i++) {
                        loop += cur_frm.rounding_value;
                        cur_frm.rounded_values.push(loop);
                    }

                }
            })
        }
    }
    cur_frm.startEndAdjustment = function () {
        if (cur_dialog) {
            try {
                cur_frm.msgshown = 0;
                cur_dialog.fields_dict.start_time.input.onchange = function () {
                    setTimeout(function () {


                        cur_frm.is_not_save = 1;
                        if (cur_dialog.fields_dict.end_time) {
                            if (cur_dialog.fields_dict.end_time.input.value) {
                                if (Date.parse(cur_frm.convertToDBDateFormat(cur_dialog.fields_dict.date.input.value) + ' ' + cur_dialog.fields_dict.start_time.input.value) < Date.parse(cur_frm.convertToDBDateFormat(cur_dialog.fields_dict.date.input.value) + ' ' + cur_dialog.fields_dict.end_time.input.value)) {
                                    cur_frm.timer(new Date(cur_frm.convertToDBDateFormat(cur_dialog.fields_dict.date.input.value) + ' ' + cur_dialog.fields_dict.end_time.input.value) - new Date(cur_frm.convertToDBDateFormat(cur_dialog.fields_dict.date.input.value) + ' ' + cur_dialog.fields_dict.start_time.input.value), "")

                                    cur_frm.getBillableTime();
                                } else {

                                    if (cur_frm.msgshown == 0) {
                                        cur_frm.timer(0);
                                        frappe.msgprint("Start time should be before end time.");
                                        cur_dialog.fields_dict.start_time.input.value = "00:00:00";

                                        cur_frm.error = 1;
                                        cur_frm.msgshown = 1;
                                        var t = setInterval(function () {
                                            if ($('button[data-dismiss="modal"]')[1]) {
                                                $('button[data-dismiss="modal"]')[1].onclick = function () {
                                                    cur_frm.msgshown = 0;
                                                }
                                            }
                                        }, 100)
                                    }


                                }

                            }
                        }

                    }, 1000)

                }
                cur_dialog.fields_dict.end_time.input.onchange = function () {

                    setTimeout(function () {


                        cur_frm.is_not_save = 1;
                        if (cur_dialog) {
                            if (cur_dialog.fields_dict.start_time) {
                                if (cur_dialog.fields_dict.start_time.input.value) {
                                    if (Date.parse(cur_frm.convertToDBDateFormat(cur_dialog.fields_dict.date.input.value) + ' ' + cur_dialog.fields_dict.start_time.input.value) < Date.parse(cur_frm.convertToDBDateFormat(cur_dialog.fields_dict.date.input.value) + ' ' + cur_dialog.fields_dict.end_time.input.value)) {
                                        cur_frm.timer(new Date(cur_frm.convertToDBDateFormat(cur_dialog.fields_dict.date.input.value) + ' ' + cur_dialog.fields_dict.end_time.input.value) - new Date(cur_frm.convertToDBDateFormat(cur_dialog.fields_dict.date.input.value) + ' ' + cur_dialog.fields_dict.start_time.input.value), "")

                                        cur_frm.getBillableTime();
                                    } else {
                                        if (cur_frm.msgshown == 0) {
                                            cur_frm.timer(0);
                                            frappe.msgprint("End time should be after start time.");
                                            cur_dialog.fields_dict.end_time.input.value = "00:00:00";
                                            cur_frm.error = 1;
                                            cur_frm.msgshown = 1;
                                            var t = setInterval(function () {
                                                if ($('button[data-dismiss="modal"]')[1]) {
                                                    $('button[data-dismiss="modal"]')[1].onclick = function () {
                                                        cur_frm.msgshown = 0;
                                                    }
                                                }
                                            }, 100)
                                        }

                                    }

                                }
                            }

                        }

                    }, 1000)

                }
            } catch (e) {
                console.log(e);
            }
        }

    }
    cur_frm.getCurrentDate = function () {
        var current_date = new Date(frappe.datetime.now_date());
        var day = current_date.getDate();

        var month = 0;
        if (current_date.getMonth() < 9) {
            month = "0" + (current_date.getMonth() + 1);
        } else {
            month = current_date.getMonth() + 1;
        }
        return day + "/" + month + "/" + current_date.getFullYear();
    }
    cur_frm.convertToSystemDateFormat = function (date) {
        var date = new Date(date);
        var day = 0;
        if (date.getDate() < 10) {
            day = "0" + (date.getDate());
        } else {
            day = date.getDate()
        }
        var month = 0;
        if (date.getMonth() < 9) {
            month = "0" + (date.getMonth() + 1);
        } else {
            month = date.getMonth() + 1;
        }
        return day + "/" + month + "/" + date.getFullYear();
    }
    cur_frm.convertToDBDateFormat = function (date) {
        var date = new Date(date.split('/')[2] + '-' + date.split('/')[1] + '-' + date.split('/')[0]);
        var day = 0;
        if (date.getDate() < 10) {
            day = "0" + (date.getDate());
        } else {
            day = date.getDate()
        }
        var month = 0;
        if (date.getMonth() < 9) {
            month = "0" + (date.getMonth() + 1);
        } else {
            month = date.getMonth() + 1;
        }
        return date.getFullYear() + "-" + month + "-" + day;
    }
    cur_frm.getUserName = function (email, callback) {
        frappe.call({
            method: "it_services.it_services.doctype.it_ticket.it_ticket.get_user_name",
            args: {
                "email": email
            },
            callback: function (r) {
                var fullname = "";

                callback(r.message);
            }
        })
    }
    cur_frm.modal = function (purpose, cell, row, activity) {
        cur_frm.status = "";
        if (purpose == "Delivery") {
            cur_frm.naa = 0;
        }
        var isRequired = function (fieldname) {
            requiredFieldsDuringTimeEntry = [
                'start_time',
                'end_time',
                'item_code',
                'activity_type'
            ]
            if ((purpose == "Add Row" || purpose == "Edit Row") && activity != "Time Entry" && activity != "Call/Email/Note") {
                return 1;

            } else if (requiredFieldsDuringTimeEntry.indexOf(fieldname) >= 0 && (activity == "Time Entry") && purpose != "Show Details") {
                return 1;
            } else if (activity == "Call/Email/Note" && fieldname == 'activity_type') {
                return 1;
            } else {
                return 0;

            }

        }
        var isReadOnly = function () {

            if (purpose == "Show Details") {
                return 1;

            } else {
                return 0;

            }

        }
        var isReadOnlyActivity = function (field) {
            var readonlyCondtions = [
                'Delivery',
                'Time Entry',
                'New Product'
            ]
            var notReadOnly = [
                'quantity',
                'price'
            ]

            if ((readonlyCondtions.indexOf(activity) >= 0 || purpose == "Show Details")) {
                if (notReadOnly.indexOf(field) >= 0) {
                    return 0;
                } else {
                    return 1;

                }
            } else {
                return 0;
            }
        }

        var modal_fields = [];
        var showAllFieldsPurposes = [
            "Show Details",
            "Edit Row",
            "Add Row"
        ]
        if (purpose == "Show Details") {
            cur_frm.activity_type = cur_frm.doc.ticket_activity_table[parseInt(cell.attributes["data-row-index"].nodeValue)].activity_type;
        } else {
            cur_frm.activity_type = activity;
        }
        var notHiddenConditions = [
            'Show Details',
            'Edit Row',
            'Time Entry'
        ]
        var isHidden = function () {
            if (notHiddenConditions.indexOf(cur_frm.activity_type) >= 0) {
                return 0;
            } else {
                return 1;
            }
        }

        var activityTypeOptions = function () {
            if (activity == "Call/Email/Note") {
                return ["Call", "Email", "Note"];
            } else {
                return ["Delivery", "Call", "Email", "Note", "New Product", "Time Entry", "Schedule"];
            }
        }
        var dependsConditions = function (fieldname) {
            if (activity == "Call/Email/Note") {
                return "eval:doc.billable_check";
            } else if (activity == "Time Entry") {
                return "";
            } else if (activity == "New Product") {
                return "eval:cur_frm.activity_type!='New Product'"
            }
        }
        var billableTimeConditions = function () {
            if (activity == "Time Entry") {
                return "eval:cur_frm.activity_type!='Delivery' && cur_frm.activity_type!='New Product'";
            } else {
                return "eval:cur_frm.activity_type!='Delivery' && cur_frm.activity_type!='New Product' && doc.billable_check";
            }
        }
        if (showAllFieldsPurposes.indexOf(purpose) >= 0) {
            modal_fields.push({
                    'label': "User",
                    'fieldname': 'user',
                    'fieldtype': 'Link',
                    'options': 'User',
                    'reqd': isRequired(),
                    'read_only': isReadOnly(),

                },
                {
                    'label': "Send email",
                    'fieldname': 'send_email',
                    'fieldtype': 'Check',
                    'depends_on': 'eval:cur_frm.activity_type=="Call/Email/Note" && !doc.internal'
                },
                {
                    'label': "Internal",
                    'fieldname': 'internal',
                    'fieldtype': 'Check',
                    'depends_on': 'eval:cur_frm.activity_type=="Call/Email/Note" && !doc.send_email && !doc.billable_check'
                },
                {
                    'label': "Delivery Note Link",
                    'fieldname': 'delivery_note_link',
                    'fieldtype': 'Link',
                    'options': 'Delivery Note',
                    'read_only': 1,
                    'depends_on': 'eval:cur_frm.activity_type=="Delivery"'

                },

                {
                    'label': "Item",
                    'fieldname': 'item_code',
                    'fieldtype': 'Link',
                    'options': 'Item',
                    'read_only': isReadOnly(),
                    'depends_on': 'eval:doc.billable_check || cur_frm.activity_type=="Time Entry" || cur_frm.activity_type=="New Product"'

                },

                {
                    'label': "Uom",
                    'fieldname': 'uom',
                    'fieldtype': 'Data',
                    'read_only': 1,
                    'depends_on': 'eval:cur_frm.activity_type=="New Product"'

                },
                {
                    'label': "Billable",
                    'fieldname': 'billable_check',
                    'fieldtype': 'Check',
                    'depends_on': 'eval: !doc.internal'
                },

                {'fieldname': 'col_break', 'fieldtype': 'Column Break'},

                {
                    'label': "Activity Type",
                    'fieldname': 'activity_type',
                    'fieldtype': 'Select',
                    'options': activityTypeOptions(),
                    'reqd': isRequired('activity_type'),
                    'read_only': isReadOnlyActivity(),

                },
                {
                    'label': "Quantity",
                    'fieldname': 'quantity',
                    'fieldtype': 'Float',
                    'read_only': isReadOnlyActivity('quantity'),
                    'fieldtype': 'Int',
                    'depends_on': 'eval:cur_frm.activity_type=="New Product"'

                },
                {
                    'label': "Price",
                    'fieldname': 'price',
                    'fieldtype': 'Float',
                    'read_only': isReadOnlyActivity('price'),
                    'depends_on': 'eval:cur_frm.activity_type=="New Product"'

                },
                {

                    'fieldname': 'play_pause_stop',
                    'fieldtype': 'HTML',
                    'hidden': isHidden()
                },


                {'fieldname': 'col_break1', 'fieldtype': 'Column Break'},

                {
                    'label': "Date",
                    'fieldname': 'date',
                    'fieldtype': 'Date',
                    'read_only': isReadOnly(),
                },
                {
                    'label': "Start",
                    'fieldname': 'start_time',
                    'fieldtype': 'Time',
                    'read_only': isReadOnly(),
                    'depends_on': dependsConditions()
                },

                {
                    'label': "End",
                    'fieldname': 'end_time',
                    'fieldtype': 'Time',
                    'read_only': isReadOnly(),
                    'depends_on': dependsConditions()
                },
                {
                    'label': "Billable Time",
                    'fieldname': 'billable_time',
                    'fieldtype': 'Float',
                    'read_only': isReadOnly(),
                    'depends_on': billableTimeConditions(),
                },


                {'fieldname': 'sec_break1', 'fieldtype': 'Section Break'},

                {
                    'label': "Description", 'fieldname': 'description', 'fieldtype': 'Small Text',
                    'value': 1, 'read_only': isReadOnly()
                });
        } else if (purpose == "Delivery") {
            modal_fields.push(
                {'label': 'Deliverables', 'fieldname': 'deliverables', 'fieldtype': 'HTML'},
                {'label': 'Customer Name', 'fieldname': 'customer_name', 'fieldtype': 'Data'},
                {'label': 'Signature', 'fieldname': 'signature', 'fieldtype': 'HTML'},
                {'label': 'Comment', 'fieldname': 'comment', 'fieldtype': 'Small Text'}
            );
        } else if (purpose == "Edit Quantity") {
            modal_fields.push(
                {'label': 'Quantity', 'fieldname': 'qty', 'fieldtype': 'Int'}
            );
        }
        var primaryAction = function () {
            cur_frm.is_not_save = 0;
            if (purpose == "Add Row") {

                if (activity != "Time Entry") {
                    if (dialog.fields_dict.send_email) {
                        if (dialog.fields_dict.send_email.input.checked) {
                            frappe.call({
                                method: "it_services.it_services.doctype.it_ticket.it_ticket.get_user_email",
                                args: {
                                    "user": dialog.fields_dict.user.input.value
                                },
                                callback: function (r) {
                                    if (r.message) {
                                        frappe.call({
                                            method: "it_services.it_services.doctype.it_ticket.it_ticket.check_if_send_email_and_get_email_template_for_new_tickets",
                                            args: {
                                                'purpose': 'new activity'
                                            },
                                            callback: function (rrr) {

                                                if (rrr.message) {
                                                    frappe.call({
                                                        method: 'frappe.email.doctype.email_template.email_template.get_email_template',
                                                        args: {
                                                            template_name: rrr.message,
                                                            doc: cur_frm.doc,
                                                            _lang: frappe.user_defaults.language
                                                        },
                                                        callback: function (rr) {
                                                            //console.log(rr.message);
                                                            cur_frm.send_email({
                                                                'content': rr.message.message,
                                                                'language_sel': "en",
                                                                'select_print_format': "Standard",
                                                                'send_me_a_copy': 0,
                                                                'send_read_receipt': 0,
                                                                'attach_document_print': true,
                                                                'subject': rr.message.subject,
                                                                'recipients': r.message,
                                                            }, [])

                                                        },
                                                    });
                                                }
                                            }
                                        })


                                    } else {
                                        frappe.msgprint("No email address for the contact of this customer.")
                                    }

                                }
                            })
                        }
                    }
                    cur_frm.naa = 0;
                    if ($('div[id="Empty"]').length) {
                        $('div[data-fieldname="ticket_activity_datatable"]')[0].removeChild($('div[id="Empty"]')[0]);

                    }
                    cur_frm.getUserName(dialog.fields_dict.user.input.value, function (r) {
                        if (!dialog.fields_dict.billable_time.disp_area.innerText) {
                            dialog.fields_dict.billable_time.disp_area.innerText = 0;
                        }
                        var checkedOrNot = 0;
                        if (dialog.fields_dict.billable_check.input.checked) {
                            checkedOrNot = 1;
                        } else {
                            checkedOrNot = 0;
                        }
                        cur_frm.datatable.datamanager.data.push([dialog.fields_dict.date.input.value, r, dialog.fields_dict.description.input.value, checkedOrNot, 0]);
                        var table_height = 1;

                        table_height = cur_frm.calculateTableHeight(cur_frm.datatable.datamanager.data.length);
                        frappe.model.add_child(cur_frm.doc, "IT Ticket Detail", "ticket_activity_table");
                        cur_frm.doc.ticket_activity_table[cur_frm.datatable.datamanager.data.length - 1].user = dialog.fields_dict.user.input.value;
                        cur_frm.doc.ticket_activity_table[cur_frm.datatable.datamanager.data.length - 1].username = r;
                        if (cur_frm.activity_type == "Call/Email/Note") {
                            cur_frm.doc.ticket_activity_table[cur_frm.datatable.datamanager.data.length - 1].activity_type = dialog.fields_dict.activity_type.input.value;
                        } else {
                            cur_frm.doc.ticket_activity_table[cur_frm.datatable.datamanager.data.length - 1].activity_type = dialog.fields_dict.activity_type.disp_area.innerText;

                        }
                        cur_frm.doc.ticket_activity_table[cur_frm.datatable.datamanager.data.length - 1].start_time = dialog.fields_dict.start_time.input.value;
                        cur_frm.doc.ticket_activity_table[cur_frm.datatable.datamanager.data.length - 1].end_time = dialog.fields_dict.end_time.input.value;
                        cur_frm.doc.ticket_activity_table[cur_frm.datatable.datamanager.data.length - 1].item_code = dialog.fields_dict.item_code.input.value;
                        cur_frm.doc.ticket_activity_table[cur_frm.datatable.datamanager.data.length - 1].date = cur_frm.convertToDBDateFormat(dialog.fields_dict.date.input.value);
                        cur_frm.doc.ticket_activity_table[cur_frm.datatable.datamanager.data.length - 1].uom = dialog.fields_dict.uom.disp_area.innerText;
                        cur_frm.doc.ticket_activity_table[cur_frm.datatable.datamanager.data.length - 1].quantity = dialog.fields_dict.quantity.input.value;
                        cur_frm.doc.ticket_activity_table[cur_frm.datatable.datamanager.data.length - 1].price = dialog.fields_dict.price.input.value;
                        if (!dialog.fields_dict.billable_time.input.value) {
                            cur_frm.doc.ticket_activity_table[cur_frm.datatable.datamanager.data.length - 1].billable_time = cur_frm.billable_time;

                        } else {
                            cur_frm.doc.ticket_activity_table[cur_frm.datatable.datamanager.data.length - 1].billable_time = dialog.fields_dict.billable_time.input.value;

                        }
                        if (dialog.fields_dict.billable_check.input.checked) {
                            cur_frm.doc.ticket_activity_table[cur_frm.datatable.datamanager.data.length - 1].billable_check = 1;
                        }
                        if (activity == "Call/Email/Note") {
                            if (dialog.fields_dict.send_email.input.checked) {
                                cur_frm.doc.ticket_activity_table[cur_frm.datatable.datamanager.data.length - 1].send_email = 1;
                            }
                            if (dialog.fields_dict.internal.input.checked) {
                                cur_frm.doc.ticket_activity_table[cur_frm.datatable.datamanager.data.length - 1].internal = 1;
                            }


                        }

                        cur_frm.doc.ticket_activity_table[cur_frm.datatable.datamanager.data.length - 1].description = dialog.fields_dict.description.input.value;
                        cur_frm.refresh_field("ticket_activity_table");
                        if (cur_frm.is_new()) {
                            cur_frm.newDataTable(cur_frm.datatable.datamanager.data, table_height);

                        } else {
                            $('div[class="dt-scrollable"]').css("height", table_height.toString() + "px");
                            cur_frm.datatable.refresh(cur_frm.datatable.datamanager.data, cur_frm.datatable.columnmanager.columns, function () {
                                cur_frm.naa = 1;
                            });

                        }

                        cur_frm.save();
                        try {
                            frappe.call({
                                method: "it_services.it_services.doctype.it_ticket.it_ticket.check_if_billed",
                                args: {
                                    'ticket_activity_name': cur_frm.doc.ticket_activity_table[cur_frm.datatable.datamanager.data.length - 1].name
                                },
                                callback: function (r) {
                                    cur_frm.datatable.datamanager.data[cur_frm.datatable.datamanager.data.length - 1][4] = r.message;
                                    cur_frm.billedAndBillableToCheckbox(cur_frm.datatable.datamanager.data);
                                    cur_frm.doc.ticket_activity_table[cur_frm.datatable.datamanager.data.length - 1].billed = r.message;
                                }

                            })
                        } catch (e) {

                        }

                    })


                } else {
                    var insertTimeEntry = function () {
                        var insertTime = function () {
                            cur_frm.naa = 0;
                            cur_frm.timeEntryInserted = 1;
                            if ($('div[id="Empty"]').length) {
                                $('div[data-fieldname="ticket_activity_datatable"]')[0].removeChild($('div[id="Empty"]')[0]);

                            }
                            cur_frm.getUserName(dialog.fields_dict.user.input.value, function (r) {
                                if (!dialog.fields_dict.billable_time.input.value) {
                                    dialog.fields_dict.billable_time.input.value = 0;
                                }
                                var checkedOrNot = 0;
                                if (dialog.fields_dict.billable_check.input.checked) {
                                    checkedOrNot = 1;
                                } else {
                                    checkedOrNot = 0;
                                }
                                cur_frm.datatable.datamanager.data.push([dialog.fields_dict.date.input.value, r, dialog.fields_dict.description.input.value, checkedOrNot, 0]);
                                var table_height = 1;
                                table_height = cur_frm.calculateTableHeight(cur_frm.datatable.datamanager.data.length);
                                frappe.model.add_child(cur_frm.doc, "IT Ticket Detail", "ticket_activity_table");
                                cur_frm.doc.ticket_activity_table[cur_frm.datatable.datamanager.data.length - 1].user = dialog.fields_dict.user.input.value;
                                cur_frm.doc.ticket_activity_table[cur_frm.datatable.datamanager.data.length - 1].username = r;
                                cur_frm.doc.ticket_activity_table[cur_frm.datatable.datamanager.data.length - 1].activity_type = activity;
                                cur_frm.doc.ticket_activity_table[cur_frm.datatable.datamanager.data.length - 1].start_time = dialog.fields_dict.start_time.input.value;
                                cur_frm.doc.ticket_activity_table[cur_frm.datatable.datamanager.data.length - 1].end_time = dialog.fields_dict.end_time.input.value;
                                cur_frm.doc.ticket_activity_table[cur_frm.datatable.datamanager.data.length - 1].item_code = dialog.fields_dict.item_code.input.value;
                                cur_frm.doc.ticket_activity_table[cur_frm.datatable.datamanager.data.length - 1].date = cur_frm.convertToDBDateFormat(dialog.fields_dict.date.input.value);
                                cur_frm.doc.ticket_activity_table[cur_frm.datatable.datamanager.data.length - 1].time_entry_status = cur_frm.status;
                                if (!dialog.fields_dict.billable_time.input.value) {
                                    cur_frm.doc.ticket_activity_table[cur_frm.datatable.datamanager.data.length - 1].billable_time = cur_frm.billable_time;

                                } else {
                                    cur_frm.doc.ticket_activity_table[cur_frm.datatable.datamanager.data.length - 1].billable_time = dialog.fields_dict.billable_time.input.value;

                                }
                                if (cur_frm.status == "Pause") {
                                    cur_frm.doc.ticket_activity_table[cur_frm.datatable.datamanager.data.length - 1].paused_time = cur_frm.distance;
                                } else if (cur_frm.status == "Finish") {
                                    cur_frm.doc.ticket_activity_table[cur_frm.datatable.datamanager.data.length - 1].paused_time = "";
                                }
                                if (dialog.fields_dict.billable_check.input.checked) {
                                    cur_frm.doc.ticket_activity_table[cur_frm.datatable.datamanager.data.length - 1].billable_check = 1;
                                }
                                cur_frm.doc.ticket_activity_table[cur_frm.datatable.datamanager.data.length - 1].description = dialog.fields_dict.description.input.value;
                                cur_frm.refresh_field("ticket_activity_table");
                                if (cur_frm.is_new()) {
                                    cur_frm.newDataTable(cur_frm.datatable.datamanager.data, table_height);

                                } else {
                                    $('div[class="dt-scrollable"]').css("height", table_height.toString() + "px");
                                    cur_frm.datatable.refresh(cur_frm.datatable.datamanager.data, cur_frm.datatable.columnmanager.columns, function () {
                                        cur_frm.addActionButtons(cur_frm.doc.ticket_activity_table);
                                        //
                                        cur_frm.setRowHeight(cur_frm.datatable.datamanager.data.length);
                                        cur_frm.rowCountToIcons(cur_frm.datatable.datamanager.data.length);
                                        cur_frm.naa = 1;
                                    });

                                }
                                if (cur_frm.status == "Pause") {
                                    frappe.msgprint("You can resume your work in the ticket activity table.");

                                }
                                cur_frm.save();
                                frappe.call({
                                    method: "it_services.it_services.doctype.it_ticket.it_ticket.check_if_billed",
                                    args: {
                                        'ticket_activity_name': cur_frm.doc.ticket_activity_table[cur_frm.datatable.datamanager.data.length - 1].name
                                    },
                                    callback: function (r) {
                                        cur_frm.datatable.datamanager.data[cur_frm.datatable.datamanager.data.length - 1][4] = r.message;
                                        // cur_frm.billedAndBillableToCheckbox(cur_frm.datatable.datamanager.data);
                                        cur_frm.doc.ticket_activity_table[cur_frm.datatable.datamanager.data.length - 1].billed = r.message;
                                    }

                                })

                            })

                        }
                        if (cur_frm.doc.type == "Block of Time" && dialog.fields_dict.billable_time.input.value) {
                            frappe.call({
                                method: "it_services.it_services.doctype.it_ticket.it_ticket.get_total_hours_used",
                                args: {
                                    "contract": cur_frm.doc.contract,
                                    "billable_time": dialog.fields_dict.billable_time.input.value,
                                    "name": "nope"
                                },
                                callback: function (r) {

                                    if (r.message || dialog.fields_dict.billable_check.input.checked) {
                                        insertTime();
                                    } else {
                                        frappe.msgprint("Can't save this time entry, hours for all activity is exceeding the included hours for the Block of Time contract.");
                                    }
                                }
                            })
                        } else {
                            insertTime();
                        }


                    }
                    if (dialog.fields_dict.end_time.input.value) {
                        if (Date.parse(cur_frm.convertToDBDateFormat(dialog.fields_dict.date.input.value) + ' ' + dialog.fields_dict.start_time.input.value) < Date.parse(cur_frm.convertToDBDateFormat(dialog.fields_dict.date.input.value) + ' ' + dialog.fields_dict.end_time.input.value)) {
                            insertTimeEntry();
                            //calculate billable time
                            cur_frm.timer(Date.parse(cur_frm.convertToDBDateFormat(dialog.fields_dict.date.input.value) + ' ' + dialog.fields_dict.end_time.input.value) - Date.parse(cur_frm.convertToDBDateFormat(dialog.fields_dict.date.input.value) + ' ' + dialog.fields_dict.start_time.input.value), "")

                        } else {
                            frappe.msgprint("End time should be after start time");
                            cur_frm.error = 1;
                        }
                    } else if (cur_frm.status == "Pause" || cur_frm.status == "Finish" || !cur_frm.status) {
                        insertTimeEntry();
                    }
                }
            } else if (purpose == "Edit Row") {
                var saveEditedRow = function () {
                    cur_frm.doc.ticket_activity_table[row].user = dialog.fields_dict.user.input.value;
                    if (dialog.fields_dict.activity_type.input) {
                        cur_frm.doc.ticket_activity_table[row].activity_type = dialog.fields_dict.activity_type.input.value;

                    } else {
                        cur_frm.doc.ticket_activity_table[row].activity_type = dialog.fields_dict.activity_type.value;

                    }
                    cur_frm.doc.ticket_activity_table[row].start_time = dialog.fields_dict.start_time.input.value;
                    cur_frm.doc.ticket_activity_table[row].end_time = dialog.fields_dict.end_time.input.value;
                    cur_frm.doc.ticket_activity_table[row].item_code = dialog.fields_dict.item_code.input.value;
                    cur_frm.doc.ticket_activity_table[row].date = cur_frm.convertToDBDateFormat(dialog.fields_dict.date.input.value);
                    cur_frm.doc.ticket_activity_table[row].time_entry_status = cur_frm.status;
                    cur_frm.doc.ticket_activity_table[row].uom = dialog.fields_dict.uom.disp_area.innerText;
                    cur_frm.doc.ticket_activity_table[row].quantity = dialog.fields_dict.quantity.input.value;
                    cur_frm.doc.ticket_activity_table[row].price = dialog.fields_dict.price.input.value;
                    if (!dialog.fields_dict.billable_time.input.value) {
                        cur_frm.doc.ticket_activity_table[row].billable_time = cur_frm.billable_time;

                    } else {
                        cur_frm.doc.ticket_activity_table[row].billable_time = dialog.fields_dict.billable_time.input.value;

                    }
                    if (cur_frm.status == "Pause") {
                        cur_frm.doc.ticket_activity_table[row].paused_time = cur_frm.distance;
                    } else if (cur_frm.status == "Finish") {
                        cur_frm.doc.ticket_activity_table[row].paused_time = "";
                    }
                    if (dialog.fields_dict.billable_check.input.checked) {
                        cur_frm.doc.ticket_activity_table[row].billable_check = 1;
                    } else {
                        cur_frm.doc.ticket_activity_table[row].billable_check = 0;
                    }
                    if (activity == "Call/Email/Note") {
                        if (dialog.fields_dict.send_email.input.checked) {
                            cur_frm.doc.ticket_activity_table[row].send_email = 1;
                        } else {
                            cur_frm.doc.ticket_activity_table[row].send_email = 0;
                        }
                    }
                    if (activity == "Call/Email/Note") {
                        if (dialog.fields_dict.internal.input.checked) {
                            cur_frm.doc.ticket_activity_table[row].internal = 1;
                        } else {
                            cur_frm.doc.ticket_activity_table[row].internal = 0;
                        }
                    }
                    cur_frm.doc.ticket_activity_table[row].description = dialog.fields_dict.description.input.value;
                    cur_frm.refresh_field("ticket_activity_table");
                    cur_frm.getUserName(dialog.fields_dict.user.input.value, function (r) {
                        if (!dialog.fields_dict.billable_time.input.value) {
                            dialog.fields_dict.billable_time.input.value = 0;
                        }
                        var checkedOrNot = 0;
                        if (dialog.fields_dict.billable_check.input.checked) {
                            checkedOrNot = 1;
                        } else {
                            checkedOrNot = 0;
                        }
                        cur_frm.datatable.datamanager.data[row][0] = dialog.fields_dict.date.input.value;

                        cur_frm.datatable.datamanager.data[row][1] = r;
                        cur_frm.datatable.datamanager.data[row][2] = dialog.fields_dict.description.input.value;
                        cur_frm.datatable.datamanager.data[row][3] = checkedOrNot;
                        cur_frm.datatable.datamanager.data[row][4] = dialog.fields_dict.billable_time.input.value;
                        // cur_frm.datatable.refresh(cur_frm.datatable.datamanager.data, cur_frm.datatable.columnmanager.columns);

                        cur_frm.addActionButtons(cur_frm.datatable.datamanager.data);

                    })
                    cur_frm.save();
                    frappe.call({
                        method: "it_services.it_services.doctype.it_ticket.it_ticket.check_if_billed",
                        args: {
                            'ticket_activity_name': cur_frm.doc.ticket_activity_table[row].name
                        },
                        callback: function (r) {
                            cur_frm.datatable.datamanager.data[row][4] = r.message;
                            cur_frm.billedAndBillableToCheckbox(cur_frm.datatable.datamanager.data);
                            cur_frm.doc.ticket_activity_table[row].billed = r.message;
                        }

                    })
                    if (cur_frm.status == "Pause") {
                        frappe.msgprint("You can resume your work in the ticket activity table.");

                    }
                }
                if (activity != "Time Entry") {

                    saveEditedRow();
                } else {
                    if (cur_frm.status == "Pause" || cur_frm.status == "Finish" || !cur_frm.status) {
                        if (cur_frm.doc.type == "Block of Time" && dialog.fields_dict.billable_time.input.value) {
                            frappe.call({
                                method: "it_services.it_services.doctype.it_ticket.it_ticket.get_total_hours_used",
                                args: {
                                    "contract": cur_frm.doc.contract,
                                    "billable_time": dialog.fields_dict.billable_time.input.value,
                                    "name":cur_frm.doc.ticket_activity_table[row].name
                                },
                                callback: function (r) {

                                    if (r.message || dialog.fields_dict.billable_check.input.checked) {
                                        saveEditedRow();
                                    } else {
                                        cur_frm.exceeds = 1;

                                        frappe.msgprint("Can't save this time entry, hours for all activity is exceeding the included hours for the Block of Time contract.");
                                    }
                                }
                            })
                        } else {
                            saveEditedRow();
                        }

                    }
                }
            } else if (purpose == "Delivery") {
                if (cur_frm.selected_items.length) {
                    frappe.call({
                        method: "it_services.it_services.doctype.it_ticket.it_ticket.deliver",
                        args: {
                            "so_item_names": cur_frm.selected_items,
                            "receiver": dialog.fields_dict.customer_name.input.value || "",
                            "signature": cur_frm.signature_value || "",
                            "comments": dialog.fields_dict.comment.input.value || ""
                        },
                        callback: function (re) {
                            if (re.message) {
                                cur_frm.custom_buttons = [];
                                cur_frm.refresh();
                                cur_frm.naa = 1;
                                frappe.msgprint("Selected item delivered successfully.");
                                if ($('div[id="Empty"]').length) {
                                    $('div[data-fieldname="ticket_activity_datatable"]')[0].removeChild($('div[id="Empty"]')[0]);

                                }
                                cur_frm.getUserName(frappe.user.name, function (r) {

                                    var checkedOrNot = 0;
                                    if (dialog.fields_dict.billable_check) {
                                        checkedOrNot = 1;
                                    } else {
                                        checkedOrNot = 0;
                                    }
                                    var table_height = 1;
                                    var descItems = "Items: \n";
                                    for (var i = 0; i < cur_frm.selected_items.length; i++) {
                                        descItems += cur_frm.selected_items[i]['qty'] + "x " + cur_frm.selected_items[i]['item_code'];
                                        descItems += "\n";
                                    }
                                    cur_frm.datatable.datamanager.data.push([cur_frm.getCurrentDate(), r, "Received by: " + dialog.fields_dict.customer_name.input.value + "\n" + descItems, 0, 0]);

                                    table_height = cur_frm.calculateTableHeight(cur_frm.datatable.datamanager.data.length);
                                    frappe.model.add_child(cur_frm.doc, "IT Ticket Detail", "ticket_activity_table");
                                    cur_frm.doc.ticket_activity_table[cur_frm.datatable.datamanager.data.length - 1].user = frappe.user.name;
                                    cur_frm.doc.ticket_activity_table[cur_frm.datatable.datamanager.data.length - 1].username = r;
                                    cur_frm.doc.ticket_activity_table[cur_frm.datatable.datamanager.data.length - 1].activity_type = "Delivery";
                                    cur_frm.doc.ticket_activity_table[cur_frm.datatable.datamanager.data.length - 1].date = cur_frm.convertToDBDateFormat(cur_frm.getCurrentDate());
                                    cur_frm.doc.ticket_activity_table[cur_frm.datatable.datamanager.data.length - 1].start_time = frappe.datetime.now_time();
                                    cur_frm.doc.ticket_activity_table[cur_frm.datatable.datamanager.data.length - 1].delivery_note_link = re.message[0];


                                    cur_frm.doc.ticket_activity_table[cur_frm.datatable.datamanager.data.length - 1].description = "Received by: " + dialog.fields_dict.customer_name.input.value + "\n" + descItems;
                                    cur_frm.refresh_field("ticket_activity_table");

                                    if (cur_frm.is_new()) {
                                        cur_frm.newDataTable(cur_frm.datatable.datamanager.data, table_height);

                                    } else {
                                        $('div[class="dt-scrollable"]').css("height", table_height.toString() + "px");
                                        cur_frm.datatable.refresh(cur_frm.datatable.datamanager.data, cur_frm.datatable.columnmanager.columns, function () {
                                            cur_frm.addActionButtons(cur_frm.doc.ticket_activity_table);
                                            //
                                            cur_frm.setRowHeight(cur_frm.datatable.datamanager.data.length);
                                            cur_frm.rowCountToIcons(cur_frm.datatable.datamanager.data.length);

                                        });

                                    }
                                    cur_frm.save();

                                    frappe.call({
                                        method: "it_services.it_services.doctype.it_ticket.it_ticket.check_if_billed",
                                        args: {
                                            'ticket_activity_name': cur_frm.doc.ticket_activity_table[cur_frm.datatable.datamanager.data.length - 1].name
                                        },
                                        callback: function (r) {
                                            cur_frm.datatable.datamanager.data[cur_frm.datatable.datamanager.data.length - 1][4] = r.message;
                                            cur_frm.billedAndBillableToCheckbox(cur_frm.datatable.datamanager.data);
                                            var x = setInterval(function () {
                                                if (cur_frm.doc.ticket_activity_table[cur_frm.datatable.datamanager.data.length - 1]) {
                                                    cur_frm.doc.ticket_activity_table[cur_frm.datatable.datamanager.data.length - 1].billed = r.message;
                                                    clearInterval(x);
                                                }
                                            }, 100)
                                        }

                                    })

                                })


                            }

                        }

                    })
                    dialog.hide();
                } else {
                    frappe.msgprint("No items are selected.");
                }


            } else if (purpose == "Edit Quantity") {
                var index = 0;

                if (cur_frm.datatable.datamanager.data.length) {
                    try {
                        if (cur_frm.deliverables[cell.attributes["data-row-index"].nodeValue][2] >= dialog.fields_dict.qty.value) {

                            $('div[data-row-index="' + cell.attributes["data-row-index"].nodeValue + '"]')[9].children[3].innerHTML = '<div class="dt-cell__content dt-cell__content--col-3" style="width: 100px;">' + dialog.fields_dict.qty.value + ' </div>';
                            var deliverIndex = parseInt(cell.attributes["data-row-index"].nodeValue) + cur_frm.datatable.datamanager.data.length;
                            document.getElementById('deliverable_' + deliverIndex).onchange();
                            dialog.hide();

                        } else {
                            frappe.msgprint("Not enough number of quantity to be delivered.")
                        }
                    } catch (e) {

                        if (cur_frm.deliverables[cell.attributes["data-row-index"].nodeValue][2] >= dialog.fields_dict.qty.value) {
                            $('div[data-row-index="' + cell.attributes["data-row-index"].nodeValue + '"]')[4].children[0].innerText = dialog.fields_dict.qty.value;
                            var deliverIndex = parseInt(cell.attributes["data-row-index"].nodeValue) + cur_frm.datatable.datamanager.data.length;
                            document.getElementById('deliverable_' + deliverIndex).onchange();
                            dialog.hide();

                        } else {

                            frappe.msgprint("Not enough number of quantity to be delivered.")
                        }
                    }

                } else {
                    if (cur_frm.deliverables[cell.attributes["data-row-index"].nodeValue][2] >= dialog.fields_dict.qty.value) {
                        $('div[data-row-index="' + cell.attributes["data-row-index"].nodeValue + '"]')[4].children[0].innerText = dialog.fields_dict.qty.value;
                        document.getElementById('deliverable_' + parseInt(cell.attributes["data-row-index"].nodeValue)).onchange();

                        dialog.hide();

                    } else {

                        frappe.msgprint("Not enough number of quantity to be delivered.")
                    }
                }

            }
            var statusConditions = [
                'Pause',
                'Finish',
                ''
            ]
            if (purpose != "Delivery" && purpose != "Edit Quantity" && !cur_frm.error && activity != "Time Entry") {
                dialog.hide();
            } else if ((!cur_frm.status || statusConditions.indexOf(cur_frm.status) >= 0) && activity == "Time Entry" && !cur_frm.error) {
                dialog.hide();
            } else if ((statusConditions.indexOf(cur_frm.status) < 0) && activity == "Time Entry") {
                frappe.msgprint("Can't save time entry while timer is still running.");
            } else {
                cur_frm.error = 0;
            }
        }
        var dialog = {};
        var confirm = 0;
        if (purpose != "Show Details") {


            if (cur_frm.activity_type == "Time Entry") {
                var x = setInterval(function () {
                    if (cur_dialog) {
                        var olv = cur_dialog.fields_dict.item_code.input.value;

                        var objects = Object.getOwnPropertyDescriptor(cur_dialog.fields_dict.item_code.input.__proto__, "value");
                        var originalSet = objects.set;
                        cur_frm.startEndAdjustment();

                        try {
                            objects.set = function (val) {

                                if (cur_frm) {
                                    var bT = 0;
                                    var addoredit = false;
                                    if (purpose == "Edit Row" && this.getAttribute('data-fieldname') == "item_code") {
                                        bT = cur_frm.doc.ticket_activity_table[row].billable_time;
                                        addoredit = dialog.fields_dict.item_code.input.value;
                                    } else if (this.getAttribute('data-fieldname') == "item_code") {
                                        bT = dialog.fields_dict.billable_time.input.value;
                                        addoredit = true;
                                    }

                                    if (this.getAttribute('data-fieldname') == "item_code") {

                                        if (cur_dialog) {
                                            if (olv != cur_dialog.fields_dict.item_code.input.value) {
                                                cur_frm.is_not_save = 1;

                                            }
                                            if (cur_dialog.fields_dict.item_code.input.value && cur_frm.doc.contract) {
                                                frappe.call({
                                                    method: "it_services.it_services.doctype.it_ticket.it_ticket.get_if_billable",
                                                    args: {
                                                        "item": cur_dialog.fields_dict.item_code.input.value,
                                                        "contract": cur_frm.doc.contract
                                                    },
                                                    callback: function (r) {
                                                        console.log(r)
                                                        cur_dialog.fields_dict.billable_check.input.checked = r.message;
                                                    }
                                                })
                                            }

                                        }
                                    }
                                    if (cur_dialog && cur_frm.doc.contract && bT && addoredit && cur_frm.activity_type == "Time Entry" && this.getAttribute('data-fieldname') == "item_code") {

                                        frappe.call({
                                            method: 'it_services.it_services.doctype.it_ticket.it_ticket.get_billable_time',
                                            args: {
                                                'contract': cur_frm.doc.contract,
                                                'billable_time': bT,
                                                'item_code': cur_dialog.fields_dict.item_code.input.value
                                            },
                                            callback: function (r) {
                                                if (r.message) {
                                                    cur_frm.rounding_value = r.message;
                                                    cur_frm.rounded_values = [];
                                                    var loop = 0;
                                                    for (var i = 0; i < (24 / r.message); i++) {
                                                        loop += cur_frm.rounding_value;
                                                        cur_frm.rounded_values.push(loop);
                                                    }
                                                    if (cur_dialog.fields_dict.start_time.input.value && cur_dialog.fields_dict.end_time.input.value) {
                                                        cur_frm.timer(new Date(cur_frm.convertToDBDateFormat(cur_dialog.fields_dict.date.input.value) + ' ' + cur_dialog.fields_dict.end_time.input.value) - new Date(cur_frm.convertToDBDateFormat(cur_dialog.fields_dict.date.input.value) + ' ' + cur_dialog.fields_dict.start_time.input.value), "")

                                                    } else {
                                                        cur_dialog.fields_dict.billable_time.input.value = r.message;

                                                    }
                                                    //
                                                }
                                            }
                                        })


                                    } else if (cur_dialog && bT && addoredit && cur_frm.activity_type == "Time Entry" && this.getAttribute('data-fieldname') == "item_code") {
                                        frappe.call({
                                            method: 'it_services.it_services.doctype.it_ticket.it_ticket.get_global_overrides',
                                            args: {
                                                'billable_time': bT,
                                                'item_code': cur_dialog.fields_dict.item_code.input.value
                                            },
                                            callback: function (r) {
                                                cur_frm.rounding_value = r.message;
                                                cur_frm.rounded_values = [];
                                                var loop = 0;
                                                for (var i = 0; i < (24 / r.message); i++) {
                                                    loop += cur_frm.rounding_value;
                                                    cur_frm.rounded_values.push(loop);
                                                }

                                            }
                                        })
                                    }

                                }


                                originalSet.apply(this, arguments);
                            }
                            Object.defineProperty(cur_dialog.fields_dict.item_code.input.__proto__, "value", objects);
                        } catch (e) {
                            console.log(e);

                        }


                        clearInterval(x);

                    }


                }, 100)

            } else if (cur_frm.activity_type == "New Product") {
                setTimeout(function () {
                    var objects = Object.getOwnPropertyDescriptor(cur_dialog.fields_dict.item_code.input.__proto__, "value");
                    var originalSet = objects.set;

                    try {
                        objects.set = function (val) {
                            if (cur_dialog && val) {
                                if (this.getAttribute('data-fieldname') == "item_code") {
                                    frappe.call({
                                        method: "it_services.it_services.doctype.it_ticket.it_ticket.get_item_description_qty_price_uom",
                                        args: {
                                            "item": val
                                        },
                                        callback: function (r) {

                                            if (r.message) {
                                                // cur_dialog.fields_dict.uom.refresh();
                                                cur_dialog.fields_dict.uom.refresh();
                                                if (r.message[0][0] && cur_frm.activity_type=="New Product") {
                                                    cur_dialog.fields_dict.description.input.value = r.message[0][0];
                                                }
                                                if (r.message[0][1]) {
                                                    cur_dialog.fields_dict.uom.disp_area.innerText = r.message[0][1];
                                                }
                                                if (r.message[1]) {
                                                    cur_dialog.fields_dict.quantity.input.value = r.message[1];

                                                }
                                                if (r.message[2][0]) {
                                                    cur_dialog.fields_dict.price.input.value = r.message[2][0][0];

                                                }

                                            }

                                        }
                                    })
                                }

                            }
                            originalSet.apply(this, arguments);
                        }
                        Object.defineProperty(cur_dialog.fields_dict.item_code.input.__proto__, "value", objects);
                    } catch (e) {
                        console.log(e);

                    }
                }, 1000)

            }

            var statusConditions = [
                'Pause',
                'Finish'
            ]
            dialog = new frappe.ui.Dialog({
                'fields': modal_fields,
                primary_action: primaryAction,
                secondary_action: function () {
                    if (purpose == "Delivery") {

                        for (var i = 1; i < $('div[class="dt-scrollable"]').length; i++) {
                            $('div[class="dt-scrollable"]').remove(i);

                        }
                        cur_frm.newDataTable(cur_frm.datatable.datamanager.data, cur_frm.calculateTableHeight(cur_frm.datatable.datamanager.data.length));

                        cur_frm.delivery = 0;
                        $('div[data-fieldname="ticket_activity_datatable"]')[0].removeAttribute("hidden");
                    }
                    if (activity == "Time Entry") {
                        if (cur_frm.status && (cur_frm.status != "Pause" && cur_frm.status != "Finish") && cur_frm.timeEntryInserted != 1) {
                            frappe.msgprint("You can't close a time entry while the timer is still running.");
                        } else if (cur_frm.timeEntryInserted != 1 && cur_frm.is_not_save == 1) {


                            if (cur_frm.status || cur_frm.is_not_save == 1) {
                                if (confirm != 1 || cur_frm.is_not_save == 1) {
                                    confirm = 1;

                                    var save = frappe.confirm(
                                        "Save your work?",
                                        function () {
                                            primaryAction();
                                            cur_frm.is_not_save = 0;
                                            frappe.msgprint("You're work is saved in ticket activity table.")

                                        },
                                        function () {
                                            cur_frm.is_not_save = 0;
                                            window.close();
                                            dialog.hide();

                                        }
                                    )
                                    save.$wrapper[0].onfocus = function () {
                                        $('.modal-backdrop').unbind('click');

                                    }
                                }

                            }
                        }
                        cur_frm.is_not_save = 0;
                        cur_frm.timeEntryInserted = 0;

                    }


                }
            });
            if (purpose == "Add Row" || purpose == "Edit Row") {
                cur_frm.billable_time = 0;
                cur_frm.rounding_value = 0;
                cur_frm.rounded_values = [];

                dialog.fields_dict.item_code.get_query = '';


                if (dialog.fields_dict.billable_time.input.value < cur_frm.billable_time || !dialog.fields_dict.billable_time.input.value) {
                    dialog.fields_dict.billable_time.input.value = cur_frm.billable_time;
                }


            }


        } else {
            dialog = new frappe.ui.Dialog({
                'fields': modal_fields,
                secondary_action: function () {
                    if (purpose == "Delivery") {
                        for (var i = 1; i < $('div[class="dt-scrollable"]').length; i++) {
                            $('div[class="dt-scrollable"]').remove(i);

                        }
                        cur_frm.datatable.refresh(cur_frm.datatable.datamanager.data, cur_frm.datatable.columnmanager.columns);
                        cur_frm.delivery = 0;
                        $('div[data-fieldname="ticket_activity_datatable"]')[0].removeAttribute("hidden");
                    }


                }
            });

        }

        if (isReadOnlyActivity()) {
            dialog.fields_dict.activity_type.disp_area.innerText = activity;
            dialog.fields_dict.activity_type.value = activity;
        } else {
            var x = setInterval(function () {
                if (dialog.fields_dict.activity_type) {
                    dialog.fields_dict.activity_type.input.value = activity;
                    clearInterval(x);
                }
            }, 100)

        }
        cur_frm.timeEntryUpdateStatus = function (index, status) {
            cur_frm.timer(0000000000000, "");


            if ($('div[id="s_' + index + '"]')[1]) {
                $('div[id="s_' + index + '"]')[0].remove();
            }
            if (status == "Start") {

                $('div[id="s_' + index + '"]')[0].innerHTML = "<i class='fa fa-2x fa-pause-circle' title='Pause' onclick='cur_frm.timeEntryUpdateStatus(" + index + ",\"" + 'Pause' + "\")' ></i> <i class='edit_delete_space'></i> <i class='fa fa-2x fa-check-circle' style='padding-left: 10px !important;' title='Finish' onclick='cur_frm.timeEntryUpdateStatus(" + index + ",\"" + 'Finish' + "\")' ></i><h3 id='Timer'></h3>";
                if (cur_frm.doc.ticket_activity_table[index]) {
                    cur_frm.doc.ticket_activity_table[index].start_time = frappe.datetime.now_time();
                    cur_frm.timer(cur_frm.doc.ticket_activity_table[index].paused_time, status);

                } else {
                    cur_frm.timer(0000000000000, status);
                }
                dialog.fields_dict.start_time.input.value = frappe.datetime.now_time();
            } else if (status == "Pause") {

                $('div[id="s_' + index + '"]')[0].innerHTML = "<i class='fa fa-2x fa-play-circle' title='Resume' onclick='cur_frm.timeEntryUpdateStatus(" + index + ",\"" + 'Resume' + "\")' ></i> <i class='edit_delete_space'></i> <i class='fa fa-2x fa-check-circle' style='padding-left: 10px !important;' title='Finish' onclick='cur_frm.timeEntryUpdateStatus(" + index + ",\"" + 'Finish' + "\")' ></i><h3 id='Timer'></h3>";
                cur_frm.timer(cur_frm.distance, "Pause");
                cur_frm.getBillableTime();

                if (cur_frm.doc.ticket_activity_table[index]) {
                    cur_frm.doc.ticket_activity_table[index].paused_time = cur_frm.distance;
                    if (cur_frm.doc.ticket_activity_table[index].billable_time < cur_frm.billable_time) {
                        cur_frm.doc.ticket_activity_table[index].billable_time = cur_frm.billable_time;


                    }

                }
                if (dialog.fields_dict.billable_time.input.value < cur_frm.billable_time || !dialog.fields_dict.billable_time.input.value) {
                    dialog.fields_dict.billable_time.input.value = cur_frm.billable_time;

                }
            } else if (status == "Resume") {
                if (dialog.fields_dict.start_time.input.value == "00:00:00") {
                    dialog.fields_dict.start_time.input.value = frappe.datetime.now_time();
                }
                $('div[id="s_' + index + '"]')[0].innerHTML = "<i class='fa fa-2x fa-pause-circle' title='Pause' onclick='cur_frm.timeEntryUpdateStatus(" + index + ",\"" + 'Pause' + "\")' ></i><i class='edit_delete_space'></i> <i class='fa fa-2x fa-check-circle' style='padding-left: 10px !important;' title='Finish' onclick='cur_frm.timeEntryUpdateStatus(" + index + ",\"" + 'Finish' + "\")' ></i><h3 id='Timer'></h3>";


                if (cur_frm.doc.ticket_activity_table[index]) {

                    cur_frm.distance = cur_frm.doc.ticket_activity_table[index].paused_time;
                    cur_frm.timer(cur_frm.distance, status);

                } else {

                    cur_frm.timer(cur_frm.distance, status);

                }
                // cur_frm.getBillableTime();

            } else {
                $('div[id="s_' + index + '"]')[0].innerHTML = "";
                cur_frm.timer(cur_frm.distance, "Finish");
                dialog.fields_dict.end_time.input.value = frappe.datetime.now_time();
                if ($('label[id="labelTimer"]').length) {
                    $('label[id="labelTimer"]')[0].remove();

                }
                cur_frm.getBillableTime();


            }

            cur_frm.status = status;
            if ($('div[id="s_' + index + '"]')[1]) {
                $('div[id="s_' + index + '"]')[0].remove();
            }
            if ($('h3[id="Timer"]')[1]) {
                $('h3[id="Timer"]')[0].remove();

            }
            if ($('button[data-dismiss="modal"]')[1]) {
                $('button[data-dismiss="modal"]')[0].remove();

            }
            var timeEntryModalConditions = function () {
                if (cur_frm.doc.ticket_activity_table[index]) {
                    return 1
                } else {
                    return 0
                }
            }
            if ((status != "Pause" && status != "Finish") && status) {
                if ($('button[data-dismiss="modal"]')[0]) {
                    if (!$('button[id="noclosemodal"]').length) {
                        $('button[data-dismiss="modal"]')[0].setAttribute("id", "noclosemodal");
                        $('button[id="noclosemodal"]')[0].setAttribute("data-dismiss", "");

                    }

                }
            } else {
                if ($('button[data-dismiss=""]')[0]) {
                    if ($('button[id="noclosemodal"]').length) {
                        $('button[id="noclosemodal"]')[0].setAttribute("data-dismiss", "modal");

                    }

                }
            }

            if (cur_frm.doc.ticket_activity_table[index] && (status != "Pause" && status != "Finish") && status) {
                if ((cur_frm.doc.ticket_activity_table[index].time_entry_status != "Pause" && cur_frm.doc.ticket_activity_table[index].time_entry_status != "Finish") && cur_frm.doc.ticket_activity_table[index].time_entry_status) {

                    if ($('button[data-dismiss="modal"]')[0]) {
                        if (!$('button[id="noclosemodal"]').length) {
                            $('button[data-dismiss="modal"]')[0].setAttribute("id", "noclosemodal");
                            $('button[id="noclosemodal"]')[0].setAttribute("data-dismiss", "");
                        }

                    }
                }
                if (status == "Resume") {
                    if ($('button[data-dismiss="modal"]')[0]) {
                        if (!$('button[id="noclosemodal"]').length) {
                            $('button[data-dismiss="modal"]')[0].setAttribute("id", "noclosemodal");
                            $('button[id="noclosemodal"]')[0].setAttribute("data-dismiss", "");
                        }

                    }
                }
            } else {
                if (timeEntryModalConditions()) {
                    if ($('button[id="noclosemodal"]').length) {
                        $('button[id="noclosemodal"]')[0].setAttribute("data-dismiss", "modal");

                    }

                }

            }

        }

        if (purpose == "Show Details") {

            dialog.fields_dict.activity_type.disp_area.innerText = cur_frm.doc.ticket_activity_table[parseInt(cell.attributes["data-row-index"].nodeValue)].activity_type || "";
            if (cur_frm.doc.ticket_activity_table[parseInt(cell.attributes["data-row-index"].nodeValue)].delivery_note_link) {
                dialog.fields_dict.delivery_note_link.disp_area.innerHTML = '<a href="#Form/Delivery Note/' + cur_frm.doc.ticket_activity_table[parseInt(cell.attributes["data-row-index"].nodeValue)].delivery_note_link + '">' + cur_frm.doc.ticket_activity_table[parseInt(cell.attributes["data-row-index"].nodeValue)].delivery_note_link + '</a>';

            }
            dialog.fields_dict.uom.disp_area.innerText = cur_frm.doc.ticket_activity_table[parseInt(cell.attributes["data-row-index"].nodeValue)].uom || "";
            dialog.fields_dict.quantity.disp_area.innerText = cur_frm.doc.ticket_activity_table[parseInt(cell.attributes["data-row-index"].nodeValue)].quantity;
            dialog.fields_dict.price.disp_area.innerText = cur_frm.doc.ticket_activity_table[parseInt(cell.attributes["data-row-index"].nodeValue)].price;
            cur_frm.getUserName(cur_frm.doc.ticket_activity_table[parseInt(cell.attributes["data-row-index"].nodeValue)].user, function (r) {
                dialog.fields_dict.user.disp_area.innerText = r;
            });
            dialog.fields_dict.start_time.disp_area.innerText = cur_frm.doc.ticket_activity_table[parseInt(cell.attributes["data-row-index"].nodeValue)].start_time || "";
            dialog.fields_dict.end_time.disp_area.innerText = cur_frm.doc.ticket_activity_table[parseInt(cell.attributes["data-row-index"].nodeValue)].end_time || "";
            dialog.fields_dict.description.disp_area.innerText = cur_frm.doc.ticket_activity_table[parseInt(cell.attributes["data-row-index"].nodeValue)].description || "";
            dialog.fields_dict.date.disp_area.innerText = cur_frm.convertToSystemDateFormat(cur_frm.doc.ticket_activity_table[parseInt(cell.attributes["data-row-index"].nodeValue)].date) || "";

            if (cur_frm.doc.ticket_activity_table[parseInt(cell.attributes["data-row-index"].nodeValue)].billable_check) {
                if (dialog.fields_dict.billable_check.input) {
                    dialog.fields_dict.billable_check.input.checked = true;

                    dialog.fields_dict.billable_check.input.disabled = "disabled";
                    dialog.fields_dict.billable_time.df.hidden_due_to_dependency = false;
                    dialog.fields_dict.billable_time.refresh()

                }
            }
            if (cur_frm.doc.ticket_activity_table[parseInt(cell.attributes["data-row-index"].nodeValue)].send_email) {


                dialog.fields_dict.send_email.input.disabled = "disabled";

            }
            if (cur_frm.doc.ticket_activity_table[parseInt(cell.attributes["data-row-index"].nodeValue)].internal) {
                dialog.fields_dict.internal.input.checked = true;
                dialog.fields_dict.internal.input.disabled = "disabled";
            }
            dialog.fields_dict.description.disp_area.innerText = cur_frm.doc.ticket_activity_table[parseInt(cell.attributes["data-row-index"].nodeValue)].description || "";
            dialog.fields_dict.billable_time.disp_area.innerText = cur_frm.doc.ticket_activity_table[parseInt(cell.attributes["data-row-index"].nodeValue)].billable_time || "";
            dialog.fields_dict.item_code.disp_area.innerText = cur_frm.doc.ticket_activity_table[parseInt(cell.attributes["data-row-index"].nodeValue)].item_code || "";
            // if (cur_frm.doc.ticket_activity_table[parseInt(cell.attributes["data-row-index"].nodeValue)].time_entry_status == "Start") {
            //     dialog.fields_dict.play_pause_stop.disp_area.innerHTML = "<h3>Pause</h3> <i class='edit_delete_space'></i> <h3 >Finish</h3><div id='Timer'></div>";
            //
            // } else if (cur_frm.doc.ticket_activity_table[parseInt(cell.attributes["data-row-index"].nodeValue)].time_entry_status == "Pause") {
            //     dialog.fields_dict.play_pause_stop.disp_area.innerHTML = "<h3>Start</h3> <i class='edit_delete_space'></i> <h3 >Finish</h3><div id='Timer'></div>";
            //
            // } else {
            //     dialog.fields_dict.play_pause_stop.disp_area.innerHTML = "<h3>Start</h3><div id='Timer'></div>";
            //
            // }
        } else if (purpose == "Edit Row") {

            dialog.fields_dict.activity_type.disp_area.innerText = cur_frm.doc.ticket_activity_table[row].activity_type || "";
            dialog.fields_dict.user.input.value = cur_frm.doc.ticket_activity_table[row].user || "";
            dialog.fields_dict.start_time.input.value = cur_frm.doc.ticket_activity_table[row].start_time || "";
            dialog.fields_dict.end_time.input.value = cur_frm.doc.ticket_activity_table[row].end_time || "";
            dialog.fields_dict.uom.disp_area.innerText = cur_frm.doc.ticket_activity_table[row].uom;
            dialog.fields_dict.quantity.input.value = cur_frm.doc.ticket_activity_table[row].quantity;
            dialog.fields_dict.price.input.value = cur_frm.doc.ticket_activity_table[row].price;
            dialog.fields_dict.date.input.value = cur_frm.convertToSystemDateFormat(cur_frm.doc.ticket_activity_table[row].date) || "";
            dialog.fields_dict.description.input.value = cur_frm.doc.ticket_activity_table[row].description || "";
            dialog.fields_dict.item_code.input.value = cur_frm.doc.ticket_activity_table[row].item_code || "";
            dialog.fields_dict.delivery_note_link.disp_area.innerText = cur_frm.doc.ticket_activity_table[row].delivery_note_link || "";
            if (cur_frm.doc.ticket_activity_table[row].billable_check) {
                dialog.fields_dict.billable_check.input.checked = true;
                dialog.fields_dict.billable_time.df.hidden_due_to_dependency = false;
                dialog.fields_dict.billable_time.refresh()
            }

            if (cur_frm.doc.ticket_activity_table[row].internal) {
                dialog.fields_dict.internal.input.checked = true;
            }
            dialog.fields_dict.description.input.value = cur_frm.doc.ticket_activity_table[row].description || "";
            dialog.fields_dict.billable_time.input.value = cur_frm.doc.ticket_activity_table[row].billable_time || "";
            // dialog.fields_dict.play_pause_stop.disp_area.innerHTML = "<i class='fa fa-lg fa-pause' /> <i class='fa fa-lg fa-stop' />";


            if (activity == "Time Entry") {
                if (!cur_frm.doc.ticket_activity_table[row].time_entry_status) {
                    dialog.fields_dict.play_pause_stop.disp_area.innerHTML = "<div class='form-group'><div class='clearfix'><label class='control-label' style='padding-right: 0px;'>Timer</label></div><div class='control-input-wrapper' id='s_" + row + "'><i class='fa fa-2x fa-play-circle' title='Start' onclick='cur_frm.timeEntryUpdateStatus(" + row + ",\"" + 'Start' + "\")' ></i> <i class='edit_delete_space'></i></div><h3 id='Timer'></h3></div>";

                } else if (cur_frm.doc.ticket_activity_table[row].time_entry_status == "Pause") {
                    dialog.fields_dict.play_pause_stop.disp_area.innerHTML = "<div class='form-group'><div class='clearfix'><label class='control-label' style='padding-right: 0px;'>Timer</label></div><div class='control-input-wrapper' id='s_" + row + "'><i class='fa fa-2x fa-play-circle' title='Resume' onclick='cur_frm.timeEntryUpdateStatus(" + row + ",\"" + 'Resume' + "\")' ></i> <i class='edit_delete_space'></i> <i class='fa fa-2x fa-check-circle' style='padding-left: 10px !important;' title='Finish' onclick='cur_frm.timeEntryUpdateStatus(" + row + ",\"" + 'Finish' + "\")' ></i></div><h3 id='Timer'></h3></div>";

                }

            }
        } else if (purpose == "Add Row" && activity == "Time Entry") {
            cur_frm.distance = 0000000000000;
            dialog.fields_dict.activity_type.disp_area.innerText = "Time Entry";
            dialog.fields_dict.user.input.value = frappe.user.name;
            dialog.fields_dict.date.input.value = cur_frm.getCurrentDate();
            dialog.fields_dict.start_time.input.value = frappe.datetime.now_time();
            if (cur_frm.doc.source != 'Sales Order') {
                dialog.fields_dict.billable_check.input.checked = true;

            }
            dialog.fields_dict.billable_time.df.hidden_due_to_dependency = false;
            dialog.fields_dict.billable_time.refresh()
            if ($('div[id="s_' + cur_frm.datatable.datamanager.data.length + '"]')[0]) {
                $('div[id="s_' + cur_frm.datatable.datamanager.data.length + '"]')[0].remove();

            }
            if ($('h3[id="Timer"]')[1]) {
                $('h3[id="Timer"]')[0].remove();

            }
            dialog.fields_dict.play_pause_stop.disp_area.innerHTML = "<div class='form-group'><div class='clearfix'><label class='control-label' style='padding-right: 0px;' id='labelTimer'>Timer</label></div><div class='control-input-wrapper' id='s_" + (cur_frm.datatable.datamanager.data.length) + "'><i class='fa fa-2x fa-play-circle' title='Start' onclick='cur_frm.timeEntryUpdateStatus(" + (cur_frm.datatable.datamanager.data.length) + ",\"" + 'Start' + "\")' ></i> <i class='edit_delete_space'></i></div><h3 id='Timer'></h3></div>";
            setTimeout(function () {
                cur_frm.timer(0000000000000, "");
            }, 500);
            // cur_frm.startEndAdjustment();
        } else if (purpose == "Add Row" && activity == "Call/Email/Note") {

            cur_frm.distance = 0000000000000;
            dialog.fields_dict.user.input.value = frappe.user.name;
            dialog.fields_dict.date.input.value = cur_frm.getCurrentDate();
            dialog.fields_dict.start_time.input.value = frappe.datetime.now_time();


        } else if (purpose == "Add Row" && activity == "New Product") {
            if (cur_frm.doc.source != "Sales Order") {
                dialog.fields_dict.billable_check.input.checked = true;

            }
            dialog.fields_dict.user.input.value = frappe.user.name;
            dialog.fields_dict.date.input.value = cur_frm.getCurrentDate();

        }

        if (activity == "Time Entry" || activity == "Call/Email/Note") {
            dialog.fields_dict.item_code.get_query = function () {


                return {
                    query: "it_services.it_services.doctype.it_ticket.it_ticket.item_code_filter_for_time_entry",

                };
            }
        }
        if (activity == "New Product") {
            dialog.fields_dict.item_code.get_query = function () {


                return {
                    query: "it_services.it_services.doctype.it_ticket.it_ticket.item_code_filter_for_new_product",

                };
            }
        }
        if (cur_frm.doc.type == "Block of Time" && cur_frm.activity_type == 'Time Entry') {
            if (dialog.fields_dict.item_code.input) {
                var objects = Object.getOwnPropertyDescriptor(dialog.fields_dict.item_code.input.__proto__, "value");
                var originalSet = objects.set;

                try {
                    var mana = 0;
                    objects.set = function (val) {

                        if (this.getAttribute('data-fieldname') == "item_code") {
                            if (dialog.fields_dict.item_code.input.value && cur_frm.doc.contract) {
                                frappe.call({
                                    method: "it_services.it_services.doctype.it_ticket.it_ticket.get_if_billable",
                                    args: {
                                        "item": dialog.fields_dict.item_code.input.value,
                                        "contract": cur_frm.doc.contract
                                    },
                                    callback: function (r) {
                                        console.log(r)
                                        dialog.fields_dict.billable_check.input.checked = r.message;
                                    }
                                })
                            }

                            if (dialog.fields_dict.item_code.input.value) {
                                frappe.call({
                                    method: "it_services.it_services.doctype.it_ticket.it_ticket.check_if_hours_uom",
                                    args: {
                                        "item": dialog.fields_dict.item_code.input.value
                                    },
                                    callback: function (r) {
                                        if (!r.message && !mana) {
                                            mana = 1;
                                            frappe.msgprint("This item is not Hours for UOM.");
                                            dialog.fields_dict.item_code.input.value = "";
                                            dialog.fields_dict.item_code.value = "";
                                            setTimeout(function () {
                                                mana = 0;
                                            }, 1000)
                                        }

                                    }
                                })
                            }


                        }

                        originalSet.apply(this, arguments);
                    }
                    Object.defineProperty(dialog.fields_dict.item_code.input.__proto__, "value", objects);
                } catch (e) {
                    console.log(e);

                }

            }
        }
        dialog.hide = function () {
            cur_frm.naa = 0;

            if (dialog.fields_dict.billable_time) {
                if (cur_frm.doc.type == "Block of Time" && dialog.fields_dict.billable_time.input.value) {
                    frappe.call({
                        method: "it_services.it_services.doctype.it_ticket.it_ticket.get_total_hours_used",
                        args: {
                            "contract": cur_frm.doc.contract,
                            "billable_time": dialog.fields_dict.billable_time.input.value,
                            "name": 'nope'
                        },
                        callback: function (r) {

                            if (r.message || dialog.fields_dict.billable_check.input.checked) {
                                for (var i = 1; i < $('div[class="dt-scrollable"]').length; i++) {
                                    $('div[class="dt-scrollable"]').remove(i);

                                }
                                dialog.$wrapper.modal("hide");
                                dialog.is_visible = false;

                                if (purpose != "Edit Quantity") {
                                    $('div[class="dt-scrollable"]').css("height", cur_frm.calculateTableHeight(cur_frm.datatable.datamanager.data.length).toString() + "px");
                                    $('div[class="dt-scrollable"]').css("min-width", "882px");
                                    $('div[class="dt-scrollable"]').css("width", "880px");
                                    cur_frm.setRowHeight(cur_frm.datatable.datamanager.data.length);
                                    $('div[data-fieldname="ticket_activity_datatable"]')[0].removeAttribute("hidden");
                                }
                            }
                        }
                    })
                } else {
                    for (var i = 1; i < $('div[class="dt-scrollable"]').length; i++) {
                        $('div[class="dt-scrollable"]').remove(i);

                    }
                    this.$wrapper.modal("hide");
                    this.is_visible = false;

                    if (purpose != "Edit Quantity") {
                        $('div[class="dt-scrollable"]').css("height", cur_frm.calculateTableHeight(cur_frm.datatable.datamanager.data.length).toString() + "px");
                        $('div[class="dt-scrollable"]').css("min-width", "882px");
                        $('div[class="dt-scrollable"]').css("width", "880px");
                        cur_frm.setRowHeight(cur_frm.datatable.datamanager.data.length);
                        $('div[data-fieldname="ticket_activity_datatable"]')[0].removeAttribute("hidden");
                    }
                }
            } else {
                this.$wrapper.modal("hide");
                this.is_visible = false;
            }


        }
        dialog.show = function (callback) {
            if (this.animate) {
                this.$wrapper.addClass('fade');
            } else {
                this.$wrapper.removeClass('fade');
            }
            this.$wrapper[0].onfocus = function () {
                $('.modal-backdrop').unbind('click');

            }
            this.$wrapper.modal("show");
            this.primary_action_fulfilled = false;
            this.is_visible = true;
            if (callback) {
                setTimeout(function () {
                    callback();

                }, 500)
            }

        }
        if (purpose != "Delivery" && purpose != "Edit Quantity") {
            if (dialog.fields_dict.billable_check.input) {
                dialog.fields_dict.billable_check.input.onclick = function () {
                    if (dialog.fields_dict.billable_check.input.checked) {
                        dialog.fields_dict.item_code.df.reqd = true;
                    } else {
                        dialog.fields_dict.item_code.df.reqd = false;

                    }

                }
                if (dialog.fields_dict.billable_check.input.checked) {
                    dialog.fields_dict.item_code.df.reqd = true;
                } else {
                    dialog.fields_dict.item_code.df.reqd = false;

                }
            }

        }

        return dialog;
    };
    cur_frm.editRow = function (row) {
        cur_frm.billable_time = 0;
        cur_frm.rounding_value = 0;
        cur_frm.rounded_values = [];
        cur_frm.modal("Edit Row", 0, row, cur_frm.doc.ticket_activity_table[row].activity_type).show();

    };

    cur_frm.removeRow = function (row) {

        var dn = 0;
        var cantBeDeletedMessage = "";
        var checkIfCanBeDeleted = function () {
            if (cur_frm.doc.ticket_activity_table[row].billed) {
                cantBeDeletedMessage = "Billed activity can't be deleted.";

                return 0
            } else {

                return 1
            }
        }
        if (cur_frm.doc.ticket_activity_table[row].delivery_note_link) {
            frappe.call({
                "method": "frappe.client.get",
                "args": {
                    "doctype": "Delivery Note",
                    "name": cur_frm.doc.ticket_activity_table[row].delivery_note_link
                },
                "callback": function (response) {
                    if (response.message.docstatus == 1) {
                        frappe.msgprint("Deleting a delivery activity that has a delivery note is prohibited.");
                    }

                    else {
                        frappe.confirm(
                            'Delete this row?',
                            function () {
                                cur_frm.doc.ticket_activity_table.splice(row, 1);
                                cur_frm.datatable.datamanager.data.splice(row, 1);
                                var table_height = cur_frm.calculateTableHeight(cur_frm.datatable.datamanager.data.length);
                                // cur_frm.datatable.refresh(cur_frm.datatable.datamanager.data, cur_frm.datatable.columnmanager.columns, function () {
                                //     $('div[class="dt-scrollable"]').css("height", table_height.toString() + "px");
                                //     //
                                //     cur_frm.addActionButtons(cur_frm.datatable.datamanager.data);
                                //     //
                                //     cur_frm.setRowHeight(cur_frm.datatable.datamanager.data.length);
                                //
                                // });
                                cur_frm.save();

                                window.close();
                            },
                            function () {

                            }
                        )
                    }
                }
            });
        } else if (checkIfCanBeDeleted()) {
            frappe.confirm(
                'Delete this row?',
                function () {
                    cur_frm.doc.ticket_activity_table.splice(row, 1);
                    cur_frm.datatable.datamanager.data.splice(row, 1);
                    var table_height = cur_frm.calculateTableHeight(cur_frm.datatable.datamanager.data.length);
                    // cur_frm.datatable.refresh(cur_frm.datatable.datamanager.data, cur_frm.datatable.columnmanager.columns, function () {
                    //     $('div[class="dt-scrollable"]').css("height", table_height.toString() + "px");
                    //     //
                    //     cur_frm.addActionButtons(cur_frm.datatable.datamanager.data);
                    //     //
                    //     cur_frm.setRowHeight(cur_frm.datatable.datamanager.data.length);
                    //
                    // });
                    cur_frm.save();

                    window.close();
                },
                function () {

                }
            )
        } else {
            frappe.msgprint(cantBeDeletedMessage);
        }

    };

    cur_frm.addActionButtons = function (data) {
        for (var row = 0; row < data.length; row++) {

            if ($('div[class="dt-cell__content dt-cell__content--col-6"]')[row].innerHTML) {
                $('div[class="dt-cell__content dt-cell__content--col-6"]')[row].innerHTML = "<i class='fa fa-lg fa-edit edit_delete' style='margin-left:10px' onclick='cur_frm.editRow(" + row + ")'></i> <span></span> <i class='fa fa-lg fa-trash-o edit_delete'  onclick='cur_frm.removeRow(" + row + ")'></i>";

            }
        }
    };
    cur_frm.billedAndBillableToCheckbox = function (data) {

        for (var row = 0; row < data.length; row++) {


            if (parseInt(data[row][3]) == 1) {
                $('div[class="dt-cell__content dt-cell__content--col-4"]')[row].innerHTML = "<input type='checkbox' disabled='disabled' checked='true' >";

            } else {
                $('div[class="dt-cell__content dt-cell__content--col-4"]')[row].innerHTML = "<input type='checkbox' disabled='disabled' >";

            }
            if (parseInt(data[row][4]) == 1) {
                $('div[class="dt-cell__content dt-cell__content--col-5"]')[row].innerHTML = "<input type='checkbox' disabled='disabled' checked='true' >";

            } else {
                $('div[class="dt-cell__content dt-cell__content--col-5"]')[row].innerHTML = "<input type='checkbox' disabled='disabled' >";

            }
        }
    };
    cur_frm.setRowHeight = function (dataTableLength, purpose) {

        // $('div[class="dt-cell__content dt-cell__content--col-0"]').css("width", "40px");
        // $('div[class="dt-cell__content dt-cell__content--header-0"]').css("width", "40px");
        // $('div[class="dt-cell__content dt-cell__content--col-3"]').css("width", "380px");
        // $('div[class="dt-cell__content dt-cell__content--header-3"]').css("width", "380px");
        // $('div[class="dt-cell__content dt-cell__content--col-4"]').css("width", "65px");
        // $('div[class="dt-cell__content dt-cell__content--header-4"]').css("width", "65px");
        // $('div[class="dt-cell__content dt-cell__content--col-5"]').css("width", "65px");
        // $('div[class="dt-cell__content dt-cell__content--header-5"]').css("width", "65px");
        // $('div[class="dt-cell__content dt-cell__content--col-6"]').css("display", "none");
        // $('div[class="dt-cell__content dt-cell__content--header-6"]').css("display", "none");
        // $('div[class="dt-cell__content dt-cell__content--col-7"]').css("width", "100px");
        // $('div[class="dt-cell__content dt-cell__content--header-7"]').css("width", "100px", "text-align", "center");
        // $('div[class="dt-cell__content dt-cell__content--col-7"]').css("text-align", "center");
        // $('div[class="dt-scrollable"]').css("width", "100% !important");
        $('div[class="dt-body"]').css('overflow-x', 'hidden');
        var dt_instance_found = 0;
        var counter = 0;
// while(!dt_instance_found){
//     console.log(1)
//     if($('div[class="datatable dt-instance-'+counter+'"]').length){
//         $('div[class="datatable dt-instance-'+counter+'"]').css('overflow-x','hidden');
//         dt_instance_found=1;
//     }
//     counter+=1;
//
// }


    }
    cur_frm.setRowHeightModal = function (dataTableLength) {

        /*var heightPerRow = 35.5;*/
        var heightPerRow = 31;
        // $('div[class="dt-scrollable"]').css("width", "0px");
        $('div[class="dt-cell__content dt-cell__content--col-0"]').css("width", "40px");
        $('div[class="dt-cell__content dt-cell__content--header-0"]').css("width", "40px");
        $('div[class="dt-cell__content dt-cell__content--col-1"]').css("width", "100px");
        $('div[class="dt-cell__content dt-cell__content--header-1"]').css("width", "100px");
        $('div[class="dt-cell__content dt-cell__content--col-2"]').css("width", "300px");
        $('div[class="dt-cell__content dt-cell__content--header-2"]').css("width", "300px");
        $('div[class="dt-cell__content dt-cell__content--col-3"]').css("width", "100px");
        $('div[class="dt-cell__content dt-cell__content--header-3"]').css("width", "100px");

        // $('div[class="dt-scrollable"]').css("width", "100% !important");

        for (var row = 1; row < dataTableLength + 1; row++) {

            $('div[class="dt-row dt-row-' + row.toString() + ' vrow"]').css("top", heightPerRow.toString() + "px");
            /*heightPerRow += 35.5;*/
            heightPerRow += 30;
        }
    }

    cur_frm.rowCountToIcons = function (dataTableLength) {
        var icons = {
            'Email': "<i class='fa fa-lg fa-envelope-o' ></i>",
            'Call': "<i class='fa fa-lg fa-phone' ></i>",
            'Time Entry': "<i class='fa fa-lg fa-clock-o' ></i>",
            'Schedule': "<i class='fa fa-lg fa-calendar' ></i>",
            'Note': "<i class='fa fa-lg fa-sticky-note-o' ></i>",
            'Delivery': "<i class='fa fa-lg fa-map-o' ></i>",
            'New Product': "<i class='fa fa-lg fa-shopping-cart' ></i>"

        }
        for (var i = 0; i < dataTableLength; i++) {
            if ($('div[class="dt-cell dt-cell--col-0 dt-cell--0-' + i + ' dt-cell--row-' + i + '   "]')[0]) {
                $('div[class="dt-cell dt-cell--col-0 dt-cell--0-' + i + ' dt-cell--row-' + i + '   "]')[0].children[0].innerHTML = icons[cur_frm.doc.ticket_activity_table[i].activity_type];

            }

        }
    }
    cur_frm.insertItem = function (actualIndex, element_id, rowIndex, id) {
        actualIndex = rowIndex - cur_frm.datatable.datamanager.data.length;
        if (element_id.checked) {
            if (cur_frm.datatable.datamanager.data.length) {
                try {
                    $('div[class="dt-row dt-row-' + actualIndex + ' vrow"]')[1].children[3].innerText
                    if (parseInt($('div[class="dt-row dt-row-' + actualIndex + ' vrow"]')[1].children[3].innerText)) {
                        cur_frm.selected_items.push({
                            'id': id,
                            'qty': parseInt($('div[class="dt-row dt-row-' + actualIndex + ' vrow"]')[1].children[3].innerText),
                            'item_code': $('div[class="dt-row dt-row-' + actualIndex + ' vrow"]')[1].children[1].innerText,

                        });
                    } else {
                        frappe.msgprint("Can't deliver items with 0 quantity.");
                        element_id.checked = false;
                    }

                } catch (e) {
                    if (parseInt($('div[data-row-index="' + actualIndex + '"]')[4].children[0].innerText)) {
                        cur_frm.selected_items.push({
                            'id': id,
                            'qty': parseInt($('div[data-row-index="' + actualIndex + '"]')[4].children[0].innerText),
                            'item_code': $('div[data-row-index="' + actualIndex + '"]')[2].children[0].innerText,

                        });
                    } else {
                        frappe.msgprint("Can't deliver items with 0 quantity.");
                        element_id.checked = false;
                    }

                }


            } else {
                if (parseInt($('div[data-row-index="' + actualIndex + '"]')[4].children[0].innerText)) {
                    cur_frm.selected_items.push({
                        'id': id,
                        'qty': parseInt($('div[data-row-index="' + actualIndex + '"]')[4].children[0].innerText),
                        'item_code': $('div[data-row-index="' + actualIndex + '"]')[2].children[0].innerText,

                    });
                } else {
                    frappe.msgprint("Can't deliver items with 0 quantity.");
                    element_id.checked = false;
                }

            }


        }


    }
    cur_frm.rowCountToCheckBox = function (dataTableLength) {
        cur_frm.selected_items = [];
        cur_frm.selectItem = function (rowIndex, id, element_id) {
            var actualIndex = 0;
            var duplicateDeleted = 0;
            if (!cur_frm.selected_items.length) {
                cur_frm.insertItem(actualIndex, element_id, rowIndex, id);
            } else {
                for (var i = 0; i < cur_frm.selected_items.length; i++) {
                    if (cur_frm.selected_items[i]['id'] == id) {
                        cur_frm.selected_items.splice(i, 1);
                        duplicateDeleted = 1;
                        cur_frm.insertItem(actualIndex, element_id, rowIndex, id);
                    }
                    if (i == (cur_frm.selected_items.length - 1) && duplicateDeleted != 1) {
                        cur_frm.insertItem(actualIndex, element_id, rowIndex, id);

                    }
                }
            }


        }
        for (var i = cur_frm.datatable.datamanager.data.length; i < cur_frm.datatable.datamanager.data.length + dataTableLength; i++) {
            $('div[class="dt-cell__content dt-cell__content--col-0"]')[i].innerHTML = "<input type='checkbox' onchange='cur_frm.selectItem(\"" + i + "\",\"" + cur_frm.deliverables_with_name[i - cur_frm.datatable.datamanager.data.length] + "\"," + 'deliverable_' + i + "\)' id='deliverable_" + i + "' />";


        }
    }
    cur_frm.newDataTable = function (data, table_height) {
        var ticket_names = [];
        for (var i = 0; i < data.length; i++) {
            ticket_names.push(data[i][5]);
        }
        frappe.call({
            method: "it_services.it_services.doctype.it_ticket.it_ticket.check_if_billed_new_datatable",
            args: {
                'ticket_activity_names': ticket_names
            },
            callback: function (r) {
                for (var i = 0; i < r.message.length; i++) {
                    for (var ii = 0; ii < data.length; ii++) {
                        if (data[ii][5] == r.message[i].name) {
                            data[ii][4] = r.message[i].billed;

                        }
                        if (data[ii][5] == cur_frm.doc.ticket_activity_table[ii].name) {
                            cur_frm.doc.ticket_activity_table[ii].billed = data[ii][4];

                        }

                    }
                }
            }

        })
        cur_frm.datatable = new DataTable('div[data-fieldname="ticket_activity_datatable"]', {
            columns: ["Date", "User", "Description", "Billable", "Billed", ""],
            data: data
        });

        // $('div[data-fieldname="ticket_activity_datatable"]')[0].setAttribute("style","display:none");

        cur_frm.datatable.refresh = function (data, columns, callback) {
            cur_frm.naa = 0;

            this.datamanager.init(data, columns);
            this.render();
            this.setDimensions();
            if (callback) {
                callback();
            }
            cur_frm.setRowHeight(data.length);
            cur_frm.rowCountToIcons(data.length);
            cur_frm.addActionButtons(data);
            cur_frm.billedAndBillableToCheckbox(data);


        }
        var x = setInterval(function () {
            if (cur_frm.datatable) {
                $('div[class="dt-scrollable"]').css("height", table_height.toString() + "px");
                cur_frm.setRowHeight(cur_frm.datatable.datamanager.data.length, "new datatable");
                cur_frm.rowCountToIcons(cur_frm.datatable.datamanager.data.length);
                cur_frm.addActionButtons(data);
                cur_frm.billedAndBillableToCheckbox(data);
                $('div[class="dt-scrollable"]').css('margin-top', '28px');

                // $('div[data-fieldname="ticket_activity_datatable"]').css("display", "");
                clearInterval(x);
            }


        }, 100);
        setTimeout(function () {
            if (cur_dialog) {
                if (!cur_dialog.fields_dict.comment) {
                    cur_frm.naa = 1;

                }
            } else {
                cur_frm.naa = 1;
            }


        }, 5000)
    };
    cur_frm.calculateTableHeight = function (dataTableLength) {

        return dataTableLength * 40;
    };

    cur_frm.initializeDataTable = function () {
        var data = [];

        frappe.require(["/assets/it_services/js/frappe-datatable.js", "/assets/it_services/css/it-ticket-datatable.min.css"], function () {
            var default_rows = ["date", "user", "description", "billable_check", "billable_time"];
            var table_height = 1;
            var user_emails = [];
            var indexes = [];
            if (cur_frm.doc.ticket_activity_table && cur_frm.doc.ticket_activity_table !== undefined && cur_frm.doc.ticket_activity_table.length) {
                for (var row = 0; row < cur_frm.doc.ticket_activity_table.length; row++) {
                    var row_data = [];
                    row_data[5] = cur_frm.doc.ticket_activity_table[row]['name'];


                    row_data[default_rows.indexOf('date')] = cur_frm.doc.ticket_activity_table[row].date;
                    row_data[default_rows.indexOf('user')] = cur_frm.doc.ticket_activity_table[row].username;
                    row_data[default_rows.indexOf('description')] = cur_frm.doc.ticket_activity_table[row].description;
                    row_data[default_rows.indexOf('billable_check')] = cur_frm.doc.ticket_activity_table[row].billable_check;
                    row_data[default_rows.indexOf('billable_time')] = cur_frm.doc.ticket_activity_table[row].billed;


                    if (row_data[default_rows.indexOf('user')]) {

                        user_emails.push(cur_frm.doc.ticket_activity_table[row].user);
                        indexes.push(row);
                    }

                    if (row_data[default_rows.indexOf('date')]) {
                        row_data[default_rows.indexOf('date')] = cur_frm.convertToSystemDateFormat(cur_frm.doc.ticket_activity_table[row].date);

                    }
                    data.push(row_data);

                }
            }
            // cur_frm.setUserNames(indexes, data, user_emails, function (d) {
            //     table_height = cur_frm.calculateTableHeight(data.length);
            //     cur_frm.newDataTable(d, table_height);
            // });
            table_height = cur_frm.calculateTableHeight(data.length);

            cur_frm.newDataTable(data, table_height);

        });
        cur_frm.setUserNames = function (indexes, data, user_emails, callback) {

            frappe.call({
                method: "it_services.it_services.doctype.it_ticket.it_ticket.get_user_names",
                args: {
                    "emails": user_emails
                },
                callback: function (r) {
                    for (var i = 0; i < r.message.length; i++) {
                        data[indexes[i]][1] = r.message[i];
                    }
                    setTimeout(function () {
                        callback(data);
                    }, 500)

                }
            })

        }
        cur_frm.addRowButton = function () {
            var div_no_data = document.createElement("div");
            div_no_data.setAttribute("class", "no-data text-center");
            div_no_data.setAttribute("id", "Empty");
            div_no_data.innerText = "No Data";

            var div = document.createElement("div");
            div.setAttribute("style", "margin-top:10px");
            div.setAttribute("id", "addRow");

            var button = document.createElement("button");
            button.innerText = "Add Row";
            button.setAttribute("type", "reset");
            // button.setAttribute("onclick", "cur_frm.addRow()");
            button.setAttribute("class", "btn btn-xs btn-default grid-add-row");
            div.appendChild(button);
            if ($('div[id="addRow"]').length && cur_frm.datatable.datamanager.data.length == 0) {
                $('div[data-fieldname="ticket_activity_datatable"]')[0].removeChild($('div[id="addRow"]')[0]);
                if (!$('div[id="Empty"]').length) {
                    $('div[data-fieldname="ticket_activity_datatable"]')[0].appendChild(div_no_data);

                } else {
                    $('div[data-fieldname="ticket_activity_datatable"]')[0].removeChild($('div[id="Empty"]')[0]);
                }

                $('div[data-fieldname="ticket_activity_datatable"]')[0].appendChild(div);

            }
            if (!$('div[id="addRow"]').length && (cur_frm.doc.ticket_activity_table === undefined || !cur_frm.doc.ticket_activity_table )) {
                if (!$('div[id="Empty"]').length) {
                    $('div[data-fieldname="ticket_activity_datatable"]')[0].appendChild(div_no_data);

                } else {
                    $('div[data-fieldname="ticket_activity_datatable"]')[0].removeChild($('div[id="Empty"]')[0]);
                }

                $('div[data-fieldname="ticket_activity_datatable"]')[0].appendChild(div);

            } else if (!$('div[id="addRow"]').length) {
                $('div[data-fieldname="ticket_activity_datatable"]')[0].appendChild(div);
            }
        }
        cur_frm.addRow = function (activity) {
            var d = cur_frm.modal("Add Row", 0, 0, activity);

            d.show();


        }
        var check = setInterval(function () {
            if ($('div[class="dt-cell__content dt-cell__content--col-0"]')[3]) {
                if ($('div[class="dt-cell__content dt-cell__content--col-0"]')[3].innerText == '1') {
                    clearInterval(check);
                    window.location.reload();
                }
            }
        }, 100)

    };
}