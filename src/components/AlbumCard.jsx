import StarRating from './StarRating.jsx'

export default function AlbumCard({imgSrc, albumTitle, artistName, releaseYear, albumType, onClick, rating}) {
    return (
        <div className="cardWrapper" onClick={onClick} style={{cursor: onClick ? 'pointer' : 'default'}}>
            <img className="cardImg" src={imgSrc} alt={albumTitle} />
            <div className="cardContent">
                <h3 className="cardTitle">{albumTitle}</h3>
                <p className="cardArtist">{artistName}</p>
                <p className="cardMeta">
                    {releaseYear} {albumType && `| ${albumType}`}
                </p>
                {rating && <StarRating rating={rating} />}
            </div>
        </div>
    )
}