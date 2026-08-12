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

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout content={<Body/>}/>} />
        <Route path="/wiki/:subcategory" element={<Layout content={<SubCategory/>}/>} />
        <Route path="/wiki/detail/:title" element={<Layout content={<GetDocs />}/>} />
        <Route path="/wiki/edit" element={<Layout content={<DocsEditor />}/>} />
        <Route path="/wiki/detail/:prevtitle/edit" element={<Layout content={<DocsEditor />}/>} />
        <Route path="/mypage" element={<Layout content={<MyPage />}/>} />
        <Route path="/users/:userID" element={<Layout content={<UserPage />}/>} />
        <Route path="/signup" element={<Layout content={<MakeAccount />}/>} />
        <Route path="/verify-email" element={<Layout content={<VerifyEmail />} />} />
        <Route path="/forgot-password" element={<Layout content={<ForgotPassword />}/>} />
        <Route path="/reset-password" element={<Layout content={<ResetPassword />} />} />
        <Route path="/tag/:tag" element={<Layout content={<TagList />}/>} />
        <Route path="/welcome" element={<Layout content={<WelcomePage />}/>} />
        <Route path="/admin" element={<Layout content={<AdminPage />}/>} />
        <Route path="*" element={<Layout content={<NotFound />}/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
