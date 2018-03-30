/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {EventEmitter, Injectable} from '@angular/core';

import {NotificationsService as Angular2NotificationsService} from 'angular2-notifications';
import {Notification} from 'angular2-notifications/src/notification.type';

import * as moment from 'moment';
import {NotificationInterface} from '../models/notification.interface';
import {NotificationsStoreService} from '@modules/shared/services/notifications-store.service';
import {Observable} from 'rxjs/Observable';

export enum NotificationType {
  SUCCESS = 'success',
  INFO = 'info',
  ERROR = 'error',
  WARNING = 'warning'
}

@Injectable()
export class NotificationService {

  private display: EventEmitter<Notification> = new EventEmitter<Notification>();

  private lastDisplayedIndex: number = 0;

  private notificationsToDisplay$: Observable<NotificationInterface[]> = this.notificationsStoreService.getAll()
    .map((notifications: NotificationInterface[]) => {
      return notifications.slice(this.lastDisplayedIndex ? this.lastDisplayedIndex + 1 : 0);
    }).filter((notifications: NotificationInterface[]) => notifications.length > 0);

  constructor(
    private notificationService: Angular2NotificationsService,
    private notificationsStoreService: NotificationsStoreService
  ) {
    this.notificationsToDisplay$.subscribe(this.processNotificationQueue);
  }

  private processNotificationQueue = (notifications: NotificationInterface[]): void => {
    this.lastDisplayedIndex += notifications.length;
    // notifications.forEach(this.showNotification);
  }

  private showNotification = (notification: NotificationInterface): Notification => {
    const {message, title, ...config} = notification;
    const method: string = typeof this.notificationService[config.type] === 'function' ? config.type : 'info';
    const displayedNotification: Notification = this.notificationService[method](title, message, config);
    this.display.emit(displayedNotification);
    return displayedNotification;
  }

  addNotification(payload: NotificationInterface) {
    this.notificationsStoreService.addInstance({...payload, timestamp: moment().valueOf()});
  }

}
