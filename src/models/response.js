import { BaseModel } from './baseModel.js'

export class Response extends BaseModel {
    constructor(props = null) {
        super(props);

        const requiredProps = {
            status: null,
            body: null,
            message: null,
        };

        this.props = Object.assign(requiredProps, props);
    }
}
