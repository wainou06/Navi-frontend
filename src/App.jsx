import './styles/common.css'
import Home from './pages/Home'

import { Route, Routes } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

function App() {
   return (
      <>
         <Routes>
            <Route path="/" element={<Home />} />
         </Routes>
      </>
   )
}

export default App
