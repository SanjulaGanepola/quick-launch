export enum Platform {
    windows = "win32",
    mac = "darwin",
    linux = "linux"
}

export interface Application {
    name: string,
    path: string,
    favorite: boolean,
    custom: boolean
}

export interface PlatformApplicationManager {
    platform: string;
    extensions: string[];
    directories: string[];
}

export interface View {
    Favorites: boolean,
    Customs: boolean,
    Other: boolean
}

export interface Sort {
    Priority: boolean,
    Alphabetically: boolean
}