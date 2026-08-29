import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({
  rating = 5,
  maxStars = 5,
  size = 16,
  interactive = false,
  onChange,
  className = ''
}) => {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '2px'
      }}
      className={`star-rating ${className}`}
    >
      {[...Array(maxStars)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= rating;

        return (
          <button
            type="button"
            key={index}
            disabled={!interactive}
            onClick={() => interactive && onChange && onChange(starValue)}
            style={{
              padding: 0,
              background: 'none',
              border: 'none',
              cursor: interactive ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Star
              size={size}
              fill={isFilled ? '#f59e0b' : 'transparent'}
              color={isFilled ? '#f59e0b' : '#cbd5e1'}
              strokeWidth={1.5}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
