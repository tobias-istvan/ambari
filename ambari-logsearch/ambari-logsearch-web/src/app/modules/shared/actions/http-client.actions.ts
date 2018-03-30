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

import {Action} from '@ngrx/store';
import {HttpClientResponseEventInterface} from '@modules/shared/models/http-client-response-event.interface';
import {Request} from '@angular/http';

export const RESPONSE_SUCCESS = '[HTTP_CLIENT] Response success';
export class ResponseSuccess implements Action {
  readonly type = RESPONSE_SUCCESS;
  constructor(public payload: HttpClientResponseEventInterface) {}
}

export const RESPONSE_ERROR = '[HTTP_CLIENT] Response error';
export class ResponseError implements Action {
  readonly type = RESPONSE_ERROR;
  constructor(public payload: HttpClientResponseEventInterface) {}
}

export const RESPONSE_AUTH_ERROR = '[HTTP_CLIENT] Response authorization error';
export class ResponseAuthError implements Action {
  readonly type = RESPONSE_AUTH_ERROR;
  constructor(public payload: HttpClientResponseEventInterface) {}
}

export const RESPONSE_FAIL = '[HTTP_CLIENT] Response fail';
export class ResponseFail implements Action {
  readonly type = RESPONSE_FAIL;
  constructor(public payload: HttpClientResponseEventInterface) {}
}

export const REQUEST_FAIL = '[HTTP_CLIENT] Request fail';
export class RequestFail implements Action {
  readonly type = REQUEST_FAIL;
  constructor(public payload: Request) {}
}

export type Actions =
  ResponseSuccess |
  ResponseError |
  ResponseAuthError |
  ResponseFail |
  RequestFail;
