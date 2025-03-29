import { TestBed } from '@angular/core/testing';
import { ComponentCommunicationService } from './component-communication.service';

describe('ComponentCommunicationService', () => {
  let service: ComponentCommunicationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComponentCommunicationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit a value when notifyRefresh is called', (done) => {
    service.refresh$.subscribe(() => {
      expect(true).toBeTrue();
      done();
    });

    service.notifyRefresh();
  });
});
