import { ThemeIcon, TreeItem, TreeItemCollapsibleState } from "vscode";
import { Application } from "../types";
import { ApplicationsTreeItem } from "./applicationsTreeItem";

export default class ApplicationTreeItem extends TreeItem implements ApplicationsTreeItem {
    static contextValue = 'application';
    application: Application;

    constructor(application: Application) {
        super(application.name, TreeItemCollapsibleState.Collapsed);
        this.application = application;
        this.collapsibleState = TreeItemCollapsibleState.None;
        this.tooltip = `Name: ${application.name}\nPath: ${application.path}`;
        this.contextValue = `${ApplicationTreeItem.contextValue}`;
        this.iconPath = new ThemeIcon('rocket');
        this.command = {
            title: 'Launch',
            command: 'quickLaunch.launch',
            arguments: [this]
        }
    }

    async getChildren(): Promise<ApplicationsTreeItem[]> {
        return [];
    }
}