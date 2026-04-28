import './Header.css'
import { useState } from 'react'
import SearchModal from '../../SearchMordal';
function Header() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <header>
        <div>
          <button className='srchbtn' onClick={()=>{setIsOpen(true);}} />
          {isOpen && <SearchModal onClose={() => setIsOpen(false)} />}
        </div>
    </header>
  )
}
export default Header