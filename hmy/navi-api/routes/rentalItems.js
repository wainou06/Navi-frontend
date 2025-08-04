const express = require('express')
const { RentalItem, Img, Keyword, RentalItemKeyword, sequelize } = require('../models')
const { Op } = require('sequelize')
const router = express.Router()

// GET /rental - 렌탈상품 목록 조회
router.get('/', async (req, res) => {
   try {
      const { page = 1, limit = 10, status, keyword } = req.query
      const offset = (page - 1) * limit

      // 검색 조건 구성
      const whereClause = {}
      if (status) {
         whereClause.status = status
      }
      if (keyword) {
         whereClause[Op.or] = [{ name: { [Op.like]: `%${keyword}%` } }, { content: { [Op.like]: `%${keyword}%` } }]
      }

      const rentalItems = await RentalItem.findAndCountAll({
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
               through: { attributes: [] }, // RentalItemKeyword 중간 테이블 속성 제외
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
            rentalItems: rentalItems.rows,
            pagination: {
               total: rentalItems.count,
               page: parseInt(page),
               limit: parseInt(limit),
               totalPages: Math.ceil(rentalItems.count / limit),
            },
         },
      })
   } catch (error) {
      console.error('렌탈상품 목록 조회 오류:', error)
      res.status(500).json({
         success: false,
         message: '렌탈상품 목록을 가져오는데 실패했습니다.',
         error: error.message,
      })
   }
})

// GET /rental/detail/:id - 렌탈상품 상세 조회
router.get('/:id', async (req, res) => {
   try {
      const { id } = req.params

      const rentalItem = await RentalItem.findByPk(id, {
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

      if (!rentalItem) {
         return res.status(404).json({
            success: false,
            message: '렌탈상품을 찾을 수 없습니다.',
         })
      }

      res.json({
         success: true,
         data: rentalItem,
      })
   } catch (error) {
      console.error('렌탈상품 상세 조회 오류:', error)
      res.status(500).json({
         success: false,
         message: '렌탈상품 정보를 가져오는데 실패했습니다.',
         error: error.message,
      })
   }
})

//렌탈상품 등록
router.post('/', async (req, res) => {
   const transaction = await sequelize.transaction()

   try {
      const {
         name,
         price, // 일일 렌탈 가격
         stock,
         content,
         status = 'available', // 기본값: 대여가능
         rentalPeriodMin = 1, // 최소 대여 기간 (일)
         rentalPeriodMax = 30, // 최대 대여 기간 (일)
         images = [],
         keywords = [],
      } = req.body

      // 필수 필드 검증
      if (!name || !price || stock === undefined) {
         return res.status(400).json({
            success: false,
            message: '상품명, 일일 렌탈가격, 재고는 필수 입력 항목입니다.',
         })
      }

      // 렌탈상품 생성
      const rentalItem = await RentalItem.create(
         {
            name,
            price,
            stock,
            content,
            status,
            rentalPeriodMin,
            rentalPeriodMax,
         },
         { transaction }
      )

      // 이미지 등록
      if (images.length > 0) {
         const imageData = images.map((img) => ({
            url: img.url,
            alt: img.alt || name,
            rentalItemId: rentalItem.id,
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

            // 렌탈상품-키워드 연결
            await RentalItemKeyword.create(
               {
                  rentalItemId: rentalItem.id,
                  keywordId: keyword.id,
               },
               { transaction }
            )
         }
      }

      // 트랜잭션 커밋
      await transaction.commit()

      // 생성된 렌탈상품 정보 조회 (연관 데이터 포함)
      const createdRentalItem = await RentalItem.findByPk(rentalItem.id, {
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
         message: '렌탈상품이 성공적으로 등록되었습니다.',
         data: createdRentalItem,
      })
   } catch (error) {
      // 트랜잭션 롤백
      await transaction.rollback()

      console.error('렌탈상품 등록 오류:', error)
      res.status(500).json({
         success: false,
         message: '렌탈상품 등록에 실패했습니다.',
         error: error.message,
      })
   }
})

// PUT /rental-items/:id - 렌탈상품 수정
router.put('/:id', async (req, res) => {
   const transaction = await sequelize.transaction()

   try {
      const { id } = req.params
      const { name, price, stock, content, status, rentalPeriodMin, rentalPeriodMax, images = [], keywords = [] } = req.body

      // 렌탈상품 존재 확인
      const rentalItem = await RentalItem.findByPk(id, { transaction })
      if (!rentalItem) {
         await transaction.rollback()
         return res.status(404).json({
            success: false,
            message: '수정할 렌탈상품을 찾을 수 없습니다.',
         })
      }

      // 렌탈상품 정보 업데이트
      const updateData = {}
      if (name !== undefined) updateData.name = name
      if (price !== undefined) updateData.price = price
      if (stock !== undefined) updateData.stock = stock
      if (content !== undefined) updateData.content = content
      if (status !== undefined) updateData.status = status
      if (rentalPeriodMin !== undefined) updateData.rentalPeriodMin = rentalPeriodMin
      if (rentalPeriodMax !== undefined) updateData.rentalPeriodMax = rentalPeriodMax

      await rentalItem.update(updateData, { transaction })

      // 이미지 업데이트 (기존 이미지 삭제 후 새로 추가)
      if (images.length >= 0) {
         await Img.destroy({ where: { rentalItemId: id }, transaction })
         if (images.length > 0) {
            const imageData = images.map((img) => ({
               url: img.url,
               alt: img.alt || name || rentalItem.name,
               rentalItemId: id,
            }))
            await Img.bulkCreate(imageData, { transaction })
         }
      }

      // 키워드 업데이트 (기존 연결 삭제 후 새로 추가)
      if (keywords.length >= 0) {
         await RentalItemKeyword.destroy({ where: { rentalItemId: id }, transaction })
         if (keywords.length > 0) {
            for (const keywordName of keywords) {
               const [keyword] = await Keyword.findOrCreate(
                  {
                     where: { name: keywordName },
                     defaults: { name: keywordName },
                  },
                  { transaction }
               )

               await RentalItemKeyword.create(
                  {
                     rentalItemId: id,
                     keywordId: keyword.id,
                  },
                  { transaction }
               )
            }
         }
      }

      // 트랜잭션 커밋
      await transaction.commit()

      // 업데이트된 렌탈상품 정보 조회
      const updatedRentalItem = await RentalItem.findByPk(id, {
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
         message: '렌탈상품이 성공적으로 수정되었습니다.',
         data: updatedRentalItem,
      })
   } catch (error) {
      // 트랜잭션 롤백
      await transaction.rollback()

      console.error('렌탈상품 수정 오류:', error)
      res.status(500).json({
         success: false,
         message: '렌탈상품 수정에 실패했습니다.',
         error: error.message,
      })
   }
})

// DELETE /rental-items/:id - 렌탈상품 삭제
router.delete('/:id', async (req, res) => {
   const transaction = await sequelize.transaction()

   try {
      const { id } = req.params

      // 렌탈상품 존재 확인
      const rentalItem = await RentalItem.findByPk(id, { transaction })
      if (!rentalItem) {
         await transaction.rollback()
         return res.status(404).json({
            success: false,
            message: '삭제할 렌탈상품을 찾을 수 없습니다.',
         })
      }

      // 연관 데이터 삭제 (CASCADE로 설정되어 있다면 자동 삭제됨)
      await RentalItemKeyword.destroy({ where: { rentalItemId: id }, transaction })
      await Img.destroy({ where: { rentalItemId: id }, transaction })

      // 렌탈상품 삭제
      await rentalItem.destroy({ transaction })

      // 트랜잭션 커밋
      await transaction.commit()

      res.json({
         success: true,
         message: '렌탈상품이 성공적으로 삭제되었습니다.',
      })
   } catch (error) {
      // 트랜잭션 롤백
      await transaction.rollback()

      console.error('렌탈상품 삭제 오류:', error)
      res.status(500).json({
         success: false,
         message: '렌탈상품 삭제에 실패했습니다.',
         error: error.message,
      })
   }
})

module.exports = router
