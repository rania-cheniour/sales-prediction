import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './auth-routing.module';
//import { RegisterModule } from './register/register.module'; // Import RegisterModule
@NgModule({
    imports: [
        CommonModule,
        AuthRoutingModule
        //RegisterModule
    ]
})
export class AuthModule { }
