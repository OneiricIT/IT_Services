// Copyright (c) 2018, Oneiric Group Pty Ltd and contributors
// For license information, please see license.txt
cur_frm.convertToDBDateFormat = function (date) {
    var date = new Date(date.split('/')[2] + '-' + date.split('/')[1] + '-' + date.split('/')[0]);
    var day = 0;
    if (date.getDate() < 10) {
        day = "0" + (date.getDate());
    } else {
        day = date.getDate();
    }
    var month = 0;
    if (date.getMonth() < 9) {
        month = "0" + (date.getMonth() + 1);
    } else {
        month = date.getMonth() + 1;
    }
    return date.getFullYear() + "-" + month + "-" + day;
}


frappe.ui.form.on('IT Invoice Processing', {
    setup: function (frm) {
        cur_frm.check_list_invoices = 0;
    },

    refresh: function (frm) {
        if (cur_frm.sent) {
            if (cur_frm.sent.length) {
                frappe.call({
                    method: "it_services.it_services.doctype.it_invoice_processing.it_invoice_processing.update_invoice_processed_email",
                    args: {
                        'inp_names': cur_frm.sent
                    },
                    callback: function (r) {
                        cur_frm.sent = [];
                        cur_frm.reload_doc();
                    }
                })
            }

        }

        if (frm.doc.unbilled_activities) {
            if (!frm.doc.unbilled_activities.length) {
                frm.fields_dict.unbilled_activities.df.hidden = 1;
                cur_frm.fields_dict.unbilled_activities.refresh()

            }
        } else {
            frm.fields_dict.unbilled_activities.df.hidden = 1;
            cur_frm.fields_dict.unbilled_activities.refresh()
        }
        if (frm.doc.docstatus == 1) {
            frm.page.btn_secondary.addClass('hide');
        }
        if (frm.doc.unbilled_activities) {
            if (frm.doc.unbilled_activities.length) {
                var all_done = 1;
                for (var i = 0; i < frm.doc.unbilled_activities.length; i++) {
                    if (frm.doc.unbilled_activities[i].action_done == 0) {
                        all_done = 0;
                    }
                }
                if (!all_done) {
                    frm.add_custom_button('Bill unbilled activities', function () {
                        frappe.call({
                            method: "it_services.it_services.doctype.it_invoice_processing.it_invoice_processing.bill_unbilled_activities",
                            args: {
                                "unbilled": frm.doc.unbilled_activities,
                                "end": frm.doc.end_date,
                                "invoice_processing_name": frm.doc.name
                            },
                            callback: function (r) {
                                if (r.message) {
                                    frappe.msgprint("Actions applied for the unbilled activities.")
                                    frm.reload_doc();
                                }
                            }
                        })
                    })
                }

            }
        }
        if (frm.doc.docstatus == 1) {
            if (frm.doc.unbilled_activities) {
                if (!frm.doc.unbilled_activities.length) {
                    frappe.call({
                        method: "it_services.it_services.doctype.it_invoice_processing.it_invoice_processing.check_unbilled",
                        args: {
                            "name": frm.doc.name
                        },
                        callback: function (r) {

                            if (r.message) {
                                frappe.msgprint("Unbilled tickets found from the previous period.");
                                if (!frm.doc.unbilled_activities.length) {
                                    frm.reload_doc();

                                }
                            }
                        }
                    })
                }
            } else {
                frappe.call({
                    method: "it_services.it_services.doctype.it_invoice_processing.it_invoice_processing.check_unbilled",
                    args: {
                        "name": frm.doc.name
                    },
                    callback: function (r) {
                        if (r.message) {
                            frappe.msgprint("Unbilled tickets found from the previous period.");
                            if (!frm.doc.unbilled_activities) {
                                frm.reload_doc();

                            }
                        }
                    }
                })
            }

        }

        if (frm.doc.list_of_invoices && !frm.is_new()) {
            if (!frm.doc.list_of_invoices.length) {
                frappe.call({
                    method: "it_services.it_services.doctype.it_invoice_processing.it_invoice_processing.get_list_of_invoices",
                    args: {
                        "parent": frm.doc.name
                    },
                    callback: function (r) {
                        $.when(
                            $.getScript("/assets/it_services/js/invoice-processed-datatable.js"),
                            $.getScript("/assets/it_services/js/ticket-activity-datatable.js"),
                            $.Deferred(function (deferred) {
                                $(deferred.resolve);
                            })
                        ).done(function () {
                            cur_frm.initializeDataTableForITInvoiceProcessed(r.message);
                            $.ajaxSetup({
                                cache: false
                            });
                            //place your code here, the scripts are all loaded

                        });

                    }
                })

            } else {
                $.when(
                    $.getScript("/assets/it_services/js/invoice-processed-datatable.js"),
                    $.getScript("/assets/it_services/js/ticket-activity-datatable.js"),
                    $.Deferred(function (deferred) {
                        $(deferred.resolve);
                    })
                ).done(function () {
                    cur_frm.initializeDataTableForITInvoiceProcessed();
                    $.ajaxSetup({
                        cache: false
                    });
                    //place your code here, the scripts are all loaded

                });

            }


        } else {
            $.when(
                $.getScript("/assets/it_services/js/invoice-processed-datatable.js"),
                $.getScript("/assets/it_services/js/ticket-activity-datatable.js"),
                $.Deferred(function (deferred) {
                    $(deferred.resolve);
                })
            ).done(function () {
                $('div[data-fieldname="invoice_processed_datatable"]').css("display", "none");
                cur_frm.initializeDataTableForITInvoiceProcessed();
                //place your code here, the scripts are all loaded

            });

        }
        if (frm.doc.docstatus == 1) {
            frm.add_custom_button("Submit and Send Invoice/s", function () {
                var email_template = '';
                var customer = frm.doc.customer;
                if (!customer) {
                    customer = 'no customer'
                }
                frappe.call({
                    method: "it_services.it_services.doctype.it_invoice_processing.it_invoice_processing.submit_invoices",
                    args: {
                        "invoice_processing_name": frm.doc.name,
                        "customer": customer
                    },
                    callback: function (r) {
                        if (r.message) {
                            cur_frm.sent = [];
                            frappe.call({
                                method: "it_services.it_services.doctype.it_invoice_processing.it_invoice_processing.get_default_email_template_for_invoice_processing",
                                callback: function (r) {
                                    email_template = r.message;
                                    for (var i = 0; i < frm.doc.list_of_invoices.length; i++) {
                                        if ($('div[class="dt-cell__content dt-cell__content--col-6"]')[i].children[0].checked == true) {
                                            if (!frm.doc.list_of_invoices[i].contact) {
                                                frappe.msgprint("There is no email address of the recipient for Sales Invoice: " + frm.doc.list_of_invoices[i].link);
                                            } else {
                                                cur_frm.get_response(email_template, "Sales Invoice: " + frm.doc.list_of_invoices[i].link, "en", frm.doc.list_of_invoices[i].link, frm.doc.list_of_invoices[i].email_address);
                                                cur_frm.sent.push(frm.doc.list_of_invoices[i].name);
                                            }
                                        }


                                    }


                                }
                            })
                        }
                    }
                })


            }).addClass("btn-primary");
        }


        var current_date = new Date(frappe.datetime.now_date());
        var day = current_date.getDate();

        var month = 0;
        if (current_date.getMonth() < 9) {
            month = "0" + (current_date.getMonth() + 1);
        } else {
            month = current_date.getMonth() + 1;
        }
        frm.doc.posting_date = cur_frm.convertToDBDateFormat(day + "/" + month + "/" + current_date.getFullYear());
        frm.refresh_field("posting_date");


    },
    'edit_posting_date': function (frm) {
        if (frm.doc.edit_posting_date == 1) {
            frm.set_df_property("posting_date", "read_only", cur_frm.__islocal ? 0 : 0);
            $("input[data-fieldname='posting_date']").datepicker({dateFormat: 'dd/mm/yy', language: 'en'});
        } else {
            frm.set_df_property("posting_date", "read_only", cur_frm.__islocal ? 0 : 1);
        }
    },

    "start_date": function (frm) {

        if (frm.doc.end_date) {

            if (new Date(frm.doc.end_date) < new Date(frm.doc.start_date)) {
                frm.doc.end_date = "";
                frm.refresh_field("end_date");
                frappe.msgprint("End date should be after Start Date.");
            }
        }
    },
    "end_date": function (frm) {
        if (frm.doc.start_date && frm.doc.end_date) {

            if (new Date(frm.doc.end_date) < new Date(frm.doc.start_date)) {
                frm.doc.end_date = "";
                frm.refresh_field("end_date");
                frappe.msgprint("End date should be after Start Date.");
            }
        }
    },
    validate: function (frm) {
        if (cur_frm.is_new()) {
            frappe.call({
                method: "it_services.it_services.doctype.it_invoice_processing.it_invoice_processing.invoice_processing_charged_or_not",
                args: {
                    "start_date": frm.doc.start_date,
                    "end_date": frm.doc.end_date
                },
                callback: function (r) {
                    if (r.message) {
                        frappe.msgprint("This document overlaps with invoice processing named " + r.message);

                        frappe.validated = false;
                    }
                }
            })
        }

    },


});
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
                    frappe.call({
                        method: "it_services.it_services.doctype.it_invoice_processing.it_invoice_processing.get_default_print_format",
                        callback: function (rr) {
                            var print_format = '';
                            if (rr.message) {
                                print_format = rr.message;
                            } else {
                                print_format = "Standard";
                            }
                            cur_frm.send_email({
                                'content': message,
                                'language_sel': "en",
                                'select_print_format': print_format,
                                'send_me_a_copy': 0,
                                'send_read_receipt': 0,
                                'attach_document_print': true,
                                'subject': "Sales Invoice: " + name,
                                'recipients': email,
                            }, [{
                                "lang": "en",
                                "print_format": print_format,
                                "doctype": "Sales Invoice",
                                "print_letterhead": 1,
                                "html": "",
                                "print_format_attachment": 1,
                                "name": name
                            }])
                        }
                    })


                    // cur_frm.send_email({
                    //     'content': message,
                    //     'language_sel': "en",
                    //     'select_print_format': "Standard",
                    //     'send_me_a_copy': 0,
                    //     'send_read_receipt': 0,
                    //     'attach_document_print': true,
                    //     'subject': "Sales Invoice: " + name,
                    //     'recipients': email,
                    // }, [])

                },
            });
        }
    })

}
