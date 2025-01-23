var express = require('express');
var router = express.Router();
const oracledb = require('oracledb'); // Library for Oracle Connection
const db = require('./dbcrud');
/////////////////////////////////////////////////////////////
// Common functions for performing basic DB operations

/*------------------------------------------------READING DATA FROM DATABASE----------------------------------------------------------*/
router.get('/read/hsd-water/financial-year/:financial_year', async function (req, res, next) {
	try {
	    // Set query - default is to fetch data without any aggregation
		let sql = `SELECT TO_CHAR(ENTRY_DATE, 'DD/MM/YYYY'), 
		RIG_NAME, ENGINE_1, ENGINE_2, ENGINE_3, ENGINE_4, ENGINE_5, 
		TOTAL_RUNNING_HRS, 
		DIESEL_CONSUMPTION_L, 
		USE_OF_DIESEL_MUD,
		USE_OF_DIESEL_CEM,
		USE_OF_DIESEL_CRANES,
		USE_OF_DIESEL_MISC,
		TOTAL_MISC,
		CONSUMPTION_BY_ENGINES_L,
		CONSUMPTION_BY_ENGINES_KL,
		REMARKS,
		PW_CONSUMED,
		DW_CONSUMED,
		WATER_PRODUCED_RO,
		WATER_PRODUCED_MAKER,
		TOTAL_PRODUCTION,
		TOTAL_WATER_CONSUMPTION 
		FROM PRJDDN.DS_HSD_WATER_CONSUMPTION WHERE FINANCIAL_YEAR = :financial_year 
		ORDER BY ROW_NUMBER`;
 
	    // Set parameters
	    let binds = {
		   financial_year: req.params.financial_year,
	    };
 
	    //Set options
	    let options = {};
 
	    // Check session and execute query	    	    
	    let response = await db.read(req,sql,binds,options);
 
	    // For Troubleshooting Only
	    response.sql = sql;
	    response.binds = binds;
 
	    res.send(response);
 
	}
	catch (error) { res.send({ status: "error", message: error.message }); }
	finally {
 
	}
 });

/*------------------------------------------------UPDATING DATA----------------------------------------------------------*/
 router.put('/update/hsd-water/:financial_year', async function (req, res, next) {
	try {
		console.log(req.body);
		let response = {data: []};
        for(let j=0;j<req.body.changes.length;j++) {
			let fields_changed = [], new_values = [];
			// Build set statement        
			let set_statement = '';
			let binds = {}, sql;
			console.log(req.body.changes[j])
			for(let i = 0;i<req.body.changes[j].length;i++) {
				fields_changed[i] = req.body.changes[j][i]["COL_NAME"].toUpperCase();
				if(req.body.changes[j][i]["COL_NAME"].toLowerCase().indexOf("date")>-1){
					new_values[i] = `TO_DATE('${req.body.changes[j][i].VALUE}','DD/MM/YYYY')`;
				}
				else if(req.body.changes[j][i]["COL_NAME"].toLowerCase().indexOf("string")>-1){
					new_values[i] = "'"+req.body.changes[j][i].VALUE+"'";
					fields_changed[i] = fields_changed[i].substring(0,fields_changed[i].length-7);
				}
				else new_values[i] = req.body.changes[j][i].VALUE;
				console.log(fields_changed[i], new_values[i]);
				set_statement += fields_changed[i] + " = "  + new_values[i] + ",";
			}
			if(set_statement != ''){ 
				try {
					set_statement = set_statement.substring(0,set_statement.length-1); //Remove last comma
					//Set options
					console.log(set_statement);
					sql = `UPDATE PRJDDN.DS_HSD_WATER_CONSUMPTION_ set ${set_statement} WHERE ROW_NUMBER = :row_number and FINANCIAL_YEAR = :financial_year`;
					binds.row_number = req.body.changes[j][0].ROW_INDEX + 1;
					binds.financial_year = req.params.financial_year;
					console.log(sql);
					// Check session and execute query
					response.data.push(await db.update(req,sql,[binds],{autoCommit: true}));
				}
				catch (error) {
					response.data.push({status: "error", message: error.message});
				}
				finally{
				}
			}
		}     
		if(response.data.every((x) => {return x.status == "success"}))
			res.send({status: "success", message: response});
		else 
			res.send({status: "error", message: response});
	}
	catch (error) { res.send({status: "error", message: error.message}); }
	finally {
		res.send();
	}
});

/*------------------------------------------------INSERTING NEW DATA----------------------------------------------------------*/
router.post('/insert/hsd-water/:financial_year', async function (req, res, next) {
    try{
		let read_sql = `select count(*) as COUNT from PRJDDN.DS_HSD_WATER_CONSUMPTION WHERE FINANCIAL_YEAR = '${req.params.financial_year}'`;
		response = await db.read(req, read_sql, {}, {}, "object");
		console.log(response);
		if(response.data[0][0] > 0)
            serial_no = response.data[0][0] + 1;
        else
			serial_no = 1;
		for(let i = 0;i<req.body.data.length;i++) {
			req.body.data[i].ROW_NUMBER = serial_no + i;
			req.body.data[i].FINANCIAL_YEAR = req.params.financial_year;
		}
		let columns = Object.keys(req.body.data[0]).map(x=>x.toUpperCase());
		columns = columns.map(x => {
			if(x.toLowerCase().indexOf("string")>-1) return x.substring(0,x.length-7);
			else return x;
		})
		let columnsColon = Object.keys(req.body.data[0]).map(x=>":"+x.toUpperCase());
		columnsColon = columnsColon.map(x => {
			if(x.toLowerCase().indexOf("date")>-1) return `TO_DATE(${x}, 'DD/MM/YYYY')`;
			else return x;
		})
		console.log(req.body.data);
        sql = `INSERT INTO PRJDDN.DS_HSD_WATER_CONSUMPTION_ (${columns.join(',')}) VALUES (${columnsColon.join(',')})`;
		console.log(sql);
        responseValues = await db.update(req,sql,req.body.data,{autoCommit: true});
        res.send(responseValues);
       }
    catch(error) { 
     res.send({status: "error", message: error.message}); }
    finally{
        
    }
 });

module.exports = router;
