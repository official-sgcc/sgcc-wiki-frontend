import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './component/layout/Layout'
import Body from './component/layout/Body'
import SubCategory from './component/layout/SubCategory'
import GetDocs from './component/docs/GetDocs'
import NotFound from './component/docs/NotFound'
import DocsEditor from './component/docs/DocsEditor'
import MyPage from './component/account/MyPage'
import UserPage from './component/account/UserPage'

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
        <Route path="*" element={<Layout content={<NotFound />}/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
