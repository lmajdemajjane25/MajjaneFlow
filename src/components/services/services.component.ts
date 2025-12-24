
import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigurationService } from '../../services/configuration.service';
import { ClientService } from '../../services/client.service';
import { Service, ServiceService } from '../../services/service.service';

@Component({
  selector: 'app-services',
  imports: [CommonModule],
  templateUrl: './services.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesComponent {
    private configService = inject(ConfigurationService);
    private clientService = inject(ClientService);
    private serviceService = inject(ServiceService);

    clients = this.clientService.clients;
    serviceTypes = this.configService.serviceTypes;
    providers = this.configService.providers;
    services = this.serviceService.services;

    searchTerm = signal('');

    getClientName(clientId: number): string {
      return this.clients().find(c => c.id === clientId)?.company_name || 'Client Inconnu';
    }

    filteredServices = computed(() => {
        const term = this.searchTerm().toLowerCase();
        if (!term) {
            return this.services();
        }
        return this.services().filter(service => {
            const clientName = this.getClientName(service.clientId).toLowerCase();
            return service.service_name.toLowerCase().includes(term) ||
            clientName.includes(term) ||
            service.type.toLowerCase().includes(term) ||
            service.provider.toLowerCase().includes(term)
        });
    });

    showServiceForm = signal(false);
    editingService = signal<Service | null>(null);
    currentService = signal<Service>(this.serviceService.createEmptyService());

    onSearch(event: Event) {
        this.searchTerm.set((event.target as HTMLInputElement).value);
    }

    getCurrencySymbol(currency: 'MAD' | 'EUR' | 'USD'): string {
        switch (currency) {
            case 'USD': return '$';
            case 'EUR': return '€';
            case 'MAD': return 'MAD';
            default: return '';
        }
    }

    addService() {
        this.editingService.set(null);
        this.currentService.set(this.serviceService.createEmptyService());
        this.showServiceForm.set(true);
    }

    editService(service: Service) {
        this.editingService.set(service);
        this.currentService.set(JSON.parse(JSON.stringify(service)));
        this.showServiceForm.set(true);
    }

    deleteService(serviceId: number) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
            this.serviceService.deleteService(serviceId);
        }
    }

    saveService() {
      const serviceToSave = this.currentService();
        if (this.editingService()) {
            this.serviceService.updateService(serviceToSave);
        } else {
            this.serviceService.addService(serviceToSave);
        }
        this.cancelServiceForm();
    }

    cancelServiceForm() {
        this.showServiceForm.set(false);
        this.editingService.set(null);
    }

    updateCurrentServiceField(field: keyof Service, event: Event) {
        const target = event.target as HTMLInputElement | HTMLSelectElement;
        let value: string | number | boolean;

        if (target.type === 'checkbox' || target.type === 'radio') {
            value = (target as HTMLInputElement).checked ? (target.type === 'radio' ? target.value : true) : false;
             if (target.type === 'radio') {
                value = target.value;
            }
        } else {
            value = target.value;
        }

        this.currentService.update(s => {
            const updatedService = { ...s };
            if (field === 'cost' || field === 'clientId') {
                (updatedService as any)[field] = +value;
            } else if (field === 'renewal_reminder') {
                 updatedService[field] = (target as HTMLInputElement).checked;
            }
            else {
                (updatedService as any)[field] = value;
            }
            return updatedService;
        });
    }
}