import EventEmitter from "events";

export interface IMQImpl<T> extends EventEmitter {
  push: (data: T) => void | Promise<unknown>;
  take: () => Promise<T> | T;
}
