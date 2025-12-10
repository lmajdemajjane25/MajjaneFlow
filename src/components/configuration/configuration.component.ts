import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigurationService, ServiceType, Provider } from '../../services/configuration.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-configuration',
  imports: [CommonModule],
  templateUrl: './configuration.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfigurationComponent {
  private configService = inject(ConfigurationService);
  public languageService = inject(LanguageService);
  activeTab = signal('types');
  
  // Service Types state
  serviceTypes = this.configService.serviceTypes;
  showTypeForm = signal(false);
  editingType = signal<ServiceType | null>(null);
  currentType = signal<Omit<ServiceType, 'id'>>({ name: '', description: ''});

  // Providers state
  providers = this.configService.providers;
  showProviderForm = signal(false);
  editingProvider = signal<Provider | null>(null);
  currentProvider = signal<Omit<Provider, 'id'>>({ name: '', website: ''});


  selectTab(tab: string) {
    this.activeTab.set(tab);
  }

  // --- Service Type Methods ---
  addType() {
    this.editingType.set(null);
    this.currentType.set({ name: '', description: '' });
    this.showTypeForm.set(true);
  }

  editType(type: ServiceType) {
    this.editingType.set(type);
    this.currentType.set({ name: type.name, description: type.description });
    this.showTypeForm.set(true);
  }

  saveType() {
    if (this.editingType()) {
      this.configService.updateType({ id: this.editingType()!.id, ...this.currentType() });
    } else {
      this.configService.addType(this.currentType());
    }
    this.cancelTypeForm();
  }
  
  deleteType(id: number) {
    if (confirm('Are you sure you want to delete this service type?')) {
      this.configService.deleteType(id);
    }
  }

  cancelTypeForm() {
    this.showTypeForm.set(false);
  }
  
  updateCurrentTypeField(field: keyof Omit<ServiceType, 'id'>, event: Event) {
      const value = (event.target as HTMLInputElement).value;
      this.currentType.update(t => ({ ...t, [field]: value }));
  }


  // --- Provider Methods ---
  addProvider() {
    this.editingProvider.set(null);
    this.currentProvider.set({ name: '', website: '' });
    this.showProviderForm.set(true);
  }

  editProvider(provider: Provider) {
    this.editingProvider.set(provider);
    this.currentProvider.set({ name: provider.name, website: provider.website });
    this.showProviderForm.set(true);
  }

  saveProvider() {
    if (this.editingProvider()) {
      this.configService.updateProvider({ id: this.editingProvider()!.id, ...this.currentProvider() });
    } else {
      this.configService.addProvider(this.currentProvider());
    }
    this.cancelProviderForm();
  }

  deleteProvider(id: number) {
    if (confirm('Are you sure you want to delete this provider?')) {
      this.configService.deleteProvider(id);
    }
  }

  cancelProviderForm() {
    this.showProviderForm.set(false);
  }

  updateCurrentProviderField(field: keyof Omit<Provider, 'id'>, event: Event) {
      const value = (event.target as HTMLInputElement).value;
      this.currentProvider.update(p => ({ ...p, [field]: value }));
  }
}