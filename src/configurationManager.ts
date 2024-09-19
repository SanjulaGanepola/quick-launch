import { ConfigurationTarget, workspace } from "vscode";

export namespace ConfigurationManager {
    export const group: string = "QuickLaunch";

    export enum Section {
        favoriteApplications = "favoriteApplications"
    }

    export function initialize() {
    }

    export function get<T>(section: Section) {
        return workspace.getConfiguration(ConfigurationManager.group).get(section) as T;
    }

    export function set(section: Section, value: any) {
        return workspace.getConfiguration(ConfigurationManager.group).update(section, value, ConfigurationTarget.Global);
    }
}