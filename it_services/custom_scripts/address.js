frappe.ui.form.on('Address', 'before_save', function (frm) {
        if(!frm.doc.address_title){
            frm.doc.address_title=frm.doc.address_type;
        }
});