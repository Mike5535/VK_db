import { BaseModel } from './baseModel.js'

export class ModelThread extends BaseModel {
    constructor(props) {
        super(props);

        const requiredProps = {
            id: null,
            title: null,
            author: null,
            forum: null,
            message: null,
            votes: null,
            created: {},
        };

        this.props = Object.assign(requiredProps, props);
    }

    static serialize(data) {
        return {
            id: data.id,
            title: data.title,
            author: data.author,
            message: data.message,
            votes: data.votes,
            slug: data.slug,
            forum: data.forum,
            created: data.created,
        }
    }
}