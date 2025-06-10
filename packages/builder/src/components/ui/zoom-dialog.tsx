import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import * as React from "react";

import { cn } from "../../lib/utils";

const ZoomDialog = DialogPrimitive.Root;

const ZoomDialogTrigger = DialogPrimitive.Trigger;

const ZoomDialogPortal = DialogPrimitive.Portal;

const ZoomDialogClose = DialogPrimitive.Close;

const ZoomDialogOverlay = ({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> & {
  ref?: React.RefObject<React.ElementRef<
    typeof DialogPrimitive.Overlay
  > | null>;
}) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
);
ZoomDialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const ZoomDialogContent = ({
  ref,
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  ref?: React.RefObject<React.ElementRef<
    typeof DialogPrimitive.Content
  > | null>;
}) => (
  <ZoomDialogPortal>
    <ZoomDialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-90 data-[state=open]:zoom-in-90 sm:rounded-lg",
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </ZoomDialogPortal>
);
ZoomDialogContent.displayName = DialogPrimitive.Content.displayName;

const ZoomDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className,
    )}
    {...props}
  />
);
ZoomDialogHeader.displayName = "ZoomDialogHeader";

const ZoomDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className,
    )}
    {...props}
  />
);
ZoomDialogFooter.displayName = "ZoomDialogFooter";

const ZoomDialogTitle = ({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> & {
  ref?: React.RefObject<React.ElementRef<typeof DialogPrimitive.Title> | null>;
}) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
);
ZoomDialogTitle.displayName = DialogPrimitive.Title.displayName;

const ZoomDialogDescription = ({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description> & {
  ref?: React.RefObject<React.ElementRef<
    typeof DialogPrimitive.Description
  > | null>;
}) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
);
ZoomDialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  ZoomDialog,
  ZoomDialogClose,
  ZoomDialogContent,
  ZoomDialogDescription,
  ZoomDialogFooter,
  ZoomDialogHeader,
  ZoomDialogOverlay,
  ZoomDialogPortal,
  ZoomDialogTitle,
  ZoomDialogTrigger,
};
