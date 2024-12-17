import { FileDownloader } from "@/components/FileDownloader";

interface FileItem {
  id: string;
  name: string;
  type: string;
  url: string;
}

async function getFiles(id: string): Promise<FileItem[]> {
  const res = await fetch(`${process.env.API}/${id}`);
  if (!res.ok) {
    throw new Error("Failed to fetch files:" + res.statusText);
  }
  const files: FileItem[] = await res.json();
  return files;
}

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = await params;
  const files = await getFiles(id);
  return <FileDownloader initialFiles={files} />;
}
