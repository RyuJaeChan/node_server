



var LocalStrategy = require('passport-local').Strategy

module.exports = new LocalStrategy({
    usernameField : 'id',
    passwordField : 'password',
    passReqToCallback : true
}, function(req, id, password, done){
    var client = req.app.get('database');
    client.getConnection(function(err, conn){
        if(err){
            console.log(' error : ' + err.stack)
            if(conn){
                conn.release();
            }
            return done(err);
        }

        var columns = ['id', 'name']
        var tablename = 'user'

        var exec = conn.query('select ?? from ?? where id = ? and password = ?',[columns, tablename, id, password], function(err, rows){
            conn.release()
            console.log('sql : ' + exec.sql)

            if(rows.length > 0 ){
                console.log(' find user [%s, %s]', rows[0].id, password)//ttest
                return done(null, id)
            }
            else{
                console.log(' ... fail : that user[%s, %s] is not exist', id, password)
                return done(null, false, {message : 'Wrong info or don\'t exist'});
            }
        })
    })
})