
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

export interface PaymentMethod {
  id: number;
  name: string;
}

export interface EmailNotificationRule {
  enabled: boolean;
  days: number[];
  subject: string;
  body: string;
  recipients: string;
}

export interface EmailNotificationSettings {
  upcomingRenewal: EmailNotificationRule;
  overdue: EmailNotificationRule;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  private initialServiceTypes: ServiceType[] = [
    { id: 1, name: 'Hébergement', description: 'Services d\'hébergement Web' },
    { id: 2, name: 'Domaine', description: 'Enregistrement de nom de domaine' },
    { id: 3, name: 'SaaS', description: 'Abonnements à des logiciels en tant que service' },
    { id: 4, name: 'Sécurité', description: 'Certificats SSL, pare-feu, etc.' },
    { id: 5, name: 'Cloud', description: 'Services de stockage et de calcul en cloud' },
  ];

  private initialProviders: Provider[] = [
      { id: 1, name: 'GoDaddy', website: 'https://godaddy.com' },
      { id: 2, name: 'Namecheap', website: 'https://namecheap.com' },
      { id: 3, name: 'Sectigo', website: 'https://sectigo.com' },
      { id: 4, name: 'Shopify', website: 'https://shopify.com' },
      { id: 5, name: 'AWS', website: 'https://aws.amazon.com' },
  ];

  private initialPaymentMethods: PaymentMethod[] = [
    { id: 1, name: 'Virement bancaire' },
    { id: 2, name: 'Carte de crédit' },
    { id: 3, name: 'Espèces' },
    { id: 4, name: 'PayPal' },
    { id: 5, name: 'Chèque' },
  ];
  
  private initialEmailSettings: EmailNotificationSettings = {
    upcomingRenewal: {
      enabled: true,
      days: [7, 15, 30],
      subject: 'Rappel : Votre facture [invoice_number] arrive à échéance',
      body: `Bonjour [client_name],\n\nCeci est un rappel que votre facture n° [invoice_number] d'un montant de [amount] arrivera à échéance le [renewal_date].\n\nCordialement,\nL'équipe de [company_name]`,
      recipients: '[client_email]'
    },
    overdue: {
      enabled: true,
      days: [1, 7],
      subject: 'Alerte : Votre facture [invoice_number] est en retard',
      body: `Bonjour [client_name],\n\nNous vous informons que votre facture n° [invoice_number] d'un montant de [amount], qui était due le [renewal_date], est maintenant en retard.\n\nVeuillez procéder au paiement dès que possible.\n\nCordialement,\nL'équipe de [company_name]`,
      recipients: '[client_email], relance@agence.com'
    }
  };

  serviceTypes = signal<ServiceType[]>(this.initialServiceTypes);
  providers = signal<Provider[]>(this.initialProviders);
  paymentMethods = signal<PaymentMethod[]>(this.initialPaymentMethods);
  emailSettings = signal<EmailNotificationSettings>(this.initialEmailSettings);

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

  // --- Payment Method Methods ---
  addPaymentMethod(method: Omit<PaymentMethod, 'id'>) {
    const nextId = this.paymentMethods().length > 0 ? Math.max(...this.paymentMethods().map(p => p.id)) + 1 : 1;
    this.paymentMethods.update(methods => [...methods, { id: nextId, ...method }]);
  }

  updatePaymentMethod(updatedMethod: PaymentMethod) {
    this.paymentMethods.update(methods => methods.map(m => m.id === updatedMethod.id ? updatedMethod : m));
  }

  deletePaymentMethod(id: number) {
    this.paymentMethods.update(methods => methods.filter(m => m.id !== id));
  }

  // --- Email Notification Methods ---
  updateEmailSettings(settings: EmailNotificationSettings) {
    this.emailSettings.set(settings);
  }
}