// Importación de paquetes Angular y otros elementos externos
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

// Decorador que recibe un objeto de metadatos que define el módulo:
// declarations: Vistas del módulo (componentes, directivas y pipes)
// imports: paquetes que empleará este módulo
// providers: servicios utilizados por el módulo
// bootstrap: vista raíz de la aplicación
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

// Exportación del módulo como una clase Angular
export class AppModule { }
