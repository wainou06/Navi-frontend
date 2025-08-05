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

      // 판매상태, 상품명, 상품설명 값 가져오기
      const searchTerm = req.query.searchTerm || '' // 사용자가 입력한 검색어
      const searchCategory = req.query.searchCategory || 'itemNm' // 상품명 or 상품설명으로 검색
      const sellCategory = req.query.sellCategory

      // 조건부 where 절을 만드는 객체
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

      // 전체 상품 갯수
      const count = await Item.count({
         where: whereClause,
      })

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

// GET /items/:id - 상품 상세 조회
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

/**
 * @swagger
 * /item:
 *   post:
 *     summary: 상품 등록
 *     tags: [Item]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *                itemNm:
 *                   type: string
 *                   description: 상품명
 *                price:
 *                   type: number
 *                   description: 가격
 *                itemDetail:
 *                   type: string
 *                   description: 상품 상세
 *                itemSellStatus:
 *                   type: string
 *                   description: 판매상태(SELL, SOLD_OUT, ON_SALE)
 *                img:
 *                   type: array
 *                   items:
 *                      type: string
 *                      format: binary
 *                   description: 업로드 이미지 파일 목록(최대 5개)
 *     responses:
 *          201:
 *             description: 상품 등록 성공
 *          400:
 *             description: 파일 업로드 실패
 *          500:
 *             description: 서버 오류
 */
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
