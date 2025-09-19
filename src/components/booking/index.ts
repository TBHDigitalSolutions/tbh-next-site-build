// src/components/booking/index.ts

export { default as BookingModal } from "./BookingModal";
export { 
  openBookingModal, 
  closeBookingModal, 
  isBookingModalOpen 
} from "./modal";

export type { BookingModalProps } from "./BookingModal";
export type { OpenBookingModalOptions } from "./modal";

// Re-export for convenience
export type BookingModalOptions = import("./modal").OpenBookingModalOptions;