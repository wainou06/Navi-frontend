import { Container } from '@mui/material'
import ItemDetail from '../components/item/ItemDetail'
import { useDispatch } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchItem, deleteItem, updateItem } from '../features/itemsSlice'
import { useEffect } from 'react'

function ItemDetailPage() {
   const dispatch = useDispatch()
   const navigate = useNavigate()
   const { id } = useParams()

   useEffect(() => {
      if (id) {
         dispatch(fetchItem(id))
      }
   }, [id, dispatch])

   // 상품 삭제
   const onDeleteSubmit = () => {
      if (window.confirm('정말로 삭제하시겠습니까?')) {
         dispatch(deleteItem(id))
            .unwrap()
            .then(() => {
               navigate('/items/list') // 삭제 후 상품 리스트 페이지로 이동
            })
            .catch((error) => {
               console.error('상품 삭제 에러: ', error)
               alert('상품 삭제에 실패했습니다.' + error)
            })
      }
   }

   // 상품 수정 페이지로 이동
   const onEditSubmit = () => {
      navigate(`/items/edit/${id}`)
   }

   // 가격 제안
   const onPriceProposal = (proposalData) => {
      // 가격 제안 API 호출 로직 (구현 필요)
      console.log('가격 제안:', proposalData)
      alert('가격 제안이 전송되었습니다.')
   }

   return (
      <Container maxWidth="lg" sx={{ marginTop: 4, marginBottom: 10 }}>
         <ItemDetail onDeleteSubmit={onDeleteSubmit} onEditSubmit={onEditSubmit} onPriceProposal={onPriceProposal} />
      </Container>
   )
}

export default ItemDetailPage
