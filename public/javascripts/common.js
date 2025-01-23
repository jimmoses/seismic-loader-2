/*
    * Called at the beginning of each html file
    * Checks for session and sets value of g_user
    * Page can check g_user and act accordingly

*/



var g_user = {
    session: false,
    usertype: "guest"
}
// checkSession(); //Calling this updates g_user

function checkSession() {
    return fetch("/session/")
        .then(response => {
            return response.json();
        })
        .then(response => {
            console.log(response);
            if (response.session) { //If session exists
                g_user.session = response.session;
                g_user.user = response.data.user;
                g_user.usertype = response.data.usertype;
                g_user.name = response.data.name;
                g_user.asset_id = response.data.asset_id;
                g_user.asset_code = response.data.asset_code;
                g_user.asset_name = response.data.asset_name;            
                g_user.asset_type = response.data.asset_type;            
                g_user.field_list = response.data.field_list;       
                return "logged in";
            }
            else{
                g_user.session = false;
                g_user.name = "Guest";
                g_user.asset_id = null;
                g_user.asset_code = null;
                g_user.asset_name = null;            
                g_user.field_list = null;                
                return "not logged in";
            }
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
    
    return fetch("/session/login",{
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        method: "post",
        body: dataToSend
    })
    .then( response => {      
        return response.json();
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
        return checkSession();
    })
    .then( response => {
        if(response == "not logged in") window.location.href="/index.html";
    })
    .catch((error) => {
        console.error(error);
    });
}