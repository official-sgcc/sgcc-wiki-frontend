import React from "react";
import "./NotFound.css";

/*

목적: 페이지형 에러표기

사용법: <NotFound status={기본이 404이고 404가 아닌 나머지는 Error로 표기, 빈칸은 표기 안 함} message={출력할 메시지} />

*/

const NotFound = ({status=404,message="페이지를 찾을 수 없습니다"}) => {
  return (
    <div id="head-of-404">
      <h1>{status?status : ""} {status==404?"Not Found":(status?"Error":"")}</h1>
      <h3>{message}</h3>
    </div>
  );
};

export default NotFound;
