import StarRating from "./StarRating";

export default function AlbumCard({imgSrc, albumTitle, artistName, rating}) {
    return (
        <div className="cardWrapper">
            <img className="cardImg" src={imgSrc} alt={albumTitle} />
            <div className="cardContent">
                <h3 className="cardTitle">{albumTitle}</h3>
                <p className="cardArtist">{artistName}</p>
                <StarRating rating={rating} />
            </div>
        </div>
    )
}