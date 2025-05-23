import { NextResponse } from 'next/server';
import { Session } from 'next-auth';
import { extractUrl, deleteFileFromBucket } from '@/lib/api/db/common';
import { uploadHomeImage } from '@/lib/api/db';
import { withAuth } from '@/lib/api/server/routeHandlers';

async function uploadImageHandler(request: Request, _session: Session): Promise<NextResponse> {
	try {
		const formData = await request.formData();
		const file = formData.get('file') as File;
		const previousImageUrl = formData.get('previousImageUrl') as string;

		if (!file) {
			return NextResponse.json(
				{ error: 'No file provided' },
				{ status: 400 }
			);
		}

		const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
		if (!validTypes.includes(file.type)) {
			return NextResponse.json(
				{ error: 'Invalid file type. Only JPEG, PNG, and GIF are supported.' },
				{ status: 400 }
			);
		}

		const maxSize = 5 * 1024 * 1024; // 5MB
		if (file.size > maxSize) {
			return NextResponse.json(
				{ error: 'File size exceeds 5MB limit.' },
				{ status: 400 }
			);
		}

		// Delete previous image if it exists
		if (previousImageUrl) {
			const fileInfo = await extractUrl(previousImageUrl);
			if (fileInfo) {
				await deleteFileFromBucket(fileInfo.bucket, fileInfo.path);
			}
		}

		const result = await uploadHomeImage(file);
		if (!result) {
			return NextResponse.json(
				{ error: 'Failed to upload image' },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			url: result.url,
			message: 'Image uploaded successfully'
		});
	} catch (error) {
		console.error('Error in uploadImageHandler:', error);
		return NextResponse.json(
			{ error: 'An unexpected error occurred' },
			{ status: 500 }
		);
	}
}

export const POST = withAuth(uploadImageHandler, 'ADMIN');