import naviApi from './axiosApi'

export const rentalItemsAPI = {
   // 렌탈상품 목록 조회 (페이징, 검색 기능 포함)
   getRentalItems: async (params = {}) => {
      try {
         const response = await naviApi.get('/rental-items', { params })
         return response.data
      } catch (error) {
         console.error('렌탈상품 목록 조회 오류:', error)
         throw error.response?.data || error
      }
   },

   // 특정 렌탈상품 조회
   getRentalItem: async (id) => {
      try {
         const response = await naviApi.get(`/rental-items/${id}`)
         return response.data
      } catch (error) {
         console.error('렌탈상품 조회 오류:', error)
         throw error.response?.data || error
      }
   },

   // 렌탈상품 등록 (이미지 포함)
   createRentalItem: async (rentalItemData) => {
      try {
         const formData = new FormData()

         // 기본 렌탈상품 정보 추가
         formData.append('name', rentalItemData.name)
         formData.append('price', rentalItemData.price)
         formData.append('stock', rentalItemData.stock)
         if (rentalItemData.content) formData.append('content', rentalItemData.content)
         if (rentalItemData.status) formData.append('status', rentalItemData.status)
         if (rentalItemData.rentalPeriodMin) formData.append('rentalPeriodMin', rentalItemData.rentalPeriodMin)
         if (rentalItemData.rentalPeriodMax) formData.append('rentalPeriodMax', rentalItemData.rentalPeriodMax)
         if (rentalItemData.keywords) formData.append('keywords', rentalItemData.keywords)

         // 이미지 파일들 추가
         if (rentalItemData.images && rentalItemData.images.length > 0) {
            rentalItemData.images.forEach((image) => {
               formData.append('img', image)
            })
         }

         const response = await naviApi.post('/rental-items', formData, {
            headers: {
               'Content-Type': 'multipart/form-data',
            },
         })
         return response.data
      } catch (error) {
         console.error('렌탈상품 등록 오류:', error)
         throw error.response?.data || error
      }
   },

   // 렌탈상품 수정 (이미지 포함)
   updateRentalItem: async (id, rentalItemData) => {
      try {
         const formData = new FormData()

         // 기본 렌탈상품 정보 추가
         if (rentalItemData.name !== undefined) formData.append('name', rentalItemData.name)
         if (rentalItemData.price !== undefined) formData.append('price', rentalItemData.price)
         if (rentalItemData.stock !== undefined) formData.append('stock', rentalItemData.stock)
         if (rentalItemData.content !== undefined) formData.append('content', rentalItemData.content)
         if (rentalItemData.status !== undefined) formData.append('status', rentalItemData.status)
         if (rentalItemData.rentalPeriodMin !== undefined) formData.append('rentalPeriodMin', rentalItemData.rentalPeriodMin)
         if (rentalItemData.rentalPeriodMax !== undefined) formData.append('rentalPeriodMax', rentalItemData.rentalPeriodMax)
         if (rentalItemData.keywords !== undefined) formData.append('keywords', rentalItemData.keywords)

         // 이미지 파일들 추가 (새로운 이미지가 있는 경우)
         if (rentalItemData.images && rentalItemData.images.length > 0) {
            rentalItemData.images.forEach((image) => {
               formData.append('img', image)
            })
         }

         const response = await naviApi.put(`/rental-items/${id}`, formData, {
            headers: {
               'Content-Type': 'multipart/form-data',
            },
         })
         return response.data
      } catch (error) {
         console.error('렌탈상품 수정 오류:', error)
         throw error.response?.data || error
      }
   },

   // 렌탈상품 삭제
   deleteRentalItem: async (id) => {
      try {
         const response = await naviApi.delete(`/rental-items/${id}`)
         return response.data
      } catch (error) {
         console.error('렌탈상품 삭제 오류:', error)
         throw error.response?.data || error
      }
   },
}
