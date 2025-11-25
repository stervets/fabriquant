import {type PublicRuntimeConfig} from "@nuxt/schema";
import {type ComponentPublicInstance} from "vue";

export type ApplicationState = { // vue.reactive in application
    isAuthorized: boolean;
    showLoader: boolean | string;
    windowWidth: number;
};

export type ApplicationStore = {
    dashboards: Record<string, Dashboard>;
}

export type Application = {
    config: PublicRuntimeConfig; // config from /config.development.ts or /config.production.ts
    state: ApplicationState;
    store: ApplicationStore;
    route: (link: string) => void;
}

export type Widget = {
    x: number;
    y: number;
    w: number;
    h: number;
    id: string;
    name: string;
    type: string;
    data: any
}

export type Dashboard = {
    id: string;
    widgets: Record<string, Widget>;
}

declare global {
    interface ComponentInstance extends ComponentPublicInstance {
        emit: (event: string, ...args: any[]) => boolean;
        on: (event: string, callback: Function) => void;
        off: (event: string, callback: Function) => void;
        transmit: (event: string, value: any) => void;
        stopTransmit: (event: string) => void;
        receive: (event: string, ...data: any[]) => any;
    }
}

export type RGBAColor = {
    r: number;
    g: number;
    b: number;
    a: number;
};