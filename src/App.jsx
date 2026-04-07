import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MyPage from './MyPage'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/mypage" element={<MyPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
