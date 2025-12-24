
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  imports: [CommonModule],
  templateUrl: './settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
    settingCards = [
        { title: 'Paramètres du Profil', description: 'Gérez vos informations de profil et vos préférences.', icon: 'user' },
        { title: 'Notifications', description: 'Configurez les alertes par e-mail pour les événements importants.', icon: 'bell' },
        { title: 'Sécurité', description: 'Mettez à jour votre mot de passe et gérez les paramètres de sécurité.', icon: 'shield' },
        { title: 'Préférences', description: 'Personnalisez votre expérience applicative.', icon: 'settings' },
    ];
}