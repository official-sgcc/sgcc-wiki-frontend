import './WelcomePage.css'
import { isWelcomePeriod } from './WelcomeTimeSet';
import poster from '../../assets/25-2 recruiting poster.png' // 신입부원 모집 포스터. 임시로 25-2 포스터를 넣어둠

function WelcomePage() {

  const goAdmissionForm = () => { window.location.href = ''; } // 지원 폼 링크를 나중에 여기에 넣기
  const showWelcomePage = isWelcomePeriod(); // 신입 부원 모집 페이지 보이기 bool

  return showWelcomePage ? (
    <div className='inside'>
      <img src={poster} className='poster' />
      <div className='text'>
        SGCC에 오신 것을 환영합니다!
      </div>
      <button className='button' onClick={goAdmissionForm}>
        지원하기
      </button>
    </div>
  )
  : (
    <div className='inside'>
      <div className='text'>
        지금은 모집 기간이 아닙니다. 다음에 봐요!
      </div>
    </div>
  )
}

export default WelcomePage;