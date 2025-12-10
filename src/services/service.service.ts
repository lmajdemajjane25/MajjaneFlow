import { Injectable, signal } from '@angular/core';

export interface Service {
  id: number;
  clientId: number;
  service_name: string;
  type: string;
  provider: string;
  status: 'Active' | 'Pending Renewal' | 'Expired' | 'Cancelled';
  start_date: string;
  expiration_date: string;
  cost: number;
  currency: 'USD' | 'EUR' | 'MAD';
  billing_cycle: 'Monthly' | 'Quarterly' | 'Annually' | 'One-time';
  renewal_type: 'Manual' | 'Auto-Renew';
  priority: 'Low' | 'Medium' | 'High';
  technical_contact: string;
  renewal_reminder: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  private initialServices: Service[] = [
    { id: 1, service_name: 'Pro Web Hosting', clientId: 1, type: 'Hosting', provider: 'GoDaddy', expiration_date: this.getDateInFuture(5), status: 'Active', cost: 299, currency: 'USD', start_date: '2023-01-01', billing_cycle: 'Annually', renewal_type: 'Auto-Renew', priority: 'High', technical_contact: 'tech@innovate.com', renewal_reminder: true },
    { id: 2, service_name: 'Domain innovacorp.com', clientId: 1, type: 'Domain', provider: 'Namecheap', expiration_date: this.getDateInFuture(12), status: 'Active', cost: 15, currency: 'USD', start_date: '2023-01-15', billing_cycle: 'Annually', renewal_type: 'Manual', priority: 'Medium', technical_contact: '', renewal_reminder: true },
    { id: 3, service_name: 'Quantum SSL', clientId: 2, type: 'Security', provider: 'Sectigo', expiration_date: this.getDateInFuture(25), status: 'Active', cost: 75, currency: 'EUR', start_date: '2023-02-01', billing_cycle: 'Annually', renewal_type: 'Manual', priority: 'High', technical_contact: 'ops@quantum.co', renewal_reminder: true },
  ];
  services = signal<Service[]>(this.initialServices);

  createEmptyService(): Service {
    const nextId = this.services().length > 0 ? Math.max(...this.services().map(s => s.id)) + 1 : 1;
    return {
        id: nextId,
        clientId: 0,
        service_name: '',
        type: '',
        provider: '',
        status: 'Active',
        start_date: new Date().toISOString().split('T')[0],
        expiration_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        cost: 0,
        currency: 'USD',
        billing_cycle: 'Annually',
        renewal_type: 'Manual',
        priority: 'Medium',
        technical_contact: '',
        renewal_reminder: true
    };
  }

  addService(service: Service) {
    const nextId = this.services().length > 0 ? Math.max(...this.services().map(s => s.id)) + 1 : 1;
    this.services.update(services => [...services, { ...service, id: nextId }]);
  }

  updateService(updatedService: Service) {
    this.services.update(services => 
        services.map(s => s.id === updatedService.id ? updatedService : s)
    );
  }

  deleteService(serviceId: number) {
    this.services.update(services => services.filter(s => s.id !== serviceId));
  }
  
  private getDateInFuture(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }
}
