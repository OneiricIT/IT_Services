# -*- coding: utf-8 -*-
import frappe
import datetime
def daily():
    completed_contracts=frappe.db.sql("""Select name from `tabIT Contract` where contract_end_date=%s""",(str(datetime.date(datetime.datetime.now().year, datetime.datetime.now().month, datetime.datetime.now().day))))
    for completed in completed_contracts:
        frappe.db.sql("""Update `tabIT Contract` set docstatus=1,workflow_state='Completed' where name=%s""",(completed))
