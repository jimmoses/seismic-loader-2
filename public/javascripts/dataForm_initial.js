var
    g_container = document.getElementById('inputTable'),
    g_hot;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Session Variables to store in client side

var g_rowOffset = 2;
var g_colOffset = 4;
var g_numberOfSchemes = 1; //Default
var g_showRowCol = false;
var g_formMode = window.location.hash || "month-actual";  //Defaults to Monthly Actual Data entry
    /*  
        "year-plan"     : Adjust form for entering annual plan data year-wise
        "month-plan"    : Adjust form for entering monthl plan data for an entire FY
        "month-actual"  : Adjust form for entering monthly actual data

    */
var g_currentRecord = {};
var g_fetchedData = JSON.parse("[[\"30491\",\"\",\"30818\",\"\",\"29228\",\"\",\"29526\",\"\",\"28888\",\"\",\"27254\",\"\",\"27420\",\"\",\"25838\",\"\",\"25948\",\"\",\"25189\",\"\",\"21935\",\"\",\"23704\",null],[\"6015594\",\"\",\"6092936\",\"\",\"5788384\",\"\",\"5860552\",\"\",\"5745837\",\"\",\"5436675\",\"\",\"5487508\",\"\",\"5187855\",\"\",\"5229474\",\"\",\"5097032\",\"\",\"4464299\",\"\",\"4838173\",null],[\"12\",\"\",\"13\",\"\",\"11\",\"\",\"13\",\"\",\"12\",\"\",\"15\",\"\",\"16\",\"\",\"15\",\"\",\"15\",\"\",\"15\",\"\",\"14\",\"\",\"16\",null],[\"229\",\"\",\"740\",\"\",\"1134\",\"\",\"1665\",\"\",\"2121\",\"\",\"2580\",\"\",\"3229\",\"\",\"3649\",\"\",\"4344\",\"\",\"4927\",\"\",\"5108\",\"\",\"6061\",null],[\"35247\",\"\",\"114033\",\"\",\"174631\",\"\",\"256419\",\"\",\"326696\",\"\",\"397321\",\"\",\"497250\",\"\",\"561901\",\"\",\"668954\",\"\",\"758766\",\"\",\"786622\",\"\",\"933416\",null],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",null],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",null],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",null],[\"30720\",\"\",\"31559\",\"\",\"30362\",\"\",\"31191\",\"\",\"31010\",\"\",\"29834\",\"\",\"30649\",\"\",\"29487\",\"\",\"30292\",\"\",\"30116\",\"\",\"27042\",\"\",\"29765\",null],[\"6050842\",\"\",\"6206970\",\"\",\"5963016\",\"\",\"6116972\",\"\",\"6072533\",\"\",\"5833996\",\"\",\"5984757\",\"\",\"5749756\",\"\",\"5898429\",\"\",\"5855799\",\"\",\"5250921\",\"\",\"5771589\",null],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",null],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",null],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",null],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",null],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",null],[\"2\",\"\",\"2\",\"\",\"2\",\"\",\"4\",\"\",\"0\",\"\",\"2\",\"\",\"2\",\"\",\"2\",\"\",\"3\",\"\",\"2\",\"\",\"2\",\"\",\"2\",null],[\"240\",\"\",\"495\",\"\",\"716\",\"\",\"983\",\"\",\"978\",\"\",\"1181\",\"\",\"1461\",\"\",\"1645\",\"\",\"1938\",\"\",\"2175\",\"\",\"2177\",\"\",\"2644\",null],[\"36960\",\"\",\"76161\",\"\",\"110234\",\"\",\"151436\",\"\",\"150553\",\"\",\"181807\",\"\",\"224963\",\"\",\"253396\",\"\",\"298507\",\"\",\"334958\",\"\",\"335274\",\"\",\"407223\",null],[\"240\",\"\",\"495\",\"\",\"716\",\"\",\"983\",\"\",\"978\",\"\",\"1181\",\"\",\"1461\",\"\",\"1645\",\"\",\"1938\",\"\",\"2175\",\"\",\"2177\",\"\",\"2644\",null],[\"36960\",\"\",\"76161\",\"\",\"110234\",\"\",\"151436\",\"\",\"150553\",\"\",\"181807\",\"\",\"224963\",\"\",\"253396\",\"\",\"298507\",\"\",\"334958\",\"\",\"335274\",\"\",\"407223\",null],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",null],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",null],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",null],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",null],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",null],[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"2\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",null],[\"0\",\"\",\"0\",\"\",\"0\",\"\",\"0\",\"\",\"248\",\"\",\"239\",\"\",\"245\",\"\",\"236\",\"\",\"242\",\"\",\"241\",\"\",\"216\",\"\",\"238\",null],[\"0\",\"\",\"0\",\"\",\"0\",\"\",\"0\",\"\",\"38192\",\"\",\"36744\",\"\",\"37748\",\"\",\"36317\",\"\",\"37309\",\"\",\"37091\",\"\",\"33306\",\"\",\"36660\",null],[\"0\",\"\",\"0\",\"\",\"0\",\"\",\"0\",\"\",\"248\",\"\",\"239\",\"\",\"245\",\"\",\"236\",\"\",\"242\",\"\",\"241\",\"\",\"216\",\"\",\"238\",null],[\"0\",\"\",\"0\",\"\",\"0\",\"\",\"0\",\"\",\"38192\",\"\",\"36744\",\"\",\"37748\",\"\",\"36317\",\"\",\"37309\",\"\",\"37091\",\"\",\"33306\",\"\",\"36660\",null],[\"30960\",\"\",\"32053\",\"\",\"31078\",\"\",\"32175\",\"\",\"32235\",\"\",\"31253\",\"\",\"32355\",\"\",\"31368\",\"\",\"32473\",\"\",\"32531\",\"\",\"29436\",\"\",\"32648\",null],[\"6087802\",\"\",\"6283131\",\"\",\"6073250\",\"\",\"6268408\",\"\",\"6261278\",\"\",\"6052547\",\"\",\"6247468\",\"\",\"6039469\",\"\",\"6234245\",\"\",\"6227848\",\"\",\"5619501\",\"\",\"6215471\",null]]");

g_init();
////////////////////////////////////////////////////////////////////////////
//Header layout settings

//Titles settings
var g_headerFields = [
    ["", "", "", "", "Apr-21", "Apr-21", "May-21", "May-21", "Jun-21", "Jun-21", "Jul-21", "Jul-21", "Aug-21", "Aug-21", "Sep-21", "Sep-21", "Oct-21", "Oct-21", "Nov-21", "Nov-21", "Dec-21", "Dec-21", "Jan-22", "Jan-22", "Feb-22", "Feb-22", "Mar-22", "Mar-22","Total", "Total"],
    ["", "", "", "", "Plan", "Actual", "Plan", "Actual", "Plan", "Actual", "Plan", "Actual", "Plan", "Actual", "Plan", "Actual", "Plan", "Actual", "Plan", "Actual", "Plan", "Actual", "Plan", "Actual", "Plan", "Actual", "Plan", "Actual", "Plan", "Actual"],

    //Base
    ["Field Name", "Base", "Oil+Cond (MT)"],
    ["Field Name", "Base", "Gas (SCM)"],
    ["Field Name", "Base", "Workover", "Wells"],
    ["Field Name", "Base", "Workover", "Oil Gain"],
    ["Field Name", "Base", "Workover", "Gas Gain"],
    ["Field Name", "Base", "H/F", "Wells"],
    ["Field Name", "Base", "H/F", "Oil Gain"],
    ["Field Name", "Base", "H/F", "Gas Gain"],
    ["Field Name", "Total Base", "Oil+Cond (MT)"],
    ["Field Name", "Total Base", "Gas (SCM)"],

    //Firm
    ["Field Name", "Firm", "Development Wells"],
    ["Field Name", "Firm", "Non-Scheme", "Wells"],
    ["Field Name", "Firm", "Non-Scheme", "Oil"],
    ["Field Name", "Firm", "Non-Scheme", "Gas"],
    ["Field Name", "Firm", "Scheme-1", "Activity"],
    ["Field Name", "Firm", "Scheme-1", "Wells"],
    ["Field Name", "Firm", "Scheme-1", "Oil Gain"],
    ["Field Name", "Firm", "Scheme-1", "Gas Gain"],
    ["Field Name", "Total Firm", "Oil+Cond (MT)"],
    ["Field Name", "Total Firm", "Gas (SCM)"],

    //Upside
    ["Field Name", "Upside", "Development Wells"],
    ["Field Name", "Upside", "Non-Scheme", "Wells"],
    ["Field Name", "Upside", "Non-Scheme", "Oil"],
    ["Field Name", "Upside", "Non-Scheme", "Gas"],
    ["Field Name", "Upside", "Scheme-1", "Activity"],
    ["Field Name", "Upside", "Scheme-1", "Wells"],
    ["Field Name", "Upside", "Scheme-1", "Oil Gain"],
    ["Field Name", "Upside", "Scheme-1", "Gas Gain"],
    ["Field Name", "Total Upside", "Oil+Cond (MT)"],
    ["Field Name", "Total Upside", "Gas (SCM)"],

    //Total
    ["Field Total", "Field Total", "Oil+Cond (MT)"],
    ["Field Total", "Field Total", "Gas (SCM)"]
];
adjustHeader(g_numberOfSchemes);

//Merged header cell settings
var g_headerMergeCells = [

    { row: 0, col: 0, rowspan: 1, colspan: 4 }, //Blank Header    
    { row: 1, col: 0, rowspan: 1, colspan: 4 }, //Blank Header    
    { row: 2, col: 0, rowspan: 30 + (8*(g_numberOfSchemes-1)), colspan: 1 }, //Field Name

    //Base, Firm, Upside Header and Total
    { row: 2, col: 1, rowspan: 8, colspan: 1 }, //Base
    { row: 12, col: 1, rowspan: 8 + 4*(g_numberOfSchemes-1), colspan: 1 }, //Firm
    { row: 22 + 4*(g_numberOfSchemes-1), col: 1, rowspan: 8 + 4*(g_numberOfSchemes-1), colspan: 1 }, //Upside

    { row: 10, col: 1, rowspan: 2, colspan: 1 }, //Base Total
    { row: 20 + 4*(g_numberOfSchemes-1), col: 1, rowspan: 2, colspan: 1 }, //Firm Total
    { row: 30 + 8*(g_numberOfSchemes-1), col: 1, rowspan: 2, colspan: 1 }, //Upside Total

    //For Grand Total Row
    { row: 32 + 8*(g_numberOfSchemes-1), col: 0, rowspan: 2, colspan: 2 },
    { row: 32 + 8*(g_numberOfSchemes-1), col: 2, rowspan: 1, colspan: 2 },
    { row: 33 + 8*(g_numberOfSchemes-1), col: 2, rowspan: 1, colspan: 2 },

    //For Months above Plan/Actual
    { row: 0, col: g_colOffset + 0, rowspan: 1, colspan: 2 },
    { row: 0, col: g_colOffset + 2, rowspan: 1, colspan: 2 },
    { row: 0, col: g_colOffset + 4, rowspan: 1, colspan: 2 },
    { row: 0, col: g_colOffset + 6, rowspan: 1, colspan: 2 },
    { row: 0, col: g_colOffset + 8, rowspan: 1, colspan: 2 },
    { row: 0, col: g_colOffset + 10, rowspan: 1, colspan: 2 },
    { row: 0, col: g_colOffset + 12, rowspan: 1, colspan: 2 },
    { row: 0, col: g_colOffset + 14, rowspan: 1, colspan: 2 },
    { row: 0, col: g_colOffset + 16, rowspan: 1, colspan: 2 },
    { row: 0, col: g_colOffset + 18, rowspan: 1, colspan: 2 },
    { row: 0, col: g_colOffset + 20, rowspan: 1, colspan: 2 },
    { row: 0, col: g_colOffset + 22, rowspan: 1, colspan: 2 },
    { row: 0, col: g_colOffset + 24, rowspan: 1, colspan: 2 },

    //For Category and Sub-Category

    //Base
    { row: 2, col: 2, rowspan: 1, colspan: 2 },
    { row: 3, col: 2, rowspan: 1, colspan: 2 },
    { row: 4, col: 2, rowspan: 3, colspan: 1 },
    { row: 7, col: 2, rowspan: 3, colspan: 1 },
    { row: 10, col: 2, rowspan: 1, colspan: 2 },
    { row: 11, col: 2, rowspan: 1, colspan: 2 },

    //Firm
    { row: 12, col: 2, rowspan: 1, colspan: 2 },
    { row: 13, col: 2, rowspan: 3, colspan: 1 },
    { row: 16, col: 2, rowspan: 4, colspan: 1 },
    { row: 20 + 4*(g_numberOfSchemes-1), col: 2, rowspan: 1, colspan: 2 },
    { row: 21 + 4*(g_numberOfSchemes-1), col: 2, rowspan: 1, colspan: 2 },

    //Upside
    { row: 22 + 4*(g_numberOfSchemes-1), col: 2, rowspan: 1, colspan: 2 },
    { row: 23 + 4*(g_numberOfSchemes-1), col: 2, rowspan: 3, colspan: 1 },
    { row: 26 + 4*(g_numberOfSchemes-1), col: 2, rowspan: 4, colspan: 1 },
    { row: 30 + 8*(g_numberOfSchemes-1), col: 2, rowspan: 1, colspan: 2 },
    { row: 31 + 8*(g_numberOfSchemes-1), col: 2, rowspan: 1, colspan: 2 },
];
adjustHeaderMerge(g_numberOfSchemes);

//Header formatting
function headerRenderer(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);
    td.style.fontWeight = 'bold';
    td.style.color = '#4c4c4c';
    td.style.background = '#eaeaea';
}

let g_colWidths = [1, 100, 100, 100, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80];

console.log(g_formMode);

//Settings for single month's actual data entry
if(g_formMode == "#month-actual"){

    let currentMonth = new Date (Date.now()).toLocaleDateString('en-gb',{month: 'short'});
    let currentYear = new Date (Date.now()).toLocaleDateString('en-gb',{year: '2-digit'});

    let monthHeader = currentMonth + "-" + currentYear;

    g_headerFields.splice(0,1,["", "", "", "", monthHeader, monthHeader, monthHeader]);
    g_headerFields.splice(1,1,["", "", "", "", "Plan", "Actual", "Remarks"]);

    g_headerMergeCells.splice(12,13,{ row: 0, col: g_colOffset + 0, rowspan: 1, colspan: 3 });

    g_colWidths = [1, 100, 100, 100, 100, 100, 300];
    g_container = document.getElementById('inputTableSingle');
    document.querySelector("#inputTable").setAttribute("hidden","hidden");
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Main Handsontable definition

g_hot = new Handsontable(g_container, {
    data: JSON.parse(JSON.stringify(g_headerFields)),
    colWidths: g_colWidths,
    rowHeaders: g_showRowCol,
    colHeaders: g_showRowCol,
    fixedColumnsLeft: 4,
    contextMenu: true,
    preventOverflow: 'horizontal',
    mergeCells: g_headerMergeCells,
    // columns: function(index) {
    //     if(index<4)
    //         return {        
    //             renderer: headerRenderer,
    //             readOnly: true
    //         }
    //     else
    //         return{
    //             readOnly: false
    //         }
    // },
    cells: function (row, col) {
        var cellProperties = {};        

        if (col < 4){
            cellProperties.renderer = headerRenderer; // uses function directly
            cellProperties.className = "htLeft htMiddle";
            cellProperties.readOnly = true; 
        }
        if (row < 2){
            cellProperties.renderer = headerRenderer; // uses function directly
            cellProperties.className = "htCenter htMiddle";
            cellProperties.readOnly = true;
        }
        
        return cellProperties;
    },
    stretchH: 'last',
    // comments: true,
    contextMenu: ['cut','copy','---------','undo', 'redo','commentsAddEdit','commentsRemove']
});

function g_init(){

    //Checks session and sets display of options accordingly
    checkSession()
    .then(response => {
        console.log(response);
        if(response == "logged in"){
            //Show username
            document.querySelector('#mnu_username').innerHTML = "Welcome "+ g_user.name;
            if(g_user.usertype=="asset" ){
                populateAssetAndFields();
            }
        }
    })
    .catch((error) => {
        console.error(error);
    });

    switch (g_formMode) {
        case "#month-plan":
            let month_field =  document.querySelector('#month_year');
            month_field.setAttribute('hidden','hidden');
            month_field.previousElementSibling.setAttribute('hidden','hidden');
            break;
    
        case "month-actual":            
        default:
            //Do nothing
            break;
    }

    // inputFilter(); //Allow Editing only for actual values of current month
    populateMonth();
    
    
}


function inputFilter(currentMonth){
    //Lock all columns and allow only current month's Actual values to be edited

    if(!currentMonth)   ;
    let colToAllowEdit = g_colOffset +
                        ((currentMonth - 3) // -3 because FY begins with Apr
                         *2) // Two columns (Plan and Actual) for each Month
                         -1; // Index begins with 0                         
   
    //Update Grid so that only Actual values of Current Month are editable
    g_hot.updateSettings({
        columns: function(index) {
            if (index == colToAllowEdit)
                return {        
                    readOnly: false
                }
            else
                return {        
                    readOnly: true
                }
        }
    },1);
}

function loadDummyData(){
    g_hot.populateFromArray(g_rowOffset, g_colOffset, g_fetchedData);
}



////////////////////////////////////////////////////////////////////////////
// Read Data from Database

// function readRecord(){

//   let query = "select * from pdd.FIELD_PLAN_ACTUAL_DATA_";
//   let formData = new FormData();
//     formData.append('cmd', 'getDirectQuery');
//     formData.append('format', 'json');
//     formData.append('query', query);
//     const dataToSend = new URLSearchParams(formData);

//     fetch("/epinet/controllers/readData.aspx",{
//         headers: { "Content-Type": "application/x-www-form-urlencoded" },
//         method: "post",
//         body: dataToSend
//     })
//     .then( response => {      
//         return response.text()
//     })
//     .then( response => {
//         if(response == "sessionexpired")
//             throw(response);
//         else
//             return JSON.parse(response);
//     })
//     .then(data => {
//         console.log("Recent MPRs:",data);

//         ReactDOM.render(
//             <Mprlist data={data}/>,
//             document.getElementById('mprlist')
//         );

//         g_latestMprMonth = data[0].month; //Set to help in creating draft
//         let draftMprPeriod = new Date(g_latestMprMonth);
//         draftMprPeriod.setMonth(draftMprPeriod.getMonth()+1);
//         let draftMprMonthYear = draftMprPeriod.toLocaleDateString('en-gb',
//         {
//             month: 'short',
//             year: 'numeric',
//         });

//         // If there are no drafts present, show create draft button
//         if(data.filter(x => x.status=="Draft").length == 0){
//             document.getElementById("createDraft").style.display = "block";
//             document.getElementById("createDraft").innerText = "Create Draft for " + draftMprMonthYear;
//         }
//         else{
//             document.getElementById("createDraft").style.display = "none";
//         }
//     })
//     .catch((error) => {
//         if(error=="sessionexpired")
//             openLoginWindow(false);
//         else
//             console.error(error);
//     });
// }

function createRecord() {
    
    /* 
     Inputs
       1. Financial Year
       2. Field Name
 
    */
    let datagrid = g_hot.getData(2, 4, 33, 29);
    let emptyRecord = [];

    for (let row = 0; row < datagrid.length ; row++) {
        for (let col = 0; col < datagrid[row].length; col++) {
            // emptyRecord.push({
            //     "INPUT_CATEGORY": g_headerFields[g_rowOffset + row][1],
            //     "CATEGORY_1": g_headerFields[g_rowOffset + row][2],
            //     "CATEGORY_2": g_headerFields[g_rowOffset + row][3],
            //     "MONTH_YEAR": g_headerFields[0][g_colOffset + col],
            //     "TYPE": g_headerFields[1][g_colOffset + col],
            //     "VALUE": datagrid[row][col],
            //     "ROW_INDEX": datagrid[row][col]
            // });

            emptyRecord.push([
                '1',                                    //FIELD_ID: 
                '2021-22',                              //FINANCIAL_YEAR: 
                g_headerFields[g_rowOffset + row][1],   //INPUT_CATEGORY: 
                g_headerFields[g_rowOffset + row][2],   //CATEGORY_1: 
                g_headerFields[g_rowOffset + row][3],   //CATEGORY_2: 
                g_headerFields[0][g_colOffset + col],   //MONTH_YEAR: 
                g_headerFields[1][g_colOffset + col] == "Plan" ? 'P' : 'A',   //TYPE: 
                datagrid[row][col],                     //VALUE: 
                '',                                     //REMARKS: 
                '',                                     //CREATED_BY: 
                '',                                     //CREATED_ON: 
                '',                                     //UPDATED_BY: 
                '',                                     //UPDATED_ON: 
                row,                                    //ROW_INDEX: 
                col                                     //COL_INDEX: 
            ])
        }
    }

    // console.log(emptyRecord);
    // return;

    let formData = new FormData();
    formData.append('data', JSON.stringify(emptyRecord));
    const dataToSend = new URLSearchParams(formData);
    
    fetch("/db/create",{
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        method: "post",
        body: dataToSend
    })
    .then( response => {      
        return response.json();
    })
    .then( response => {
        console.log(response);
    })
    .catch((error) => {
        console.error(error);
    });



}

function fetchRecord(){

    let formData = new FormData();
    formData.append('field_id', 1 );
    formData.append('financial_year', document.querySelector("#financial_year").value);
    const dataToSend = new URLSearchParams(formData);

    fetch("/db/read",{
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        method: "post",
        body: dataToSend
    })
    .then( response => {      
        return response.json();
    })
    .then( response => {
        console.log(response);

        //Parse 
        let tempData = response.message;        

        let targetArray = g_hot.getData(2, 4, 33, 29);
        
        for (let i = 0; i < tempData.length; i++) {
            const row = tempData[i][13];
            const col = tempData[i][14];
            const val = tempData[i][7];

            targetArray[row][col] = val;            
        }
        console.log(targetArray);

        g_fetchedData = JSON.parse(JSON.stringify(targetArray));

        g_hot.populateFromArray(g_rowOffset, g_colOffset, targetArray);

        // g_init();
        
        // for (let row = 0; row < targetArray.length; row++) {
        //     for (let col = 0; col < targetArray[row].length; col++) {
        //         targetArray[row][col] = 
        //     }
        // }

        
    })
    .catch((error) => {
        console.error(error);
    });
}

function fetchRecordSingleMonth(){

    let formData = new FormData();

    let field_id = 1;
    let month_year = document.querySelector("#month_year").value;
    const dataToSend = new URLSearchParams(formData);

    fetch("/db/read/field-month-data/" + field_id + "/" + month_year,
    {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        method: "get"
    })
    .then( response => {
        return response.json();
    })
    .then( response => {
        console.log(response);
        if(response.status=="error") throw new Error(response.message);

        //Parse 
        let tempData = response.data;        

        // let targetArray = g_hot.getData(2, 4, 33, 29);
        let targetArray = g_hot.getData(2, 4, 33, 6);
        
        for (let i = 0; i < tempData.length; i++) {
            const row = tempData[i][13];
            const col = tempData[i][14];
            const val = tempData[i][7];
            const comment = tempData[i][8];

            if(col%2 == 0) // Even index: Plan Value
                targetArray[row][0] = val;
            else    { //Odd index: Actual Value
                targetArray[row][1] = val;
                targetArray[row][2] = comment;
            }
        }
        console.log(targetArray);

        g_fetchedData = JSON.parse(JSON.stringify(targetArray));
        
        //Enable entry before populating data
        g_hot.updateSettings({
            columns: function(index) {
                if (index > 3 ) return { readOnly: false}
                else return { readOnly: true }
            }
        },1);

        g_hot.populateFromArray(g_rowOffset, g_colOffset, targetArray);

        //Disable entry for Plan Data
        g_hot.updateSettings({
            columns: function(index) {
                if (index > 4 ) return { readOnly: false}
                else return { readOnly: true }
            }
        },1);

    })
    .catch((error) => {
        console.error(error);
    });
}

function saveChanges() {

    let changedData = g_hot.getData(2, 4, 33, 27);
    let changes = [];
    let query = "update FIELD_PRODUCTION_DATA_ set";

    // Compare with fetched data

    for (let row = 0; row < changedData.length; row++) {

        for (let col = 0; col < changedData[row].length; col++) {

            if (changedData[row][col] == g_fetchedData[row][col]) {
                // No Change
            }
            else {

                changes.push({
                    row   : row,
                    col   : col,
                    val   : changedData[row][col]
                });

                // let tempChange = {
                //     "UPDATE_COLUMN": g_headerFields[1][g_colOffset + col],
                //     "MONTH_YEAR": g_headerFields[0][g_colOffset + col],
                //     "INPUT_CATEGORY": g_headerFields[g_rowOffset + row][1],
                //     "CATEGORY_1": g_headerFields[g_rowOffset + row][2],
                //     "CATEGORY_2": g_headerFields[g_rowOffset + row][3]
                // };

                // changes.push(tempChange);

                /*
                query = update FIELD_PRODUCTION_DATA_ set
                  tmpColumnToUpdate = changedData[row][col]
                where
                  INPUT_CATEGORY = g_headerFields[g_rowOffset + row][1] AND
                  CATEGORY_1 = g_headerFields[g_rowOffset + row][2] AND
                  CATEGORY_2 = g_headerFields[g_rowOffset + row][3] AND
                  MONTH_YEAR = g_headerFields[0][g_colOffset + col]
                  FINANCIAL_YEAR = AND
                  FIELD_ID = 
                */
            }

        }

    }
    
    // Get comments
    // let allComments = g_hot.getCellsMeta().filter(x => x.comment == null || x.comment == "" ? null: x.comment);

    let formData = new FormData();
    formData.append('changes', JSON.stringify(changes));
    formData.append('field_id', 1 );
    formData.append('financial_year', document.querySelector("#financial_year").value);
    
    const dataToSend = new URLSearchParams(formData);
    
    fetch("/db/update",{
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        method: "post",
        body: dataToSend
    })
    .then( response => {      
        return response.json();
    })
    .then( response => {
        console.log(response);
        alert("Saved!");
    })
    .catch((error) => {
        console.error(error);
    });
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
            document.querySelector("#btn_load").removeAttribute("hidden");
            document.querySelector("#btn_save").removeAttribute("hidden");
        }
    })
    .catch((error) => {
        console.error(error);
    });
}

function logout(){
    let formData = new FormData();
    formData.append('user', 'pdd');
    formData.append('password', 'pdd');
    const dataToSend = new URLSearchParams(formData);
    
    fetch("/session/logout",{
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        method: "post",
        body: dataToSend
    })
    .then( response => {      
        return response.json();
    })
    .then( response => {
        console.log(response);
        checksession(g_user);
    })
    .catch((error) => {
        console.error(error);
    });
}

// To check if user is logged-in or not
// function checksession(){
    
//     fetch("/session/checksession",{
//         headers: { "Content-Type": "application/x-www-form-urlencoded" },
//         method: "post"
//     })
//     .then( response => {      
//         return response.json();
//     })
//     .then( response => {
//         console.log(response);
//         if(response.status == "success"){
//             if(response.sessionStatus){
//                 document.querySelector("#btn_login").setAttribute("hidden","hidden");
//                 document.querySelector("#btn_load").removeAttribute("hidden");
//                 document.querySelector("#btn_save").removeAttribute("hidden");
//             }
//             else{
//                 document.querySelector("#btn_login").removeAttribute("hidden");
//                 document.querySelector("#btn_load").setAttribute("hidden","hidden");
//                 document.querySelector("#btn_save").setAttribute("hidden","hidden");
//             }
//         }
//     })
//     .catch((error) => {
//         console.error(error);
//     });
// }



////////////////////////////////////////////////////////////////////////////
// Functions to adjust scheme tile if there is more than one scheme

function adjustHeader(numberOfSchemes){

    if(numberOfSchemes == 1 || numberOfSchemes == "") return;

    //Firm
    let insertRow = 20;
    for (let i = 2; i <= numberOfSchemes; i++) {

        g_headerFields.splice(insertRow,0,[
            "Field Name", "Firm", "Scheme-"+i, "Activity"            
        ]);
        insertRow++;      
        g_headerFields.splice(insertRow,0,[
            "Field Name", "Firm", "Scheme-"+i, "Wells"            
        ]);
        insertRow++;      
        g_headerFields.splice(insertRow,0,[
            "Field Name", "Firm", "Scheme-"+i, "Oil Gain"            
        ]);
        insertRow++;      
        g_headerFields.splice(insertRow,0,[
            "Field Name", "Firm", "Scheme-"+i, "Gas Gain"            
        ]);
    }

    //Upside
    insertRow = 30 + 4 * (numberOfSchemes-1);
    for (let i = 2; i <= numberOfSchemes; i++) {

        g_headerFields.splice(insertRow,0,[
            "Upside", "Firm", "Scheme-"+i, "Activity"            
        ]);
        insertRow++;      
        g_headerFields.splice(insertRow,0,[
            "Upside", "Firm", "Scheme-"+i, "Wells"            
        ]);
        insertRow++;      
        g_headerFields.splice(insertRow,0,[
            "Upside", "Firm", "Scheme-"+i, "Oil Gain"            
        ]);
        insertRow++;      
        g_headerFields.splice(insertRow,0,[
            "Upside", "Firm", "Scheme-"+i, "Gas Gain"            
        ]);

          
    }

    //Adjust Header if more schemes are present
    g_headerFields.splice();
}

function adjustHeaderMerge(numberOfSchemes){
    if(numberOfSchemes == 1) return;

    //For Firm
    let mergeIndex = 20;
    for (let i = 1; i < numberOfSchemes; i++) {
        g_headerMergeCells.push({ row: mergeIndex, col: 2, rowspan: 4, colspan: 1 });
        mergeIndex+=4;
    }

    //For Upside
    mergeIndex = 30 + (4*(numberOfSchemes-1));
    for (let i = 1; i < numberOfSchemes; i++) {
        g_headerMergeCells.push({ row: mergeIndex, col: 2, rowspan: 4, colspan: 1 });
        mergeIndex+=4;
    }
}

function populateMonth(){

    let months = [];
    let year = document.querySelector("#financial_year").value.split('-')[1] - 1;
    let monYear = new Date("01 Apr "+ year);
    let monYearDom = document.getElementById('month_year');
    monYearDom.innerHTML = "";

    for (let i = 0; i < 12; i++) {
        months.push(
            monYear.toLocaleDateString('en-gb',{month: 'short'})
            + "-" +
            monYear.toLocaleDateString('en-gb',{year: '2-digit'})
        );        
        monYear.setMonth(monYear.getMonth() + 1); //https://stackoverflow.com/a/5645126/5746368

        //https://stackoverflow.com/a/8674667/5746368
        let opt = document.createElement('option');
        opt.value = months[i];
        opt.innerHTML = months[i];
        monYearDom.appendChild(opt);
    }
}



function populateAssetAndFields(){

    //Asset Name
    document.getElementById('txt_assetname').value = g_user.asset_name;

    //Field List
    let fields = [];
    let fieldDom = document.getElementById('field_name');
    fieldDom.innerHTML = "";

    for (let i = 0; i < g_user.field_list.length; i++) {        
        //https://stackoverflow.com/a/8674667/5746368
        let opt = document.createElement('option');
        opt.value = g_user.field_list[i];
        opt.innerHTML = g_user.field_list[i];
        fieldDom.appendChild(opt);
    }
}