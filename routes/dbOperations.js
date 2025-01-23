var express = require('express');
var router = express.Router();
const oracledb = require('oracledb'); // Library for Oracle Connection
const dataSQLs = {
  "field-header"  : "FIELD_PLAN_HEADER_",
  "field-data-fy"    : "FIELD_PLAN_ACTUAL_DATA_",
  "field-data-month"    : "SELECT * FROM pdd.FIELD_PLAN_ACTUAL_DATA_ where field_id= :field_id and financial_year = :financial_year and month_year=:month_year",
  "field-list"    : "select * from pdd.FIELD_LIST_"
};

/* GET users listing. */
router.get('/', function (req, res, next) {
  let reponse = {
    "status": "success",
    "message": "TEST!"
  };

  res.send(reponse);
});


router.post('/create/fy/:fy', async function (req, res, next) {
  // res.send(req.body.data);

  //Create connection from session variable
  try { connection = await oracledb.getConnection(req.session.connection); }
  catch (error) { res.send({status: "error", message: error.message}) }
  
  // let query ="insert into PDD.FIELD_PLAN_ACTUAL_DATA_ " +
  //           " (FIELD_ID, FINANCIAL_YEAR, INPUT_CATEGORY, CATEGORY_1, CATEGORY_2, MONTH_YEAR, PLAN, ACTUAL, REMARKS, CREATED_BY, CREATED_ON, UPDATED_BY, UPDATED_ON) " +
  //       " values ";

  try {  

    //http://oracle.github.io/node-oracledb/doc/api.html#batchexecution
    const sql = `INSERT INTO PDD.FIELD_PLAN_ACTUAL_DATA_ VALUES 
      (:FIELD_ID, :FINANCIAL_YEAR, :INPUT_CATEGORY, :CATEGORY_1, :CATEGORY_2, :MONTH_YEAR, :TYPE, :VALUE, :REMARKS, :CREATED_BY, :CREATED_ON, :UPDATED_BY, :UPDATED_ON, :ROW_INDEX, :COL_INDEX )
    `;

    const binds = JSON.parse(req.body.data);


    const options = {
      autoCommit: true
    };

    const result = await connection.executeMany(sql, binds, options);

    console.log(result.rowsAffected);  // 3
    res.send({status: "success", message: result.rowsAffected});
  } 
  catch (error) { res.send({status: "error", message: error.message}) }
  finally {
    if (connection) {
      try { await connection.close(); }
      catch (error) { res.send({status: "error", message: error.message}) }
    }
  }

});

router.post('/create', async function (req, res, next) {
  // res.send(req.body.data);

  //Create connection from session variable
  try { connection = await oracledb.getConnection(req.session.connection); }
  catch (error) { res.send({status: "error", message: error.message}) }
  
  // let query ="insert into PDD.FIELD_PLAN_ACTUAL_DATA_ " +
  //           " (FIELD_ID, FINANCIAL_YEAR, INPUT_CATEGORY, CATEGORY_1, CATEGORY_2, MONTH_YEAR, PLAN, ACTUAL, REMARKS, CREATED_BY, CREATED_ON, UPDATED_BY, UPDATED_ON) " +
  //       " values ";

  try {  

    //http://oracle.github.io/node-oracledb/doc/api.html#batchexecution
    const sql = `INSERT INTO PDD.FIELD_PLAN_ACTUAL_DATA_ VALUES 
      (:FIELD_ID, :FINANCIAL_YEAR, :INPUT_CATEGORY, :CATEGORY_1, :CATEGORY_2, :MONTH_YEAR, :TYPE, :VALUE, :REMARKS, :CREATED_BY, :CREATED_ON, :UPDATED_BY, :UPDATED_ON, :ROW_INDEX, :COL_INDEX )
    `;

    const binds = JSON.parse(req.body.data);

    // Test
    // const binds = [
    //   [
    //     '1',
    //     '2021-22',
    //     'BASE',
    //     'OIL+COND',
    //     '',
    //     'MAY-21',
    //     'P',
    //     '',
    //     '1',
    //     '',
    //     '',
    //     '',
    //     ''
    //   ],
    //   [
    //     '1',
    //     '2021-22',
    //     'BASE',
    //     'GAS',
    //     '',
    //     'MAY-21',
    //     'A',
    //     '',
    //     '1',
    //     '',
    //     '',
    //     '',
    //     ''
    //   ]
    // ];

    const options = {
      autoCommit: true,
      // bindDefs: {
      //   CREATED_ON: { type: oracledb.DATE }
      // }
    };

    const result = await connection.executeMany(sql, binds, options);

    console.log(result.rowsAffected);  // 3
    res.send({status: "success", message: result.rowsAffected});
  } 
  catch (error) { res.send({status: "error", message: error.message}) }
  finally {
    if (connection) {
      try { await connection.close(); }
      catch (error) { res.send({status: "error", message: error.message}) }
    }
  }

});

router.get('/read', async function (req, res, next) {
  
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  
  try {
    //Create connection from session variable
    connection = await oracledb.getConnection(req.session.connection);
    
    // EXECUTE QUERY & GET DATA
    const sql = `SELECT * FROM pdd.FIELD_PLAN_ACTUAL_DATA_ where 
    field_id= :field_id and financial_year = :financial_year`;

    const binds ={
      field_id: req.body.field_id,
      financial_year: req.body.financial_year
    };
    
    result = await connection.execute(sql,binds);
    res.send ({status: "success", message: result.rows});

  } 
  catch (error) { res.send({status: "error", message: error.message}) }
  finally {
    if (connection) {
      try { await connection.close(); }
      catch (error) { res.send({status: "error", message: error.message}) }
    }
  }
});

router.get('/read/field/:field_id/financial-year/:financial_year/month-year/:month_year/type/:type', async function (req, res, next) {
  
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  
  try {    
    
    // Set query
    const sql = `SELECT * FROM pdd.FIELD_PLAN_ACTUAL_DATA_ where 
                    field_id          =     :field_id and 
                    financial_year    =     :financial_year and
                    upper(month_year) like  upper(:month_year) and
                    upper(type)       like  upper(:type)
                    order by row_index, col_index`;

    // Set parameters
    const binds = {
      field_id: req.params.field_id,
      financial_year: req.params.financial_year,
      month_year: req.params.month_year,
      type: req.params.type
    };

    //Set options
    const options = {};
    
    // Check session and execute query
    let response = await getData(req,sql,binds,options);

    // For Troubleshooting Only
    // response.sql = sql;
    // response.binds = binds;

    res.send(response);

  }
  catch (error) { res.send({status: "error", message: error.message}); }
  finally {
    
  }
});

router.get('/read/field/:field_id/month-year/:month_year', async function (req, res, next) {
  
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  
  try {    
    
    // Set query
    const sql = `SELECT * FROM pdd.FIELD_PLAN_ACTUAL_DATA_ where 
                    field_id= :field_id and 
                    month_year=:month_year order by row_index, col_index`;

    // Set parameters
    const binds = {
      field_id: req.params.field_id,
      month_year: req.params.month_year
    };

    //Set options
    const options = {};
    
    // Check session and execute query
    let response = await getData(req,sql,binds,options);

    // For Troubleshooting Only
    // response.sql = sql;
    // response.binds = binds;

    res.send(response);

  }
  catch (error) { res.send({status: "error", message: error.message}); }
  finally {
    
  }
});





router.post('/update', async function (req, res, next) {
  // res.send(req.body.changes);

  // Create connection
  try { connection = await oracledb.getConnection(req.session.connection); }
  catch (error) { res.send({status: "error", message: error.message}) }

  try {

    let changes = JSON.parse(req.body.changes);
    let field_id = req.body.field_id;
    let financial_year = req.body.financial_year;
    let successCount = [];

    console.log(changes,field_id,financial_year);
    // res.send(changes);
    
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // EXECUTE QUERY & GET DATA
    for (let i = 0; i < changes.length; i++) {
      const element = changes[i];
      let sql = `UPDATE pdd.FIELD_PLAN_ACTUAL_DATA_
      
        set value=:value where
          row_index=:row_index and
          col_index=:col_index and
          field_id=:field_id and
          financial_year=:financial_year      
      `;    

      let binds = {
        value: changes[i].val,
        row_index: changes[i].row,
        col_index: changes[i].col,
        field_id: field_id,
        financial_year: financial_year
      };
      const options = {
        autoCommit: true,
        // bindDefs: {
        //   CREATED_ON: { type: oracledb.DATE }
        // }
      };
      result = await connection.execute(sql, binds,options);
      successCount.push[result];
    }
    
    res.send ({status: "success", message: successCount});
    
    // res.send ({status: "success", message: result.rows});
    
    // console.log(result);

  } 
  catch (error) { res.send({status: "error", message: error.message}) }
  finally {
    if (connection) {
      try { await connection.close(); }
      catch (error) { res.send({status: "error", message: error.message}) }
    }
  }
});

router.post('/read/:data', async function (req, res, next) {
  
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  
  try {

    //Create connection from session variable
    connection = await oracledb.getConnection(req.session.connection);
    
    // EXECUTE QUERY & GET DATA
    const sql = dataSQLs[req.params.data];

    // Get field list after logging in    
    if(req.session.user.toUpperCase().indexOf('PDD') >=0 ){ //Admin User
      //Fetch all Fields
      binds = {};
    }
    else{ //Asset users
      sql += ` where upper(asset)=upper(:asset)`;
      binds = {asset: req.session.user};
    }
    
    result = await connection.execute(sql,binds);
    res.send ({status: "success", message: result.rows});

  } 
  catch (error) { res.send({status: "error", message: error.message}) }
  finally {
    if (connection) {
      try { await connection.close(); }
      catch (error) { res.send({status: "error", message: error.message}) }
    }
  }
});


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Common Function for 
// Checking session, Executing SQl and Getting data from DB
async function getData(req,sql,binds,options){
  console.log(sql,binds,options);
  try {
    //Check for session
    if (!req.session.status) throw new Error('Not Logged in');
    
    //Create connection from session variable
    connection = await oracledb.getConnection(req.session.connection);
    result = await connection.execute(sql,binds,options);
    return {status: "success", message: result.rows.length + " records fetched", data: result.rows};
  } 
  catch (error) { return {status: "error", message: error.message}; }
  finally {
    if (connection) {
      try { await connection.close(); }
      catch (error) { return {status: "error", message: error.message}; }
    }
  }
}

module.exports = router;
