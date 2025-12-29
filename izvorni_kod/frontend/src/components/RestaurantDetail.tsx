import { useState, useEffect, useRef } from "react";
import { useFavoritesContext } from "../contexts/FavoritesContext";
import { useAuthContext } from "../contexts/AuthContext";
import type { Event } from "../contexts/EventsContext";
import { api } from "../services/api";
import type { Restaurant } from "./RestaurantCard";
import "../css/RestaurantDetail.css";

export interface RestaurantDetails extends Restaurant {
   description?: string;
   email?: string;
   phone?: string;
   website?: string;
   workingHours?: WorkingHours;
   gallery?: string[];
   events?: Event[];
   reviews?: Review[];
}

export interface WorkingHours {
   monday?: string;
   tuesday?: string;
   wednesday?: string;
   thursday?: string;
   friday?: string;
   saturday?: string;
   sunday?: string;
}

export interface Review {
   id: number;
   userId: number;
   userName: string;
   rating: number;
   comment: string;
   createdAt: string;
}

interface RestaurantDetailProps {
   restaurant: Restaurant;
   isOpen: boolean;
   onClose: () => void;
}

// Mock data
const getMockRestaurantDetails = (restaurant: Restaurant): RestaurantDetails => {
   const mockWorkingHours: WorkingHours = {
      monday: "11:00 - 23:00",
      tuesday: "11:00 - 23:00",
      wednesday: "11:00 - 23:00",
      thursday: "11:00 - 23:00",
      friday: "11:00 - 00:00",
      saturday: "12:00 - 00:00",
      sunday: "12:00 - 23:00",
   };

   const mockEvents: Event[] = [
      {
         id: 1,
         restaurantId: restaurant.id,
         title: "Večer dalmatinske kuhinje",
         description: "Uživajte u specijalitetima dalmatinske kuhinje uz živu glazbu.",
         startDate: "2024-12-20T19:00:00Z",
         endDate: "2024-12-20T22:00:00Z",
      },
      {
         id: 2,
         restaurantId: restaurant.id,
         title: "Degustacija vina",
         description: "Isprobajte vrhunska hrvatska vina uz stručno vodstvo sommeliera.",
         startDate: "2025-01-15T18:00:00Z",
         endDate: "2025-01-15T21:00:00Z",
      },
   ];

   const mockReviews: Review[] = [
      {
         id: 1,
         userId: 1,
         userName: "Marko P.",
         rating: 5,
         comment: "Izvrsna hrana i usluga! Preporučujem svima koji vole autentičnu hrvatsku kuhinju.",
         createdAt: "2024-12-15T14:30:00Z",
      },
      {
         id: 2,
         userId: 2,
         userName: "Ana K.",
         rating: 4,
         comment: "Predivan ambijent i ukusna jela. Cijene su malo više, ali kvaliteta opravdava.",
         createdAt: "2024-12-10T18:45:00Z",
      },
      {
         id: 3,
         userId: 3,
         userName: "Ivan M.",
         rating: 5,
         comment: "Odlično mjesto za poslovne ručkove. Osoblje je ljubazno i profesionalno.",
         createdAt: "2024-12-05T12:00:00Z",
      },
   ];

   const mockGallery = [
      restaurant.imageUrl || "https://via.placeholder.com/400x300?text=Restaurant+1",
      "https://via.placeholder.com/400x300?text=Interior",
      "https://via.placeholder.com/400x300?text=Food+1",
      "https://via.placeholder.com/400x300?text=Food+2",
      "https://via.placeholder.com/400x300?text=Dining+Area",
      "https://via.placeholder.com/400x300?text=Restaurant+2",
   ];

   return {
      ...restaurant,
      description: `Autentičan dalmatinski restoran s tradicijom od 1985. godine. Nudimo specijalitete primorske kuhinje u lijepoj ambijentu s pogledom na Grad.`,
      email: "info@restoran.hr",
      phone: "+385 1 234 5678",
      website: "www.restoran.hr",
      workingHours: mockWorkingHours,
      gallery: mockGallery,
      events: mockEvents,
      reviews: mockReviews,
   };
};

function RestaurantDetail({ restaurant, isOpen, onClose }: RestaurantDetailProps) {
   const { isAuthenticated } = useAuthContext();
   const { toggleFavorite, isFavorite } = useFavoritesContext();

   const [details, setDetails] = useState<RestaurantDetails | null>(null);
   const [loading, setLoading] = useState(true);
   const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
   const [carouselIndex, setCarouselIndex] = useState(0);

   // Refs for swipe functionality
   const galleryRef = useRef<HTMLDivElement>(null);
   const touchStartX = useRef<number>(0);
   const touchEndX = useRef<number>(0);

   const isFav = isFavorite(restaurant.id);

   useEffect(() => {
      if (isOpen && restaurant) {
         setLoading(true);

         // Pokusaj dohvacanja preko API-ja
         const fetchDetails = async () => {
            try {
               const apiData = await api.getRestaurantById(restaurant.id);

               // RestaurantDetails format
               const mappedDetails: RestaurantDetails = {
                  id: apiData.id,
                  name: apiData.name || restaurant.name,
                  cuisine: apiData.role || apiData.cuisineType || restaurant.cuisine,
                  location: apiData.adress || apiData.city || restaurant.location,
                  rating: apiData.rating || restaurant.rating,
                  priceLevel: apiData.priceLevel || restaurant.priceLevel,
                  imageUrl: apiData.imageUrl || restaurant.imageUrl,
                  description: apiData.description,
                  email: apiData.email,
                  phone: apiData.phone,
                  website: apiData.website,
                  workingHours: apiData.workingHours ? parseWorkingHours(apiData.workingHours) : undefined,
                  gallery: apiData.gallery || [restaurant.imageUrl || "https://via.placeholder.com/400x300?text=Restaurant"],
                  events: apiData.events || [],
                  reviews: apiData.reviews || [],
               };

               // ako nema API onda mock data
               if (!mappedDetails.workingHours) {
                  mappedDetails.workingHours = getMockRestaurantDetails(restaurant).workingHours;
               }
               if (!mappedDetails.gallery || mappedDetails.gallery.length === 0) {
                  mappedDetails.gallery = getMockRestaurantDetails(restaurant).gallery;
               }
               if (!mappedDetails.events || mappedDetails.events.length === 0) {
                  mappedDetails.events = getMockRestaurantDetails(restaurant).events;
               }
               if (!mappedDetails.reviews || mappedDetails.reviews.length === 0) {
                  mappedDetails.reviews = getMockRestaurantDetails(restaurant).reviews;
               }
               if (!mappedDetails.description) {
                  mappedDetails.description = getMockRestaurantDetails(restaurant).description;
               }
               if (!mappedDetails.email) {
                  mappedDetails.email = getMockRestaurantDetails(restaurant).email;
               }
               if (!mappedDetails.phone) {
                  mappedDetails.phone = getMockRestaurantDetails(restaurant).phone;
               }

               setDetails(mappedDetails);
            } catch (error) {
               console.log('Using mock data for restaurant details');
               setDetails(getMockRestaurantDetails(restaurant));
            }

            setLoading(false);
         };

         fetchDetails();
      }
   }, [isOpen, restaurant]);

   // Helper function to parse working hours string to WorkingHours object
   const parseWorkingHours = (hoursString: string): WorkingHours | undefined => {
      // Simple parsing - in production this would be more robust
      if (!hoursString) return undefined;

      return {
         monday: hoursString,
         tuesday: hoursString,
         wednesday: hoursString,
         thursday: hoursString,
         friday: hoursString,
         saturday: hoursString,
         sunday: hoursString,
      };
   };

   useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
         if (e.key === "Escape") {
            onClose();
         }
      };

      if (isOpen) {
         document.addEventListener("keydown", handleEscape);
         document.body.style.overflow = "hidden";
      }

      return () => {
         document.removeEventListener("keydown", handleEscape);
         document.body.style.overflow = "unset";
      };
   }, [isOpen, onClose]);

   const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
         onClose();
      }
   };

   const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("hr-HR", {
         day: "numeric",
         month: "long",
         year: "numeric",
      });
   };

   const formatTime = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleTimeString("hr-HR", {
         hour: "2-digit",
         minute: "2-digit",
      });
   };

   const renderStars = (rating: number) => {
      const stars = [];
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 >= 0.5;

      for (let i = 0; i < 5; i++) {
         if (i < fullStars) {
            stars.push(<span key={i} className="star filled">★</span>);
         } else if (i === fullStars && hasHalfStar) {
            stars.push(<span key={i} className="star half">★</span>);
         } else {
            stars.push(<span key={i} className="star empty">☆</span>);
         }
      }
      return stars;
   };

   const getDayName = (day: string) => {
      const days: Record<string, string> = {
         monday: "Ponedjeljak",
         tuesday: "Utorak",
         wednesday: "Srijeda",
         thursday: "Četvrtak",
         friday: "Petak",
         saturday: "Subota",
         sunday: "Nedjelja",
      };
      return days[day] || day;
   };

   if (!isOpen) return null;

   return (
      <div className="restaurant-detail-backdrop" onClick={handleBackdropClick}>
         <div className="restaurant-detail-modal">
            <button className="close-btn" onClick={onClose} aria-label="Zatvori">
               ✕
            </button>

            {loading ? (
               <div className="detail-loading">Učitavanje...</div>
            ) : details ? (
               <div className="detail-content">
                  <div className="detail-header">
                     <div className="detail-header-image">
                        <img
                           src={details.imageUrl || "https://via.placeholder.com/400x300?text=Restaurant"}
                           alt={details.name}
                        />
                     </div>
                     <div className="detail-header-info">
                        <div className="detail-title-row">
                           <h1 className="detail-name">{details.name}</h1>
                           {isAuthenticated && (
                              <button
                                 className={`detail-favorite-btn ${isFav ? "favorited" : ""}`}
                                 onClick={() => toggleFavorite(details.id)}
                                 aria-label={isFav ? "Ukloni iz favorita" : "Dodaj u favorite"}
                              >
                                 ♥
                              </button>
                           )}
                        </div>
                        <div className="detail-rating">
                           <div className="stars">{renderStars(details.rating)}</div>
                           <span className="rating-value">{details.rating.toFixed(1)}</span>
                           <span className="rating-count">({details.reviews?.length || 0} recenzija)</span>
                        </div>
                        <p className="detail-cuisine">{details.cuisine}</p>
                        {details.description && (
                           <p className="detail-description">{details.description}</p>
                        )}
                     </div>
                  </div>

                  <div className="detail-section contact-section">
                     <div className="contact-grid">
                        {details.email && (
                           <div className="contact-item">
                              <span className="contact-icon">✉️</span>
                              <div className="contact-info">
                                 <span className="contact-label">Email</span>
                                 <a href={`mailto:${details.email}`} className="contact-value">
                                    {details.email}
                                 </a>
                              </div>
                           </div>
                        )}
                        {details.phone && (
                           <div className="contact-item">
                              <span className="contact-icon">📞</span>
                              <div className="contact-info">
                                 <span className="contact-label">Telefon</span>
                                 <a href={`tel:${details.phone}`} className="contact-value">
                                    {details.phone}
                                 </a>
                              </div>
                           </div>
                        )}
                        <div className="contact-item">
                           <span className="contact-icon">📍</span>
                           <div className="contact-info">
                              <span className="contact-label">Adresa</span>
                              <span className="contact-value">{details.location}</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {details.gallery && details.gallery.length > 0 && (
                     <div className="detail-section">
                        <h2 className="section-title">Galerija</h2>
                        {details.gallery.length > 4 ? (
                           // Carousel view za vise od 4 slike
                           <div className="gallery-carousel-container">
                              <button
                                 className="carousel-btn carousel-btn-left"
                                 onClick={() => setCarouselIndex(prev => {
                                    const maxIndex = details.gallery!.length - 4;
                                    return prev === 0 ? maxIndex : prev - 1;
                                 })}
                              >
                                 ‹
                              </button>
                              <div
                                 className="gallery-carousel"
                                 ref={galleryRef}
                                 onTouchStart={(e) => {
                                    touchStartX.current = e.touches[0].clientX;
                                 }}
                                 onTouchMove={(e) => {
                                    touchEndX.current = e.touches[0].clientX;
                                 }}
                                 onTouchEnd={() => {
                                    const diff = touchStartX.current - touchEndX.current;
                                    const maxIndex = details.gallery!.length - 4;
                                    if (diff > 50) {
                                       // Swipe left 
                                       setCarouselIndex(prev => prev >= maxIndex ? 0 : prev + 1);
                                    } else if (diff < -50) {
                                       // Swipe right 
                                       setCarouselIndex(prev => prev === 0 ? maxIndex : prev - 1);
                                    }
                                 }}
                              >
                                 <div
                                    className="gallery-carousel-track"
                                    style={{ transform: `translateX(-${carouselIndex * 192.75}px)` }}
                                 >
                                    {details.gallery.map((image, index) => (
                                       <div
                                          key={index}
                                          className={`gallery-carousel-item ${activeGalleryIndex === index ? "active" : ""}`}
                                          onClick={() => setActiveGalleryIndex(index)}
                                       >
                                          <img src={image} alt={`${details.name} - slika ${index + 1}`} />
                                       </div>
                                    ))}
                                 </div>
                              </div>
                              <button
                                 className="carousel-btn carousel-btn-right"
                                 onClick={() => setCarouselIndex(prev => {
                                    const maxIndex = details.gallery!.length - 4;
                                    return prev >= maxIndex ? 0 : prev + 1;
                                 })}
                              >
                                 ›
                              </button>
                           </div>
                        ) : (
                           // Za 4 ili manje slika
                           <div className="gallery-container">
                              <div className="gallery-grid">
                                 {details.gallery.map((image, index) => (
                                    <div
                                       key={index}
                                       className={`gallery-item ${activeGalleryIndex === index ? "active" : ""}`}
                                       onClick={() => setActiveGalleryIndex(index)}
                                    >
                                       <img src={image} alt={`${details.name} - slika ${index + 1}`} />
                                    </div>
                                 ))}
                              </div>
                           </div>
                        )}
                        {details.gallery.length > 4 && (
                           <div className="carousel-indicators">
                              {Array.from({ length: details.gallery.length - 3 }).map((_, index) => (
                                 <button
                                    key={index}
                                    className={`carousel-dot ${carouselIndex === index ? "active" : ""}`}
                                    onClick={() => setCarouselIndex(index)}
                                    aria-label={`Pozicija ${index + 1}`}
                                 />
                              ))}
                           </div>
                        )}
                     </div>
                  )}

                  {details.workingHours && (
                     <div className="detail-section">
                        <h2 className="section-title">Radno vrijeme</h2>
                        <div className="working-hours-grid">
                           {Object.entries(details.workingHours).map(([day, hours]) => (
                              <div key={day} className="working-hours-item">
                                 <span className="day-name">{getDayName(day)}</span>
                                 <span className="day-hours">{hours || "Zatvoreno"}</span>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

                  {details.events && details.events.length > 0 && (
                     <div className="detail-section">
                        <h2 className="section-title">Nadolazeći događaji</h2>
                        <div className="events-list">
                           {details.events.map((event) => (
                              <div key={event.id} className="event-item">
                                 <div className="event-indicator"></div>
                                 <div className="event-content">
                                    <h3 className="event-title">{event.title}</h3>
                                    <div className="event-date">
                                       <span className="event-icon">📅</span>
                                       {formatDate(event.startDate)}
                                       <span className="event-icon">🕐</span>
                                       {formatTime(event.startDate)}
                                    </div>
                                    {event.description && (
                                       <p className="event-description">{event.description}</p>
                                    )}
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

                  {details.reviews && details.reviews.length > 0 && (
                     <div className="detail-section">
                        <h2 className="section-title">Ocjene i mišljenja</h2>
                        <div className="reviews-list">
                           {details.reviews.map((review) => (
                              <div key={review.id} className="review-item">
                                 <div className="review-header">
                                    <div className="reviewer-info">
                                       <div className="reviewer-avatar">
                                          {review.userName.charAt(0).toUpperCase()}
                                       </div>
                                       <span className="reviewer-name">{review.userName}</span>
                                    </div>
                                    <div className="review-rating">
                                       {renderStars(review.rating)}
                                    </div>
                                 </div>
                                 <p className="review-comment">{review.comment}</p>
                                 <span className="review-date">{formatDate(review.createdAt)}</span>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}
               </div>
            ) : (
               <div className="detail-error">Nije moguće učitati podatke o restoranu.</div>
            )}
         </div>
      </div>
   );
}

export default RestaurantDetail;
