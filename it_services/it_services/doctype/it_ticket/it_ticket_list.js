frappe.listview_settings['IT Ticket'] = {
    filters: [["status", "not in", "Completed,Cancelled"]],
};
var xx = setInterval(function () {
    if (cur_list) {
        cur_list.setFilterNameColor = function (ele) {

            if (event.key == "Enter") {
                //if conditions here, use ele.value for the filter name
                //console.log('ok')
                // for (var i = 5; i < $('li[class="list-link"]').length; i++) {
                //     console.log($('li[class="list-link"]')[i]);
                //     if ($('li[class="list-link"]')[i]) {
                //         if ($('li[class="list-link"]')[i].children[0].innerText == "Hold") {
                //             $('li[class="list-link"]')[i].children[0].style = "max-width: 90%;background-color: blue";
                //         }
                //     }
                // }
            }
        }
        var x = setInterval(function () {
            //console.log($('input[placeholder="Filter Name"]'))
            if ($('input[placeholder="Filter Name"]').length) {
                //console.log($('li[class="list-link"]').length)
                for (var i = 0; i < $('li[class="list-link"]').length; i++) {
                    //console.log($('li[class="list-link"]')[i]);
                    if ($('li[class="list-link"]')[i]) {
                        if ($('li[class="list-link"]')[i].dataset.view == null) {
                            $('li[class="list-link"]')[i].style = "text-align: center;";
                        }
                        if ($('li[class="list-link"]')[i].children[1]) {
							$('li[class="list-link"]')[i].children[1].innerHTML = "";
						}
                        if ($('li[class="list-link"]')[i].children[0].innerText == "New") {
                            $('li[class="list-link"]')[i].children[0].style = "max-width: 90%; min-width: 60%; background-color: #ff5858; color: white;";
                        }
                        if ($('li[class="list-link"]')[i].children[0].innerText == "Hold") {
                            $('li[class="list-link"]')[i].children[0].style = "max-width: 90%; min-width: 60%; background-color: #5e64ff; color: white;";
                        }
                        if ($('li[class="list-link"]')[i].children[0].innerText == "Scheduled") {
                            $('li[class="list-link"]')[i].children[0].style = "max-width: 90%; min-width: 60%; background-color: #5e64ff; color: white;";
                        }
                        if ($('li[class="list-link"]')[i].children[0].innerText == "Pending") {
                            $('li[class="list-link"]')[i].children[0].style = "max-width: 90%; min-width: 60%; background-color: #ffa00a; color: white;";
                        }
                        if ($('li[class="list-link"]')[i].children[0].innerText == "Completed") {
                            $('li[class="list-link"]')[i].children[0].style = "max-width: 90%; min-width: 60%; background-color: #98d85b; color: white;";
                        }
                        if ($('li[class="list-link"]')[i].children[0].innerText == "Internal") {
                            $('li[class="list-link"]')[i].children[0].style = "max-width: 90%; min-width: 60%; background-color: black; color: white;";
                        }
                    }
                }
                // $('input[placeholder="Filter Name"]')[0].onkeydown = function (event) {
                //     cur_list.setFilterNameColor(this);
                // }
                clearInterval(x);
            }
        }, 100)
        clearInterval(xx);
    }
}, 100)
