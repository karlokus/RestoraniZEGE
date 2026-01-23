import { useEffect, useRef } from "react";
import "../css/Pagination.css";

interface PaginationProps {
   currentPage: number;
   totalPages: number;
   onPageChange: (page: number) => void;
   totalItems?: number;
   itemsPerPage?: number;
   showItemsInfo?: boolean;
}

function Pagination({
   currentPage,
   totalPages,
   onPageChange,
   totalItems,
   itemsPerPage,
   showItemsInfo = true
}: PaginationProps) {
   const isFirstRender = useRef(true);
   const prevPage = useRef(currentPage);

   // ne prikazuj paginaciju ako nema stranica
   if (totalPages <= 1) {
      return null;
   }

   // Scroll na vrh kad se stranica promijeni
   useEffect(() => {
      // preskoči prvi render
      if (isFirstRender.current) {
         isFirstRender.current = false;
         prevPage.current = currentPage;
         return;
      }

      // Samo ako se stranica stvarno promijenila
      if (prevPage.current !== currentPage) {
         prevPage.current = currentPage;
         
         // Mali delay da se DOM ažurira
         setTimeout(() => {
            window.scrollTo({
               top: 0,
               behavior: 'smooth'
            });
         }, 50);
      }
   }, [currentPage]);

   // Promjena stranice
   const handlePageChange = (page: number) => {
      if (page !== currentPage) {
         onPageChange(page);
      }
   };

   // Generiraj array brojeva stranica za prikaz
   const getPageNumbers = (): (number | string)[] => {
      const pages: (number | string)[] = [];
      const maxVisiblePages = 5;

      if (totalPages <= maxVisiblePages + 2) {
         // Prikaži sve stranice ako ih ima malo
         for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
         }
      } else {
         // Uvijek prikaži prvu stranicu
         pages.push(1);

         if (currentPage > 3) {
            pages.push('...');
         }

         // Prikaži stranice oko trenutne
         const start = Math.max(2, currentPage - 1);
         const end = Math.min(totalPages - 1, currentPage + 1);

         for (let i = start; i <= end; i++) {
            pages.push(i);
         }

         if (currentPage < totalPages - 2) {
            pages.push('...');
         }

         // Uvijek prikaži zadnju stranicu
         pages.push(totalPages);
      }

      return pages;
   };

   const handlePrevious = () => {
      if (currentPage > 1) {
         handlePageChange(currentPage - 1);
      }
   };

   const handleNext = () => {
      if (currentPage < totalPages) {
         handlePageChange(currentPage + 1);
      }
   };

   // Izračunaj raspon stavki
   const startItem = totalItems && itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : 0;
   const endItem = totalItems && itemsPerPage ? Math.min(currentPage * itemsPerPage, totalItems) : 0;

   return (
      <div className="pagination-container">
         {showItemsInfo && totalItems && itemsPerPage && (
            <div className="pagination-info">
               Prikazano {startItem}–{endItem} od {totalItems} restorana
            </div>
         )}
         
         <div className="pagination">
            <button
               className="pagination-btn pagination-prev"
               onClick={handlePrevious}
               disabled={currentPage === 1}
               aria-label="Prethodna stranica"
            >
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
               </svg>
               <span>Prethodna</span>
            </button>

            <div className="pagination-pages">
               {getPageNumbers().map((page, index) => (
                  typeof page === 'number' ? (
                     <button
                        key={index}
                        className={`pagination-btn pagination-number ${currentPage === page ? 'active' : ''}`}
                        onClick={() => handlePageChange(page)}
                        aria-label={`Stranica ${page}`}
                        aria-current={currentPage === page ? 'page' : undefined}
                     >
                        {page}
                     </button>
                  ) : (
                     <span key={index} className="pagination-ellipsis">
                        •••
                     </span>
                  )
               ))}
            </div>

            <button
               className="pagination-btn pagination-next"
               onClick={handleNext}
               disabled={currentPage === totalPages}
               aria-label="Sljedeća stranica"
            >
               <span>Sljedeća</span>
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
               </svg>
            </button>
         </div>
      </div>
   );
}

export default Pagination;
