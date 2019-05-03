# -*- coding: utf-8 -*-
# Copyright (c) 2018, Oneiric Group Pty Ltd and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import json

import frappe
from erpnext.selling.doctype.sales_order.sales_order import make_delivery_note
from erpnext.stock.utils import get_latest_stock_qty
from frappe.model.document import Document
import datetime

class ITTicket(Document):
    pass


@frappe.whitelist()
def get_default_contract(customer, type):
    if "General" in type:

        return frappe.db.sql("""Select name from `tabIT Contract` where customer=%s and contract_type='General'""",
                             (customer))
    else:

        return frappe.db.sql("""Select name from `tabIT Contract` where customer=%s and contract_type=%s""",
                             (customer, type))


@frappe.whitelist()
def get_ticket_details_columns():
    return frappe.db.sql(
        """Select label,fieldname from `tabDocField` where parent='IT Ticket Detail' and fieldtype != 'Section Break' and fieldtype != 'HTML' and fieldtype != 'Attach Image' and fieldtype != 'Column Break' and fieldtype != 'Table'""")


@frappe.whitelist()
def get_user_name(email):
    fullname = ""
    name = frappe.db.sql("""Select first_name,middle_name,last_name from `tabUser` where name=%s""", (email))
    for n in name:
        fullname += n[0] + " "
    return fullname


@frappe.whitelist()
def get_user_names(emails):
    data = json.loads(emails) if (emails) else {}
    fullnames = []
    fullname = ""
    for email in data:
        name = frappe.db.sql("""Select first_name,middle_name,last_name from `tabUser` where name=%s""", (email))
        for n in name:
            fullname += n[0] + " "
        fullnames.append(fullname)
        fullname = ""
    return fullnames


@frappe.whitelist()
def check_contact_is_linked(contact, customer):
    if len(frappe.db.sql(
            """Select name from `tabDynamic Link` where parent=%s and link_doctype='Customer' and parenttype='Contact' and link_name=%s""",
            (contact, customer))) == 0:
        link = frappe.get_doc({
            'doctype': "Dynamic Link",
            'parent': contact,
            'link_doctype': 'Customer',
            'parenttype': 'Contact',
            'parentfield': 'links',
            'link_name': customer
        })
        link.insert(ignore_permissions=True)

@frappe.whitelist()
def check_address_is_linked(address, customer):
    if len(frappe.db.sql(
            """Select name from `tabDynamic Link` where parent=%s and link_doctype='Customer' and parenttype='Address' and link_name=%s""",
            (address, customer))) == 0:
        link = frappe.get_doc({
            'doctype': "Dynamic Link",
            'parent': address,
            'link_doctype': 'Customer',
            'parenttype': 'Address',
            'parentfield': 'links',
            'link_name': customer
        })
        link.insert(ignore_permissions=True)



@frappe.whitelist()
def check_delivery_conditions(ticket_name, sales_order):
    returned = 0

    #check if the item is created through ticket and is stock item
    # items_that_are_create_to_this_ticket = frappe.db.sql(
    #     """Select name from `tabItem` where created_through_ticket=1 and parent_ticket=%s and is_stock_item=1""",
    #     (ticket_name))

    # if len(items_that_are_create_to_this_ticket) > 0:
    #     returned = 1
    linked_sales_order_item = frappe.db.sql("""Select item_code from `tabSales Order Item` where parent=%s""",
                                            (sales_order))

    for item in linked_sales_order_item:
        print(frappe.db.sql("""Select name from `tabItem` where name=%s and is_stock_item=1""", (item[0])))
        if len(frappe.db.sql("""Select name from `tabItem` where name=%s and is_stock_item=1""", (item[0]))) > 0:
            returned = 1
    return returned

@frappe.whitelist()
def get_deliverables(sales_order):
    items = frappe.db.sql(
        """Select soi.item_code,soi.description,soi.qty,soi.name from `tabSales Order Item` as soi where soi.parent=%s """,
        (sales_order))
    tobe_delivered = ()
    for i in items:

        if len(frappe.db.sql("""Select qty from `tabDelivery Note Item` where so_detail=%s and docstatus=1""", (i[3])))==0:
            tobe_delivered += ((i),)
        elif len(frappe.db.sql("""Select qty from `tabDelivery Note Item` where so_detail=%s  and docstatus=1""", (i[3])))==1:
            for ii in frappe.db.sql("""Select qty from `tabDelivery Note Item` where so_detail=%s  and docstatus=1""", (i[3])):
                if ii[0] != i[2]:
                    lst = list(i)
                    lst[2] = i[2] - ii[0]
                    i = tuple(lst)
                    tobe_delivered += ((i),)
        elif len(frappe.db.sql("""Select qty from `tabDelivery Note Item` where so_detail=%s and docstatus=1""", (i[3])))>1:
            actual_qty=0
            for ii in frappe.db.sql("""Select qty from `tabDelivery Note Item` where so_detail=%s and docstatus=1""", (i[3])):
                actual_qty+=ii[0]
            if actual_qty != i[2]:
                for iii in frappe.db.sql("""Select qty from `tabDelivery Note Item` where so_detail=%s and docstatus=1""", (i[3])):
                    lst = list(i)
                    lst[2] = i[2] - iii[0]
                    i = tuple(lst)
                tobe_delivered += ((i),)


    return tobe_delivered

@frappe.whitelist()
def get_contact(customer):
    contact = frappe.db.sql(
        """Select parent from `tabDynamic Link` where link_name=%s and link_doctype='Customer' and parenttype='Contact'""",
        (customer))
    if len(contact) > 0:
        return contact[0][0]


@frappe.whitelist()
def get_address(customer):
    address = frappe.db.sql(
        """Select parent from `tabDynamic Link` where link_name=%s and link_doctype='Customer' and parenttype='Address'""",
        (customer))
    if len(address) > 0:
        return address[0][0]


@frappe.whitelist()
def deliver(so_item_names, receiver, signature, comments):
    data = json.loads(so_item_names) if (so_item_names) else {}
    parent_sales_orders = []
    to_be_removed=[]
    actual_data_ids=[]
    print('dkdaskkkkk')
    for s_item_name in data:
        for so in frappe.db.sql("""Select parent from `tabSales Order Item` where name=%s""", (s_item_name['id'])):
            parent_sales_orders.append(so[0])
        actual_data_ids.append(s_item_name['id'])
    delivery_note_names=[]

    for so in list(set(parent_sales_orders)):
        print(so)
        print('ssssssoooooooooo')
        dn = make_delivery_note(so)
        print(dn.items)
        for item in dn.items:
            print(item.so_detail)
            # print(item.so_detail not in actual_data_ids)
            # print(actual_data_ids)
            if item.so_detail not in actual_data_ids:
                to_be_removed.append(item)

    for i in to_be_removed:
        
        dn.items.remove(i)


    for item in dn.items:
        for qty in data:
            if qty['id'] in item.so_detail:
                item.qty = qty['qty']

    dn.it_receiver_name = receiver
    dn.docstatus = 1
    dn.it_signature=signature
    dn.it_comments=comments
    dn.save()
    delivery_note_names.append(dn.name)
    print(delivery_note_names)
    print('dddddddd')
    return delivery_note_names

def count_time_entries():
    times=frappe.db.sql("""Select start_time,end_time,date,name from `tabIT Ticket Detail` where time_entry_status='Start'""")
    for i in times:

        if datetime.datetime.now().date()==i[2]:
            i[1]-datetime.timedelta(hours=datetime.datetime.now().time().hour,minutes=datetime.datetime.now().time().minute,seconds=datetime.datetime.now().time().second)

@frappe.whitelist()
def check_if_billed(ticket_activity_name):
    if(len(frappe.db.sql("""Select name from `tabSales Invoice Item` where it_ticket_activity_item=%s""",(ticket_activity_name)))>0):
        return 1
    else:
        return 0

@frappe.whitelist()
def check_if_billed_new_datatable(ticket_activity_names):
    data = json.loads(ticket_activity_names) if (ticket_activity_names) else {}
    billed=[]
    for ticket_activity_name in data:
        if(len(frappe.db.sql("""Select name from `tabSales Invoice Item` where it_ticket_activity_item=%s""",(ticket_activity_name)))>0):
            billed.append({'name':ticket_activity_name,'billed':1})
        else:
            billed.append({'name':ticket_activity_name,'billed':0})
    return billed

def check_if_can_be_deleted(doc,event):
    if len(frappe.db.sql("""Select name from `tabIT Ticket Detail` where billable_check=1 and parent=%s""",(doc.name)))>0:
        frappe.throw("Ticket cannot be deleted due to billable ticket activities.")

@frappe.whitelist()
def item_code_filter_for_time_entry(doctype, txt, searchfield, start, page_len, filters):
    if txt!=None:
        return frappe.db.sql("""Select name,item_name from `tabItem` where stock_uom='Hour' and name LIKE %s""",'%'+txt+'%')
    else:
        return frappe.db.sql("""Select name,item_name from `tabItem` where stock_uom='Hour'""")

@frappe.whitelist()
def item_code_filter_for_new_product(doctype, txt, searchfield, start, page_len, filters):
    if txt!=None:
        return frappe.db.sql("""Select name,item_name from `tabItem` where stock_uom!='Hour' and name LIKE %s""",'%'+txt+'%')
    else:
        return frappe.db.sql("""Select name,item_name from `tabItem` where stock_uom!='Hour'""")

@frappe.whitelist()
def get_billable_time(contract,billable_time,item_code):
    billable=0
    if len(frappe.db.sql("""Select stock_uom from `tabItem` where name=%s""", (item_code))) > 0:
        if frappe.db.sql("""Select stock_uom from `tabItem` where name=%s""", (item_code))[0][0] == "Hour":

            if len(frappe.db.sql(
                    """Select minimum_billing_increment from `tabIT Item Minimum Billing Increment` where item=%s and parent=%s""",
                    (item_code, contract))) > 0:

                minimum_charge = frappe.db.sql(
                    """Select minimum_billing_increment from `tabIT Item Minimum Billing Increment` where item=%s and parent=%s""",
                    (item_code, contract))[0][0]
                print('1st')

                billable = float(minimum_charge)
            elif len(frappe.db.sql(
                    """Select value from `tabSingles` where doctype='IT Services Setup' and field='default_rounding_of_time_hours'""")) > 0:
                print('2nd')

                minimum_charge = frappe.db.sql(
                    """Select value from `tabSingles` where doctype='IT Services Setup' and field='default_rounding_of_time_hours'""")[
                    0][0]
                print(float(minimum_charge) > float(str(billable_time).strip(',')))

                billable = float(minimum_charge)
    if billable!=0:
        return billable

@frappe.whitelist()
def get_contact_email_address(name):
    if len(frappe.db.sql("""Select email_id from `tabContact` where name=%s""",(name)))>0:
        return frappe.db.sql("""Select email_id from `tabContact` where name=%s""",(name))[0][0]

@frappe.whitelist()
def get_user_email(user):
    return frappe.db.sql("""Select email from `tabUser` where name=%s""",(user))[0][0]
@frappe.whitelist()
def get_global_overrides(billable_time,item_code):
    billable = 0
    if len(frappe.db.sql("""Select stock_uom from `tabItem` where name=%s""", (item_code))) > 0:
        if frappe.db.sql("""Select stock_uom from `tabItem` where name=%s""", (item_code))[0][0] == "Hour":

            if len(frappe.db.sql(
                    """Select minimum_billing_increment from `tabIT Item Minimum Billing Increment` where item=%s and parent=%s""",
                    (item_code, "IT Services Setup"))) > 0:

                minimum_charge = frappe.db.sql(
                    """Select minimum_billing_increment from `tabIT Item Minimum Billing Increment` where item=%s and parent=%s""",
                    (item_code, "IT Services Setup"))[0][0]
                print('1st')

                billable = float(minimum_charge)
            elif len(frappe.db.sql(
                    """Select value from `tabSingles` where doctype='IT Services Setup' and field='default_rounding_of_time_hours'""")) > 0:
                print('2nd')

                minimum_charge = frappe.db.sql(
                    """Select value from `tabSingles` where doctype='IT Services Setup' and field='default_rounding_of_time_hours'""")[
                    0][0]
                print(float(minimum_charge) > float(str(billable_time).strip(',')))

                billable = float(minimum_charge)
    if billable != 0:
        return billable

@frappe.whitelist()
def check_if_hours_uom(item):
    print(item)
    if len(frappe.db.sql("""Select name from `tabItem` where name=%s""",(item)))>0:
        if len(frappe.db.sql("""Select name from `tabItem` where stock_uom='Hour' and name=%s""",(item)))>0:
            return 1
    else:
        return 1

@frappe.whitelist()
def get_hours_included_and_item_overrides(contract):
    returnvar=[]
    returnvar.append(frappe.db.sql("""Select contract_hours_included from `tabIT Contract` where name=%s""",(contract)))
    returnvar.append(frappe.db.sql("""Select item,included_in_block_of_time_hours from `tabIT Item Minimum Billing Increment` where parent=%s""",(contract)))
    return returnvar

@frappe.whitelist()
def get_total_hours_used(contract,billable_time,name):
    hours_included=frappe.db.sql("""Select contract_hours_included from `tabIT Contract` where name=%s""",(contract))
    item_overrides=frappe.db.sql("""Select item,included_in_block_of_time_hours from `tabIT Item Minimum Billing Increment` where parent=%s""",(contract))
    tickets=frappe.db.sql("""Select name from `tabIT Ticket` where contract=%s""",(contract))
    if not name:
        total=float(billable_time)
    else:
        total=0
    for i in tickets:
        activities=frappe.db.sql("""Select name,item_code,billable_time from `tabIT Ticket Detail` where parent=%s""",(i[0]))
        for ii in activities:
            for iii in item_overrides:
                if not name:
                    if ii[1]==iii[0] and iii[1]:
                        total+=float(ii[2])
                else:
                    if ii[0]==name:
                        total+=(float(billable_time)-float(ii[2]))
                    else:
                        total+=float(ii[2])


    if len(hours_included)>0:
        if total<=float(hours_included[0][0]):
            frappe.db.sql("""Update `tabIT Contract` set hours_used=%s where name=%s""",(total,contract))
            return 1
        else:

            print(total)

            return 0
    else:
        return 1
@frappe.whitelist()
def get_if_billable(item,contract):
    block_of_time = 0
    minimum_billing=frappe.db.sql("""Select non_billable,included_in_block_of_time_hours from `tabIT Item Minimum Billing Increment` where parent=%s and parentfield='it_item_minimum_billing_increment_table' and parenttype='IT Contract' and item=%s""",(contract, item))
    for i in frappe.db.sql("""Select contract_hours_included,hours_used from `tabIT Contract` where name=%s and contract_type='Block of Time'""",(contract)):
        print('-----------------------------------')

        for ii in minimum_billing:
            block_of_time = 1

            if ii[1]:
                if i[0] == i[1]:
                    return 1
                else:
                    return 0
            elif ii[0]:
                return 0
            else:
                return 1
    if block_of_time == 0:
        if len(frappe.db.sql(
                """Select non_billable from `tabIT Item Minimum Billing Increment` where parent=%s and parentfield='it_item_minimum_billing_increment_table' and parenttype='IT Contract' and item=%s""",
                (contract, item))) > 0:
            if frappe.db.sql(
                    """Select non_billable from `tabIT Item Minimum Billing Increment` where parent=%s and parentfield='it_item_minimum_billing_increment_table' and parenttype='IT Contract' and item=%s""",
                    (contract, item))[0][0]:
                return 0
            else:
                return 1
        else:
            return 1


@frappe.whitelist()
def completed_sent(name):
    frappe.db.sql("""Update `tabIT Ticket` set complete_email_sent=1 where name=%s""",(name))

@frappe.whitelist()
def check_if_send_email_and_get_email_template_for_new_tickets(purpose):
    if purpose=='new ticket':
        if len(frappe.db.sql(
            """Select value from `tabSingles` where doctype='IT Services Setup' and field='alert_on_new_ticket_check'"""))>0:
            if len(frappe.db.sql(
                """Select value from `tabSingles` where doctype='IT Services Setup' and field='new_ticket_email_template'"""))>0:
                return frappe.db.sql(
                """Select value from `tabSingles` where doctype='IT Services Setup' and field='new_ticket_email_template'""")[0][0]
    elif purpose=='new activity':
        if len(frappe.db.sql(
            """Select value from `tabSingles` where doctype='IT Services Setup' and field='alert_on_ticket_update_check'"""))>0:
            if len(frappe.db.sql(
                """Select value from `tabSingles` where doctype='IT Services Setup' and field='ticket_update_email_template'"""))>0:
                return frappe.db.sql(
                """Select value from `tabSingles` where doctype='IT Services Setup' and field='ticket_update_email_template'""")[0][0]
    elif purpose=='completed':
        if len(frappe.db.sql(
            """Select value from `tabSingles` where doctype='IT Services Setup' and field='alert_on_ticket_completion_check'"""))>0:
            if len(frappe.db.sql(
                """Select value from `tabSingles` where doctype='IT Services Setup' and field='ticket_completed_email_template'"""))>0:
                return frappe.db.sql(
                """Select value from `tabSingles` where doctype='IT Services Setup' and field='ticket_completed_email_template'""")[0][0]

@frappe.whitelist()
def get_item_description_qty_price_uom(item):
    if len(frappe.db.sql("""Select description,stock_uom from `tabItem` where name=%s""",(item)))>0:
        return [frappe.db.sql("""Select description,stock_uom from `tabItem` where name=%s""",(item))[0],1,frappe.db.sql("""Select price_list_rate from `tabItem Price` where item_code=%s and price_list='Standard Selling'""",(item))]
