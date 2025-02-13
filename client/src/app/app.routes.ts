import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { NgModule } from '@angular/core';
import { BudgetPageComponent } from './budget-page/budget-page.component';
import { ReportsPageComponent } from './reports-page/reports-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { RegisterPageComponent } from './register-page/register-page.component';
import { AuthGuard } from './services/auth.guard';
import { GuestGuard } from './services/guest.guard';
import { LogTransactionPageComponent } from './log-transaction-page/log-transaction-page.component';
import { SetBudgetPageComponent } from './set-budget-page/set-budget-page.component';
import { SetSavingsGoalPageComponent } from './set-savings-goal-page/set-savings-goal-page.component';
import { TransactionDisplayPageComponent } from './transaction-display-page/transaction-display-page.component';

export const routes: Routes = [
    { path: 'home', component: HomePageComponent, canActivate: [AuthGuard] },
    { path: 'budget', component: BudgetPageComponent, canActivate: [AuthGuard] },
    { path: 'reports', component: ReportsPageComponent, canActivate: [AuthGuard] },
    { path: 'login', component: LoginPageComponent, canActivate: [GuestGuard] },
    { path: 'register', component: RegisterPageComponent, canActivate: [GuestGuard] },
    { path: 'log-transaction', component: LogTransactionPageComponent, canActivate: [AuthGuard] },
    { path: 'log-transaction/:type', component: LogTransactionPageComponent, canActivate: [AuthGuard] },
    { path: 'log-transaction/:type/:id', component: LogTransactionPageComponent, canActivate: [AuthGuard] },
    { path: 'transactions/:type', component: TransactionDisplayPageComponent, canActivate: [AuthGuard] },
    { path: 'transactions', component: TransactionDisplayPageComponent, canActivate: [AuthGuard] },
    { path: 'set-budget', component: SetBudgetPageComponent, canActivate: [AuthGuard] },
    { path: 'set-savings-goal', component: SetSavingsGoalPageComponent, canActivate: [AuthGuard] },
    { path: 'set-savings-goal/:id', component: SetSavingsGoalPageComponent, canActivate: [AuthGuard] },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
  ];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}
