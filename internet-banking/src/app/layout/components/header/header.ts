import { Component, computed, EventEmitter, inject, Output } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  @Output() menuToggle = new EventEmitter<void>();
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = this.authService.currentUser;

  displayName = computed(() => {
    const user = this.currentUser();
    return user ? `${user.firstName} ${user.lastName}` : "User";
  })

  onMenuClick() {
    this.menuToggle.emit();
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
