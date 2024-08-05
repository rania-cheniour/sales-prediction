// auth/register/register.component.ts

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service'; // Adjust path as necessary
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  //styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  form: FormGroup;
  successMessage: string | null = null;
  errorMessage: string;
  constructor(private fb: FormBuilder, private authService: AuthService,public layoutService: LayoutService,private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }
  passwordMatchValidator: ValidatorFn = (control: AbstractControl): { [key: string]: boolean } | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { 'mismatch': true };
    }
    return null;
  };
  onSubmit() {
    if (this.form.valid) {
      const { email, password } = this.form.value;
      this.authService.register(email, password).subscribe(
        response => {
          console.log('Registration successful', response);
  
          this.successMessage = "Registered successfully!";
          window.alert("Registered successfully!");
          this.router.navigate(['/auth/login']);
        },
        error => {
          console.error('Registration error', error);
  
          if (error.status === 409) { // Assuming 409 Conflict status for existing email
            this.errorMessage = "Email already exists. Please use a different email.";
            window.alert("email already exists")
          } else {
            this.errorMessage = "Registration error. Please try again.";
          }
        }
      );
    }
  }  
}

