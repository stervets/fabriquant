//TODO: refactor this file just like  layout-event-listeners.ts

import {WINDOW_WIDTH} from "~/composables/const";

const SIDEBAR_PADDING = 25;
const HEADER_HEIGHT = 80;
export default async function (this: any) {
    //await nextTick();
    await timeout(500); // ensure all page elements has been drawn

    let content = this.$refs.content as HTMLElement;
    const footer = document.querySelector('#footer') as HTMLElement;
    let contentBottom = content.offsetTop + SIDEBAR_PADDING;

    const checkScrollPosition = (scrollTop: number) => {
        // Leave it for now as is, because maybe we'll put the unfixed header back.
        this.isBelowHeader = true;//scrollTop > HEADER_HEIGHT;
        if (!content) {
            content = this.$refs.content as HTMLElement;
            if (!content || window.innerWidth <= WINDOW_WIDTH.SMALL) return;
            contentBottom = content.offsetTop + SIDEBAR_PADDING;
        }

        this.isOverlapsFooter =
            (window.innerWidth > WINDOW_WIDTH.SMALL) &&
            (footer.offsetTop - scrollTop < content.clientHeight + contentBottom);
    }

    this.on('scroll', checkScrollPosition);
    this.on('resize', async () => {
        checkScrollPosition(application.state.scrollTop);
    });
    checkScrollPosition(application.state.scrollTop);
}
