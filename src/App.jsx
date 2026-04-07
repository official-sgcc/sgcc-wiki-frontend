import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Category from './component/layout/Category'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Category />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
