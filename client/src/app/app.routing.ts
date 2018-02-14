import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { EvolutionListComponent } from './evolution-list/evolution-list.component';
import { LevelPlayComponent } from './level-play/level-play.component';
import { LevelListComponent } from './level-list/level-list.component';
import { UserUpdateComponent } from './user-update/user-update.component';




const appRoutes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'home', component: HomeComponent},
    {path: 'jugar', component: EvolutionListComponent},
    {path: 'jugar/evolucion/:id', component: LevelListComponent},
    {path: 'jugar/evolucion/nivel/:id', component: LevelPlayComponent},
    {path: 'mis-datos', component: UserUpdateComponent},
    {path: '**', component: HomeComponent}
];

export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
