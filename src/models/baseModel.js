export class BaseModel {
    constructor(props) {
        this.props = props;
    }

    update(props) {
        this.props = Object.assign(this.props, props);
    }
}
