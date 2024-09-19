import { ThemeColor, ThemeIcon, TreeItem, TreeItemCollapsibleState, Uri } from "vscode";
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
        this.command = {
            title: 'Launch',
            command: 'quickLaunch.launch',
            arguments: [this]
        }

        if(application.favorite) {
            this.iconPath = new ThemeIcon('rocket', new ThemeColor('QuickAccess.favoriteApplication'));
            this.resourceUri = Uri.parse(`${ApplicationTreeItem.contextValue}:favorite`, true);
        } else {
            this.iconPath = new ThemeIcon('rocket');
        }
    }

    async getChildren(): Promise<ApplicationsTreeItem[]> {
        return [];
    }
}