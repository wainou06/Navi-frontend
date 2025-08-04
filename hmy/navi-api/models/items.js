const Sequelize = require('sequelize')

module.exports = class Item extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            itemNm: {
               type: Sequelize.STRING(100),
               allowNull: false,
            },
            price: {
               type: Sequelize.INTEGER,
               allowNull: false,
            },
            itemSellStatus: {
               type: Sequelize.ENUM('SELL', 'SOLD_OUT', 'ON_SALE'),
               allowNull: false,
            },
            itemDetail: {
               type: Sequelize.TEXT,
               allowNull: false,
            },
            orderId: {
               type: Sequelize.INTEGER,
               allowNull: false,
               references: {
                  model: 'Orders',
                  key: 'id',
               },
            },
         },
         {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Item',
            tableName: 'Items',
            paranoid: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(db) {
      // Item -> Order (N:1)
      db.Item.belongsTo(db.Order, {
         foreignKey: 'orderId',
         targetKey: 'id',
         as: 'order',
      })

      // Item -> Img (1:N)
      db.Item.hasMany(db.Img, {
         foreignKey: 'itemId',
         sourceKey: 'id',
         as: 'imgs',
      })

      // Item <-> Keyword (1:n)
      db.Item.hasMany(db.ItemKeyword, {
         foreignKey: 'itemId',
         otherKey: 'keywordId',
      })
   }
}
