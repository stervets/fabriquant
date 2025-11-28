import {ws} from '@/composables/classes/ws';

export default {
    async setup() {
        return {
        };
    },

    created(this: any): any {

    },

    async mounted() {
        ws.registerHandlers([
            ['frontTest', this.frontTest]
        ])
        console.log(ws.handlers);
        console.log(application.state.bots[0].id);
        console.log(544, '>>>', await ws.requestFrom(application.state.bots[0].id, 'botTest', 12, 30));
    },

    methods: {
        async frontTest(){
            await timeout(2000);
            return 1001;
        },

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
