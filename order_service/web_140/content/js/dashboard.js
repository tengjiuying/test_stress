/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.6508786221343, "KoPercent": 0.34912137786570463};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7335912952403119, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.8772446276125994, 500, 1500, "log out"], "isController": false}, {"data": [0.0, 500, 1500, "confirm menu"], "isController": false}, {"data": [1.0, 500, 1500, "调试取样器"], "isController": false}, {"data": [0.8546910755148741, 500, 1500, "login"], "isController": false}, {"data": [0.9457085253456221, 500, 1500, "get menu"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 17186, 60, 0.34912137786570463, 2483.039334341919, 0, 19040, 189.0, 16290.0, 16672.0, 17103.390000000003, 55.77153983449619, 37.213588147006334, 18.826477060684734], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["log out", 3397, 11, 0.32381513099793935, 1997.627318221961, 1, 16683, 153.0, 13915.0, 16610.1, 16651.02, 11.153392804961733, 2.3501742512419104, 3.286359133010037], "isController": false}, {"data": ["confirm menu", 3465, 11, 0.31746031746031744, 7099.994805194816, 0, 19040, 2695.0, 16992.0, 17098.0, 17359.68, 11.269575398825882, 2.6160053278421938, 8.763605461190705], "isController": false}, {"data": ["调试取样器", 3356, 0, 0.0, 0.04410011918951143, 0, 2, 0.0, 0.0, 0.0, 1.0, 11.30640145810803, 4.643543616481876, 0.0], "isController": false}, {"data": ["login", 3496, 10, 0.28604118993135014, 2371.035469107552, 1, 16683, 219.0, 16530.0, 16598.0, 16640.0, 11.346155094410655, 3.419252357832287, 4.495080530195831], "isController": false}, {"data": ["get menu", 3472, 28, 0.8064516129032258, 863.1347926267301, 1, 16647, 190.0, 377.0, 507.3499999999999, 16585.0, 11.285294987599828, 24.427803578741912, 2.3432395898679377], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer (connect failed)", 8, 13.333333333333334, 0.04654951704876062], "isController": false}, {"data": ["401/UNAUTHORIZED", 18, 30.0, 0.10473641335971139], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe (Write failed)", 34, 56.666666666666664, 0.19783544745723264], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 17186, 60, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe (Write failed)", 34, "401/UNAUTHORIZED", 18, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer (connect failed)", 8, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["log out", 3397, 11, "401/UNAUTHORIZED", 10, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer (connect failed)", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["confirm menu", 3465, 11, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe (Write failed)", 8, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer (connect failed)", 3, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["login", 3496, 10, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe (Write failed)", 7, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer (connect failed)", 3, "", "", "", "", "", ""], "isController": false}, {"data": ["get menu", 3472, 28, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe (Write failed)", 19, "401/UNAUTHORIZED", 8, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer (connect failed)", 1, "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
