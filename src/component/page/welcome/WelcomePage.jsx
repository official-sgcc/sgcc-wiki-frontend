import { useEffect, useRef, useState } from 'react'
import './WelcomePage.css'
import { isWelcomePeriod } from './WelcomeTimeSet';
import poster from '../../../assets/25-2 recruiting poster.png' // 신입부원 모집 포스터. 임시로 25-2 포스터를 넣어둠

// 터미널 모양 만드는 HTML 요소 함수
function TerminalText({ children }) {
  const textRef = useRef(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [typedText, setTypedText] = useState('');
  const fullText = String(children);

  useEffect(() => {
    const element = textRef.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 1) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 1 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!hasStarted || typedText.length >= fullText.length) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setTypedText(fullText.slice(0, typedText.length + 1));
    }, 45);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [fullText, hasStarted, typedText]);

  return (
    <div className='text' ref={textRef}>
      <div className='terminal-dots' aria-hidden='true'>
        <span />
        <span />
        <span />
      </div>
      <div className='terminal-line'>
        <span className='terminal-prompt'>$</span>
        <span>{typedText}</span>
        <span className='terminal-cursor' aria-hidden='true' />
      </div>
    </div>
  )
}

function WelcomePage() {

  const goAdmissionForm = () => { window.location.href = ''; } // 지원 폼 링크를 나중에 여기에 넣기
  const showWelcomePage = isWelcomePeriod(); // 신입 부원 모집 페이지 보이기 bool

  return showWelcomePage ? (
    <div className='inside'>
      <img src={poster} className='poster' />
      <TerminalText>
        SGCC에 오신 것을 환영합니다!
      </TerminalText>
      <button className='button' onClick={goAdmissionForm}>
        지원하기
      </button>
    </div>
  )
  : (
    <div className='inside'>
      <TerminalText>
        지금은 모집 기간이 아닙니다. 다음에 봐요!
      </TerminalText>
    </div>
  )
}

export default WelcomePage;
