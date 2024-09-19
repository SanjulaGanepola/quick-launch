import * as path from "path";
import { Platform, PlatformApplicationManager } from "../types";

export class Windows implements PlatformApplicationManager {
    platform: string = Platform.windows;
    extensions: string[] = ["exe", "lnk"];
    directories: string[] = [];

    constructor() {
        // Shared start menu applications
        if (process.env.PROGRAMDATA) {
            this.directories.push(path.join(process.env.PROGRAMDATA, 'Microsoft', 'Windows', 'Start Menu', 'Programs').replace(/\\/g, '/'));
        }

        // User specific start menu applications
        if (process.env.APPDATA) {
            this.directories.push(path.join(process.env.APPDATA, 'Microsoft', 'Windows', 'Start Menu', 'Programs').replace(/\\/g, '/'));
        }
    }
}