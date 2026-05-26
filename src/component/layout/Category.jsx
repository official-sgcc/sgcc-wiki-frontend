import { useState } from 'react';
import './Category.css';
import SearchModal from '../../SearchMordal'
import { Link } from 'react-router-dom';
import LoginModal from '../account/LoginModal';

const TOKEN_KEY = 'token';
const USERNAME_KEY = 'username';

function Category() {

  const [activeCategory, setActiveCategory] = useState(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [currentUsername, setCurrentUsername] = useState(() => sessionStorage.getItem(USERNAME_KEY) || '');
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) || '');
  const isLoggedIn = Boolean(token);


  const categories = {
    "category1": ["subcategory1-1", "subcategory1-2"],
    "category2": ["subcategory2-1", "subcategory2-2"],
    "category3": ["subcategory3-1", "subcategory3-2"],
  };
  
  const mainCategories = Object.keys(categories);

  const closeLoginModal = () => {
    setIsLoginOpen(false);
  };

  const handleLoginSuccess = ({ username, token }) => {
    setCurrentUsername(username);
    setToken(token);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USERNAME_KEY);
    setCurrentUsername('');
    setToken('');
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
        {isLoggedIn ? (
          <>
            <Link className="footer-item-login" to="/mypage">
              {currentUsername || 'My Page'}
            </Link>
            <p className="footer-item-login" onClick={handleLogout}>Logout</p>
          </>
        ) : (
          <p 
            className="footer-item-login" 
            onClick={() => {
              setIsLoginOpen(true)
          }}
          >
            Login
          </p>
        )}
        <p>포탈시스템</p>
      </div>

      {isLoginOpen && (
        <LoginModal onClose={closeLoginModal} onSuccess={handleLoginSuccess} />
      )}
    </nav>
  );
}

export default Category;
