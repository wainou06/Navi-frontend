const express = require('express')
const { Item, Img, Keyword, ItemKeyword, sequelize } = require('../models')
const { Op } = require('sequelize')
const router = express.Router()

// GET /api/items - 상품 목록 조회
router.get('/', async (req, res) => {
   try {
      const { page = 1, limit = 10, status, keyword } = req.query
      const offset = (page - 1) * limit

      // 검색 조건
      const whereClause = {}
      if (status) {
         whereClause.status = status
      }
      if (keyword) {
         whereClause[Op.or] = [{ name: { [Op.like]: `%${keyword}%` } }, { content: { [Op.like]: `%${keyword}%` } }]
      }

      const items = await Item.findAndCountAll({
         where: whereClause,
         include: [
            {
               model: Img,
               as: 'images',
               attributes: ['id', 'url', 'alt'],
            },
            {
               model: Keyword,
               as: 'keywords',
               through: { attributes: [] },
               attributes: ['id', 'name'],
            },
         ],
         limit: parseInt(limit),
         offset: offset,
         order: [['createdAt', 'DESC']],
      })

      res.json({
         success: true,
         data: {
            items: items.rows,
            pagination: {
               total: items.count,
               page: parseInt(page),
               limit: parseInt(limit),
               totalPages: Math.ceil(items.count / limit),
            },
         },
      })
   } catch (error) {
      console.error('상품 목록 조회 오류:', error)
      res.status(500).json({
         success: false,
         message: '상품 목록을 가져오는데 실패했습니다.',
         error: error.message,
      })
   }
})

// GET /api/items/:id - 상품 상세 조회
router.get('/:id', async (req, res) => {
   try {
      const { id } = req.params

      const item = await Item.findByPk(id, {
         include: [
            {
               model: Img,
               as: 'images',
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

      if (!item) {
         return res.status(404).json({
            success: false,
            message: '상품을 찾을 수 없습니다.',
         })
      }

      res.json({
         success: true,
         data: item,
      })
   } catch (error) {
      console.error('상품 상세 조회 오류:', error)
      res.status(500).json({
         success: false,
         message: '상품 정보를 가져오는데 실패했습니다.',
         error: error.message,
      })
   }
})

// POST /api/items - 상품 등록
router.post('/', async (req, res) => {
   const transaction = await sequelize.transaction()

   try {
      const {
         name,
         price,
         stock,
         content,
         status = 'available', // 기본값: 판매중
         images = [],
         keywords = [],
      } = req.body

      // 필수 필드 검증
      if (!name || !price || stock === undefined) {
         return res.status(400).json({
            success: false,
            message: '상품명, 가격, 재고는 필수 입력 항목입니다.',
         })
      }

      // 상품 생성
      const item = await Item.create(
         {
            name,
            price,
            stock,
            content,
            status,
         },
         { transaction }
      )

      // 이미지 등록
      if (images.length > 0) {
         const imageData = images.map((img) => ({
            url: img.url,
            alt: img.alt || name,
            itemId: item.id,
         }))
         await Img.bulkCreate(imageData, { transaction })
      }

      // 키워드 등록
      if (keywords.length > 0) {
         for (const keywordName of keywords) {
            // 키워드가 존재하지 않으면 생성
            const [keyword] = await Keyword.findOrCreate(
               {
                  where: { name: keywordName },
                  defaults: { name: keywordName },
               },
               { transaction }
            )

            // 상품-키워드 연결
            await ItemKeyword.create(
               {
                  itemId: item.id,
                  keywordId: keyword.id,
               },
               { transaction }
            )
         }
      }

      // 트랜잭션 커밋
      await transaction.commit()

      // 생성된 상품 정보 조회 (연관 데이터 포함)
      const createdItem = await Item.findByPk(item.id, {
         include: [
            {
               model: Img,
               as: 'images',
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
      // 트랜잭션 롤백
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
      const { name, price, stock, content, status, images = [], keywords = [] } = req.body

      // 상품 존재 확인
      const item = await Item.findByPk(id, { transaction })
      if (!item) {
         await transaction.rollback()
         return res.status(404).json({
            success: false,
            message: '수정할 상품을 찾을 수 없습니다.',
         })
      }

      // 상품 정보 업데이트
      const updateData = {}
      if (name !== undefined) updateData.name = name
      if (price !== undefined) updateData.price = price
      if (stock !== undefined) updateData.stock = stock
      if (content !== undefined) updateData.content = content
      if (status !== undefined) updateData.status = status

      await item.update(updateData, { transaction })

      // 이미지 업데이트 (기존 이미지 삭제 후 새로 추가)
      if (images.length >= 0) {
         await Img.destroy({ where: { itemId: id }, transaction })
         if (images.length > 0) {
            const imageData = images.map((img) => ({
               url: img.url,
               alt: img.alt || name || item.name,
               itemId: id,
            }))
            await Img.bulkCreate(imageData, { transaction })
         }
      }

      // 키워드 업데이트 (기존 연결 삭제 후 새로 추가)
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

      // 트랜잭션 커밋
      await transaction.commit()

      // 업데이트된 상품 정보 조회
      const updatedItem = await Item.findByPk(id, {
         include: [
            {
               model: Img,
               as: 'images',
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
      // 트랜잭션 롤백
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

      // 상품 존재 확인
      const item = await Item.findByPk(id, { transaction })
      if (!item) {
         await transaction.rollback()
         return res.status(404).json({
            success: false,
            message: '삭제할 상품을 찾을 수 없습니다.',
         })
      }

      // 연관 데이터 삭제 (CASCADE로 설정되어 있다면 자동 삭제됨)
      await ItemKeyword.destroy({ where: { itemId: id }, transaction })
      await Img.destroy({ where: { itemId: id }, transaction })

      // 상품 삭제
      await item.destroy({ transaction })

      // 트랜잭션 커밋
      await transaction.commit()

      res.json({
         success: true,
         message: '상품이 성공적으로 삭제되었습니다.',
      })
   } catch (error) {
      // 트랜잭션 롤백
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
