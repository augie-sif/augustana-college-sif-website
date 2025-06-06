'use client';

import { useState, useEffect } from 'react';
import { User, UserRole } from '@/lib/types/user';
import { AdminList, AdminListItem } from '@/components/admin/common';
import DeleteConfirmationModal from '@/components/common/DeleteConfirmationModal';
import PaginationControls from '@/components/common/PaginationControls';
import { useAuth } from '@/hooks/useAuth';
import UserRoleModal from './UserRoleModal';
import ProfilePicture from '@/components/ProfilePicture';
import { DeleteButton } from '@/components/Buttons';
import StatusMessage from '@/components/common/StatusMessage';
import { formatRole } from '@/lib/utils';

interface AdminUsersListProps {
	users: User[];
	initialPage?: number;
	pageSize?: number;
}

export default function AdminUsersList({
	users: initialUsers,
	initialPage = 1,
	pageSize = 10
}: AdminUsersListProps) {
	const { session } = useAuth();
	const currentUser = session?.user;

	const [allUsers, setAllUsers] = useState(initialUsers);
	const [currentPage, setCurrentPage] = useState(initialPage);
	const [totalPages, setTotalPages] = useState(Math.ceil(initialUsers.length / pageSize));
	const [paginatedUsers, setPaginatedUsers] = useState<User[]>([]);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [userToDelete, setUserToDelete] = useState<User | null>(null);
	const [userToEdit, setUserToEdit] = useState<User | null>(null);

	const roleHierarchy: { [key in UserRole]: number } = {
		'admin': 4,
		'president': 3,
		'vice_president': 2,
		'secretary': 1,
		'holdings_write': 1,
		'holdings_read': 1,
		'user': 0
	};

	useEffect(() => {
		const startIndex = (currentPage - 1) * pageSize;
		const endIndex = startIndex + pageSize;
		setPaginatedUsers(allUsers.slice(startIndex, endIndex));
		setTotalPages(Math.ceil(allUsers.length / pageSize));
	}, [currentPage, allUsers, pageSize]);

	const canEditUserRole = (user: User): boolean => {
		if (!currentUser) return false;
		if (user.id === currentUser.id) return false; // Can't edit own role

		const currentUserRank = roleHierarchy[currentUser.role as UserRole];
		const targetUserRank = roleHierarchy[user.role];

		return currentUserRank > targetUserRank;
	};

	const canDeleteUser = (user: User): boolean => {
		if (!currentUser) return false;
		if (user.id === currentUser.id) return false;

		const currentUserRank = roleHierarchy[currentUser.role as UserRole];
		const targetUserRank = roleHierarchy[user.role];

		return currentUserRank > targetUserRank;
	};

	const openDeleteModal = (user: User, e: React.MouseEvent) => {
		e.stopPropagation();
		if (!canDeleteUser(user)) {
			setError(`You don't have permission to delete ${user.name}`);
			return;
		}
		setUserToDelete(user);
		setIsDeleteModalOpen(true);
	};

	const closeDeleteModal = () => {
		setIsDeleteModalOpen(false);
		setUserToDelete(null);
	};

	const openRoleModal = (user: User, e: React.MouseEvent) => {
		e.stopPropagation();
		if (!canEditUserRole(user)) {
			setError(`You don't have permission to change ${user.name}'s role`);
			return;
		}
		setUserToEdit(user);
		setIsRoleModalOpen(true);
	};

	const closeRoleModal = () => {
		setIsRoleModalOpen(false);
		setUserToEdit(null);
	};

	const confirmDelete = async () => {
		if (!userToDelete) return;

		setIsDeleting(true);
		try {
			const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || 'Failed to delete user');
			}

			// Remove user from state
			const updatedUsers = allUsers.filter(user => user.id !== userToDelete.id);
			setAllUsers(updatedUsers);
			setSuccess(`${userToDelete.name} has been deleted successfully`);

			// Update page if necessary
			if (paginatedUsers.length === 1 && currentPage > 1) {
				setCurrentPage(currentPage - 1);
			}

			setIsDeleteModalOpen(false);
			setUserToDelete(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to delete user');
		} finally {
			setIsDeleting(false);
		}
	};

	const handleRoleChange = async (newRole: UserRole) => {
		if (!userToEdit) return;

		setIsLoading(true);
		try {
			const response = await fetch(`/api/admin/users/${userToEdit.id}/role`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ role: newRole }),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || 'Failed to update user role');
			}

			// Update user in state
			const updatedUsers = allUsers.map(user =>
				user.id === userToEdit.id ? { ...user, role: newRole } : user
			);
			setAllUsers(updatedUsers);
			setSuccess(`${userToEdit.name}'s role has been updated to ${formatRole(newRole)}`);

			closeRoleModal();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to update user role');
		} finally {
			setIsLoading(false);
		}
	};

	const handleToggleActiveStatus = async (user: User, e: React.MouseEvent) => {
		e.stopPropagation();
		if (!canEditUserRole(user)) {
			setError(`You don't have permission to change ${user.name}'s account status`);
			return;
		}

		setIsLoading(true);
		try {
			const response = await fetch(`/api/admin/users/${user.id}/status`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ isActive: !user.is_active }),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || 'Failed to update user status');
			}

			// Update user in state
			const updatedUsers = allUsers.map(u =>
				u.id === user.id ? { ...u, is_active: !user.is_active } : u
			);
			setAllUsers(updatedUsers);
			setSuccess(`${user.name}'s account has been ${!user.is_active ? 'activated' : 'deactivated'}`);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to update user status');
		} finally {
			setIsLoading(false);
		}
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	const handleUserClick = (_userId: string) => {
		// Navigate to user details or edit page
	};

	return (
		<>
			{error && <StatusMessage type="error" message={error} />}
			{success && <StatusMessage type="success" message={success} />}

			<AdminList
				error={error}
				isLoading={isLoading}
				isEmpty={allUsers.length === 0}
				emptyMessage="No users found."
			>
				{paginatedUsers.map((user) => (
					<AdminListItem
						key={user.id}
						title={user.name}
						subtitle={
							<div className="flex items-center gap-4">
								<span className="text-gray-400">{user.email}</span>
								<span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-900 text-blue-200">
									{formatRole(user.role)}
								</span>
								{!user.is_active && (
									<span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-red-900 text-red-200">
										Inactive
									</span>
								)}
							</div>
						}
						leftComponent={
							<div className="mr-4">
								<ProfilePicture
									user={user}
									size={40}
								/>
							</div>
						}
						className="hover:bg-[#1a1a1a]"
						onClick={() => handleUserClick(user.id)}
						actions={
							<div className="flex items-center gap-2">
								{canEditUserRole(user) && (
									<>
										<button
											onClick={(e) => openRoleModal(user, e)}
											className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md"
										>
											Change Role
										</button>
										<button
											onClick={(e) => handleToggleActiveStatus(user, e)}
											className={`px-3 py-1 text-sm ${user.is_active ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded-md`}
										>
											{user.is_active ? 'Deactivate' : 'Activate'}
										</button>
									</>
								)}
								{canDeleteUser(user) && (
									<DeleteButton onClick={(e) => openDeleteModal(user, e)} />
								)}
							</div>
						}
					/>
				))}

				{totalPages > 1 && (
					<div className="mt-6">
						<PaginationControls
							currentPage={currentPage}
							totalPages={totalPages}
							onPageChange={handlePageChange}
						/>
						<div className="mt-2 text-sm text-gray-400 text-center">
							Showing {paginatedUsers.length} of {allUsers.length} users
						</div>
					</div>
				)}
			</AdminList>

			<DeleteConfirmationModal
				isOpen={isDeleteModalOpen}
				onClose={closeDeleteModal}
				onConfirm={confirmDelete}
				isLoading={isDeleting}
				title="Delete User"
				message="Are you sure you want to delete this user? This action cannot be undone."
				itemName={userToDelete?.name}
			/>

			<UserRoleModal
				isOpen={isRoleModalOpen}
				onClose={closeRoleModal}
				onConfirm={handleRoleChange}
				isLoading={isLoading}
				title="Change User Role"
				currentRole={userToEdit?.role}
				currentUserRole={currentUser?.role}
				userName={userToEdit?.name}
			/>
		</>
	);
}