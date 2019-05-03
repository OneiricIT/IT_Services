# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from . import __version__ as app_version

app_name = "it_services"
app_title = "IT Services"
app_publisher = "Oneiric Group Pty Ltd"
app_description = "IT Services Module"
app_icon = "octicon octicon-file-directory"
app_color = "grey"
app_email = "erp@oneiric.com.au"
app_license = "MIT"



# fixtures = [
# {"dt":"Domain", "filters": {"name": "IT Services"}}
# ]

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "assets/it_services/css/frappe-datatable.min.css"
app_include_js = ["assets/it_services/js/signature.js"]

# include js, css files in header of web template
# web_include_css = "assets/it_services/css/frappe-datatable.min.css"
# web_include_js = "/assets/it_services/js/it_services.js"

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
doctype_js = {
"Quotation" : "custom_scripts/quotation.js",
"Sales Order" : "custom_scripts/sales_order.js",
"Address" : "custom_scripts/address.js",
}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
#	"Role": "home_page"
# }

# Website user home page (by function)
# get_website_user_home_page = "it_services.utils.get_home_page"

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Installation
# ------------

# before_install = "it_services.install.before_install"
after_install = "it_services.install.after_install"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "it_services.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

permission_query_conditions = {
	"IT Contract": "it_services.it_services.doctype.it_contract.it_contract.hide_completed_or_canceled_contracts",
}
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# Document Events
# ---------------
# Hook on document methods and events

doc_events = {
	# "Address": {
	# 	"before_save": "it_services.it_services.doctype.it_ticket.it_ticket.address_title",
    #
	# }
	"IT Ticket":{
		"on_trash": "it_services.it_services.doctype.it_ticket.it_ticket.check_if_can_be_deleted"
	},
	"Version": {
		"before_save": "it_services.it_services.doctype.it_invoice_processing.it_invoice_processing.submit_and_create_draft_invoice",
	},



}

# Scheduled Tasks
# ---------------

scheduler_events = {
	# "all": [
	# 	"it_services.tasks.all"
	# ],
	"daily": [
		"it_services.tasks.daily"
	],
	# "hourly": [
	# 	"it_services.tasks.hourly"
	# ],
	# "weekly": [
	# 	"it_services.tasks.weekly"
	# ]
	# "monthly": [
	# 	"it_services.tasks.monthly"
	# ]
}

# Testing
# -------

# before_tests = "it_services.install.before_tests"

# Overriding Whitelisted Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "it_services.event.get_events"
# }

fixtures = [
 {"dt":"List Filter", "filters": {"reference_doctype": "IT Ticket"}},
 "Workflow",
 "Workflow State",
 "Workflow Action Master",
 "Role"]