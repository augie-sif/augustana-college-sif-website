import { redirect } from 'next/navigation';
import { hasPermission } from '@/lib/auth/auth';
import { getAllUsers } from '@/lib/api/db';
import AdminUsersList from '@/components/admin/users/AdminUsersList';
import { EmptyLinkButton } from "@/components/Buttons";
import TransferRoleButton from '@/components/admin/users/TransferRoleButton';

export default async function AdminUsersPage() {
	const hasAccess = await hasPermission('ADMIN');
	if (!hasAccess) { redirect('/unauthorized'); }

	const users = await getAllUsers();

	return (
		<div className="min-h-screen p-8 sm:p-20 font-[family-name:var(--font-geist-mono)]">
			<div className="max-w-6xl mx-auto">
				<div className="flex justify-between items-center mb-6">
					<h1 className="text-3xl font-bold">User Management</h1>

					<div className="flex gap-3">
						<TransferRoleButton />
						<EmptyLinkButton
							href="/admin"
							text="Back to Admin"
						/>
					</div>
				</div>

				<div className="rounded-lg border border-solid border-white/[.145] p-6">
					<h2 className="text-xl font-semibold mb-4">Users</h2>
					<AdminUsersList users={users} />
				</div>

				<div className="mt-6 rounded-lg border border-solid border-white/[.145] p-6">
					<h2 className="text-xl font-semibold mb-2">
						Permissions
					</h2>
					<p className="mb-6">
						A user cannot modify the role of a user with a higher rank. Only admins, the president and the vice president may modify user roles.
					</p>
					<table className="rounded-lg border border-white/[.145] p-6 w-full">
						<tr>
							<th className="border border-white/[.145]">Role</th>
							<th className="border border-white/[.145]">Rank</th>
							<th className="border border-white/[.145]">Holdings & Stock Pitches</th>
							<th className="border border-white/[.145]">Gallery & Meeting Minutes</th>
							<th className="border border-white/[.145]">Everything Else</th>
						</tr>
						<tr>
							<th className="border border-white/[.145]">Admin</th>
							<th className="border border-white/[.145]">3</th>
							<th className="border border-white/[.145] text-green-500">Write</th>
							<th className="border border-white/[.145] text-green-500">Write</th>
							<th className="border border-white/[.145] text-green-500">Write</th>
						</tr>
						<tr>
							<th className="border border-white/[.145]">President</th>
							<th className="border border-white/[.145]">2</th>
							<th className="border border-white/[.145] text-green-500">Write</th>
							<th className="border border-white/[.145] text-green-500">Write</th>
							<th className="border border-white/[.145] text-green-500">Write</th>
						</tr>
						<tr>
							<th className="border border-white/[.145]">Vice President</th>
							<th className="border border-white/[.145]">1</th>
							<th className="border border-white/[.145] text-green-500">Write</th>
							<th className="border border-white/[.145] text-green-500">Write</th>
							<th className="border border-white/[.145] text-green-500">Write</th>
						</tr>
						<tr>
							<th className="border border-white/[.145]">Holdings Write</th>
							<th className="border border-white/[.145] text-red-500">×</th>
							<th className="border border-white/[.145] text-green-500">Write</th>
							<th className="border border-white/[.145] text-orange-400">Read</th>
							<th className="border border-white/[.145] text-orange-400">Read</th>
						</tr>
						<tr>
							<th className="border border-white/[.145]">Secretary</th>
							<th className="border border-white/[.145] text-red-500">×</th>
							<th className="border border-white/[.145] text-orange-400">Read</th>
							<th className="border border-white/[.145] text-green-500">Write</th>
							<th className="border border-white/[.145] text-orange-400">Read</th>
						</tr>
						<tr>
							<th className="border border-white/[.145]">Holdings Read</th>
							<th className="border border-white/[.145] text-red-500">×</th>
							<th className="border border-white/[.145] text-orange-400">Read</th>
							<th className="border border-white/[.145] text-orange-400">Read</th>
							<th className="border border-white/[.145] text-orange-400">Read</th>
						</tr>
						<tr>
							<th className="border border-white/[.145]">User</th>
							<th className="border border-white/[.145] text-red-500">×</th>
							<th className="border border-white/[.145] text-red-500">×</th>
							<th className="border border-white/[.145] text-orange-400">Read</th>
							<th className="border border-white/[.145] text-orange-400">Read</th>
						</tr>
					</table>
					<h2 className="text-xl font-semibold mb-2 mt-4">Key</h2>
					<p><span className="font-semibold text-green-500">Write</span>: May modify</p>
					<p><span className="font-semibold text-orange-400">Read</span>: May view</p>
					<p><span className="font-semibold text-red-500">×</span>: No access or N/A</p>
				</div>
			</div>
		</div >
	);
}