$(document).ready(function() {
  var id_select;
    $.ajax({
        url: "/api/list_dives"
    }).then(function(data) {
      //console.log(data);
      localStorage.setItem("dives", JSON.stringify(data));
      data.rows.forEach(function(doc) {
        //console.log(doc.id);
        var date = doc.doc.StartTime + '';
        var date2 = date.split("T")[0];
        $(".list").append('<li class="nav-item" id="'+doc.id+'"><a href="#"> '+date2+'</a></li>');
      });
    });

    $(document).on("click", ".nav-item", function () {
      $("#curve_chart").show();;
      var val1 = jQuery(this).attr("id");
      var details = JSON.parse(localStorage.getItem("dives"))
      console.log(details);
      details.rows.forEach(function(doc) {
        var val2 = doc.id;
        //console.log (val1 + " " + val2);
        if (val1 == val2)
          {
            id_select = val2;
            //console.log("OK");
            //console.log(doc.doc.club);
            var duration = doc.doc.Duration/60;
            $('.display-dive-time').html(duration.toFixed(2) + "min");
            $('.display-max-depth').html(doc.doc.MaxDepth + "m");
            $('.display-avg-depth').html(doc.doc.AvgDepth + "m");
            $('.club').html(doc.doc.club);
            $('.display-latitude').html(doc.doc.latitude );
            $('.display-longitude').html(doc.doc.longitude );

            var dive_detail = doc.doc.samples[0]["Dive.Sample"];
            google.charts.load('current', {'packages':['line']});
            google.charts.setOnLoadCallback(drawChart);
            function drawChart() {

              var data_dives = new google.visualization.DataTable();
              data_dives.addColumn('number', 'Time');
              data_dives.addColumn('number', 'Depth');
              //data_dives.addColumn('number', 'Temperature');
              data_dives.addColumn('number', 'Pressure');

              for(var i in dive_detail)
              {
                   var Temperature = dive_detail[i].Temperature;
                   var Pressure = dive_detail[i].Pressure;
                   var Depth = - dive_detail[i].Depth; // to put the chart in the right way
                   var Time = dive_detail[i].Time;

                   myTemp = parseFloat($.trim(Temperature));
                   myDepth = parseFloat($.trim(Depth));
                   myPressure = parseFloat($.trim(Pressure)) / 1000;
                   myTime = parseFloat($.trim(Time)) / 60;
                   //data_dives.addRow([{v: myDepth, f: myDepth.toFixed(2)},{v: myTemp, f: myTemp.toFixed(2)},{v: myPressure, f: myPressure.toFixed(2)}]);
                   data_dives.addRow([{v: myTime, f: myTime.toFixed(2)},{v: myDepth, f: myDepth.toFixed(2)},{v: myPressure, f: myPressure.toFixed(2)}]);
                   //data_dives.addRow([myTime,{v: myDepth, f: myDepth.toFixed(2)}]);
              }

              var options = {
                title: 'Dive Details',
                curveType: 'function',
                legend: { position: 'bottom' },
                series: {
                    // Gives each series an axis name that matches the Y-axis below.
                    0: {axis: 'Depth'},
                    1: {axis: 'Pressure'}
                  },
                axes: {
                  x: {
                    0: {side: 'top'}},
                    y: {
                       Depth: {label: 'Depth (meter)'},
                       Pressure: {label: 'Tank Pressure (bars)'}
                  }
                }
              };
              var chart = new google.charts.Line(document.getElementById('curve_chart'));
              chart.draw(data_dives, options);
            }
          }
        });
    });



    document.getElementById('container').onclick = function(event) {
        var span, input, text;
        // Get the event (handle MS difference)
        event = event || window.event;
        // Get the root element of the event (handle MS difference)
        span = event.target || event.srcElement;

        // If it's a span...
        if (span && span.tagName.toUpperCase() === "SPAN") {
          // Hide it
          span.style.display = "none";

          // Get its text
          text = span.innerHTML;

          // Create an input
          input = document.createElement("input");
          input.type = "text";
          input.size = Math.max(text.length / 4 * 3, 4);
          span.parentNode.insertBefore(input, span);

          // Focus it, hook blur to undo
          input.focus();
          input.onblur = function() {
            // Remove the input
            span.parentNode.removeChild(input);

            // Update the span
            span.innerHTML = input.value;
            var arr;
            if(span.className.indexOf("display-latitude")!=-1) arr = "{\"name\":\""+id_select+"\",\"club\":\"NULL\",\"latitude\":\""+input.value+"\",\"longitude\":\"NULL\",\"divesite\":\"NULL\"}";
            if(span.className.indexOf("display-longitude")!=-1) arr = "{\"name\":\""+id_select+"\",\"club\":\"NULL\",\"latitude\":\"12.345\",\"longitude\":\""+input.value+"\",\"divesite\":\"NULL\"}";
            if(span.className.indexOf("club")!=-1) arr = "{\"name\":\""+id_select+"\",\"club\":\""+input.value+"\",\"latitude\":\"NULL\",\"longitude\":\"NULL\",\"divesite\":\"NULL\"}";
            if(span.className.indexOf("dive-site")!=-1) arr = "{\"name\":\""+id_select+"\",\"club\":\"NULL\",\"latitude\":\"NULL\",\"longitude\":\"NULL\",\"divesite\":\""+input.value+"\"}";
            /// AJAX callback

            var test = JSON.parse(arr);

            var settings = {
              url: '/update/dive',
              method: 'POST',
              contentType: 'application/json; charset=utf-8',
              data: JSON.stringify(test)
            }
            console.log(arr);
            $.ajax(settings).done(function (response) {
              console.log(response);

            });
            // Show the span again
            span.style.display = "";
          };
        }
      };



});

var refresh_cache = function()
{
  console.log("REFRESH");
  $.ajax({
      url: "/api/list_dives"
  }).then(function(data) {
    console.log(data);
    localStorage.setItem("dives", JSON.stringify(data));
  });
}


/*
console.log(doc.doc.AvgDepth);
console.log(doc.doc.Duration);
console.log(doc.doc.MaxDepth);
var duration = doc.doc.Duration/60;
$('.display-dive-time').html(duration.toFixed(2) + "min");
$('.display-max-depth').html(doc.doc.MaxDepth + "m");
$('.display-avg-depth').html(doc.doc.AvgDepth + "m");
*/
