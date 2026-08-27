import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { VerifyEmail as VerifyEmailAPI } from "../../util/AuthAPI";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [response, setResponse] = useState(undefined);

  useEffect(() => {
    const token = searchParams.get("token");

    const verify = async () => {
      if (!token) {
        setResponse(null);
        return;
      }

      const result = await VerifyEmailAPI(token);
      setResponse(result);
    };

    verify();
  }, [searchParams]);

  return (
    <>
      {response === undefined && (
        <h1 style={{ color: "#000" }}>이메일 인증 중...</h1>
      )}

      {response && (
        <h1 style={{ color: "#000" }}>이메일 인증이 완료되었습니다.</h1>
      )}

      {response === null && (
        <h1 style={{ color: "#000" }}>이메일 인증에 실패했습니다.</h1>
      )}
    </>
  );
}