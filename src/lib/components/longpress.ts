import type { ActionReturn } from 'svelte/action';


function dispatch_longpress(node: HTMLElement): void {
    node.dispatchEvent(new CustomEvent('longpress'));
}

/**
 * Adapted from https://github.com/p0lloc/perfice/blob/51ab6ea30eaa26d5f5080b503ef11e2622c75c1e/src/util/long-press.ts
 */
export function longpress(node: HTMLElement): ActionReturn<undefined, {
    onlongpress: (e: CustomEvent) => void;
}> {
    const TIME_MS = 500;
    const MOUSE_TIME_MS = 0;

    let timeout_id: number;
    let is_touch_event = false;
    let initial_touch_coords = { x: 0, y: 0 };
    let initial_y: number;
    let is_grabbed = false;
    let is_dragging = false;


    function handle_start(e: TouchEvent | MouseEvent) {
        if (!e.isTrusted) {
            return; // Prevent redispatch from infinitely looping
        }

        is_touch_event = e.type === 'touchstart';
        if (is_touch_event) {
            const event = e as TouchEvent;
            initial_y = event.touches[0].clientY;
            initial_touch_coords = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY
            };
            window.addEventListener('touchmove', handle_move_before_long, { passive: true });

            timeout_id = setTimeout(() => {
                is_grabbed = true;
                window.removeEventListener('touchmove', handle_move_before_long);
                window.addEventListener('touchmove', handle_move_after_long, { passive: false });
                dispatch_longpress(node);
                setTimeout(() => node.dispatchEvent(e), 0);
            }, TIME_MS);
        } else {
            timeout_id = setTimeout(() => {
                is_grabbed = true;
                dispatch_longpress(node);
                setTimeout(() => node.dispatchEvent(e), 0);
            }, MOUSE_TIME_MS);
        }
    }

    function handle_move_before_long(e: TouchEvent) {
        if (is_touch_event && !is_grabbed) {
            const currentY = e.touches[0].clientY;
            if (Math.abs(currentY - initial_y) > 5) {
                clearTimeout(timeout_id);
                window.removeEventListener('touchmove', handle_move_before_long);
            }
        }
    }

    function handle_move_after_long(e: TouchEvent) {
        if (!is_dragging) {
            const touch = e.touches[0];
            const deltaX = Math.abs(touch.clientX - initial_touch_coords.x);
            const deltaY = Math.abs(touch.clientY - initial_touch_coords.y);

            if (deltaX > 5 || deltaY > 5) {
                is_dragging = true;
            }
        }
    }

    function handle_end() {
        if (is_touch_event) {
            clearTimeout(timeout_id);
            window.removeEventListener('touchmove', handle_move_before_long);
            window.removeEventListener('touchmove', handle_move_after_long);
            is_grabbed = false;
            is_dragging = false;
        } else {
            clearTimeout(timeout_id);
            if (is_grabbed) {
                dispatch_longpress(node); // Trigger release
            }
            is_grabbed = false;
        }
    }

    node.style.userSelect = 'none';

    node.addEventListener('mousedown', handle_start, { passive: false });
    node.addEventListener('mouseup', handle_end);
    node.addEventListener('mouseleave', handle_end);
    node.addEventListener('touchstart', handle_start, { passive: true });
    node.addEventListener('touchend', handle_end);

    return {
        destroy: () => {
            node.removeEventListener('mousedown', handle_start);
            node.removeEventListener('mouseup', handle_end);
            node.removeEventListener('mouseleave', handle_end);
            node.removeEventListener('touchstart', handle_start);
            node.removeEventListener('touchend', handle_end);
            window.removeEventListener('touchmove', handle_move_before_long);
            window.removeEventListener('touchmove', handle_move_after_long);

            node.style.userSelect = '';
        }
    };
}
