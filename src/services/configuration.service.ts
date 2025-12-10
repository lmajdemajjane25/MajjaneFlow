import { Injectable, signal } from '@angular/core';

export interface ServiceType {
  id: number;
  name: string;
  description: string;
}

export interface Provider {
  id: number;
  name: string;
  website: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  private initialServiceTypes: ServiceType[] = [
    { id: 1, name: 'Hosting', description: 'Web hosting services' },
    { id: 2, name: 'Domain', description: 'Domain name registration' },
    { id: 3, name: 'SaaS', description: 'Software as a Service subscriptions' },
    { id: 4, name: 'Security', description: 'SSL certificates, firewalls, etc.' },
    { id: 5, name: 'Cloud', description: 'Cloud storage and computing services' },
  ];

  private initialProviders: Provider[] = [
      { id: 1, name: 'GoDaddy', website: 'https://godaddy.com' },
      { id: 2, name: 'Namecheap', website: 'https://namecheap.com' },
      { id: 3, name: 'Sectigo', website: 'https://sectigo.com' },
      { id: 4, name: 'Shopify', website: 'https://shopify.com' },
      { id: 5, name: 'AWS', website: 'https://aws.amazon.com' },
  ];

  serviceTypes = signal<ServiceType[]>(this.initialServiceTypes);
  providers = signal<Provider[]>(this.initialProviders);

  constructor() { }

  // --- Service Type Methods ---
  addType(type: Omit<ServiceType, 'id'>) {
    const nextId = this.serviceTypes().length > 0 ? Math.max(...this.serviceTypes().map(t => t.id)) + 1 : 1;
    this.serviceTypes.update(types => [...types, { id: nextId, ...type }]);
  }

  updateType(updatedType: ServiceType) {
    this.serviceTypes.update(types => types.map(t => t.id === updatedType.id ? updatedType : t));
  }

  deleteType(id: number) {
    this.serviceTypes.update(types => types.filter(t => t.id !== id));
  }

  // --- Provider Methods ---
  addProvider(provider: Omit<Provider, 'id'>) {
    const nextId = this.providers().length > 0 ? Math.max(...this.providers().map(p => p.id)) + 1 : 1;
    this.providers.update(providers => [...providers, { id: nextId, ...provider }]);
  }

  updateProvider(updatedProvider: Provider) {
    this.providers.update(providers => providers.map(p => p.id === updatedProvider.id ? updatedProvider : p));
  }

  deleteProvider(id: number) {
    this.providers.update(providers => providers.filter(p => p.id !== id));
  }
}