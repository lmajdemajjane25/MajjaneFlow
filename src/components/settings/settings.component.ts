
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
        { title: 'Profile Settings', description: 'Manage your profile information and preferences.', icon: 'user' },
        { title: 'Notifications', description: 'Configure email alerts for important events.', icon: 'bell' },
        { title: 'Security', description: 'Update your password and manage security settings.', icon: 'shield' },
        { title: 'Preferences', description: 'Customize your application experience.', icon: 'settings' },
    ];
}
