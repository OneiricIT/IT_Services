cur_frm.timer = function (distance, status) {
    //console.log(distance);
    countConditions = [
        "Start",
        "Resume"
    ]
    var distance = distance;
    var counter = function () {
        distance = distance + 1000;
        cur_frm.distance = distance;

        var hours = Math.floor((distance) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Output the result in an element with id="demo"
        var hoursText = "";
        var minutesText = "";
        var secondsText = "";
        if (hours < 10) {
            hoursText = "0" + hours + ":";
        } else {
            hoursText = hours + ":";
        }

        if (minutes < 10) {
            minutesText = "0" + minutes + ":";
        } else {
            minutesText = minutes + ":";
        }

        if (seconds < 10) {
            secondsText = "0" + seconds;
        } else {
            secondsText = seconds;
        }
        $('h3[id="Timer"]')[0].innerHTML = hoursText + minutesText + secondsText;
        if (seconds > 0) {
            minutes += 1;
        }
        if ($('h3[id="Timer"]')[1]) {
            $('h3[id="Timer"]')[0].remove();

        }
        cur_frm.billable_time = parseFloat(cur_frm.distance / 60000, 2);
        cur_frm.billable_time = cur_frm.billable_time * 1000;
        cur_frm.billable_time = parseFloat(cur_frm.billable_time / 60000, 2);
        if (cur_dialog && cur_frm.rounded_values) {


                for (var i = 0; i < cur_frm.rounded_values.length; i++) {
                    if(cur_frm.rounded_values[i] == cur_frm.billable_time){
                        cur_dialog.fields_dict.billable_time.input.value = cur_frm.rounded_values[i];
                        break;
                    }else if (cur_frm.rounded_values[i] != cur_frm.billable_time && cur_frm.rounded_values[i] > cur_frm.billable_time) {
                        cur_dialog.fields_dict.billable_time.input.value = cur_frm.rounded_values[i];
                        break;
                    }
                }


        }
        //console.log(cur_frm.billable_time);

    }

    if (countConditions.indexOf(status) >= 0) {
        cur_frm.x = setInterval(counter, 1000);
    } else {
        clearInterval(cur_frm.x);
        if (!cur_frm.distance) {
            cur_frm.distance = 0000000000000;
        }
        if (distance) {
            cur_frm.distance = distance;
        }
        var hours = Math.floor((cur_frm.distance) / (1000 * 60 * 60));
        var minutes = Math.floor((cur_frm.distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((cur_frm.distance % (1000 * 60)) / 1000);

        // Output the result in an element with id="demo"
        var hoursText = "";
        var minutesText = "";
        var secondsText = "";
        if (hours < 10) {
            hoursText = "0" + hours + ":";
        } else {
            hoursText = hours + ":";
        }

        if (minutes < 10) {
            minutesText = "0" + minutes + ":";
        } else {
            minutesText = minutes + ":";
        }

        if (seconds < 10) {
            secondsText = "0" + seconds;
        } else {
            secondsText = seconds;
        }
        if ($('h3[id="Timer"]')[0]) {
            $('h3[id="Timer"]')[0].innerHTML = hoursText + minutesText + secondsText;

        }
        if ($('h3[id="Timer"]')[1]) {
            $('h3[id="Timer"]')[0].remove();

        }
        if (seconds > 0) {
            minutes += 1;
        }
        cur_frm.billable_time = parseFloat(cur_frm.distance / 60000, 2);
        cur_frm.billable_time = cur_frm.billable_time * 1000;
        cur_frm.billable_time = parseFloat(cur_frm.billable_time / 60000, 2);
        //console.log(cur_frm.billable_time / 60000);
        if (cur_dialog && cur_frm.rounded_values) {


                for (var i = 0; i < cur_frm.rounded_values.length; i++) {
                    if(cur_frm.rounded_values[i] == cur_frm.billable_time){
                        cur_dialog.fields_dict.billable_time.input.value = cur_frm.rounded_values[i];
                        break;
                    }else if (cur_frm.rounded_values[i] != cur_frm.billable_time && cur_frm.rounded_values[i] > cur_frm.billable_time) {
                        cur_dialog.fields_dict.billable_time.input.value = cur_frm.rounded_values[i];
                        break;
                    }
                }


        }


       //console.log(cur_frm.billable_time);

    }
}