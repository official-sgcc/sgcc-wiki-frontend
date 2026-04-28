import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './component/layout/Layout'
import Body from './component/layout/Body'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout content={<Body/>}/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
