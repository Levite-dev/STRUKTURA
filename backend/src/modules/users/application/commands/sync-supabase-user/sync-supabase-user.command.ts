export class SyncSupabaseUserCommand {
  constructor(
    public readonly supabaseAuthId: string,
    public readonly email: string,
    public readonly firstName?: string | null,
    public readonly lastName?: string | null,
    public readonly phone?: string | null,
    public readonly emailVerifiedAt?: Date | null,
  ) {}
}
