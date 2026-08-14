import { useEffect, useState } from "react";

/** شبیه‌سازی بارگذاری داده‌های نمونه برای نمایش Skeleton */
export function useMockLoading(delay = 700) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return isLoading;
}
