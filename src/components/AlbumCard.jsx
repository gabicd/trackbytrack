import StarRating from "./StarRating";

export default function AlbumCard({imgSrc, albumTitle, artistName, rating, onClick}) {
    return (
        <div className="cardWrapper" onClick={onClick} style={{cursor: onClick ? 'pointer' : 'default'}}>
            <img className="cardImg" src={imgSrc} alt={albumTitle} />
            <div className="cardContent">
                <h3 className="cardTitle">{albumTitle}</h3>
                <p className="cardArtist">{artistName}</p>
                <StarRating rating={rating} />
            </div>
        </div>
    )
}