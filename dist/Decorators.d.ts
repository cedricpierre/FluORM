import { Model } from './Model';
export declare const Cast: (caster: () => new (...args: any[]) => any) => (target: any, key: string) => void;
export declare const HasOne: (model: () => Model<any>, resource?: string) => (target: any, key: string | symbol) => void;
export declare const HasMany: (model: () => Model<any>, resource?: string) => (target: any, key: string | symbol) => void;
export declare const BelongsTo: (model: () => Model<any>, resource?: string) => (target: any, key: string | symbol) => void;
export declare const BelongsToMany: (model: () => Model<any>, resource?: string) => (target: any, key: string | symbol) => void;
