import { Request, Response } from 'express';
import { RegisterUser } from '../../../application/use-cases/auth/register-user';
import { AuthenticateUser } from '../../../application/use-cases/auth/authenticate-user';
import { presentUser } from '../presenters/user-presenter';

export class AuthController {
  constructor(
    private readonly registerUser: RegisterUser,
    private readonly authenticateUser: AuthenticateUser,
  ) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const { token, user } = await this.registerUser.execute(req.body);
    res.status(201).json({ token, user: presentUser(user) });
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const { token, user } = await this.authenticateUser.execute(req.body);
    res.status(200).json({ token, user: presentUser(user) });
  };
}
