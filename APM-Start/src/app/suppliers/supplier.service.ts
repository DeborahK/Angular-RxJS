import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { throwError, Observable, of, pipe } from 'rxjs';
import { Supplier } from './supplier';
import { catchError, concatMap, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  suppliersUrl = 'api/suppliers';

  /* return Observable<Observable<Supplier>> */
  suppliersWithMap$ = of(1, 5, 8).pipe(
    map(id => this.http.get<Supplier>(`${this.suppliersUrl}/${id}`))
  )

  /* return  Observable<Supplier> */
  suppliersWithConcatMap$ = of(1, 5, 8).pipe(
    tap(item => console.log(`utem: ${item}`)),
    concatMap( id => {
      console.log(`idd: ${id}`);
      return this.http.get<Supplier>(`${this.suppliersUrl}/${id}`);
    } 
  ))

  suppliers$ = this.http.get<Supplier[]>(this.suppliersUrl).pipe(
    catchError(err => this.handleError(err))
  )

  constructor(private http: HttpClient) { 
    this.suppliersWithConcatMap$.subscribe(
        data=>console.log(data)
    )
   }

  private handleError(err: any): Observable<never> {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.body.error}`;
    }
    console.error(err);
    return throwError(errorMessage);
  }

}
