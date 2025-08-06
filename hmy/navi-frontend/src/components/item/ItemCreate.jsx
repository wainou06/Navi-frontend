// pages/ItemCreate.jsx
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Container, Box, IconButton, Typography, Alert, Paper, Grid, TextField, FormControl, InputLabel, Select, MenuItem, Button, CircularProgress, Snackbar } from '@mui/material'
import { ArrowLeft, Save } from 'lucide-react'
import { createItemThunk } from '../../features/itemSlice'
import ImageUploader from './ImageUpLoader'

const ItemCreate = () => {
   const dispatch = useDispatch()
   const navigate = useNavigate()
   const { loading, error } = useSelector((state) => state.items)

   const [formData, setFormData] = useState({
      name: '',
      price: '',
      stock: '',
      content: '',
      status: 'available',
      keywords: '',
   })

   const [images, setImages] = useState([])
   const [previews, setPreviews] = useState([])
   const [snack, setSnack] = useState({ open: false, message: '' })

   const handleInputChange = (e) => {
      const { name, value } = e.target
      setFormData((prev) => ({
         ...prev,
         [name]: name === 'price' || name === 'stock' ? Number(value) : value,
      }))
   }

   const validateForm = () => {
      if (!formData.name.trim()) return '상품명을 입력해주세요.'
      if (!formData.price || formData.price <= 0) return '올바른 가격을 입력해주세요.'
      if (formData.stock < 0 || formData.stock === '') return '올바른 재고수량을 입력해주세요.'
      return ''
   }

   const handleSubmit = async (e) => {
      e.preventDefault()
      const errorMsg = validateForm()
      if (errorMsg) return setSnack({ open: true, message: errorMsg })

      const submitData = new FormData()
      submitData.append('itemNm', formData.name)
      submitData.append('price', formData.price)
      submitData.append('itemDetail', formData.content)
      submitData.append('itemSellStatus', formData.status)
      submitData.append('keywords', formData.keywords)

      images.forEach((image) => submitData.append('img', image))

      try {
         await dispatch(createItemThunk(submitData)).unwrap()
         setSnack({ open: true, message: '상품이 성공적으로 등록되었습니다.' })
         navigate('/items/list')
      } catch (err) {
         console.error(err)
         setSnack({ open: true, message: '상품 등록에 실패했습니다.' })
      }
   }

   return (
      <Container maxWidth="md" sx={{ py: 4 }}>
         <Box display="flex" alignItems="center">
            <IconButton onClick={() => navigate('/items/list')}>
               <ArrowLeft />
            </IconButton>
            <Typography variant="h4">상품 등록</Typography>
         </Box>

         {error && <Alert severity="error">{error}</Alert>}

         <Paper sx={{ mt: 3, p: 3 }}>
            <form onSubmit={handleSubmit}>
               <TextField fullWidth name="name" label="상품명" value={formData.name} onChange={handleInputChange} sx={{ mb: 2 }} />

               <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                     <TextField fullWidth label="가격" name="price" type="number" value={formData.price} onChange={handleInputChange} />
                  </Grid>
                  <Grid item xs={6}>
                     <TextField fullWidth label="재고수량" name="stock" type="number" value={formData.stock} onChange={handleInputChange} />
                  </Grid>
               </Grid>

               <ImageUploader images={images} setImages={setImages} previews={previews} setPreviews={setPreviews} />

               <TextField fullWidth name="keywords" label="키워드" value={formData.keywords} onChange={handleInputChange} sx={{ my: 2 }} helperText="예: 의류, 여성, 캐주얼" />

               <TextField fullWidth multiline rows={5} name="content" label="상세 설명" value={formData.content} onChange={handleInputChange} sx={{ mb: 2 }} />

               <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>판매상태</InputLabel>
                  <Select name="status" value={formData.status} onChange={handleInputChange} label="판매상태">
                     <MenuItem value="available">판매중</MenuItem>
                     <MenuItem value="unavailable">품절</MenuItem>
                  </Select>
               </FormControl>

               <Button type="submit" variant="contained" fullWidth startIcon={loading ? <CircularProgress size={16} /> : <Save />} disabled={loading}>
                  {loading ? '등록 중...' : '상품 등록'}
               </Button>
            </form>
         </Paper>

         <Snackbar open={snack.open} autoHideDuration={3000} message={snack.message} onClose={() => setSnack({ ...snack, open: false })} />
      </Container>
   )
}

export default ItemCreate
