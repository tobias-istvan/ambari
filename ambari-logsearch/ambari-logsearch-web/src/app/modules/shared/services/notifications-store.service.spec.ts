import { TestBed, inject } from '@angular/core/testing';

import { NotificationsStoreService } from './notifications-store.service';

describe('NotificationsStoreService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NotificationsStoreService]
    });
  });

  it('should be created', inject([NotificationsStoreService], (service: NotificationsStoreService) => {
    expect(service).toBeTruthy();
  }));
});
