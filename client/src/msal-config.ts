import { PublicClientApplication, type AccountInfo, type RedirectRequest } from "@azure/msal-browser";
import { reactive } from "vue";

export const msalConfig = {
    auth: {
        clientId: "b61c9a95-25eb-468b-9ee4-cc63468d67b9",
        authority: "https://login.microsoftonline.com/b73d43fc-a438-40e8-809d-0d591fad6e5c",
        redirectUri: window.location.origin,
        postLogoutUri: window.location.origin,
    },
    cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: true,
    },
};

export const graphScopes: RedirectRequest = {
    scopes: ["user.read", "openid", "profile"],
};

export const state = reactive({
    isAuthenticated: false,
    user: null as AccountInfo | null,
    roles: [] as string[],
});

export const msalInstance = new PublicClientApplication(msalConfig);
