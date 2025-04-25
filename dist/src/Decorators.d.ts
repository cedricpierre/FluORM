import type { Model } from './Model';
type CastInput = ((val?: any) => any) | (() => any) | (() => [any]);
export declare const Cast: (caster: CastInput) => (target: any, propertyKey: string) => void;
export declare const HasOne: (model: () => Model<any>) => (target: any, key: string | symbol) => void;
export declare const HasMany: (model: () => Model<any>) => (target: any, key: string | symbol) => void;
export declare const BelongsTo: (model: () => Model<any>) => (target: any, key: string | symbol) => void;
export declare const BelongsToMany: (model: () => Model<any>) => (target: any, key: string | symbol) => void;
export {};
