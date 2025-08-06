import SearchIcon from '@mui/icons-material/Search'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Menu from '@mui/material/Menu'
import Avatar from '@mui/material/Avatar'
import Tooltip from '@mui/material/Tooltip'
import MenuItem from '@mui/material/MenuItem'

import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { logoutUserThunk } from '../../features/authSlice'

function Navbar({ isAuthenticated, user, onSearch }) {
   const dispatch = useDispatch()
   const navigate = useNavigate()
   const [anchorElUser, setAnchorElUser] = useState(null)

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

   const handleOpenUserMenu = (event) => {
      setAnchorElUser(event.currentTarget)
   }

   const handleCloseUserMenu = () => {
      setAnchorElUser(null)
   }

   const [searchTerm, setSearchTerm] = useState('') // 검색어

   const handleInputChange = (e) => {
      setSearchTerm(e.target.value)
   }

   // 검색 버튼 눌렀을때
   const handleSearch = (e) => {
      e.preventDefault()

      if (onSearch && searchTerm.trim()) {
         onSearch(searchTerm.trim())
      }
   }

   return (
      <header>
         <div className="shadow">
            <nav>
               <Link to="/" className="logo">
                  <img src="/images/logo.png" alt="로고" height="69" />
               </Link>
               <form className="search" onSubmit={handleSearch}>
                  <input type="text" placeholder="어떤 물건을 찾고 계신가요? 검색해주세요." value={searchTerm} onChange={handleInputChange} />
                  <button type="submit">
                     <SearchIcon style={{ fontSize: '30px' }} />
                  </button>
               </form>
               <ul className="nav_menu">
                  <li>
                     <img src="/images/고객센터.png" alt="고객센터" height="50" />
                     <span>고객센터</span>
                  </li>
                  <li>
                     {isAuthenticated ? (
                        <Link to="/items/create">
                           <img src="/images/글쓰기.png" alt="상품등록" height="50" />
                           <span>상품등록</span>
                        </Link>
                     ) : (
                        <Link to="/signup">
                           <img src="/images/회원가입.png" alt="회원가입하세요" height="50" />
                           <span>회원가입</span>
                        </Link>
                     )}
                  </li>
                  <li>
                     {isAuthenticated ? (
                        <Box sx={{ flexGrow: 0 }}>
                           <Tooltip title="Open settings">
                              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                 <Avatar alt={user?.name} src="/images/로그인상태.png" />
                                 <Typography variant="span" style={{ marginRight: '20px', color: '#000', fontSize: 14 }}>
                                    {user?.name} 님
                                 </Typography>
                              </IconButton>
                           </Tooltip>
                           <Menu
                              sx={{ mt: '45px' }}
                              id="menu-appbar"
                              anchorEl={anchorElUser}
                              anchorOrigin={{
                                 vertical: 'top',
                                 horizontal: 'right',
                              }}
                              keepMounted
                              transformOrigin={{
                                 vertical: 'top',
                                 horizontal: 'right',
                              }}
                              open={Boolean(anchorElUser)}
                              onClose={handleCloseUserMenu}
                           >
                              <MenuItem>
                                 <Link to="/my">
                                    <Typography sx={{ textAlign: 'center' }}>나의 정보</Typography>
                                 </Link>
                              </MenuItem>
                              <MenuItem>
                                 <Link to="/my/items">
                                    <Typography sx={{ textAlign: 'center' }}>나의 상품</Typography>
                                 </Link>
                              </MenuItem>
                              <MenuItem>
                                 <Typography sx={{ textAlign: 'center' }}>렌탈 내역</Typography>
                              </MenuItem>
                              <MenuItem>
                                 <Typography sx={{ textAlign: 'center' }}>거래 내역</Typography>
                              </MenuItem>
                              <MenuItem>
                                 <Typography sx={{ textAlign: 'center' }}>1:1 채팅</Typography>
                              </MenuItem>
                              <MenuItem onClick={handleLogout}>
                                 <Typography sx={{ textAlign: 'center' }}>로그아웃</Typography>
                              </MenuItem>
                           </Menu>
                        </Box>
                     ) : (
                        <Link to="/login">
                           <img src="/images/로그아웃상태.png" alt="로그인하세요" height="50" />
                           <span>로그인</span>
                        </Link>
                     )}
                  </li>
               </ul>
            </nav>
         </div>
      </header>
   )
}

export default Navbar
