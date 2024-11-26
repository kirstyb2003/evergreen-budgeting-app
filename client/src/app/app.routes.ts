import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { NgModule } from '@angular/core';
import { ProfilePageComponent } from './profile-page/profile-page.component';
import { SettingsPageComponent } from './settings-page/settings-page.component';
import { ReportsPageComponent } from './reports-page/reports-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { RegisterPageComponent } from './register-page/register-page.component';
import { AuthGuard } from './services/auth.guard';
import { GuestGuard } from './services/guest.guard';

export const routes: Routes = [
    { path: 'home', component: HomePageComponent, canActivate: [AuthGuard] },
    { path: 'profile', component: ProfilePageComponent, canActivate: [AuthGuard] },
    { path: 'settings', component: SettingsPageComponent, canActivate: [AuthGuard] },
    { path: 'reports', component: ReportsPageComponent, canActivate: [AuthGuard] },
    { path: 'login', component: LoginPageComponent, canActivate: [GuestGuard] },
    { path: 'register', component: RegisterPageComponent, canActivate: [GuestGuard] },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
  ];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}
