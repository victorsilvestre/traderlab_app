import { NextResponse } from 'next/server';
import { getCurrentAccessToken } from '../../../../../../../../../lib/authentication/getCurrentAccessToken';
import { getStudentContentMaterialDownloadPath } from '../../../../../../../../../lib/courses/courseApi';

type DownloadRouteProps = {
  params: Promise<{
    courseId: string;
    contentId: string;
    materialId: string;
  }>;
};

function positiveId(value: string): number | null {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export async function GET(_request: Request, { params }: DownloadRouteProps) {
  const { courseId: courseParam, contentId: contentParam, materialId: materialParam } = await params;
  const courseId = positiveId(courseParam);
  const contentId = positiveId(contentParam);
  const materialId = positiveId(materialParam);
  if (!courseId || !contentId || !materialId) {
    return NextResponse.json({ message: 'Material não encontrado.' }, { status: 404 });
  }

  const accessToken = await getCurrentAccessToken();
  if (!accessToken) {
    return NextResponse.json({ message: 'Entre novamente para baixar o material.' }, { status: 401 });
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return NextResponse.json({ message: 'A API do TraderLab não está configurada.' }, { status: 503 });
  }

  let downloadResponse: Response;
  try {
    downloadResponse = await fetch(
      `${apiUrl.replace(/\/$/, '')}${getStudentContentMaterialDownloadPath(courseId, contentId, materialId)}`,
      {
        headers: { authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
        // The API downloads the private object and streams it back. Do not
        // follow redirects here: this request must stay on the authenticated API.
        redirect: 'manual',
        signal: AbortSignal.timeout(120000),
      },
    );
  } catch {
    return NextResponse.json(
      { message: 'Não foi possível acessar este material agora.' },
      { status: 502 },
    );
  }

  if (!downloadResponse.ok || !downloadResponse.body) {
    const status = downloadResponse.status === 404 ? 404 :
      downloadResponse.status === 401 || downloadResponse.status === 403
        ? downloadResponse.status
        : 502;
    return NextResponse.json(
      {
        message:
          status === 401
            ? 'Entre novamente para baixar o material.'
            : status === 404
              ? 'Material não encontrado.'
              : 'Não foi possível acessar este material agora.',
      },
      { status },
    );
  }

  const headers = new Headers({
    'cache-control': 'private, no-store',
    'content-disposition': downloadResponse.headers.get('content-disposition') ?? 'attachment',
    'x-content-type-options': 'nosniff',
  });
  const contentType = downloadResponse.headers.get('content-type');
  const contentLength = downloadResponse.headers.get('content-length');
  if (contentType) headers.set('content-type', contentType);
  if (contentLength) headers.set('content-length', contentLength);

  return new Response(downloadResponse.body, {
    status: 200,
    headers,
  });
}
