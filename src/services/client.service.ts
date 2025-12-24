
import { Injectable, signal } from '@angular/core';

export interface Client {
    id: number;
    company_name: string;
    industry: string;
    status: 'Actif' | 'Inactif';
    account_type: 'Premium' | 'Standard' | 'Basique';
    primary_contact_name: string;
    email: string;
    phone: string;
    city: string;
    country: string;
    monthly_budget: number;
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private initialClients: Client[] = [
    { id: 1, company_name: 'Innovate Corp', industry: 'Tech', status: 'Actif', account_type: 'Premium', primary_contact_name: 'Jane Doe', email: 'jane.doe@innovate.com', phone: '555-0101', city: 'San Francisco', country: 'USA', monthly_budget: 5000 },
    { id: 2, company_name: 'Quantum Solutions', industry: 'Consulting', status: 'Actif', account_type: 'Standard', primary_contact_name: 'John Smith', email: 'john.s@quantum.co', phone: '555-0102', city: 'New York', country: 'USA', monthly_budget: 2500 },
    { id: 3, company_name: 'Stellar Goods', industry: 'E-commerce', status: 'Actif', account_type: 'Basique', primary_contact_name: 'Alice Johnson', email: 'alice@stellar.com', phone: '555-0103', city: 'London', country: 'UK', monthly_budget: 1000 },
    { id: 4, company_name: 'Apex Industries', industry: 'Manufacturing', status: 'Inactif', account_type: 'Standard', primary_contact_name: 'Robert Brown', email: 'r.brown@apex.io', phone: '555-0104', city: 'Berlin', country: 'Germany', monthly_budget: 3000 },
  ];
    
  clients = signal<Client[]>(this.initialClients);

  createEmptyClient(): Client {
    const nextId = this.clients().length > 0 ? Math.max(...this.clients().map(c => c.id)) + 1 : 1;
    return {
        id: nextId,
        company_name: '',
        industry: '',
        status: 'Actif',
        account_type: 'Basique',
        primary_contact_name: '',
        email: '',
        phone: '',
        city: '',
        country: '',
        monthly_budget: 0
    };
  }

  addClient(client: Client) {
    this.clients.update(clients => [...clients, client]);
  }

  updateClient(updatedClient: Client) {
    this.clients.update(clients => 
        clients.map(c => c.id === updatedClient.id ? updatedClient : c)
    );
  }

  deleteClient(clientId: number) {
    this.clients.update(clients => clients.filter(c => c.id !== clientId));
  }
}