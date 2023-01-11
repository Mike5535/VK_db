import { BaseModel } from './baseModel.js'

export class ModelUser extends BaseModel {
    constructor(props) {
        super(props);

        const requiredProps = {
            nickname: null,
            fullname: null,
            about: null,
            email: null,
        };

        this.props = Object.assign(requiredProps, props);
    }
}
