import './LoadingDots.css';

export default function LoadingDots({ success = false }) {
  return (
    <div className={`loading-dots${success ? ' loading-dots--success' : ''}`}>
      <div className="loading-dot" />
      <div className="loading-dot" />
      <div className="loading-dot" />
    </div>
  );
}
