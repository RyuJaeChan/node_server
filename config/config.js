module.exports = {
    server_port : 3000,
    route_info : [
        {path : "/login", type:"get", file : "./user", method : "login_get"},
        {path : "/login", type:"post", file : "./user", method : "login_post"},
        {path : "/signup", type:"get", file : "./user", method : "signup_get"},
        {path : "/signup", type:"post", file : "./user", method : "signup_post"},
        {path : "/logout", type:"post", file : "./user", method : "logout"}
    ]



}