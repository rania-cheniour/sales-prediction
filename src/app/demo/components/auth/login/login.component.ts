import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service'; // Adjust the path as necessary
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService, public layoutService: LayoutService,private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      remember: [false] // Added remember checkbox
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const { email, password } = this.form.value;
      this.authService.login(email, password).subscribe(
        response => {
          console.log('Login successful', response);
          localStorage.setItem('token', response.access_token);
          this.router.navigate(['/dashboard']);
          // Handle successful login (e.g., store token, redirect to another page)
        },
        error => {
          console.error('Login error', error);
          // Handle login error (e.g., show error message)
        }
      );
    }
  }
}
