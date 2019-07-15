import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { throwError, of } from 'rxjs';
import { map, tap, concatMap, mergeMap, switchMap, shareReplay, catchError } from 'rxjs/operators';

import { Supplier } from './supplier';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  suppliersUrl = 'api/suppliers';

  // All Suppliers
  suppliers$ = this.http.get<Supplier[]>(this.suppliersUrl)
    .pipe(
      tap(data => console.log('suppliers', JSON.stringify(data))),
      shareReplay(1),
      catchError(this.handleError)
    );

  suppliersWithMap$ = of(1, 5, 8)
    .pipe(
      map(id => this.http.get<Supplier>(`${this.suppliersUrl}/${id}`)
      )
    );

  suppliersWithConcatMap$ = of(1, 5, 8)
    .pipe(
      tap(id => console.log('concatMap source Observable', id)),
      concatMap(id => this.http.get<Supplier>(`${this.suppliersUrl}/${id}`)
        .pipe(
          catchError(err => of({} as Supplier)),
          tap(console.log)
        ))
    );

  suppliersWithMergeMap$ = of(1, 5, 8)
    .pipe(
      tap(id => console.log('mergeMap source Observable', id)),
      mergeMap(id => this.http.get<Supplier>(`${this.suppliersUrl}/${id}`))
    );

  suppliersWithSwitchMap$ = of(1, 5, 8)
    .pipe(
      tap(id => console.log('switchMap source Observable', id)),
      switchMap(id => this.http.get<Supplier>(`${this.suppliersUrl}/${id}`))
    );

  constructor(private http: HttpClient) {
    // this.suppliersWithMap$
    //   .subscribe(o => o.subscribe(
    //     item => console.log('map result', item)
    //   ));
    // this.suppliersWithConcatMap$.subscribe(item => console.log('concatMap result', item));
    // this.suppliersWithMergeMap$.subscribe(item => console.log('mergeMap result', item));
    // this.suppliersWithSwitchMap$.subscribe(item => console.log('switchMap result', item));
  }

  private handleError(err: any) {
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
