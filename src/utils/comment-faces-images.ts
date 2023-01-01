import path from 'path';
import fetch from 'node-fetch';

export interface ImagesOptions {
  user: string;
  repo: string;
  treeSha: string;
  imageFolders: string[];
}

export async function getGithubImages({ user, repo, treeSha, imageFolders }: ImagesOptions): Promise<{ [faceId: string]: string }> {
  const response = await fetch(`https://api.github.com/repos/${user}/${repo}/git/trees/${treeSha}?recursive=true`);
  const content = await response.json() as any;
  const files = content.tree
    .map((file: any) => file.path)
    .filter((filepath: any) =>
    imageFolders.some((folder) => filepath.startsWith(folder))
    );

  const commentFaces: Record<string, string> = {};

  for (let file of files) {
    const faceId = path.basename(file, path.extname(file));
    commentFaces[faceId] = `https://raw.githubusercontent.com/${user}/${repo}/${treeSha}/${file}`;
  }

  return commentFaces;
}