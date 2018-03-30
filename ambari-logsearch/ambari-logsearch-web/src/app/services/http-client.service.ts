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
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/first';
import 'rxjs/add/observable/throw';
import {
  Http, XHRBackend, Request, RequestOptions, RequestOptionsArgs, Response, Headers, URLSearchParams, RequestMethod
} from '@angular/http';
import {HomogeneousObject} from '@app/classes/object';
import {AuditLogsListQueryParams} from '@app/classes/queries/audit-logs-query-params';
import {AuditLogsGraphQueryParams} from '@app/classes/queries/audit-logs-graph-query-params';
import {AuditLogsTopResourcesQueryParams} from '@app/classes/queries/audit-logs-top-resources-query-params';
import {ServiceLogsQueryParams} from '@app/classes/queries/service-logs-query-params';
import {ServiceLogsHistogramQueryParams} from '@app/classes/queries/service-logs-histogram-query-params';
import {ServiceLogsTruncatedQueryParams} from '@app/classes/queries/service-logs-truncated-query-params';
import {AppStateService} from '@app/services/storage/app-state.service';
import {HttpClientResponseEventInterface} from '@modules/shared/models/http-client-response-event.interface';
import {ResponseSuccess, ResponseError, ResponseAuthError} from '@modules/shared/actions/http-client.actions';
import {AppStore} from '@app/classes/models/store';
import {Store} from '@ngrx/store';

export const apiEndPointKeyHeaderKey = 'X-Api-End-Point-Key';
export const urlVariablesHeaderKey = 'X-Url-Variables';

@Injectable()
export class HttpClientService extends Http {

  private readonly apiPrefix = 'api/v1/';

  readonly endPoints = Object.freeze({
    status: {
      url: 'status'
    },
    auditLogs: {
      url: 'audit/logs',
      params: opts => new AuditLogsListQueryParams(opts)
    },
    auditLogsGraph: {
      url: 'audit/logs/bargraph',
      params: opts => new AuditLogsGraphQueryParams(opts)
    },
    auditLogsFields: {
      url: 'audit/logs/schema/fields'
    },
    serviceLogs: {
      url: 'service/logs',
      params: opts => new ServiceLogsQueryParams(opts)
    },
    serviceLogsHistogram: {
      url: 'service/logs/histogram',
      params: opts => new ServiceLogsHistogramQueryParams(opts)
    },
    serviceLogsFields: {
      url: 'service/logs/schema/fields'
    },
    serviceLogsTruncated: {
      url: 'service/logs/truncated',
      params: opts => new ServiceLogsTruncatedQueryParams(opts)
    },
    components: {
      url: 'service/logs/components/levels/counts'
    },
    serviceComponentsName: {
      url: 'service/logs/components'
    },
    clusters: {
      url: 'service/logs/clusters'
    },
    hosts: {
      url: 'service/logs/tree'
    },
    topAuditLogsResources: {
      url: variables => `audit/logs/resources/${variables.number}`,
      params: opts => new AuditLogsTopResourcesQueryParams(opts)
    },
    logIndexFilters: {
      url: variables => `shipper/filters/${variables.clusterName}/level`
    },

    shipperClusterServiceList: {
      url: variables => `shipper/input/${variables.cluster}/services`
    },
    shipperClusterServiceConfiguration: {
      url: variables => `shipper/input/${variables.cluster}/services/${variables.service}`
    },
    shipperClusterServiceConfigurationTest: {
      url: variables => `shipper/input/${variables.cluster}/test`
    }
  });

  private readonly unauthorizedStatuses = [401, 403, 419];

  constructor(
    backend: XHRBackend,
    defaultOptions: RequestOptions,
    private appState: AppStateService,
    private store: Store<AppStore>
  ) {
    super(backend, defaultOptions);
  }

  private generateUrlString(url: string, urlVariables?: HomogeneousObject<string>): string {
    const preset = this.endPoints[url];
    let generatedUrl: string;
    if (preset) {
      const urlExpression = preset.url;
      let path: string;
      if (typeof urlExpression === 'function') {
        path = preset.url(urlVariables);
      } else if (typeof urlExpression === 'string') {
        path = preset.url;
      }
      generatedUrl = `${this.apiPrefix}${path}`;
    } else {
      generatedUrl = url;
    }
    return generatedUrl;
  }

  private generateUrl(request: string | Request, urlVariables?: HomogeneousObject<string>): string | Request {
    const urlAndParams: string[] = (typeof request === 'string' ? request : request.url).split('?');
    urlAndParams[0] = this.generateUrlString(urlAndParams[0], urlVariables);
    if (request instanceof Request) {
      request.url = urlAndParams.join('?');
      return request;
    } else {
      return urlAndParams.join('?');
    }
  }

  private generateOptions(
    url: string,
    params: HomogeneousObject<string>,
    urlVariables?: HomogeneousObject<string>
  ): RequestOptionsArgs {
    const preset = this.endPoints[url];
    const rawParams = preset && preset.params ? preset.params(params) : params;
    const options: RequestOptionsArgs = {};
    if (rawParams) {
      const paramsString = Object.keys(rawParams).map((key: string): string => `${key}=${rawParams[key]}`).join('&');
      const urlParams = new URLSearchParams(paramsString, {
          encodeKey: key => key,
          encodeValue: value => encodeURIComponent(value)
        });
      options.params = urlParams;
    } else {
      options.params = rawParams;
    }
    if (!options.headers) {
      options.headers = new Headers();
    }
    if (preset) {
      options.headers.append(apiEndPointKeyHeaderKey, url);
    }
    if (urlVariables) {
      options.headers.append(urlVariablesHeaderKey, JSON.stringify(urlVariables));
    }
    return options;
  }

  private addResponseActionDispatcher = (
    response$: Observable<Response>,
    request?: Request | RequestOptionsArgs,
    method?: RequestMethod
  ) => {
    const handler = (response: Response) => {
      if (response.status < 200 || response.status >= 300) {
        debugger;
      }
      const requestOptions: RequestOptionsArgs = request || {};
      const responseEventPayload: HttpClientResponseEventInterface = {
        response,
        method: method || RequestMethod.Get,
        apiEndPointKey: requestOptions.headers && requestOptions.headers.get(apiEndPointKeyHeaderKey),
        request: request
      };
      const action: ResponseSuccess | ResponseError | ResponseAuthError = new (
        this.unauthorizedStatuses.indexOf(response.status) > -1 ? ResponseAuthError :
          (response.status >= 200 && response.status < 300 ? ResponseSuccess : ResponseError)
      )(responseEventPayload);
      this.store.dispatch(action);
    };
    response$.subscribe(handler, handler);
  }

  request(request: string | Request, options?: RequestOptionsArgs): Observable<Response> {
    const response$ = super.request(this.generateUrl(request), options).share().first();
    const reqParam = request instanceof Request ? request : undefined;
    this.addResponseActionDispatcher(response$, options || request, reqParam.method);
    return response$;
  }

  get(url: string, params?: HomogeneousObject<string>, urlVariables?: HomogeneousObject<string>): Observable<Response> {
    return super.get(this.generateUrlString(url, urlVariables), this.generateOptions(url, params, urlVariables));
  }

  put(url: string, body: any, params?: HomogeneousObject<string>, urlVariables?: HomogeneousObject<string>): Observable<Response> {
    return super.put(this.generateUrlString(url, urlVariables), body, this.generateOptions(url, params, urlVariables));
  }

  post(url: string, body: any, params?: HomogeneousObject<string>, urlVariables?: HomogeneousObject<string>): Observable<Response> {
    return super.post(this.generateUrlString(url, urlVariables), body, this.generateOptions(url, params, urlVariables));
  }

  postFormData(
    url: string,
    params: HomogeneousObject<string>,
    options?: RequestOptionsArgs,
    urlVariables?: HomogeneousObject<string>): Observable<Response> {
    const generatedOptions = this.generateOptions(url, params, urlVariables);
    const encodedParams = generatedOptions.params;
    let body;
    if (encodedParams && encodedParams instanceof URLSearchParams) {
      body = encodedParams.rawParams;
    }
    const requestOptions = Object.assign({}, generatedOptions, options);
    if (!requestOptions.headers) {
      requestOptions.headers = new Headers();
    }
    requestOptions.headers.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    return super.post(this.generateUrlString(url, urlVariables), body, requestOptions);
  }

}
