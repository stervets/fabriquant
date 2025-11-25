import {onMounted} from 'vue';
import {getComponentInstance} from "@/composables/utils";

const THROTTLE_FRAMERATE = 1000 / 30;

export default () => {

    let ctx: ComponentInstance;

    onMounted(async () => {
        ctx = getComponentInstance();

        const images = [...ctx.$el.querySelectorAll('img')];

        await Promise.all(images.map((image: HTMLImageElement) => new Promise((resolve) => {
            if (image.complete) {
                resolve('ok');
                return;
            }

            image.addEventListener('load', resolve);
            image.addEventListener('error', () => {
                const error = `Error loading image: ${image.src}`
                console.error(error);
                resolve(error);
            });
        })));
        ctx.emit('pageLoaded');
    });
}
