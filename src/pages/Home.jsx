import { Container, Typography } from '@mui/material'
import Button from '@mui/material/Button'

import LoyaltyIcon from '@mui/icons-material/Loyalty'
import { logoutUserThunk } from '../features/authSlice'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useState } from 'react'

function Home({ isAuthenticated, user }) {
   const dispatch = useDispatch()
   const navigate = useNavigate()
   // const [user, setUser] = useState(null)

   const handleLogout = () => {
      dispatch(logoutUserThunk())
         .unwrap()
         .then(() => {
            navigate('/') // 로그아웃시 홈으로 이동
         })
         .catch((error) => {
            alert('로그아웃 실패: ' + error)
         })
   }
   return (
      <Container
         maxWidth="lg"
         sx={{
            marginTop: 10, // 1 = 8px, 혹은 mt: 10
            marginBottom: 13,
         }}
      >
         <Typography variant="h4" align="center" gutterBottom>
            <LoyaltyIcon sx={{ color: '#e91e63', fontSize: 35, mt: 10 }} />홈
         </Typography>
      </Container>
   )
}

export default Home
