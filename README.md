# node_server
연습하는 용

npm init
package.json을 생성하여 프로젝트 정보를 담는다.
package.json이 있는 디렉토리에서 npm install을 해주면 깔린다.


#serve-static
특정 폴더의 파일들을 특정 패스로 접근할 수 있도록 만들어 준다.
```
ProjectDiretory/public/index.html
ProjectDiretory/public/image/car.jpg
ProjectDiretory/public/js/main.js
ProjectDiretory/public/css/style.css
```
다음과 같이 파일과 폴더들이 있다면 다음과 같은 주소로 접근이 가능하다.
```
http://127.0.0.1:3000/index.html
http://127.0.0.1:3000/image/car.jpg
http://127.0.0.1:3000/js/main.js
http://127.0.0.1:3000/css/style.css
```
요청 패스를 지정하여 특정 폴더와 매핑되어 접근이 가능하게 된다.
```js
app.use('/public', express.static(__dirname + '/public'));
```

use()메소드의 첫 번째 파라미터로 요청 패스를 지정하고, 두번 째 파라미터로 static()함수에 특정 폴더를 지정해준다.
express.static 함수에 제공되는 경로는 node 프로세스가 실행되는 디렉토리에 대해 상대적이다. Express 앱을 다른 디렉토리에서 실행하는 경우 제공하기 원하는 디렉토리의 절대 경로를 사용하는 것이 더 안전하다.


#CookieParer

error
==Most middleware (like cookieParser) is no longer bundled with Express and must be installed separately.==

```js
var cookieParser = require('cookie-parser')
app.use(cookieParser())
```
이렇게 해주면 됨
```js
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
```

#Cookie 수신 못하던 오류

```js
//라우터 미들웨어 등록
app.use('/',router);
```
이거를 밑에다 놔야하는데 라우팅 함수 위에 있어서 안되던거였다....

#Session

```
$ npm intall express-session --save
```

```js
...
,   cookieParser = require('cookie-parser')
,   expressSession = require('express-session')

...

//Session
app.use(expressSession({
    secret:'my key',
    resave:true,
    saveUninitialized:true
}))
```

```js
router.route('/login').post(function(req,res){
	...
    //세션이 존재하면 페이지 이동
    if(req.session.user){
        console.log('login status')
        res.redirect('/product')
    }
    //없으면 세션 생성
    else{
        req.session.user = {
            id: paramId,
            name:'name',
            authorized:true
        }
    }
    
    ...
    
});
```

```js
router.route('/product').get(function(req,res){
    console.log('>> load : /product load')
    //세션이 있으면 보여주기
    if(req.session.user){
        var instream = fs.createReadStream(__dirname+'/static/template/product.html')
        instream.pipe(res);
    }
    //없으면 로그인 페이지로 이동
    else{
        var instream = fs.createReadStream(__dirname+'/static/template/login.html')
        instream.pipe(res);
    }
})
```
