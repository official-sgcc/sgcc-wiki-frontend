import { useEffect, useState } from 'react'
import api from '../../backend/axios.js'
import './MyPage.css'

const TOKEN_KEY = 'token';
const USERNAME_KEY = 'username';

function ShowPanel({ title, content }) {
  return (
    <div className="showPanel">
      <div className="showPanelTitle">
        {title}
      </div>
      <div className="showPanelContent">
        {content}
      </div>
    </div>
  )
}

function MyPage() {
  const token = sessionStorage.getItem(TOKEN_KEY);
  const username = sessionStorage.getItem(USERNAME_KEY);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(token && username));
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token || !username) {
      setIsLoading(false);
      return;
    }

    async function fetchUser() {
      setIsLoading(true);
      setErrorMessage('');
      try {
        const response = await api.get(`/users/${username}`);
        setUser(response.data);
      } catch (error) {
        const status = error.response?.status;
        if (status === 404) {
          setErrorMessage('사용자 정보를 찾을 수 없습니다.');
        } else if (status === 401) {
          setErrorMessage('로그인이 필요합니다.');
        } else {
          setErrorMessage('사용자 정보를 불러오지 못했습니다.');
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
  }, [token, username]);

  if (!token || !username) {
    return (
      <div className="padding">
        <div className="accountName">로그인이 필요합니다.</div>
        <p className="accountNotice">상단 Login 버튼으로 로그인한 뒤 다시 확인해주세요.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="padding">
        <div className="accountName">사용자 정보를 불러오는 중 . . .</div>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="padding">
        <div className="accountName">My Page</div>
        <p className="accountNotice">{errorMessage}</p>
      </div>
    )
  }
  
  return ( 
    <>
	    <div className="padding">
        <div className="accountName">
          Hello, {user?.username || username}
        </div>
        <ShowPanel title="아이디" content={user?.username || username} />
        <ShowPanel title="권한" content={user?.permission || '정보 없음'} />
      </div>
    </>
  )
}

export default MyPage
