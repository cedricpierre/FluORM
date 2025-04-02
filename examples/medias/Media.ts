import Model from "../../Model";
import type {
	CreateMediaPayload,
	MediaAttributes,
	UpdateMediaPayload,
} from "./types";

export default class Media extends Model<MediaAttributes, CreateMediaPayload, UpdateMediaPayload> {
	static override entity = "medias";
}
