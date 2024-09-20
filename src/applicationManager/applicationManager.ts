import { glob } from "glob";
import * as path from "path";
import { Uri } from "vscode";
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

    static async getApplications(): Promise<Application[]> {
        const applicationManager = ApplicationManager.getPlatformSpecificApplicationManager();
        if (!applicationManager) {
            return [];
        }

        const applicationDirectories = ConfigurationManager.get<string[]>(ConfigurationManager.Section.applicationDirectories) || applicationManager.directories;
        const applicationExtensions = ConfigurationManager.get<string[]>(ConfigurationManager.Section.applicationExtensions) || applicationManager.extensions;

        const patterns: string[] = [];
        for (const directory of applicationDirectories) {
            for (const extension of applicationExtensions) {
                patterns.push(`${directory}/**/*.${extension}`);
            }
        }

        const customApplications = ConfigurationManager.get<string[]>(ConfigurationManager.Section.customApplications);
        const favoriteApplications = ConfigurationManager.get<string[]>(ConfigurationManager.Section.favoriteApplications);
        const matches = await glob(patterns);
        return customApplications.concat(matches)
            .map(match => {
                return {
                    name: path.parse(match).name,
                    path: match.replace(/\\/g, '/'),
                    favorite: favoriteApplications && favoriteApplications.length > 0 ? favoriteApplications.includes(path.parse(match).name) : false,
                    custom: customApplications && customApplications.length > 0 ? customApplications.includes(match) : false
                }
            })
            .filter((match, index, self) =>
                index === self.findIndex(t => t.name === match.name)
            )
            .sort((a, b) => {
                // Sort by favorite first
                if (a.favorite !== b.favorite) {
                    return a.favorite ? -1 : 1;
                }

                // Sort by custom second
                if (a.custom !== b.custom) {
                    return a.custom ? -1 : 1;
                }

                // Sort alphabetically by name
                return a.name.localeCompare(b.name);
            });
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

    static async addCustomApplications(applicationUris: Uri[]): Promise<string[]> {
        let customApplications = ConfigurationManager.get<string[]>(ConfigurationManager.Section.customApplications);
        if (!customApplications) {
            customApplications = [];
        }

        let existingApplicationNames = [];

        for (const applicationUri of applicationUris) {
            const customApplicationPath = applicationUri.fsPath.replace(/\\/g, '/');
            if (!customApplications.includes(customApplicationPath)) {
                customApplications.push(customApplicationPath);
            } else {
                existingApplicationNames.push(path.parse(customApplicationPath).name);
            }
        }

        await ConfigurationManager.set(ConfigurationManager.Section.customApplications, customApplications);
        return existingApplicationNames;
    }

    static async addApplicationDirectories(directoryUris: Uri[]): Promise<string[]> {
        let applicationDirectories = ConfigurationManager.get<string[]>(ConfigurationManager.Section.applicationDirectories);
        if (!applicationDirectories) {
            applicationDirectories = [];
        }

        let existingApplicationDirectories = [];

        for (const directoryUri of directoryUris) {
            const applicationDirectoryPath = directoryUri.fsPath.replace(/\\/g, '/');
            if (!applicationDirectories.includes(applicationDirectoryPath)) {
                applicationDirectories.push(applicationDirectoryPath);
            } else {
                existingApplicationDirectories.push(applicationDirectoryPath);
            }
        }

        await ConfigurationManager.set(ConfigurationManager.Section.applicationDirectories, applicationDirectories);
        return existingApplicationDirectories;
    }

    static async addApplicationExtensions(applicationExtension: string): Promise<boolean> {
        let applicationExtensions = ConfigurationManager.get<string[]>(ConfigurationManager.Section.applicationExtensions);
        if (!applicationExtensions) {
            applicationExtensions = [];
        }

        if (!applicationExtensions.includes(applicationExtension)) {
            applicationExtensions.push(applicationExtension);
        } else {
            return false;
        }

        await ConfigurationManager.set(ConfigurationManager.Section.applicationExtensions, applicationExtensions);
        return true

    }
}