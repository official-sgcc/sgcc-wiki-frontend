import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './component/layout/Layout'
import Body from './component/layout/Body'
import SubCategory from './component/layout/SubCategory'
import GetDocs from './component/docs/DocsDetail/GetDocs'
import NotFound from './component/ui/NotFound'
import DocsEditor from './component/docs/editor/DocsEditor'
import MyPage from './component/account/MyPage'
import UserPage from './component/account/UserPage'
import MakeAccount from './component/account/MakeAccount'
import TagList from './component/docs/tagview/TagList'
import WelcomePage from './component/page/welcome/WelcomePage'
import AdminPage from './component/page/admin/AdminPage'
import ForgotPassword from './component/account/ResetPWD/ForgotPassword'
import VerifyEmail from './component/account/Email/VerifyEmail'
import ResetPassword from './component/account/ResetPWD/ResetPassword'
import TwoFactor from './component/account/TwoFactor'
import EditProfile from "./component/account/EditProfile";
import AlertModal from './component/ui/Alert'
import { CheckHealth } from './component/util/authapi' // health check api
import { useState, useEffect } from 'react'

function App() {
  // 서버 상태
  // checking : 헬스체크 진행 중
  // ok       : 백엔드 및 DB 정상
  // error    : 백엔드 또는 DB 이상
  // 현재 세션에서 이미 헬스체크를 완료했다면
  // 다시 검사하지 않고 바로 정상 상태로 시작한다.
  const [healthStatus, setHealthStatus] = useState(() => {
    const healthChecked = sessionStorage.getItem("health_checked_at");

    return healthChecked ? "ok" : "checking";
  });

  useEffect(() => {
    // 이미 현재 세션에서 헬스체크를 완료했다면
    // 다시 검사하지 않는다.
    if (sessionStorage.getItem("health_checked_at")) {
      return;
    }

    const checkHealth = async () => {
      try {
        await CheckHealth();

        // 백엔드와 DB가 정상적으로 동작하는 경우
        sessionStorage.setItem(
          "health_checked_at",
          Date.now().toString()
        );

        setHealthStatus("ok");
      } catch {
        // 서버가 죽었거나 DB 연결에 실패한 경우
        setHealthStatus("error");
      }
    };

    checkHealth();
  }, []);

  // 헬스체크 진행 중
  if (healthStatus === 'checking') {
    return (
      <AlertModal
        type="loading"
        color="yellow"
        title="잠시만 기다려주세요."
      />
    );
  }

  // 서버 또는 DB 장애
  if (healthStatus === 'error') {
    const handleHealthRetry = () => {
      // 기존 헬스체크 기록을 삭제하여
      // 새로고침 후 반드시 실제 /healthz 요청을 보내도록 한다.
      sessionStorage.removeItem('health_checked_at');

      window.location.reload();
    };

    return (
      <AlertModal
        type="alert"
        color="red"
        title="서비스를 이용할 수 없습니다."
        content="잠시 후 다시 시도해주세요."
        confirmText="새로고침"
        onConfirm={handleHealthRetry}
        onClose={() => { }}
      />
    );
  }

  // 헬스체크가 정상적으로 완료된 경우 기존 앱 렌더링
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout content={<Body />} />} />
        <Route path="/wiki/:subcategory" element={<Layout content={<SubCategory />} />} />
        <Route path="/wiki/detail/:title" element={<Layout content={<GetDocs />} />} />
        <Route path="/wiki/edit" element={<Layout content={<DocsEditor />} />} />
        <Route path="/wiki/detail/:prevtitle/edit" element={<Layout content={<DocsEditor />} />} />
        <Route path="/mypage" element={<Layout content={<MyPage />} />} />
        <Route path="/users/:userID" element={<Layout content={<UserPage />} />} />
        <Route path="/signup" element={<Layout content={<MakeAccount />} />} />
        <Route path="/verify-email" element={<Layout content={<VerifyEmail />} />} />
        <Route path="/forgot-password" element={<Layout content={<ForgotPassword />} />} />
        <Route path="/reset-password" element={<Layout content={<ResetPassword />} />} />
        <Route path="/two-factor" element={<Layout content={<TwoFactor />} />} />
        <Route path="/edit-profile" element={<Layout content={<EditProfile />} />} />
        <Route path="/tag/:tag" element={<Layout content={<TagList />} />} />
        <Route path="/welcome" element={<Layout content={<WelcomePage />} />} />
        <Route path="/admin" element={<Layout content={<AdminPage />} />} />
        <Route path="*" element={<Layout content={<NotFound />} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App