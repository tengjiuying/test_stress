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

    var data = {"OkPercent": 99.28344884294609, "KoPercent": 0.7165511570539176};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7128509338658522, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.7746812926178476, 500, 1500, "log out"], "isController": false}, {"data": [0.0, 500, 1500, "confirm menu"], "isController": false}, {"data": [1.0, 500, 1500, "调试取样器"], "isController": false}, {"data": [0.9013840830449827, 500, 1500, "login"], "isController": false}, {"data": [0.8956091887176505, 500, 1500, "get menu"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 17026, 122, 0.7165511570539176, 2734.1714436743923, 0, 19170, 204.0, 16564.0, 16693.0, 17265.0, 54.57576048979069, 36.67619970970766, 18.35693648928583], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["log out", 3373, 22, 0.6522383634746517, 3724.676845538091, 1, 16707, 182.0, 16596.0, 16635.0, 16690.26, 10.934931806614127, 2.3727833755726007, 3.2137115794217097], "isController": false}, {"data": ["confirm menu", 3428, 22, 0.6417736289381564, 6862.538506417728, 0, 19170, 2693.0, 17079.0, 17265.0, 19027.0, 11.01238089730987, 2.657147486555772, 8.534912678774504], "isController": false}, {"data": ["调试取样器", 3318, 0, 0.0, 0.038577456298975354, 0, 4, 0.0, 0.0, 0.0, 1.0, 11.3700615792666, 4.669341403618339, 0.0], "isController": false}, {"data": ["login", 3468, 13, 0.3748558246828143, 1650.697520184544, 0, 16705, 169.0, 466.0999999999999, 16548.649999999998, 16663.48, 11.117558240553441, 3.381016475777315, 4.398248861355905], "isController": false}, {"data": ["get menu", 3439, 65, 1.8900843268391974, 1378.0572840942139, 0, 16701, 219.0, 430.0, 16514.0, 16651.0, 11.04232624149911, 23.971245129447915, 2.2692305029411957], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer (connect failed)", 14, 11.475409836065573, 0.08222718195700693], "isController": false}, {"data": ["401/UNAUTHORIZED", 24, 19.672131147540984, 0.14096088335486903], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe (Write failed)", 84, 68.85245901639344, 0.49336309174204157], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 17026, 122, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe (Write failed)", 84, "401/UNAUTHORIZED", 24, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer (connect failed)", 14, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["log out", 3373, 22, "401/UNAUTHORIZED", 13, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe (Write failed)", 5, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer (connect failed)", 4, "", "", "", ""], "isController": false}, {"data": ["confirm menu", 3428, 22, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe (Write failed)", 19, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer (connect failed)", 3, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["login", 3468, 13, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe (Write failed)", 12, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer (connect failed)", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["get menu", 3439, 65, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe (Write failed)", 48, "401/UNAUTHORIZED", 11, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer (connect failed)", 6, "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
