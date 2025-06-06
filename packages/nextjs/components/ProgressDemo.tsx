"use client";

import { Progress } from "./ui/progress";
import * as React from "react";

interface ProgressProps {
  value?: number;
}

export function ProgressDemo({ value = 13 }: ProgressProps) {
  const [progress, setProgress] = React.useState(value);

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(12.5), 500);
    return () => clearTimeout(timer);
  }, []);

  return <Progress value={progress} className="bg-gray-200" />;
}
