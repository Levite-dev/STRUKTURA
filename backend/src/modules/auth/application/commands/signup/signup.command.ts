export class SignupCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly phone?: string,
    public readonly ipAddress?: string | null,
    public readonly userAgent?: string | null,
  ) {}
}
