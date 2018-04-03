/*  route/user.js
*       
*   public fucntions
*       init(client)
*       login_get(req, res)
*       login_post(req, res)
*       logout(req,res)
*       signin_get(req, res)
*       signin_post(req, res)
*
*   private functions
*       authUser(id, password)
*       addUser(id, name, age, password, callback)
*/
var fs = require('fs');

var template_dir = __dirname+'/../static/template/';
var client;


var init = function(db){
    client = db;
}

var login_get = function(req,res){
    console.log('>> load : /login(get)')
    var instream = fs.createReadStream(template_dir + 'login.html')
    instream.pipe(res);
}

var login_post = function(req,res){
    console.log('>> load : /login(post)')
    var paramId = req.body.id;
    var paramPassword = req.body.password;
    console.log('paramId : ' +paramId)
    console.log('paramPassword : ' + paramPassword)
    if(client){
        authUser(paramId, paramPassword, function(err, result){
            if(err){
                console.log('   ... error')
                return;
            }
            if(result){
                console.log('   ... success')
                console.log('user name : ' + result[0].name);
            }
        })
    }
    if(req.session.user){
        console.log('login status')
        res.redirect('/product')
    }
    else{
        req.session.user = {
            id: paramId,
            name:'name',
            authorized:true
        }
    }
	res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
	res.write('<h1>Express 서버에서 응답한 결과입니다.</h1>');
	res.write('<div><p>Param id : ' + paramId + '</p></div>');
    res.write('<div><p>Param password : ' + paramPassword + '</p></div>');
    res.write("<br><br><a href='/product'>상품 페이지로 이동</a>")
	res.end();
}

var logout = function(req,res){
    console.log(">> load : /logout(get)")
    if(req.session.user){
        console.log('logout process')
        req.session.destroy(function(err){
            if(err){throw err;}
            console.log('   ... success!')
            res.redirect('/login')
        })
    }
    else{
        console.log('you are not signed in.')
        res.redirect('/login')
    }
}

var signup_get = function(erq,res){
    console.log('>> load : /signup(get)')
    var instream = fs.createReadStream(template_dir + 'signup.html')
    instream.pipe(res)
}

var signup_post = function(req,res){
    console.log('>> load : /signup(post)')
    var param_id = req.body.id;
    var param_pw = req.body.password;
    var param_age = req.body.age;
    var param_name = req.body.name;
    console.log('parameter : %s, %s, %s, %s', param_id, param_pw, param_name, param_age)
    if(client){
        addUser(param_id, param_name, param_age, param_pw, function(err, addedUser){
            if(err){
                console.error('   ... error : ' + err.stack)
            }

            if(addedUser){
                console.dir(addedUser);
                console.log('   ... success')
                res.redirect('/login');
            }
            else{
                console.log('   ... fail')
            }
        })
    }
    else{
        console.log('   ... error : client is null')
    }
}

var addUser = function(id, name, age, password, callback){
    console.log('addUser Called')

    client.getConnection(function(err, conn){
        if(err){
            if(conn){
                conn.release();
            }
            callback(err, null);
            return;
        }
        console.log('Database connected Thread Id : ' + conn.threadId)

        var data = { id : id, name : name, age:age,password:password}

        var exec = conn.query('insert into user set ?', data, function(err, result){
            conn.release()
            console.log('SQL : ' + exec.sql)
            if(err){
                console.log('   ... sql error');
                console.dir(err);

                callback(err,null);
                return;
            }
            callback(null, result);
        })
    })
}
var authUser = function(id, password, callback){
    console.log('authUser Called')

    client.getConnection(function(err, conn){
        if(err){
            console.log(' error : ' + err.stack)
            if(conn){
                conn.release();
            }
            callback(err, null);
            return;
        }

        var columns = ['id', 'name']
        var tablename = 'user'

        var exec = conn.query('select ?? from ?? where id = ? and password = ?',[columns, tablename, id, password], function(err, rows){
            conn.release()
            console.log('sql : ' + exec.sql)

            if(rows.length > 0 ){
                console.log(' find user [%s, %s]', rows[0].id, password)//ttest
                callback(null, rows);
            }
            else{
                console.log(' ... fail : that user[%s, %s] is not exist', id, password)
                callback(null, null);
            }
        })
    })
}



module.exports.init = init;
module.exports.login_get = login_get;
module.exports.login_post = login_post;
module.exports.logout = logout;
module.exports.signup_get = signup_get;
module.exports.signup_post = signup_post;