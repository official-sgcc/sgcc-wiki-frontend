import { FiShield } from 'react-icons/fi'
import './RoleBadge.css'

export default function RoleBadge({ permission, roles = [] }) {
  const role = roles.find((item) => item.name === permission);
  const label = role?.label || '권한 정보 없음';
  const tone = ['admin', 'club_member', 'login_user'].includes(role?.name)
    ? role.name : 'unknown';

  return (
    <span className={`role-badge role-badge--${tone}`} aria-label={`권한: ${label}`}>
      <FiShield aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
