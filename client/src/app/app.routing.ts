import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Importación de componentes
import { HomeComponent } from './components/home/home.component';
import { EvolutionListComponent } from './components/evolution-list/evolution-list.component';
import { LevelPlayComponent } from './components/level-play/level-play.component';
import { LevelListComponent } from './components/level-list/level-list.component';
import { UserUpdateComponent } from './components/user-update/user-update.component';
// Importación de componentes de configuración
import { ConfigureMainComponent } from './components/configure/configure-main/configure-main.component';
import { ConfigureUserComponent } from './components/configure/configure-user/configure-user.component';
import { ConfigureEvolutionComponent } from './components/configure/configure-evolution/configure-evolution.component';
import { ConfigureLevelComponent } from './components/configure/configure-level/configure-level.component';
import { ConfigureGoalComponent } from './components/configure/configure-goal/configure-goal.component';
import { ConfigureLearningComponent } from './components/configure/configure-learning/configure-learning.component';
import { ConfigureActionComponent } from './components/configure/configure-action/configure-action.component';


const appRoutes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'home', component: HomeComponent},
    {path: 'jugar', component: EvolutionListComponent},
    {path: 'jugar/evolucion/:id', component: LevelListComponent},
    {path: 'jugar/nivel/:id', component: LevelPlayComponent},
    {path: 'mis-datos', component: UserUpdateComponent},    
    {path: 'admin/:type', component: ConfigureMainComponent},
    {path: 'admin/user/edit/:id', component: ConfigureUserComponent},
    {path: 'admin/evolution/edit/:id', component: ConfigureEvolutionComponent},
    {path: 'admin/level/edit/:id', component: ConfigureLevelComponent},
    {path: 'admin/goal/edit/:id', component: ConfigureGoalComponent},
    {path: 'admin/learning/edit/:id', component: ConfigureLearningComponent},
    {path: 'admin/action/edit/:id', component: ConfigureActionComponent},
    {path: 'admin/evolution/add', component: ConfigureEvolutionComponent},
    {path: 'admin/level/add', component: ConfigureLevelComponent},
    {path: 'admin/goal/add', component: ConfigureGoalComponent},
    {path: 'admin/learning/add', component: ConfigureLearningComponent},
    {path: 'admin/action/add', component: ConfigureActionComponent},
    {path: '**', component: HomeComponent}
];

export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
