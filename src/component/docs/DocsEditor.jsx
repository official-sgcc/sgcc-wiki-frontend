import React, { useState } from "react";
import axios from "axios";
import MDEditor from "@uiw/react-md-editor";

const api_url = import.meta.env.VITE_SERVER_URL;

//temp
async function SubmitDocs(Title, Content, Tags) {
  try {
    await axios.post(`${api_url}/documents`, {
      params: {
        title: Title,
        content: Content,
        tags: Tags,
      },
    });
  } catch (e) {
    console.error(e);
  }
}

function DocsEditor() {
  const [mdinfo,setMD]=useState("");
  return (
    <>
      <div data-color-mode="light">
        <MDEditor height={600} value={mdinfo} onChange={setMD} />
      </div>
    </>
  );
}

export default DocsEditor;
