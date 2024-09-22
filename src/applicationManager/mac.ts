import * as path from "path";
import { Platform, PlatformApplicationManager } from "../types";

export class Mac implements PlatformApplicationManager {
    platform: string = Platform.mac;
    extensions: string[] = ["app", "prefPane"];
    directories: string[] = [];

    constructor() {
        // System-wide applications
        this.directories.push("/Applications");
        this.directories.push("/System/Applications");
        this.directories.push("/System/Library/PreferencePanes");

        // User-specific applications
        if (process.env.HOME) {
            this.directories.push(path.join(process.env.HOME, "Applications"));
        }

        this.directories = this.directories.map(directory => directory.replace(/\\/g, '/'));
    }
}