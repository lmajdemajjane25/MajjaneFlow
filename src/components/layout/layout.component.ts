import { Component, ChangeDetectionStrategy, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { LanguageService } from '../../services/language.service';

interface NavItem {
  path: string;
  name: string;
  icon: string;
  iconBgClass: string;
  activeClass: string;
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
  public languageService = inject(LanguageService);
  private routerSubscription?: Subscription;

  isSidebarOpen = signal(false);
  isProfileMenuOpen = signal(false);
  expiringServicesCount = signal(5); // Example count
  activePath = signal<string>('');

  navItems: NavItem[] = [
    { path: '/dashboard', name: 'nav.dashboard', icon: 'home', iconBgClass: 'bg-blue-500', activeClass: 'bg-blue-500 text-white shadow-lg' },
    { path: '/clients', name: 'nav.clients', icon: 'users', iconBgClass: 'bg-violet-500', activeClass: 'bg-violet-500 text-white shadow-lg' },
    { path: '/services', name: 'nav.services', icon: 'server', iconBgClass: 'bg-emerald-500', activeClass: 'bg-emerald-500 text-white shadow-lg' },
    { path: '/projects', name: 'nav.projects', icon: 'briefcase', iconBgClass: 'bg-amber-500', activeClass: 'bg-amber-500 text-white shadow-lg' },
    { path: '/accounting', name: 'nav.accounting', icon: 'cash', iconBgClass: 'bg-pink-500', activeClass: 'bg-pink-500 text-white shadow-lg' },
    { path: '/reports', name: 'nav.reports', icon: 'chart-bar', iconBgClass: 'bg-indigo-500', activeClass: 'bg-indigo-500 text-white shadow-lg' },
    { path: '/configuration', name: 'nav.configuration', icon: 'cog', iconBgClass: 'bg-slate-500', activeClass: 'bg-slate-500 text-white shadow-lg' },
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