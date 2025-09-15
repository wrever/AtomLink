import { InfiniteSlider } from "./infinite-slider";
import logostellar from "../../img/carrouselimg/logostellar.webp";
import "../../css/partners-carousel.css";

function PartnersCarousel() {
  return (
    <div className="partners-carousel-root">
      <div className="partners-carousel-container">
        <div className="partners-carousel-header">
          <h2 className="partners-carousel-title">
            Trusted by Industry Leaders
          </h2>
          <p className="partners-carousel-description">
            Join the growing ecosystem of partners who trust AtomLink for their real-world asset tokenization needs.
          </p>
        </div>
        
        <div className="partners-carousel-slider-container">
          <InfiniteSlider 
            gap={88} 
            reverse 
            className="partners-carousel-slider"
            duration={60}
          >
            {/* Repetir las imágenes de partners varias veces para el efecto de carrusel */}
            <div className="partners-carousel-item">
              <img
                src={logostellar}
                alt="Stellar Partnership"
                className="partners-carousel-logo"
              />
            </div>
            <div className="partners-carousel-item">
              <img
                src={logostellar}
                alt="Stellar Partnership"
                className="partners-carousel-logo"
              />
            </div>
            <div className="partners-carousel-item">
              <img
                src={logostellar}
                alt="Stellar Partnership"
                className="partners-carousel-logo"
              />
            </div>
            <div className="partners-carousel-item">
              <img
                src={logostellar}
                alt="Stellar Partnership"
                className="partners-carousel-logo"
              />
            </div>
            <div className="partners-carousel-item">
              <img
                src={logostellar}
                alt="Stellar Partnership"
                className="partners-carousel-logo"
              />
            </div>
            <div className="partners-carousel-item">
              <img
                src={logostellar}
                alt="Stellar Partnership"
                className="partners-carousel-logo"
              />
            </div>
          </InfiniteSlider>
        </div>
      </div>
    </div>
  );
}

export default PartnersCarousel;
