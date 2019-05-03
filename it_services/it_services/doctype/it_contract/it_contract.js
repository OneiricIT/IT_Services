// Copyright (c) 2018, Oneiric Group Pty Ltd and contributors
// For license information, please see license.txt
var general_contract_exist = 0;
frappe.ui.form.on('IT Contract', {

    refresh: function (frm) {

        if (document.getElementsByClassName("btn btn-secondary btn-default btn-sm")[0]) {
            document.getElementsByClassName("btn btn-secondary btn-default btn-sm")[0].setAttribute("style", "display: none");

        }

        cur_frm.amend_doc = function () {
            cur_frm.fields_dict['amended_from'] = cur_frm.doc.name;
            if (!this.fields_dict['amended_from']) {
                alert('"amended_from" field must be present to do an amendment.');
                return;
            }
            this.validate_form_action("Amend");
            var me = this;
            var fn = function (newdoc) {
                newdoc.amended_from = me.docname;
                if (me.fields_dict && me.fields_dict['amendment_date'])
                    newdoc.amendment_date = frappe.datetime.obj_to_str(new Date());
            };
            this.copy_doc(fn, 1);
            frappe.utils.play_sound("click");
        }
    },
    "customer": function (frm) {
		if (frm.doc.customer) {
				frappe.db.get_value("Customer", { name: frm.doc.customer }, "customer_code", function(data){
				if (!data.customer_code && frm.doc.customer){
					frappe.msgprint("Customer Code required to be set on Customer Master");
					frm.set_value('customer_code', '');
					frm.set_value('customer', '');
					frappe.validated = false;
				}
				else {
					frm.set_value('customer_code', data.customer_code);
					if (frm.doc.customer_code !== data.customer_code){
						frappe.msgprint("Customer Code not the same as Customer Master");
						frm.set_value('customer_code', '');
						frappe.validated = false;
						}
				}
			});
		}

        frm.refresh_field("customer");
        frm.refresh_field("contract_type");
        //general_contract_exist = 0;
        if (frm.doc.customer && frm.doc.contract_type == "General") {
            frappe.call({
                method: "it_services.it_services.doctype.it_contract.it_contract.check_general_contract",
                args: {
                    "customer": frm.doc.customer,
                },

                callback: function (r) {
                    if (r.message) {
                        frappe.msgprint("Custom can only have one General contract.");
                        frappe.validated = false;
                    }
                }
            });
        }
		
    },

    "contract_type": function (frm) {
        frm.refresh_field("customer");
        frm.refresh_field("contract_type");
        if (frm.doc.customer && frm.doc.contract_type == "General") {
            frappe.call({
                method: "it_services.it_services.doctype.it_contract.it_contract.check_general_contract",
                args: {
                    "customer": frm.doc.customer,
                },

                callback: function (r) {
                    if (r.message) {
                        frappe.msgprint("Custom can only have one General contract.");
                        frappe.validated = false;
                    }
                }
            });
        }
    },

    before_save: function (frm) {
        frm.refresh_field("customer");

        frm.refresh_field("contract_type");
        //general_contract_exist = 0;
        if (frm.doc.customer && frm.doc.contract_type == "General") {
            if (cur_frm.is_new()) {
                frappe.call({
                    method: "it_services.it_services.doctype.it_contract.it_contract.check_general_contract",
                    args: {
                        "customer": frm.doc.customer,
                    },

                    callback: function (r) {
                        if (r.message) {
                            frappe.msgprint("Custom can only have one General contract.");
                            frappe.validated = false;
                        }
                    }
                });
            }

        }
    },

    "contract_end_date": function (frm) {
        if (frm.doc.contract_end_date) {

            if (new Date(frm.doc.contract_end_date) < new Date(frm.doc.contract_start_date)) {
                frm.doc.contract_end_date = "";
                frm.refresh_field("contract_end_date");
                frappe.msgprint("End date should be after Start Date.");
            }
        }
    },
    validate: function (frm) {
        var non_billable_items=[];
        console.log(frm.doc.it_item_minimum_billing_increment_table);
        if(frm.doc.it_item_minimum_billing_increment_table){
            for(var i=0;i<frm.doc.it_item_minimum_billing_increment_table.length;i++){
            if(frm.doc.it_item_minimum_billing_increment_table[i].non_billable){
                non_billable_items.push(frm.doc.it_item_minimum_billing_increment_table[i].item);
            }
        }
        }

        if(non_billable_items.length){
            frappe.call({
                method:"it_services.it_services.doctype.it_contract.it_contract.make_billable_to_non_billable_items",
                args:{
                    'non_billable_items':non_billable_items,
                    'contract': frm.doc.name
                },
            })
        }

    }

});
frappe.ui.form.on('IT Contract Detail Charge', {

    'rate': function (frm) {
        for (var i = 0; i < frm.doc.recurring_charges_table.length; i++) {
            if (frm.doc.recurring_charges_table[i].quantity) {
                frm.doc.recurring_charges_table[i].amount = frm.doc.recurring_charges_table[i].quantity * frm.doc.recurring_charges_table[i].rate;
                frm.refresh_field("recurring_charges_table");
            }
        }
    },
    'quantity': function (frm) {
        for (var i = 0; i < frm.doc.recurring_charges_table.length; i++) {
            if (frm.doc.recurring_charges_table[i].rate) {
                frm.doc.recurring_charges_table[i].amount = frm.doc.recurring_charges_table[i].quantity * frm.doc.recurring_charges_table[i].rate;
                frm.refresh_field("recurring_charges_table");

            }
        }
    },
    "item_code": function (frm, cdt, cdn) {

        console.log(locals[cdt][cdn]);
        if (locals[cdt][cdn].item_code) {
            frappe.call({
                method: 'it_services.it_services.doctype.it_contract.it_contract.get_item_price',
                args: {
                    'name': locals[cdt][cdn].item_code
                },
                callback: function (r) {
                    locals[cdt][cdn].rate = r.message;
                    locals[cdt][cdn].amount = locals[cdt][cdn].quantity * locals[cdt][cdn].rate;
                    frm.refresh_field("recurring_charges_table");
                }
            })
            frappe.call({
                method: 'it_services.it_services.doctype.it_contract.it_contract.get_item_description',
                args: {
                    'name': locals[cdt][cdn].item_code
                },
                callback: function (r) {
                    locals[cdt][cdn].item_description = r.message;
                    frm.refresh_field("recurring_charges_table");
                }
            })
        }


    }
});