import './HomePage.css'
import AlbumCard from '../components/AlbumCard.jsx'

function HomePage() {
  return (
    <div className="home-page">
      <section className="trending-section">
        <h2 className="home-section-title">Trending</h2>
        <div className='albumGrid'>
            <AlbumCard 
                imgSrc={"https://upload.wikimedia.org/wikipedia/pt/9/9d/Zara_Larsson_-_Midnight_Sun.png"}
                albumTitle={"Midnight Sun"}
                artistName={"Zara Larsson"} 
                rating={4}
            />
            <AlbumCard 
                imgSrc={"https://upload.wikimedia.org/wikipedia/en/a/af/PinkPantheress_-_Fancy_Some_More%3F.jpg"}
                albumTitle={"Fancy Some More?"}
                artistName={"PinkPantheress"} 
                rating={3.5}
            />   
            <AlbumCard 
                imgSrc={"https://upload.wikimedia.org/wikipedia/pt/c/ca/Sabrina_Carpenter_%E2%80%93_Man%27s_Best_Friend_%28album_cover%29.png"}
                albumTitle={"Man's Best Friend"}
                artistName={"Sabrina Carpenter"} 
            />            
        </div>
      </section>
    </div>
  )
}

export default HomePage
