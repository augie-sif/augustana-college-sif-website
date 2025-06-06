import { redirect } from 'next/navigation';
import { hasPermission } from '@/lib/auth/auth';
import AdminDashboardItem from '@/components/admin/AdminDashboardItem';
import { PermissionKey } from '@/lib/types/auth';

interface DashboardItem {
	title: string;
	description: string;
	href: string;
	requiredPermission: PermissionKey;
}

const dashboardItems: DashboardItem[] = [
	{
		title: "User Management",
		description: "Manage user accounts and permissions",
		href: "/admin/users",
		requiredPermission: "ADMIN"
	},
	{
		title: "Portfolio Management",
		description: "Add, edit, or remove holdings",
		href: "/admin/holdings",
		requiredPermission: "HOLDINGS_WRITE"
	},
	{
		title: "Stock Pitch Management",
		description: "Create and manage stock pitches",
		href: "/admin/pitches",
		requiredPermission: "HOLDINGS_WRITE"
	},
	{
		title: "Newsletter Management",
		description: "Create and edit newsletter posts",
		href: "/admin/newsletter",
		requiredPermission: "ADMIN"
	},
	{
		title: "Guest Speaker Management",
		description: "Manage guest speaker events",
		href: "/admin/events",
		requiredPermission: "ADMIN"
	},
	{
		title: "Gallery Management",
		description: "Upload and manage gallery images",
		href: "/admin/gallery",
		requiredPermission: "SECRETARY"
	},
	{
		title: "Meeting Minutes Management",
		description: "Create and manage meeting minutes",
		href: "/admin/notes",
		requiredPermission: "SECRETARY"
	},
	{
		title: "About Us Management",
		description: "Edit sections on the About Us page",
		href: "/admin/about",
		requiredPermission: "ADMIN"
	},
	{
		title: "Home Page Management",
		description: "Edit sections on the Home page",
		href: "/admin/home",
		requiredPermission: "ADMIN"
	},
];

export default async function AdminPage() {
	const hasAccess = await hasPermission('ADMIN_DASHBOARD');
	if (!hasAccess) { redirect('/unauthorized'); }

	// Filter dashboard items based on user permissions
	const accessibleItems = await Promise.all(
		dashboardItems.map(async (item) => {
			const hasItemAccess = await hasPermission(item.requiredPermission);
			return hasItemAccess ? item : null;
		})
	);

	// Remove null values (items user doesn't have access to)
	const filteredItems = accessibleItems.filter((item): item is DashboardItem => item !== null);

	return (
		<div className="min-h-screen p-8 sm:p-20 font-[family-name:var(--font-geist-mono)]">
			<div className="max-w-6xl mx-auto">
				<h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

				{filteredItems.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
						{filteredItems.map((item, index) => (
							<AdminDashboardItem
								key={index}
								title={item.title}
								description={item.description}
								href={item.href}
							/>
						))}
					</div>
				) : (
					<div className="text-center py-8 text-gray-400">
						You don&apos;t have access to any admin features.
					</div>
				)}

				<h1 className="text-xl font-semibold mt-8">Credits</h1>
				<p className="mt-2">This website was created by <a href="https://github.com/novrion" className="text-blue-500 font-semibold">Elias Lindstenz</a> for the Augustana College Student Investment Fund during two weeks in the spring of 2025. The website source code is located in its repository: <a href="https://github.com/augie-sif/augustana-college-sif-website" className="text-blue-500 font-semibold">augustana-college-sif-website</a>.</p>
				<p className="mt-2"><span className="font-semibold">Contact</span>: <a href="mailto:elindstenz@outlook.com" className="text-blue-500 font-semibold">elindstenz@outlook.com</a> | <a href="https://www.linkedin.com/in/elias-lindstenz/" className="text-blue-500 font-semibold">linkedin.com/in/elias-lindstenz</a></p>
			</div>
		</div>
	);
}