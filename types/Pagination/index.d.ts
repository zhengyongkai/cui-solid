export interface PaginationProps {
    classList?: any;
    class?: any;
    shape?: 'normal' | 'circle';
    size?: 'small' | 'large';
    current: number;
    total: number;
    pageSize: number;
    onChange?: Function;
    onChangePageSize?: Function;
    innerNear?: number;
    displayedPages?: number;
    startEndShowNum?: number;
    showNums?: boolean;
    mini?: boolean;
    style?: any;
    showTotal?: boolean;
    showPage?: boolean;
    showJumper?: boolean;
    pages?: any[];
}
export declare function Pagination(props: PaginationProps): import("solid-js").JSX.Element;
export default Pagination;
