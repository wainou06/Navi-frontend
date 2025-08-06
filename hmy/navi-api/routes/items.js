const express = require('express')
const { Item, Img, Keyword, ItemKeyword, sequelize } = require('../models')
const { Op } = require('sequelize')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')

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

// uploads 폴더가 없을 경우 새로 생성
try {
   fs.readdirSync('uploads') //해당 폴더가 있는지 확인
} catch (error) {
   console.log('uploads 폴더가 없어 uploads 폴더를 생성합니다.')
   fs.mkdirSync('uploads') //폴더 생성
}

const storage = multer.diskStorage({
   destination(req, file, cb) {
      cb(null, 'uploads/')
   },
   filename(req, file, cb) {
      const ext = path.extname(file.originalname)
      const basename = path.basename(file.originalname, ext)
      cb(null, `${basename}_${Date.now()}${ext}`)
   },
})

const upload = multer({ storage })

// 상품 등록
router.post('/', upload.array('img', 10), async (req, res) => {
   try {
      const { itemNm, price, itemDetail, itemSellStatus, keywords, orderId } = req.body

      // 필수값 검증
      if (!orderId) {
         return res.status(400).json({ success: false, message: 'orderId는 필수입니다.' })
      }

      // 1. Item 저장
      const newItem = await Item.create({
         itemNm,
         price,
         itemDetail,
         itemSellStatus,
         orderId,
      })

      // 2. Img 저장 (파일이 있다면)
      if (req.files && req.files.length > 0) {
         const imgPromises = req.files.map((file) =>
            Img.create({
               src: file.filename,
               itemId: newItem.id,
            })
         )
         await Promise.all(imgPromises)
      }

      res.status(201).json({ success: true, data: newItem })
   } catch (err) {
      console.error('상품 등록 에러:', err)
      res.status(500).json({ success: false, message: '상품 등록 실패', error: err.message })
   }
})

module.exports = router

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
