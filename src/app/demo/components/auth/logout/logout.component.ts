
import { AuthService } from '../auth.service';
// src/app/logout/logout.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  template: '<p>Logging out...</p>'
})
export class LogoutComponent implements OnInit {

  constructor(private authService: AuthService,private router: Router) { }

  ngOnInit(): void {
    this.authService.logout();
  }
}

