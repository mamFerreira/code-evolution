import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { AceEditorModule } from 'ng2-ace-editor';

import { routing, appRoutingProviders } from './app.routing';

// Importación de servicios
import { GlobalService } from './services/global.service';
import { UserService } from './services/user.service';
import { EvolutionService } from './services/evolution.service';
import { LevelService } from './services/level.service';
import { ActionService } from './services/action.service';
import { GoalService } from './services/goal.service';
import { LearningService } from './services/learning.service';

// Importación de componentes
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { NavigationMenuComponent } from './components/navigation-menu/navigation-menu.component';
import { UserUpdateComponent } from './components/user-update/user-update.component';
import { HomeComponent } from './components/home/home.component';
import { EvolutionListComponent } from './components/evolution-list/evolution-list.component';
import { LevelListComponent } from './components/level-list/level-list.component';
import { LevelPlayComponent } from './components/level-play/level-play.component';
// Importación de componentes de configuración
import { ConfigureMainComponent } from './components/configure/configure-main/configure-main.component';




@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NavigationMenuComponent,
    UserUpdateComponent,
    HomeComponent,
    EvolutionListComponent,
    LevelListComponent,
    LevelPlayComponent,
    ConfigureMainComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    routing,
    AceEditorModule
  ],
  providers: [GlobalService, UserService, EvolutionService, LevelService, ActionService, GoalService, LearningService, appRoutingProviders],
  bootstrap: [AppComponent]
})
export class AppModule { }
