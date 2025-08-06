import { Container } from '@mui/material'
import ItemEdit from '../components/item/ItemEdit'
import { useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { updateItem } from '../features/itemsSlice'

function ItemEditPage() {
   const dispatch = useDispatch()
   const navigate = useNavigate()
   const { id } = useParams()

   // 상품수정
   const onUpdateSubmit = (itemData) => {
      const updateData = {
         id: id,
         itemData: itemData,
      }

      dispatch(updateItem(updateData))
         .unwrap()
         .then(() => {
            navigate('/items/list') // 수정 후 상품 리스트 페이지로 이동
         })
         .catch((error) => {
            console.error('상품 수정 에러: ', error)
            alert('상품 수정에 실패했습니다. ' + error)
         })
   }

   return (
      <Container maxWidth="md" sx={{ marginTop: 10, marginBottom: 13 }}>
         <h1>상품 수정</h1>
         <ItemEdit onUpdateSubmit={onUpdateSubmit} />
      </Container>
   )
}

export default ItemEditPage
