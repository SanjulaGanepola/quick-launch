import { parse } from "comment-json";
import * as fs from "fs/promises";
import * as path from "path";
import { commands, RelativePattern, Uri, window, workspace } from "vscode";
import { KeyboardShortcut, KeyboardShortcutArgument, Platform } from "./types";
import ApplicationsTreeDataProvider from "./view/applicationsTreeDataProvider";

export class KeyboardShortcutsManager {
    static getKeyboardShortcutsFile(): string {
        switch (process.platform) {
            case Platform.windows:
                if (process.env.APPDATA) {
                    return path.join(process.env.APPDATA, 'Code', 'User', 'keybindings.json').replace(/\\/g, '/');
                }
            case Platform.mac:
                if (process.env.HOME) {
                    return path.join(process.env.HOME, 'Library', 'Application Support', 'Code', 'User', 'keybindings.json').replace(/\\/g, '/');
                }
            case Platform.linux:
                if (process.env.HOME) {
                    return path.join(process.env.HOME, '.config', 'Code', 'User', 'keybindings.json').replace(/\\/g, '/');
                }
            default:
                throw new Error('Failed to locate VS Code keybindings.json file');
        }
    }

    static initializeFileWatcher(applicationsTreeDataProvider: ApplicationsTreeDataProvider) {
        const keyboardShortcutsFile = KeyboardShortcutsManager.getKeyboardShortcutsFile();
        const keyboardShortcutsFileWatcher = workspace.createFileSystemWatcher(new RelativePattern(Uri.file(path.parse(keyboardShortcutsFile).dir), path.parse(keyboardShortcutsFile).base));
        keyboardShortcutsFileWatcher.onDidCreate(() => {
            applicationsTreeDataProvider.refresh();
        });
        keyboardShortcutsFileWatcher.onDidChange(() => {
            applicationsTreeDataProvider.refresh();
        });
        keyboardShortcutsFileWatcher.onDidDelete(() => {
            applicationsTreeDataProvider.refresh();
        });
    }

    static async getKeyboardShortcuts(): Promise<KeyboardShortcut[]> {
        const keyboardShortcutsFile = KeyboardShortcutsManager.getKeyboardShortcutsFile();

        try {
            const allKeyboardShortcuts: KeyboardShortcut[] = (parse(await fs.readFile(keyboardShortcutsFile, 'utf-8')) as any);
            return allKeyboardShortcuts.filter(keyboardShortcut => keyboardShortcut.command === 'quickLaunch.launchSingleApplication');
        } catch (error) {
            throw new Error(`Failed to load VS Code keybindings.json file. Error: ${error}`);
        }
    }

    static async setKeyboardShortcut(keyboardShortcut: string, args: KeyboardShortcutArgument): Promise<void> {
        const keyboardShortcutsFile = KeyboardShortcutsManager.getKeyboardShortcutsFile();
        const keyboardShortcuts = await KeyboardShortcutsManager.getKeyboardShortcuts();

        const existingKeyboardShortcutIndex = keyboardShortcuts.findIndex(keyboardShortcut => keyboardShortcut.args?.name === args.name && keyboardShortcut.args?.path === args.path);
        if (existingKeyboardShortcutIndex > -1) {
            if (keyboardShortcut === '') {
                keyboardShortcuts.splice(existingKeyboardShortcutIndex, 1);
            } else {
                keyboardShortcuts[existingKeyboardShortcutIndex].key = keyboardShortcut;
            }
        } else {
            if (keyboardShortcut !== '') {
                keyboardShortcuts.push({
                    command: 'quickLaunch.launchSingleApplication',
                    key: keyboardShortcut,
                    args: args
                });
            }
        }

        try {
            await fs.writeFile(keyboardShortcutsFile, JSON.stringify(keyboardShortcuts, null, 4), 'utf-8');
        } catch (error) {
            throw new Error(`Failed to write to VS Code keybindings.json file. Error: ${error}`);
        }
    }

    static showErrorNotification(error: any, fallBackMessage: string): void {
        window.showErrorMessage(error instanceof Error ? error.message : fallBackMessage, 'Open Keyboard Shortcuts').then(async (value) => {
            if (value === 'Open Keyboard Shortcuts') {
                await commands.executeCommand('workbench.action.openGlobalKeybindingsFile');
            }
        });
    }
}