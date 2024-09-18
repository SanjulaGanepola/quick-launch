export enum Platform {
    windows = "win32",
    mac = "darwin",
    linux = "linux"
}

export interface InstalledApplication {
    name: string,
    path: string
}

export interface PlatformApplicationManager {
    platform: string;
    extensions: string[];
    searchDirectories: string[];
}