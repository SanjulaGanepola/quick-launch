import { CancellationToken, commands, env, EventEmitter, ExtensionContext, ThemeIcon, TreeDataProvider, TreeItem, Uri, window, workspace } from "vscode";
import { ApplicationManager } from "../applicationManager/applicationManager";
import { ConfigurationManager } from "../configurationManager";
import { DecorationProvider } from "../decorationProvider";
import ApplicationTreeItem from "./application";
import { ApplicationsTreeItem } from "./applicationsTreeItem";

export default class ApplicationsTreeDataProvider implements TreeDataProvider<ApplicationsTreeItem> {
    private _onDidChangeTreeData = new EventEmitter<ApplicationsTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
    public static VIEW_ID = 'applications';

    constructor(context: ExtensionContext) {
        workspace.onDidChangeConfiguration(async event => {
            if (event.affectsConfiguration(ConfigurationManager.group)) {
                ConfigurationManager.initialize();
                this.refresh();
            }
        });

        const decorationProvider = new DecorationProvider();
        context.subscriptions.push(
            window.registerFileDecorationProvider(decorationProvider),
            commands.registerCommand('quickLaunch.launchApplication', async () => {
                const applications = await ApplicationManager.getApplications();
                if (applications.length > 0) {
                    const items = applications.map(application => {
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
            }),
            commands.registerCommand('quickLaunch.addCustomApplications', async () => {
                const customApplications = await window.showOpenDialog({
                    title: 'Add Custom Applications',
                    canSelectFiles: true,
                    canSelectFolders: false,
                    canSelectMany: true
                });

                if (customApplications && customApplications.length > 0) {
                    const existingApplicationNames = await ApplicationManager.addCustomApplications(customApplications);
                    if (existingApplicationNames.length > 0) {
                        window.showErrorMessage(`The following are already added as custom applications: ${existingApplicationNames.join(', ')}`);
                    }
                }
            }),
            commands.registerCommand('quickLaunch.addApplicationDirectories', async () => {
                const applicationDirectories = await window.showOpenDialog({
                    title: 'Add Application Directories',
                    canSelectFiles: false,
                    canSelectFolders: true,
                    canSelectMany: true
                });

                if (applicationDirectories && applicationDirectories.length > 0) {
                    const existingApplicationDirectories = await ApplicationManager.addApplicationDirectories(applicationDirectories);
                    if (existingApplicationDirectories.length > 0) {
                        window.showErrorMessage(`The following are already added as application directories: ${existingApplicationDirectories.join(', ')}`);
                    }
                }
            }),
            commands.registerCommand('quickLaunch.addApplicationExtensions', async () => {
                const applicationExtensions = ConfigurationManager.get<string[]>(ConfigurationManager.Section.applicationExtensions);

                const applicationExtension = await window.showInputBox({
                    prompt: `Enter the possible file extensions for applications. Existing application extensions: ${applicationExtensions.join(', ')}.`,
                    placeHolder: 'Application Extensions',
                    validateInput: (value) => {
                        if (applicationExtensions.includes(value)) {
                            return `Application extension already added. Existing application extensions: ${applicationExtensions.join(', ')}`;
                        } else {
                            return null;
                        }
                    }
                });

                if (applicationExtension) {
                    const isSuccess = await ApplicationManager.addApplicationExtensions(applicationExtension);
                    if (!isSuccess) {
                        window.showErrorMessage(`${applicationExtension} is already added as an application extension`);
                    }
                }
            }),
            commands.registerCommand('quickLaunch.searchForApplication', async () => {
                await commands.executeCommand('quickLaunch.launchApplication');
            }),
            commands.registerCommand('quickLaunch.settings', async () => {
                await commands.executeCommand('workbench.action.openSettings', '@ext:SanjulaGanepola.quick-launch');
            }),
            commands.registerCommand('quickLaunch.refresh', async () => {
                this.refresh();
            }),
            commands.registerCommand('quickLaunch.launch', async (applicationTreeItem: ApplicationTreeItem) => {
                await env.openExternal(Uri.parse(applicationTreeItem.application.path));
            }),
            commands.registerCommand('quickLaunch.favorite', async (applicationTreeItem: ApplicationTreeItem) => {
                await ApplicationManager.toggleFavoriteApplication(applicationTreeItem.application);
                this.refresh();
            }),
            commands.registerCommand('quickLaunch.unfavorite', async (applicationTreeItem: ApplicationTreeItem) => {
                await ApplicationManager.toggleFavoriteApplication(applicationTreeItem.application);
                this.refresh();
            }),
            commands.registerCommand('quickLaunch.assignKeyboardShortcut', async (applicationTreeItem: ApplicationTreeItem) => {
                // TODO:
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
            const applications = await ApplicationManager.getApplications();
            if (applications.length > 0) {
                return applications.map(application => new ApplicationTreeItem(application));
            } else {
                return [];
            }
        }
    }
}