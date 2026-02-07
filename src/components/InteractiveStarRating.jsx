import { useState, useCallback } from 'react';
import './InteractiveStarRating.css';

export default function InteractiveStarRating({ rating, onRatingChange, size = 24 }) {
  const [hoverRating, setHoverRating] = useState(null);

  const handleMouseMove = useCallback((e, starIndex) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isLeftHalf = x < rect.width / 2;
    const newRating = isLeftHalf ? starIndex - 0.5 : starIndex;
    setHoverRating(newRating);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoverRating(null);
  }, []);

  const handleClick = useCallback((e, starIndex) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isLeftHalf = x < rect.width / 2;
    const newRating = isLeftHalf ? starIndex - 0.5 : starIndex;
    onRatingChange(newRating);
  }, [onRatingChange]);

  const displayRating = hoverRating !== null ? hoverRating : rating;

  const renderStar = (starIndex) => {
    const filled = displayRating >= starIndex;
    const halfFilled = displayRating === starIndex - 0.5;
    
    return (
      <div 
        key={starIndex}
        className="interactive-star-container"
        style={{ width: size, height: size }}
        onMouseMove={(e) => handleMouseMove(e, starIndex)}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => handleClick(e, starIndex)}
      >
        <span 
          className={`star-bg ${filled || halfFilled ? 'hovered' : ''}`}
          style={{ fontSize: size }}
        >
          ☆
        </span>
        
        {(filled || halfFilled) && (
          <span 
            className={`star-fill ${halfFilled ? 'half' : ''}`}
            style={{ fontSize: size }}
          >
            {halfFilled ? '⯪' : '★'}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="interactive-star-rating">
      <div className="stars-container">
        {[1, 2, 3, 4, 5].map(starIndex => renderStar(starIndex))}
      </div>
      {rating > 0 && (
        <span className="rating-value">{rating}/5</span>
      )}
    </div>
  );
}
