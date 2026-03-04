import { makeAutoObservable } from "mobx";

export class ServerRuntimeStore {
  requestCount = 0;

  constructor() {
    makeAutoObservable(this);
  }

  incrementRequestCount() {
    this.requestCount += 1;
  }
}

export const serverRuntimeStore = new ServerRuntimeStore();
