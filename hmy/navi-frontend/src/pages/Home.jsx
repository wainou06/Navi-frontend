// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'

// import required modules
import { Navigation } from 'swiper/modules'

import { Link } from 'react-router-dom'

function Home() {
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
            <div style={{ backgroundColor: '#AEE9F5', color: '#016CFF' }}>나누GO, 비우GO! &gt;</div>
            <div>
               <img src="/images/S&R.png" alt="" />
            </div>
            <div style={{ backgroundColor: '#FFD1BA', color: '#AA3900' }}>물건 렌탈하러 가기 &gt;</div>
         </div>
      </div>
   )
}

export default Home
