import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductListRegetComponent } from './product-list-reget.component';

describe('ProductListRegetComponent', () => {
  let component: ProductListRegetComponent;
  let fixture: ComponentFixture<ProductListRegetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductListRegetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductListRegetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
