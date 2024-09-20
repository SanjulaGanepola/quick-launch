import { ConfigurationTarget, workspace } from "vscode";
import { ApplicationManager } from "./applicationManager/applicationManager";

export namespace ConfigurationManager {
    export const group: string = "QuickLaunch";

    export enum Section {
        applicationDirectories = "applicationDirectories",
        applicationExtensions = "applicationExtensions",
        customApplications = "customApplications",
        favoriteApplications = "favoriteApplications"
    }

    export function initialize(): void {
        const applicationManager = ApplicationManager.getPlatformSpecificApplicationManager();
        if (!applicationManager) {
            return;
        }

        const applicationDirectories = ConfigurationManager.get<string[]>(Section.applicationDirectories);
        if (!applicationDirectories || applicationDirectories.length === 0) {
            ConfigurationManager.set(Section.applicationDirectories, applicationManager.directories);
        }

        const applicationExtensions = ConfigurationManager.get<string[]>(Section.applicationExtensions);
        if (!applicationExtensions || applicationExtensions.length === 0) {
            ConfigurationManager.set(Section.applicationExtensions, applicationManager.extensions);
        }
    }

    export function get<T>(section: Section): T {
        return workspace.getConfiguration(ConfigurationManager.group).get(section) as T;
    }

    // export function get<T>(section: Section, scope: ConfigurationScope): T {
    //     return workspace.getConfiguration(ConfigurationManager.group, scope).get(section) as T;
    // }

    export function set(section: Section, value: any): Thenable<void> {
        return workspace.getConfiguration(ConfigurationManager.group).update(section, value, ConfigurationTarget.Global);
    }
}