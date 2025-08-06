import { TextField, Button, Container, Typography, CircularProgress, Checkbox, FormControlLabel } from '@mui/material'

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginUserThunk } from '../../features/authSlice'

import '../../styles/login.css'

function Login() {
   const [email, setEmail] = useState('') // 이메일 상태
   const [password, setPassword] = useState('') // 비밀번호 상태
   const dispatch = useDispatch()
   const navigate = useNavigate()
   const { loading, error } = useSelector((state) => state.auth)

   const [isOpen, setIsOpen] = useState(false)
   const [isEmail, setOpenEmail] = useState(false)
   const [isPhone, setOpenPhone] = useState(false)

   // 아이디 저장
   const [rememberMe, setRememberMe] = useState(false)

   useEffect(() => {
      const savedEmail = localStorage.getItem('savedEmail')
      if (savedEmail) {
         setEmail(savedEmail)
         setRememberMe(true)
      }
   }, [])

   const openPopup = () => setIsOpen(true)
   const closePopup = () => setIsOpen(false)
   const openEmail = () => setOpenEmail(true)
   const closeEmail = () => setOpenEmail(false)
   const openPhone = () => setOpenPhone(true)
   const closePhone = () => setOpenPhone(false)

   const handleLogin = (e) => {
      e.preventDefault()

      // 이메일과 패스워드가 둘다 공백이 아니라면 실행
      if (email.trim() && password.trim()) {
         // 아이디 저장
         if (rememberMe) {
            localStorage.setItem('savedEmail', email)
         } else {
            localStorage.removeItem('savedEmail')
         }

         dispatch(loginUserThunk({ email, password }))
            .unwrap()
            .then(() => {
               navigate('/')
            })
            .catch((error) => console.error('로그인 실패: ', error))
      } else {
         alert('이메일과 패스워드를 입력해주세요!')
         return
      }
   }

   return (
      <Container maxWidth="sm">
         <Typography variant="h4" gutterBottom>
            로그인
         </Typography>

         {error && (
            <Typography color="error" align="center">
               {error}
            </Typography>
         )}

         <form onSubmit={handleLogin}>
            <TextField label="이메일" name="email" fullWidth margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />

            <TextField label="비밀번호" type="password" name="password" fullWidth margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />

            <FormControlLabel control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />} label="아이디 저장하기" />

            {/* 비밀번호 찾기 */}
            <div className="App">
               <button type="button" onClick={openPopup}>
                  비밀번호 찾기
               </button>

               {isOpen && (
                  <div className="overlay">
                     <div className="popup">
                        <button className="close-btn" onClick={closePopup}>
                           닫기
                        </button>
                        <button type="button" onClick={openEmail}>
                           이메일로 찾기
                        </button>
                        <button type="button" onClick={openPhone}>
                           핸드폰 번호로 찾기
                        </button>
                     </div>
                  </div>
               )}
               {isEmail && (
                  <div className="overlay">
                     <div className="popup">
                        <button className="close-btn" onClick={closeEmail}>
                           뒤로가기
                        </button>
                        <button
                           className="close-btn"
                           onClick={() => {
                              setOpenEmail(false)
                              setIsOpen(false)
                           }}
                        >
                           닫기
                        </button>
                        <TextField label="회원가입 시 작성한 이메일을 입력해주세요." />
                        <button onClick={openEmail}>이메일로 찾기</button>
                     </div>
                  </div>
               )}
               {isPhone && (
                  <div className="overlay">
                     <div className="popup">
                        <button className="close-btn" onClick={closePhone}>
                           뒤로가기
                        </button>
                        <button
                           className="close-btn"
                           onClick={() => {
                              setOpenEmail(false)
                              setIsOpen(false)
                           }}
                        >
                           닫기
                        </button>
                        <TextField label="회원가입 시 작성한 핸드폰 번호를 입력해주세요. 010-XXXX-XXXX" />
                        <button onClick={openPhone}>핸드폰 번호로 찾기</button>
                     </div>
                  </div>
               )}
            </div>
            <Button variant="contained" color="primary" type="submit" fullWidth disabled={loading} sx={{ position: 'relative', marginTop: '20px' }}>
               {loading ? (
                  <CircularProgress
                     size={24}
                     sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                     }}
                  />
               ) : (
                  '로그인'
               )}
            </Button>
         </form>

         <p>
            계정이 없으신가요? <Link to="/signup">회원가입 하기</Link>
         </p>
         <p style={{ textAlign: 'center' }}>다른 계정으로 로그인</p>
         {/* <Button variant="contained" color="primary" type="submit" fullWidth disabled={loading} sx={{ position: 'relative', marginTop: '20px' }}>
            {loading ? (
               <CircularProgress
                  size={24}
                  sx={{
                     position: 'absolute',
                     top: '50%',
                     left: '50%',
                     transform: 'translate(-50%, -50%)',
                  }}
               />
            ) : (
               '구글 아이디로 로그인'
            )}
         </Button> */}
         <button onClick={() => (window.location.href = 'http://localhost:8000/auth/google/callback')}>구글로 로그인</button>
      </Container>
   )
}

export default Login
