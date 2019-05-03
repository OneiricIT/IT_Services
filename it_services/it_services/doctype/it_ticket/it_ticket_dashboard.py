from frappe import _

def get_data():
	return {
		'transactions': [
			{
				'label': _('Customer'),
				'items': []
			},
			{
				'label': _('Assigned To'),
				'items': ['Purchase Order']
			},
			{
				'label': _('Ticket'),
				'items': []
			},
			{
				'label': _('Ticket Opened'),
				'items': []
			},
			{
				'label': _('Address'),
				'items': []
			},
			{
				'label': _('Ticket Due'),
				'items': []
			},
		]
	}