import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CartShellComponent } from './cart/cart-shell/cart-shell.component';

import { WelcomeComponent } from './home/welcome.component';
import { PageNotFoundComponent } from './page-not-found.component';

@NgModule({
  imports: [
    RouterModule.forRoot([
      { path: 'welcome', component: WelcomeComponent },
      {
        path: 'products',
        loadChildren: () =>
          import('./products/product.module').then(m => m.ProductModule)
      },
      { path: 'cart', component: CartShellComponent},
      { path: '', redirectTo: 'welcome', pathMatch: 'full' },
      { path: '**', component: PageNotFoundComponent }
    ])
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
