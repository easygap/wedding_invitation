import { Dropbox } from "dropbox";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'; // 로컬 개발 시 정적 생성 방지

// 드롭박스 클라이언트 초기화
const getClient = () => {
    const accessToken = process.env.DROPBOX_ACCESS_TOKEN;
    if (!accessToken || accessToken === "YOUR_DROPBOX_ACCESS_TOKEN_HERE") {
        console.warn("Dropbox access token is missing or invalid.");
        return null;
    }
    return new Dropbox({ accessToken, fetch: fetch });
};

// GET: 사진 목록 조회
export async function GET() {
    try {
        const dbx = getClient();
        if (!dbx) {
            // [Fix] 토큰이 없으면 에러 대신 더미(데모) 데이터 반환
            // 실제 사용 시에는 이 부분을 제거하고 토큰을 설정해야 함
            const demoPhotos = [
                { id: 'demo1', name: 'wedding_1.jpg', data: 'https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', uploadedAt: new Date().toISOString() },
                { id: 'demo2', name: 'wedding_2.jpg', data: 'https://images.unsplash.com/photo-1511285560982-1351cdeb9821?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', uploadedAt: new Date().toISOString() },
                { id: 'demo3', name: 'wedding_3.jpg', data: 'https://images.unsplash.com/photo-1520854221256-17451cc330e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', uploadedAt: new Date().toISOString() },
            ];
            return NextResponse.json(demoPhotos);
        }

        // 1. 폴더 내 파일 목록 조회
        const response = await dbx.filesListFolder({
            path: "",//"/wedding_invitation", // 앱 폴더 모드라면 "" (루트) 또는 하위 폴더
            recursive: false,
            include_media_info: false,
        });

        // 2. 이미지 파일만 필터링
        const files = response.result.entries.filter(
            (entry) => entry[".tag"] === "file" && entry.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)
        );

        // 3. 각 파일의 임시 링크 생성 (비동기 병렬 처리)
        const photosWithLinks = await Promise.all(
            files.map(async (file) => {
                const linkResponse = await dbx.filesGetTemporaryLink({ path: file.path_lower });
                return {
                    id: file.id,
                    name: file.name,
                    data: linkResponse.result.link, // 임시 다운로드 URL
                    uploadedAt: file.client_modified,
                };
            })
        );

        // 최신순 정렬
        photosWithLinks.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

        return NextResponse.json(photosWithLinks);
    } catch (error) {
        console.error("Dropbox List Error:", error);

        // 폴더가 없으면 빈 배열 반환 (첫 실행 시)
        if (error.error?.["v2_error"]?.path?.["."] === "not_found") {
            return NextResponse.json([]);
        }

        return NextResponse.json(
            { error: "Failed to fetch photos" },
            { status: 500 }
        );
    }
}

// POST: 사진 업로드
export async function POST(request) {
    try {
        const dbx = getClient();
        const formData = await request.formData();
        const file = formData.get("file");

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // 파일을 ArrayBuffer로 변환
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 파일명 중복 방지를 위한 타임스탬프 추가
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const path = `/${timestamp}_${safeName}`;

        // 드롭박스에 업로드
        const response = await dbx.filesUpload({
            path: path,
            contents: buffer,
            mode: { ".tag": "add" }, // 중복 시 이름 변경 or 에러 (add는 이름 변경 X, overwrite는 덮어쓰기)
            autorename: true,        // 중복 시 자동 이름 변경
        });

        // 업로드된 파일의 임시 링크 생성 (바로 보여주기 위해)
        const linkResponse = await dbx.filesGetTemporaryLink({ path: response.result.path_lower });

        return NextResponse.json({
            id: response.result.id,
            name: response.result.name,
            data: linkResponse.result.link,
            uploadedAt: response.result.client_modified,
        });
    } catch (error) {
        console.error("Dropbox Upload Error:", error);
        return NextResponse.json(
            { error: "Failed to upload photo" },
            { status: 500 }
        );
    }
}
