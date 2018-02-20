import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { AceEditorModule } from 'ng2-ace-editor';

import { routing, appRoutingProviders } from './app.routing';

import { GlobalService } from './services/global.service';
import { UserService } from './services/user.service';
import { EvolutionService } from './services/evolution.service';
import { LevelService } from './services/level.service';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { NavigationMenuComponent } from './navigation-menu/navigation-menu.component';
import { UserUpdateComponent } from './user-update/user-update.component';
import { HomeComponent } from './home/home.component';
import { EvolutionListComponent } from './evolution-list/evolution-list.component';
import { LevelListComponent } from './level-list/level-list.component';
import { LevelPlayComponent } from './level-play/level-play.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NavigationMenuComponent,
    UserUpdateComponent,
    HomeComponent,
    EvolutionListComponent,
    LevelListComponent,
    LevelPlayComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    routing,
    AceEditorModule
  ],
  providers: [GlobalService, UserService, EvolutionService, LevelService,  appRoutingProviders],
  bootstrap: [AppComponent]
})
export class AppModule { }
