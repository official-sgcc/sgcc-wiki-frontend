import React from "react";

const NotFound = ({status=404,message="페이지를 찾을 수 없습니다"}) => {
  return (
    <div id="head-of-404">
      <h1>{status?status : ""} {status==404?"Not Found":(status?"Error":"")}</h1>
      <h3>{message}</h3>
    </div>
  );
};

export default NotFound;
