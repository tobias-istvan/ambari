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
import {Injectable} from '@angular/core';
import {HttpClientService, urlVariablesHeaderKey} from '@app/services/http-client.service';
import {TranslateService} from '@ngx-translate/core';
import {HttpClientResponseEventInterface} from '@modules/shared/models/http-client-response-event.interface';
import {NotificationInterface} from '@modules/shared/models/notification.interface';
import {HomogeneousObject} from '@app/classes/object';

export const translateKeyForApiEndPoints = 'apiEndPointResponseDescriptor';
export const translateKeyForResponseStatusCode = 'serverErrorResponseDescriptorByStatusCode';

@Injectable()
export class ServerResponseNotificationsService {

  constructor(
    private httpClientService: HttpClientService,
    private translateService: TranslateService
  ) {}

  private getKeyForUrl(url: string): string {
    const apiEndPoints: {[key: string]: any} = this.httpClientService.endPoints;
    return apiEndPoints[url] ? url : Object.keys(apiEndPoints).find((apiKey: string): boolean => {
      return apiEndPoints[apiKey].url === url;
    });
  }

  getNotificationPayloadFromHttpClientResponseEvent = (event: HttpClientResponseEventInterface): NotificationInterface => {
    const t: Function = this.translateService.instant.bind(this.translateService);
    const url: string = event.request ? (typeof event.request === 'string' ? event.request : event.request.url) : '';
    const endPointKey: string = this.getKeyForUrl(event.apiEndPointKey || url);
    const statusCode: number = event.response && event.response.status;
    const responseBodyJson: {[key: string]: any} = (event.response && event.response.json && event.response.json()) || {};
    const urlVariables: HomogeneousObject<string> = (
      event.request && event.request.headers && event.request.headers.get(urlVariablesHeaderKey)
    ) || {};
    const translateData: any = {
      message: '', // this is just for remove the message interpolation when it is not available from the server response message
      ...responseBodyJson, // useful in error response, where the message property is available, so it will override the previous prop
      ...urlVariables
    };

    // Title of the api end point
    const apiEndPointTitleKey: string = `${translateKeyForApiEndPoints}.${endPointKey}.title`;
    let apiEndPointTitle: string = endPointKey ? t(apiEndPointTitleKey, translateData) : '';
    if (apiEndPointTitle === apiEndPointTitleKey) {
      apiEndPointTitle = '';
    }

    // Message for api end point
    const messagesKey: string = statusCode >= 200 && statusCode < 300 ? 'success' : 'error';
    const apiEndPointMessageKey: string = `${translateKeyForApiEndPoints}.${endPointKey}.messages.${messagesKey}`;
    let apiEndPointMessage: string = t(apiEndPointMessageKey, translateData);
    if (apiEndPointMessageKey === apiEndPointMessage) {
      apiEndPointMessage = '';
    }

    // Title of status
    const statusTitleKey: string = `${translateKeyForResponseStatusCode}.${statusCode}.title`;
    let statusTitle: string = statusCode ? t(statusTitleKey, translateData) : '';
    if (statusTitleKey === statusTitle) {
      statusTitle = '';
    }
    // Message for status
    const methodsStr: string[] = ['get', 'post', 'put', 'delete', 'options', 'head', 'patch'];
    const method: string = methodsStr[event.method] || '';
    let statusMessageKey: string = `${translateKeyForResponseStatusCode}.${statusCode}.messages.${method}`;
    let statusMessage: string = t(statusMessageKey, translateData);
    if (statusMessage === statusMessageKey) {
      statusMessageKey = `${translateKeyForResponseStatusCode}.${statusCode}.messages.$common`;
      statusMessage = t(statusMessageKey, translateData);
    }
    if (statusMessageKey === statusMessage) {
      statusMessage = '';
    }

    const notificationType: string = statusCode >= 200 && statusCode < 300 ? 'success' : 'error';

    return {
      type: notificationType,
      title: `${apiEndPointTitle}${apiEndPointTitle && statusTitle ? ' - ' : ''}${statusTitle}`,
      message: `${apiEndPointMessage}${apiEndPointMessage && statusMessage ? '<br>' : ''}${statusMessage}`
    };
  }

}
