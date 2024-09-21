import { ThemeColor, ThemeIcon, TreeItem, TreeItemCollapsibleState, Uri } from "vscode";
import { Application } from "../types";
import { ApplicationsTreeItem } from "./applicationsTreeItem";

export default class ApplicationTreeItem extends TreeItem implements ApplicationsTreeItem {
    static contextValue = 'application';
    application: Application;

    constructor(application: Application) {
        super(application.name, TreeItemCollapsibleState.Collapsed);
        this.application = application;
        this.description = application.keyboardShortcut ? `(${application.keyboardShortcut})` : undefined;
        this.collapsibleState = TreeItemCollapsibleState.None;
        this.tooltip = `Name: ${application.name}\nPath: ${application.path}`;
        this.command = {
            title: 'Launch',
            command: 'quickLaunch.launch',
            arguments: [this]
        }
        this.contextValue = `${ApplicationTreeItem.contextValue}` +
            (application.favorite ? '_favorite' : '_unfavorite') +
            (application.custom ? '_custom' : '_builtin');
        this.iconPath = new ThemeIcon('rocket', application.favorite && application.custom ? new ThemeColor('QuickLaunch.favoriteCustomApplication') :
            (application.favorite ? new ThemeColor('QuickLaunch.favoriteApplication') : (application.custom ? new ThemeColor('QuickLaunch.customApplication') : undefined)));
        this.resourceUri = Uri.parse(`${ApplicationTreeItem.contextValue}:${application.path}?favorite=${application.favorite}&custom=${application.custom}`, true);
    }

    async getChildren(): Promise<ApplicationsTreeItem[]> {
        return [];
    }
}