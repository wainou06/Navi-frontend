import naviApi from './axiosApi'

// 전체 상품 리스트 가져오기
export const getItems = async (data) => {
   try {
      const { page, limit, searchTerm = '', searchCategory = '', sellCategory = '' } = data

      const response = await naviApi.get(`/items?page=${page}&limit=${limit}&searchTerm=${searchTerm}&searchCategory=${searchCategory}&sellCategory=${sellCategory}`)

      const { items, pagination } = response.data
      return { items, pagination }
   } catch (error) {
      console.error(`API Request 오류: ${error}`)
      throw error.response?.data || error
   }
}

// 상품 등록
export const createItem = async (itemData) => {
   try {
      const formData = new FormData()
      formData.append('itemNm', itemData.itemNm)
      formData.append('price', itemData.price)
      if (itemData.itemDetail) formData.append('itemDetail', itemData.itemDetail)
      if (itemData.itemSellStatus) formData.append('itemSellStatus', itemData.itemSellStatus)
      if (itemData.keywords) formData.append('keywords', itemData.keywords)

      if (itemData.images && itemData.images.length > 0) {
         itemData.images.forEach((image) => {
            formData.append('img', image)
         })
      }

      const config = { headers: { 'Content-Type': 'multipart/form-data' } }
      const response = await naviApi.post('/items', formData, config)

      return response.data.data // createdItem
   } catch (error) {
      console.error('상품 등록 오류:', error)
      throw error.response?.data || error
   }
}

// 단일 상품 조회
export const getItemById = async (id) => {
   try {
      const response = await naviApi.get(`/items/${id}`)
      return response.data.item
   } catch (error) {
      console.error('상품 조회 오류:', error)
      throw error.response?.data || error
   }
}

// 상품 수정
export const updateItem = async (id, itemData) => {
   try {
      const formData = new FormData()
      if (itemData.itemNm !== undefined) formData.append('itemNm', itemData.itemNm)
      if (itemData.price !== undefined) formData.append('price', itemData.price)
      if (itemData.itemDetail !== undefined) formData.append('itemDetail', itemData.itemDetail)
      if (itemData.itemSellStatus !== undefined) formData.append('itemSellStatus', itemData.itemSellStatus)
      if (itemData.keywords !== undefined) formData.append('keywords', itemData.keywords)

      if (itemData.images && itemData.images.length > 0) {
         itemData.images.forEach((image) => {
            formData.append('img', image)
         })
      }

      const config = { headers: { 'Content-Type': 'multipart/form-data' } }
      const response = await naviApi.put(`/items/${id}`, formData, config)

      return response.data.data // updatedItem
   } catch (error) {
      console.error('상품 수정 오류:', error)
      throw error.response?.data || error
   }
}

// 상품 삭제
export const deleteItem = async (id) => {
   try {
      await naviApi.delete(`/items/${id}`)
      return id
   } catch (error) {
      console.error('상품 삭제 오류:', error)
      throw error.response?.data || error
   }
}
