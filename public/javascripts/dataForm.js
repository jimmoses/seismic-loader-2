//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Form Configuration
var
    g_container = document.getElementById('inputTable'), //Form container
    g_hot; //Handsontable instance of form
    var g_showRowCol = false;
// Row and column offset denote the row and column number where actual data entry begins
var g_rowOffset = 2;
var g_colOffset = 0;
// Get the form name
var g_formMode = window.location.hash || "#hsd-water-consumption";  //Defaults to HSD Water Consumption
// Indicates the form mode: 1 for edit, 2 for new upload
var g_entryMode = 0;
// Set according to g_formMode. Used to get the desired database columns and header fields according to the form.
var g_index = 0;
var g_lock = {
        "#hsd-water-consumption"   : false
    };
// Holds the data fetched from the database 
var g_fetchedData = [];
var g_rignames;
// The columns with datatype text in the database are appended with _string to get the type. It is to be removed when accessing the actual column in DB.
// Similarly date columns must be appended with date. 
var g_dbCols = [
    ["Entry_Date", "Rig_Name_String", "Engine_1", "Engine_2", "Engine_3", "Engine_4", "Engine_5", "Total_Running_Hrs", "Diesel_Consumption_L", "Use_of_Diesel_Mud",
    "Use_of_diesel_Cem", "Use_of_Diesel_Cranes", "Use_of_diesel_Misc", "Total_Misc", "Consumption_by_Engines_L", "Consumption_by_Engines_KL", "Remarks_String", "PW_Consumed",
    "DW_Consumed", "Water_Produced_RO", "Water_Produced_Maker", "Total_Production", "Total_Water_Consumption"]
];

// Titles settings: These are the titles displayed as column headers in handsontable grid. 
var g_headerFields = [
    ["Date","Rig Name","Running Hours Per Day","","","","","Total Running Hrs", "Diesel Consumption for Day (In L)", "Use of Diesel in Micellaneous Activity (To be certified by ) (in L)","","","","Total Micellaneous (L)", "Consumption by Engines (In L)", "Consumption (KL/DAY)", "Remarks(If Any)", "PW Cosumed(MT)", "DW Cosumed(MT)", "Water Produced by (in MT)","", "Total Production", "TOTAL WATER Consumption (MT)"],
    ["","","Engine 1", "Engine 2", "Engine 3", "Engine 4", "Engine 5","","","Mud(Chemist)","Cementing (Cementing engineer)","Cranes(OIM)","Micellaneous(OIM)","","","","","","","RO","Water Maker","",""]
]

// Column merge settings for the handsontable grid. 
var g_headerMergeCells = [
    {row: 0, col: 2, rowspan: 1, colspan: 5},
    {row: 0, col: 9, rowspan: 1, colspan: 4},
    {row: 0, col: 19, rowspan: 1, colspan: 2}
];

// Data format in the handsontable grid.
var g_colTypes = [
    {
        type: 'date',
        dateFormat: 'DD/MM/YYYY',
        correctFormat: true,
    },
    {
        type: 'dropdown',
        source: g_rignames,
        trimDropdown: false,
        allowIndvalid: false
    },
    {
        type: 'numeric',
        numericFormat: {
            pattern: '0.00'
        },
    },
    {
        type: 'numeric',
        numericFormat: {
            pattern: '0.00'
        }
    },
    {
        type: 'numeric',
        numericFormat: {
            pattern: '0.00'
        }
    },
    {
        type: 'numeric',
        numericFormat: {
            pattern: '0.00'
        }
    },
    {
        type: 'numeric',
        numericFormat: {
            pattern: '0.00'
        }
    },
    {
        type: 'numeric',
        numericFormat: {
            pattern: '0.00'
        },
        editor: false
    },
    {
        type: 'numeric',
        numericFormat: {
            pattern: '0,0.00'
        }
    },
    {
        type: 'numeric',
        numericFormat: {
            pattern: '0.00'
        }
    },
    {
        type: 'numeric',
        numericFormat: {
            pattern: '0.00'
        }
    },
    {
        type: 'numeric',
        numericFormat: {
            pattern: '0.00'
        }
    },
    {
        type: 'numeric',
        numericFormat: {
            pattern: '0.00'
        }
    },
    {
        type: 'numeric',
        numericFormat: {
            pattern: '0.00'
        },
        editor: false
    },
    {
        type: 'numeric',
        numericFormat: {
            pattern: '0,0.00'
        },
        editor: false
    },
    {
        type: 'numeric',
        numericFormat: {
            pattern: '0.00'
        },
        editor: false
    },
    {
        type: 'text'
    },
    {
        type: 'numeric',
        numericFormat: {
            pattern: '0.00'
        }
    },
    {
        type: 'numeric',
        numericFormat: {
            pattern: '0.00'
        }
    },
    {
        type: 'numeric',
        numericFormat: {
            pattern: '0.00'
        }
    },
    {
        type: 'numeric',
        numericFormat: {
            pattern: '0.00'
        }
    },
    {
        type: 'numeric',
        numericFormat: {
            pattern: '0.00'
        },
        editor: false
    },
    {
        type: 'numeric',
        numericFormat: {
            pattern: '0,0.00'
        },
        editor: false
    },
];
/*------------------------------------------------------------------------------------------------------------------------------------*/

// Header formatting
function headerRenderer(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);
    td.style.fontWeight = 'bold';
    td.style.color = '#4c4c4c';
    if(col >=9 && col <= 12) td.style.background = '#FFE5B4';
    else if(col >= 17 && col <=21) td.style.background = '#F0FFFF';
    else if(col == 22) td.style.background = '#89CFF0';
    else td.style.background = '#FFFFC5';
}

// Formatting applied to certain columns in handsontable
function diffRenderer(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);
    if(col >=9 && col <= 12) td.style.background = '#FFE5B4';
    else if(col >= 17 && col <=21) td.style.background = '#F0FFFF';
    else if(col == 22) td.style.background = '#89CFF0';
}

function disabledRenderer(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);    
    td.style.color = '#4c4c4c';
    td.style.background = '#f6f6f6';
}

// Date formatting in the format ('YYYY-MM-DD')
function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// UI Changes to be made according to form mode. g_index can be used to access the correct UI features. 

switch (g_formMode) {
    case "#hsd-water-consumption": g_index = 0; //Default Layout - do nothing
        break;
    default:
        //Do nothing
        break;
}

function fetchRigNames() {
    fetch(`/read-list/rigs`)
        .then(response => {
            return response.json();
        })
        .then( response => {
            if(response.status=="success"){
            g_rignames = response.data.flat(1);
            g_colTypes[1].source = g_rignames;
            g_hot.updateSettings({
                columns: g_colTypes
            });
            g_hot.render();
            console.log("Hi");
        }
    })
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Main Handsontable definition

g_hot = new Handsontable(g_container, {
    // columns: g_headerFields[0],
    data: JSON.parse(JSON.stringify(g_headerFields)),
    rowHeaders: true,
    colHeaders: false,
    fixedColumnsLeft: 2,
    fixedRowsTop: 2,
    allowInsertRow: true,
    contextMenu: true,
    preventOverflow: 'horizontal',
    mergeCells: g_headerMergeCells,
    scrollV: 'auto',
    // stretchH: "all",
    contextMenu: ["cut", "copy"],
    cells: function (row, col) {
        var cellProperties = {};       
        if(row == 0 || row==1) {
            cellProperties.renderer = headerRenderer; // uses function directly
            cellProperties.className = "htCenter htMiddle";
            cellProperties.readOnly = true; 
        }
        if(row > 1) {
            cellProperties.renderer = diffRenderer; // uses function directly
            cellProperties.className = "htCenter htMiddle";
        }
        return cellProperties;
    },
    columns: g_colTypes,
    allowInvalid: true,
    afterChange: function (changes, source) {
        console.log(source);
        // if(source !="autosum") console.log(changes,source);
        if(["header","loadData","populateFromArray"].indexOf(source) >-1) return;
        if(source == "autosum") autosum2(changes);
        else autoSum(changes);
    }
});


// To tackle the hanging of editor
$("#inputTable").bind("mouseleave", function () {
    if (g_hot.getActiveEditor() && g_hot.getActiveEditor().$datePicker) {
        //If it is a date-picker, do nothing
        $(".htDatepickerHolder").bind("mouseleave", function () {
            g_hot.destroyEditor();//This is to prevent the nasty hanging editor issue
        });
    }
    else {
        g_hot.destroyEditor();
        g_handson_filter = 0;
    }
});

////////////////////////////////////////////////////////////////////////////
// Initial Checking
g_init();


function g_init(){

    //Checks session and sets display of options accordingly
    checkSession()
    .then(response => {
        console.log(response);
        if(response == "logged in"){
            //Show username
            document.querySelector('#mnu_username').innerHTML = "Welcome Test User";
            fetchRigNames();
        }
        else if (response == "not logged in") window.location.href="index.html";
    })
    .catch((error) => {
        console.error(error);
    });
}

///////////////////////////////////////////////////////////////////////////
// Common functions 
function hideForm(){
    document.getElementById('sorry').setAttribute('hidden', 'hidden'); 
    document.getElementById("inputTable").setAttribute("hidden","hidden");
    document.getElementById("btn_save").setAttribute("hidden","hidden");
    document.getElementById("message").setAttribute("hidden","hidden");
}

function showForm(message){
    document.getElementById("inputTable").removeAttribute("hidden");
    document.getElementById("btn_save").removeAttribute("hidden");
    document.getElementById("btn_fetch").removeAttribute("hidden");
    document.getElementById("btn_upload").removeAttribute("hidden");
    document.getElementById("message").removeAttribute("hidden");
    document.getElementById("message").innerText = message;
}

function clearGrid(){
    g_hot.updateSettings({
        cells: function (row, col) {
            var cellProperties = {};       
            if(row == 0 || row==1) {
                cellProperties.renderer = headerRenderer; // uses function directly
                cellProperties.className = "htCenter htMiddle";
                cellProperties.readOnly = true; 
            }
            if(row > 1) {
                cellProperties.renderer = diffRenderer; // uses function directly
                cellProperties.className = "htCenter htMiddle";
            }
            return cellProperties;
        },
    });
    g_hot.deselectCell();
    if(g_hot.countRows() > 2)
        g_hot.alter('remove_row',g_rowOffset, g_hot.countRows() - 2);
    setTimeout(() => {
        g_hot.render();
    }, 100);
}

////////////////////////////////////////////////////////////////////////////
// Function for fetching data and rendering to grid
// Calls to dataFormOperations.js
function fetchRecord(){
    let financial_year = document.querySelector("#financial_year").value;
    document.getElementById('sorry').setAttribute('hidden', 'hidden');
    x = new bootstrap.Modal(document.getElementById('wait-modal'));
    x.show();
    fetch(encodeURI("/dataform/read" + "/hsd-water" + "/financial-year/" + financial_year))
    .then( response => {
        return response.json();
    })
    .then( response => {
        // console.log(response);
        clearGrid();
        if(response.data.length > 0) {
            let message = "Fetched current records. You can edit the existing records here and click on Save."
            let data = [];
            for(let i = 0;i<response.data.length;i++) {
                let row = Object.keys(response.data[i]).map((k) => response.data[i][k])
                data.push(row);
            }    
            x.hide();
            renderGrid_year(data); 
            showForm(message);
            setTimeout(() => {
                g_hot.render();
            }, 100)
            g_entryMode = 1;
        }
        else {
            x.hide(); 
            document.getElementById('sorry').innerHTML = '<strong>Sorry!</strong> There are no records to display';
            document.getElementById('sorry').removeAttribute('hidden');
            $("#sorry").fadeTo(2000, 500).slideUp(500, function(){
                $("#sorry").slideUp(500);
            });
        }
    })
}

// Populate grid with data 
function renderGrid_year(data){
    //Target array for placing the data
    g_hot.alter('insert_row', g_rowOffset, data.length);
    let targetArray = g_hot.getData(g_rowOffset, g_colOffset, g_rowOffset + data.length - 1, g_colOffset+g_headerFields[0].length - 1);
    let counter=0;
    while (counter<data.length) {    
        const row = g_rowOffset + counter;    
        for (let i = 0; i < g_headerFields[0].length; i++) {
            const val = data[counter][i];
            targetArray[counter][i] = val;
        }
        counter++;
    }
    //Store for comparison
    g_fetchedData = JSON.parse(JSON.stringify(targetArray));
    g_hot.populateFromArray(g_rowOffset, g_colOffset, targetArray);
}

///////////////////////////////////////////////////////////////////////////
// Function to create empty grid to upload new data
function createEmptyGrid() {
    hideForm();
    clearGrid();
    g_hot.alter('insert_row', g_rowOffset, 200);
    let message = "Upload new data by entering or pasting values into the grid and clicking on Save"
    showForm(message);
    setTimeout(() => {
        g_hot.render();
    }, 100);
    g_entryMode = 2;
    document.getElementById('sorry').setAttribute('hidden', 'hidden'); 
}

////////////////////////////////////////////////////////////////////////////
// Functions for saving data
// Calls to dataFormOperations.js
function saveChanges() {
    switch(g_entryMode) {
        case 0: 
            document.getElementById('sorry').innerHTML = '<strong>Sorry!</strong>There are no changes to save'
            document.getElementById('sorry').removeAttribute('hidden');
            break;
        case 1: //Edit Mode
            //Read current data
            let changedData = g_hot.getData(
                g_rowOffset,                                    //Start Row
                g_colOffset,                                    //Start Column
                g_rowOffset + g_hot.countRows() - 3,            //End Row
                g_colOffset + g_headerFields[0].length - 1);    //End Column
            let changes = [];
            // Compare with fetched data
            for (let row = 0; row < changedData.length; row++) {
                for (let col = 0; col < changedData[row].length; col++) {
                    g_fetchedData[row][col] = (g_fetchedData[row][col] == null )? "" : g_fetchedData[row][col];
                    changedData[row][col] = (changedData[row][col] == null )? "" : changedData[row][col];                        
                    if (changedData[row][col] === g_fetchedData[row][col]) {
                        // No Change
                    }
                    else {
                        let tempChange = {
                            VALUE: changedData[row][col].toString().trim(),
                            ROW_INDEX: row,
                            COL_NAME: g_dbCols[g_index][col].toUpperCase()
                        };
                        changes.push(tempChange);
                    }
                }
            }
            if(changes.length == 0) {
                $("#sorry").innerHTML = '<strong>Sorry!</strong>There are no changes to save'
                document.getElementById('sorry').removeAttribute('hidden'); 
                $("#sorry").fadeTo(2000, 500).slideUp(500, function(){
                    $("#sorry").slideUp(500);
                });
                return;
            }
            changes = Object.values(Object.groupBy(changes, ({ ROW_INDEX }) => ROW_INDEX));
            console.log(changes);
            let valueUpdate = false;
            fetch(`/dataform/update/hsd-water/${document.querySelector("#financial_year").value}`,{
                headers: { "Content-Type": "application/json" },
                method: "put",
                body: JSON.stringify({changes: changes})
            })
            .then( response => {
                return response.json();
            })
            .then( response => {
                console.log(response);
                if(response.status == "success")
                    valueUpdate = true;
                //Update fetched data array
                if (valueUpdate){
                    g_fetchedData = JSON.parse(JSON.stringify(changedData));
                    document.getElementById('sorry').innerHTML = '<strong>Success!</strong>Records Updated Successfully'
                    document.getElementById('sorry').removeAttribute('hidden'); 
                    $("#sorry").fadeTo(2000, 500).slideUp(500, function(){
                        $("#sorry").slideUp(500);
                    });
                }
                else{
                    document.getElementById('sorry').innerHTML = '<strong>Failure!</strong>Error encountered while updating'
                    document.getElementById('sorry').removeAttribute('hidden'); 
                    $("#sorry").fadeTo(2000, 500).slideUp(500, function(){
                        $("#sorry").slideUp(500);
                    });
                }
            })
            break;
        case 2: //New Data Entry
            let newData = g_hot.getData(
                g_rowOffset,                                    //Start Row
                g_colOffset,                                    //Start Column
                g_rowOffset + g_hot.countRows() - 3,            //End Row
                g_colOffset + g_headerFields[0].length - 1);    //End Column
            //Convert to array of objects from array of arrays
            let insertData = [];
            //Remove null rows
            newData = newData.filter(o => Object.values(o).join(''));
            insertData = newData.map(function(item){ 
                let obj = {};
                for(i = 0;i<g_dbCols[g_index].length;i++) {
                   if(g_dbCols[g_index][i].toUpperCase().indexOf('STRING') <= -1 && g_dbCols[g_index][i].toUpperCase().indexOf('DATE') <= -1) {
                       if(item[i] == null || item[i].toString().trim() === '' || !item[i].toString().trim()) {
                        obj[g_dbCols[g_index][i].toUpperCase()] = 0;
                       }
                       else obj[g_dbCols[g_index][i].toUpperCase()] = item[i];
                   }
                   else obj[g_dbCols[g_index][i].toUpperCase()] = item[i]==null?'':item[i];
                }
                return obj;
              });
            console.log(insertData);
            //Send to oracle
            fetch(`/dataform/insert/hsd-water/${document.querySelector("#financial_year").value}`,{
                headers: { "Content-Type": "application/json" },
                method: "post",
                body: JSON.stringify({data: insertData})
            })
            .then( response => {
                return response.json();
            })
            .then( response => {
                console.log(response);
                if (response.status == "success"){
                    document.getElementById('sorry').innerHTML = '<strong>Success!</strong>Records Uploaded Successfully'
                    document.getElementById('sorry').removeAttribute('hidden'); 
                    $("#sorry").fadeTo(2000, 500).slideUp(500, function(){
                        $("#sorry").slideUp(500);
                    });
                    hideForm();
                }
                else{
                    document.getElementById('sorry').innerHTML = '<strong>Failure!</strong>Error encountered while uploading'
                    document.getElementById('sorry').removeAttribute('hidden'); 
                    $("#sorry").fadeTo(2000, 500).slideUp(500, function(){
                        $("#sorry").slideUp(500);
                    });
                }
            })
    }
}

function login(user,password){
    let formData = new FormData();
    formData.append('user', user);
    formData.append('password', password);
    const dataToSend = new URLSearchParams(formData);
    
    fetch("/session/login",{
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        method: "post",
        body: dataToSend
    })
    .then( response => {      
        return response.json();
    })
    .then( response => {
        console.log(response);
        if(response.status == "success"){
            document.querySelector("#btn_login").setAttribute("hidden","hidden");
            document.querySelector("#btn_fetch").removeAttribute("hidden");
            document.querySelector("#btn_save").removeAttribute("hidden");
        }
    })
    .catch((error) => {
        console.error(error);
    });
}

///////////////////////////////////////////////////////////////////////////////////////
// Function to auto populate data according to formulas
function autoSum(changes){
        console.log(changes);
        let i = 0;
        let changedColumn = changes[i][1];
        let updateColumn;
        let updateValue;
        if(changedColumn >= 2 && changedColumn <= 6) {
            updateColumn = 7;
            updateValue = g_hot.getDataAtCell(changes[i][0], 2) + g_hot.getDataAtCell(changes[i][0], 3) + g_hot.getDataAtCell(changes[i][0], 4) + 
                        g_hot.getDataAtCell(changes[i][0], 5) + g_hot.getDataAtCell(changes[i][0], 6);
            g_hot.setDataAtCell(changes[i][0], updateColumn, updateValue,"autosum");
        }
        else if(changedColumn == 8) {
            updateColumn = 14;
            updateValue = g_hot.getDataAtCell(changes[i][0], 8) - g_hot.getDataAtCell(changes[i][0], 13);
            g_hot.setDataAtCell(changes[i][0], updateColumn, updateValue,"autosum");
        }
        else if(changedColumn >= 9 && changedColumn <= 12) {
            updateColumn = 13;
            updateValue = g_hot.getDataAtCell(changes[i][0], 9) + g_hot.getDataAtCell(changes[i][0], 10) + g_hot.getDataAtCell(changes[i][0], 11) + 
            g_hot.getDataAtCell(changes[i][0], 12);
            g_hot.setDataAtCell(changes[i][0], updateColumn, updateValue,"autosum");
        } 
        else if(changedColumn >= 17 && changedColumn <= 18) {
            updateColumn = 22;
            updateValue = g_hot.getDataAtCell(changes[i][0], 17) + g_hot.getDataAtCell(changes[i][0], 18);
            g_hot.setDataAtCell(changes[i][0], updateColumn, updateValue,"autosum");
        }
        else if(changedColumn >= 19 && changedColumn <= 20) {
            updateColumn = 21;
            updateValue = g_hot.getDataAtCell(changes[i][0], 19) + g_hot.getDataAtCell(changes[i][0], 20);
            g_hot.setDataAtCell(changes[i][0], updateColumn, updateValue,"autosum");
        }
        else return;
}

function autosum2(changes) {
    console.log(changes);
    let i = 0;
    let changedColumn = changes[i][1];
    let updateColumn;
    let updateValue;
    if(changedColumn == 13) {
        updateColumn = 14;
        updateValue = g_hot.getDataAtCell(changes[i][0], 8) - g_hot.getDataAtCell(changes[i][0], 13);
        g_hot.setDataAtCell(changes[i][0], updateColumn, updateValue,"autosum");
    }
    else if(changedColumn == 14) {
        updateColumn = 15;
        updateValue = g_hot.getDataAtCell(changes[i][0], 14)/1000;
        g_hot.setDataAtCell(changes[i][0], updateColumn, updateValue,"autosum");
    }
    else return;
}