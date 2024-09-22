import * as path from "path";
import { Platform, PlatformApplicationManager } from "../types";

export class Linux implements PlatformApplicationManager {
    platform: string = Platform.linux;
    extensions: string[] = ["desktop"];
    directories: string[] = [];

    constructor() {
        // System-wide applications
        this.directories.push("/usr/share/applications");
        this.directories.push("/usr/share/ubuntu/applications");
        this.directories.push("/usr/share/gnome/applications");
        this.directories.push("/usr/local/share/applications");
        this.directories.push("/usr/local/applications");

        // User-specific applications
        if (process.env.HOME) {
            this.directories.push(path.join(process.env.HOME, ".local", "share", "applications"));
        }

        this.directories = this.directories.map(directory => directory.replace(/\\/g, '/'));
    }
}