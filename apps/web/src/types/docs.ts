export type PostMetadata = {
  title: string;
  description: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
};

export type Post = {
  metadata: PostMetadata;
  slug: string;
  content: string;
};
