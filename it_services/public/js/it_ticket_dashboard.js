var dashboard = `<div class="section-head"></div>
<div class="section-body">
    <div class="form-dashboard-wrapper">
        <div class="progress-area hidden form-dashboard-section"></div>
        <div class="form-heatmap hidden form-dashboard-section">
            <div id="heatmap-it_ticket" class="heatmap"></div>
            <div class="text-muted small heatmap-message hidden"></div>
        </div>
        <div class="form-graph form-dashboard-section hidden"></div>
        <div class="form-stats form-dashboard-section hidden">
            <div class="row"></div>
        </div>
        <div class="form-links form-dashboard-section">
            <div class="transactions">
                <div class="form-documents">
                    <div class="row">
                        <div class="col-xs-3">
							<b>Customer:</b>
                        </div>
						<div class="col-xs-3"></div>
                        <div class="col-xs-3">
							<b>Assigned To:</b>
                        </div>
                    </div>
					<div class="row">
                        <div class="col-xs-3">
							<a href="/desk#form/customer/" id="customer"></a>
                        </div>
						<div class="col-xs-3"></div>
                        <div class="col-xs-3">
							<a id="assigned_to"></a>
                        </div>
                    </div>
					
					
                    <div class="row">
                        <div class="col-xs-3">
							<b>Contact:</b>
						</div>
						<div class="col-xs-3">
						</div>
                        <div class="col-xs-3">
							<b>Ticket Opened:</b>
                        </div>
                    </div>
					
					<div class="row">
                        <div class="col-xs-3">
							<a id="contact_display"></a>
						</div>
						<div class="col-xs-3">
						</div>
                        <div class="col-xs-3">
							<a id="open_date"></a>
                        </div>
                    </div>
					
                    <div class="row">
                        <div class="col-xs-3">
							<b>Address:</b>
                        </div>
						<div class="col-xs-3"></div>
                        <div class="col-xs-3">
							<b>Ticket Due:</b>
                        </div>
                    </div>
					<div class="row">
                        <div class="col-xs-3">
							<a id="address_display"></a>
                        </div>
						<div class="col-xs-3"></div>
                        <div class="col-xs-3">
							<a id="due_date"></a>
                        </div>
                    </div>
					
					<div class="row">
						<div class="col-xs-3"></div>
						<div class="col-xs-3"></div>
						<div class="col-xs-3">
							<b>Priority:</b>
                        </div>
					</div>
					<div class="row">
						<div class="col-xs-3"></div>
						<div class="col-xs-3"></div>
						<div class="col-xs-3">
							<a id="priority"></a>
                        </div>
					</div>
                </div>
            </div>
        </div>
    </div>
</div>`;