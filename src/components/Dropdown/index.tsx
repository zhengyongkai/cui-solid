import { createComputed, createContext, createSignal, onCleanup, onMount, Show, useContext } from "solid-js";
import { Portal } from "solid-js/web";
import { useClassList } from "../utils/useProps";
import createModel from "../utils/createModel";
import usePortal from "../utils/usePortal";
import useAlignPostion from "../utils/useAlignPostion";
import { useClickOutside } from "../utils/useClickOutside";
import usezIndex from "../utils/usezIndex";
import { useTransition } from "../utils/useTransition";

export * from './DropdownMenu';
export * from './DropdownItem';

const DropdownContext = createContext();

export const useDropdownConext = () => useContext(DropdownContext);

type DropdownProps = {
    trigger?: 'hover'|'click'|'contextMenu'|'custom',
    align?: 'bottom'|'bottomLeft'|'bottomRight'|'right'|'left'|'rightTop'|'leftTop',
    classList?:any,
    class?:any,
    style?:any,
    onSelect?: Function,
    children: any,
    menu?: any,
    visible?: boolean|Function[],
    transfer?: boolean,
    theme?: 'dark'|'light',
    disabled?: boolean,
    revers?: boolean,
    handler?: string,
    fixWidth?: boolean,
    onBeforeDrop?: Function
}

export function Dropdown(props: DropdownProps){
    const [visible, setVisible] = createModel(props, 'visible', false);
    const [opened, setOpened] = createSignal(visible());
    let targetEle: any;
    let target: any;
    let trigger = props.trigger || 'hover';
    let timer: any;
    let align = props.align || 'bottom';
    let wrap: any;
    const zindex = usezIndex();
    const revers = props.revers ?? true;
    const classList = () => useClassList(props, 'cm-dropdown', {
        // 'cm-dropdown-open': visible(),
        [`cm-dropdown-${props.theme}`]: props.theme,
    });

    const transition = useTransition({
        el: ()=> wrap,
        startClass: 'cm-dropdown-visible',
        activeClass: 'cm-dropdown-open',
        onLeave: () => {
            setOpened(false);
        },
        onEnter: () => {
            setOpened(true);
        }
    })

    createComputed(() => {
        const v = visible();
        if (v) {
            transition.enter();
            // props.onShow && props.onShow();
        } else {
            transition.leave();
        }
    })

    // 防抖
    const clearDelayTimer = () => {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
    }

    // 点击显示
    const onMouseClick = (e: any) => {
        if (!target.nextElementSibling.contains(e.target)) {
            return false;
        }

        if (props.disabled) {
            return;
        }
        
        e.preventDefault && e.preventDefault();
        e.stopPropagation && e.stopPropagation();
        targetEle = e.target;
        if (props.handler) {
            const te = targetEle.closest(props.handler);
            if (!te) {
                return;
            }
        }
        const ret = props.onBeforeDrop && props.onBeforeDrop(visible());
        if (ret === undefined || ret) {
            setVisible(!visible());
        }
    }

    const onMouseEnter = () => {
        if (props.disabled) {
            return;
        }
        if (trigger === 'hover') {
            clearDelayTimer();
            setVisible(true);
            if (wrap) {
                // dropdown容器注册划走事件进行关闭
                wrap.removeEventListener('mouseleave', onMouseLeave);
                wrap.addEventListener('mouseleave', onMouseLeave, false);
            }
        }
    }
    const onMouseLeave = () => {
        if (props.disabled) {
            return;
        }
        if (trigger === 'hover') {
            timer = setTimeout( () => {
                setVisible(false);
            }, 200);
        }
    }

    const getOffsetWidth = (align: string, rect: any) => {
        if (align === 'bottomRight' || align === 'topRight') {
            return 0;
        }
        if (align === 'top' || align === 'bottom') {
            return rect.width / 2;
        }
        if (align === 'topLeft' || align === 'bottomLeft') {
            return rect.width;
        }
        if (align === 'left' || align === 'leftTop' || align === 'leftBottom') {
            return 0;
        }
        if (align === 'right' || align === 'rightTop' || align === 'rightBottom') {
            return rect.width;
        }
    }

    const getOffsetHeight = (align: string, rect: any) => {
        if (align === 'leftBottom' || align === 'rightBottom') {
            return 0;
        }
        if (align === 'top' || align === 'topLeft' || align === 'topRight') {
            return 0;
        }
        if (align === 'leftTop' || align === 'rightTop') {
            return rect.height;
        }
        if (align === 'left' || align === 'right') {
            return rect.height / 2;
        }
        if (align === 'bottom' || align === 'bottomLeft' || align === 'bottomRight') {
            return rect.height;
        }
    }

    const posStyle = () => {
        opened()
        if (target && target.nextElementSibling) {
            let te = target.nextElementSibling;
            if (props.handler) {
                te = targetEle.closest(props.handler);
            }
            if (!te) {
                return;
            }
            const parent = te.offsetParent;
            if (!parent) {
                return;
            }
            const parentPos = parent.getBoundingClientRect();
            const pos: any = useAlignPostion(align, te);
            const originTop = pos.top;
            const originLeft = pos.left;
            if (props.transfer) {
                const targetReact = te.getBoundingClientRect();
                pos.top = pos.top + document.documentElement.scrollTop;
                pos.left = pos.left + document.documentElement.scrollLeft;
                props.fixWidth ? pos['min-width'] = targetReact.width + 'px' : false;
            } else {
                pos.top = pos.top + parent.scrollTop - parentPos.top;
                pos.left = pos.left + parent.scrollLeft - parentPos.left;
            }

            const rect = wrap.getBoundingClientRect();
            const offsetWidth = getOffsetWidth(align, rect);
            const offsetHeight = getOffsetHeight(align, rect);
            const h = originTop + offsetHeight;
            const w = originLeft + offsetWidth;
            
            const containerHeight = window.innerHeight || document.documentElement.clientHeight;
            const containerWidth = window.innerWidth || document.documentElement.clientWidth;
            const targetRect = te.getBoundingClientRect();
            
            if (revers) {
                if (h > containerHeight) {
                    if (align === 'bottom' || align === 'bottomLeft' || align === 'bottomRight') {
                        pos.top = pos.top - rect.height - targetRect.height - 12;
                    } else if (align === 'left' || align === 'right') {
                        pos.top = pos.top - (rect.height - targetRect.height) / 2;
                    } else if (align === 'leftTop' || align === 'rightTop') {
                        pos.top = pos.top - (rect.height - targetRect.height);
                    }
                }
                // align 为 top bottom topLeft bottomLeft right rightTop rightBottom 存在该情况
                if (w > containerWidth - 5) {
                    if (align === 'bottom') {
                        pos.left = pos.left - (rect.width - targetRect.width) / 2;
                    } else if (align === 'bottomLeft') {
                        pos.left = pos.left - rect.width + targetRect.width;
                    } else if (align === 'right' || align === 'rightTop') {
                        pos.left = pos.left - rect.width - targetRect.width;
                    }
                }
            }
            pos.top = pos.top + 'px'
            pos.left = pos.left + 'px'

            pos['z-index'] = zindex;

            return pos;
        }
    };

    let removeClickOutside: Function;
    onMount(() => {
        if (target.nextElementSibling) {
            if (trigger === 'hover') {
                target.nextElementSibling.addEventListener('mouseenter', onMouseEnter, false);
                target.nextElementSibling.addEventListener('mouseleave', onMouseLeave, false);
            }
            if (trigger === 'click' || trigger === 'custom') {
                document.addEventListener('click', onMouseClick);
                // target.nextElementSibling.addEventListener('click', onMouseClick);
                if (trigger === 'click') {
                    const other = props.handler ? target.nextElementSibling.querySelectorAll(props.handler) : target.nextElementSibling;
                    removeClickOutside = useClickOutside([wrap, other], () => {
                        setVisible(false);
                    });
                }
            }
            if (trigger === 'contextMenu') {
                document.addEventListener('contextmenu', onMouseClick);
                // target.nextElementSibling.addEventListener('contextmenu', onMouseClick);
                const other = props.handler ? target.nextElementSibling.querySelectorAll(props.handler) : target.nextElementSibling;
                removeClickOutside = useClickOutside([wrap, other], () => {
                    setVisible(false);
                });
            }
        }
    });

    onCleanup(() => {
        if (target.nextElementSibling) {
            if (trigger === 'hover') {
                target.nextElementSibling.removeEventListener('mouseenter', onMouseEnter);
                target.nextElementSibling.removeEventListener('mouseleave', onMouseLeave);
            }
            if (trigger === 'click' || trigger === 'custom') {
                document.removeEventListener('click', onMouseClick);
                // target.nextElementSibling.removeEventListener('click', onMouseClick, false);
            }
            if (trigger === 'contextMenu') {
                document.removeEventListener('contextmenu', onMouseClick);
                // target.nextElementSibling.removeEventListener('contextmenu', onMouseClick, false);
            }
        }
        removeClickOutside && removeClickOutside();
    });

    const onSelect = (name: string) => {
        props.onSelect && props.onSelect(name);
        wrap.removeEventListener('mouseleave', onMouseLeave);
        setVisible(false);
    }

    const id = 'cm-dropdown-portal';
    return <>
        <span ref={target} style={{display: 'none'}}></span>
        {props.children}
        <Show when={props.transfer} fallback={
            <DropdownContext.Provider value={{onSelect}}>
                <div style={posStyle()} classList={classList()} x-placement={align}
                onMouseEnter={onMouseEnter} ref={wrap}>
                    {props.menu}
                </div>
            </DropdownContext.Provider>
        }>
            <Portal mount={usePortal(id, id)}>
                <DropdownContext.Provider value={{onSelect}}>
                    <div style={posStyle()} classList={classList()} x-placement={align}
                    onMouseEnter={onMouseEnter} ref={wrap}>
                        {props.menu}
                    </div>
                </DropdownContext.Provider>
            </Portal>
        </Show>
    </>
}