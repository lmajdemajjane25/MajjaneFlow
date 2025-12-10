import { Injectable, signal } from '@angular/core';

export type Language = 'en' | 'fr';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  language = signal<Language>('en');

  private translations: Record<Language, Record<string, string>> = {
    en: {
      'nav.dashboard': 'Dashboard',
      'nav.clients': 'Clients',
      'nav.services': 'Invoice Checking',
      'nav.projects': 'Projects',
      'nav.accounting': 'Accounting',
      'nav.reports': 'Reports',
      'nav.configuration': 'Configuration',
      'header.title': 'MajjaneFlow - Agency Hub',
      'premium.title': 'Premium Upgrade',
      'premium.desc': 'Unlock all features and get unlimited access to our support team.',
      'premium.button': 'Upgrade',
      'clients.title': 'Client Management',
      'clients.subtitle': 'Search, filter, and manage all your clients in one place.',
      'clients.add_button': 'Add Client',
      'services.title': 'Invoice Checking',
      'services.subtitle': 'Track all client services, renewals, and expiration dates.',
      'services.new_button': 'New Service',
      'projects.title': 'Project Management',
      'projects.subtitle': 'Keep track of project progress, budgets, and timelines.',
      'projects.add_button': 'Add Project',
      'accounting.title': 'Accounting',
      'accounting.subtitle': 'Manage invoices, payments, and expenses.',
      'reports.title': 'Reports',
      'reports.subtitle': 'Visual insights into your agency\'s performance.',
      'configuration.title': 'Configuration',
      'configuration.subtitle': 'Manage service types and providers.',
    },
    fr: {
      'nav.dashboard': 'Tableau de bord',
      'nav.clients': 'Clients',
      'nav.services': 'Pointage de Facture',
      'nav.projects': 'Projets',
      'nav.accounting': 'Comptabilité',
      'nav.reports': 'Rapports',
      'nav.configuration': 'Configuration',
      'header.title': 'MajjaneFlow - Hub d\'Agence',
      'premium.title': 'Passez à Premium',
      'premium.desc': 'Débloquez toutes les fonctionnalités et obtenez un accès illimité à notre équipe de support.',
      'premium.button': 'Mettre à niveau',
      'clients.title': 'Gestion des Clients',
      'clients.subtitle': 'Recherchez, filtrez et gérez tous vos clients en un seul endroit.',
      'clients.add_button': 'Ajouter un client',
      'services.title': 'Pointage de Facture',
      'services.subtitle': 'Suivez tous les services clients, les renouvellements et les dates d\'expiration.',
      'services.new_button': 'Nouveau Service',
      'projects.title': 'Gestion de Projets',
      'projects.subtitle': 'Suivez l\'avancement, les budgets et les échéanciers des projets.',
      'projects.add_button': 'Ajouter un Projet',
      'accounting.title': 'Comptabilité',
      'accounting.subtitle': 'Gérez les factures, les paiements et les dépenses.',
      'reports.title': 'Rapports',
      'reports.subtitle': 'Aperçus visuels des performances de votre agence.',
      'configuration.title': 'Configuration',
      'configuration.subtitle': 'Gérez les types de services et les fournisseurs.',
    }
  };

  toggleLanguage() {
    this.language.update(lang => lang === 'en' ? 'fr' : 'en');
  }

  translate(key: string): string {
    return this.translations[this.language()][key] || key;
  }
}
