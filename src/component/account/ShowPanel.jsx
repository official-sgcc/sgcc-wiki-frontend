import './ShowPanel.css'

function ShowPanel({ title, content }) {
  return (
    <div className="showPanel">
      <div className="showPanelTitle">
        {title}
      </div>
      <div className="showPanelContent">
        {content}
      </div>
    </div>
  )
}

export default ShowPanel