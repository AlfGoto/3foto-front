import { CreatorView } from "@/components/display/CreatorView";
import { getServerSession } from "next-auth";
import { UserView } from "@/components/display/UserView";

interface DownloadPageProps {
  params: {
    id: string;
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_DISPLAY;

async function getFiles(id: string) {
  const session = await getServerSession();
  console.log(session);
  const url = `${API_URL}/displays/${id}/${
    session?.user?.image
      ?.split("/")
      [session?.user?.image?.split("/").length - 1].split("=")[0]
  }`;
  console.log(url);
  const response = await fetch(url, {
    cache: "no-store",
  });

  console.log(response.statusText);

  if (!response.ok) {
    throw new Error("Failed to fetch files");
  }
  console.log(session);

  return response.json();
}

export default async function Page({ params }: DownloadPageProps) {
  const { id } = params;
  const { isCreator, files } = await getFiles(id);

  if (isCreator) {
    return <CreatorView id={id} files={files} API_URL={API_URL!} />;
  } else {
    return <UserView id={id} files={files} API_URL={API_URL!} />;
  }
}
