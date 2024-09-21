import { glob } from "glob";
import * as path from "path";
import { commands, Uri } from "vscode";
import { ConfigurationManager } from "../configurationManager";
import { KeyboardShortcutsManager } from "../keyboardShortcutsManager";
import { Application, KeyboardShortcut, Platform, PlatformApplicationManager, Sort, View } from "../types";
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

        const view = ConfigurationManager.get<View>(ConfigurationManager.Section.view);
        const sort = ConfigurationManager.get<Sort>(ConfigurationManager.Section.sort);
        commands.executeCommand('setContext', 'QuickLaunch.view.favorite', view.Favorites);
        commands.executeCommand('setContext', 'QuickLaunch.view.customs', view.Customs);
        commands.executeCommand('setContext', 'QuickLaunch.view.other', view.Other);
        commands.executeCommand('setContext', 'QuickLaunch.sort.priority', sort.Priority);
        commands.executeCommand('setContext', 'QuickLaunch.sort.alphabetically', sort.Alphabetically);

        const favoriteApplications = ConfigurationManager.get<string[]>(ConfigurationManager.Section.favoriteApplications);
        const customApplications = ConfigurationManager.get<string[]>(ConfigurationManager.Section.customApplications);
        const applications = await glob(patterns);

        const filteredApplications: string[] = [];
        if (view.Customs) {
            filteredApplications.push(...customApplications);
        } else if (view.Favorites) {
            filteredApplications.push(...customApplications.filter(customApplication => favoriteApplications.includes(path.parse(customApplication).name)));
        }
        if (view.Other) {
            filteredApplications.push(...applications);
        } else if (view.Favorites) {
            filteredApplications.push(...applications.filter(application => favoriteApplications.includes(path.parse(application).name)));
        }

        let keyboardShortcuts: KeyboardShortcut[] = [];
        try {
            keyboardShortcuts = await KeyboardShortcutsManager.getKeyboardShortcuts();
        } catch (error) { }

        return filteredApplications
            .map(match => {
                const name = path.parse(match).name;
                const matchPath = match.replace(/\\/g, '/');
                return {
                    name: name,
                    path: matchPath,
                    favorite: view.Favorites && favoriteApplications && favoriteApplications.length > 0 ?
                        favoriteApplications.includes(name) : false,
                    custom: view.Customs && customApplications && customApplications.length > 0 ?
                        customApplications.includes(match) : false,
                    keyboardShortcut: keyboardShortcuts ?
                        keyboardShortcuts.find(keyboardShortcut => keyboardShortcut.args?.name === name && keyboardShortcut.args?.path === matchPath)?.key : undefined
                }
            })
            .filter((match, index, self) =>
                index === self.findIndex(t => t.name === match.name)
            )
            .sort((a, b) => {
                if (sort.Priority) {
                    if (a.favorite !== b.favorite) {
                        return a.favorite ? -1 : 1;
                    }

                    if (a.custom !== b.custom) {
                        return a.custom ? -1 : 1;
                    }
                }

                if (sort.Alphabetically) {
                    return a.name.localeCompare(b.name);
                } else {
                    return a.path.localeCompare(b.path);
                }
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
        return true;
    }

    static async toggleView(key: keyof View): Promise<void> {
        const view = ConfigurationManager.get<View>(ConfigurationManager.Section.view);
        view[key] = !view[key];
        await ConfigurationManager.set(ConfigurationManager.Section.view, view);
    }

    static async toggleSort(key: keyof Sort): Promise<void> {
        const sort = ConfigurationManager.get<Sort>(ConfigurationManager.Section.sort);
        sort[key] = !sort[key];
        await ConfigurationManager.set(ConfigurationManager.Section.sort, sort);
    }
}