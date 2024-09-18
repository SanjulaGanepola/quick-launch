import { Platform, PlatformApplicationManager } from "../types";

export class Linux implements PlatformApplicationManager {
    platform: string = Platform.linux;
    extensions: string[] = [];
    searchDirectories: string[] = [];

    constructor() {
    }
}