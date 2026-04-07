import React, { useState } from 'react';
import './Category.css';
import SearchModal from '../../SearchMordal'

function Category() {

  const [activeCategory, setActiveCategory] = useState(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [userId, setUserId] = useState('');
  const [userPw, setUserPw] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);


  const categories = {
    "category1": ["subcategory1-1", "subcategory1-2"],
    "category2": ["subcategory2-1", "subcategory2-2"],
    "category3": ["subcategory3-1", "subcategory3-2"],
  };
  
  const mainCategories = Object.keys(categories);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    // 테스트용 임시 아이디/비번
    const mockId = "noeul";
    const mockPw = "1222";

    if (userId === mockId && userPw === mockPw) {
        alert("로그인 성공!");
        closeLoginModal();
    } else {
        setErrorMessage('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  const closeLoginModal = () => {
    setIsLoginOpen(false);
    setUserId('');
    setUserPw('');
    setErrorMessage('');
  };

  return (
    <nav className="category-sidebar" onMouseLeave={() => setActiveCategory(null)}>
      <div className="sidebar-logo">
        <h2>SGCC Wiki</h2>
      </div>

      <ul className="sidebar-menu">
        {mainCategories.map((category) => (
          <li
            key={category}
            className={`category-item ${activeCategory === category ? 'active' : ''}`}
            onMouseEnter={() => setActiveCategory(category)}
          >
            {category}
          </li>
        ))}
      </ul>

      {activeCategory && (
        <div className="mega-category">
            <div className="mega-category-content">
                <h3>{activeCategory}</h3>
                <ul>
                    {categories[activeCategory].map((sub, idx) => (
                        <li key={idx}>{sub}</li>
                    ))}
                </ul>
            </div>
        </div>
      )}
      <div>
        <button className='srchbtn' onClick={()=>{setIsOpen(true);}} />
        {isOpen && <SearchModal onClose={() => setIsOpen(false)} />}
      </div>
      <div className="sidebar-footer">
        <p 
          className="footer-item-login" 
          onClick={() => {
            setIsLoginOpen(true)
        }}
        >
          Login
        </p>
        <p>포탈시스템</p>
      </div>

      {isLoginOpen && (
        <div className="login-modal-overlay" onClick={closeLoginModal}>
          <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeLoginModal}>X</button>
            <h2>LOGIN</h2>
            <form onSubmit={handleLoginSubmit}>
              <input 
                type="text" 
                placeholder="아이디" 
                value={userId} 
                onChange={(e) => setUserId(e.target.value)}
                required // 비어있는 상태 방지
              />
              <input 
                type="password" 
                placeholder="비밀번호" 
                value={userPw} 
                onChange={(e) => setUserPw(e.target.value)}
                required // 비어있는 상태 방지
              />
              {errorMessage && <p className="error-message">{errorMessage}</p>}
              <button type="submit" className="login-submit-btn">LOGIN</button>
            </form>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Category;