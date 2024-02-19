import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginServiceTsComponent } from './login.service.ts.component';

describe('LoginServiceTsComponent', () => {
  let component: LoginServiceTsComponent;
  let fixture: ComponentFixture<LoginServiceTsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginServiceTsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LoginServiceTsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
