
var kakaoStrategy = require('passport-kakao').Strategy

module.exports = function(app, passport) {
    return new kakaoStrategy({
        clientID: "a58b523f1bf601ac92f3e80babd1b916",
        callbackURL : "http://localhost:3000/oauth/kakao/callback"
    }, function(accesssToken, refreshToken, profile, done){
        console.log('kakao of passport Called')
        console.dir(profile)

        var client  = app.get('database')
        client.getConnection(function(err, conn){
            if(err){
                console.log(' error : ' + err.stack)
                if(conn){
                    conn.release();
                }
                return done(err);
            }
    

            var id = 'qqq'
            var password = '123'

            var columns = ['id', 'name']
            var tablename = 'user'
    
            var exec = conn.query('select ?? from ?? where id = ? and password = ?',[columns, tablename, id, password], function(err, rows){
                conn.release()
                console.log('sql : ' + exec.sql)
    
                if(rows.length > 0 ){
                    console.log(' find user [%s, %s]', rows[0].id, password)//ttest
                    return done(null, "kakao_id")
                }
                else{
                    console.log(' ... fail : that user[%s, %s] is not exist', id, password)
                    return done(null, false, {message : 'Wrong info or don\'t exist'});
                }
            })
        })



    })
    


}