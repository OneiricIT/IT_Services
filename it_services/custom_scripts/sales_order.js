cur_frm.dashboard.add_transactions([
		{
			'items': [
				'IT Ticket'
			],
			'label': 'Reference'
		}
	]);

frappe.ui.form.on('Sales Order', 'refresh', function (frm) {
    if(!cur_frm.is_new()){
	frm.add_custom_button("Create Ticket", function () {


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
                        window.so = frm.doc.name;
                        window.source = "Sales Order";
                        window.customer = frm.doc.customer;
                        window.contact = frm.doc.contact_person;
                        window.use_global_contract = 1;
                        window.address = r.message;
                        setTimeout(function () {
                            frappe.new_doc("IT Ticket");

                        }, 500)
                    }
                })
            }
        })


    })
    }

});
frappe.ui.form.on('Sales Order', 'after_save', function (frm) {
    frappe.call({
        method: "it_services.it_services.doctype.it_invoice_processing.it_invoice_processing.check_if_updated_total",
        args: {
            'name': frm.doc.name,
            'grand_total': frm.doc.grand_total
        },

    })
});
