import { useApp } from '../context/AppContext';

const iconMap = {
  success: 'check_circle',
  error:   'error',
  warning: 'warning',
  info:    'info',
};

export default function ToastContainer() {
  const { toasts } = useApp();
  return (
    <div id="toast-root">
      {toasts.map(t => (
        <div key={t.id} className={`toast-item toast-${t.type}`}>
          <span className="material-symbols-rounded" style={{ fontSize: 18, flexShrink: 0 }}>
            {iconMap[t.type] || 'info'}
          </span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}
