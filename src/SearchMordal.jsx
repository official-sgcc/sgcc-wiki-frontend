import './SearchMordal.css'
import { useEffect } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const wikiData = {
  "subcategory1-1": [
    { id: 1, title: "제목1", date: "2026-01-01", user: "작성자" },
    { id: 2, title: "제목2", date: "2026-01-01", user: "작성자" }
  ],
  "subcategory1-2": [
    { id: 3, title: "제목3", date: "2026-01-01", user: "작성자" },
    { id: 4, title: "제목4", date: "2026-01-01", user: "작성자" }
  ]
};

function SearchModal({ onClose }) {
    const [keyword,setKeyword]=useState("");
    const navigate=useNavigate();

    // useEffect(() => {
    //     // 스크롤 막기
    //     document.body.style.overflow = "hidden";

    //     // 모달 닫히면 복구
    //     return () => {
    //     document.body.style.overflow = "auto";
    //     };
    // }, []);
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

        let targetSubcategory = null;

        // 3. wikiData를 돌면서 입력한 제목이 포함된 서브카테고리 찾기
        for (const subcategoryKey in wikiData) {
            const posts = wikiData[subcategoryKey];
            const hasMatch = posts.some(post => 
                post.title.toLowerCase().includes(txt.toLowerCase())
            );

            if (hasMatch) {
                targetSubcategory = subcategoryKey;
                break; // 매칭되는 카테고리를 찾으면 반복문 종료
            }
        }

        // 4. 매칭되는 카테고리가 있다면 해당 주소로 쿼리스트링과 함께 이동
        if (targetSubcategory) {
            navigate(`/wiki/${targetSubcategory}?search=${encodeURIComponent(txt)}`); 
            onClose(); // 검색 완료 후 모달 닫기
        } else {
            alert("일치하는 제목의 게시글을 찾을 수 없습니다.");
        }
    };

    return (
        <div className="modal_overlay" onClick={onClose}>
            <div className="mordal_content" onClick={(e) => e.stopPropagation()}>
                <div className='srchbox'>
                    <input 
                        id='srchinput' 
                        type="text" 
                        onChange={(e) => setKeyword(e.target.value)} 
                        placeholder='검색어를 입력하세요' 
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />
                    <button className='srchbtn' onClick={handleSearch} />
                </div>
            </div>
        </div>
    );
}
export default SearchModal