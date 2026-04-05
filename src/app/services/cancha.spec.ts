import { TestBed } from '@angular/core/testing';

import { Cancha } from './cancha';

describe('Cancha', () => {
  let service: Cancha;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Cancha);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
