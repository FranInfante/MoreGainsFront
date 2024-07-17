import { Routes } from '@angular/router';
import { HomeComponent } from './modules/+home/home.component';
import { SignInComponent } from './modules/+login/sign-in/sign-in.component';

export const routes: Routes = [
    {path: "", component: HomeComponent},
    {path: "login", component: SignInComponent}
];
