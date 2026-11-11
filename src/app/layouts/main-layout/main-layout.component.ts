import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ToastHostComponent } from '../../shared/ui/toast.service';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastHostComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  readonly profileOpen = signal(false);
  readonly menuOpen = signal(false);

  toggleProfile(): void {
    this.menuOpen.set(false);
    this.profileOpen.update((open) => !open);
  }

  toggleMenu(): void {
    this.profileOpen.set(false);
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
    this.profileOpen.set(false);
  }
}
