import { Request, Response } from 'express';
import { CreateUser } from '../../../application/use-cases/users/create-user';
import { GetUser } from '../../../application/use-cases/users/get-user';
import { ListUsers } from '../../../application/use-cases/users/list-users';
import { UpdateUser } from '../../../application/use-cases/users/update-user';
import { DeleteUser } from '../../../application/use-cases/users/delete-user';
import { presentUser } from '../presenters/user-presenter';

export class UsersController {
  constructor(
    private readonly createUser: CreateUser,
    private readonly getUser: GetUser,
    private readonly listUsers: ListUsers,
    private readonly updateUser: UpdateUser,
    private readonly deleteUser: DeleteUser,
  ) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const user = await this.createUser.execute(req.body);
    res.status(201).json(presentUser(user));
  };

  list = async (_req: Request, res: Response): Promise<void> => {
    const result = await this.listUsers.execute(res.locals.query);
    res.status(200).json({ ...result, data: result.data.map(presentUser) });
  };

  get = async (req: Request, res: Response): Promise<void> => {
    const user = await this.getUser.execute(req.params.id);
    res.status(200).json(presentUser(user));
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const user = await this.updateUser.execute(req.params.id, req.body);
    res.status(200).json(presentUser(user));
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    await this.deleteUser.execute(req.params.id);
    res.status(204).send();
  };
}
