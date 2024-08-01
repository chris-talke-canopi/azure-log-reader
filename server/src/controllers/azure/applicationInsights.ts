export interface AzureLogConfig {
    app_version: string;
    app_id: string;
    api_key: string;
}

export interface AzureLogResponse {
    tables: Array<{
        name: string;
        columns: Array<{
            name: string;
            type: string;
        }>;
        rows: Array<[string, number]>;
    }>;
}

/**
 * Gets unique Operation Names (function names) that had traces over the last 28 days.
 * @param {AzureLogConfig} config
 * @returns {Promise<null | AzureLogResponse>}
 */
export async function getOperationNames(config: AzureLogConfig) : Promise<null | string[]> {
    try {
        const { app_version, app_id, api_key } = config;

        let query = `traces | where operation_Name != "" and timestamp > ago(28d) | distinct operation_Name | order by operation_Name asc`;
        const url = `https://api.applicationinsights.io/${app_version}/apps/${app_id}/query?query=${query}`;
        const response = await fetch(url, {
            headers: {
                "x-api-key": api_key,
                "Cache-Control": "max-age=30",
            },
        });
        let data = await response.json() as unknown as AzureLogResponse;
        let operationNames = data.tables[0].rows.map(r=>r[0]) as string[];
        return operationNames;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export interface UTC_Timestamps {
    start?: string
    end?: string
}

/**
 * Gets unique Operation Ids (function instance ids) that had traces over the last 28 days.
 * @param {AzureLogConfig} config
 * @param {undefined | UTC_Timestamps} timestamps
 * @param {undefined | string[]} operationNames
 * @returns {Promise<null | AzureLogResponse>}
 */
export async function getOperationIds(config: AzureLogConfig, timestamps : undefined | UTC_Timestamps, operationNames : string [] = []) : Promise<null | AzureLogResponse> {
    try {
        const { app_id, app_version, api_key } = config;


        let query = [
            `${ operationNames.length > 0 ? `let operationNames = dynamic(${JSON.stringify(operationNames)});` : ''}`,
            `let uniqueOperations = traces `,
            `| where operation_Id != ""`, 
            `  and ${operationNames.length > 0 ? `operation_Name in (operationNames)` : 'operation_Name != ""'}`,
            `      ${timestamps === undefined ? 'and timestamp > ago(28d)' : ''} `,
            `      ${timestamps !== undefined && timestamps.start !== undefined ? `and timestamp > datetime_local_to_utc(datetime('${timestamps?.start}'), 'Australia/Sydney')` : ``}`,
            `      ${timestamps !== undefined && timestamps.end !== undefined ? `and timestamp < datetime_local_to_utc(datetime('${timestamps?.end}'), 'Australia/Sydney')` : ``}`,
            `| summarize earliest_timestamp = min(timestamp) by operation_Id; `,
            `let emailPattern = @"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"; `,
            `uniqueOperations `,
            `| join kind=inner (`,
            `    traces `,
            `    | where timestamp > ago(28d) `,
            `    | extend email = extract(emailPattern, 0, message) `,
            `    | where isnotempty(email) or email == "" `,
            `    | summarize `,
            `        email = any(email),`,
            `        action_count = countif(message contains "ACTION"),`,
            `        error_count = countif(message contains "CANOPI ERROR"),`,
            `        created_updated_count = countif(message contains "CREATED" or message contains "updated to"),`,
            `        operation_Name = any(operation_Name)`,
            `    by operation_Id`,
            `) on operation_Id `,
            `| order by earliest_timestamp desc `,
            `| project operation_Name, operation_Id, email, action_count, error_count, created_updated_count, earliest_timestamp `,
            `| limit 1000;`
        ].join('');

        const url = `https://api.applicationinsights.io/${app_version}/apps/${app_id}/query?query=${encodeURIComponent(query)}`;
        const response = await fetch(url, {
            headers: {
                "x-api-key": api_key,
                "Cache-Control": "max-age=30",
            },
        });
        const data = response.json() as Promise<AzureLogResponse>;

        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

/**
 * Gets logs from Azure Insight Logs by filtering by a 'start' and 'end' datetime.
 * @param {AzureLogConfig} config
 * @param {string} startDateTime
 * @param {undefined | string} endDatetime
 * @returns {Promise<null | AzureLogResponse>}
 */
export async function getLogsByDate(config: AzureLogConfig, startDateTime: string, endDatetime: undefined | string) : Promise<null | AzureLogResponse> {
    try {
        const { app_id, app_version, api_key } = config;

        let query = `traces | project timestamp, operation_Name, operation_Id, message, cloud_RoleName`;
        query += `       | where timestamp > datetime(${startDateTime}) ${endDatetime ? ` and timestamp < datetime(${endDatetime}) ` : ""} and operation_Id != "" and operation_Name != ""`.trim();
        query += `       | order by timestamp asc `.trim();

        const url = `https://api.applicationinsights.io/${app_version}/apps/${app_id}/query?query=${encodeURIComponent(query)}`;
        const response = await fetch(url, {
            headers: {
                "x-api-key": api_key,
                "Cache-Control": "max-age=30",
            },
        });
        const data = response.json() as Promise<AzureLogResponse>;

        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

/**
 * Gets logs from Azure Insight Logs by filtering on 'operation_id' AND 'operation_Name'
 * @param {AzureLogConfig} config
 * @param {string} operation_Id
 * @param {string} operation_Name
 * @returns {Promise<null | AzureLogResponse>}
 */
export async function getLogsByOperation(config: AzureLogConfig, operation_Id: string, operation_Name: undefined | string) : Promise<null | AzureLogResponse> {
    try {
        const { app_id, app_version, api_key } = config;

        let filter = [`${operation_Id ? `operation_Id == "${operation_Id}"` : ""}`, `${operation_Name ? `operation_Name == "${operation_Name}"` : ""}`].join(" and ");

        let query = `traces | project timestamp, operation_Name, operation_Id, message, cloud_RoleName`;
        query += `       | where ${filter}`.trim();
        query += `       | order by timestamp asc`.trim();

        const url = `https://api.applicationinsights.io/${app_version}/apps/${app_id}/query?query=${encodeURIComponent(query)}`;
        const response = await fetch(url, {
            headers: {
                "x-api-key": api_key,
                "Cache-Control": "max-age=30",
            },
        });
        const data = response.json() as Promise<AzureLogResponse>;

        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

/**
 * Gets logs from Azure Insight Logs by filtering on 'operation_id' AND 'operation_Name'
 * @param {AzureLogConfig} config
 * @param {string} operation_Id
 * @param {string} operation_Name
 * @returns {Promise<null | AzureLogResponse>}
 */
export async function getLogsByOperationId(config: AzureLogConfig, operation_Id: string) : Promise<null | AzureLogResponse> {
    try {
        const { app_id, app_version, api_key } = config;

        let query =  `traces | project operation_Name, operation_Id, timestamp, message | where operation_Id == "${operation_Id}" | order by timestamp asc`
        const url = `https://api.applicationinsights.io/${app_version}/apps/${app_id}/query?query=${encodeURIComponent(query)}`;
        const response = await fetch(url, {
            headers: {
                "x-api-key": api_key,
                "Cache-Control": "max-age=30",
            },
        });
        const data = response.json() as Promise<AzureLogResponse>;

        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

