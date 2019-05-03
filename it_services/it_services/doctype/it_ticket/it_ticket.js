// Copyright (c) 2018, Oneiric Group Pty Ltd and contributors
// For license information, please see license.txt

var style = document.createElement('style');

style.type = 'text/css';

style.innerHTML = '#contracts {font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;border-collapse: collapse;width: 100%;} #contracts td, #contracts th { border: 1px solid #ddd;padding: 8px;} #contracts tr:nth-child(even){background-color: #f2f2f2;} #contracts tr:hover {background-color: #ddd;} #contracts th {padding-top: 12px;padding-bottom: 12px;text-align: left;background-color: #4CAF50;color: white;}';
document.getElementsByTagName('head')[0].appendChild(style);


frappe.ui.form.on('IT Ticket', {
    setup: function (frm) {
        cur_frm.selected_items = [];

        frappe.require("/assets/it_services/js/Timer.js");
        cur_frm.checkDelivery = function (callback) {
            if (cur_frm.doc.sales_order) {
                frappe.call({
                    method: "it_services.it_services.doctype.it_ticket.it_ticket.check_delivery_conditions",
                    args: {
                        "ticket_name": cur_frm.doc.name,
                        "sales_order": cur_frm.doc.sales_order
                    },
                    callback: function (r) {
                        if (r.message) {

                            frappe.call({
                                method: "it_services.it_services.doctype.it_ticket.it_ticket.get_deliverables",
                                args: {
                                    "sales_order": cur_frm.doc.sales_order
                                },
                                callback: function (rr) {
                                    if (rr.message.length) {
                                        var deliverables = []
                                        for (var i = 0; i < rr.message.length; i++) {
                                            var d = []
                                            for (var ii = 0; ii < rr.message[i].length; ii++) {
                                                if (ii != 3) {
                                                    d.push(rr.message[i][ii])
                                                }
                                            }
                                            deliverables.push(d)
                                        }
                                        callback(1, deliverables, rr.message);
                                    } else {
                                        callback(0);
                                    }
                                }
                            })
                        }
                    }
                })
            }


        }


    },

    after_save: function (frm) {
        if(cur_frm.old_assigned_user!=frm.doc.assigned_to){
            frappe.call({
                    method: "it_services.it_services.doctype.it_ticket.it_ticket.get_user_email",
                    args: {
                        "user": frm.doc.assigned_to
                    },
                    callback: function (r) {
                        if (r.message) {
                            cur_frm.send_email({
                                                    'content': "Ticket "+frm.doc.name+" has been assigned to you. </br> "+window.location.href+"</br> Customer: "+frm.doc.customer+"</br> Description: "+frm.doc.description,
                                                    'language_sel': "en",
                                                    'select_print_format': "Standard",
                                                    'send_me_a_copy': 0,
                                                    'send_read_receipt': 0,
                                                    'attach_document_print': true,
                                                    'subject': "Ticket "+frm.doc.name,
                                                    'recipients': r.message,
                                                }, [])

                        } else {
                            frappe.msgprint("Assigned user has no email address.")
                        }

                    }
                })
        }
        if (frm.is_first_creation()) {

            if (frm.doc.contact) {
                frappe.call({
                    method: "it_services.it_services.doctype.it_ticket.it_ticket.get_contact_email_address",
                    args: {
                        "name": frm.doc.contact
                    },
                    callback: function (r) {

                        if (r.message) {
                            frappe.call({
                                method: "it_services.it_services.doctype.it_ticket.it_ticket.check_if_send_email_and_get_email_template_for_new_tickets",
                                args:{
                                  'purpose': 'new ticket'
                                },
                                callback: function (rrr) {
                                    if (rrr.message) {
                                        frappe.call({
                                            method: 'frappe.email.doctype.email_template.email_template.get_email_template',
                                            args: {
                                                template_name: rrr.message,
                                                doc: frm.doc,
                                                _lang: frappe.user_defaults.language
                                            },
                                            callback: function (rr) {
                                                //console.log(rr.message);

                                                frm.send_email({
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


    },



    "edit_description": function (frm) {
        frm.set_df_property("description", "read_only", 0);
        frm.refresh_field("description");
    },

    refresh: function (frm) {
        cur_frm.naa=1;
        frm.page.actions_btn_group.hide();
       cur_frm.old_assigned_user=frm.doc.assigned_to;

        if (!frm.doc.use_global_contract) {
            frm.fields_dict.contract.df.reqd = 1;
        }
        if(frm.doc.docstatus==1 && !frm.doc.complete_email_sent){
            frappe.call({
                     method: "it_services.it_services.doctype.it_ticket.it_ticket.get_contact_email_address",
                    args: {
                        "name": frm.doc.contact
                    },
                    callback: function (r) {

                        if (r.message) {

                            frappe.call({
                                method: "it_services.it_services.doctype.it_ticket.it_ticket.check_if_send_email_and_get_email_template_for_new_tickets",
                                args:{
                                  'purpose': 'completed'
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

                                                frappe.call({
                                                    method: "it_services.it_services.doctype.it_ticket.it_ticket.completed_sent",
                                                    args:{
                                                        'name': cur_frm.doc.name
                                                    }
                                                })
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
        if (frm.doc.ticket_activity_table) {
            if (!frm.doc.ticket_activity_table.length) {
                frm.fields_dict.section_break_16.df.hidden = 1;
                frm.refresh_field("section_break_16")
            } else {
                frm.fields_dict.section_break_16.df.hidden = 0;
                frm.refresh_field("section_break_16")
            }
        }
        $.getScript('/assets/it_services/js/ticket-activity-datatable.js', function () {
            frm.naa = 0;
            frm.initializeDataTable();
        });
        $.ajaxSetup({
            cache: false
        });

        $('div[class="dt-scrollable"]').css('margin-top', '28px');

        frm.set_df_property("description", "read_only", frm.doc.__islocal ? 0 : 1);
        if (frm.is_new()) {
            if (window.so) {
                frm.doc.source = window.source;
                frm.refresh_field("source");

                frm.doc.sales_order = window.so;
                frm.refresh_field("sales_order");

                frm.doc.customer = window.customer;
                frm.refresh_field("customer");

                frm.doc.contact = window.contact;
                frm.refresh_field("contact");

                frm.doc.address = window.address;
                frm.refresh_field("address");

                frm.doc.use_global_contract = window.use_global_contract;
                frm.refresh_field("use_global_contract");
				frm.fields_dict.contract.df.reqd = 0;

                frm.doc.description = "Sales Order #" + frm.doc.sales_order;
                frm.refresh_field("description");

                if (frm.doc.contact) {
                    frappe.call({
                        method: "frappe.contacts.doctype.contact.contact.get_contact_details",
                        args: {contact: frm.doc.contact},
                        callback: function (r) {
                            if (r.message)
                                frm.set_value('contact_display', r.message.contact_display);
                        }
                    })
                }
                frm.events.type(frm);

                erpnext.utils.get_address_display(frm, 'address', 'address_display');
                if (!frm.is_new()) {
                    setTimeout(function () {
                        $('a[id="address_display"]')[0].innerHTML = frm.doc.address_display;

                    }, 1000)
                }
            }
        }

        frappe.require(['/assets/it_services/js/it_ticket_dashboard.js', '/assets/it_services/js/ticket-activity-datatable.js'], function () {
            if (!frm.is_new()) {
                frm.dashboard.section[0].innerHTML = dashboard;
                var ids = [
                    'customer',
                    'contact_display',
                    'address_display',
                    'assigned_to',
                    'open_date',
                    'due_date',
                    'priority'
                ]
                for (var i = 0; i < ids.length; i++) {
                    var a = document.createElement('a');
                    if (frm.doc[ids[i]]) {
                        if (ids[i] == "open_date") {
                            a.innerHTML = frm.convertToSystemDateFormat(frm.doc[ids[i]].split(" ")[0]) + " " + frm.doc[ids[i]].split(" ")[1];
                            $('#' + ids[i])[0].appendChild(a);
                        } else {
                            a.innerHTML = frm.doc[ids[i]];
                            $('#' + ids[i])[0].appendChild(a);
                        }

                    } else {
                        a.innerHTML = "Non-specified";
                        $('#' + ids[i])[0].appendChild(a);
                    }
                }

            }

        })

        //modify UI
        $('div[class="data-fieldname"]').css("height", "370px");
        $('div[class="ql-editor"]').css("max-height", "400px");
        $('div[class="ql-editor"]').css("min-height", "250px");
        $('div[class="timeline-head"]').css("display", "none");
        $('div[class="timeline-new-email"]').css("display", "none");
        if (frm.doc.docstatus==0 && !frm.is_new()) {

            frm.add_custom_button("Create Quotation", function () {
                frappe.call({
                    method: "it_services.it_services.doctype.it_ticket.it_ticket.get_contact",
                    args: {
                        "customer": frm.doc.customer
                    },
                    callback: function (r) {
                        window.contact = r.message;
                        frappe.call({
                            method: "it_services.it_services.doctype.it_ticket.it_ticket.get_address",
                            args: {
                                "customer": frm.doc.customer
                            },
                            callback: function (r) {
                                window.ticket = frm.doc.name;
                                window.customer = frm.doc.customer;
                                window.address = r.message;
                                setTimeout(function () {
                                    frappe.new_doc("Quotation");
                                }, 500)
                            }
                        })
                    }
                })


            })

            frm.add_custom_button("Mark Completed", function () {
                frm.set_value("status", 'Completed');
                cur_frm.savesubmit();
            })
        }
 if (frm.doc.docstatus==0 && !frm.is_new()) {            frm.add_custom_button(__('<i class="fa fa-lg fa-sticky-note-o" style="width:35px;"></i>' + 'Call / Email / Note'),
                frm.cscript['Create Activity Note'], __("Add Activity"));
            frm.add_custom_button(__('<i class="fa fa-lg fa-shopping-cart" style="width:35px;"></i>' + 'New Product'),
                frm.cscript['Create Activity New Product'], __("Add Activity"));
            frm.add_custom_button(__('<i class="fa fa-lg fa-clock-o" style="width:35px;"></i>' + 'Time Entry'),
                frm.cscript['Create Activity Time Entry'], __("Add Activity"));
            frm.add_custom_button(__('<i class="fa fa-lg fa-calendar" style="width:35px;"></i>' + 'Schedule'),
                frm.cscript['Create Activity Schedule'], __("Add Activity"));
            frm.page.set_inner_btn_group_as_primary(__("Add Activity"));
			frm.checkDelivery(function (r) {
                if (r && !frm.custom_buttons['<i class="fa fa-lg fa-map-o" style="width:35px;"></i>Delivery']) {
                    frm.add_custom_button(__('<i class="fa fa-lg fa-map-o" style="width:35px;"></i>' + 'Delivery'),
                        frm.cscript['Create Activity Delivery'], __("Add Activity"));
                }
            });
        }


        if (frm.is_new() && !frm.doc.open_date) {
            frm.doc.open_date = frappe.datetime.now_datetime();
            frm.refresh_field("open_date");

            if (frm.is_new() && !frm.doc.assigned_to) {
                frm.set_value("assigned_to", frappe.user.name);
                frm.refresh_field("assigned_to");
            }

        }

        //Address and Contact Query / Display

        frm.set_query('contact', function (doc) {
            return {
                query: 'frappe.contacts.doctype.contact.contact.contact_query',
                filters: {
                    link_doctype: 'Customer',
                    link_name: doc.customer
                }
            };
        });


        frm.set_query('address', function (doc) {
            return {
                query: 'frappe.contacts.doctype.address.address.address_query',
                filters: {
                    link_doctype: 'Customer',
                    link_name: doc.customer
                }
            };
        });

    },

    "contact": function (frm) {
        if (frm.doc.contact) {
            frappe.call({
                method: "it_services.it_services.doctype.it_ticket.it_ticket.check_contact_is_linked",
                args: {
                    "contact": frm.doc.contact,
                    "customer": frm.doc.customer
                }
            })

            frappe.call({
                method: "frappe.contacts.doctype.contact.contact.get_contact_details",
                args: {contact: frm.doc.contact},
                callback: function (r) {
                    if (r.message)
                        frm.set_value('contact_display', r.message.contact_display);
                }
            })

        }

    },

    "address": function (frm) {
        if (frappe.quick_entry) {
            if (frappe.quick_entry.doc) {
                frappe.quick_entry.doc.address_title = frm.doc.customer + "-" + frappe.quick_entry.doc.address_type;

            }

        }
        if (frm.doc.address && frm.doc.address != undefined) {
            frappe.call({
                method: "it_services.it_services.doctype.it_ticket.it_ticket.check_address_is_linked",
                args: {
                    "address": frm.doc.address,
                    "customer": frm.doc.customer
                }
            })
        }
        erpnext.utils.get_address_display(frm, 'address', 'address_display');

        if (!frm.is_new()) {
            setTimeout(function () {
                $('a[id="address_display"]')[0].innerHTML = frm.doc.address_display;

            }, 1000)
        }
    },

    "customer": function (frm) {
        frm.refresh_field("type");
        frm.refresh_field("customer");
        frm.doc.contact = "";
        frm.refresh_field("contact");

        if (frm.doc.type && frm.doc.customer) {
            frappe.call({
                method: "it_services.it_services.doctype.it_ticket.it_ticket.get_default_contract",

                args: {
                    "customer": frm.doc.customer,

                    "type": frm.doc.type

                },

                callback: function (r) {
                    if (r.message.length) {

                        if (r.message.length == 1) {
                            frm.doc.contract = r.message[0][0];

                            frm.refresh_field("contract");

                        } else {
                            var d = new frappe.ui.Dialog({

                                'fields': [
                                    {'fieldname': 'ht', 'fieldtype': 'HTML'},

                                ]

                            });

                            frm.chooseContract = function (contract) {
                                frm.doc.contract = contract;

                                frm.refresh_field('contract');

                                d.hide();

                            }

                            var table = '<table id="contracts">';

                            for (var i = 0; i < r.message.length; i++) {
                                var address = r.message[i][0];

                                table += '<tr onclick="cur_frm.chooseContract(\'' + r.message[i][0] + '\',' + i + '\)"><td >' + r.message[i][0] + '</td></tr>';

                            }

                            table += '</table>';

                            d.fields_dict.ht.$wrapper.html(table);

                            d.show();

                        }

                    } else {
                        frappe.msgprint("There are no " + frm.doc.type + " contracts for " + frm.doc.customer);

                    }

                }

            });

        }
    },


    "type": function (frm) {
        frm.doc.contract = "";

        frm.refresh_field("contract");

        frm.refresh_field("type");

        frm.refresh_field("customer");

        if (frm.doc.type && frm.doc.customer) {
            frappe.call({
                method: "it_services.it_services.doctype.it_ticket.it_ticket.get_default_contract",

                args: {
                    "customer": frm.doc.customer,

                    "type": frm.doc.type

                },

                callback: function (r) {
                    if (r.message.length) {
                        if (r.message.length == 1) {
                            frm.doc.contract = r.message[0][0];

                            frm.refresh_field("contract");

                        } else {
                            var d = new frappe.ui.Dialog({
                                'fields': [

                                    {'fieldname': 'ht', 'fieldtype': 'HTML'},

                                ]

                            });

                            frm.chooseContract = function (contract) {
                                frm.doc.contract = contract;

                                frm.refresh_field('contract');

                                d.hide();

                            }

                            var table = '<table id="contracts">';

                            for (var i = 0; i < r.message.length; i++) {
                                var address = r.message[i][0];

                                table += '<tr onclick="cur_frm.chooseContract(\'' + r.message[i][0] + '\',' + i + '\)"><td >' + r.message[i][0] + '</td></tr>';

                            }

                            table += '</table>';

                            d.fields_dict.ht.$wrapper.html(table);

                            d.show();

                        }
                    } else {
                        frappe.msgprint("There are no " + frm.doc.type + " contracts for " + frm.doc.customer);
                        frm.doc.type = '';
                        frm.refresh_field('type');
                    }

                }

            });

        } else if (!frm.doc.customer) {
            frappe.msgprint("Please choose a customer first.");
            frm.doc.type = '';
            frm.refresh_field('type');
        }

    },
    "use_global_contract": function (frm) {
        if (frm.doc.use_global_contract) {
            frm.fields_dict.contract.df.reqd = 0;

        }
    }


});

cur_frm.cscript['Create Activity Delivery'] = function () {
    // frappe.msgprint("Used to complete delivery of item / items, either referenced against Sales Order (when we get this all linked up) or items added through Add Activity button. Should not show if item is not referenced or added manually via Add Activity.");

    cur_frm.checkDelivery(function (r, deliverables, deliverables_with_name) {
        if (r) {
            var dialog = cur_frm.modal("Delivery", 0, 0);


            // dialog.fields_dict.deliverables.$wrapper.html(table);

            for (var i = 0; i < $('div[data-fieldname="deliverables"]').length; i++) {
                $('div[data-fieldname="deliverables"]').remove(i);

            }
            cur_frm.deliverables = deliverables;
            dialog.show(function () {
                cur_frm.naa=0;
                new DataTable('div[data-fieldname="deliverables"]', {
                    columns: ["Item", "Description", "Quantity"],
                    data: deliverables
                });
                cur_frm.deliverables_with_name = [];
                for (var i = 0; i < deliverables_with_name.length; i++) {
                    cur_frm.deliverables_with_name.push(deliverables_with_name[i][3]);

                }
                $('div[class="dt-scrollable"]').css("height", cur_frm.calculateTableHeight(deliverables.length).toString() + "px");
                cur_frm.setRowHeightModal(deliverables.length);
                $('div[class="dt-scrollable"]').css("min-width", "500px");
                cur_frm.rowCountToCheckBox(deliverables.length);
                cur_frm.delivery = 1;
                $('div[data-fieldname="ticket_activity_datatable"]')[0].setAttribute("hidden", 1);
                signature.make();


            });


        }
    })
}

cur_frm.cscript['Create Activity Time Entry'] = function () {
    cur_frm.billable_time = 0;
    cur_frm.rounding_value = 0;
    cur_frm.rounded_values = [];

    var d = cur_frm.modal("Add Row", 0, 0, "Time Entry");

    d.show();


    cur_frm.dialog = d;
    if ($('button[data-dismiss="modal"]')[0]) {
        $('button[data-dismiss="modal"]')[0].remove();
    }
    setTimeout(function () {
        if ((cur_frm.status != "Pause" && cur_frm.status != "Finish") && cur_frm.status) {
            $('button[data-dismiss="modal"]')[0].setAttribute("id", "thismodal");
            $('button[id="thismodal"]')[0].setAttribute("data-dismiss", "");
        }
    }, 500);

    // frappe.msgprint("This should show the modal to enter with activity entry type specified (not shown) as Time Entry and be billable by default but check box which can be unchecked to stop it being billable. We will need timer like used in Projects > Timesheets. It should allow for the timer to pause. Also the modal window should not close without selecting cancel / submit on modal - so stop from closing on click anywhere else on window.");
}

cur_frm.cscript['Create Activity New Product'] = function () {
    // frappe.msgprint("This should show the modal to enter with activity entry type specified (not shown) as New Product and be billable. It should pull current default rate from item master, and also allow Qty to be adjusted. Might in future allow for multiple items to be entered at once in datatable for example?");

    var d = cur_frm.modal("Add Row", 0, 0, "New Product");
    d.show();


}

cur_frm.cscript['Create Activity Note'] = function () {
    // frappe.msgprint("This should show the modal to enter with activity entry type selectable of either Call / Email / Note with optional checkbox to be billable (off by default)");

    var d = cur_frm.modal("Add Row", 0, 0, "Call/Email/Note");
    d.show();


}

cur_frm.cscript['Create Activity Schedule'] = function () {
    frappe.msgprint("This should show the modal to create a new appointment via O365 users calendar - to be determined.");
}


cur_frm.send_email = function (form_values, selected_attachments, print_html, print_format) {
    var me = this;

    if (!form_values.recipients) {
        frappe.msgprint(__("Enter Email Recipient(s)"));
        return;
    }

    if (!form_values.attach_document_print) {
        print_html = null;
        print_format = null;
    }


    if (cur_frm && !frappe.model.can_email(me.doc.doctype, cur_frm)) {
        frappe.msgprint(__("You are not allowed to send emails related to this document"));
        return;
    }

    return frappe.call({
        method: "frappe.core.doctype.communication.email.make",
        args: {
            recipients: form_values.recipients,
            cc: form_values.cc,
            bcc: form_values.bcc,
            subject: form_values.subject,
            content: form_values.content,
            doctype: me.doc.doctype,
            name: me.doc.name,
            send_email: 1,
            print_html: print_html,
            send_me_a_copy: 0,
            print_format: print_format,
            sender: form_values.sender,
            sender_full_name: form_values.sender ? frappe.user.full_name() : undefined,
            attachments: selected_attachments,
            attach_document_print: true,
            _lang: me.lang_code,
            read_receipt: 0,

        },

        callback: function (r) {
            if (!r.exc) {
                frappe.utils.play_sound("email");

                if (r.message["emails_not_sent_to"]) {
                    frappe.msgprint(__("Email not sent to {0} (unsubscribed / disabled)",
                        [frappe.utils.escape_html(r.message["emails_not_sent_to"])]));
                }

                if ((frappe.last_edited_communication[me.doc] || {})[me.key]) {
                    delete frappe.last_edited_communication[me.doc][me.key];
                }
                if (cur_frm) {
                    // clear input
                    cur_frm.timeline.input && cur_frm.timeline.input.val("");
                    cur_frm.reload_doc();
                }

                // try the success callback if it exists
                if (me.success) {
                    try {
                        me.success(r);
                    } catch (e) {
                        console.log(e);
                    }
                }

            } else {
                frappe.msgprint(__("There were errors while sending email. Please try again."));

                // try the error callback if it exists
                if (me.error) {
                    try {
                        me.error(r);
                    } catch (e) {
                        console.log(e);
                    }
                }
            }
        }
    });

}
cur_frm.get_response = function (template, subject, language, name, email) {
    var email_template = template;
    var message = '';
    var prepend_reply = function (reply) {

        var content = "";
        var subject = subject;

        var parts = content.split('<!-- salutation-ends -->');

        if (parts.length === 2) {
            content = [reply.message, "<br>", parts[1]];
        } else {
            content = [reply.message, "<br>", content];
        }

        // content_field.set_value();
        message = content.join('');


    }

    frappe.call({
        method: "it_services.it_services.doctype.it_invoice_processing.it_invoice_processing.get_sales_invoice_doc",
        args: {
            "name": name,
        },
        callback: function (r) {

            frappe.call({
                method: 'frappe.email.doctype.email_template.email_template.get_email_template',
                args: {
                    template_name: email_template,
                    doc: r.message,
                    _lang: language
                },
                callback: function (r) {
                    prepend_reply(r.message);
                    cur_frm.send_email({
                        'content': message,
                        'language_sel': "en",
                        'select_print_format': "Standard",
                        'send_me_a_copy': 0,
                        'send_read_receipt': 0,
                        'attach_document_print': true,
                        'subject': "Sales Invoice: " + name,
                        'recipients': email,
                    }, [])

                },
            });
        }
    })

}
