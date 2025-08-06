import { Card, CardMedia, CardContent, Typography, Pagination, Box } from '@mui/material'
import { useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { fetchItemsThunk } from '../../features/itemSlice'
import { formatWithComma } from '../../utils/priceSet'
import { Link } from 'react-router-dom'

function RentalSellList({ searchTerm }) {
   const dispatch = useDispatch()
   const { items, pagination, loading, error } = useSelector((state) => state.items)
   const [page, setPage] = useState(1)

   useEffect(() => {
      dispatch(fetchItemsThunk({ page, limit: 10, searchTerm }))
   }, [dispatch, page, searchTerm])

   if (loading) {
      return null
   }

   if (error) {
      return (
         <Typography variant="body1" align="center" color="error">
            에러 발생: {error}
         </Typography>
      )
   }

   return (
      <div>
         {items.length > 0 ? (
            <Box
               sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                     lg: 'repeat(5, 1fr)',
                  },
                  gridAutoRows: 'auto',
                  gap: '16px',
                  justifyItems: 'center',
               }}
            >
               {items.map((item) => (
                  <Link to={`/items/detail/${item.id}`} key={item.id}>
                     <Card sx={{ width: '250px' }}>
                        {/* 대표이미지만 가져오기 */}
                        <CardMedia component="img" height="140" image={`${import.meta.env.VITE_APP_API_URL}${item.Imgs.filter((img) => img.repImgYn === 'Y')[0].imgUrl}`} alt={item.itemNm} />

                        <CardContent>
                           <Typography variant="h6" component="div">
                              {item.itemNm}
                           </Typography>
                           <Typography variant="body2" color="text.secondary">
                              {formatWithComma(String(item.price))}
                           </Typography>
                        </CardContent>
                     </Card>
                  </Link>
               ))}
            </Box>
         ) : (
            <Box sx={{ textAlign: 'center' }}>
               <Typography variant="h6">검색된 상품이 없습니다.</Typography>
            </Box>
         )}

         {pagination && (
            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
               <Pagination count={pagination.totalPages} page={page} onChange={(event, value) => setPage(value)} color="primary" />
            </Box>
         )}
      </div>
   )
}

export default RentalSellList
