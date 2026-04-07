import { Component, HostListener } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  routeAnimationsEnabled = false;
  private hasNavigated = false;

  constructor(private readonly router: Router) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        if (!this.hasNavigated) {
          this.hasNavigated = true;
          setTimeout(() => {
            this.routeAnimationsEnabled = true;
          }, 0);
          return;
        }
        this.routeAnimationsEnabled = true;
      });
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    const x = `${event.clientX}px`;
    const y = `${event.clientY}px`;
    document.documentElement.style.setProperty('--cursor-x', x);
    document.documentElement.style.setProperty('--cursor-y', y);
  }
}
