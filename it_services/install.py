import frappe


def after_install():
    default_company = frappe.db.sql(
        """Select value from `tabSingles` where doctype='Global Defaults' and field='default_company'""")

    if default_company:
        default_company = default_company[0][0]

        domain = frappe.db.sql("""Select `domain` from `tabCompany` where name=%s""", (default_company))

        if domain:
            domain = domain[0][0]

            if domain in "Services":
                frappe.db.sql("""Update `tabDocType` set restrict_to_domain=NULL where module='IT Services'""")

            else:
                frappe.db.sql("""Update `tabDocType` set restrict_to_domain='IT Service' where module='IT Services'""")

            frappe.clear_cache()
