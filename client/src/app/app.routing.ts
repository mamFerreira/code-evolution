import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './components/home.component';
import { EvolutionListComponent } from './components/evolution_list.component';
import { LevelListComponent } from './components/level_list.component';
import { LevelPlayComponent } from './components/level_play.component';
import { UserEditComponent } from './components/user_edit.component';

const appRoutes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'home', component: HomeComponent},
    {path: 'play', component: EvolutionListComponent},
    {path: 'play/evolution/:id', component: LevelListComponent},
    {path: 'play/evolution/level/:id', component: LevelPlayComponent},
    {path: 'user-update', component: UserEditComponent},
    {path: '**', component: HomeComponent}
];

export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);