import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './component/layout/Layout'
import Body from './component/layout/Body'
import SubCategory from './component/layout/SubCategory'
import GetDocs from './component/docs/GetDocs'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout content={<Body/>}/>} />
        <Route path="/wiki/:subcategory" element={<Layout content={<SubCategory/>}/>} />
        <Route path="/wiki/detail/:title" element={<Layout content={<GetDocs />}/>} />
        <Route path="*" element={<Layout content={<Body />}/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
