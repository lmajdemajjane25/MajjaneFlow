
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';

@Component({
  selector: 'app-root',
  template: `<app-layout><router-outlet></router-outlet></app-layout>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, LayoutComponent],
})
export class AppComponent {}
