import { MarkdownString, TreeItem } from "vscode";

export interface ApplicationsTreeItem extends TreeItem {
    getChildren: () => ApplicationsTreeItem[] | Promise<ApplicationsTreeItem[]>;

    getToolTip?: () => Promise<MarkdownString | string | undefined>;
}