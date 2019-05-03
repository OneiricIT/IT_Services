frappe.ui.form.on('Quotation', 'refresh', function (frm) {
    if (frm.is_new()) {
        if (window.ticket) {
            frm.doc.it_ticket_source = window.ticket;
            frm.refresh_field("it_ticket_source");
            frm.doc.customer = window.customer;
            frm.refresh_field("customer");
            frm.doc.contact_person = window.contact;
            frm.refresh_field("contact_person");
            frm.doc.customer_address = window.address;
            frm.refresh_field("customer_address");
            if (frm.doc.contact) {
            frappe.call({
               method: "frappe.contacts.doctype.contact.contact.get_contact_details",
                   args: {
                   contact: frm.doc.contact
                   },
                   callback: function (r) {
                       if (r.message) {
                           frm.set_value('contact_display', r.message.contact_display);
                           
                           }
                   }
            })
        }
        erpnext.utils.get_address_display(frm, 'address', 'address_display');
        }
    }
});