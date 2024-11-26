import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { NgModule } from '@angular/core';
import { ProfilePageComponent } from './profile-page/profile-page.component';
import { SettingsPageComponent } from './settings-page/settings-page.component';
import { ReportsPageComponent } from './reports-page/reports-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { RegisterPageComponent } from './register-page/register-page.component';

export const routes: Routes = [
    { path: 'home', component: HomePageComponent },
    { path: 'profile', component: ProfilePageComponent },
    { path: 'settings', component: SettingsPageComponent },
    { path: 'reports', component: ReportsPageComponent },
    { path: 'login', component: LoginPageComponent },
    { path: 'register', component: RegisterPageComponent },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}
