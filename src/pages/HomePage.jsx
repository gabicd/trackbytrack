import './HomePage.css'
import AlbumCard from '../components/AlbumCard.jsx'

function HomePage() {
  return (
    <div className="home-page">
      <section className="trending-section">
        <h2 className="home-section-title">Em Alta</h2>
        <div className='albumGrid'>
            <AlbumCard 
                imgSrc={"https://upload.wikimedia.org/wikipedia/pt/9/9d/Zara_Larsson_-_Midnight_Sun.png"}
                albumTitle={"Midnight Sun"}
                artistName={"Zara Larsson"} 
                releaseYear={2025}
                albumType={"LP"}
                rating={4}
            />
            <AlbumCard 
                imgSrc={"https://upload.wikimedia.org/wikipedia/en/a/af/PinkPantheress_-_Fancy_Some_More%3F.jpg"}
                albumTitle={"Fancy Some More?"}
                artistName={"PinkPantheress"} 
                releaseYear={2025}
                albumType={"LP"}
                rating={3.5}
            />   
            <AlbumCard 
                imgSrc={"https://upload.wikimedia.org/wikipedia/pt/c/ca/Sabrina_Carpenter_%E2%80%93_Man%27s_Best_Friend_%28album_cover%29.png"}
                albumTitle={"Man's Best Friend"}
                artistName={"Sabrina Carpenter"} 
                releaseYear={2024}
                albumType={"LP"}
                rating={3.5}
            /> 
            <AlbumCard 
                imgSrc={"https://lh3.googleusercontent.com/ymTIiem2EfTKdNyiCCeQ5a1zummJT-p65yN8mbSbJiUhPX8QgjDmsNfNbgPUryGprAl3xeBJjmXvFdHY=w544-h544-l90-rj"}
                albumTitle={"Coisas Naturais"}
                artistName={"Marina Sena"} 
                releaseYear={2025}
                albumType={"LP"}
                rating={5}
            /> 
            <AlbumCard 
                imgSrc={"https://lh3.googleusercontent.com/1s9bb9ZUUrSogYJ6229-Fey6LCaUX1o_nEyyVlmWyKC23OUdIC0rbVUWoemiK5Lh_q27wmbPu35Yx93p=w544-h544-l90-rj"}
                albumTitle={"msnz <Beyond Beauty>"}
                artistName={"tripleS"} 
                releaseYear={2025}
                albumType={"EP"}
                rating={4.5}
            /> 
            <AlbumCard 
                imgSrc={"https://lh3.googleusercontent.com/tRV6GVtvwrWTQ9BR5-SOlzwAd4KfDPlKLvrpkDzEn44-YEamlz3XsV7d-kke2frIshrEA_MpSPRnaTiv=w544-h544-l90-rj"}
                albumTitle={"SAWAYAMA"}
                artistName={"Rina Sawayama"} 
                releaseYear={2020}
                albumType={"LP"}
                rating={5}
            /> 
            <AlbumCard 
                imgSrc={"https://lh3.googleusercontent.com/dTpYWRisnoZ56BD2GCI_DblY8iJdhwAEg3IAlqbVfn0zBuZBNFBFmX8ZH-OwNV3Cq2k1zojPYcMVgz7e=w544-h544-l90-rj"}
                albumTitle={"Lux"}
                artistName={"Rosalia"} 
                releaseYear={2025}
                albumType={"LP"}
                rating={5}
            />                                     
        </div>
      </section>
    </div>
  )
}

export default HomePage
