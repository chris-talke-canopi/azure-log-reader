import { msalInstance } from "./msal-config";

const hostname = ['localhost', '127.0.0.1'].includes(window.location.hostname) ? 'http://localhost:7878' : '';

async function getToken() {
    const account = msalInstance.getAllAccounts()[0];
    const request: SilentRequest = {
        scopes: ["api://b61c9a95-25eb-468b-9ee4-cc63468d67b9/authenticate"],
        account: account,
    };

    const msal_response = await msalInstance.acquireTokenSilent(request);
    const accessToken = msal_response.accessToken;

    return accessToken;
}
 
export const api = {

    getTenants : async () => {
        try {

            const accessToken = await getToken();

            const url = `${hostname}/api/tenants/`;
            const response = await fetch(url,{
                headers: {
                    Authorization : `Bearer ${accessToken}`
                }
            });
            const data = await response.json();
            
            return data;
        } 
        
        catch (error) {
            console.error(error);
            return null;
        }
    },

    getReferences : async (tenantId: string, startDate : undefined | Date , endDate : undefined | Date = undefined) => {
        try {
            const url = `${hostname}/api/references/${tenantId}/`;
            const query = `?${[`${startDate ? `start=${encodeURIComponent(startDate.toUTCString())}` : ''}`,`${endDate ? `end=${encodeURIComponent(endDate.toUTCString())}` : ''}`].join('&')}`;

            const accessToken = await getToken();
            const response = await fetch(url + query, {
                headers: {
                    Authorization : `Bearer ${accessToken}`
                }
            });

            const data = await response.json();
            return data;
        } 
        
        catch (error) {
            console.error(error);
            return null;
        }
    },

    getOperationNames : async (tenantId: string, startDate : undefined | string , endDate : undefined | string = undefined) => {
        try {
            const url = `${hostname}/api/references/${tenantId}/operation_names`;

            let query = `?`;
            startDate ? query += `&start=${encodeURIComponent(startDate)}` : '';
            endDate ? query += `&end=${encodeURIComponent(endDate)}` : '';
                  
            const accessToken = await getToken();

            const response = await fetch(url + (query !== '?' ? query : ''), {
                headers: {
                    Authorization : `Bearer ${accessToken}`
                }
            });

            const data = await response.json();
            return data;
        } 
        
        catch (error) {
            console.error(error);
            return null;
        }
    },

    getOperationIds : async (tenantId: string, startDate : string , endDate : undefined | string = undefined, operation_names: undefined | string []) => {
        try {
            const url = `${hostname}/api/references/${tenantId}/operation_ids`;

            let query = `?`;
            startDate ? query += `&start=${encodeURIComponent(startDate)}` : '';
            endDate ? query += `&end=${encodeURIComponent(endDate)}` : '';
            operation_names ? query += `&operation_names=${encodeURIComponent(JSON.stringify(operation_names))}` : '';

            const accessToken = await getToken();

            const response = await fetch(url + (query !== '?' ? query : ''), {
                headers: {
                    Authorization : `Bearer ${accessToken}`
                }
            });
            const data = await response.json();
            return data;
        } 
        
        catch (error) {
            console.error(error);
            return null;
        }
    },

    getLogs : async (tenantId: string, operationId : string) => {
        try {
            const url = `${hostname}/api/references/${tenantId}/logs/${operationId}`;

            const accessToken = await getToken();

            const response = await fetch(url, {
                headers: {
                    Authorization : `Bearer ${accessToken}`
                }
            });
            const data = await response.json();
            
            return data;
        } 
        
        catch (error) {
            console.error(error);
            return null;
        }
    }

}