export function ComponentSource({
  children,
}: React.ComponentProps<"div"> & {
  name: string;
  src?: string;
  title?: string;
  showLineNumbers?: boolean;
}) {
  return <>{children}</>;
}
