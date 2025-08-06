import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, X } from 'lucide-react'
import { fetchItem, updateItem } from '../../features/itemsSlice'
import { Container, Box, IconButton, Alert, Paper, Grid, TextField, FormControl, InputLabel, Select, MenuItem, Button, CircularProgress } from '@mui/material'
import '../../styles/ItemCreate.css'

const ItemEdit = () => {
   const dispatch = useDispatch()
   const navigate = useNavigate()
   const { id } = useParams()
   const { currentItem, loading, error } = useSelector((state) => state.items)

   const [formData, setFormData] = useState({
      name: '',
      price: '',
      content: '',
      status: 'available',
      keywords: [],
      images: [],
   })

   const [imagePreviews, setImagePreviews] = useState([])
   const [formErrors, setFormErrors] = useState({})
   const [deleteImages, setDeleteImages] = useState([])

   useEffect(() => {
      if (id) {
         dispatch(fetchItem(id))
      }
   }, [dispatch, id])

   useEffect(() => {
      if (currentItem) {
         setFormData({
            name: currentItem.itemNm,
            price: currentItem.price,
            content: currentItem.itemDetail,
            status: currentItem.itemSellStatus?.toLowerCase(),
            keywords: currentItem.keywords || [],
            images: currentItem.imgs || [],
         })

         const previews = currentItem.imgs?.map((img) => `${import.meta.env.VITE_APP_API_URL.replace(/\/$/, '')}/${img.imgUrl.replace(/\\/g, '/')}`)
         setImagePreviews(previews || [])
      }
   }, [currentItem])

   const handleInputChange = (e) => {
      const { name, value } = e.target
      setFormData((prev) => ({
         ...prev,
         [name]: value,
      }))

      if (formErrors[name]) {
         setFormErrors((prev) => ({
            ...prev,
            [name]: '',
         }))
      }
   }

   const handleImageUpload = (e) => {
      const files = Array.from(e.target.files)
      const validFiles = files.filter((file) => file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024)

      if (formData.images.length + validFiles.length > 5) {
         alert('최대 5개의 이미지만 업로드할 수 있습니다.')
         return
      }

      const newImages = [...formData.images, ...validFiles]
      const newPreviews = [...imagePreviews]

      validFiles.forEach((file) => {
         newPreviews.push(URL.createObjectURL(file))
      })

      setFormData((prev) => ({
         ...prev,
         images: newImages,
      }))
      setImagePreviews(newPreviews)
   }

   const handleImageRemove = (index, imageId) => {
      // 기존 이미지일 경우 ID 추가
      if (imageId) {
         setDeleteImages((prev) => [...prev, imageId])
      }

      const newImages = formData.images.filter((_, i) => i !== index)
      const newPreviews = imagePreviews.filter((_, i) => i !== index)

      setFormData((prev) => ({
         ...prev,
         images: newImages,
      }))
      setImagePreviews(newPreviews)
   }

   const validateForm = () => {
      const errors = {}

      if (!formData.name.trim()) {
         errors.name = '상품명을 입력해주세요.'
      }

      if (!formData.price || formData.price <= 0) {
         errors.price = '올바른 가격을 입력해주세요.'
      }

      setFormErrors(errors)
      return Object.keys(errors).length === 0
   }

   const handleSubmit = async (e) => {
      e.preventDefault()

      if (!validateForm()) return

      try {
         await dispatch(updateItem({ id, itemData: { ...formData, deleteImages } })).unwrap()
         alert('상품이 성공적으로 수정되었습니다.')
         navigate(`/items/detail/${id}`)
      } catch (error) {
         console.error('상품 수정 실패:', error)
      }
   }

   return (
      <div className="item-create-container">
         <Container maxWidth="md" sx={{ py: 4 }}>
            {/* 헤더 */}
            <Box display="flex" alignItems="center" className="item-create-header">
               <IconButton onClick={() => navigate('/items/list')}>
                  <ArrowLeft />
               </IconButton>
            </Box>

            {/* 에러 메시지 */}
            {error && (
               <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
               </Alert>
            )}

            <Paper className="item-create-paper">
               <form onSubmit={handleSubmit}>
                  {/* 제목 */}
                  <div className="form-section-card">
                     <div className="section-header">제목</div>
                     <div className="section-content">
                        <TextField fullWidth name="name" value={formData.name} onChange={handleInputChange} error={!!formErrors.name} helperText={formErrors.name} placeholder="상품명을 입력하세요" variant="outlined" />
                     </div>
                  </div>

                  {/* 가격 */}
                  <div className="form-section-card">
                     <div className="section-header">가격</div>
                     <div className="section-content">
                        <Grid container spacing={2}>
                           <Grid item xs={12} sm={6}>
                              <TextField fullWidth label="가격" name="price" type="number" value={formData.price} onChange={handleInputChange} error={!!formErrors.price} helperText={formErrors.price} InputProps={{ endAdornment: '원' }} />
                           </Grid>
                        </Grid>
                     </div>
                  </div>

                  {/* 이미지 업로드 */}
                  <div className="form-section-card">
                     <div className="section-header">이미지</div>
                     <div className="section-content">
                        <div className="image-grid-container">
                           {imagePreviews.map((preview, index) => (
                              <div key={index} className="image-preview-item">
                                 <img src={preview} alt={`preview-${index}`} />
                                 <IconButton
                                    sx={{
                                       position: 'absolute',
                                       top: 4,
                                       right: 4,
                                       background: 'rgba(244, 67, 54, 0.8)',
                                       color: 'white',
                                       '&:hover': { background: 'rgba(244, 67, 54, 1)' },
                                    }}
                                    size="small"
                                    onClick={() => handleImageRemove(index, currentItem.imgs?.[index]?.id)}
                                 >
                                    <X size={16} />
                                 </IconButton>
                              </div>
                           ))}
                        </div>

                        {formData.images.length < 5 && (
                           <Button variant="outlined" component="label" sx={{ mt: 2 }}>
                              이미지 추가
                              <input type="file" accept="image/*" hidden multiple onChange={handleImageUpload} />
                           </Button>
                        )}
                     </div>
                  </div>

                  {/* 상세 설명 */}
                  <div className="form-section-card">
                     <div className="section-header">상세 설명</div>
                     <div className="section-content">
                        <TextField fullWidth name="content" value={formData.content} onChange={handleInputChange} multiline rows={6} placeholder="상세 설명을 작성해주세요." variant="outlined" />
                     </div>
                  </div>

                  {/* 상태 */}
                  <div className="form-section-card">
                     <div className="section-header">판매 상태</div>
                     <div className="section-content">
                        <FormControl fullWidth>
                           <InputLabel>판매상태</InputLabel>
                           <Select name="status" value={formData.status} label="판매상태" onChange={handleInputChange}>
                              <MenuItem value="available">판매중</MenuItem>
                              <MenuItem value="reserved">예약중</MenuItem>
                              <MenuItem value="unavailable">판매완료</MenuItem>
                           </Select>
                        </FormControl>
                     </div>
                  </div>

                  {/* 제출 버튼 */}
                  <div className="button-section">
                     <Box display="flex" gap={2}>
                        <Button type="submit" variant="contained" startIcon={loading ? <CircularProgress size={16} /> : <Save />} disabled={loading}>
                           {loading ? '수정 중...' : '상품 수정'}
                        </Button>
                     </Box>
                  </div>
               </form>
            </Paper>
         </Container>
      </div>
   )
}

export default ItemEdit
