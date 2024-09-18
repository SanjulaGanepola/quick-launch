import { glob } from "glob";
import * as path from "path";
import { InstalledApplication, Platform, PlatformApplicationManager } from "../types";
import { Linux } from "./linux";
import { Mac } from "./mac";
import { Windows } from "./windows";

export class ApplicationManager {
    static async getInstalledApplications(): Promise<InstalledApplication[] | undefined> {
        let applicationManager: PlatformApplicationManager;

        switch (process.platform) {
            case Platform.windows:
                applicationManager = new Windows();
                break;
            case Platform.mac:
                applicationManager = new Mac();
                break;
            case Platform.linux:
                applicationManager = new Linux();
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