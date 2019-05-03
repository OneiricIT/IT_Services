# -*- coding: utf-8 -*-
# Copyright (c) 2018, Oneiric Group Pty Ltd and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
import json
class ITContract(Document):
	pass

@frappe.whitelist()
def check_general_contract(customer):
	if len(frappe.db.sql("""Select name from `tabIT Contract` where contract_type='General' and customer=%s""",(customer))):
		return 1


def hide_completed_or_canceled_contracts(user):
	if user == "Administrator":
		return ""

	else:
		return """(`tabIT Contract`.workflow_state not in ('Completed'))"""
@frappe.whitelist()
def check_duplicate_name(amended_from):
	count=0
	while amended_from:
		if len(frappe.db.sql("""Select name from `tabIT Contract` where amended_from=%s""",(amended_from))):
			if frappe.db.sql("""Select name from `tabIT Contract` where amended_from=%s""",(amended_from))[0][0]!=None:
				amended_from=frappe.db.sql("""Select name from `tabIT Contract` where amended_from=%s""",(amended_from))[0][0]
				count+=1
			else:
				amended_from=0
		else:
			amended_from=0
	return count



@frappe.whitelist()
def get_item_price(name):
	if len(frappe.db.sql("""Select price_list_rate from `tabItem Price` where item_code=%s""",(name)))>0:
		return frappe.db.sql("""Select price_list_rate from `tabItem Price` where item_code=%s""",(name))[0][0]

@frappe.whitelist()
def make_billable_to_non_billable_items(non_billable_items,contract):
	data = json.loads(non_billable_items.decode("utf-8")) if (non_billable_items.decode('utf-8')) else {}
	print(data)
	for ii in frappe.db.sql("""Select name from `tabIT Ticket` where contract=%s""",(contract)):
		for i in data:
			print(i)
			frappe.db.sql("""Update `tabIT Ticket Detail` set billable_check=0 where item_code=%s and parent=%s""",(i,ii[0]))


@frappe.whitelist()
def get_item_description(name):
	if len(frappe.db.sql("""Select description from `tabItem` where name=%s""",(name)))>0:
		return frappe.db.sql("""Select description from `tabItem` where name=%s""",(name))[0][0]