from __future__ import unicode_literals
from frappe import _

def get_data():
	return [
		{
			"label": _("Support"),
			"items": [
				{
					"type": "doctype",
					"doctype": "IT Services",
					"name": "IT Ticket",
					"label": _("Ticket"),
				},
				{
					"type": "doctype",
					"doctype": "IT Services",
					"name": "IT Scheduler",
					"label": _("Scheduler"),
				},
			]
		},
		{
			"label": _("Accounts"),
			"items": [
				{
					"type": "doctype",
					"doctype": "IT Services",
					"name": "IT Invoice Processing",
					"label": _("Invoice Processing"),
				},
			]
		},
		{
			"label": _("Setup"),
			"items": [
				{
					"type": "doctype",
					"doctype": "IT Services",
					"name": "IT SLA",
					"label": _("Service Level Agreement"),
				},
				{
					"type": "doctype",
					"doctype": "IT Services",
					"name": "IT Contract",
					"label": _("Contract"),
				},
				{
					"type": "doctype",
					"doctype": "IT Services",
					"name": "IT Services Setup",
					"label": _("IT Services Setup"),
				},
			]
		},
	]
