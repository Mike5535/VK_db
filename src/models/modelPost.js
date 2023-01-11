import { BaseModel } from './baseModel.js'

export class ModelPost extends BaseModel {
    constructor(props) {
        super(props);

        const requiredProps = {
            id: null,
            parent: null,
            author: null,
            message: null,
            isEdited: null,
            forum: null,
            thread: null,
            created: null,
        };

        this.props = Object.assign(requiredProps, props);
    }

    static serialize(data) {
        return {
            forum: data.forum_slug,
            id: data.id,
            created: data.created,
            thread: data.thread_id,
            message: data.message,
            parent: data.parent_id,
            isEdited: data.edited,
            author: data.author,
        };
    }
}
