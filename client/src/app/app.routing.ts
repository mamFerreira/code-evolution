import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Importación de componentes
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { EvolutionListComponent } from './components/evolution-list/evolution-list.component';
import { LevelPlayComponent } from './components/level-play/level-play.component';
import { LevelListComponent } from './components/level-list/level-list.component';
import { UserUpdateComponent } from './components/user-update/user-update.component';
// Importación de componentes de configuración
import { ConfigureMainComponent } from './components/configure/configure-main/configure-main.component';




const appRoutes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'home', component: HomeComponent},
    {path: 'jugar', component: EvolutionListComponent},
    {path: 'jugar/evolucion/:id', component: LevelListComponent},
    {path: 'jugar/nivel/:id', component: LevelPlayComponent},
    {path: 'mis-datos', component: UserUpdateComponent},
    {path: 'admin', component: ConfigureMainComponent},
    {path: '**', component: HomeComponent}
];

export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
