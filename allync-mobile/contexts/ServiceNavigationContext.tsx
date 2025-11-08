import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SelectedServiceDetail {
  type: 'mobile-app' | 'website' | 'whatsapp';
  serviceId: string;
}

interface ServiceNavigationContextType {
  selectedServiceDetail: SelectedServiceDetail | null;
  setSelectedServiceDetail: (detail: SelectedServiceDetail | null) => void;
  navigateToService: (type: 'mobile-app' | 'website' | 'whatsapp', serviceId: string) => void;
}

const ServiceNavigationContext = createContext<ServiceNavigationContextType | undefined>(undefined);

export function ServiceNavigationProvider({ children }: { children: ReactNode }) {
  const [selectedServiceDetail, setSelectedServiceDetail] = useState<SelectedServiceDetail | null>(null);

  const navigateToService = (type: 'mobile-app' | 'website' | 'whatsapp', serviceId: string) => {
    setSelectedServiceDetail({ type, serviceId });
  };

  return (
    <ServiceNavigationContext.Provider
      value={{
        selectedServiceDetail,
        setSelectedServiceDetail,
        navigateToService,
      }}
    >
      {children}
    </ServiceNavigationContext.Provider>
  );
}

export function useServiceNavigation() {
  const context = useContext(ServiceNavigationContext);
  if (context === undefined) {
    throw new Error('useServiceNavigation must be used within a ServiceNavigationProvider');
  }
  return context;
}
