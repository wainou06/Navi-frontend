import naviApi from './axiosApi'

export const itemsAPI = {
   // 상품 목록 조회 (페이징, 검색 기능 포함)
   getItems: async (params = {}) => {
      try {
         const response = await naviApi.get('/items', { params })
         return response.data
      } catch (error) {
         console.error('상품 목록 조회 오류:', error)
         throw error.response?.data || error
      }
   },

   // 특정 상품 조회
   getItem: async (id) => {
      try {
         const response = await naviApi.get(`/items/${id}`)
         return response.data
      } catch (error) {
         console.error('상품 조회 오류:', error)
         throw error.response?.data || error
      }
   },

   // 상품 등록 (이미지 포함)
   createItem: async (itemData) => {
      try {
         const formData = new FormData()

         // 기본 상품 정보 추가
         formData.append('name', itemData.name)
         formData.append('price', itemData.price)
         formData.append('stock', itemData.stock)
         if (itemData.content) formData.append('content', itemData.content)
         if (itemData.status) formData.append('status', itemData.status)
         if (itemData.keywords) formData.append('keywords', itemData.keywords)

         // 이미지 파일들 추가
         if (itemData.images && itemData.images.length > 0) {
            itemData.images.forEach((image) => {
               formData.append('img', image)
            })
         }

         const response = await naviApi.post('/items', formData, {
            headers: {
               'Content-Type': 'multipart/form-data',
            },
         })
         return response.data
      } catch (error) {
         console.error('상품 등록 오류:', error)
         throw error.response?.data || error
      }
   },

   // 상품 수정 (이미지 포함함)
   updateItem: async (id, itemData) => {
      try {
         const formData = new FormData()

         // 기본 상품 정보 추가
         if (itemData.name !== undefined) formData.append('name', itemData.name)
         if (itemData.price !== undefined) formData.append('price', itemData.price)
         if (itemData.stock !== undefined) formData.append('stock', itemData.stock)
         if (itemData.content !== undefined) formData.append('content', itemData.content)
         if (itemData.status !== undefined) formData.append('status', itemData.status)
         if (itemData.keywords !== undefined) formData.append('keywords', itemData.keywords)

         // 이미지 파일들 추가 (새로운 이미지가 있는 경우)
         if (itemData.images && itemData.images.length > 0) {
            itemData.images.forEach((image) => {
               formData.append('img', image)
            })
         }

         const response = await naviApi.put(`/items/${id}`, formData, {
            headers: {
               'Content-Type': 'multipart/form-data',
            },
         })
         return response.data
      } catch (error) {
         console.error('상품 수정 오류:', error)
         throw error.response?.data || error
      }
   },

   // 상품 삭제
   deleteItem: async (id) => {
      try {
         const response = await naviApi.delete(`/items/${id}`)
         return response.data
      } catch (error) {
         console.error('상품 삭제 오류:', error)
         throw error.response?.data || error
      }
   },
}
