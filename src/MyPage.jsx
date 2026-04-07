import { useState } from 'react'
import styles from './MyPage.css'

function ShowPanel(title, content) {
  return (
    <div className={styles.showPanel}>
      <div className={styles.showPanelTitle}>
        {title}
      </div>
      <div className={styles.showPanelContent}>
        {content}
      </div>
    </div>
  )
}

function Alarm(content) {
  // 받아와야됨
}

function ShowList(title, content) {
  let list = [];
  const [len, setLen] = useState(0);
  // 받아와야됨
  // list+=ShowPanel
  return <div className={styles.showList}>
    {list}
  </div>
}

function MyPage() {
  const [name, setName] = useState("이름");
  const email = "email@email.com";
  const 학번 = "20201557";
  
  return ( 
    <>
	    <div className={styles.padding}>
        <div className={styles.accountName}>
          Hello, {name}
        </div>
        <ShowPanel title={"Email"} content={email} />
        <ShowPanel title={"학번"} content={학번} />
      </div>
    </>
  )
}

export default MyPage
