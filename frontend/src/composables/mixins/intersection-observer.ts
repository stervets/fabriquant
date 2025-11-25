import {getComponentInstance} from "@/composables/utils";

export const intersectionObserver = function (callbackFunction: ((isIntersected: boolean) => void) | string | null = null, parentElement: HTMLElement | string | null = null, observeOnMounted: boolean = true) {
    let observer: IntersectionObserver | null = null;

    const startObserve = (callbackFunctionOverride: ((isIntersected: boolean) => void) | string | null = null, parentElementOverride: HTMLElement | string | null = null) => {
        const ctx = getComponentInstance();
        const parent = parentElementOverride || parentElement || ctx.$el.parentElement;
        const callback = callbackFunctionOverride || callbackFunction || (() => undefined);
        observer = new IntersectionObserver((entries) => {
            const cb: Function = typeof callback === 'string' ? (ctx as unknown as Record<string, Function>)[callback] : callback;
            cb && cb(entries[0]?.isIntersecting);
        }, {
            root: typeof parent === 'string' ? ctx.$el.querySelector(parent) : parent
        });
        observer.observe(ctx.$el);
    }

    const stopObserve = () => {
        observer?.disconnect();
    }
    onBeforeUnmount(stopObserve);

    observeOnMounted && (onMounted(() => {
        startObserve();
    }));

    return {startObserve, stopObserve};
}
