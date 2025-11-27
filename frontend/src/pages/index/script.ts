import {ws} from '@/composables/classes/ws';

export default {
    async setup() {
        return {
        };
    },

    created(this: any): any {

    },

    async mounted() {

    },

    methods: {
        async createBot() {
            const bot = await ws.request('createBot');
            if (bot) {
                application.state.bots.push(bot);
                application.store.selectedBotId = bot.id;
            }
        },

        async deleteBot(id: string) {
            const bot = application.state.bots.find(b => b.id === id);
            if (!bot) throw new Error(`Can't find bot`);
            const index = application.state.bots.indexOf(bot);
            bot && (application.state.bots = await ws.request('deleteBot', id));
            application.store.selectedBotId = application.state.bots[Math.max(0, index -1)].id;
        }
    }
}
