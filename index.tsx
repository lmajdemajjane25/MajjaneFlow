
import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';

import { AppComponent } from './src/app.component';
import { DashboardComponent } from './src/components/dashboard/dashboard.component';
import { ClientsComponent } from './src/components/clients/clients.component';
import { ServicesComponent } from './src/components/services/services.component';
import { ProjectsComponent } from './src/components/projects/projects.component';
import { ComptabiliteComponent } from './src/components/comptabilite/comptabilite.component';
import { ConfigurationComponent } from './src/components/configuration/configuration.component';
import { SettingsComponent } from './src/components/settings/settings.component';
import { ConfigurationService } from './src/services/configuration.service';
import { ClientService } from './src/services/client.service';
import { ServiceService } from './src/services/service.service';
import { EmailService } from './src/services/email.service';

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter([
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'clients', component: ClientsComponent },
      { path: 'services', component: ServicesComponent },
      { path: 'projects', component: ProjectsComponent },
      { path: 'comptabilite', component: ComptabiliteComponent },
      { path: 'configuration', component: ConfigurationComponent },
      { path: 'settings', component: SettingsComponent },
      { path: '**', redirectTo: 'dashboard' } // Fallback route
    ], withHashLocation()),
    ConfigurationService,
    ClientService,
    ServiceService,
    EmailService,
  ],
}).catch((err) => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.