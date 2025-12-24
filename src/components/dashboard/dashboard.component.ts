
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface StatCard {
  title: string;
  value: string;
  icon: string;
  gradient: string;
  urgent?: boolean;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  currentDate = new Date();

  statCards: StatCard[] = [
    { title: 'Clients Actifs', value: '73', icon: 'users', gradient: 'from-blue-500 to-cyan-500' },
    { title: 'Services Actifs', value: '241', icon: 'server', gradient: 'from-emerald-500 to-teal-500' },
    { title: 'Expire Bientôt', value: '12', icon: 'clock', gradient: 'from-amber-500 to-orange-500', urgent: true },
  ];

  private readonly EUR_TO_MAD = 10.80;

  invoiceCards = [
    { title: 'Factures en Attente', value: '€12,450.00', count: '8 factures', gradient: 'from-pink-500 to-rose-500' },
    { title: 'Factures en Retard', value: '€3,800.00', count: '3 factures', gradient: 'from-red-500 to-rose-600' },
  ].map(card => {
    const numericValue = parseFloat(card.value.replace('€', '').replace(/,/g, ''));
    const valueInMAD = numericValue * this.EUR_TO_MAD;
    return {
      ...card,
      value: `${new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(valueInMAD)} MAD`,
    };
  });

  expiringServices = [
    { name: 'Enregistrement de Domaine', client: 'Innovate Corp', daysLeft: 3 },
    { name: 'Certificat SSL', client: 'Quantum Solutions', daysLeft: 7 },
    { name: 'Hébergement Web - Plan Pro', client: 'Stellar Goods', daysLeft: 15 },
    { name: 'Service de Sauvegarde Cloud', client: 'Apex Industries', daysLeft: 28 },
  ];
  
  recentActivity = [
    { subject: 'Facture #INV-007 payée', type: 'Paiement', client: 'Quantum Solutions', time: 'il y a 1h' },
    { subject: 'Nouveau projet "Refonte du site Web" démarré', type: 'Projet', client: 'Innovate Corp', time: 'il y a 3h' },
    { subject: 'Client "Stellar Goods" ajouté', type: 'Client', client: 'Stellar Goods', time: 'hier' },
    { subject: 'Service "Forfait SEO" renouvelé', type: 'Service', client: 'Apex Industries', time: 'hier' },
  ];
}
