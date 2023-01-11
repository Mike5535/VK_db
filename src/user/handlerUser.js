import { ModelUser } from "../models/modelUser.js";
import UserRepository from './repositoryUser.js';

export default new class HandlerUser {

    async createUser(req, res) {
        const user = new ModelUser({
            nickname: req.params.nickname,
            email: req.body.email,
            about: req.body.about,
            fullname: req.body.fullname,
        });
        const dbUser = await UserRepository.getUsersByNicknameOrEmail(user.props.nickname, user.props.email);
        if (dbUser && dbUser.length) {
            return res.code(409).send(dbUser);
        }

        const result = await UserRepository.create(user);
        return res.code(result.props.status).send(result.props.body);
    }

    async getUser(req, res) {
        const user = await UserRepository.getByNickname(req.params.nickname);

        if (!user) {
            return res.code(404).send({ message: 'Can\'t find user with nickname ' + req.params.nickname })
        } else {
            return res.send(user);
        }
    }

    async updateUser(req, res) {
        const user = await UserRepository.getByNickname(req.params.nickname);
        const updateUser = new ModelUser({
            nickname: req.params.nickname,
            email: req.body.email,
            about: req.body.about,
            fullname: req.body.fullname,
        });

        if (!user) {
            return res.code(404).send({ message: 'Can\'t find user with nickname ' + req.params.nickname })
        }

        const update = await UserRepository.update(updateUser);

        if (!update) {
            return res.code(409).send({ message: 'Can\'t change user with nickname ' + req.params.nickname })
        }

        const body = update === true ? user : update;

        return res.send(body);
    }
}
