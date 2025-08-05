import './styles/common.css'
import Home from './pages/Home'
import Navbar from './components/shared/Navbar'
import Footer from './components/shared/Footer'

import { checkAuthStatusThunk } from './features/authSlice'

import { Route, Routes, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'

function App() {
   const dispatch = useDispatch()
   const location = useLocation()
   const { isAuthenticated, user } = useSelector((state) => state.auth)

   const [searchTerm, setSearchTerm] = useState('')
   const onSearch = (search) => {
      setSearchTerm(search)
   }

   useEffect(() => {
      dispatch(checkAuthStatusThunk())
   }, [dispatch])

   return (
      <>
         <Navbar isAuthenticated={isAuthenticated} user={user} onSearch={onSearch} />
         <Routes>
            <Route path="/" element={<Home searchTerm={searchTerm} />} />
         </Routes>
         <Footer />
      </>
   )
}

export default App
