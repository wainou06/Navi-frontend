
import { checkAuthStatusThunk } from './features/authSlice'

import { Route, Routes, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'

import './styles/common.css'
import './styles/itemCreate.css'
import './styles/itemList.css'

import Home from './pages/Home'
import Navbar from './components/shared/Navbar'
import Footer from './components/shared/Footer'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import SearchPwPage from './pages/SearchPwPage'
import ItemCreatePage from './pages/ItemCreatePage'
import ItemListPage from './pages/ItemListPage'

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
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/searchPw" element={<SearchPwPage />} />

            <Route path="/items/list" element={<ItemListPage key={location.key} />} />
            <Route path="/items/create" element={<ItemCreatePage />} />
         </Routes>
         <Footer />
      </>
   )
}

export default App
