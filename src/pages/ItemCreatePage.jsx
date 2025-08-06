import { Container } from '@mui/material'
import ItemCreate from '../components/item/ItemCreate'

import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { createItem } from '../features/itemsSlice'

function ItemCreatePage() {
   const dispatch = useDispatch()
   const navigate = useNavigate()

   // 상품등록
   const onCreateSubmit = (itemData) => {
      dispatch(createItem(itemData))
         .unwrap()
         .then(() => {
            navigate('/items/list') // 등록 후 상품등록 리스트 페이지로 이동
         })
         .catch((error) => {
            console.error('상품 등록 에러: ', error)
            alert('상품 등록에 실패 했습니다.' + error)
         })
   }

   return (
      <Container maxWidth="md" sx={{ marginTop: 10, marginBottom: 13 }}>
         <ItemCreate onCreateSubmit={onCreateSubmit} />
      </Container>
   )
}

export default ItemCreatePage
