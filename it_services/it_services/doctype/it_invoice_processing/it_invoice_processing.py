# -*- coding: utf-8 -*-
# Copyright (c) 2018, Oneiric Group Pty Ltd and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import datetime
import json
import sys
import frappe
from frappe.model.document import Document
from frappe.email.queue import send_one


class ITInvoiceProcessing(Document):
    pass


@frappe.whitelist()
def get_active_contracts(start, end, invoice_processing_name, posting_date, customer):
    active_contracts_with_end_dates = ()
    active_contracts_with_no_end_dates = ()
    if not customer:
        active_contracts_with_end_dates = frappe.db.sql(
            """Select name from `tabIT Contract` where workflow_state!='Completed' and ((contract_start_date>=%s or contract_end_date<=%s) or (contract_start_date<=%s and contract_end_date>=%s)) and contract_start_date IS NOT NULL and contract_end_date IS NOT NULL""",
            (start, end, start, end))
        active_contracts_with_no_end_dates = frappe.db.sql(
            """Select name from `tabIT Contract` where workflow_state!='Completed' and contract_start_date IS NOT NULL and contract_end_date IS NULL or contract_end_date='' """)
    else:
        active_contracts_with_end_dates = frappe.db.sql(
            """Select name from `tabIT Contract` where workflow_state!='Completed' and customer=%s and ((contract_start_date>=%s or contract_end_date<=%s) or (contract_start_date<=%s and contract_end_date>=%s)) and contract_start_date IS NOT NULL and contract_end_date IS NOT NULL""",
            (customer, start, end, start, end))
        active_contracts_with_no_end_dates = frappe.db.sql(
            """Select name from `tabIT Contract` where workflow_state!='Completed' and contract_start_date IS NOT NULL and customer=%s and contract_end_date IS NULL or contract_end_date='' """,
            (customer))
    print(active_contracts_with_end_dates)
    print(active_contracts_with_no_end_dates)
    active_contracts_with_no_end_dates_charges = []
    charges_for_with_end_dates_charges = []
    to_be_invoiced_ticket_charges = []
    if "Some activity items don't have item price." in to_be_invoiced_ticket_charges:
        return 2
    ticket_active_contracts=[]
    charges_for_no_end_dates = calculate_active_contracts_with_no_dates_charges(active_contracts_with_no_end_dates,
                                                                                invoice_processing_name, start, end,
                                                                                active_contracts_with_no_end_dates_charges,ticket_active_contracts)
    charges_for_with_end_dates = calculate_active_contracts_with_dates_charges(active_contracts_with_end_dates,
                                                                               invoice_processing_name, start, end,
                                                                               charges_for_with_end_dates_charges,ticket_active_contracts)
    to_be_invoiced_ticket_charges = ticket_charged(to_be_invoiced_ticket_charges,customer, ticket_active_contracts,[])

    print(charges_for_no_end_dates)
    print(charges_for_with_end_dates)
    default_company = frappe.db.sql("""Select defvalue from `tabDefaultValue` where defkey='company'""")[0][0]
    default_currency = frappe.db.sql("""Select defvalue from `tabDefaultValue` where defkey='currency'""")[0][0]
    items = []
    invoice_s = []
    invoice_created = []
    if to_be_invoiced_ticket_charges != None and to_be_invoiced_ticket_charges:
        invoice_s = create_invoice(to_be_invoiced_ticket_charges, end, default_company, default_currency, posting_date,
                                   invoice_s, invoice_processing_name)
        for i in invoice_s:

            for ii in frappe.get_all('Sales Invoice', filters={'name': i}, fields={'customer', 'grand_total'}):

                invoice_created.append({'customer': ii['customer'], 'grand_total': ii['grand_total'], 'name': i})
    if charges_for_with_end_dates != None and charges_for_with_end_dates:
        invoice_s = create_invoice(charges_for_with_end_dates, end, default_company, default_currency, posting_date,
                                   invoice_s, invoice_processing_name)
        for i in invoice_s:

            for ii in frappe.get_all('Sales Invoice', filters={'name': i}, fields={'customer', 'grand_total'}):

                invoice_created.append({'customer': ii['customer'], 'grand_total': ii['grand_total'], 'name': i})
    if charges_for_no_end_dates != None and charges_for_no_end_dates:
        invoice_s = create_invoice(charges_for_no_end_dates, end, default_company, default_currency, posting_date,
                                   invoice_s, invoice_processing_name)
        for i in invoice_s:

            for ii in frappe.get_all('Sales Invoice', filters={'name': i}, fields={'customer', 'grand_total'}):

                invoice_created.append({'customer': ii['customer'], 'grand_total': ii['grand_total'], 'name': i})
    return invoice_created


def calculate_active_contracts_with_no_dates_charges(active_contracts_with_no_end_dates, invoice_processing_name, start,
                                                     end, to_be_invoiced_charges,ticket_active_contracts):
    # start = datetime.date(int(start.split('-')[0]), int(start.split('-')[1]), int(start.split('-')[2]))
    # end = datetime.date(int(end.split('-')[0]), int(end.split('-')[1]), int(end.split('-')[2]))

    for contract in active_contracts_with_no_end_dates:
        contract_start_date = frappe.db.sql("""Select contract_start_date from `tabIT Contract` where name=%s""",
                                            (contract[0]))

        invoice_processing_date_range = 0
        days_to_be_charged = 0
        invoice_processing_date_range = end - start
        invoice_processing_date_range = str(invoice_processing_date_range.days + 1)
        for contract_s_date in contract_start_date:
            if contract_s_date[0] >= start and contract_s_date[0]<=end:
                days_to_be_charged = end - contract_s_date[0]
                days_to_be_charged = str(days_to_be_charged.days + 1)
            elif contract_s_date[0] <= start:
                days_to_be_charged = end - start
                days_to_be_charged = str(days_to_be_charged.days + 1)

            #                 # to_be_invoiced_charges = ticket_charged(contract, to_be_invoiced_charges)
            charges = frappe.db.sql(
                """Select item_code,amount,quantity,rate,start_date,end_date,item_description from `tabIT Contract Detail Charge` where parent=%s""",
                (contract[0]))
            customer = frappe.db.sql("""Select customer from `tabIT Contract` where name=%s""", (contract[0]))[0][0]

            for amount in charges:
                if amount[4] and amount[5]:
                    if amount[4] <= start and (
                                    amount[5] <= end and amount[5] > start):
                        print(5)
                        print(amount[5])
                        print(invoice_processing_name)
                        days_to_be_charged = amount[5] - start
                        print(days_to_be_charged.days + 1)
                        days_to_be_charged = days_to_be_charged.days + 1

                        to_be_invoiced_charges.append({'days_to_charged': str(days_to_be_charged) + '/' + str(
                            invoice_processing_date_range) + ' days', 'charge': (float(days_to_be_charged) / float(
                            invoice_processing_date_range)) * int(amount[1]),
                                                       'item': amount[0], 'qty': amount[2], 'rate': amount[3],
                                                       'customer': customer, 'amount': amount[1],
                                                       'it_ticket_activity_item': '', 'description': amount[6]})
                        if contract[0] not in ticket_active_contracts:
                            ticket_active_contracts.append(contract[0])
                    elif amount[4] >= start and amount[5] <= end:
                        # start and end sa contract is within the invoice date range
                        print(6)

                        days_to_be_charged = amount[5] - amount[4]
                        print(days_to_be_charged.days + 1)
                        days_to_be_charged = days_to_be_charged.days + 1

                        to_be_invoiced_charges.append(
                            {'days_to_charged': str(days_to_be_charged) + '/' + str(
                                invoice_processing_date_range) + ' days',
                             'charge': (float(days_to_be_charged) / float(invoice_processing_date_range)) * int(
                                 amount[1]),
                             'item': amount[0], 'qty': amount[2], 'rate': amount[3], 'customer': customer,
                             'amount': amount[1], 'it_ticket_activity_item': '', 'description': amount[6]})
                        if contract[0] not in ticket_active_contracts:
                            ticket_active_contracts.append(contract[0])
                    elif (amount[4] >= start and amount[4] < end) and amount[5] >= end:
                        # contract end date is after the invoice end date
                        print(7)

                        print(invoice_processing_name)
                        days_to_be_charged = end - amount[4]
                        print(days_to_be_charged.days + 1)
                        days_to_be_charged = days_to_be_charged.days + 1

                        to_be_invoiced_charges.append(
                            {'days_to_charged': str(days_to_be_charged) + '/' + str(
                                invoice_processing_date_range) + ' days',
                             'charge': (float(days_to_be_charged) / float(invoice_processing_date_range)) * int(
                                 amount[1]),
                             'item': amount[0], 'qty': amount[2], 'rate': amount[3], 'customer': customer,
                             'amount': amount[1], 'it_ticket_activity_item': '', 'description': amount[6]})
                        if contract[0] not in ticket_active_contracts:
                            ticket_active_contracts.append(contract[0])
                    elif amount[4] <= start and amount[5] >= end:
                        # contract start is before the invoice start and contract end date is after invoice end date
                        print(8)

                        print(invoice_processing_name)
                        days_to_be_charged = end - start
                        print(days_to_be_charged.days + 1)
                        days_to_be_charged = days_to_be_charged.days + 1
                        to_be_invoiced_charges.append(
                            {'days_to_charged': str(days_to_be_charged) + '/' + str(
                                invoice_processing_date_range) + ' days',
                             'charge': (float(days_to_be_charged) / float(invoice_processing_date_range)) * int(
                                 amount[1]),
                             'item': amount[0], 'qty': amount[2], 'rate': amount[3], 'customer': customer,
                             'amount': amount[1], 'it_ticket_activity_item': '', 'description': amount[6]})
                        if contract[0] not in ticket_active_contracts:
                            ticket_active_contracts.append(contract[0])
                elif amount[4] and not amount[5]:
                    print(31)
                    days_to_be_charged = end - amount[4]
                    print(days_to_be_charged.days + 1)
                    days_to_be_charged = days_to_be_charged.days + 1
                    to_be_invoiced_charges.append(
                        {'days_to_charged': str(days_to_be_charged) + '/' + str(
                            invoice_processing_date_range) + ' days',
                         'charge': (float(days_to_be_charged) / float(invoice_processing_date_range)) * int(
                             amount[1]),
                         'item': amount[0], 'qty': float(days_to_be_charged) / float(invoice_processing_date_range), 'rate': amount[3], 'customer': customer,
                         'amount': amount[1], 'it_ticket_activity_item': '', 'description': amount[6]})
                    if contract[0] not in ticket_active_contracts:
                        ticket_active_contracts.append(contract[0])
                else:
                    print(2)
                    invoice_processing_date_range = invoice_processing_date_range.split(' ')
                    invoice_processing_date_range = invoice_processing_date_range[0]
                    to_be_invoiced_charges.append(
                        {'days_to_charged': str(days_to_be_charged) + '/' + str(
                            invoice_processing_date_range) + ' days',
                         'charge': (float(days_to_be_charged) / float(invoice_processing_date_range)) * int(
                             amount[1]),
                         'item': amount[0], 'qty': float(days_to_be_charged) / float(invoice_processing_date_range), 'rate': amount[3], 'customer': customer,
                         'amount': amount[1],
                         'it_ticket_activity_item': '', 'description': amount[6]})
                    if contract[0] not in ticket_active_contracts:
                        ticket_active_contracts.append(contract[0])

    print(to_be_invoiced_charges)
    if active_contracts_with_no_end_dates != None and active_contracts_with_no_end_dates:
        return to_be_invoiced_charges


def calculate_active_contracts_with_dates_charges(active_contracts_with_dates, invoice_processing_name, start, end,
                                                  to_be_invoiced_charges,ticket_active_contracts):
    # datetime.strptime('Jun 1 2005  1:33PM', '%b %d %Y %I:%M%p')
    # start = datetime.date(int(start.split('-')[0]), int(start.split('-')[1]), int(start.split('-')[2]))
    # end = datetime.date(int(end.split('-')[0]), int(end.split('-')[1]), int(end.split('-')[2]))
    for contract in active_contracts_with_dates:
        contract_start_date_and_end_date = frappe.db.sql(
            """Select contract_start_date,contract_end_date,name from `tabIT Contract` where name=%s""", (contract[0]))

        for contract_start_end in contract_start_date_and_end_date:

            # start sa contract is not within the invoice date range
            if contract_start_end[0] <= start and (
                            contract_start_end[1] <= end and contract_start_end[1] > start):
                charges = frappe.db.sql(
                    """Select item_code,amount,quantity,rate,start_date,end_date,item_description from `tabIT Contract Detail Charge` where parent=%s""",
                    (contract[0]))
                customer = frappe.db.sql("""Select customer from `tabIT Contract` where name=%s""", (contract[0]))[0][0]

                invoice_processing_date_range = end - start
                invoice_processing_date_range = str(invoice_processing_date_range.days + 1)
                if check_charge_start_end(charges, invoice_processing_date_range, start, end, contract, customer,
                                          invoice_processing_name, to_be_invoiced_charges,ticket_active_contracts):
                    to_be_invoiced_charges = check_charge_start_end(charges, invoice_processing_date_range, start, end,
                                                                    contract, customer,
                                                                    invoice_processing_name, to_be_invoiced_charges,ticket_active_contracts)
                else:
                    for amount in charges:
                        print(1)
                        print('naaaaaaaaaa')
                        print(contract_start_end[2])
                        print(invoice_processing_name)
                        days_to_be_charged = contract_start_end[1] - start
                        print(days_to_be_charged.days + 1)
                        days_to_be_charged = days_to_be_charged.days + 1

                        to_be_invoiced_charges.append({'days_to_charged': str(days_to_be_charged) + '/' + str(
                            invoice_processing_date_range) + ' days', 'charge': (float(days_to_be_charged) / float(
                            invoice_processing_date_range)) * int(amount[1]),
                                                       'item': amount[0], 'qty': amount[2], 'rate': amount[3],
                                                       'customer': customer, 'amount': amount[1],
                                                       'it_ticket_activity_item': '', 'description': amount[6]})
                        if contract[0] not in ticket_active_contracts:
                            ticket_active_contracts.append(contract[0])
                        # to_be_invoiced_charges = ticket_charged(contract, to_be_invoiced_charges)
            elif contract_start_end[0] >= start and contract_start_end[1] <= end:
                # start and end sa contract is within the invoice date range
                charges = frappe.db.sql(
                    """Select item_code,amount,quantity,rate,start_date,end_date,item_description from `tabIT Contract Detail Charge` where parent=%s""",
                    (contract[0]))
                customer = frappe.db.sql("""Select customer from `tabIT Contract` where name=%s""", (contract[0]))[0][0]

                invoice_processing_date_range = end - start
                invoice_processing_date_range = str(invoice_processing_date_range.days + 1)
                if check_charge_start_end(charges, invoice_processing_date_range, start, end, contract, customer,
                                          invoice_processing_name, to_be_invoiced_charges,ticket_active_contracts):
                    to_be_invoiced_charges = check_charge_start_end(charges, invoice_processing_date_range, start, end,
                                                                    contract, customer,
                                                                    invoice_processing_name, to_be_invoiced_charges,ticket_active_contracts)
                else:
                    for amount in charges:
                        print(2)
                        print(contract_start_end[2])
                        print(invoice_processing_name)
                        days_to_be_charged = contract_start_end[1] - contract_start_end[0]
                        print(days_to_be_charged.days + 1)
                        days_to_be_charged = days_to_be_charged.days + 1

                        to_be_invoiced_charges.append(
                            {'days_to_charged': str(days_to_be_charged) + '/' + str(
                                invoice_processing_date_range) + ' days',
                             'charge': (float(days_to_be_charged) / float(invoice_processing_date_range)) * int(
                                 amount[1]),
                             'item': amount[0], 'qty': float(days_to_be_charged) / float(invoice_processing_date_range), 'rate': amount[3], 'customer': customer,
                             'amount': amount[1], 'it_ticket_activity_item': '', 'description': amount[6]})
                        if contract[0] not in ticket_active_contracts:
                            ticket_active_contracts.append(contract[0])
                        # to_be_invoiced_charges = ticket_charged(contract, to_be_invoiced_charges)
            elif (contract_start_end[0] >= start and contract_start_end[0] < end) and contract_start_end[
                1] >= end:
                # contract end date is after the invoice end date
                print(3)
                charges = frappe.db.sql(
                    """Select item_code,amount,quantity,rate,start_date,end_date,item_description from `tabIT Contract Detail Charge` where parent=%s""",
                    (contract[0]))
                customer = frappe.db.sql("""Select customer from `tabIT Contract` where name=%s""", (contract[0]))[0][0]

                invoice_processing_date_range = end - start
                invoice_processing_date_range = str(invoice_processing_date_range.days + 1)
                if check_charge_start_end(charges, invoice_processing_date_range, start, end, contract, customer,
                                          invoice_processing_name, to_be_invoiced_charges,ticket_active_contracts):
                    to_be_invoiced_charges = check_charge_start_end(charges, invoice_processing_date_range, start, end,
                                                                    contract, customer,
                                                                    invoice_processing_name, to_be_invoiced_charges,ticket_active_contracts)
                else:
                    for amount in charges:
                        print(3)
                        print(contract_start_end[2])
                        print(invoice_processing_name)
                        days_to_be_charged = end - contract_start_end[0]
                        print(days_to_be_charged.days + 1)
                        days_to_be_charged = days_to_be_charged.days + 1

                        to_be_invoiced_charges.append(
                            {'days_to_charged': str(days_to_be_charged) + '/' + str(
                                invoice_processing_date_range) + ' days',
                             'charge': (float(days_to_be_charged) / float(invoice_processing_date_range)) * int(
                                 amount[1]),
                             'item': amount[0], 'qty': float(days_to_be_charged) / float(invoice_processing_date_range), 'rate': amount[3], 'customer': customer,
                             'amount': amount[1], 'it_ticket_activity_item': '', 'description': amount[6]})
                        if contract[0] not in ticket_active_contracts:
                            ticket_active_contracts.append(contract[0])
                        # to_be_invoiced_charges = ticket_charged(contract, to_be_invoiced_charges)
            elif contract_start_end[0] <= start and contract_start_end[1] >= end:
                # contract start is before the invoice start and contract end date is after invoice end date
                print(4)
                charges = frappe.db.sql(
                    """Select item_code,amount,quantity,rate,start_date,end_date,item_description from `tabIT Contract Detail Charge` where parent=%s""",
                    (contract[0]))
                customer = frappe.db.sql("""Select customer from `tabIT Contract` where name=%s""", (contract[0]))[0][0]

                invoice_processing_date_range = end - start
                invoice_processing_date_range = str(invoice_processing_date_range.days + 1)
                if check_charge_start_end(charges, invoice_processing_date_range, start, end, contract, customer,
                                          invoice_processing_name, to_be_invoiced_charges,ticket_active_contracts):
                    to_be_invoiced_charges = check_charge_start_end(charges, invoice_processing_date_range, start, end,
                                                                    contract, customer,
                                                                    invoice_processing_name, to_be_invoiced_charges,ticket_active_contracts)
                else:
                    for amount in charges:
                        print(4)
                        print(contract_start_end[2])
                        print(invoice_processing_name)
                        days_to_be_charged = end - start
                        print(days_to_be_charged.days + 1)
                        days_to_be_charged = days_to_be_charged.days + 1
                        to_be_invoiced_charges.append(
                            {'days_to_charged': str(days_to_be_charged) + '/' + str(
                                invoice_processing_date_range) + ' days',
                             'charge': (float(days_to_be_charged) / float(invoice_processing_date_range)) * int(
                                 amount[1]),
                             'item': amount[0], 'qty': float(days_to_be_charged) / float(invoice_processing_date_range), 'rate': amount[3], 'customer': customer,
                             'amount': amount[1], 'it_ticket_activity_item': '', 'description': amount[6]})
                        if contract[0] not in ticket_active_contracts:
                            ticket_active_contracts.append(contract[0])
                        # to_be_invoiced_charges = ticket_charged(contract, to_be_invoiced_charges)
    if active_contracts_with_dates != None and active_contracts_with_dates:
        return to_be_invoiced_charges


def check_charge_start_end(charges, invoice_processing_date_range, start, end, contract, customer,
                           invoice_processing_name, to_be_invoiced_charges,ticket_active_contracts):
    confirmation = 0
    for amount in charges:
        if amount[4] and amount[5]:

            if amount[4] <= start and (amount[5] <= end and amount[5] > start):
                confirmation = 1
                print(5)
                print(amount[5])
                print(invoice_processing_name)
                days_to_be_charged = amount[5] - start
                print(days_to_be_charged.days + 1)
                days_to_be_charged = days_to_be_charged.days + 1

                to_be_invoiced_charges.append({'days_to_charged': str(days_to_be_charged) + '/' + str(
                    invoice_processing_date_range) + ' days', 'charge': (float(days_to_be_charged) / float(
                    invoice_processing_date_range)) * int(amount[1]),
                                               'item': amount[0], 'qty': float(days_to_be_charged) / float(invoice_processing_date_range), 'rate': amount[3],
                                               'customer': customer, 'amount': amount[1],
                                               'it_ticket_activity_item': '', 'description': amount[6]})
                if contract[0] not in ticket_active_contracts:
                    ticket_active_contracts.append(contract[0])
                # to_be_invoiced_charges = ticket_charged(contract, to_be_invoiced_charges)
            elif amount[4] >= start and amount[5] <= end:
                # start and end sa contract is within the invoice date range
                print(6)
                confirmation = 1
                days_to_be_charged = amount[5] - amount[4]
                print(days_to_be_charged.days + 1)
                days_to_be_charged = days_to_be_charged.days + 1

                to_be_invoiced_charges.append(
                    {'days_to_charged': str(days_to_be_charged) + '/' + str(
                        invoice_processing_date_range) + ' days',
                     'charge': (float(days_to_be_charged) / float(invoice_processing_date_range)) * int(
                         amount[1]),
                     'item': amount[0], 'qty': float(days_to_be_charged) / float(invoice_processing_date_range), 'rate': amount[3], 'customer': customer,
                     'amount': amount[1], 'it_ticket_activity_item': '', 'description': amount[6]})
                if contract[0] not in ticket_active_contracts:
                    ticket_active_contracts.append(contract[0])
                # to_be_invoiced_charges = ticket_charged(contract, to_be_invoiced_charges)
            elif (amount[4] >= start and amount[4] < end) and amount[5] >= end:
                # contract end date is after the invoice end date
                print(7)
                confirmation = 1

                print(invoice_processing_name)
                days_to_be_charged = end - amount[4]
                print(days_to_be_charged.days + 1)
                days_to_be_charged = days_to_be_charged.days + 1

                to_be_invoiced_charges.append(
                    {'days_to_charged': str(days_to_be_charged) + '/' + str(
                        invoice_processing_date_range) + ' days',
                     'charge': (float(days_to_be_charged) / float(invoice_processing_date_range)) * int(
                         amount[1]),
                     'item': amount[0], 'qty': amount[2], 'rate': amount[3], 'customer': customer,
                     'amount': amount[1], 'it_ticket_activity_item': '', 'description': amount[6]})
                if contract[0] not in ticket_active_contracts:
                    ticket_active_contracts.append(contract[0])
                # to_be_invoiced_charges = ticket_charged(contract, to_be_invoiced_charges)
            elif amount[4] <= start and amount[5] >= end:
                # contract start is before the invoice start and contract end date is after invoice end date
                print(8)
                confirmation = 1
                print(invoice_processing_name)
                days_to_be_charged = end - start
                print(days_to_be_charged.days + 1)
                days_to_be_charged = days_to_be_charged.days + 1
                to_be_invoiced_charges.append(
                    {'days_to_charged': str(days_to_be_charged) + '/' + str(
                        invoice_processing_date_range) + ' days',
                     'charge': (float(days_to_be_charged) / float(invoice_processing_date_range)) * int(
                         amount[1]),
                     'item': amount[0], 'qty': float(days_to_be_charged) / float(invoice_processing_date_range), 'rate': amount[3], 'customer': customer,
                     'amount': amount[1], 'it_ticket_activity_item': '', 'description': amount[6]})
                if contract[0] not in ticket_active_contracts:
                    ticket_active_contracts.append(contract[0])
                # to_be_invoiced_charges = ticket_charged(contract, to_be_invoiced_charges)
        elif amount[4] and not amount[5]:
            days_to_be_charged = end - amount[4]
            print(days_to_be_charged.days + 1)
            days_to_be_charged = days_to_be_charged.days + 1
            confirmation = 1
            print(9)
            to_be_invoiced_charges.append(
                {'days_to_charged': str(days_to_be_charged) + '/' + str(
                    invoice_processing_date_range) + ' days',
                 'charge': (float(days_to_be_charged) / float(invoice_processing_date_range)) * int(
                     amount[1]),
                 'item': amount[0], 'qty': float(days_to_be_charged) / float(invoice_processing_date_range), 'rate': amount[3], 'customer': customer,
                 'amount': amount[1], 'it_ticket_activity_item': '', 'description': amount[6]})
            if contract[0] not in ticket_active_contracts:
                ticket_active_contracts.append(contract[0])
            # to_be_invoiced_charges = ticket_charged(contract, to_be_invoiced_charges)
    if confirmation:
        return to_be_invoiced_charges


def ticket_charged(to_be_invoiced_charges, customer, ticket_active_contracts, unbilled):
    tickets = ()
    for ii in unbilled:
        print(ii['ticket'])
        print(ii['action'])
        if ii['action'] == "Invoice Customer":
            for activity in frappe.db.sql("""Select activity_type,billable_time,item_code,name,date,parent,description,billable_check,price,quantity from `tabIT Ticket Detail` where parent=%s and billed!=1 and name=%s""",
                    (ii['ticket'],ii['parentdetail'])):
                customer=frappe.db.sql("""Select customer from `tabIT Ticket` where name=%s""",(ii['ticket']))[0][0]
                if activity[0] == 'Time Entry':
                    if len(frappe.db.sql("""Select price_list_rate from `tabItem Price` where item_code=%s""",
                                         (activity[2]))) > 0:

                        date = ""
                        desc = ""
                        if activity[4] and activity[4] != None:
                            date = str(activity[4]).split('-')
                            date = date[2] + "/" + date[1] + "/" + date[0]
                        else:
                            date = "Date not specified"
                    if activity[6] and activity[6] != None:
                        desc = activity[6]
                    else:
                        desc = ""

                    item_name = ""
                    for i in frappe.db.sql("""Select item_name from `tabItem` where name=%s""", (activity[2])):
                        item_name = i[0]

                    charge = float(activity[1]) * float(frappe.db.sql(
                        """Select price_list_rate from `tabItem Price` where item_code=%s""",
                        (activity[2]))[0][0])


                    if activity[7] == 1:
                        print(10)
                        to_be_invoiced_charges.append({'days_to_charged': 'Activity',
                                                       'charge': charge,
                                                       'item': activity[2], 'qty': activity[1],
                                                       'rate': frappe.db.sql(
                                                           """Select price_list_rate from `tabItem Price` where item_code=%s""",
                                                           (activity[2]))[0][0], 'customer': customer,
                                                       'it_ticket_activity_item': activity[3], 'billed': 1,
                                                       'description': "<b>" + item_name + " - " + date + " - " +
                                                                      activity[5] + "</b><br>" + desc,
                                                       'it_ticket': ii['ticket']})
                elif activity[0]=="New Product":
                    if activity[8]:

                        date = ""
                        desc = ""
                        if activity[4] and activity[4] != None:
                            date = str(activity[4]).split('-')
                            date = date[2] + "/" + date[1] + "/" + date[0]
                        else:
                            date = "Date not specified"
                    if activity[6] and activity[6] != None:
                        desc = activity[6]
                    else:
                        desc = ""

                    item_name = ""
                    for i in frappe.db.sql("""Select item_name from `tabItem` where name=%s""", (activity[2])):
                        item_name = i[0]

                    charge=0

                    charge= float(activity[9]) * float(activity[8])

                    if activity[7] == 1:
                        print(11)
                        to_be_invoiced_charges.append({'days_to_charged': 'Activity',
                                                       'charge': charge,
                                                       'item': activity[2], 'qty': activity[1],
                                                       'rate': frappe.db.sql(
                                                           """Select price_list_rate from `tabItem Price` where item_code=%s""",
                                                           (activity[2]))[0][0], 'customer': customer,
                                                       'it_ticket_activity_item': activity[3], 'billed': 1,
                                                       'description': desc,
                                                       'it_ticket': ii['ticket']})
                elif activity[0] == "Call/Email/Note":
                    if activity[8]:

                        date = ""
                        desc = ""
                        if activity[4] and activity[4] != None:
                            date = str(activity[4]).split('-')
                            date = date[2] + "/" + date[1] + "/" + date[0]
                        else:
                            date = "Date not specified"
                    if activity[6] and activity[6] != None:
                        desc = activity[6]
                    else:
                        desc = ""

                    item_name = ""
                    for i in frappe.db.sql("""Select item_name from `tabItem` where name=%s""", (activity[2])):
                        item_name = i[0]

                    charge = 0

                    charge= float(activity[1]) * float(frappe.db.sql(
                        """Select price_list_rate from `tabItem Price` where item_code=%s""",
                        (activity[2]))[0][0])


                    if activity[7] == 1:
                        print(12)
                        charge = float(activity[1]) * float(activity[8])
                        to_be_invoiced_charges.append({'days_to_charged': 'Activity',
                                                       'charge': charge,
                                                       'item': activity[2], 'qty': activity[1],
                                                       'rate': frappe.db.sql(
                                                           """Select price_list_rate from `tabItem Price` where item_code=%s""",
                                                           (activity[2]))[0][0], 'customer': customer,
                                                       'it_ticket_activity_item': activity[3], 'billed': 1,
                                                       'description': "<b>" + item_name + " - " + date + " - " +
                                                                      activity[5] + "</b><br>" + desc,
                                                       'it_ticket': ii['ticket']})
                else:
                    return "Some activity items don't have item price."
        elif ii['action'] == "Mark as not billable":
            frappe.db.sql("""Update `tabIT Ticket Detail` set billable_check=0 where name=%s""",(ii['parentdetail']))
        frappe.db.sql("""Update `tabIT Unbilled Activities` set action=%s,action_applied=1 where name=%s""", (ii['action'], ii['name']))
    include_non_billable = 0
    if len(frappe.db.sql(
            """Select value from `tabSingles` where doctype='IT Services Setup' and field='include_non_billable_ticket_activities'""")) > 0:
        include_non_billable = frappe.db.sql(
            """Select value from `tabSingles` where doctype='IT Services Setup' and field='include_non_billable_ticket_activities'""")[
            0][0]
    for act in ticket_active_contracts:

        if not customer:
            tickets = frappe.db.sql("""Select name,customer from `tabIT Ticket` where contract=%s""",(act))
        else:
            tickets = frappe.db.sql("""Select name,customer from `tabIT Ticket` where customer=%s and contract=%s""", (customer,act))

        for ticket in tickets:
            for activity in frappe.db.sql(
                    """Select activity_type,billable_time,item_code,name,date,parent,description,billable_check from `tabIT Ticket Detail` where parent=%s and billed!=1""",
                    (ticket[0])):

                if activity[0] == 'Time Entry':
                    if len(frappe.db.sql("""Select price_list_rate from `tabItem Price` where item_code=%s""",
                                         (activity[2]))) > 0:

                        date = ""
                        desc = ""
                        if activity[4] and activity[4] != None:
                            date = str(activity[4]).split('-')
                            date = date[2] + "/" + date[1] + "/" + date[0]
                        else:
                            date = "Date not specified"
                        if activity[6] and activity[6] != None:
                            desc = activity[6]
                        else:
                            desc = ""

                        item_name = ""
                        for i in frappe.db.sql("""Select item_name from `tabItem` where name=%s""", (activity[2])):
                            item_name = i[0]

                        charge = float(activity[1]) * float(frappe.db.sql(
                            """Select price_list_rate from `tabItem Price` where item_code=%s""",
                            (activity[2]))[0][0])

                        if include_non_billable == 1:
                            if activity[7] != 1:
                                charge = 0
                            to_be_invoiced_charges.append({'days_to_charged': 'Activity',
                                                           'charge': charge,
                                                           'item': activity[2], 'qty': activity[1], 'rate': frappe.db.sql(
                                    """Select price_list_rate from `tabItem Price` where item_code=%s""", (activity[2]))[0][
                                    0], 'customer': ticket[1]
                                                              , 'it_ticket_activity_item': activity[3], 'billed': 1,
                                                           'description': "<b>" + item_name + " - " + date + " - " +
                                                                          activity[5] + "</b><br>" + desc,
                                                           'it_ticket': ticket[0]})


                        elif not include_non_billable:
                            if activity[7] == 1 and charge:
                                to_be_invoiced_charges.append({'days_to_charged': 'Activity',
                                                               'charge': charge,
                                                               'item': activity[2], 'qty': activity[1],
                                                               'rate': frappe.db.sql(
                                                                   """Select price_list_rate from `tabItem Price` where item_code=%s""",
                                                                   (activity[2]))[0][0], 'customer': ticket[1],
                                                               'it_ticket_activity_item': activity[3], 'billed': 1,
                                                               'description': "<b>" + item_name + " - " + date + " - " +
                                                                              activity[5] + "</b><br>" + desc,
                                                               'it_ticket': ticket[0]})
                    elif activity[0] == "New Product":
                        if activity[8]:

                            date = ""
                            desc = ""
                            if activity[4] and activity[4] != None:
                                date = str(activity[4]).split('-')
                                date = date[2] + "/" + date[1] + "/" + date[0]
                            else:
                                date = "Date not specified"
                        if activity[6] and activity[6] != None:
                            desc = activity[6]
                        else:
                            desc = ""

                        item_name = ""
                        for i in frappe.db.sql("""Select item_name from `tabItem` where name=%s""", (activity[2])):
                            item_name = i[0]

                        charge = 0

                        charge = float(activity[9]) * float(activity[8])


                        if include_non_billable == 1:
                            if activity[7] != 1:
                                charge = 0
                            to_be_invoiced_charges.append({'days_to_charged': 'Activity',
                                                           'charge': charge,
                                                           'item': activity[2], 'qty': activity[1], 'rate': frappe.db.sql(
                                    """Select price_list_rate from `tabItem Price` where item_code=%s""", (activity[2]))[0][
                                    0], 'customer': ticket[1]
                                                              , 'it_ticket_activity_item': activity[3], 'billed': 1,
                                                           'description': desc,
                                                           'it_ticket': ticket[0]})


                        elif not include_non_billable:
                            if activity[7] == 1 and charge:
                                to_be_invoiced_charges.append({'days_to_charged': 'Activity',
                                                               'charge': charge,
                                                               'item': activity[2], 'qty': activity[1],
                                                               'rate': frappe.db.sql(
                                                                   """Select price_list_rate from `tabItem Price` where item_code=%s""",
                                                                   (activity[2]))[0][0], 'customer': ticket[1],
                                                               'it_ticket_activity_item': activity[3], 'billed': 1,
                                                               'description': desc,
                                                               'it_ticket': ticket[0]})
                    elif activity[0] == "Call/Email/Note":
                        if activity[8]:

                            date = ""
                            desc = ""
                            if activity[4] and activity[4] != None:
                                date = str(activity[4]).split('-')
                                date = date[2] + "/" + date[1] + "/" + date[0]
                            else:
                                date = "Date not specified"
                        if activity[6] and activity[6] != None:
                            desc = activity[6]
                        else:
                            desc = ""

                        item_name = ""
                        for i in frappe.db.sql("""Select item_name from `tabItem` where name=%s""", (activity[2])):
                            item_name = i[0]

                        charge = 0
                        charge = float(activity[1]) * float(frappe.db.sql(
                            """Select price_list_rate from `tabItem Price` where item_code=%s""",
                            (activity[2]))[0][0])
                        if include_non_billable == 1:
                            if activity[7] != 1:
                                charge = 0
                            to_be_invoiced_charges.append({'days_to_charged': 'Activity',
                                                           'charge': charge,
                                                           'item': activity[2], 'qty': activity[1], 'rate': frappe.db.sql(
                                    """Select price_list_rate from `tabItem Price` where item_code=%s""", (activity[2]))[0][
                                    0], 'customer': ticket[1]
                                                              , 'it_ticket_activity_item': activity[3], 'billed': 1,
                                                           'description': "<b>" + item_name + " - " + date + " - " +
                                                                          activity[5] + "</b><br>" + desc,
                                                           'it_ticket': ticket[0]})


                        elif not include_non_billable:
                            if activity[7] == 1 and charge:
                                to_be_invoiced_charges.append({'days_to_charged': 'Activity',
                                                               'charge': charge,
                                                               'item': activity[2], 'qty': activity[1],
                                                               'rate': frappe.db.sql(
                                                                   """Select price_list_rate from `tabItem Price` where item_code=%s""",
                                                                   (activity[2]))[0][0], 'customer': ticket[1],
                                                               'it_ticket_activity_item': activity[3], 'billed': 1,
                                                               'description': "<b>" + item_name + " - " + date + " - " +
                                                                              activity[5] + "</b><br>" + desc,
                                                               'it_ticket': ticket[0]})
                    else:
                        return "Some activity items don't have item price."

    if not customer:
        tickets = frappe.db.sql("""Select name,customer from `tabIT Ticket` where use_global_contract=1""")
    else:
        tickets = frappe.db.sql("""Select name,customer from `tabIT Ticket` where customer=%s and use_global_contract=1""",
                                (customer))
    include_non_billable = 0
    if len(frappe.db.sql(
            """Select value from `tabSingles` where doctype='IT Services Setup' and field='include_non_billable_ticket_activities'""")) > 0:
        include_non_billable = frappe.db.sql(
            """Select value from `tabSingles` where doctype='IT Services Setup' and field='include_non_billable_ticket_activities'""")[
            0][0]

    for ticket in tickets:
        for activity in frappe.db.sql(
                """Select activity_type,billable_time,item_code,name,date,parent,description,billable_check from `tabIT Ticket Detail` where parent=%s and billed!=1""",
                (ticket[0])):

            if activity[0] == 'Time Entry':
                if len(frappe.db.sql("""Select price_list_rate from `tabItem Price` where item_code=%s""",
                                     (activity[2]))) > 0:

                    date = ""
                    desc = ""
                    if activity[4] and activity[4] != None:
                        date = str(activity[4]).split('-')
                        date = date[2] + "/" + date[1] + "/" + date[0]
                    else:
                        date = "Date not specified"
                    if activity[6] and activity[6] != None:
                        desc = activity[6]
                    else:
                        desc = ""

                    item_name = ""
                    for i in frappe.db.sql("""Select item_name from `tabItem` where name=%s""", (activity[2])):
                        item_name = i[0]

                    charge = float(activity[1]) * float(frappe.db.sql(
                        """Select price_list_rate from `tabItem Price` where item_code=%s""",
                        (activity[2]))[0][0])

                    if include_non_billable == 1:
                        if activity[7] != 1:
                            charge = 0
                        to_be_invoiced_charges.append({'days_to_charged': 'Activity',
                                                       'charge': charge,
                                                       'item': activity[2], 'qty': activity[1], 'rate': frappe.db.sql(
                                """Select price_list_rate from `tabItem Price` where item_code=%s""", (activity[2]))[0][
                                0], 'customer': ticket[1]
                                                          , 'it_ticket_activity_item': activity[3], 'billed': 1,
                                                       'description': "<b>" + item_name + " - " + date + " - " +
                                                                      activity[5] + "</b><br>" + desc,
                                                       'it_ticket': ticket[0]})


                    elif not include_non_billable:
                        if activity[7] == 1 and charge:
                            to_be_invoiced_charges.append({'days_to_charged': 'Activity',
                                                           'charge': charge,
                                                           'item': activity[2], 'qty': activity[1],
                                                           'rate': frappe.db.sql(
                                                               """Select price_list_rate from `tabItem Price` where item_code=%s""",
                                                               (activity[2]))[0][0], 'customer': ticket[1],
                                                           'it_ticket_activity_item': activity[3], 'billed': 1,
                                                           'description': "<b>" + item_name + " - " + date + " - " +
                                                                          activity[5] + "</b><br>" + desc,
                                                           'it_ticket': ticket[0]})
                elif activity[0] == "New Product":
                    if activity[8]:

                        date = ""
                        desc = ""
                        if activity[4] and activity[4] != None:
                            date = str(activity[4]).split('-')
                            date = date[2] + "/" + date[1] + "/" + date[0]
                        else:
                            date = "Date not specified"
                    if activity[6] and activity[6] != None:
                        desc = activity[6]
                    else:
                        desc = ""

                    item_name = ""
                    for i in frappe.db.sql("""Select item_name from `tabItem` where name=%s""", (activity[2])):
                        item_name = i[0]

                    charge = 0

                    charge = float(activity[9]) * float(activity[8])

                    if include_non_billable == 1:
                        if activity[7] != 1:
                            charge = 0
                        to_be_invoiced_charges.append({'days_to_charged': 'Activity',
                                                       'charge': charge,
                                                       'item': activity[2], 'qty': activity[1], 'rate': frappe.db.sql(
                                """Select price_list_rate from `tabItem Price` where item_code=%s""", (activity[2]))[0][
                                0], 'customer': ticket[1]
                                                          , 'it_ticket_activity_item': activity[3], 'billed': 1,
                                                       'description': desc,
                                                       'it_ticket': ticket[0]})


                    elif not include_non_billable:
                        if activity[7] == 1 and charge:
                            to_be_invoiced_charges.append({'days_to_charged': 'Activity',
                                                           'charge': charge,
                                                           'item': activity[2], 'qty': activity[1],
                                                           'rate': frappe.db.sql(
                                                               """Select price_list_rate from `tabItem Price` where item_code=%s""",
                                                               (activity[2]))[0][0], 'customer': ticket[1],
                                                           'it_ticket_activity_item': activity[3], 'billed': 1,
                                                           'description': desc,
                                                           'it_ticket': ticket[0]})
                elif activity[0] == "Call/Email/Note":
                    if activity[8]:

                        date = ""
                        desc = ""
                        if activity[4] and activity[4] != None:
                            date = str(activity[4]).split('-')
                            date = date[2] + "/" + date[1] + "/" + date[0]
                        else:
                            date = "Date not specified"
                    if activity[6] and activity[6] != None:
                        desc = activity[6]
                    else:
                        desc = ""

                    item_name = ""
                    for i in frappe.db.sql("""Select item_name from `tabItem` where name=%s""", (activity[2])):
                        item_name = i[0]

                    charge = 0
                    charge = float(activity[1]) * float(frappe.db.sql(
                        """Select price_list_rate from `tabItem Price` where item_code=%s""",
                        (activity[2]))[0][0])
                    if include_non_billable == 1:
                        if activity[7] != 1:
                            charge = 0
                        to_be_invoiced_charges.append({'days_to_charged': 'Activity',
                                                       'charge': charge,
                                                       'item': activity[2], 'qty': activity[1], 'rate': frappe.db.sql(
                                """Select price_list_rate from `tabItem Price` where item_code=%s""", (activity[2]))[0][
                                0], 'customer': ticket[1]
                                                          , 'it_ticket_activity_item': activity[3], 'billed': 1,
                                                       'description': "<b>" + item_name + " - " + date + " - " +
                                                                      activity[5] + "</b><br>" + desc,
                                                       'it_ticket': ticket[0]})


                    elif not include_non_billable:
                        if activity[7] == 1 and charge:
                            to_be_invoiced_charges.append({'days_to_charged': 'Activity',
                                                           'charge': charge,
                                                           'item': activity[2], 'qty': activity[1],
                                                           'rate': frappe.db.sql(
                                                               """Select price_list_rate from `tabItem Price` where item_code=%s""",
                                                               (activity[2]))[0][0], 'customer': ticket[1],
                                                           'it_ticket_activity_item': activity[3], 'billed': 1,
                                                           'description': "<b>" + item_name + " - " + date + " - " +
                                                                          activity[5] + "</b><br>" + desc,
                                                           'it_ticket': ticket[0]})
                else:
                    return "Some activity items don't have item price."
    return to_be_invoiced_charges


def create_invoice(c, end, default_company, default_currency, posting_date, invoice_created, invoice_processing_name):
    for c_w_e_d in c:
        # frappe.db.sql("""Update `tabIT Ticket Detail` set billed=1 where name=%s""",
        #               (c_w_e_d['it_ticket_activity_item']))
        payment_term = frappe.get_all('Customer', filters={'name': c_w_e_d['customer']}, fields=['payment_terms'])
        credit_days = frappe.get_all('Payment Term', filters={'name': payment_term[0]['payment_terms']},
                                     fields=['credit_days'])


        pd = datetime.date(int(posting_date.split('-')[0]), int(posting_date.split('-')[1]),
                           int(posting_date.split('-')[2]))
        print(credit_days)
        if payment_term:
            if payment_term[0]['payment_terms'] != None:
                if credit_days:
                    credit_days = pd + datetime.timedelta(days=credit_days[0]['credit_days'])
        else:
            credit_days = datetime.datetime.now()

        parent_ticket = ''
        if c_w_e_d['it_ticket_activity_item']:
            parent_ticket = frappe.db.sql("""Select parent from `tabIT Ticket Detail` where name=%s""",
                                          (c_w_e_d['it_ticket_activity_item']))[0][0]
        if len(frappe.db.sql("""Select name from `tabSales Invoice` where customer=%s and posting_date=%s and it_invoice_processing=%s and docstatus!=1""",
                             (c_w_e_d['customer'], posting_date,invoice_processing_name))) > 0:
            item_name = frappe.db.sql("""Select item_name from `tabItem` where name=%s""", (c_w_e_d['item']))[0][0]
            cost_center = ''
            income_account = ''
            def_company = ''
            if len(frappe.db.sql(
                    """Select value from `tabSingles` where doctype='Global Defaults' and field='default_company'""")) > 0:
                def_company = frappe.db.sql(
                    """Select value from `tabSingles` where doctype='Global Defaults' and field='default_company'""")[
                    0][0]

            if len(frappe.db.sql("""Select selling_cost_center from `tabItem Default` where parent=%s""",
                                 c_w_e_d['item'])) > 0:
                cost_center = \
                    frappe.db.sql("""Select selling_cost_center from `tabItem Default` where parent=%s""",
                                  c_w_e_d['item'])[
                        0][0]
            else:
                cost_center = frappe.db.sql("""Select cost_center from `tabCompany` where name=%s""", (def_company))[0][
                    0]
            if len(frappe.db.sql("""Select income_account from `tabItem Default` where parent=%s""",
                                 c_w_e_d['item'])) > 0:
                income_account = \
                    frappe.db.sql("""Select income_account from `tabItem Default` where parent=%s""", c_w_e_d['item'])[0][
                        0]
            else:
                income_account = \
                    frappe.db.sql("""Select default_income_account from `tabCompany` where name=%s""", (def_company))[
                        0][0]
            uom=frappe.db.sql("""Select stock_uom from `tabItem` where name=%s""",(c_w_e_d['item']))[0][0]

            for invoice_name in frappe.db.sql(
                    """Select name from `tabSales Invoice` where customer=%s and posting_date=%s and it_invoice_processing=%s and docstatus!=1""",
                    (c_w_e_d['customer'], posting_date, invoice_processing_name)):

                frappe.db.sql(
                    """Insert into `tabSales Invoice Item` (uom,income_account,cost_center,name,item_code,qty,rate,parent,parentfield,parenttype,amount,days_charged,it_ticket_activity_item,description,item_name,it_ticket) values(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
                    (uom,income_account,cost_center,frappe.model.naming.make_autoname("Sales Invoice Item"), c_w_e_d['item'], c_w_e_d['qty'],
                     c_w_e_d['rate'],  invoice_name[0], 'items', 'Sales Invoice', c_w_e_d['charge'],
                     c_w_e_d['days_to_charged'], c_w_e_d['it_ticket_activity_item'], c_w_e_d['description'],
                     item_name, parent_ticket))
                for grand_total in frappe.db.sql(
                        """Select grand_total from `tabSales Invoice` where name=%s""",
                        (invoice_name[0])):
                    frappe.db.sql(
                        """Update `tabSales Invoice` set grand_total=%s,total=%s,outstanding_amount=%s where name=%s""",
                        (float(grand_total[0]) + float(c_w_e_d['charge']),
                         float(grand_total[0]) + float(c_w_e_d['charge']), float(grand_total[0]) + float(c_w_e_d['charge']),invoice_name[0]))
                if frappe.db.sql(
                        """Select name from `tabSales Invoice` where name=%s""",
                        (invoice_name[0]))[0][0] not in invoice_created:
                    invoice_created.append(frappe.db.sql(
                        """Select name from `tabSales Invoice` where name=%s""",
                        (invoice_name[0]))[0][0])
        else:
            item_name = frappe.db.sql("""Select item_name from `tabItem` where name=%s""", (c_w_e_d['item']))[0][0]
            cost_center = ''
            income_account = ''
            def_company = ''
            if len(frappe.db.sql(
                    """Select value from `tabSingles` where doctype='Global Defaults' and field='default_company'""")) > 0:
                def_company = frappe.db.sql(
                    """Select value from `tabSingles` where doctype='Global Defaults' and field='default_company'""")[
                    0][0]

            if len(frappe.db.sql("""Select selling_cost_center from `tabItem Default` where parent=%s""",
                                 c_w_e_d['item'])) > 0:
                cost_center = \
                frappe.db.sql("""Select selling_cost_center from `tabItem Default` where parent=%s""", c_w_e_d['item'])[
                    0][0]
            else:
                cost_center = frappe.db.sql("""Select cost_center from `tabCompany` where name=%s""", (def_company))[0][
                    0]
            if len(frappe.db.sql("""Select income_account from `tabItem Default` where parent=%s""",
                                 c_w_e_d['item'])) > 0:
                income_account = \
                frappe.db.sql("""Select income_account from `tabItem Default` where parent=%s""", c_w_e_d['item'])[0][0]
            else:
                income_account = \
                frappe.db.sql("""Select default_income_account from `tabCompany` where name=%s""", (def_company))[0][0]

            uom=frappe.db.sql("""Select stock_uom from `tabItem` where name=%s""",(c_w_e_d['item']))[0][0]
            items = [{
                'uom':uom,
                'item_name': item_name,
                'item_code': c_w_e_d['item'],
                'qty': c_w_e_d['qty'],
                'rate': c_w_e_d['rate'],
                'amount': c_w_e_d['charge'],
                'days_charged': c_w_e_d['days_to_charged'],
                'it_ticket_activity_item': c_w_e_d['it_ticket_activity_item'],
                'description': c_w_e_d['description'],
                'it_ticket': parent_ticket,
                'cost_center': cost_center,
                'income_account': income_account,
            }]
            taxes_and_charges=''
            if len(frappe.db.sql("""Select name from `tabSales Taxes and Charges Template` where company=%s""",(default_company)))>0:
                taxes_and_charges=frappe.db.sql("""Select name from `tabSales Taxes and Charges Template` where company=%s""",(default_company))[0][0]
            tax_id=''
            for i in frappe.db.sql("""Select tax_id from `tabCustomer` where name=%s""",(c_w_e_d['customer'])):
                tax_id=i[0]
            sales_invoice = frappe.get_doc({
                "doctype": "Sales Invoice",
                "customer": c_w_e_d['customer'],
                "company": default_company,
                "series": "ACC-SINV-.YYYY.-",
                "currency": default_currency,
                "posting_date": posting_date,
                "days_charged": c_w_e_d['days_to_charged'],
                "price_list": "Standard Selling",
                "price_list_currency":
                    frappe.db.sql("""Select currency from `tabPrice List` where name='Standard Selling'""")[0][0],
                "plc_conversion_rate": 1,
                "debit_to": frappe.db.sql("""Select default_receivable_account from `tabCompany` where name=%s""",
                                          default_company)[0][0],
                "due_date": credit_days,
                "it_invoice_processing": invoice_processing_name,
                "items": items,
                "taxes_and_charges": taxes_and_charges,
                'tax_id': tax_id

            })
            sales_invoice.insert()
            invoice_created.append(sales_invoice.name)
    return invoice_created


@frappe.whitelist()
def get_currency_symbol():
    default_currency = ""

    for i in frappe.db.sql("""Select defvalue from `tabDefaultValue` where defkey='currency'"""):
        default_currency = i[0]
    if default_currency:
        return frappe.db.sql("""Select symbol from `tabCurrency` where name=%s""", (default_currency))[0][0]


def submit_and_create_draft_invoice(doc, event):

    if doc.ref_doctype=="IT Invoice Processing":
        if doc.data:
            data = json.loads(doc.data) if (doc.data) else {}
            if 'changed' in data:
                if 'changed' in data and data['changed'][0][2] == "Draft Invoices Created":
                    for i in data['changed']:
                        if "workflow_state" in i:
                            req = frappe.db.sql(
                                """Select start_date,end_date,name,posting_date,customer from `tabIT Invoice Processing` where name=%s""",
                                (doc.docname))
                            start_date = ''
                            end_date = ''
                            name = ''
                            posting_date = ''
                            for i in req:
                                customer = i[4]
                                start_date = i[0]
                                end_date = i[1]
                                name = i[2]
                                posting_date = i[3]

                            if start_date and end_date and name and posting_date:
                                    # frappe.validated=False
                                    # return sys.exit()

                                create_list_of_invoices(get_active_contracts(start_date, end_date, name, posting_date, customer), doc)


def create_list_of_invoices(response, doc):
    if response != 2:
        total = 0
        for i in range(len(response)):
            if len(frappe.db.sql("""Select name from `tabIT Invoice Processed` where link=%s and parent=%s""",
                                 (response[i]['name'], doc.docname))) == 0:
                contact=''
                email=''
                for c in frappe.db.sql("""Select contact_person,contact_email from `tabSales Invoice` where name=%s""",(response[i]['name'])):
                    contact=c[0]
                    email=c[1]
                list_of_invoices = frappe.get_doc({
                    "contact": contact,
                    "creation": datetime.datetime.now(),
                    "customer": response[i]['customer'],
                    "docstatus": 0,
                    "doctype": "IT Invoice Processed",
                    "email_address": email,
                    "grand_total": response[i]['grand_total'],
                    "link": response[i]['name'],
                    "modified": datetime.datetime.now(),
                    "modified_by": frappe.session.user,
                    "owner": frappe.session.user,
                    "parent": doc.docname,
                    "parentfield": "list_of_invoices",
                    "parenttype": "IT Invoice Processing",
                })
                total += response[i]['grand_total']
                list_of_invoices.insert()
        if total:
            frappe.db.sql("""Update `tabIT Invoice Processing` set total=%s,invoice_processed=1 where name=%s""",
                          (total, doc.docname))
    else:
        frappe.throw("Some activity items don't have item price.")


@frappe.whitelist()
def check_if_there_is_list_of_invoices(name):
    if len(frappe.db.sql("""Select name from `tabIT Invoice Processed` where parent=%s""", (name))) > 0:
        return 1


@frappe.whitelist()
def send_email(comm_name):
    import sys
    # sys.setdefaultencoding() does not exist, here!
    reload(sys)  # Reload does the trick!
    sys.setdefaultencoding('UTF8')
    email_name = frappe.db.sql("""Select name from `tabEmail Queue` where communication=%s""", (comm_name))
    if len(email_name) > 0:
        send_one(email_name[0][0], now=True)


@frappe.whitelist()
def get_default_email_template_for_invoice_processing():
    for i in frappe.db.sql(
            """Select value from `tabSingles` where doctype='IT Services Setup' and field='default_email_template'"""):
        for ii in frappe.db.sql("""Select response from `tabEmail Template` where name=%s""", (i[0])):
            return i[0]


@frappe.whitelist()
def submit_invoices(invoice_processing_name, customer):
    try:
        for i in frappe.db.sql("""Select link from `tabIT Invoice Processed` where parent=%s""",
                               (invoice_processing_name)):
            doc = frappe.get_doc("Sales Invoice", {'name': i[0]})
            doc.submit()
        if customer:
            customer_contracts=frappe.db.sql("""Select name from `tabIT Contract` where customer=%s""",(customer))
            for i in customer_contracts:
                print('naaaaaaaaaaa')
                doc = frappe.get_doc('IT Contract', {'name': i[0]})
                doc.workflow_state = 'Completed'
                doc.save()
                doc.submit()

        return 1
    except Exception:
        print(Exception)
        return 0


@frappe.whitelist()
def get_field_values(fieldnames, list_of_invoices):
    data = json.loads(fieldnames.decode("utf-8")) if (fieldnames.decode('utf-8')) else {}
    list_of_invoices = json.loads(list_of_invoices.decode("utf-8")) if (list_of_invoices.decode('utf-8')) else {}
    with_values = []
    for ii in list_of_invoices:

        for i in data:
            with_values.append({ii['link'].strip(): {
                i.strip(): frappe.get_all('Sales Invoice', filters={'name': ii['link'].strip()}, fields=[i.strip()])[0][
                    i.strip()]}})

    return with_values


@frappe.whitelist()
def get_sales_invoice_doc(name):
    return frappe.get_doc("Sales Invoice", {'name': name})


@frappe.whitelist()
def get_list_of_invoices(parent):
    return frappe.db.sql(
        """Select customer,contact,email_address,grand_total,link from `tabIT Invoice Processed` where parent=%s""",
        (parent))


@frappe.whitelist()
def invoice_processing_charged_or_not(start_date, end_date):
    dates = frappe.db.sql("""Select start_date,end_date,name from `tabIT Invoice Processing` where customer is NULL """)
    start_date=datetime.date(int(start_date.split('-')[0]), int(start_date.split('-')[1]), int(start_date.split('-')[2]))
    end_date=datetime.date(int(end_date.split('-')[0]), int(end_date.split('-')[1]), int(end_date.split('-')[2]))
    for i in dates:
        print(type(i[0]))
        print(type(start_date))
        if start_date <= i[0] and (
                        end_date <= i[1] and end_date > i[0]):
            return i[2]
        elif start_date >= i[0] and end_date <= i[1]:
            return i[2]
        elif (start_date >= i[0] and start_date < i[1]) and end_date >= i[1]:
            return i[2]
        elif start_date <= i[0] and end_date >= i[1]:
            return i[2]

@frappe.whitelist()
def check_allow_past_unbilled_acts(name):
    include_unbilled=0
    unbilled_activities=[]
    if len(frappe.db.sql(
            """Select value from `tabSingles` where doctype='IT Services Setup' and field='alert_unbilled'""")) > 0:
        include_unbilled=1
        unbilled_activities=frappe.db.sql("""Select name from `tabIT Unbilled Activities` where parent=%s and parenttype='IT Invoice Processing'""",(name))

    return [include_unbilled,unbilled_activities]

@frappe.whitelist()
def check_unbilled(name):
    req = frappe.db.sql(
        """Select start_date,end_date,name,posting_date,customer from `tabIT Invoice Processing` where name=%s""",
        (name))
    start_date = ''
    end_date = ''
    name = ''
    posting_date = ''
    for i in req:
        customer = i[4]
        start_date = i[0]
        end_date = i[1]
        name = i[2]
        posting_date = i[3]

    if start_date and end_date and name and posting_date:
        alert_unbilled = 0
        unbilled = []
        if len(frappe.db.sql(
                """Select value from `tabSingles` where doctype='IT Services Setup' and field='alert_unbilled'""")) > 0:
            alert_unbilled = frappe.db.sql(
                """Select value from `tabSingles` where doctype='IT Services Setup' and field='alert_unbilled'""")[
                0][0]
        if alert_unbilled:
            contract_tickets = frappe.db.sql("""Select  name from `tabIT Contract` where contract_end_date<%s""",
                                             (start_date))
            for i in contract_tickets:
                tickets = frappe.db.sql("""Select name from `tabIT Ticket` where contract=%s""", (i[0]))
                for ii in tickets:
                    if len(frappe.db.sql(
                        """Select item_code,parent,description,date,name from `tabIT Ticket Detail` where parent=%s and billable_check=1""",
                        (ii[0])))>0:
                        unbilled.append(frappe.db.sql(
                            """Select item_code,parent,description,date,name from `tabIT Ticket Detail` where parent=%s and billable_check=1""",
                            (ii[0])))

            c = 0
            for un in unbilled:

                for u in un:
                    customer = frappe.db.sql("""Select customer from `tabIT Ticket` where name=%s""", (u[1]))[0][0]
                    un_t = frappe.get_doc({
                        'doctype': 'IT Unbilled Activities',
                        'customer': customer,
                        'item': u[0],
                        'parent': name,
                        'ticket': u[1],
                        'description': u[2],
                        'date': u[3],
                        'parenttype': 'IT Invoice Processing',
                        'parentfield': "unbilled_activities",
                        'parentdetail': u[4]
                    })
                    un_t.insert(ignore_permissions=True)
    if unbilled:
        return unbilled


@frappe.whitelist()
def bill_unbilled_activities(unbilled,end,invoice_processing_name):
    data = json.loads(unbilled.decode("utf-8")) if (unbilled.decode('utf-8')) else {}
    to_be_invoiced_ticket_charges=ticket_charged([],'',[],data)
    default_company = frappe.db.sql("""Select defvalue from `tabDefaultValue` where defkey='company'""")[0][0]
    default_currency = frappe.db.sql("""Select defvalue from `tabDefaultValue` where defkey='currency'""")[0][0]
    items = []
    invoice_s = []
    invoice_created = []
    if to_be_invoiced_ticket_charges != None and to_be_invoiced_ticket_charges:
        posting_date=frappe.db.sql("""Select posting_date from `tabIT Invoice Processing` where name=%s""",(invoice_processing_name))[0][0]
        invoice_s = create_invoice(to_be_invoiced_ticket_charges, end, default_company, default_currency, posting_date,
                                   invoice_s, invoice_processing_name)
        for i in invoice_s:

            for ii in frappe.get_all('Sales Invoice', filters={'name': i}, fields={'customer', 'grand_total'}):


                invoice_created.append({'customer': ii['customer'], 'grand_total': ii['grand_total'], 'name': i})
    create_list_of_invoices(invoice_created,frappe.get_doc('Version',{'docname':invoice_processing_name}))
    return 1

@frappe.whitelist()
def update_invoice_processed_email(inp_names):
    data = json.loads(inp_names.decode("utf-8")) if (inp_names.decode('utf-8')) else {}
    print(data)
    for i in data:
        frappe.db.sql("""Update `tabIT Invoice Processed` set send_email=1 where name=%s""",(i))
        link=frappe.db.sql("""Select link from `tabIT Invoice Processed` where name=%s""",(i))[0][0]
        activities=frappe.db.sql("""Select it_ticket_activity_item from `tabSales Invoice Item` where parent=%s""",(link))
        for ii in activities:
            frappe.db.sql("""Update `tabIT Ticket Detail` set billed=1 where name=%s""",(ii[0]))


@frappe.whitelist()
def check_if_updated_total(name,grand_total):
    if len(frappe.db.sql("""Select grand_total from `tabIT Invoice Processed` where link=%s""",(name)))>0:
        if float(grand_total) != frappe.db.sql("""Select grand_total from `tabIT Invoice Processed` where link=%s""",(name))[0][0]:
            frappe.db.sql("""Update `tabIT Invoice Processed` set grand_total=%s where link=%s""",(grand_total,name))
@frappe.whitelist()
def get_default_print_format():
    if len(frappe.db.sql("""Select default_print_format from `tabDocType` where name='Sales Invoice'"""))>0:
        return frappe.db.sql("""Select default_print_format from `tabDocType` where name='Sales Invoice'""")[0][0]