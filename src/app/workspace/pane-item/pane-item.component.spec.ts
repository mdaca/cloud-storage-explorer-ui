import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaneItemComponent } from './pane-item.component';

describe('PaneItemComponent', () => {
  let component: PaneItemComponent;
  let fixture: ComponentFixture<PaneItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaneItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaneItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
