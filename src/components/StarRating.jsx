import './Components.css';

export default function StarRating({ rating }) {
    const roundedRating = Math.round((rating || 0) * 2) / 2;
    const stars = [];

    for (let i = 1; i <= 5; i++) {
        if (i <= roundedRating) {
            stars.push(<span key={i} className="star filled">★</span>);
        } else if (i - 0.5 === roundedRating) {
            stars.push(<span key={i} className="star half">⯪</span>);
        } else {
            stars.push(<span key={i} className="star empty">☆</span>);
        }
    }

    const tooltipText = rating && rating > 0 ? `${rating}` : 'Sem avaliação';

    return (
        <div className="starRatingContainer">
            <div className="starRating">{stars}</div>
            <div className="starRatingTooltip">{tooltipText}</div>
        </div>
    );
}
