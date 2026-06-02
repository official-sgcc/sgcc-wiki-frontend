function AccountStatus({ title, message }) {
  return (
    <div className="padding">
      <div className="accountName">{title}</div>
      {message && <p className="accountNotice">{message}</p>}
    </div>
  )
}

export default AccountStatus
