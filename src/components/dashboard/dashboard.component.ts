
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
    { title: 'Active Clients', value: '73', icon: 'users', gradient: 'from-blue-500 to-cyan-500' },
    { title: 'Active Services', value: '241', icon: 'server', gradient: 'from-emerald-500 to-teal-500' },
    { title: 'Running Projects', value: '18', icon: 'briefcase', gradient: 'from-violet-500 to-purple-500' },
    { title: 'Expiring Soon', value: '12', icon: 'clock', gradient: 'from-amber-500 to-orange-500', urgent: true },
  ];

  invoiceCards = [
    { title: 'Pending Invoices', value: '€12,450.00', count: '8 invoices', gradient: 'from-pink-500 to-rose-500' },
    { title: 'Overdue Invoices', value: '€3,800.00', count: '3 invoices', gradient: 'from-red-500 to-rose-600' },
  ];

  expiringServices = [
    { name: 'Domain Registration', client: 'Innovate Corp', daysLeft: 3 },
    { name: 'SSL Certificate', client: 'Quantum Solutions', daysLeft: 7 },
    { name: 'Web Hosting - Pro Plan', client: 'Stellar Goods', daysLeft: 15 },
    { name: 'Cloud Backup Service', client: 'Apex Industries', daysLeft: 28 },
  ];
  
  recentActivity = [
    { subject: 'Invoice #INV-007 paid', type: 'Payment', client: 'Quantum Solutions', time: '1h ago' },
    { subject: 'New project "Website Redesign" started', type: 'Project', client: 'Innovate Corp', time: '3h ago' },
    { subject: 'Client "Stellar Goods" added', type: 'Client', client: 'Stellar Goods', time: 'yesterday' },
    { subject: 'Service "SEO Package" renewed', type: 'Service', client: 'Apex Industries', time: 'yesterday' },
  ];
}
