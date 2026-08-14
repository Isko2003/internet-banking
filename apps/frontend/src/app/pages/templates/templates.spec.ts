import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTestingDependencies } from '../../../testing/test-providers';

import { Templates } from './templates';

describe('Templates', () => {
  let component: Templates;
  let fixture: ComponentFixture<Templates>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Templates],
      providers: [provideTestingDependencies()],
    }).compileComponents();

    fixture = TestBed.createComponent(Templates);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
