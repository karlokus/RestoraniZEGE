import { useState, useEffect, useRef } from "react";
import { useFavoritesContext } from "../contexts/FavoritesContext";
import { useAuthContext } from "../contexts/AuthContext";
import { api } from "../services/api";
import type { Restaurant } from "./RestaurantCard";
import type { Comment as ApiComment, Rating as ApiRating, RestaurantPhoto, Event as ApiEvent } from "../services/api";
import "../css/RestaurantDetail.css";

export interface RestaurantDetails extends Restaurant {
   description?: string;
   email?: string;
   phone?: string;
   website?: string;
   workingHours?: WorkingHours;
   gallery?: string[];
   events?: EventDisplay[];
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

export interface EventDisplay {
   id: string;
   restaurantId: number;
   title: string;
   description: string;
   eventDate: string;
   imageUrl?: string;
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

function RestaurantDetail({ restaurant, isOpen, onClose }: RestaurantDetailProps) {
   const { isAuthenticated } = useAuthContext();
   const { toggleFavorite, isFavorite } = useFavoritesContext();

   const [details, setDetails] = useState<RestaurantDetails | null>(null);
   const [loading, setLoading] = useState(true);
   const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
   const [carouselIndex, setCarouselIndex] = useState(0);
   const [refreshTrigger, setRefreshTrigger] = useState(0); // Za refreshanje podataka

   // State za recenziju (ocjena + komentar)
   const [newComment, setNewComment] = useState("");
   const [newRating, setNewRating] = useState(0);
   const [hoverRating, setHoverRating] = useState(0);
   const [submittingRating, setSubmittingRating] = useState(false);

   // Refs for swipe functionality
   const galleryRef = useRef<HTMLDivElement>(null);
   const touchStartX = useRef<number>(0);
   const touchEndX = useRef<number>(0);

   const isFav = isFavorite(restaurant.id);

   useEffect(() => {
      if (!isOpen || !restaurant) return;

      const fetchRestaurantDetails = async () => {
         setLoading(true);
         try {
            // Dohvati osnovne podatke restorana
            const restaurantData = await api.getRestaurantById(restaurant.id);

            // Dohvati slike, komentare, ocjene i događaje paralelno
            const [photos, comments, ratings, events] = await Promise.all([
               api.getPhotosByRestaurant(restaurant.id).catch(() => []),
               api.getCommentsByRestaurant(restaurant.id).catch(() => []),
               api.getRatingsByRestaurant(restaurant.id).catch(() => []),
               fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/events?restaurantId=${restaurant.id}`)
                  .then(res => res.ok ? res.json() : [])
                  .catch(() => []),
            ]);

            // Mapiraj komentare i ocjene u Reviews format
            const reviews: Review[] = comments.map((comment: ApiComment) => ({
               id: comment.id,
               userId: comment.userId,
               userName: comment.user 
                  ? `${comment.user.firstName} ${comment.user.lastName}`.trim() 
                  : `Korisnik ${comment.userId}`,
               rating: 0, // Komentari nemaju rating
               comment: comment.content,
               createdAt: comment.createdAt,
            }));

            // Ako imamo ratings, dodaj ih kao reviews s ocjenom
            const ratingsAsReviews: Review[] = ratings.map((rating: ApiRating) => ({
               id: rating.id + 10000, // Offset da izbjegnemo duplikate ID-a
               userId: rating.userId,
               userName: rating.user 
                  ? `${rating.user.firstName} ${rating.user.lastName}`.trim() 
                  : `Korisnik ${rating.userId}`,
               rating: rating.rating,
               comment: rating.comment || "",
               createdAt: rating.createdAt,
            }));

            // Kombiniraj komentare i ocjene, sortiraj po datumu
            const allReviews = [...reviews, ...ratingsAsReviews]
               .filter(r => r.comment || r.rating > 0) // Filtriraj prazne
               .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            // Mapiraj slike u gallery
            const gallery = photos.length > 0 
               ? photos.map((p: RestaurantPhoto) => p.photoUrl)
               : [restaurant.imageUrl || "https://via.placeholder.com/400x300?text=Restaurant"];


            // Mapiraj events
            const eventsList: EventDisplay[] = events.map((e: ApiEvent) => ({
               id: e.id,
               restaurantId: e.restaurantId,
               title: e.title,
               description: e.description,
               eventDate: e.eventDate,
               imageUrl: e.imageUrl,
            }));

            // Parse working hours
            const workingHours = parseWorkingHours(restaurantData.workingHours);

            const mappedDetails: RestaurantDetails = {
               id: restaurantData.id,
               name: restaurantData.name || restaurant.name,
               cuisine: restaurantData.cuisineType || restaurant.cuisine,
               location: restaurantData.adress 
                  ? `${restaurantData.adress}${restaurantData.city ? ', ' + restaurantData.city : ''}`
                  : restaurant.location,
               rating: restaurantData.averageRating || restaurant.rating,
               priceLevel: restaurant.priceLevel,
               imageUrl: photos.find((p: RestaurantPhoto) => p.isPrimary)?.photoUrl || photos[0]?.photoUrl || restaurant.imageUrl,
               description: restaurantData.description,
               email: restaurantData.email,
               phone: restaurantData.phone,
               website: restaurantData.website,
               workingHours: workingHours,
               gallery: gallery,
               events: eventsList,
               reviews: allReviews,
            };

            setDetails(mappedDetails);
         } catch (error) {
            console.error('Failed to fetch restaurant details:', error);
            // Fallback na osnovne podatke
            setDetails({
               ...restaurant,
               gallery: [restaurant.imageUrl || "https://via.placeholder.com/400x300?text=Restaurant"],
               events: [],
               reviews: [],
            });
         } finally {
            setLoading(false);
         }
      };

      fetchRestaurantDetails();
   }, [isOpen, restaurant.id, refreshTrigger]); // Dodaj refreshTrigger u dependencies

   // Helper function to parse working hours string to WorkingHours object
   const parseWorkingHours = (hoursString?: string): WorkingHours | undefined => {
      if (!hoursString) return undefined;

      // Pokušaj parsirati JSON format
      try {
         const parsed = JSON.parse(hoursString);
         if (typeof parsed === 'object') {
            return parsed as WorkingHours;
         }
      } catch {
         // Nije JSON, koristi string za sve dane
      }

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

   // Submit novu ocjenu (s opcionalnim komentarom)
   const handleSubmitReview = async () => {
      if (newRating === 0 || !isAuthenticated) return;

      setSubmittingRating(true);
      try {
         await api.createRating({
            restaurantId: restaurant.id,
            rating: Math.round(newRating),
            ...(newComment.trim() && { comment: newComment.trim() }),
         });
         setNewRating(0);
         setNewComment("");
         setRefreshTrigger(prev => prev + 1);
         alert('Ocjena uspješno dodana!');
      } catch (error: any) {
         console.error('Failed to submit review:', error);
         if (error.message?.includes('already')) {
            alert('Već ste ocijenili ovaj restoran.');
         } else {
            alert('Nije moguće dodati ocjenu. Pokušajte ponovo.');
         }
      } finally {
         setSubmittingRating(false);
      }
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
                           <div className="stars">{renderStars(Number(details.rating) || 0)}</div>
                           <span className="rating-value">{(Number(details.rating) || 0).toFixed(1)}</span>
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
                                       {formatDate(event.eventDate)}
                                       <span className="event-icon">🕐</span>
                                       {formatTime(event.eventDate)}
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
                                    {review.rating > 0 && (
                                       <div className="review-rating">
                                          {renderStars(review.rating)}
                                       </div>
                                    )}
                                 </div>
                                 {review.comment && <p className="review-comment">{review.comment}</p>}
                                 <span className="review-date">{formatDate(review.createdAt)}</span>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

                  {/* Sekcija za dodavanje ocjene i komentara */}
                  {isAuthenticated && (
                     <div className="detail-section">
                        <h2 className="section-title">Ostavite svoju recenziju</h2>
                        
                        {/* Combined rating and comment input */}
                        <div className="add-review">
                           <div className="rating-row">
                              <span className="rating-label">Vaša ocjena:</span>
                              <div className="star-input">
                                 {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                       key={star}
                                       type="button"
                                       className={`star-btn ${(hoverRating || newRating) >= star ? 'filled' : ''}`}
                                       onMouseEnter={() => setHoverRating(star)}
                                       onMouseLeave={() => setHoverRating(0)}
                                       onClick={() => setNewRating(star)}
                                    >
                                       ★
                                    </button>
                                 ))}
                              </div>
                           </div>
                           
                           <textarea
                              className="comment-input"
                              placeholder="Napišite svoj komentar o restoranu (opciono)..."
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              rows={4}
                           />
                           
                           {newRating > 0 && (
                              <button 
                                 className="submit-review-btn"
                                 onClick={handleSubmitReview}
                                 disabled={submittingRating}
                              >
                                 {submittingRating ? 'Šaljem...' : 'Objavi recenziju'}
                              </button>
                           )}
                        </div>
                     </div>
                  )}

                  {!isAuthenticated && (
                     <div className="detail-section login-prompt">
                        <p>
                           <a href="/login">Prijavite se</a> kako biste mogli ostaviti ocjenu ili komentar.
                        </p>
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
