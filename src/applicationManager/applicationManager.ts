import { glob } from "glob";
import * as path from "path";
import { ConfigurationManager } from "../configurationManager";
import { Application, Platform, PlatformApplicationManager } from "../types";
import { Linux } from "./linux";
import { Mac } from "./mac";
import { Windows } from "./windows";

export class ApplicationManager {
    static getPlatformSpecificApplicationManager(): PlatformApplicationManager | undefined {
        switch (process.platform) {
            case Platform.windows:
                return new Windows();
            case Platform.mac:
                return new Mac();
            case Platform.linux:
                return new Linux();
            default:
                return;
        }
    }

    static async getInstalledApplications(): Promise<Application[] | undefined> {
        const applicationManager = ApplicationManager.getPlatformSpecificApplicationManager();
        if (!applicationManager) {
            return;
        }

        const directories = ConfigurationManager.get<string[]>(ConfigurationManager.Section.applicationDirectories) || applicationManager.directories;
        const extensions = ConfigurationManager.get<string[]>(ConfigurationManager.Section.applicationExtensions) || applicationManager.extensions;

        const patterns: string[] = [];
        for (const directory of directories) {
            for (const extension of extensions) {
                patterns.push(`${directory}/**/*.${extension}`);
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
        if (favoriteApplications && favoriteApplications.length > 0) {
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