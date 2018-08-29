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
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Observable';

import {
  LogsContainerUiSettingsInterface,
  defaultLogsContainerUiSettings} from '@app/components/logs-container/interfaces/logs-container-ui-settings.interface';

  @Injectable()
  export class LogsContainerUiSettingsService {

    uiSettings$: LogsContainerUiSettingsInterface = this.activatedRoute.queryParams.map((params: LogsContainerUiSettingsInterface) => {
      const settings: LogsContainerUiSettingsInterface = Object.keys(params).reduce(
        (currentSettings, key): LogsContainerUiSettingsInterface => {
          return {
            ...currentSettings,
            [key]: !/no|n|false|0/.test(params[key])
          };
        }, {}
      );
      return {
        ...defaultLogsContainerUiSettings,
        ...settings
      };
    });

    shortDomainNames$: Observable<boolean> = this.uiSettings$.map(
      (settings: LogsContainerUiSettingsInterface) => settings.shortDomainNames
    );
    showCharts$: Observable<boolean> = this.uiSettings$.map((settings: LogsContainerUiSettingsInterface): boolean => settings.showCharts);

    constructor(
      private activatedRoute: ActivatedRoute
    ) {}
  }
