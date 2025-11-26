import {
    LAYOUTS,
    PAGES_WITHOUT_AUTHORIZATION,
    RESTRICTED_BROWSERS,
    LOCAL_STORAGE_NAME
} from "@/composables/const";
import application from "@/composables/application";
import applicationMixins from './app.mixins';
import {getComponentInstance} from "@/composables/utils";
import type {
    ApplicationState,
} from "@/composables/types";
import {watch} from 'vue';
import dayjs from 'dayjs';
import {ws} from './composables/classes/ws';

export default {
    async setup() {
        const applicationVariables = {
            application,
            layout: ref('unauthorized'),
            unwatchUserData: null,
            ...applicationMixins
        };

        const ctx = getComponentInstance();

        let store = localStorage.getItem(LOCAL_STORAGE_NAME);
        if (store) {
            try {
                store = JSON.parse(store);
            } catch (e) {
                store = null as any
            }
        }

        /*
            MAKE APPLICATION GLOBAL VARIABLES
         */
        Object.assign(application, {
            config: useRuntimeConfig().public,
            state: reactive({
                isAuthorized: false,
                showLoader: true,
                windowWidth: window.innerWidth,
            } as ApplicationState),
            store: reactive(store || {}),

            route(link: string) {
                (ctx.$nuxt.$router as any).push(`/${link}`);
            }
        });

        dayjs.locale('ru');
        const onApplicationStateChange = () => {
            localStorage.setItem(LOCAL_STORAGE_NAME, JSON.stringify(application.store));
        };

        watch(application.store, onApplicationStateChange, {deep: true});
        !store && onApplicationStateChange();

        application.state.bots = (await ws.request('getBotsList') || []);
        console.log(111, application.store.selectedBotId);
        (!(application.store.selectedBotId &&
            application.state.bots.find(b=>b.id === application.store.selectedBotId)
        )) &&
        (application.store.selectedBotId = application.state.bots[0].id);
        return applicationVariables;
    },

    watch: {
        $route: 'onRouteChanged'
    },

    async created(this: any) {
        await this.onRouteChanged();
        this.on('logout', this.logout);
    },

    mounted(this: any) {
        document.addEventListener('keydown', (e) => {
            this.emit('keydown', e);
        });
        console.log('Application has been started');
    },

    methods: {
        async onRouteChanged(this: any) {
            const page = this.$nuxt.$router.currentRoute.value.name.split('_')[0];
            this.layout = LAYOUTS[page] || 'main';
            if (application.state.isAuthorized) return;

            const fullPath = this.$nuxt.$router.currentRoute.value.fullPath.substring(1);
            const pageRequiresAuthorization = !~PAGES_WITHOUT_AUTHORIZATION.indexOf(page);

            if (this.isRestrictedBrowser() && page !== 'wrong-browser') {
                application.route('wrong-browser');
            } else {
                if (pageRequiresAuthorization) {
                    try {

                    } catch (e: any) {
                        console.error(e.message);
                        this.logout(fullPath);
                        return;
                    }
                }
            }
            application.state.showLoader = false;
        },

        logout(this: any, fullPath?: string) {
            application.route('login' + (fullPath ? `?path=${fullPath}` : ''));
        },

        isRestrictedBrowser(this: any) {
            const userAgent = window.navigator.userAgent;
            return RESTRICTED_BROWSERS.find((print: string) => {
                return ~userAgent.indexOf(print);
            });
        }
    }
}
