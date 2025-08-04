const express = require('express')
const bcrypt = require('bcrypt')
const passport = require('passport')
const User = require('../models/user')
const { isLoggedIn, isNotLoggedIn } = require('./middlewares')

const router = express.Router()

// 회원가입
router.post('/join', isNotLoggedIn, async (req, res, next) => {
   try {
      const { email, name, address, password, nick, phone } = req.body

      const exUser = await User.findOne({
         where: { email },
      })

      if (exUser) {
         const error = new Error('이미 존재하는 사용자 입니다.')
         error.status = 409
         return next(error)
      }

      const hash = await bcrypt.hash(password, 12)

      const newUser = await User.create({
         email,
         name,
         password: hash,
         role: 'USER',
         address,
         nick,
         phone,
      })

      res.status(201).json({
         success: true,
         message: '회원가입을 성공하였습니다.',
         user: {
            id: newUser.id,
            name: newUser.name,
            role: newUser.role,
         },
      })
   } catch (error) {
      error.status = 500
      error.message = '회원가입 중 오류가 발생했습니다.'
      next(error)
   }
})

// 로그인
router.post('/login', isNotLoggedIn, async (req, res, next) => {
   passport.authenticate('local', (authError, user, info) => {
      if (authError) {
         authError.status = 500
         authError.message = '인증 중 오류 발생'
         return next(authError)
      }

      if (!user) {
         const error = new Error(info.message || '로그인 실패')
         error.status = 401
         return next(error)
      }

      req.login(user, (loginError) => {
         if (loginError) {
            loginError.status = 500
            loginError.message = '로그인 중 오류 발생'
            return next(loginError)
         }
         784.2
         res.json({
            success: true,
            message: '로그인 성공',
            user: {
               id: user.id,
               name: user.name,
               role: user.role,
            },
         })
      })
   })(req, res, next)
})

// 로그아웃
router.get('/logout', isLoggedIn, async (req, res, next) => {
   req.logout((logoutError) => {
      if (logoutError) {
         logoutError.status = 500
         logoutError.message = '로그아웃 중 오류 발생'
         return next(logoutError)
      }

      res.json({
         success: true,
         message: '로그아웃에 성공했습니다.',
      })
   })
})

// 상태확인
router.get('/status', async (req, res, next) => {
   try {
      if (req.isAuthenticated()) {
         res.status(200).json({
            isAuthenticated: true,
            user: {
               id: req.user.id,
               name: req.user.name,
               role: req.user.role,
            },
         })
      } else {
         res.status(200).json({
            isAuthenticated: false,
         })
      }
   } catch (error) {
      error.status = 500
      error.message = '로그인 상태확인 중 오류가 발생했습니다.'
      next(error)
   }
})

module.exports = router
