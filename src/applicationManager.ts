import { glob } from "glob";
import * as path from "path";
import { LinuxApplicationManager } from "./linuxApplicationManager";
import { MacApplicationManager } from "./macApplicationManager";
import { InstalledApplication, Platform, PlatformApplicationManager } from "./types";
import { WindowsApplicationManager } from "./windowsApplicationManager";

export class ApplicationManager {
    static async getInstalledApplications(): Promise<InstalledApplication[] | undefined> {
        let applicationManager: PlatformApplicationManager;

        switch (process.platform) {
            case Platform.windows:
                applicationManager = new WindowsApplicationManager();
                break;
            case Platform.mac:
                applicationManager = new MacApplicationManager();
                break;
            case Platform.linux:
                applicationManager = new LinuxApplicationManager();
                break;
            default:
                return;
        }

        const patterns: string[] = [];
        for (const searchDirectory of applicationManager.searchDirectories) {
            for (const extension of applicationManager.extensions) {
                patterns.push(`${searchDirectory}/**/*.${extension}`);
            }
        }

        const matches = await glob(patterns);
        return matches.map(match => {
            return {
                name: path.parse(match).name,
                path: match
            }
        })
    }
}