import InstagramIcon from '@mui/icons-material/Instagram'
import FacebookIcon from '@mui/icons-material/Facebook'
import YouTubeIcon from '@mui/icons-material/YouTube'

function Footer() {
   return (
      <footer>
         <div className="top">Share & Release</div>
         <div className="middle">
            <div>
               <img src="/images/logo.png" alt="로고" height="40px" />
               <ul className="sns">
                  <li>
                     <InstagramIcon className="icon" />
                  </li>
                  <li>
                     <FacebookIcon className="icon" />
                  </li>
                  <li>
                     <YouTubeIcon className="icon" />
                  </li>
               </ul>
            </div>
            <ul className="footer_menu">
               <li>
                  <b>회사</b>
                  <ul>
                     <li>나비 소개</li>
                     <li>서비스 소개</li>
                  </ul>
               </li>
               <li>
                  <b>탐색</b>
                  <ul>
                     <li>중고거래</li>
                     <li>렌트하기</li>
                  </ul>
               </li>
               <li>
                  <b>비즈니스</b>
                  <ul>
                     <li>나비 비즈니스</li>
                     <li>제휴 문의</li>
                     <li>광고 문의</li>
                  </ul>
               </li>
               <li>
                  <b>문의</b>
                  <ul>
                     <li>고객센터</li>
                     <li>IR</li>
                     <li>PR</li>
                  </ul>
               </li>
            </ul>
         </div>
         <div className="bottom">
            <p>
               <b>(주) 나비</b>
            </p>
            <p>
               <b>팀장</b> 황민영
            </p>
            <p>
               <b>팀원</b> 전예은
            </p>
            <p>
               <b>팀원</b> 전준모
            </p>
            <p>
               <b>팀원</b> 차민준
            </p>
            <p>
               <b>
                  <span>이용약관</span>
                  <span>개인정보처리방침</span>
                  <span>운영정책</span>
                  <span>위치기반서비스 이용약관</span>
                  <span>이용자보호 비전과 계획</span>
                  <span>청소년보호정책</span>
               </b>
            </p>
         </div>
      </footer>
   )
}

export default Footer
