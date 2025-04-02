import type { ModelAttributes } from "../../Model";

export type UserAttributes = {
	email: string;
	name: string;
} & ModelAttributes;

export type CreateUserPayload = {
	email: string;
	name: string;
	password: string;
};

export type UpdateUserPayload = {
	email: string;
	name: string;
	password: string;
};
