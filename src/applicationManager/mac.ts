import { Platform, PlatformApplicationManager } from "../types";

export class Mac implements PlatformApplicationManager {
    platform: string = Platform.mac;
    extensions: string[] = [];
    searchDirectories: string[] = [];

    constructor() {
    }
}