import { ConfigurationTarget, workspace } from "vscode";
import { ApplicationManager } from "./applicationManager/applicationManager";

export namespace ConfigurationManager {
    export const group: string = "QuickLaunch";

    export enum Section {
        applicationDirectories = "applicationDirectories",
        applicationExtensions = "applicationExtensions",
        favoriteApplications = "favoriteApplications"
    }

    export function initialize() {
        const applicationManager = ApplicationManager.getPlatformSpecificApplicationManager();
        if (!applicationManager) {
            return;
        }

        const directories = ConfigurationManager.get<string[]>(Section.applicationDirectories);
        if (!directories || directories.length === 0) {
            ConfigurationManager.set(Section.applicationDirectories, applicationManager.directories);
        }

        const extensions = ConfigurationManager.get<string[]>(Section.applicationExtensions);
        if (!extensions || extensions.length === 0) {
            ConfigurationManager.set(Section.applicationExtensions, applicationManager.extensions);
        }
    }

    export function get<T>(section: Section) {
        return workspace.getConfiguration(ConfigurationManager.group).get(section) as T;
    }

    export function set(section: Section, value: any) {
        return workspace.getConfiguration(ConfigurationManager.group).update(section, value, ConfigurationTarget.Global);
    }
}