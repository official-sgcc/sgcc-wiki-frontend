import './ShowPanel.css'

function ShowPanel({ title, content }) {
  return (
    <div className="showPanel">
      <div className="showPanelTitle">
        {title}
      </div>
      <div className="showPanelContent">
        {content || '정보 없음'}
      </div>
    </div>
  )
}

export default ShowPanel