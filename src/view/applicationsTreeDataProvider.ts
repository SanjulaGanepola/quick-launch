import { CancellationToken, commands, env, EventEmitter, ExtensionContext, ThemeIcon, TreeDataProvider, TreeItem, Uri, window } from "vscode";
import { ApplicationManager } from "../applicationManager/applicationManager";
import ApplicationTreeItem from "./application";
import { ApplicationsTreeItem } from "./applicationsTreeItem";

export default class ApplicationsTreeDataProvider implements TreeDataProvider<ApplicationsTreeItem> {
    private _onDidChangeTreeData = new EventEmitter<ApplicationsTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
    public static VIEW_ID = 'applications';

    constructor(context: ExtensionContext) {
        context.subscriptions.push(
            commands.registerCommand(`quickLaunch.addApplication`, async () => {
            }),
            commands.registerCommand(`quickLaunch.launchApplication`, async (applicationTreeItem?: ApplicationTreeItem) => {
                if (applicationTreeItem) {
                    await env.openExternal(Uri.parse(applicationTreeItem.application.path));
                } else {
                    const installedApplications = await ApplicationManager.getInstalledApplications();
                    if (installedApplications) {
                        const items = installedApplications.map(application => {
                            return {
                                iconPath: new ThemeIcon('rocket'),
                                label: application.name,
                                application: application
                            }
                        });

                        const selected = await window.showQuickPick(items, {
                            title: 'Select the application to launch',
                            placeHolder: 'Application'
                        });

                        if (selected) {
                            await env.openExternal(Uri.parse(selected.application.path));
                        }
                    } else {
                        window.showErrorMessage('No applications found');
                    }
                }
            })
        );
    }

    refresh(element?: ApplicationsTreeItem) {
        this._onDidChangeTreeData.fire(element);
    }

    getTreeItem(element: ApplicationsTreeItem): ApplicationsTreeItem | Thenable<ApplicationsTreeItem> {
        return element;
    }

    async resolveTreeItem(item: TreeItem, element: ApplicationsTreeItem, token: CancellationToken): Promise<ApplicationsTreeItem> {
        if (element.getToolTip) {
            element.tooltip = await element.getToolTip();
        }

        return element;
    }

    async getChildren(element?: ApplicationsTreeItem): Promise<ApplicationsTreeItem[]> {
        if (element) {
            return element.getChildren();
        } else {
            const installedApplications = await ApplicationManager.getInstalledApplications();
            if (installedApplications) {
                return installedApplications.map(application => new ApplicationTreeItem(application));
            } else {
                return [];
            }
        }
    }
}