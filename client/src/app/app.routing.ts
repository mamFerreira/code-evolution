import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './components/home.component';
import { UserEditComponent } from './components/user_edit.component';
import { EvolutionListComponent } from './components/evolution_list.component';

const appRoutes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'evolutions', component: EvolutionListComponent},
    {path: 'update_user', component: UserEditComponent},
    {path: '**', component: HomeComponent}
];

export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);