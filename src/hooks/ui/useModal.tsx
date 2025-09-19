// src/hooks/ui/useModal.tsx

"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export type ModalType = string | null;

export interface ModalContextType {
  modalType: ModalType;
  modalProps: Record<string, any> | null;
  isOpen: boolean;
  openModal: (type: ModalType, props?: Record<string, any>) => void;
  closeModal: () => void;
  toggleModal: (type: ModalType, props?: Record<string, any>) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

/**
 * ModalProvider
 * Wrap this at the top level of your app (layout.tsx or _app.tsx)
 */
export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modalType, setModalType] = useState<ModalType>(null);
  const [modalProps, setModalProps] = useState<Record<string, any> | null>(null);

  const openModal = useCallback((type: ModalType, props: Record<string, any> = {}) => {
    setModalType(type);
    setModalProps(props);
  }, []);

  const closeModal = useCallback(() => {
    setModalType(null);
    setModalProps(null);
  }, []);

  const toggleModal = useCallback((type: ModalType, props: Record<string, any> = {}) => {
    if (modalType === type) {
      setModalType(null);
      setModalProps(null);
    } else {
      setModalType(type);
      setModalProps(props);
    }
  }, [modalType]);

  const value = useMemo(() => ({
    modalType,
    modalProps,
    isOpen: !!modalType,
    openModal,
    closeModal,
    toggleModal,
  }), [modalType, modalProps, openModal, closeModal, toggleModal]);

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};

/**
 * useModal
 * Access modal state and handlers in any component
 */
export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};

export default useModal;