import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Typography, Button, Pagination, Dialog, DialogTitle, DialogContent, DialogActions, Alert, CircularProgress } from '@mui/material'
import { Add, Edit, Delete, Visibility, ShoppingCart } from '@mui/icons-material'
import { fetchItems, deleteItem, setCurrentPage } from '../../features/itemsSlice'
import '../../styles/itemList.css'

const ItemsList = () => {
   const dispatch = useDispatch()
   const navigate = useNavigate()
   const { items, pagination, loading, error, deleteLoading } = useSelector((state) => state.items)

   const [filters, setFilters] = useState({
      keyword: '',
      searchCategory: 'name',
      status: '',
      page: 1,
      limit: 12,
   })

   const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null })
   const [activeFilter, setActiveFilter] = useState('전체')

   useEffect(() => {
      loadItems()
   }, [])

   const loadItems = (newFilters = filters) => {
      dispatch(fetchItems(newFilters))
   }

   const handleSearch = () => {
      const newFilters = { ...filters, page: 1 }
      setFilters(newFilters)
      loadItems(newFilters)
   }

   const handleReset = () => {
      const resetFilters = {
         keyword: '',
         searchCategory: 'name',
         status: '',
         page: 1,
         limit: 12,
      }
      setFilters(resetFilters)
      setActiveFilter('전체')
      loadItems(resetFilters)
   }

   const handleFilterClick = (filterType) => {
      setActiveFilter(filterType)
      let status = ''
      if (filterType === '판매중') status = 'available'
      if (filterType === '품절') status = 'unavailable'

      const newFilters = { ...filters, status, page: 1 }
      setFilters(newFilters)
      loadItems(newFilters)
   }

   const handlePageChange = (event, page) => {
      const newFilters = { ...filters, page }
      setFilters(newFilters)
      dispatch(setCurrentPage(page))
      loadItems(newFilters)
   }

   const handleDelete = async () => {
      if (deleteDialog.item) {
         try {
            await dispatch(deleteItem(deleteDialog.item.id)).unwrap()
            setDeleteDialog({ open: false, item: null })
            loadItems()
         } catch (error) {
            console.error('삭제 실패:', error)
         }
      }
   }

   const formatPrice = (price) => {
      return new Intl.NumberFormat('ko-KR').format(price)
   }

   const getStatusText = (status) => {
      return status === 'available' ? '판매중' : '품절'
   }

   const getStatusClass = (status) => {
      return status === 'available' ? 'status-available' : 'status-sold'
   }

   return (
      <div className="items-list-container">
         <div className="main-container">
            <div className="register-button-section">
               <Button className="register-btn" startIcon={<Add />} onClick={() => navigate('/')}>
                  물건 렌탈하러 가기 &gt;
               </Button>
            </div>

            {/* 구분선 */}
            <hr className="section-divider" />
            <div className="section-title">Share & Release</div>

            {/* 필터 버튼들 */}
            <div className="filter-section">
               {['필터', '가격순', '날짜순'].map((filter) => (
                  <Button key={filter} className={`filter-btn ${activeFilter === filter ? 'active' : ''}`} onClick={() => handleFilterClick(filter)}>
                     {filter}
                  </Button>
               ))}
               <div className="search-actions">
                  <Button className="search-btn" startIcon={<Add />} onClick={() => navigate('/items/create')}>
                     상품등록
                  </Button>
               </div>
            </div>

            {/* 에러 메시지 */}
            {error && (
               <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
               </Alert>
            )}

            {/* 로딩 */}
            {loading && items.length === 0 ? (
               <div className="loading-state">
                  <CircularProgress />
               </div>
            ) : items.length === 0 ? (
               <div className="empty-state">
                  <ShoppingCart className="empty-state-icon" />
                  <Typography className="empty-state-title">등록된 상품이 없습니다</Typography>
                  <Typography className="empty-state-subtitle">첫 번째 상품을 등록해보세요!</Typography>
                  <Button className="register-btn" startIcon={<Add />} onClick={() => navigate('/items/create')}>
                     상품 등록하기
                  </Button>
               </div>
            ) : (
               <>
                  {/* 상품 그리드 */}
                  <div className="products-grid">
                     {items.map((item) => (
                        <div key={item.id} className="product-card">
                           {/* 상태 라벨 */}
                           <div className={`product-status-label ${getStatusClass(item.status)}`}>{getStatusText(item.status)}</div>

                           {/* 액션 버튼들 */}
                           <div className="product-actions">
                              <button className="action-btn view" onClick={() => navigate(`/items/detail/${item.id}`)} title="상세보기">
                                 <Visibility style={{ fontSize: 14 }} />
                              </button>
                              <button className="action-btn edit" onClick={() => navigate(`/items/edit/${item.id}`)} title="수정">
                                 <Edit style={{ fontSize: 14 }} />
                              </button>
                              <button className="action-btn delete" onClick={() => setDeleteDialog({ open: true, item })} title="삭제">
                                 <Delete style={{ fontSize: 14 }} />
                              </button>
                           </div>

                           {/* 상품 이미지 */}
                           <div className="product-image">{item.images && item.images.length > 0 ? <img src={`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/uploads${item.images[0].url}`} alt={item.name} /> : <div className="placeholder-image">이미지</div>}</div>

                           {/* 상품 정보 */}
                           <div className="product-info">
                              <div className="product-title">{item.name}</div>
                              <div className="product-price">{formatPrice(item.price)}원</div>
                              <div className="product-meta">
                                 재고 {item.stock}개 · 키워드 {item.keywords?.length || 0}개
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>

                  {/* 페이지네이션 */}
                  {pagination.totalPages > 1 && (
                     <div className="pagination-section">
                        <Pagination count={pagination.totalPages} page={pagination.currentPage} onChange={handlePageChange} color="primary" size="large" />
                     </div>
                  )}
               </>
            )}

            {/* 구분선 */}
            <hr className="section-divider" />
            <div className="section-title">Share & Release</div>
         </div>

         {/* 삭제 확인 다이얼로그 */}
         <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, item: null })}>
            <DialogTitle>상품 삭제</DialogTitle>
            <DialogContent>
               <Typography>
                  '{deleteDialog.item?.name}' 상품을 정말 삭제하시겠습니까?
                  <br />이 작업은 되돌릴 수 없습니다.
               </Typography>
            </DialogContent>
            <DialogActions>
               <Button onClick={() => setDeleteDialog({ open: false, item: null })} disabled={deleteLoading}>
                  취소
               </Button>
               <Button onClick={handleDelete} color="error" variant="contained" disabled={deleteLoading} startIcon={deleteLoading && <CircularProgress size={16} />}>
                  삭제
               </Button>
            </DialogActions>
         </Dialog>
      </div>
   )
}

export default ItemsList
