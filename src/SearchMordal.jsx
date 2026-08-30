import './SearchMordal.css'
import { useEffect } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { FiSearch } from 'react-icons/fi';

function SearchModal({ onClose }) {
    const [keyword,setKeyword]=useState("");
    const navigate=useNavigate();

    useEffect(() => {
    //     // 스크롤 막기
    //     document.body.style.overflow = "hidden";

    //     // 모달 닫히면 복구
    //     return () => {
    //     document.body.style.overflow = "auto";
    //     };
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscapeKey);

        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [onClose]);

    const handleKeyDown=(e)=>{//enter키 처리
        if(e.key=='Enter'){
            handleSearch();
        }
    };

    //트래픽 감당되면 onChange에도 handleSearch 달기
    const handleSearch=()=>{//검색 query 보낼 함수
        var txt=keyword.trim();
        if(!txt){
            alert('검색어를 입력해주세요.');
            return;
        }

        navigate(`/search?keyword=${encodeURIComponent(txt)}`);
        onClose();
    };

    return createPortal(
        <div className="modal_overlay" onClick={onClose}>
            <div className="mordal_content" onClick={(e) => e.stopPropagation()}>
                <h2 className="srch-title">통합검색</h2>
                <div className='srchbox'>
                    <input 
                        id='srchinput' 
                        className='srchinput'
                        type="text" 
                        onChange={(e) => setKeyword(e.target.value)} 
                        placeholder='검색어를 입력하세요' 
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />
                    <button className='modalSrchbtn' onClick={handleSearch}>
                        <FiSearch />
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
export default SearchModal
