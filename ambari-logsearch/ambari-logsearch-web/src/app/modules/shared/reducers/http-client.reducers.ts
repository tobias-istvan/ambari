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

import {initialState} from '@app/classes/models/app-state';
import {Actions, RESPONSE_AUTH_ERROR} from '@modules/shared/actions/http-client.actions';

export function reducer(state = initialState, action: Actions) {
  switch (action.type) {
    case RESPONSE_AUTH_ERROR:
      return {
        ...state,
        isAuthorized: false
      };
    default:
      return state;
  }
}
