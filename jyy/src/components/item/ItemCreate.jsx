import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CloudUpload, Trash2, Save, X } from 'lucide-react'
import { createItem } from '../../features/itemsSlice.js'
import { Container, Box, IconButton, Typography, Alert, Paper, Grid, TextField, FormControl, InputLabel, Select, MenuItem, Button, ImageList, ImageListItem, ImageListItemBar, CircularProgress } from '@mui/material'
import { Delete, Cancel } from '@mui/icons-material'
import '../../styles/ItemCreate.css'

const ItemCreate = () => {
   const dispatch = useDispatch()
   const navigate = useNavigate()
   const { createLoading, error } = useSelector((state) => state.items)

   const [formData, setFormData] = useState({
      name: '',
      price: '',
      stock: '',
      content: '',
      status: 'available',
      keywords: '',
      images: [],
   })

   const [imagePreviews, setImagePreviews] = useState([])
   const [formErrors, setFormErrors] = useState({})

   const handleInputChange = (e) => {
      const { name, value } = e.target
      setFormData((prev) => ({
         ...prev,
         [name]: value,
      }))

      // 에러 제거
      if (formErrors[name]) {
         setFormErrors((prev) => ({
            ...prev,
            [name]: '',
         }))
      }
   }

   const handleImageUpload = (e) => {
      const files = Array.from(e.target.files)
      const validFiles = files.filter((file) => {
         return file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024 // 5MB 제한
      })

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

   const handleImageRemove = (index) => {
      const newImages = formData.images.filter((_, i) => i !== index)
      const newPreviews = imagePreviews.filter((_, i) => i !== index)

      // URL 해제
      URL.revokeObjectURL(imagePreviews[index])

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

      if (formData.stock === '' || formData.stock < 0) {
         errors.stock = '올바른 재고수량을 입력해주세요.'
      }

      setFormErrors(errors)
      return Object.keys(errors).length === 0
   }

   const handleSubmit = async (e) => {
      e.preventDefault()

      if (!validateForm()) {
         return
      }

      try {
         await dispatch(createItem(formData)).unwrap()
         alert('상품이 성공적으로 등록되었습니다.')
         navigate && navigate('/items/list')
      } catch (error) {
         console.error('상품 등록 실패:', error)
      }
   }

   const handleReset = () => {
      setFormData({
         name: '',
         price: '',
         stock: '',
         content: '',
         status: 'available',
         keywords: '',
         images: [],
      })
      imagePreviews.forEach((url) => URL.revokeObjectURL(url))
      setImagePreviews([])
      setFormErrors({})
   }

   return (
      <div className="item-create-container">
         <Container maxWidth="md" sx={{ py: 4 }}>
            {/* 헤더 */}
            <Box display="flex" alignItems="center" className="item-create-header">
               <IconButton onClick={() => navigate('/items/list')}>
                  <ArrowLeft />
               </IconButton>
               <Typography variant="h4" component="h1" className="item-create-title">
                  상품 등록
               </Typography>
            </Box>

            {/* 에러 메시지 */}
            {error && (
               <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
               </Alert>
            )}

            <Paper className="item-create-paper">
               <form onSubmit={handleSubmit}>
                  {/* 제목 섹션 */}
                  <div className="form-section-card">
                     <div className="section-header">제목</div>
                     <div className="section-description">제목으로 상품명을 작성해주세요.</div>
                     <div className="section-content">
                        <TextField fullWidth name="name" value={formData.name} onChange={handleInputChange} error={!!formErrors.name} helperText={formErrors.name} placeholder="상품명을 입력하세요" variant="outlined" />
                     </div>
                  </div>

                  {/* 가격 섹션 */}
                  <div className="form-section-card">
                     <div className="section-header">가격</div>
                     <div className="section-description">상품 가격을 입력해주세요.</div>
                     <div className="section-content">
                        <Grid container spacing={2}>
                           <Grid item xs={12} sm={6}>
                              <TextField
                                 fullWidth
                                 label="가격"
                                 name="price"
                                 type="number"
                                 value={formData.price}
                                 onChange={handleInputChange}
                                 error={!!formErrors.price}
                                 helperText={formErrors.price}
                                 InputProps={{
                                    endAdornment: '원',
                                 }}
                              />
                           </Grid>
                           <Grid item xs={12} sm={6}>
                              <TextField
                                 fullWidth
                                 label="재고수량"
                                 name="stock"
                                 type="number"
                                 value={formData.stock}
                                 onChange={handleInputChange}
                                 error={!!formErrors.stock}
                                 helperText={formErrors.stock}
                                 InputProps={{
                                    endAdornment: '개',
                                 }}
                              />
                           </Grid>
                        </Grid>
                     </div>
                  </div>

                  {/* 이미지 업로드 섹션 */}
                  <div className="image-upload-container">
                     <div className="image-upload-header">
                        <div>
                           <div className="image-upload-title">이미지 업로드</div>
                           <div className="image-upload-subtitle">(최대 5개까지 가능, 첫 이미지가 대표 이미지가 됩니다.)</div>
                        </div>
                     </div>

                     {/* 이미지 그리드 */}
                     <div className="image-grid-container">
                        {[0, 1, 2, 3, 4].map((index) => (
                           <div key={index} className="image-preview-item">
                              {imagePreviews[index] ? (
                                 <>
                                    <img src={imagePreviews[index]} alt={`preview-${index}`} />
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
                                       onClick={() => handleImageRemove(index)}
                                    >
                                       <X size={16} />
                                    </IconButton>
                                 </>
                              ) : (
                                 <label className="image-placeholder">
                                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} multiple={index === 0} />
                                    <CloudUpload />
                                    <div className="image-placeholder-text">이미지</div>
                                 </label>
                              )}
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* 키워드 섹션 */}
                  <div className="form-section-card">
                     <div className="section-header">키워드 선택 ▼</div>
                     <div className="section-content">
                        <TextField fullWidth name="keywords" value={formData.keywords} onChange={handleInputChange} placeholder="키워드를 쉼표로 구분해서 입력하세요" helperText="예: 의류, 여성, 캐주얼" />
                     </div>
                  </div>

                  {/* 상세설명 섹션 */}
                  <div className="description-section">
                     <Typography className="description-title">상세 설명을 작성해주세요.</Typography>
                     <TextField fullWidth name="content" value={formData.content} onChange={handleInputChange} multiline rows={6} placeholder="상품에 대한 상세한 설명을 입력하세요" variant="outlined" />
                     <div className="description-divider"></div>
                  </div>

                  {/* 판매상태 섹션 */}
                  <div className="form-section-card">
                     <div className="section-content">
                        <FormControl fullWidth>
                           <InputLabel>판매상태</InputLabel>
                           <Select name="status" value={formData.status} label="판매상태" onChange={handleInputChange}>
                              <MenuItem value="available">판매중</MenuItem>
                              <MenuItem value="unavailable">품절</MenuItem>
                           </Select>
                        </FormControl>
                     </div>
                  </div>

                  {/* 버튼 섹션 */}
                  <div className="button-section">
                     <Box display="flex" gap={2}>
                        <Button type="submit" variant="contained" startIcon={createLoading ? <CircularProgress size={16} /> : <Save />} disabled={createLoading} sx={{ flex: 2 }}>
                           {createLoading ? '등록 중...' : '상품등록'}
                        </Button>
                     </Box>
                  </div>
               </form>
            </Paper>
         </Container>
      </div>
   )
}

export default ItemCreate
