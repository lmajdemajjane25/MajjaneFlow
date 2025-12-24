
import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Client, ClientService } from '../../services/client.service';
import { Service, ServiceService } from '../../services/service.service';
import { ConfigurationService, EmailNotificationSettings } from '../../services/configuration.service';
import { EmailService } from '../../services/email.service';

// --- Interfaces ---
export interface LineItem {
  id: number;
  serviceId: number | null;
  description: string;
  quantity: number;
  unit_price: number;
  tva: number; // TVA en pourcentage, ex: 20
}

export interface Invoice {
  id: number;
  invoice_number: string;
  clientId: number;
  date: string;
  renewal_date: string;
  renouvellement: boolean;
  currency: 'EUR' | 'MAD' | 'USD';
  status: 'Payée' | 'En attente' | 'En retard' | 'Partiellement payée' | 'Annulée';
  payment_method: string;
  line_items: LineItem[];
  last_notification_sent: string | null;
}

export interface Payment {
  id: number;
  invoice_id: number;
  date: string;
  amount: number;
  method: string;
}

@Component({
  selector: 'app-comptabilite',
  imports: [CommonModule],
  templateUrl: './comptabilite.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComptabiliteComponent implements OnInit {
  private clientService = inject(ClientService);
  private serviceService = inject(ServiceService);
  private configService = inject(ConfigurationService);
  private emailService = inject(EmailService);

  activeTab = signal<'factures' | 'paiements' | 'depenses' | 'notifications'>('factures');

  // --- Services & Config ---
  clients = this.clientService.clients;
  services = this.serviceService.services;
  paymentMethods = this.configService.paymentMethods;

  // --- Invoice State ---
  invoices = signal<Invoice[]>([]);
  showInvoiceForm = signal(false);
  editingInvoice = signal<Invoice | null>(null);
  currentInvoice = signal<Invoice>(this.createEmptyInvoice());
  selectedInvoices = signal<Set<number>>(new Set());

  // --- Payment State ---
  payments = signal<Payment[]>([]);
  showPaymentForm = signal(false);
  editingPayment = signal<Payment | null>(null);
  currentPayment = signal<Omit<Payment, 'id'>>(this.createEmptyPayment());
  
  // --- Notification State ---
  localEmailSettings = signal<EmailNotificationSettings>(JSON.parse(JSON.stringify(this.configService.emailSettings())));
  availableNotificationDays = [1, 7, 15, 30];
  saveStatus = signal<'idle' | 'saving' | 'saved'>('idle');
  manualReportStatus = signal<'idle' | 'sending' | 'sent'>('idle');
  manualReportFeedback = signal<{type: 'success' | 'error' | 'info', message: string} | null>(null);

  servicesForSelectedClient = computed(() => {
    const clientId = this.currentInvoice().clientId;
    if (!clientId) {
      return [];
    }
    return this.services().filter(s => s.clientId === clientId);
  });

  // --- Invoice Filtering ---
  filterClient = signal<number | 'all'>('all');
  filterStatus = signal<string | 'all'>('all');
  filterStartDate = signal('');
  filterEndDate = signal('');

  filteredInvoices = computed(() => {
    return this.invoices().filter(invoice => {
      const clientMatch = this.filterClient() === 'all' || invoice.clientId === this.filterClient();
      const statusMatch = this.filterStatus() === 'all' || invoice.status === this.filterStatus();
      const startDate = this.filterStartDate();
      const endDate = this.filterEndDate();
      const dateMatch = (!startDate || invoice.date >= startDate) && (!endDate || invoice.date <= endDate);
      return clientMatch && statusMatch && dateMatch;
    });
  });
  
  areAllFilteredInvoicesSelected = computed(() => {
    const filteredIds = this.filteredInvoices().map(inv => inv.id);
    if (filteredIds.length === 0) return false;
    return filteredIds.every(id => this.selectedInvoices().has(id));
  });

  invoicesSummary = computed(() => {
    const filtered = this.filteredInvoices();
    const totalAmount = filtered.reduce((sum, inv) => sum + this.getInvoiceTotal(inv).totalWithTVA, 0);
    const totalPaid = filtered.reduce((sum, inv) => sum + this.getAmountPaidForInvoice(inv.id), 0);
    const overdueInvoices = filtered.filter(inv => inv.status === 'En retard' || (new Date(inv.renewal_date) < new Date() && inv.status !== 'Payée')).length;
    
    return {
      count: filtered.length,
      totalAmount: totalAmount,
      amountPaid: totalPaid,
      amountDue: totalAmount - totalPaid,
      overdueCount: overdueInvoices
    };
  });


  ngOnInit(): void {
    this.checkAndSendAutomaticNotifications();
  }

  // --- Methods ---
  createEmptyInvoice(): Invoice {
    return {
      id: Date.now(),
      invoice_number: `FAC-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      clientId: 0,
      date: new Date().toISOString().split('T')[0],
      renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      renouvellement: false,
      currency: 'EUR',
      status: 'En attente',
      payment_method: this.paymentMethods().length > 0 ? this.paymentMethods()[0].name : '',
      line_items: [],
      last_notification_sent: null,
    };
  }

  createEmptyPayment(): Omit<Payment, 'id'> {
      return {
          invoice_id: 0,
          date: new Date().toISOString().split('T')[0],
          amount: 0,
          method: ''
      };
  }
  
  getClientName(clientId: number): string {
    return this.clients().find(c => c.id === clientId)?.company_name || 'N/A';
  }

  getInvoiceNumber(invoiceId: number): string {
      return this.invoices().find(inv => inv.id === invoiceId)?.invoice_number || 'N/A';
  }

  getClientNameForInvoice(invoiceId: number): string {
      const invoice = this.invoices().find(inv => inv.id === invoiceId);
      return invoice ? this.getClientName(invoice.clientId) : 'N/A';
  }

  getCurrencySymbol(currency: 'EUR' | 'MAD' | 'USD'): string {
    switch (currency) {
        case 'EUR': return '€';
        case 'MAD': return 'MAD';
        case 'USD': return '$';
        default: return '€';
    }
  }

  getInvoiceTotal(invoice: Invoice) {
    const subTotal = invoice.line_items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    const tvaAmount = invoice.line_items.reduce((sum, item) => sum + (item.quantity * item.unit_price * (item.tva / 100)), 0);
    return {
        subTotal: subTotal,
        tvaAmount: tvaAmount,
        totalWithTVA: subTotal + tvaAmount,
    };
  }

  getAmountPaidForInvoice(invoiceId: number): number {
    return this.payments()
      .filter(p => p.invoice_id === invoiceId)
      .reduce((sum, p) => sum + p.amount, 0);
  }

  addInvoice() {
    this.editingInvoice.set(null);
    this.currentInvoice.set(this.createEmptyInvoice());
    this.showInvoiceForm.set(true);
  }

  editInvoice(invoice: Invoice) {
    this.editingInvoice.set(invoice);
    this.currentInvoice.set(JSON.parse(JSON.stringify(invoice)));
    this.showInvoiceForm.set(true);
  }

  saveInvoice() {
    if (this.editingInvoice()) {
      this.invoices.update(invs => invs.map(i => i.id === this.currentInvoice().id ? this.currentInvoice() : i));
    } else {
      this.invoices.update(invs => [...invs, this.currentInvoice()]);
    }
    this.cancelInvoiceForm();
  }
  
  cancelInvoiceForm() {
    this.showInvoiceForm.set(false);
  }

  // --- Deletion and Selection Methods ---
  deleteInvoice(invoiceId: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette facture ? Cette action est irréversible.')) {
      this.invoices.update(invoices => invoices.filter(inv => inv.id !== invoiceId));
      this.selectedInvoices.update(selected => {
          const newSet = new Set(selected);
          newSet.delete(invoiceId);
          return newSet;
      });
    }
  }

  deleteSelectedInvoices() {
    const selectedCount = this.selectedInvoices().size;
    if (selectedCount === 0) return;

    if (confirm(`Êtes-vous sûr de vouloir supprimer les ${selectedCount} factures sélectionnées ? Cette action est irréversible.`)) {
      this.invoices.update(invoices => 
        invoices.filter(inv => !this.selectedInvoices().has(inv.id))
      );
      this.selectedInvoices.set(new Set()); // Clear selection
    }
  }

  toggleInvoiceSelection(invoiceId: number, event: Event) {
    event.stopPropagation(); // Prevent row click events if any
    this.selectedInvoices.update(selected => {
      const newSet = new Set(selected);
      if (newSet.has(invoiceId)) {
        newSet.delete(invoiceId);
      } else {
        newSet.add(invoiceId);
      }
      return newSet;
    });
  }

  toggleSelectAll() {
    const allFilteredIds = this.filteredInvoices().map(inv => inv.id);
    const allSelected = this.areAllFilteredInvoicesSelected();

    if (allSelected) {
      this.selectedInvoices.update(selected => {
        const newSet = new Set(selected);
        allFilteredIds.forEach(id => newSet.delete(id));
        return newSet;
      });
    } else {
      this.selectedInvoices.update(selected => {
        const newSet = new Set(selected);
        allFilteredIds.forEach(id => newSet.add(id));
        return newSet;
      });
    }
  }

  // --- Payment Methods ---
  addPayment(invoiceId?: number) {
      this.editingPayment.set(null);
      const emptyPayment = this.createEmptyPayment();
      if (invoiceId) {
          const invoice = this.invoices().find(i => i.id === invoiceId);
          if (invoice) {
            emptyPayment.invoice_id = invoiceId;
            const total = this.getInvoiceTotal(invoice).totalWithTVA;
            const paid = this.getAmountPaidForInvoice(invoiceId);
            emptyPayment.amount = total - paid;
          }
      }
       if (this.paymentMethods().length > 0) {
        emptyPayment.method = this.paymentMethods()[0].name;
      }
      this.currentPayment.set(emptyPayment);
      this.showPaymentForm.set(true);
  }

  savePayment() {
    const paymentData = this.currentPayment();
    if (!paymentData.invoice_id || paymentData.amount <= 0 || !paymentData.method) {
        alert('Veuillez remplir tous les champs obligatoires.');
        return;
    }

    if (this.editingPayment()) {
      const paymentToUpdate: Payment = { id: this.editingPayment()!.id, ...paymentData };
      this.payments.update(p => p.map(pay => pay.id === paymentToUpdate.id ? paymentToUpdate : pay));
    } else {
      const newPayment: Payment = { id: Date.now(), ...paymentData };
      this.payments.update(p => [...p, newPayment]);
    }
    this.cancelPaymentForm();
  }

  cancelPaymentForm() {
      this.showPaymentForm.set(false);
      this.editingPayment.set(null);
  }

  deletePayment(paymentId: number) {
      if (confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) {
          this.payments.update(p => p.filter(pay => pay.id !== paymentId));
      }
  }

  updateCurrentPaymentField(field: keyof Omit<Payment, 'id'>, event: Event) {
      const target = event.target as HTMLInputElement | HTMLSelectElement;
      const value = target.value;
      this.currentPayment.update(p => {
          const updatedPayment = { ...p } as any;
          if (field === 'amount' || field === 'invoice_id') {
              updatedPayment[field] = +value;
          } else {
              updatedPayment[field] = value;
          }
          return updatedPayment;
      });
  }

  // --- Line Item Methods ---
  addLineItem() {
    this.currentInvoice.update(inv => {
      inv.line_items.push({ id: Date.now(), serviceId: null, description: '', quantity: 1, unit_price: 0, tva: 20 });
      return inv;
    });
  }

  removeLineItem(index: number) {
    this.currentInvoice.update(inv => {
      inv.line_items.splice(index, 1);
      return inv;
    });
  }
  
  onServiceSelected(itemIndex: number, event: Event) {
    const serviceIdStr = (event.target as HTMLSelectElement).value;
    const serviceId = serviceIdStr ? parseInt(serviceIdStr, 10) : null;

    this.currentInvoice.update(inv => {
        const lineItem = inv.line_items[itemIndex];
        lineItem.serviceId = serviceId;

        if (serviceId) {
            const service = this.services().find(s => s.id === serviceId);
            if (service) {
                lineItem.description = service.service_name;
                lineItem.unit_price = service.cost;
            }
        }
        return inv;
    });
  }

  updateLineItem(index: number, field: keyof LineItem, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.currentInvoice.update(inv => {
      const item = inv.line_items[index] as any;
      item[field] = (field === 'quantity' || field === 'unit_price' || field === 'tva') ? +value : value;
      return inv;
    });
  }

  updateInvoiceField(field: keyof Invoice, event: Event) {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    let value: string | number | boolean;

    if (target.type === 'checkbox') {
        value = (target as HTMLInputElement).checked;
    } else {
        value = target.value;
    }
  
    this.currentInvoice.update(inv => {
        const updatedInvoice = {...inv} as any;
        if(field === 'clientId') {
            updatedInvoice[field] = +value;
            updatedInvoice['line_items'] = [];
        } else {
            updatedInvoice[field] = value;
        }
        return updatedInvoice;
    })
  }

  // --- Email Notification Methods ---
  async checkAndSendAutomaticNotifications() {
    console.log('Vérification automatique des factures expirées...');
    const today = new Date().toISOString().split('T')[0];
    const overdueInvoices = this.invoices().filter(inv => 
        inv.renewal_date < today && 
        inv.status !== 'Payée' && 
        !inv.last_notification_sent // Only notify once automatically
    );

    if (overdueInvoices.length > 0) {
        console.log(`Détection de ${overdueInvoices.length} nouvelle(s) facture(s) expirée(s). Envoi des notifications...`);
        for (const invoice of overdueInvoices) {
            await this.sendOverdueInvoiceEmail(invoice);
        }
    }
  }

  async sendManualOverdueReport() {
    this.manualReportStatus.set('sending');
    this.manualReportFeedback.set(null);
    console.log('Envoi manuel du rapport des factures expirées...');
    const today = new Date().toISOString().split('T')[0];
    const overdueInvoices = this.invoices().filter(inv => inv.renewal_date < today && inv.status !== 'Payée');

    if (overdueInvoices.length === 0) {
        console.log('Aucune facture expirée à signaler.');
        this.manualReportFeedback.set({ type: 'info', message: 'Aucune facture expirée trouvée.' });
        this.manualReportStatus.set('idle');
        setTimeout(() => this.manualReportFeedback.set(null), 5000);
        return;
    }
    
    const sendPromises = overdueInvoices.map(invoice => this.sendOverdueInvoiceEmail(invoice, true));
    const results = await Promise.allSettled(sendPromises);

    const successfulSends = results.filter(r => r.status === 'fulfilled').length;
    const failedSends = results.filter(r => r.status === 'rejected').length;

    let message = '';
    let type: 'success' | 'error' = 'success';

    if (successfulSends > 0) {
        message += `${successfulSends} rappel(s) envoyé(s) avec succès. `;
    }
    if (failedSends > 0) {
        message += `${failedSends} envoi(s) en échec.`;
        type = 'error';
    }

    this.manualReportFeedback.set({ type, message: message.trim() });
    this.manualReportStatus.set('idle');
    setTimeout(() => this.manualReportFeedback.set(null), 5000);
  }

  private async sendOverdueInvoiceEmail(invoice: Invoice, forceSend = false) {
    const today = new Date().toISOString().split('T')[0];
    
    const client = this.clients().find(c => c.id === invoice.clientId);
    if (!client) {
        console.error(`Client non trouvé pour la facture #${invoice.invoice_number}`);
        return;
    }

    const settings = this.localEmailSettings().overdue;
    if (!settings.enabled) {
        console.log(`Notifications pour factures expirées désactivées. Pas d'envoi pour #${invoice.invoice_number}.`);
        return;
    }

    const replacements: { [key: string]: string } = {
        '\\[client_name\\]': client.company_name,
        '\\[client_email\\]': client.email,
        '\\[invoice_number\\]': invoice.invoice_number,
        '\\[renewal_date\\]': invoice.renewal_date,
        '\\[amount\\]': this.getInvoiceTotal(invoice).totalWithTVA.toFixed(2) + ' ' + this.getCurrencySymbol(invoice.currency),
        '\\[company_name\\]': 'MajjaneFlow'
    };

    let recipients = settings.recipients;
    let subject = settings.subject;
    let body = settings.body;

    for (const placeholder in replacements) {
        const regex = new RegExp(placeholder, 'g');
        recipients = recipients.replace(regex, replacements[placeholder]);
        subject = subject.replace(regex, replacements[placeholder]);
        body = body.replace(regex, replacements[placeholder]);
    }
    
    try {
      await this.emailService.sendEmail({ to: recipients, subject, body });
      console.log(`Tentative d'envoi d'e-mail pour la facture #${invoice.invoice_number} réussie.`);
      
      this.invoices.update(invoices => 
          invoices.map(inv => 
              inv.id === invoice.id ? { ...inv, last_notification_sent: today } : inv
          )
      );
    } catch (error) {
      console.error(`Échec de l'envoi de l'e-mail pour la facture #${invoice.invoice_number}:`, error);
      throw error;
    }
  }

  toggleNotificationDay(rule: 'upcomingRenewal' | 'overdue', day: number) {
    this.localEmailSettings.update(settings => {
      const currentDays = settings[rule].days;
      const dayIndex = currentDays.indexOf(day);

      if (dayIndex > -1) {
        currentDays.splice(dayIndex, 1);
      } else {
        currentDays.push(day);
        currentDays.sort((a, b) => a - b);
      }
      return { ...settings };
    });
  }

  updateEmailSettingField(rule: 'upcomingRenewal' | 'overdue', field: 'subject' | 'body' | 'enabled' | 'recipients', event: Event) {
      const target = event.target as HTMLInputElement | HTMLTextAreaElement;
      const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
      this.saveStatus.set('idle');
      this.localEmailSettings.update(settings => {
          (settings[rule] as any)[field] = value;
          return { ...settings };
      });
  }

  saveEmailSettings() {
    this.saveStatus.set('saving');
    this.configService.updateEmailSettings(this.localEmailSettings());
    setTimeout(() => this.saveStatus.set('saved'), 1000);
    setTimeout(() => this.saveStatus.set('idle'), 3000);
  }
}