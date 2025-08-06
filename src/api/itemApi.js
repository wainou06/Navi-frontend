import naviApi from './axiosApi'

// 상품 등록
export const createItem = async (itemData) => {
   try {
      const formData = new FormData()

      // 상품 데이터 추가
      formData.append('name', itemData.name)
      formData.append('price', itemData.price)
      formData.append('stock', itemData.stock)
      if (itemData.content) formData.append('content', itemData.content)
      if (itemData.status) formData.append('status', itemData.status)
      if (itemData.keywords) formData.append('keywords', itemData.keywords)

      // 이미지 추가
      if (itemData.images && itemData.images.length > 0) {
         itemData.images.forEach((image) => {
            formData.append('img', image)
         })
      }

      const config = {
         headers: {
            'Content-Type': 'multipart/form-data',
         },
      }

      const response = await naviApi.post('/items', formData, config)
      return response.data
   } catch (error) {
      console.error('상품 등록 오류:', error)
      throw error.response?.data || error
   }
}

// 상품 목록 조회 (검색, 페이징 기능)
export const getItems = async (params = {}) => {
   try {
      console.log('🌐 getItems API 호출:', params)
      const { page = 1, limit = 12, searchTerm = '', searchCategory = '', sellCategory = '' } = params
      const response = await naviApi.get(`/items/list`, {
         params: {
            page,
            limit,
            searchTerm,
            searchCategory,
            sellCategory,
         },
      })
      console.log('🌐 getItems API 응답:', response.data)
      return response.data
   } catch (error) {
      console.error('상품 목록 조회 오류:', error.response ? error.response.data : error.message)
      throw error.response?.data || error
   }
}

// 특정 상품 조회
export const getItemById = async (id) => {
   try {
      const response = await naviApi.get(`/items/detail/${id}`)
      return response.data
   } catch (error) {
      console.error('상품 조회 오류:', error)
      throw error.response?.data || error
   }
}

// 상품 수정 (이미지 포함)
export const updateItem = async (id, itemData) => {
   try {
      const formData = new FormData()

      // 수정된 상품 정보 추가
      if (itemData.name !== undefined) formData.append('name', itemData.name)
      if (itemData.price !== undefined) formData.append('price', itemData.price)
      if (itemData.stock !== undefined) formData.append('stock', itemData.stock)
      if (itemData.content !== undefined) formData.append('content', itemData.content)
      if (itemData.status !== undefined) formData.append('status', itemData.status)
      if (itemData.keywords !== undefined) formData.append('keywords', itemData.keywords)

      // 새로운 이미지가 있는 경우 추가
      if (itemData.images && itemData.images.length > 0) {
         itemData.images.forEach((image) => {
            formData.append('img', image)
         })
      }

      const config = {
         headers: {
            'Content-Type': 'multipart/form-data',
         },
      }

      const response = await naviApi.put(`/items/edit/${id}`, formData, config)
      return response.data
   } catch (error) {
      console.error('상품 수정 오류:', error)
      throw error.response?.data || error
   }
}

// 상품 삭제
export const deleteItem = async (id) => {
   try {
      const response = await naviApi.delete(`/items/${id}`)
      return response.data
   } catch (error) {
      console.error('상품 삭제 오류:', error)
      throw error.response?.data || error
   }
}

// Redux slice에서 사용할 수 있도록 itemsAPI 객체로 래핑
export const itemsAPI = {
   // 상품 목록 조회 (페이징, 검색 기능 포함)
   getItems: async (params = {}) => {
      try {
         const response = await getItems(params)
         return response.data
      } catch (error) {
         console.error('상품 목록 조회 오류:', error)
         throw error.response?.data || error
      }
   },

   // 특정 상품 조회
   getItem: async (id) => {
      try {
         const response = await getItemById(id)
         return response.data
      } catch (error) {
         console.error('상품 조회 오류:', error)
         throw error.response?.data || error
      }
   },

   // 상품 등록 (이미지 포함)
   createItem: async (itemData) => {
      try {
         const response = await createItem(itemData)
         return response
      } catch (error) {
         console.error('상품 등록 오류:', error)
         throw error.response?.data || error
      }
   },

   // 상품 수정 (이미지 포함)
   updateItem: async (id, itemData) => {
      try {
         const response = await updateItem(id, itemData)
         return response
      } catch (error) {
         console.error('상품 수정 오류:', error)
         throw error.response?.data || error
      }
   },

   // 상품 삭제
   deleteItem: async (id) => {
      try {
         const response = await deleteItem(id)
         return response
      } catch (error) {
         console.error('상품 삭제 오류:', error)
         throw error.response?.data || error
      }
   },
}
