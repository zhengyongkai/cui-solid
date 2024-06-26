import { Accessor, createSignal } from 'solid-js';

export type useFormProps = {
  isValid(): boolean;
  getFormData(): any;
  setFormData(mData: any, check?: boolean): void;
  setCheckValid(name: string, checkFn: Function): void;
  getValidation(name: string): any;
  getMessage(name: string): any;
  bindController(name: string, v: any, setV: Accessor<any>): void;
  setClearValid(name: string, clearFn: Function): void;
  clearValidates(name?: string): void;
  [key: string]: any;
};

export interface useFormParams<T extends Object> {
  data: T;
  validation?: any;
  message?: any;
}

function useForm<T extends Object>({
  data: current,
  validation = {},
  message = {},
}: useFormParams<T>): useFormProps {
  const elementsChecks: any = {};
  const elementsClears: any = {};
  const controllers: Map<string, any> = new Map<string, any>();
  const [data, setData] = createSignal(current);
  // const [current, setData] = createSignal(data);
  /**
   * 单字段验证
   * @param name
   * @returns
   */
  const isValid = async () => {
    const names = Object.keys(elementsChecks);
    let valid = true;
    for (let name of names) {
      const check = elementsChecks[name];

      if (!(await check(newData[name]))) {
        valid = false;
      }
    }
    return valid;
  };
  const checkField = async (name: string) => {
    const check = elementsChecks[name];
    if (check && !(await check(newData[name]))) {
      return false;
    }
    return true;
  };
  const getValidation = function (name: string) {
    return validation ? validation[name] : {};
  };
  const getMessage = function (name: string) {
    return message ? message[name] : {};
  };
  const getFormData = function () {
    const keys = data();
    return keys;
  };
  const setFormData = function (mData: any) {
    const keys = Object.keys(current);

    keys.forEach((key) => {
      newData[key] = mData[key];
      set(key, mData[key]);
      setData(mData);
    });
  };
  const setCheckValid = (name: string, checkFn: Function) => {
    elementsChecks[name] = checkFn;
  };

  const setClearValid = (name: string, clearFn: Function) => {
    elementsClears[name] = clearFn;
  };

  /**
   * 清空校验
   * @param name
   */
  const clearValidates = (name?: string) => {
    if (name) {
      const fn = elementsClears[name];
      if (fn) {
        fn();
      }
    } else {
      const names = Object.keys(elementsClears);
      for (let name of names) {
        const fn = elementsClears[name];
        if (fn) {
          fn();
        }
      }
    }
  };

  const set = (name: string, value: any) => {
    console.log(controllers.has(name));
    if (controllers.has(name)) {
      const [_v, setV] = controllers.get(name);
      setData({
        ...data(),
        [name]: value,
      } as Exclude<T & {}, Function>);
      setV(value);
    }
  };
  const bindController = (name: string, v: any, setV: Function) => {
    controllers.set(name, [v, setV]);
  };
  const newData: any = {
    isValid,
    data,
    getFormData,
    setFormData,
    setCheckValid,
    getValidation,
    getMessage,
    bindController,
    setClearValid,
    clearValidates,
    checkField,
    current,
  };
  const ret = new Proxy(newData, {
    get(target, prop: string) {
      if (controllers.has(prop)) {
        const [v] = controllers.get(prop);
        return v();
      }
      return target[prop];
    },
    set(target, prop: string, value) {
      target[prop] = value;
      set(prop, value);
      console.log('object');
      let check = elementsChecks[prop];

      check && check(value);
      return true;
    },
  });
  return ret;
}
export default useForm;
