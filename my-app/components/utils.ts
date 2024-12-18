export const isTextFile = (file: File) => {
  return (
    file.type.startsWith("text/") ||
    file.name.endsWith(".txt") ||
    file.name.endsWith(".md") ||
    file.name.endsWith(".json") ||
    file.name.endsWith(".csv") ||
    file.name.endsWith(".xml") ||
    file.name.endsWith(".yml") ||
    file.name.endsWith(".yaml")
  );
};

export const formatSize = (bytes: number) => {
  if (bytes === 0) return "0 octets";
  const k = 1000;
  const sizes = ["octets", "Ko", "Mo", "Go"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const readTextFile = async (
  file: File,
  previewLength: number = 200
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      resolve(
        text.slice(0, previewLength) +
          (text.length > previewLength ? "..." : "")
      );
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
};
