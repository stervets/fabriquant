import _ from 'underscore';
import {onMounted, onBeforeUnmount} from 'vue';
import {getComponentInstance} from "@/composables/utils";

const THROTTLE_FRAMERATE = 1000 / 20;

export default () => {
    let ctx: ComponentInstance;
    let $scroll: HTMLElement;

    const handleScrollThrottled = _.throttle((scrollTop: number) => {
        ctx.emit('scrollThrottled', scrollTop);
    }, THROTTLE_FRAMERATE, {
        leading: true,
        trailing: true
    });

    const handleScroll = () => {
        const scrollTop = $scroll.scrollTop;
        //application.state.scrollTop = scrollTop;
        ctx.emit('scroll', scrollTop);
        handleScrollThrottled(scrollTop);
    };

    const handleResize = _.throttle(() => {
        ctx.emit('resize', (application.state.windowWidth = window.innerWidth));
    }, THROTTLE_FRAMERATE, {
        leading: true,
        trailing: true
    });

    onMounted(() => {
        ctx = getComponentInstance();
        $scroll = ctx.$el as HTMLElement;
        //$scroll.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleResize);
    });

    onBeforeUnmount(() => {
        //$scroll.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
    });
}
