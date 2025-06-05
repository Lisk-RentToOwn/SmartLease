"use client";

import { Progress } from "./ui/progress";
import * as React from "react";

export function ProgressDemo() {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(12.5), 500);
    return () => clearTimeout(timer);
  }, []);

  return <Progress value={progress} className="bg-gray-200" />;
}
