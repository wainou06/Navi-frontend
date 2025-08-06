import { Button, CircularProgress } from '@mui/material'

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginUserThunk } from '../../features/authSlice'

function SearchPw() {
   const [email, setEmail] = useState('') // 이메일 상태
   const [password, setPassword] = useState('') // 비밀번호 상태
   const dispatch = useDispatch()
   const navigate = useNavigate()
   const { loading, error } = useSelector((state) => state.auth)

   const handleLogin = (e) => {
      e.preventDefault()

      // 이메일과 패스워드가 둘다 공백이 아니라면 실행
      if (email.trim() && password.trim()) {
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
      <>
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
               '이메일로 찾기'
            )}
         </Button>
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
               '핸드폰 번호로 찾기'
            )}
         </Button>
      </>
   )
}

export default SearchPw
