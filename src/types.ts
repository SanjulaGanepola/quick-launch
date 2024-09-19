export enum Platform {
    windows = "win32",
    mac = "darwin",
    linux = "linux"
}

export interface Application {
    name: string,
    path: string,
    favorite: boolean
}

export interface PlatformApplicationManager {
    platform: string;
    extensions: string[];
    searchDirectories: string[];
}