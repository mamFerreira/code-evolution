import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { routing, appRoutingProviders } from './app.routing';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home.component';
import { EvolutionListComponent } from './components/evolution_list.component';
import { LevelListComponent } from './components/level_list.component';
import { LevelPlayComponent } from './components/level_play.component';
import { UserEditComponent } from './components/user_edit.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    EvolutionListComponent,
    LevelListComponent,
    LevelPlayComponent,
    UserEditComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    routing
  ],
  providers: [appRoutingProviders],
  bootstrap: [AppComponent]
})
export class AppModule { }
