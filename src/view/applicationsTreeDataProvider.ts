import { CancellationToken, commands, env, EventEmitter, ExtensionContext, ThemeIcon, TreeDataProvider, TreeItem, Uri, window, workspace } from "vscode";
import { ApplicationManager } from "../applicationManager/applicationManager";
import { ConfigurationManager } from "../configurationManager";
import { DecorationProvider } from "../decorationProvider";
import { KeyboardShortcutsManager } from "../keyboardShortcutsManager";
import { KeyboardShortcut, KeyboardShortcutArgument } from "../types";
import ApplicationTreeItem from "./application";
import { ApplicationsTreeItem } from "./applicationsTreeItem";

export default class ApplicationsTreeDataProvider implements TreeDataProvider<ApplicationsTreeItem> {
    private _onDidChangeTreeData = new EventEmitter<ApplicationsTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
    public static VIEW_ID = 'applications';

    constructor(context: ExtensionContext) {
        try {
            KeyboardShortcutsManager.initializeFileWatcher(this);
        } catch (error) { }

        workspace.onDidChangeConfiguration(async event => {
            if (event.affectsConfiguration(ConfigurationManager.group)) {
                ConfigurationManager.initialize();
                this.refresh();
            }
        });

        const decorationProvider = new DecorationProvider();
        context.subscriptions.push(
            window.registerFileDecorationProvider(decorationProvider),
            commands.registerCommand('quickLaunch.launchSingleApplication', async (args: KeyboardShortcutArgument) => {
                await env.openExternal(Uri.parse(args.path));
            }),
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
                        window.showErrorMessage(`The following are already added as custom applications: ${existingApplicationNames.join(', ')}`, 'View Custom Applications').then(async (value) => {
                            if (value === 'View Custom Applications') {
                                await commands.executeCommand('workbench.action.openSettings', '@ext:SanjulaGanepola.quick-launch QuickLaunch.customApplications');
                            }
                        });
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
                        window.showErrorMessage(`The following are already added as application directories: ${existingApplicationDirectories.join(', ')}`, 'View Application Directories').then(async (value) => {
                            if (value === 'View Application Directories') {
                                await commands.executeCommand('workbench.action.openSettings', '@ext:SanjulaGanepola.quick-launch QuickLaunch.applicationDirectories');
                            }
                        });
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
                    try {
                        await ApplicationManager.addApplicationExtensions(applicationExtension);
                    } catch (error) {
                        window.showErrorMessage(error instanceof Error ? error.message : `${applicationExtension} is already added as an application extension`, 'View Application Extensions').then(async (value) => {
                            if (value === 'View Application Extensions') {
                                await commands.executeCommand('workbench.action.openSettings', '@ext:SanjulaGanepola.quick-launch QuickLaunch.applicationExtensions');
                            }
                        });
                    }
                }
            }),
            commands.registerCommand('quickLaunch.searchForApplication', async () => {
                await commands.executeCommand('quickLaunch.launchApplication');
            }),
            commands.registerCommand('quickLaunch.favoritesEnable', async () => {
                ApplicationManager.toggleView('Favorites');
            }),
            commands.registerCommand('quickLaunch.favoritesDisable', async () => {
                ApplicationManager.toggleView('Favorites');
            }),
            commands.registerCommand('quickLaunch.customsEnable', async () => {
                ApplicationManager.toggleView('Customs');
            }),
            commands.registerCommand('quickLaunch.customsDisable', async () => {
                ApplicationManager.toggleView('Customs');
            }),
            commands.registerCommand('quickLaunch.otherEnable', async () => {
                ApplicationManager.toggleView('Other');
            }),
            commands.registerCommand('quickLaunch.otherDisable', async () => {
                ApplicationManager.toggleView('Other');
            }),
            commands.registerCommand('quickLaunch.priorityEnable', async () => {
                ApplicationManager.toggleSort('Priority');
            }),
            commands.registerCommand('quickLaunch.priorityDisable', async () => {
                ApplicationManager.toggleSort('Priority');
            }),
            commands.registerCommand('quickLaunch.alphabeticallyEnable', async () => {
                ApplicationManager.toggleSort('Alphabetically');
            }),
            commands.registerCommand('quickLaunch.alphabeticallyDisable', async () => {
                ApplicationManager.toggleSort('Alphabetically');
            }),
            commands.registerCommand('quickLaunch.keyboardShortcuts', async () => {
                await commands.executeCommand('workbench.action.openGlobalKeybindingsFile');
            }),
            commands.registerCommand('quickLaunch.extensionSettings', async () => {
                await commands.executeCommand('workbench.action.openSettings', '@ext:SanjulaGanepola.quick-launch');
            }),
            commands.registerCommand('quickLaunch.helpAndSupport', async () => {
                await env.openExternal(Uri.parse('https://github.com/SanjulaGanepola/quick-launch/issues'));
            }),
            commands.registerCommand('quickLaunch.refresh', async () => {
                this.refresh();
            }),
            commands.registerCommand('quickLaunch.launch', async (applicationTreeItem: ApplicationTreeItem) => {
                await env.openExternal(Uri.parse(applicationTreeItem.application.path));
            }),
            commands.registerCommand('quickLaunch.favorite', async (applicationTreeItem: ApplicationTreeItem) => {
                await ApplicationManager.toggleFavoriteApplication(applicationTreeItem.application);
            }),
            commands.registerCommand('quickLaunch.unfavorite', async (applicationTreeItem: ApplicationTreeItem) => {
                await ApplicationManager.toggleFavoriteApplication(applicationTreeItem.application);
            }),
            commands.registerCommand('quickLaunch.assignKeyboardShortcut', async (applicationTreeItem: ApplicationTreeItem) => {
                let keyboardShortcuts: KeyboardShortcut[] = [];
                try {
                    keyboardShortcuts = await KeyboardShortcutsManager.getKeyboardShortcuts();
                } catch (error) {
                    KeyboardShortcutsManager.showErrorNotification(error, 'Failed to load VS Code keybindings.json file.');
                    return;
                }

                const existingKeyboardShortcut = keyboardShortcuts.find(keyboardShortcut => keyboardShortcut.args?.name === applicationTreeItem.application.name && keyboardShortcut.args?.path === applicationTreeItem.application.path)?.key;
                const newKeyboardShortcut = await window.showInputBox({
                    prompt: `Enter a keyboard shortcut for ${applicationTreeItem.application.name} as a key or key sequence (separate keys with plus-sign and sequences with space, e.g. Ctrl+O and Ctrl+L L for a chord)`,
                    placeHolder: 'Keyboard Shortcut',
                    value: existingKeyboardShortcut
                });

                if (newKeyboardShortcut !== undefined) {
                    try {
                        await KeyboardShortcutsManager.setKeyboardShortcut(newKeyboardShortcut, { name: applicationTreeItem.application.name, path: applicationTreeItem.application.path });
                    } catch (error) {
                        KeyboardShortcutsManager.showErrorNotification(error, 'Failed to write to VS Code keybindings.json file.')
                    }
                }
            }),
            commands.registerCommand('quickLaunch.revealInFileExplorer', async (applicationTreeItem: ApplicationTreeItem) => {
                commands.executeCommand('revealFileInOS', Uri.file(applicationTreeItem.application.path));
            }),
            commands.registerCommand('quickLaunch.removeCustomApplication', async (applicationTreeItem: ApplicationTreeItem) => {
                try {
                    ApplicationManager.removeCustomApplication(applicationTreeItem.application);
                } catch (error) {
                    window.showErrorMessage(error instanceof Error ? error.message : `Failed to find ${applicationTreeItem.application.name} in custom application list`, 'View Custom Applications').then(async (value) => {
                        if (value === 'View Custom Applications') {
                            await commands.executeCommand('workbench.action.openSettings', '@ext:SanjulaGanepola.quick-launch QuickLaunch.customApplications');
                        }
                    });
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
            const applications = await ApplicationManager.getApplications();
            return applications.map(application => new ApplicationTreeItem(application));
        }
    }
}