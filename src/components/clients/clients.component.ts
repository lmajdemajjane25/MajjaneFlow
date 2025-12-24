
import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Client, ClientService } from '../../services/client.service';

@Component({
  selector: 'app-clients',
  imports: [CommonModule],
  templateUrl: './clients.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientsComponent {
    private clientService = inject(ClientService);
    
    clients = this.clientService.clients;
    viewMode = signal<'grid' | 'list'>('grid');
    searchTerm = signal('');

    activeClientsCount = computed(() => this.clients().filter(c => c.status === 'Actif').length);
    inactiveClientsCount = computed(() => this.clients().filter(c => c.status === 'Inactif').length);

    filteredClients = computed(() => {
        const term = this.searchTerm().toLowerCase();
        if (!term) {
            return this.clients();
        }
        return this.clients().filter(client =>
            client.company_name.toLowerCase().includes(term) ||
            client.primary_contact_name.toLowerCase().includes(term) ||
            client.email.toLowerCase().includes(term)
        );
    });
    
    showClientForm = signal(false);
    editingClient = signal<Client | null>(null);
    currentClient = signal<Client>(this.clientService.createEmptyClient());

    onSearch(event: Event) {
        this.searchTerm.set((event.target as HTMLInputElement).value);
    }
    
    addClient() {
        this.editingClient.set(null);
        this.currentClient.set(this.clientService.createEmptyClient());
        this.showClientForm.set(true);
    }

    editClient(client: Client) {
        this.editingClient.set(client);
        this.currentClient.set(JSON.parse(JSON.stringify(client)));
        this.showClientForm.set(true);
    }

    deleteClient(clientId: number) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
            this.clientService.deleteClient(clientId);
        }
    }

    saveClient() {
        if (this.editingClient()) {
            this.clientService.updateClient(this.currentClient());
        } else {
            this.clientService.addClient(this.currentClient());
        }
        this.cancelClientForm();
    }

    cancelClientForm() {
        this.showClientForm.set(false);
        this.editingClient.set(null);
    }

    updateCurrentClientField(field: keyof Client, event: Event) {
        const target = event.target as HTMLInputElement | HTMLSelectElement;
        const value = target.value;
        this.currentClient.update(c => {
            const updatedClient = { ...c };
            if (field === 'monthly_budget') {
                (updatedClient as any)[field] = +value;
            } else {
                (updatedClient as any)[field] = value;
            }
            return updatedClient;
        });
    }
}