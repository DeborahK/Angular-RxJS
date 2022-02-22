import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

// Imports for loading & configuring the in-memory web api
import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
import { AppData } from './app-data';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WelcomeComponent } from './home/welcome.component';
import { PageNotFoundComponent } from './page-not-found.component';
import { CartItemComponent } from './cart/cart-item/cart-item.component';
import { CartTotalComponent } from './cart/cart-total/cart-total.component';
import { CartListComponent } from './cart/cart-list/cart-list.component';
import { CartShellComponent } from './cart/cart-shell/cart-shell.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    InMemoryWebApiModule.forRoot(AppData, { delay: 1000 }),
    AppRoutingModule
  ],
  declarations: [
    AppComponent,
    WelcomeComponent,
    CartShellComponent,
    CartListComponent,
    CartTotalComponent,
    CartItemComponent,
    PageNotFoundComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
