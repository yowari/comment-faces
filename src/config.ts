export default {
  clientId: process.env.CLIENT_ID,
  token: process.env.TOKEN,
  images: {
    user: process.env.IMAGES_USER || 'r-anime',
    repo: process.env.IMAGES_REPO || 'comment-face-assets',
    treeSha: process.env.IMAGES_TREE_SHA || 'master',
    imageFolders: process.env.IMAGES_IMAGE_FOLDERS ? process.env.IMAGES_IMAGE_FOLDERS.split(':') : ['preview/active/'],
  }
};