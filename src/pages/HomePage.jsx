import './HomePage.css'
import AlbumCard from '../components/AlbumCard.jsx'
import StarRating from '../components/StarRating.jsx'

function HomePage() {
  return (
    <div className="home-page">
      <section className="trending-section">
        <h2 className="home-section-title">Trending</h2>
        <div className='albumGrid'>
          <div className='cardWrapper'>
            <AlbumCard 
                imgSrc={"https://upload.wikimedia.org/wikipedia/pt/9/9d/Zara_Larsson_-_Midnight_Sun.png"}
                albumTitle={"Midnight Sun"}
                artistName={"Zara Larsson"} 
                releaseYear={2025}
                albumType={"LP"}
            ></AlbumCard>
            <StarRating rating={4} />
          </div>


            
            <AlbumCard 
                imgSrc={"https://upload.wikimedia.org/wikipedia/en/a/af/PinkPantheress_-_Fancy_Some_More%3F.jpg"}
                albumTitle={"Fancy Some More?"}
                artistName={"PinkPantheress"} 
                releaseYear={2025}
                albumType={"LP"}
            />   
            <AlbumCard 
                imgSrc={"https://upload.wikimedia.org/wikipedia/pt/c/ca/Sabrina_Carpenter_%E2%80%93_Man%27s_Best_Friend_%28album_cover%29.png"}
                albumTitle={"Man's Best Friend"}
                artistName={"Sabrina Carpenter"} 
                releaseYear={2024}
                albumType={"LP"}
            />            
        </div>
      </section>
    </div>
  )
}

export default HomePage
