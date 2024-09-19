import { glob } from "glob";
import * as path from "path";
import { ConfigurationManager } from "../configurationManager";
import { Application, Platform, PlatformApplicationManager } from "../types";
import { Linux } from "./linux";
import { Mac } from "./mac";
import { Windows } from "./windows";

export class ApplicationManager {
    static async getInstalledApplications(): Promise<Application[] | undefined> {
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

        const favoriteApplications = ConfigurationManager.get<string[]>(ConfigurationManager.Section.favoriteApplications);
        const matches = await glob(patterns);
        return matches
            .map(match => {
                return {
                    name: path.parse(match).name,
                    path: match.replace(/\\/g, '/'),
                    favorite: favoriteApplications ? favoriteApplications.includes(path.parse(match).name) : false
                }
            })
            .filter((match, index, self) =>
                index === self.findIndex(t => t.name === match.name)
            )
            .sort((a, b) => a.name.localeCompare(b.name));
    }

    static async toggleFavoriteApplication(application: Application) {
        let favoriteApplications = ConfigurationManager.get<string[]>(ConfigurationManager.Section.favoriteApplications);
        if (favoriteApplications) {
            if (favoriteApplications.includes(application.name)) {
                favoriteApplications = favoriteApplications.filter((favoriteApplication) => {
                    return favoriteApplication !== application.name
                })
            } else {
                favoriteApplications.push(application.name);
            }
        } else {
            favoriteApplications = [application.name];
        }

        await ConfigurationManager.set(ConfigurationManager.Section.favoriteApplications, favoriteApplications);
    }
}