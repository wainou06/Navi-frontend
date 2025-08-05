import './styles/common.css'
import Home from './pages/Home'
import Navbar from './components/shared/Navbar'
import Footer from './components/shared/Footer'

import { Route, Routes } from 'react-router-dom'

function App() {
   return (
      <>
         <Navbar />
         <Routes>
            <Route path="/" element={<Home />} />
         </Routes>
         <Footer />
      </>
   )
}

export default App
