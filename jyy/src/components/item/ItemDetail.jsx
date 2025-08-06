import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import '../../styles/itemDetail.css'

const ItemDetail = ({ onDeleteSubmit, onEditSubmit, onPriceProposal }) => {
   const { currentItem, loading, error } = useSelector((state) => state.items)
   const { user } = useSelector((state) => state.auth)

   const [selectedImage, setSelectedImage] = useState(0)
   const [priceProposal, setPriceProposal] = useState('')
   const [deliveryMethod, setDeliveryMethod] = useState('택배')
   const [showPriceModal, setShowPriceModal] = useState(false)

   const isOwner = user && currentItem && user.id === currentItem.userId
   console.log('Is Owner:', isOwner) // 확인
   console.log('User:', user) // 확인
   console.log('Current Item:', currentItem) // 확인

   const navigate = useNavigate()

   const handleDelete = () => {
      if (window.confirm('정말로 이 아이템을 삭제하시겠습니까?')) {
         onDeleteSubmit()
      }
   }

   const handleEdit = () => {
      navigate(`/items/edit/${currentItem.id}`)
   }

   const handlePriceProposal = () => {
      if (!priceProposal) {
         alert('가격을 입력해주세요.')
         return
      }

      const proposalData = {
         itemId: currentItem.id,
         proposedPrice: priceProposal,
         deliveryMethod,
      }

      onPriceProposal(proposalData)
      setShowPriceModal(false)
      setPriceProposal('')
   }

   const formatPrice = (price) => {
      return price?.toLocaleString() + '원'
   }

   if (loading) return <div className="loading">로딩중...</div>
   if (error) return <div className="error">오류: {error}</div>
   if (!currentItem) return <div className="not-found">상품을 찾을 수 없습니다.</div>

   return (
      <div className="item-detail-container">
         <div className="item-detail-content">
            {/* 이미지 섹션 */}
            <div className="image-section">
               <div className="main-image">
                  {currentItem.imgs && currentItem.imgs.length > 0 ? <img src={`${import.meta.env.VITE_APP_API_URL}/${currentItem.imgs[selectedImage]?.imgUrl.replace(/\\/g, '/')}`} alt={currentItem.itemNm} className="main-img" /> : <div className="no-image">이미지가 없습니다.</div>}
               </div>

               {/* {currentItem.imgs && currentItem.imgs.length > 1 && (
                  <div className="thumbnail-list">
                     {currentItem.imgs.map((img, index) => (
                        <img key={index} src={`/${img.imgUrl}`} alt={`${currentItem.itemNm} ${index + 1}`} className={`thumbnail ${selectedImage === index ? 'active' : ''}`} onClick={() => setSelectedImage(index)} />
                     ))}
                  </div>
               )} */}
            </div>

            {/* 상품 정보 섹션 */}
            <div className="info-section">
               <div className="item-header">
                  <h1 className="item-title">{currentItem.itemNm}</h1>
                  <div className="item-status">
                     <span className={`status-badge ${currentItem.itemSellStatus?.toLowerCase()}`}>
                        {currentItem.itemSellStatus === 'SELL' && '판매중'}
                        {currentItem.itemSellStatus === 'SOLD_OUT' && '판매완료'}
                        {currentItem.itemSellStatus === 'ON_SALE' && '할인중'}
                     </span>
                  </div>
               </div>

               <div className="price-section">
                  <div className="current-price">
                     <span className="price-label">판매가</span>
                     <span className="price">{formatPrice(currentItem.price)}</span>
                  </div>
               </div>

               {/* 구매방법 선택 */}
               <div className="delivery-section">
                  <h3>구매 방법</h3>
                  <div className="delivery-options">
                     <label className="delivery-option">
                        <input type="radio" name="delivery" value="택배" checked={deliveryMethod === '택배'} onChange={(e) => setDeliveryMethod(e.target.value)} />
                        <span>택배</span>
                     </label>
                     <label className="delivery-option">
                        <input type="radio" name="delivery" value="직거래" checked={deliveryMethod === '직거래'} onChange={(e) => setDeliveryMethod(e.target.value)} />
                        <span>직거래</span>
                     </label>
                     <label className="delivery-option">
                        <input type="radio" name="delivery" value="기타" checked={deliveryMethod === '기타'} onChange={(e) => setDeliveryMethod(e.target.value)} />
                        <span>기타</span>
                     </label>
                  </div>
               </div>

               {/* 버튼 섹션 */}
               <div className="action-section">
                  {isOwner ? (
                     // 판매자용 버튼
                     <div className="owner-buttons">
                        <button className="edit-btn" onClick={handleEdit}>
                           수정하기
                        </button>
                        <button className="delete-btn" onClick={handleDelete}>
                           삭제하기
                        </button>
                     </div>
                  ) : (
                     // 구매자용 버튼
                     <div className="buyer-buttons">
                        <button className="price-proposal-btn" onClick={() => setShowPriceModal(true)} disabled={currentItem.itemSellStatus === 'SOLD_OUT'}>
                           가격 제안하기
                        </button>
                     </div>
                  )}
               </div>

               {/* 가격 제안 모달 */}
               {showPriceModal && (
                  <div className="modal-overlay" onClick={() => setShowPriceModal(false)}>
                     <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                           <h3>가격 제안</h3>
                           <button className="modal-close" onClick={() => setShowPriceModal(false)}>
                              ×
                           </button>
                        </div>
                        <div className="modal-body">
                           <div className="price-input-section">
                              <label>제안 가격</label>
                              <input type="number" value={priceProposal} onChange={(e) => setPriceProposal(e.target.value)} placeholder="가격을 입력하세요" className="price-input" />
                              <span className="currency">원</span>
                           </div>
                           <div className="delivery-info">
                              <span>
                                 선택된 구매방법: <strong>{deliveryMethod}</strong>
                              </span>
                           </div>
                           <div className="proposal-note">
                              <p>판매자가 등록한 게시자 보다 가격을 높게 할 수 있습니다. 판매자가 제안을 수락하면 시스템에서 이메일로 알려줍니다.</p>
                           </div>
                        </div>
                        <div className="modal-footer">
                           <button className="submit-proposal-btn" onClick={handlePriceProposal}>
                              제안하기
                           </button>
                        </div>
                     </div>
                  </div>
               )}

               {/* 키워드 섹션 */}
               {currentItem.ItemKeywords && currentItem.ItemKeywords.length > 0 && (
                  <div className="keywords-section">
                     <h3>관련 키워드</h3>
                     <div className="keywords">
                        {currentItem.ItemKeywords.map((itemKeyword, index) => (
                           <span key={index} className="keyword-tag">
                              #{itemKeyword.Keyword?.name}
                           </span>
                        ))}
                     </div>
                  </div>
               )}
            </div>
         </div>

         {/* 가격 제안 현황 (판매자만 볼 수 있음) */}
         {isOwner && (
            <div className="price-proposals-section">
               <h2>가격 제안 Price proposal</h2>
               <div className="proposals-list">
                  <div className="proposal-card">
                     <div className="proposal-price">00,000</div>
                     <div className="proposal-user">
                        <img src="/default-avatar.png" alt="사용자" className="user-avatar" />
                        <span>사용자명</span>
                     </div>
                  </div>
                  <div className="proposal-card">
                     <div className="proposal-price">00,000</div>
                     <div className="proposal-user">
                        <img src="/default-avatar.png" alt="사용자" className="user-avatar" />
                        <span>방식</span>
                     </div>
                  </div>
                  <div className="proposal-card">
                     <div className="proposal-price">0,000</div>
                     <div className="proposal-user">
                        <img src="/default-avatar.png" alt="사용자" className="user-avatar" />
                        <span>종식</span>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* 상품 이미지  */}
         {currentItem.imgs && currentItem.imgs.length > 0 && (
            <div className="item-images-section">
               <h2>상품 상세 Detail </h2>
               <div className="images-gallery">
                  {currentItem.imgs.map((img, index) => (
                     <div key={index} className="gallery-image-container">
                        <img src={`${import.meta.env.VITE_APP_API_URL}/${img.imgUrl.replace(/\\/g, '/')}`} alt={`${currentItem.itemNm} ${index + 1}`} className="gallery-image" />
                     </div>
                  ))}
               </div>
            </div>
         )}

         {/* 상품 상세 설명 */}
         <div className="item-description-section">
            <h2></h2>
            <div className="description-content">
               {currentItem.itemDetail ? (
                  <div className="description-text">
                     {currentItem.itemDetail.split('\n').map((line, index) => (
                        <p key={index}>{line}</p>
                     ))}
                  </div>
               ) : (
                  <div className="no-description">상세 설명이 없습니다.</div>
               )}
            </div>
         </div>
      </div>
   )
}

export default ItemDetail
