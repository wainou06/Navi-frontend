// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'

// import required modules
import { Navigation } from 'swiper/modules'

import { Link } from 'react-router-dom'

import ItemSellList from '../components/item/ItemSellList'

function Home({ searchTerm }) {
   return (
      <div className="main">
         <div>
            <Swiper navigation={true} modules={[Navigation]} className="mySwiper">
               <SwiperSlide>
                  <img src="/images/banner1.jpg" alt="나비 뜻" />
               </SwiperSlide>
               <SwiperSlide>
                  <img src="/images/banner2.jpg" alt="나비 슬로건" />
               </SwiperSlide>
               <SwiperSlide>
                  <img src="/images/banner3.jpg" alt="나비송" />
               </SwiperSlide>
            </Swiper>
         </div>
         <div className="togo">
            <Link to="/items/list">
               <div style={{ backgroundColor: '#AEE9F5', color: '#016CFF' }}>나누GO, 비우GO! &gt;</div>
            </Link>
            <div>
               <img src="/images/S&R.png" alt="" />
            </div>
            <Link to="/rental/list">
               <div style={{ backgroundColor: '#FFD1BA', color: '#AA3900' }}>물건 렌탈하러 가기 &gt;</div>
            </Link>
         </div>
         <div>
            <h1 style={{ fontFamily: 'Ghanachocolate, sans-serif' }}>나누는 중…</h1>
            <ItemSellList searchTerm={searchTerm} />
         </div>
         <div>
            <h1 style={{ fontFamily: 'Ghanachocolate, sans-serif' }}>빌려주는 중…</h1>
            <ItemSellList searchTerm={searchTerm} />
         </div>
      </div>
   )
}

export default Home
