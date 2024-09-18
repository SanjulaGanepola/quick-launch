import { Platform, PlatformApplicationManager } from "./types";

export class LinuxApplicationManager implements PlatformApplicationManager {
    platform: string = Platform.linux;
    extensions: string[] = [];
    searchDirectories: string[] = [];

    constructor() {
    }
}