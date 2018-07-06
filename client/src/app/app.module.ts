import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { AceEditorModule } from 'ng2-ace-editor';
import { PopoverModule } from 'ngx-popover';
import { routing, appRoutingProviders } from './app.routing';

// Importación de servicios
import { UserService } from './services/user.service';
import { EvolutionService } from './services/evolution.service';
import { LevelService } from './services/level.service';
import { ActionService } from './services/action.service';
import { GoalService } from './services/goal.service';
import { LearningService } from './services/learning.service';
import { GameService } from './services/game.service';
import { AlertService } from './services/alert.service';

// Importación de componentes
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { NavigationMenuComponent } from './components/navigation-menu/navigation-menu.component';
import { UserUpdateComponent } from './components/user-update/user-update.component';
import { HomeComponent } from './components/home/home.component';
import { EvolutionListComponent } from './components/evolution-list/evolution-list.component';
import { LevelListComponent } from './components/level-list/level-list.component';
import { LevelPlayComponent } from './components/level-play/level-play.component';
import { DialogLevelUpComponent } from './components/level-play/dialog-level-up/dialog-level-up.component';
import { DialogGameOverComponent } from './components/level-play/dialog-game-over/dialog-game-over.component';
import { AlertComponent } from './components/alert/alert.component';

// Importación de componentes de configuración
import { ConfigureMainComponent } from './components/configure/configure-main/configure-main.component';
import { ConfigureUserComponent } from './components/configure/configure-user/configure-user.component';
import { ConfigureEvolutionComponent } from './components/configure/configure-evolution/configure-evolution.component';
import { ConfigureLevelComponent } from './components/configure/configure-level/configure-level.component';
import { ConfigureGoalComponent } from './components/configure/configure-goal/configure-goal.component';
import { ConfigureLearningComponent } from './components/configure/configure-learning/configure-learning.component';
import { ConfigureActionComponent } from './components/configure/configure-action/configure-action.component';




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
    DialogLevelUpComponent,
    DialogGameOverComponent,
    ConfigureMainComponent,
    ConfigureUserComponent,
    ConfigureEvolutionComponent,
    ConfigureLevelComponent,
    ConfigureGoalComponent,
    ConfigureLearningComponent,
    ConfigureActionComponent,
    AlertComponent
  ],
  imports: [
    BrowserModule,  
    BrowserAnimationsModule,  
    FormsModule,
    HttpClientModule,
    routing,
    AceEditorModule,
    PopoverModule
  ],
  providers: [
    UserService,
    EvolutionService,
    LevelService,
    ActionService,
    GoalService,
    LearningService, 
    appRoutingProviders, 
    AlertService,
    GameService],
  bootstrap: [AppComponent]
})
export class AppModule { }
