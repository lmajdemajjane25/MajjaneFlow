import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientService, Client } from '../../services/client.service';
import { ServiceService, Service } from '../../services/service.service';
import { LanguageService } from '../../services/language.service';

// Interfaces
export interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  tva: number;
  serviceId?: number;
}

export interface Invoice {
  number: string;
  clientId: number;
  date: string;
  due_date: string;
  status: 'Paid' | 'Sent' | 'Overdue' | 'Draft' | 'Cancelled';
  line_items: LineItem[];
}

export interface Payment {
  id: number;
  invoice_number: string;
  client: string;
  payment_date: string;
  amount: number;
  payment_method: 'Credit Card' | 'Bank Transfer' | 'PayPal';
  transaction_id?: string;
}

export interface Expense {
    id: number;
    date: string;
    category: string;
    vendor: string;
    amount: number;
    payment_method: 'Credit Card' | 'Bank Transfer' | 'Cash';
    billable: boolean;
}

@Component({
  selector: 'app-accounting',
  imports: [CommonModule],
  templateUrl: './accounting.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountingComponent {
  private clientService = inject(ClientService);
  private serviceService = inject(ServiceService);
  public languageService = inject(LanguageService);

  activeTab = signal('invoices');
  clients = this.clientService.clients;

  // --- INVOICES ---
  private initialInvoices: Invoice[] = [
    { number: 'INV-001', clientId: 1, date: '2024-07-15', due_date: '2024-08-14', status: 'Paid', line_items: [{description: 'Web Development', quantity: 1, unit_price: 5000, tva: 20}] },
    { number: 'INV-002', clientId: 2, date: '2024-07-20', due_date: '2024-08-19', status: 'Sent', line_items: [{description: 'Consulting', quantity: 1, unit_price: 2500, tva: 20}] },
  ];
  invoices = signal<Invoice[]>(this.initialInvoices);

  showInvoiceForm = signal(false);
  editingInvoice = signal<Invoice | null>(null);
  currentInvoice = signal<Invoice>(this.createEmptyInvoice());
  
  currentInvoiceTotal = computed(() => {
    return this.getInvoiceTotal(this.currentInvoice());
  });

  availableServicesForClient = computed(() => {
    const selectedClientId = this.currentInvoice().clientId;
    if (!selectedClientId) return [];
    return this.serviceService.services().filter(s => s.clientId === selectedClientId);
  });

  selectTab(tab: string) {
    this.activeTab.set(tab);
  }

  getClientName(clientId: number): string {
    return this.clients().find(c => c.id === clientId)?.company_name || 'Unknown Client';
  }

  getInvoiceTotal(invoice: Invoice): number {
    return invoice.line_items.reduce((total, item) => {
        const itemTotal = item.quantity * item.unit_price;
        const tax = itemTotal * (item.tva / 100);
        return total + itemTotal + tax;
    }, 0);
  }

  private createEmptyInvoice(): Invoice {
    const nextId = this.invoices().length > 0 ? Math.max(...this.invoices().map(i => parseInt(i.number.split('-')[1]))) + 1 : 1;
    return {
      number: `INV-${String(nextId).padStart(3, '0')}`,
      clientId: 0,
      date: new Date().toISOString().split('T')[0],
      due_date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
      status: 'Draft',
      line_items: []
    };
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

  deleteInvoice(invoiceNumber: string) {
    if(confirm(`Are you sure you want to delete invoice ${invoiceNumber}?`)) {
      this.invoices.update(invoices => invoices.filter(inv => inv.number !== invoiceNumber));
    }
  }

  saveInvoice() {
    const invoiceToSave = this.currentInvoice();
    if (this.editingInvoice()) {
      this.invoices.update(invoices => 
        invoices.map(inv => inv.number === this.editingInvoice()!.number ? invoiceToSave : inv)
      );
    } else {
      this.invoices.update(invoices => [...invoices, invoiceToSave]);
    }
    this.cancelInvoiceForm();
  }

  cancelInvoiceForm() {
    this.showInvoiceForm.set(false);
    this.editingInvoice.set(null);
  }
  
  addServiceAsLineItem(serviceId: number) {
    const service = this.serviceService.services().find(s => s.id === serviceId);
    if (!service) return;

    const newLineItem: LineItem = {
      description: service.service_name,
      quantity: 1,
      unit_price: service.cost,
      tva: 0,
      serviceId: service.id,
    };

    this.currentInvoice.update(inv => ({
      ...inv,
      line_items: [...inv.line_items, newLineItem],
    }));
  }

  removeLineItem(index: number) {
    this.currentInvoice.update(inv => ({
        ...inv,
        line_items: inv.line_items.filter((_, i) => i !== index)
    }));
  }

  updateLineItem(index: number, field: keyof LineItem, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    const isNumber = field !== 'description';
    
    this.currentInvoice.update(inv => {
      const newLineItems = [...inv.line_items];
      newLineItems[index] = {
        ...newLineItems[index],
        [field]: isNumber ? +value : value,
      };
      return { ...inv, line_items: newLineItems };
    });
  }

  updateCurrentInvoiceField(field: keyof Omit<Invoice, 'line_items' | 'clientId'>, event: Event) {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    const value = target.value;
    this.currentInvoice.update(v => ({
      ...v,
      [field]: value
    }));
  }
  
  onClientChange(event: Event) {
    const clientId = +(event.target as HTMLSelectElement).value;
    this.currentInvoice.update(inv => ({
      ...this.createEmptyInvoice(), // Reset invoice when client changes
      number: inv.number, // Keep the generated number
      clientId: clientId
    }));
  }

  // --- PAYMENTS ---
  private initialPayments: Payment[] = [
      { id: 1, invoice_number: 'INV-001', client: 'Innovate Corp', payment_date: '2024-07-20', amount: 5000, payment_method: 'Bank Transfer' },
      { id: 2, invoice_number: 'INV-003', client: 'Stellar Goods', payment_date: '2024-07-12', amount: 500, payment_method: 'Credit Card', transaction_id: 'ch_12345' },
  ];
  payments = signal<Payment[]>(this.initialPayments);

  showPaymentForm = signal(false);
  editingPayment = signal<Payment | null>(null);
  currentPayment = signal<Payment>(this.createEmptyPayment());

  private createEmptyPayment(): Payment {
    return {
      id: this.payments().length > 0 ? Math.max(...this.payments().map(p => p.id)) + 1 : 1,
      invoice_number: '',
      client: '',
      payment_date: new Date().toISOString().split('T')[0],
      amount: 0,
      payment_method: 'Credit Card',
    };
  }

  addPayment() {
    this.editingPayment.set(null);
    this.currentPayment.set(this.createEmptyPayment());
    this.showPaymentForm.set(true);
  }

  editPayment(payment: Payment) {
    this.editingPayment.set(payment);
    this.currentPayment.set(JSON.parse(JSON.stringify(payment)));
    this.showPaymentForm.set(true);
  }

  deletePayment(paymentId: number) {
     if(confirm(`Are you sure you want to delete this payment?`)) {
      this.payments.update(payments => payments.filter(p => p.id !== paymentId));
    }
  }
  
  savePayment() {
    if (this.editingPayment()) {
      this.payments.update(payments => 
        payments.map(p => p.id === this.editingPayment()!.id ? this.currentPayment() : p)
      );
    } else {
      this.payments.update(payments => [...payments, this.currentPayment()]);
    }
    this.cancelPaymentForm();
  }
  
  cancelPaymentForm() {
    this.showPaymentForm.set(false);
    this.editingPayment.set(null);
  }

  updateCurrentPaymentField(field: keyof Payment, event: Event) {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    const value = target.value;
    this.currentPayment.update(p => {
        const updatedPayment = { ...p };
        if (field === 'amount' || field === 'id') {
            (updatedPayment as any)[field] = +value;
        } else {
            (updatedPayment as any)[field] = value;
        }
        return updatedPayment;
    });
  }

  // --- EXPENSES ---
  private initialExpenses: Expense[] = [
    { id: 1, date: '2024-07-10', category: 'Software', vendor: 'Adobe', amount: 150, payment_method: 'Credit Card', billable: true },
    { id: 2, date: '2024-07-12', category: 'Office Supplies', vendor: 'Amazon', amount: 75, payment_method: 'Credit Card', billable: false },
    { id: 3, date: '2024-07-18', category: 'Marketing', vendor: 'Google Ads', amount: 500, payment_method: 'Bank Transfer', billable: true },
  ];
  expenses = signal<Expense[]>(this.initialExpenses);

  showExpenseForm = signal(false);
  editingExpense = signal<Expense | null>(null);
  currentExpense = signal<Expense>(this.createEmptyExpense());

  private createEmptyExpense(): Expense {
    return {
        id: this.expenses().length > 0 ? Math.max(...this.expenses().map(e => e.id)) + 1 : 1,
        date: new Date().toISOString().split('T')[0],
        category: '',
        vendor: '',
        amount: 0,
        payment_method: 'Credit Card',
        billable: false,
    };
  }
  
  addExpense() {
    this.editingExpense.set(null);
    this.currentExpense.set(this.createEmptyExpense());
    this.showExpenseForm.set(true);
  }

  editExpense(expense: Expense) {
    this.editingExpense.set(expense);
    this.currentExpense.set(JSON.parse(JSON.stringify(expense)));
    this.showExpenseForm.set(true);
  }

  deleteExpense(expenseId: number) {
      if (confirm('Are you sure you want to delete this expense?')) {
          this.expenses.update(expenses => expenses.filter(e => e.id !== expenseId));
      }
  }

  saveExpense() {
    if (this.editingExpense()) {
        this.expenses.update(expenses => 
            expenses.map(e => e.id === this.editingExpense()!.id ? this.currentExpense() : e)
        );
    } else {
        this.expenses.update(expenses => [...expenses, this.currentExpense()]);
    }
    this.cancelExpenseForm();
  }

  cancelExpenseForm() {
    this.showExpenseForm.set(false);
    this.editingExpense.set(null);
  }

  updateCurrentExpenseField(field: keyof Expense, event: Event) {
    const target = event.target as HTMLInputElement;
    let value: string | number | boolean;
    
    if (target.type === 'checkbox') {
        value = target.checked;
    } else {
        value = target.value;
    }

    this.currentExpense.update(e => {
        const updatedExpense = { ...e };
        if (field === 'amount' || field === 'id') {
            (updatedExpense as any)[field] = +value;
        } else {
            (updatedExpense as any)[field] = value;
        }
        return updatedExpense;
    });
  }
}