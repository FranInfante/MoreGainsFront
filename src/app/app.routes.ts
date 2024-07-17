import { Routes } from '@angular/router';
import { HomeComponent } from './modules/+home/home.component';
import { LoginComponent } from './modules/+login/login.component';

export const routes: Routes = [
    {path: "", component: HomeComponent},
    {path: "login", component: LoginComponent}
];
