"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Modal } from 'flowbite';
interface InvoiceTypeModalContextType {
    modalInvoiceType: Modal | null;
    showModal: () => void;
    hideModal: () => void;
  }
  
  const InvoiceTypeModalContext = createContext<InvoiceTypeModalContextType | undefined>(undefined);
  
  export function InvoiceTypeModalProvider({ children }: { children: React.ReactNode }) {
    const [modalInvoiceType, setModalInvoiceType] = useState<Modal | null>(null);
  
    useEffect(() => {
      const $modalElement = document.getElementById('invoice-type-modal');
      if ($modalElement) {
        setModalInvoiceType(new Modal($modalElement));
      }
    }, []);
  
    const showModal = () => modalInvoiceType?.show();
    const hideModal = () => modalInvoiceType?.hide();
  
    return (
      <InvoiceTypeModalContext.Provider value={{ modalInvoiceType, showModal, hideModal }}>
        {children}
      </InvoiceTypeModalContext.Provider>
    );
  }
  export function useInvoiceTypeModal() {
    const context = useContext(InvoiceTypeModalContext);
    if (context === undefined) {
      throw new Error('useInvoiceTypeModal must be used within a InvoiceTypeModalProvider');
    }
    return context;
  }