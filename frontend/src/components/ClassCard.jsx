import React from 'react';
import './ClassCard.css';

const ClassCard = ({ title, logo, subtitle, progress = 0 }) => {
  return (
    <div className="class-card">
      <div className="class-card__header">
        {logo && (
          <img src={logo} alt={`${title} Logo`} className="class-card__logo" />
        )}
        <h2 className="class-card__title">{title}</h2>
      </div>

      {subtitle && <div className="class-card__subtitle">{subtitle}</div>}

      <div className="class-card__progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>
        <div className="progress-percentage">{Math.round(progress)}%</div>
      </div>
    </div>
  );
};

export default ClassCard;
