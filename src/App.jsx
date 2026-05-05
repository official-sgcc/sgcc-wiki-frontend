import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './component/layout/Layout'
import Body from './component/layout/Body'
import SubCategory from './component/layout/SubCategory'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout content={<Body/>}/>} />
        <Route path="/wiki/:subcategory" element={<Layout content={<SubCategory/>}/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
