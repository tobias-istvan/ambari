import { TestBed, inject } from '@angular/core/testing';

import { ServerResponseNotificationsService } from './server-response-notifications.service';

describe('ServerResponseNotificationsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ServerResponseNotificationsService]
    });
  });

  it('should be created', inject([ServerResponseNotificationsService], (service: ServerResponseNotificationsService) => {
    expect(service).toBeTruthy();
  }));
});
