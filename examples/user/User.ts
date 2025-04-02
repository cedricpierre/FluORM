import Model from "../../Model";
import type {
	CreateUserPayload,
	UpdateUserPayload,
	UserAttributes,
} from "./types";

export default class User extends Model<UserAttributes, CreateUserPayload, UpdateUserPayload> {
	static override entity = "users";
}
