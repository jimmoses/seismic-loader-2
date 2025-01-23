function init(){
    if (g_user.session) {    //If user is logged in        

        console.log(g_user);
        if (g_user.type.toLowerCase() == "admin") showAdminOptions();
        else showUserOptions();
    }

    checkSession()
    .then(response => {
        console.log(response);
    })
    .catch((error) => {
        console.error(error);
    });
}

window.onload = (event) => {
    init();
};