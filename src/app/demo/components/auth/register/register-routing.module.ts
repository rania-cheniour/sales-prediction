import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './register.component';

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forChild([
    { path: '', component: RegisterComponent },
    { path: '', redirectTo: '/login', pathMatch: 'full' } // Default route

])],
exports: [RouterModule]
})
export class RegisterRoutingModule { }
