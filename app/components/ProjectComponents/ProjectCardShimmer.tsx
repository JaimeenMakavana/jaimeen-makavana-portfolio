import React from "react";

const ShimmerBlock = ({ className }: { className?: string }) => (
  <div className={`bg-neutral-100 animate-pulse rounded-md ${className}`} />
);

export const ProjectCardShimmer = ({
  className,
}: {
  className?: string;
}) => {
  return (
    <div
      className={`relative bg-white border border-neutral-200 rounded-3xl p-6 flex flex-col justify-between overflow-hidden h-full min-h-[300px] ${className}`}
    >
      {/* Top Section: Category & Title */}
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          {/* Category Badge Placeholder */}
          <ShimmerBlock className="h-6 w-24 rounded" />
          {/* Stat Placeholder (Optional) */}
          <ShimmerBlock className="h-8 w-16 rounded opacity-50" />
        </div>
        {/* Title Placeholder */}
        <div className="space-y-2">
          <ShimmerBlock className="h-8 w-3/4 rounded-lg" />
          <ShimmerBlock className="h-8 w-1/2 rounded-lg" />
        </div>
      </div>

      {/* Middle Section: Description Lines */}
      <div className="space-y-2 mt-6">
        <ShimmerBlock className="h-3 w-full" />
        <ShimmerBlock className="h-3 w-5/6" />
        <ShimmerBlock className="h-3 w-4/6" />
      </div>

      {/* Bottom Section: Complexity & Stack */}
      <div className="mt-8 space-y-4">
        {/* Complexity Meter Placeholder */}
        <div className="space-y-1">
          <div className="flex justify-between">
            <ShimmerBlock className="h-2 w-16" />
            <ShimmerBlock className="h-2 w-8" />
          </div>
          <ShimmerBlock className="h-1 w-full rounded-full" />
        </div>
        {/* Tech Stack Badges */}
        <div className="flex gap-2">
          <ShimmerBlock className="h-6 w-16 rounded-md" />
          <ShimmerBlock className="h-6 w-20 rounded-md" />
          <ShimmerBlock className="h-6 w-12 rounded-md" />
        </div>
      </div>
    </div>
  );
};

// Usage Example for your Grid:
export const ProjectGridSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 auto-rows-[minmax(300px,auto)] gap-4 md:gap-6">
      {/* Simulating the Bento Grid Layout */}
      <ProjectCardShimmer className="md:col-span-2 md:row-span-2" />{" "}
      {/* Large */}
      <ProjectCardShimmer className="md:col-span-1 md:row-span-1" />{" "}
      {/* Small */}
      <ProjectCardShimmer className="md:col-span-1 md:row-span-2" />{" "}
      {/* Tall */}
      <ProjectCardShimmer className="md:col-span-1 md:row-span-1" />{" "}
      {/* Small */}
      <ProjectCardShimmer className="md:col-span-2 md:row-span-1" />{" "}
      {/* Medium */}
    </div>
  );
};

