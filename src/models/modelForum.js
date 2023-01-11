import { BaseModel } from './baseModel.js'

export class ModelForum extends BaseModel {
    constructor(props = null) {
        super(props);

        const requiredProps = {
            title: null,
            user: null,
            slug: null,
            posts: null,
            threads: null
        };

        this.props = Object.assign(requiredProps, props);
    }

    static serialize(data) {
        return {
            title: data.title,
            user: data.nickname,
            slug: data.slug,
            posts: data.posts,
            threads: data.threads
        }
    }
}
