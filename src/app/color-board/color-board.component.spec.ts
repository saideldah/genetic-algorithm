import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorBoardComponent } from './color-board.component';

describe('ColorBoardComponent', () => {
  let component: ColorBoardComponent;
  let fixture: ComponentFixture<ColorBoardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ColorBoardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColorBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
