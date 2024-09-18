import { Platform, PlatformApplicationManager } from "./types";

export class MacApplicationManager implements PlatformApplicationManager {
    platform: string = Platform.mac;
    extensions: string[] = [];
    searchDirectories: string[] = [];

    constructor() {
    }
}