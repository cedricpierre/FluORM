import type { ModelAttributes } from "../../Model";

export type MediaAttributes = {
	filename: string;
	original_filename: string;
	extension: string;
	size: number;
	created_at: string;
	updated_at: string;
} & ModelAttributes;

export type CreateMediaPayload = {
	filename: string;
};

export type UpdateMediaPayload = {
	filename: string;
};
