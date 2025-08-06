const express = require('express')
const { Item, Img, Keyword, ItemKeyword, sequelize } = require('../models')
const { Op } = require('sequelize')
const router = express.Router()

// GET /api/items - 상품 목록 조회
router.get('/', async (req, res, next) => {
   try {
      const page = parseInt(req.query.page, 10) || 1
      const limit = parseInt(req.query.limit, 10) || 5
      const offset = (page - 1) * limit

      const searchTerm = req.query.searchTerm || ''
      const searchCategory = req.query.searchCategory || 'itemNm'
      const sellCategory = req.query.sellCategory

      const whereClause = {
         ...(searchTerm && {
            [searchCategory]: {
               [Op.like]: `%${searchTerm}%`,
            },
         }),
         ...(sellCategory && {
            itemSellStatus: sellCategory,
         }),
      }

      const count = await Item.count({ where: whereClause })

      const items = await Item.findAll({
         where: whereClause,
         limit,
         offset,
         order: [['createdAt', 'DESC']],
         include: [
            {
               model: Img,
               as: 'imgs',
               attributes: ['id', 'originName', 'imgUrl', 'field'],
            },
         ],
      })

      res.json({
         success: true,
         message: '상품 목록 조회 성공',
         items,
         pagination: {
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            limit,
         },
      })
   } catch (error) {
      error.status = 500
      error.message = '전체 상품 리스트를 불러오는 중 오류가 발생했습니다.'
      next(error)
   }
})

// GET /api/items/:id - 상품 상세 조회
router.get('/:id', async (req, res, next) => {
   try {
      const id = req.params.id

      const item = await Item.findOne({
         where: { id },
         include: [
            {
               model: Img,
               as: 'imgs',
               attributes: ['id', 'originName', 'imgUrl', 'field'],
            },
         ],
      })

      if (!item) {
         const error = new Error('해당 상품을 찾을 수 없습니다.')
         error.status = 404
         return next(error)
      }

      res.json({
         success: true,
         message: '상품 조회 성공',
         item,
      })
   } catch (error) {
      error.status = 500
      error.message = '상품을 불러오는 중 오류가 발생했습니다.'
      next(error)
   }
})

// POST /api/items - 상품 등록
router.post('/', async (req, res) => {
   const transaction = await sequelize.transaction()

   try {
      const {
         itemNm,
         price,
         stock, // 모델에는 없는데, 필요한 경우 모델 수정 필요
         itemDetail,
         itemSellStatus = 'SELL', // 기본값 SELL
         images = [],
         keywords = [],
         orderId, // 필요시
      } = req.body

      // 필수 필드 검증
      if (!itemNm || !price || !itemDetail) {
         return res.status(400).json({
            success: false,
            message: '상품명(itemNm), 가격(price), 상품상세(itemDetail)은 필수 입력 항목입니다.',
         })
      }

      const item = await Item.create(
         {
            itemNm,
            price,
            itemDetail,
            itemSellStatus,
            orderId, // 필요하면 넣기
         },
         { transaction }
      )

      // 이미지 등록
      if (images.length > 0) {
         const imageData = images.map((img) => ({
            url: img.url,
            alt: img.alt || itemNm,
            itemId: item.id,
         }))
         await Img.bulkCreate(imageData, { transaction })
      }

      // 키워드 등록
      if (keywords.length > 0) {
         for (const keywordName of keywords) {
            const [keyword] = await Keyword.findOrCreate(
               {
                  where: { name: keywordName },
                  defaults: { name: keywordName },
               },
               { transaction }
            )

            await ItemKeyword.create(
               {
                  itemId: item.id,
                  keywordId: keyword.id,
               },
               { transaction }
            )
         }
      }

      await transaction.commit()

      // 생성된 상품 조회 (연관 포함)
      const createdItem = await Item.findByPk(item.id, {
         include: [
            {
               model: Img,
               as: 'imgs',
               attributes: ['id', 'url', 'alt'],
            },
            {
               model: Keyword,
               as: 'keywords',
               through: { attributes: [] },
               attributes: ['id', 'name'],
            },
         ],
      })

      res.status(201).json({
         success: true,
         message: '상품이 성공적으로 등록되었습니다.',
         data: createdItem,
      })
   } catch (error) {
      await transaction.rollback()

      console.error('상품 등록 오류:', error)
      res.status(500).json({
         success: false,
         message: '상품 등록에 실패했습니다.',
         error: error.message,
      })
   }
})

// PUT /api/items/:id - 상품 수정
router.put('/:id', async (req, res) => {
   const transaction = await sequelize.transaction()

   try {
      const { id } = req.params
      const {
         itemNm,
         price,
         stock, // 모델에 없으면 제거하거나 모델 수정 필요
         itemDetail,
         itemSellStatus,
         images = [],
         keywords = [],
         orderId,
      } = req.body

      const item = await Item.findByPk(id, { transaction })
      if (!item) {
         await transaction.rollback()
         return res.status(404).json({
            success: false,
            message: '수정할 상품을 찾을 수 없습니다.',
         })
      }

      const updateData = {}
      if (itemNm !== undefined) updateData.itemNm = itemNm
      if (price !== undefined) updateData.price = price
      if (itemDetail !== undefined) updateData.itemDetail = itemDetail
      if (itemSellStatus !== undefined) updateData.itemSellStatus = itemSellStatus
      if (orderId !== undefined) updateData.orderId = orderId

      await item.update(updateData, { transaction })

      // 이미지 업데이트
      if (images.length >= 0) {
         await Img.destroy({ where: { itemId: id }, transaction })
         if (images.length > 0) {
            const imageData = images.map((img) => ({
               url: img.url,
               alt: img.alt || itemNm || item.itemNm,
               itemId: id,
            }))
            await Img.bulkCreate(imageData, { transaction })
         }
      }

      // 키워드 업데이트
      if (keywords.length >= 0) {
         await ItemKeyword.destroy({ where: { itemId: id }, transaction })
         if (keywords.length > 0) {
            for (const keywordName of keywords) {
               const [keyword] = await Keyword.findOrCreate(
                  {
                     where: { name: keywordName },
                     defaults: { name: keywordName },
                  },
                  { transaction }
               )

               await ItemKeyword.create(
                  {
                     itemId: id,
                     keywordId: keyword.id,
                  },
                  { transaction }
               )
            }
         }
      }

      await transaction.commit()

      const updatedItem = await Item.findByPk(id, {
         include: [
            {
               model: Img,
               as: 'imgs',
               attributes: ['id', 'url', 'alt'],
            },
            {
               model: Keyword,
               as: 'keywords',
               through: { attributes: [] },
               attributes: ['id', 'name'],
            },
         ],
      })

      res.json({
         success: true,
         message: '상품이 성공적으로 수정되었습니다.',
         data: updatedItem,
      })
   } catch (error) {
      await transaction.rollback()

      console.error('상품 수정 오류:', error)
      res.status(500).json({
         success: false,
         message: '상품 수정에 실패했습니다.',
         error: error.message,
      })
   }
})

// DELETE /api/items/:id - 상품 삭제
router.delete('/:id', async (req, res) => {
   const transaction = await sequelize.transaction()

   try {
      const { id } = req.params

      const item = await Item.findByPk(id, { transaction })
      if (!item) {
         await transaction.rollback()
         return res.status(404).json({
            success: false,
            message: '삭제할 상품을 찾을 수 없습니다.',
         })
      }

      await ItemKeyword.destroy({ where: { itemId: id }, transaction })
      await Img.destroy({ where: { itemId: id }, transaction })
      await item.destroy({ transaction })

      await transaction.commit()

      res.json({
         success: true,
         message: '상품이 성공적으로 삭제되었습니다.',
      })
   } catch (error) {
      await transaction.rollback()

      console.error('상품 삭제 오류:', error)
      res.status(500).json({
         success: false,
         message: '상품 삭제에 실패했습니다.',
         error: error.message,
      })
   }
})

module.exports = router
