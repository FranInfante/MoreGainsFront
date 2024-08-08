import { Routes } from '@angular/router';
import { HomeComponent } from './modules/+home/home.component';
import { SignInComponent } from './modules/+login/sign-in/sign-in.component';
import { RegisterComponent } from './modules/+login/register/register.component';
import { MenuComponent } from './modules/+menu/menu.component';
import { UserProfileComponent } from './modules/+userprofile/userprofile.component';
import { PlansComponent } from './modules/plans/plans.component';


export const routes: Routes = [
    {path: "", component: HomeComponent},
    {path: "login", component: SignInComponent},
    {path: "register", component: RegisterComponent},
    {path: "menu", component: MenuComponent},
    {path: "userprofile", component: UserProfileComponent},
    {path: "plans", component: PlansComponent}
];
