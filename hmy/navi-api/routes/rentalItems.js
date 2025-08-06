const express = require('express')
const router = express.Router()
const { Op } = require('sequelize')
const { RentalItem, RentalImg, ItemKeyword } = require('../models')

// GET /rental-items
router.get('/', async (req, res) => {
   try {
      const { page = 1, limit = 10, status, keyword } = req.query
      const offset = (page - 1) * limit

      // 검색 조건 구성
      const whereClause = {}
      if (status) {
         whereClause.rentalStatus = status
      }
      if (keyword) {
         whereClause[Op.or] = [{ rentalItemNm: { [Op.like]: `%${keyword}%` } }, { rentalDetail: { [Op.like]: `%${keyword}%` } }]
      }

      const rentalItems = await RentalItem.findAndCountAll({
         where: whereClause,
         include: [
            {
               model: RentalImg,
               as: 'rentalImgs',
               attributes: ['id', 'originName', 'imgUrl', 'field'],
            },
            {
               model: ItemKeyword,
               attributes: ['id', 'keyword'], // 실제 속성명 확인 필요
            },
         ],
         limit: parseInt(limit),
         offset: parseInt(offset),
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

module.exports = router
