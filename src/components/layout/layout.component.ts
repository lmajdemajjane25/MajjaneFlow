
import { Component, ChangeDetectionStrategy, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

interface NavItem {
  path: string;
  name: string;
  icon: string;
  activeIconColor: string;
  gradientClass: string;
}

@Component({
  selector: 'app-layout',
  imports: [CommonModule, RouterLink],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private routerSubscription?: Subscription;

  isSidebarOpen = signal(false);
  isProfileMenuOpen = signal(false);
  expiringServicesCount = signal(5); // Example count
  activePath = signal<string>('');
  
  inactiveLinkClass = 'bg-white text-gray-700 hover:bg-slate-100/80';
  inactiveIconClass = 'text-slate-500';

  navItems: NavItem[] = [
    { path: '/dashboard', name: 'Tableau de bord', icon: 'home', activeIconColor: 'text-white', gradientClass: 'from-blue-500 to-cyan-500' },
    { path: '/clients', name: 'Clients', icon: 'users', activeIconColor: 'text-white', gradientClass: 'from-violet-500 to-purple-500' },
    { path: '/services', name: 'Suivi des Prestations', icon: 'server', activeIconColor: 'text-white', gradientClass: 'from-emerald-500 to-teal-500' },
    { path: '/projects', name: 'Projets', icon: 'briefcase', activeIconColor: 'text-white', gradientClass: 'from-amber-500 to-orange-500' },
    { path: '/comptabilite', name: 'Comptabilité', icon: 'cash', activeIconColor: 'text-white', gradientClass: 'from-green-500 to-emerald-500' },
    { path: '/configuration', name: 'Configuration', icon: 'cog', activeIconColor: 'text-white', gradientClass: 'from-indigo-500 to-blue-500' },
  ];

  ngOnInit() {
    // Set initial active path
    this.activePath.set(this.router.url);
    // Subscribe to router events to update active path on navigation
    this.routerSubscription = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.activePath.set(event.urlAfterRedirects);
    });
  }

  ngOnDestroy() {
    // Clean up the subscription to prevent memory leaks
    this.routerSubscription?.unsubscribe();
  }

  toggleSidebar() {
    this.isSidebarOpen.update(value => !value);
  }

  toggleProfileMenu() {
    this.isProfileMenuOpen.update(value => !value);
  }
}
