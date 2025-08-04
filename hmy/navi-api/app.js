const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const passport = require('passport')
const path = require('path')
require('dotenv').config()
const { swaggerSpec, swaggerUi } = require('./swagger')
const http = require('http')
const socketIO = require('./socket')

//라우터 및 기타 모듈 불러오기
const indexRouter = require('./routes')
const itemsRouter = require('./routes/items')
const rentalItemsRouter = require('./routes/rentalItems')
const authRouter = require('./routes/auth')

const { sequelize } = require('./models')
const passportConfig = require('./passport')

const app = express()
passportConfig()
app.set('port', process.env.PORT || 8002)

// 시퀄라이즈를 사용한 DB연결
sequelize
   .sync({ force: false })
   .then(() => {
      console.log('데이터베이스 연결 성공')
   })
   .catch((err) => {
      console.log('데이터베이스 연결 실패:', err)
   })

//미들웨어 설정
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use(
   cors({
      origin: process.env.FRONTEND_APP_URL,
      credentials: true,
   })
)
app.use(morgan('dev'))
app.use(express.static(path.join(__dirname, 'uploads')))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser(process.env.COOKIE_SECRET))
//세션 설정
const sessionMiddleware = session({
   resave: false, //세션 데이터가 변경사항이 없어도 재저장 할지 여부 -> 변경사항이 있어야 재저장
   saveUninitialized: true, //초기화 되지 않은 세션 저장 여부 -> 초기화 되지 않은 빈 세션도 저장
   secret: process.env.COOKIE_SECRET, //세션 암호화 키
   cookie: {
      httpOnly: true, //javascript로 쿠키에 접근가능한지 여부 -> true 일경우 접근 X
      secure: false, //https를 사용할때만 쿠키 전송 여부 -> http, https 둘다 사용가능
   },
})
app.use(sessionMiddleware)

app.use(passport.initialize())
app.use(passport.session())

//라우터 등록
app.use('/', indexRouter)
app.use('/auth', authRouter)
app.use('/items', itemsRouter)
app.use('/rental', rentalItemsRouter)

// HTTP 서버 생성
const server = http.createServer(app)

socketIO(server, sessionMiddleware)

// 잘못된 라우터 경로 처리
app.use((req, res, next) => {
   const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`)
   error.status = 404
   next(error)
})

app.use((err, req, res, next) => {
   console.error(err)

   const statusCode = err.status || 500
   const errorMessage = err.message || '서버 내부 오류'

   if (process.env.NODE_ENV === 'development') {
      console.log(err)
   }

   res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: err,
   })
})

server.listen(app.get('port'), () => {
   console.log(app.get('port'), '번 포트에서 대기중')
})
