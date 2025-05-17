import 'next-auth';
import { DefaultSession, DefaultUser } from 'next-auth';
import { UserRole } from './lib/types/user';

declare module 'next-auth' {
	interface Session {
		user: {
			id: string;
			role: UserRole;
			name: string;
			profile_picture?: string;
		} & DefaultSession['user'];
	}
	interface User extends DefaultUser {
		id: string;
		role: UserRole;
		name: string;
		profile_picture?: string;
	}
}