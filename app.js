var express = require('express')
,   http    = require('http')
,   path    = require('path')

var bodyParser = require('body-parser')
,   cookieParser = require('cookie-parser')
,   static  = require('serve-static')
,   errorHandler = require('errorhandler')
,   expressErrorHandler = require('express-error-handler')
,   expressSession = require('express-session')

,   multer  = require('multer')  //파일 업로드용 미들웨어
,   fs      = require('fs')
,   cors    = require('cors')    //ajax 요청 시 CORS 지원

,   mysql   = require('mysql')

,   user    = require('./route/user')

require('date-utils')


var client = mysql.createPool({     //데이터 베이스 연결 객체가 많이 만들어지는 것을 막고 한번 만든 연결을 다시 사요할 수있게
    connectionLimit : 10,           //커넥션 풀에서 만들 수 있는 최대 연결 개수
    host            : 'localhost',  //연결할 호스트 이름
    port            : 3306,         //데이터베이스가 사용하는 포트
    user            : 'root',       //데이터베이스 사용자 id
    password        : 'qwe123',     //비밀번호
    database        : 'test',       //데이터베이스 이름
    debug           : 'false'       //처리 과정을 로그로 남길것인지.
})

var app = express();
app.set('port', 3000);


/* 미들웨어 등록 */             
//정적파일 연결
app.use('/public', static(path.join(__dirname, 'static')));
app.use('/uploads', static(path.join(__dirname, 'uploads')));
//Body Parser를 통해 x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({extended:false}));
//Body parser를 통한 json 파싱
app.use(bodyParser.json()); 
//쿠키
app.use(cookieParser());
//Session
app.use(expressSession({
    secret:'my key',
    resave:true,
    saveUninitialized:true
}));
//ajax로 요청 시 CORS(다중 서버 접속) 지원
app.use(cors());

//multer 미들웨어 사용 : 순서 body-parser -> multer -> router
var storage = multer.diskStorage({
    destination : function (req, file, callback){   //업로드한 파일이 저장될 폴더
        callback(null, 'uploads')
    },
    filename:function(req, file, callback){         //업로드한 파일의 이름
        callback(null, file.originalname)
    }
})

var upload = multer({
    storage : storage,
        limits:{
            files:10,                   //개수
            fileSize : 1024*1024*1024   //용량
        }
})



var router = express.Router()       //라우터 객체 참조


router.route('/photo').post(upload.array('photo', 1), function(req,res){
    console.log(">> load : /photo(post)")
    try{
        var files = req.files
        console.log('file info')
        console.dir(req.files[0])
        console.dir('#==========#')
        var originalname = "",
        filename = '',
        mimetype = '',
        size = 0;

        if(Array.isArray(files)){   //파일이 여러개
            console.log('number of files : %d', files.length)
            for(var i = 0 ; i < files.length; i++){
                originalname = files[i].originalname
                filename = files[i].filename
                mimetype = files[i].mimetype
                size = files[i].size;
            }
        }
        else{
            originalname = files[index].originalname;
	    	filename = files[index].name;
	    	mimetype = files[index].mimetype;
	    	size = files[index].size;
        }   
        
        console.log('현재 파일 정보 : ' + originalname + ', ' + filename + ', '
        + mimetype + ', ' + size);

        // 클라이언트에 응답 전송
        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
        res.write('<h3>파일 업로드 성공</h3>');
        res.write('<hr/>');
        res.write('<p>원본 파일명 : ' + originalname + ' -> 저장 파일명 : ' + filename + '</p>');
        res.write('<p>MIME TYPE : ' + mimetype + '</p>');
        res.write('<p>파일 크기 : ' + size + '</p>');
        res.end();
    }catch(err){
        console.dir(err.stack);
    }
})

router.route('/photo').get(function(req,res){
    console.log(">> load : /photo(get)")
    var instream = fs.createReadStream(__dirname + '/static/template/photo.html')
    instream.pipe(res);
})

router.route('/signup').get(user.signup_get)

router.route('/signup').post(user.signup_post)

router.route('/login').get(user.login_get)

router.route('/login').post(user.login_post)

router.route('/logout').get(user.logout)

router.route('/showCookie').get(function(req,res){
	console.log('>> load : /showCookie');
    console.log(req.cookies);

    res.send(req.cookies);
})

router.route('/setCookie').get(function(req,res){
	console.log('>> load : /setCookie');
	res.cookie('user', {
        id: 'mike',
        te : 'etweoti'
	});
    res.redirect('/showCookie');
})

router.route('/product').get(function(req,res){
    console.log('>> load : /product load')
    if(req.session.user){   //세션이 존재할 때 표시
        var instream = fs.createReadStream(__dirname+'/static/template/product.html')
        instream.pipe(res);
    }
    else{   //없으면 로그인 페이지로 이동
        var instream = fs.createReadStream(__dirname+'/static/template/login.html')
        instream.pipe(res);
    }
})

//라우터 미들웨어 등록
app.use('/',router);    


//Error handler
var errorHandler = expressErrorHandler({
    static:{
        '404' : __dirname +'/static/template/404.html'
    }
})
app.use(expressErrorHandler.httpError(404))
app.use(errorHandler)

http.createServer(app).listen(app.get('port'), function(){
    var dt = new Date();
    console.log('['+dt.toFormat('YYYY-MM-DD HH24:MI:SS')+'] Server start at '+app.get('port'));
    user.init(client)
})