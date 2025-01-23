var express = require('express');
var router = express.Router();
const oracledb = require('oracledb'); // Library for Oracle Connection

/*
  Values to store in Session
  * Status              : boolean
  * Username            : Username of current user
  * Connection Object   : Oracle Connection Object
  * Asset Name          : ? "" for PDD users
  * Asset Code          : ? "" for PDD users
  * Field List          : ?
  * 
*/

////////////////////////////////////////////////////////////////////////////
//For checking session and fetching essential session variables for client-side use
router.get('/', function (req, res, next) {    
  try {    
    res.send({
      status  : "success",
      session : req.session.status ? true : false,
      message : req.session.status ? req.session.user + " is logged in." : "No session",
      data    : {
        user        : req.session.user,
        usertype    : req.session.usertype,
        name        : req.session.name,
        asset_name  : req.session.asset_name,
        asset_code  : req.session.asset_code,
        asset_type  : req.session.asset_type,
        asset_id    : req.session.asset_id,
        field_list  : req.session.field_list
      }
    });
  } catch (error) {
    res.send({
      status: "error", 
      message: error.message
    });
  }
});



////////////////////////////////////////////////////////////////////////////
//For logging out user - Regenerate session
router.post('/logout', function (req, res, next) {
  req.session.regenerate(function(err) {
    // Will have a new session here
    req.session.status = false;  
    res.send({
      status: "success", 
      message: "Session Destroyed!",
      user: req.session.user,
      sessionStatus: req.session.status
    });    
  })
});

////////////////////////////////////////////////////////////////////////////
//For logging in
router.post('/login', async function (req, res, next) {
  
  // Credentials sent by user;
  let connectionObject = {
    user: req.body.user,
    password: req.body.password,
    connectString: "10.203.10.44/epiddn",
  }

  let response = {}, connection;

  try {
    //Attempt login using user credentials
    connection = await oracledb.getConnection(connectionObject);

    //Set session
    req.session.status = true;
    req.session.user = connectionObject.user;
    req.session.connection = connectionObject;
      
    ////////////////////////////////////////////////////////////////////////////
    // Read user details from DB and set session variables
    sql = `select * from pdd.VW_ASSET_USER_LIST where upper(username)=upper(:username)`;
    binds = {username: connectionObject.user};
    options = {outFormat: oracledb.OUT_FORMAT_OBJECT};
    
    result = await connection.execute(sql,binds,options);

    req.session.userdata = result.rows[0];
    req.session.name = result.rows[0].NAME;
    req.session.asset_name = result.rows[0].ASSET_NAME;
    req.session.asset_id = result.rows[0].ASSET_ID;
    req.session.asset_code = result.rows[0].ASSET_CODE;
    req.session.usertype = result.rows[0].USER_TYPE;

    // Get field list
    if(req.session.usertype == "admin" || req.session.usertype == "viewer"){
      // For Admin or Viewer User, populate all assets/field list
      sql = `select ID, FIELD, ASSET_ID, ASSET_NAME, ASSET_CODE, ASSET_TYPE from pdd.VW_ASSET_FIELD_LIST where ID < 10000 order by ASSET_NAME, FIELD`;
      result = await connection.execute(sql,{},options);
      req.session.field_list = result.rows;
      req.session.asset_type = "ALL";
    }
    else if (req.session.usertype == "asset") {
      // Asset User
      sql = `select ID, FIELD, ASSET_TYPE from pdd.VW_ASSET_FIELD_LIST where ASSET_ID = :ASSET_ID and ID < 10000 order by FIELD`;
      binds = {asset_id: req.session.asset_id};
      result = await connection.execute(sql,binds,options);
      req.session.field_list = result.rows;
      req.session.asset_type = result.rows[0].ASSET_TYPE;
    }    

    response  = {status: "success", message: "Logged in successfully!"};
  } 
  catch (error) { response  = {status: "error", message: error.message} }
  finally {
    if (connection) {
      try { await connection.close(); }
      catch (error) { response  = {status: "error", message: error.message} }
    }
  }

  //Send response
  res.send(response);

});


/* ---------------------------------------------------------------------------------*/
//Below routes are not in use
router.post('/destroysession', function (req, res, next) {
  // req.session.destroy(function(){
  //   console.log("user logged out.");
  // });
  req.session.regenerate(function(err) {
    // will have a new session here
    req.session.status = false;  
    res.send({
      status: "success", 
      message: "Session Destroyed!",
      params: req.session.connection,
      sessionStatus: req.session.status
    });    
  })
  // req.session.status = false;  
  
});

//For checking if user is logged in or not
router.post('/checksession', function (req, res, next) {  
  try {    
    res.send({
      status: "success",   
      message: req.session.status ? req.session.user + " is logged in." : "No session available",
      sessionStatus: req.session.status ? true : false,
    });    
  } catch (error) {
    res.send({
      status: "error", 
      message: error.message
    });
  }
});

//For changing password
router.post('/change', async function (req, res, next) {  
  try {    

    const user =  req.session.user;
    const password =  req.body.password;

    sql = `alter user ` + user + ` identified by ` + password;
    binds = {};
    options = {};    
    
    //Check for session
    if (!req.session.status) throw new Error('Not Logged in');

    //Create connection from session variable
    connection = await oracledb.getConnection(req.session.connection);
    result = await connection.execute(sql, binds, options);

    res.send({ status: "success", data: result });    
  } 
  catch (error) {
    res.send({
      status: "error", 
      message: error.message
    });
  }
});

/* ---------------------------------------------------------------------------------*/



module.exports = router;
