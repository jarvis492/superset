/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import {
  buildQueryContext,
  ensureIsArray,
  QueryFormData,
  QueryObject,
} from '@superset-ui/core';
import { uniqueMetrics } from '../utils/metricBounds';

/**
 * A single ungrouped aggregate of the selected metric, mirroring the query
 * the legacy nvd3 bullet chart issued. The per-row target metric rides along
 * in the same query.
 */
export default function buildQuery(formData: QueryFormData) {
  const { metric, groupby, target_metric, marker_line_metric } = formData;
  return buildQueryContext(formData, baseQueryObject => {
    const queries: QueryObject[] = [
      {
        ...baseQueryObject,
        columns: ensureIsArray(groupby),
        metrics: uniqueMetrics(metric, target_metric),
      },
    ];
    // The chart-wide marker line is aggregated over all rows in its own
    // query rather than combined from per-group values, so non-additive
    // metrics (averages, ratios, distinct counts) stay correct.
    if (marker_line_metric) {
      queries.push({
        ...baseQueryObject,
        columns: [],
        metrics: [marker_line_metric],
        orderby: [],
      });
    }
    return queries;
  });
}
